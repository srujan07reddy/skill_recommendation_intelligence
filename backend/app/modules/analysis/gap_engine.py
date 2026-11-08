"""
SSIP Department Benchmark Gap Analysis Engine
SKILL_ANALYSIS_ENGINE.md §11, ANALYTICS_SPECIFICATION.md §8, ADR-008
Compares observed cohort competency metrics against approved curriculum benchmark targets.
"""
from typing import Any, Dict, List, Optional
from app.schemas.analysis import (
    SkillGapItem,
    DepartmentGapReport,
    DepartmentSkillAnalytics,
)
from app.storage.persistent.models.taxonomy import DepartmentSkillMapping


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
            benchmarks_evaluated=len(gaps),
            approved_benchmarks_count=approved_count,
            draft_benchmarks_count=draft_count,
            critical_gaps_count=critical_count,
            moderate_gaps_count=moderate_count,
            satisfied_count=satisfied_count,
            gaps=gaps,
        )

