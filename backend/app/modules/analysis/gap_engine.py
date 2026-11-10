"""
SSIP Department Benchmark Gap Analysis Engine
SKILL_ANALYSIS_ENGINE.md §11, ANALYTICS_SPECIFICATION.md §8, ADR-008
Compares observed cohort competency metrics against approved curriculum benchmark targets.
"""
from collections import defaultdict
from typing import Any, Dict, List, Optional
from app.schemas.analysis import (
    SkillGapItem,
    DepartmentGapReport,
    DepartmentSkillAnalytics,
    StudentSkillHave,
    StudentSkillGapItem,
    StudentStudyItem,
    StudentEvaluationSummary,
)
from app.storage.persistent.models.taxonomy import DepartmentSkillMapping
from app.modules.recommendations.roadmap_catalog import resolve_roadmap_for_skill


class SkillGapEngine:
    """
    Evaluates observed cohort skill coverage and proficiency against institutionally approved curriculum benchmarks.
    ADR-008: Benchmarks tagged as 'DRAFT' require explicit approval before influencing strict institutional gap scores.
    """

    @classmethod
    def evaluate_department_gaps(
        cls,
        session_id: str,
        department_id: str,
        department_code: str,
        department_name: str,
        benchmarks: List[DepartmentSkillMapping],
        department_analytics: DepartmentSkillAnalytics,
        include_draft: bool = False, # ADR-008: Default False (strict approved-only)
    ) -> DepartmentGapReport:
        """
        Calculates proficiency gaps, coverage deficits, and weighted gap scores for a department.
        """
        # Map observed skills by skill_id and skill_name for quick lookup
        observed_skills: Dict[str, Any] = {}
        for item in department_analytics.skills:
            observed_skills[str(item.skill_id)] = item
            observed_skills[item.skill_name.lower().strip()] = item

        gaps: List[SkillGapItem] = []
        approved_count = 0
        draft_count = 0
        critical_count = 0
        moderate_count = 0
        satisfied_count = 0

        for bm in benchmarks:
            is_approved = bm.status.upper() == "APPROVED"
            if is_approved:
                approved_count += 1
            else:
                draft_count += 1

            # ADR-008: If include_draft is False, skip unapproved benchmarks
            if not include_draft and not is_approved:
                continue

            sk_id = str(bm.skill_id)
            sk_name = bm.skill.skill_name if bm.skill else f"Skill {sk_id[:8]}"
            sk_code = bm.skill.skill_code if bm.skill else f"SKILL-{sk_id[:6]}"

            # Find matching observed skill
            observed = observed_skills.get(sk_id) or observed_skills.get(sk_name.lower().strip())

            target_prof = float(bm.target_proficiency)
            target_cov = float(bm.minimum_coverage)
            p_weight = float(bm.priority_weight)

            if observed:
                actual_prof = observed.average_numeric_proficiency
                actual_cov = observed.coverage_percentage
            else:
                # Missing core competency entirely from student submissions
                actual_prof = 0.0
                actual_cov = 0.0

            prof_gap = round(max(0.0, target_prof - actual_prof), 2)
            cov_gap = round(max(0.0, target_cov - actual_cov), 2)
            gap_score = round(prof_gap * p_weight, 2)

            # Severity classification
            if prof_gap == 0.0 and cov_gap == 0.0:
                severity = "SATISFIED"
                satisfied_count += 1
            elif gap_score >= 1.5 or (cov_gap >= 30.0 and bm.relevance_type.upper() == "CORE"):
                severity = "CRITICAL"
                critical_count += 1
            elif gap_score >= 0.7 or cov_gap >= 15.0:
                severity = "MODERATE"
                moderate_count += 1
            else:
                severity = "MINOR"

            gaps.append(
                SkillGapItem(
                    mapping_id=str(bm.mapping_id),
                    skill_id=sk_id,
                    skill_code=sk_code,
                    skill_name=sk_name,
                    department_id=department_id,
                    department_code=department_code,
                    relevance_type=bm.relevance_type,
                    target_proficiency=target_prof,
                    actual_average_proficiency=actual_prof,
                    proficiency_gap=prof_gap,
                    target_coverage=target_cov,
                    actual_coverage=actual_cov,
                    coverage_gap=cov_gap,
                    priority_weight=p_weight,
                    gap_score=gap_score,
                    gap_severity=severity,
                    benchmark_status=bm.status,
                )
            )

        # Sort gaps by gap_score descending (most critical needs first)
        gaps.sort(key=lambda g: (g.gap_score, g.coverage_gap), reverse=True)

        return DepartmentGapReport(
            session_id=session_id,
            department_id=department_id,
            department_code=department_code,
            department_name=department_name,
            section=department_analytics.section,
            available_sections=department_analytics.available_sections,
            benchmarks_evaluated=len(gaps),
            approved_benchmarks_count=approved_count,
            draft_benchmarks_count=draft_count,
            critical_gaps_count=critical_count,
            moderate_gaps_count=moderate_count,
            satisfied_count=satisfied_count,
            gaps=gaps,
        )

    @classmethod
    def evaluate_students(
        cls,
        department_code: str,
        records: List[Dict[str, Any]],
        benchmarks: List[DepartmentSkillMapping],
        include_draft: bool = True,
        section: Optional[str] = None,
    ) -> List[StudentEvaluationSummary]:
        """
        Evaluates each ephemeral student record in the section/department:
        - What skills they currently have
        - Skill gaps against curriculum benchmarks (MISSING or BELOW_TARGET)
        - Personalized 'what they need to study' recommendations
        """
        active_benchmarks = [
            bm for bm in benchmarks
            if include_draft or bm.status.upper() == "APPROVED"
        ]

        # Filter records for department and optional section
        dept_records = [
            r for r in records
            if str(r.get("department_code", "")).upper() == department_code.upper()
        ]
        if section and section.strip() and section.strip().upper() != "ALL":
            target_sec = section.strip().lower()
            dept_records = [
                r for r in dept_records
                if str(r.get("section") or "General").strip().lower() == target_sec
            ]

        # Group by student pseudonym
        by_student: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for rec in dept_records:
            ref = rec.get("session_student_ref")
            if ref:
                by_student[ref].append(rec)

        evaluations: List[StudentEvaluationSummary] = []
        tier_label = {1.0: "Beginner", 2.0: "Intermediate", 3.0: "Expert"}

        for student_ref, stu_recs in by_student.items():
            stu_section = str(stu_recs[0].get("section") or "General")

            skills_have: List[StudentSkillHave] = []
            possessed_by_skill_id: Dict[str, Dict[str, Any]] = {}
            possessed_by_name: Dict[str, Dict[str, Any]] = {}

            for r in stu_recs:
                sk_id = str(r.get("skill_id", ""))
                sk_name = str(r.get("skill_name", "Unknown"))
                num_prof = float(r.get("numeric_proficiency", 1.0))
                possessed_by_skill_id[sk_id] = r
                possessed_by_name[sk_name.lower().strip()] = r
                skills_have.append(
                    StudentSkillHave(
                        skill_id=sk_id,
                        skill_name=sk_name,
                        proficiency_level=str(r.get("proficiency_level", "BEGINNER")),
                        numeric_proficiency=num_prof,
                        raw_score=r.get("raw_score"),
                    )
                )

            skills_have.sort(key=lambda s: s.numeric_proficiency, reverse=True)
            avg_prof = round(
                sum(s.numeric_proficiency for s in skills_have) / len(skills_have), 2
            ) if skills_have else 0.0

            skill_gaps: List[StudentSkillGapItem] = []
            what_to_study: List[StudentStudyItem] = []

            for bm in active_benchmarks:
                sk_id = str(bm.skill_id)
                sk_name = bm.skill.skill_name if bm.skill else f"Skill {sk_id[:6]}"
                target = float(bm.target_proficiency)
                is_core = bm.relevance_type.upper() == "CORE"

                matched = possessed_by_skill_id.get(sk_id) or possessed_by_name.get(sk_name.lower().strip())
                current = float(matched.get("numeric_proficiency", 0.0)) if matched else 0.0
                gap_delta = round(max(0.0, target - current), 2)

                if not matched:
                    status_label = "MISSING"
                    skill_gaps.append(
                        StudentSkillGapItem(
                            skill_name=sk_name,
                            relevance_type=bm.relevance_type,
                            target_proficiency=target,
                            current_proficiency=0.0,
                            gap_delta=gap_delta,
                            status=status_label,
                        )
                    )
                    target_tier = tier_label.get(round(target), f"Level {target:.1f}")
                    rm = resolve_roadmap_for_skill(sk_name, current_proficiency=0.0, target_proficiency=target)
                    what_to_study.append(
                        StudentStudyItem(
                            skill_name=sk_name,
                            action_type="CORE_FOUNDATION" if is_core else "ELECTIVE_FOUNDATION",
                            priority="CRITICAL" if is_core else "MEDIUM",
                            study_focus=f"Start foundational coursework & practice labs in {sk_name} (Target: {target_tier}).",
                            roadmap_slug=rm["slug"],
                            roadmap_url=rm["roadmap_url"],
                            roadmap_topics=rm["milestones"][:4],
                        )
                    )
                elif gap_delta > 0:
                    status_label = "BELOW_TARGET"
                    skill_gaps.append(
                        StudentSkillGapItem(
                            skill_name=sk_name,
                            relevance_type=bm.relevance_type,
                            target_proficiency=target,
                            current_proficiency=current,
                            gap_delta=gap_delta,
                            status=status_label,
                        )
                    )
                    curr_tier = tier_label.get(round(current), f"Level {current:.1f}")
                    target_tier = tier_label.get(round(target), f"Level {target:.1f}")
                    rm = resolve_roadmap_for_skill(sk_name, current_proficiency=current, target_proficiency=target)
                    what_to_study.append(
                        StudentStudyItem(
                            skill_name=sk_name,
                            action_type="UPGRADE_PROFICIENCY",
                            priority="HIGH" if is_core else "MEDIUM",
                            study_focus=f"Upgrade {sk_name} from {curr_tier} to {target_tier} via guided exercises and mini-projects.",
                            roadmap_slug=rm["slug"],
                            roadmap_url=rm["roadmap_url"],
                            roadmap_topics=rm["milestones"][:4],
                        )
                    )
                else:
                    skill_gaps.append(
                        StudentSkillGapItem(
                            skill_name=sk_name,
                            relevance_type=bm.relevance_type,
                            target_proficiency=target,
                            current_proficiency=current,
                            gap_delta=0.0,
                            status="MEETS_TARGET",
                        )
                    )

            # Sort study items: CRITICAL -> HIGH -> MEDIUM
            prio_rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
            what_to_study.sort(key=lambda i: prio_rank.get(i.priority, 9))

            missing_core = any(g.status == "MISSING" and g.relevance_type.upper() == "CORE" for g in skill_gaps)
            if missing_core or sum(1 for s in what_to_study if s.priority in ("CRITICAL", "HIGH")) >= 2:
                readiness = "NEEDS_CORE_STUDY"
            elif what_to_study:
                readiness = "DEVELOPING"
            else:
                readiness = "BENCHMARK_READY"
                what_to_study.append(
                    StudentStudyItem(
                        skill_name="All Benchmarked Skills",
                        action_type="ADVANCED_CERTIFICATION",
                        priority="LOW",
                        study_focus="All department benchmarks satisfied. Recommended for industry certification tracks & peer mentoring.",
                        roadmap_slug="best-practices",
                        roadmap_url="https://roadmap.sh/best-practices",
                        roadmap_topics=["System Design", "Clean Architecture", "API Security Best Practices"],
                    )
                )

            evaluations.append(
                StudentEvaluationSummary(
                    session_student_ref=student_ref,
                    section=stu_section,
                    department_code=department_code,
                    average_proficiency=avg_prof,
                    readiness_status=readiness,
                    skills_have=skills_have,
                    skill_gaps=[g for g in skill_gaps if g.status != "MEETS_TARGET"],
                    what_to_study=what_to_study,
                )
            )

        # Sort students: NEEDS_CORE_STUDY first, then section, then ref
        readiness_order = {"NEEDS_CORE_STUDY": 0, "DEVELOPING": 1, "BENCHMARK_READY": 2}
        evaluations.sort(key=lambda e: (readiness_order.get(e.readiness_status, 9), e.section, e.session_student_ref))
        return evaluations

