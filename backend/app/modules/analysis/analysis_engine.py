"""
SSIP Cohort Aggregation Engine
SKILL_ANALYSIS_ENGINE.md §7, §8, §9, ANALYTICS_SPECIFICATION.md §6, §7, §8, PROFICIENCY_FRAMEWORK.md §3, ADR-007
Calculates skill frequency, coverage percentages, 3-tier proficiency distributions, and department statistics.
"""
from collections import defaultdict
from typing import Any, Dict, List, Optional, Set, Tuple
from app.schemas.analysis import (
    SkillProficiencyDistribution,
    SkillDistributionItem,
    DepartmentSkillAnalytics,
    InstitutionalSkillAnalytics,
)


class SkillAnalysisEngine:
    """
    Core statistical aggregation engine operating on ephemeral assessment records.
    Ensures explainable, reproducible calculations with strict denominator controls.
    """

    @staticmethod
    def compute_proficiency_distribution(
        skill_records: List[Dict[str, Any]]
    ) -> Tuple[SkillProficiencyDistribution, float]:
        """
        Calculates 3-tier proficiency split and weighted average numeric score.
        ADR-007: BEGINNER (1.0), INTERMEDIATE (2.0), EXPERT (3.0).
        """
        beg_cnt = 0
        inter_cnt = 0
        exp_cnt = 0

        for r in skill_records:
            prof = (r.get("proficiency_level") or "").upper()
            if prof == "BEGINNER":
                beg_cnt += 1
            elif prof == "INTERMEDIATE":
                inter_cnt += 1
            elif prof == "EXPERT":
                exp_cnt += 1

        total_classified = beg_cnt + inter_cnt + exp_cnt
        if total_classified == 0:
            return (
                SkillProficiencyDistribution(
                    beginner_count=0,
                    beginner_percentage=0.0,
                    intermediate_count=0,
                    intermediate_percentage=0.0,
                    expert_count=0,
                    expert_percentage=0.0,
                    total_classified=0,
                ),
                0.0,
            )

        beg_pct = round((beg_cnt / total_classified) * 100.0, 2)
        inter_pct = round((inter_cnt / total_classified) * 100.0, 2)
        exp_pct = round((exp_cnt / total_classified) * 100.0, 2)

        # Average numeric score: (1.0*beg + 2.0*inter + 3.0*exp) / total
        weighted_sum = (1.0 * beg_cnt) + (2.0 * inter_cnt) + (3.0 * exp_cnt)
        avg_score = round(weighted_sum / total_classified, 2)

        return (
            SkillProficiencyDistribution(
                beginner_count=beg_cnt,
                beginner_percentage=beg_pct,
                intermediate_count=inter_cnt,
                intermediate_percentage=inter_pct,
                expert_count=exp_cnt,
                expert_percentage=exp_pct,
                total_classified=total_classified,
            ),
            avg_score,
        )

    @classmethod
    def analyze_department_skills(
        cls,
        session_id: str,
        department_id: str,
        department_code: str,
        department_name: str,
        records: List[Dict[str, Any]],
        total_eligible_students: int = 250, # Standard cohort benchmark
        taxonomy_details: Optional[Dict[str, Dict[str, str]]] = None,
        section: Optional[str] = None,
    ) -> DepartmentSkillAnalytics:
        """
        Analyzes skill presence, coverage, and proficiency for a single academic department,
        optionally filtered to a specific student Section.
        """
        taxonomy_lookup = taxonomy_details or {}

        # Filter records for this department (matching either code or id)
        dept_records = [
            r for r in records
            if r.get("department_code") == department_code
            or r.get("department_id") == department_id
        ]

        available_sections = sorted({
            str(r.get("section")).strip()
            for r in dept_records
            if r.get("section") and str(r.get("section")).strip()
        })

        active_section: Optional[str] = None
        if section and section.strip() and section.strip().upper() != "ALL":
            active_section = section.strip()
            dept_records = [
                r for r in dept_records
                if str(r.get("section") or "General").strip().lower() == active_section.lower()
            ]

        # Distinct participating students in this department
        participating_students_set: Set[str] = {
            r["session_student_ref"]
            for r in dept_records
            if r.get("session_student_ref")
        }
        participating_count = len(participating_students_set)

        # Participation rate against eligible population
        participation_rate = (
            round((participating_count / total_eligible_students) * 100.0, 2)
            if total_eligible_students > 0
            else 0.0
        )

        # Group records by skill_id / skill_name
        skills_grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for r in dept_records:
            sk_key = str(r.get("skill_id") or r.get("skill_name"))
            skills_grouped[sk_key].append(r)

        skill_items: List[SkillDistributionItem] = []
        for sk_key, sk_recs in skills_grouped.items():
            first_rec = sk_recs[0]
            skill_id = str(first_rec.get("skill_id", sk_key))
            skill_name = first_rec.get("skill_name", sk_key)

            meta = taxonomy_lookup.get(skill_id, {})
            skill_code = meta.get("skill_code", first_rec.get("skill_code", f"SKILL-{skill_name[:6].upper()}"))
            category_name = meta.get("category_name", first_rec.get("category_name", "General"))
            domain_name = meta.get("domain_name", first_rec.get("domain_name", "General"))

            # Distinct students for this skill
            skill_students_set: Set[str] = {
                r["session_student_ref"]
                for r in sk_recs
                if r.get("session_student_ref")
            }
            student_count = len(skill_students_set)

            # Coverage % = (distinct students having skill / participating students in dept) * 100
            coverage_pct = (
                round((student_count / participating_count) * 100.0, 2)
                if participating_count > 0
                else 0.0
            )

            # Proficiency distribution
            prof_dist, avg_proficiency = cls.compute_proficiency_distribution(sk_recs)

            skill_items.append(
                SkillDistributionItem(
                    skill_id=skill_id,
                    skill_code=skill_code,
                    skill_name=skill_name,
                    category_name=category_name,
                    domain_name=domain_name,
                    student_count=student_count,
                    coverage_percentage=coverage_pct,
                    average_numeric_proficiency=avg_proficiency,
                    proficiency_distribution=prof_dist,
                )
            )

        # Sort skills by student count descending
        skill_items.sort(key=lambda s: s.student_count, reverse=True)

        return DepartmentSkillAnalytics(
            session_id=session_id,
            department_id=department_id,
            department_code=department_code,
            department_name=department_name,
            section=active_section,
            available_sections=available_sections,
            total_eligible_students=total_eligible_students,
            participating_students=participating_count,
            participation_rate=participation_rate,
            skills_count=len(skill_items),
            skills=skill_items,
        )

    @classmethod
    def analyze_institutional_skills(
        cls,
        session_id: str,
        session_name: str,
        academic_year: str,
        records: List[Dict[str, Any]],
        departments: List[Dict[str, Any]],
        taxonomy_details: Optional[Dict[str, Dict[str, str]]] = None,
    ) -> InstitutionalSkillAnalytics:
        """
        Cross-department institutional aggregation across all schools.
        """
        taxonomy_lookup = taxonomy_details or {}

        # Total distinct participating students across university
        distinct_students: Set[str] = {
            r["session_student_ref"]
            for r in records
            if r.get("session_student_ref")
        }
        total_participating = len(distinct_students)

        # Department breakdown summaries
        dept_summaries: List[Dict[str, Any]] = []
        for d in departments:
            d_code = d.get("department_code")
            d_id = str(d.get("department_id", d_code))
            d_name = d.get("department_name", d_code)

            d_records = [
                r for r in records
                if r.get("department_code") == d_code or r.get("department_id") == d_id
            ]
            d_students = len({r["session_student_ref"] for r in d_records if r.get("session_student_ref")})
            d_distinct_skills = len({str(r.get("skill_id") or r.get("skill_name")) for r in d_records})

            # Calculate dept avg proficiency
            _, d_avg_prof = cls.compute_proficiency_distribution(d_records)

            dept_summaries.append({
                "department_id": d_id,
                "department_code": d_code,
                "department_name": d_name,
                "participating_students": d_students,
                "distinct_skills_count": d_distinct_skills,
                "total_records": len(d_records),
                "average_proficiency": d_avg_prof,
            })

        # Institutional skill ranking across all departments
        skills_grouped: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for r in records:
            sk_key = str(r.get("skill_id") or r.get("skill_name"))
            skills_grouped[sk_key].append(r)

        top_skills: List[SkillDistributionItem] = []
        for sk_key, sk_recs in skills_grouped.items():
            first_rec = sk_recs[0]
            skill_id = str(first_rec.get("skill_id", sk_key))
            skill_name = first_rec.get("skill_name", sk_key)

            meta = taxonomy_lookup.get(skill_id, {})
            skill_code = meta.get("skill_code", first_rec.get("skill_code", f"SKILL-{skill_name[:6].upper()}"))
            category_name = meta.get("category_name", first_rec.get("category_name", "General"))
            domain_name = meta.get("domain_name", first_rec.get("domain_name", "General"))

            # Distinct students institution-wide for this skill
            skill_students = len({
                r["session_student_ref"]
                for r in sk_recs
                if r.get("session_student_ref")
            })

            coverage_pct = (
                round((skill_students / total_participating) * 100.0, 2)
                if total_participating > 0
                else 0.0
            )

            prof_dist, avg_proficiency = cls.compute_proficiency_distribution(sk_recs)

            top_skills.append(
                SkillDistributionItem(
                    skill_id=skill_id,
                    skill_code=skill_code,
                    skill_name=skill_name,
                    category_name=category_name,
                    domain_name=domain_name,
                    student_count=skill_students,
                    coverage_percentage=coverage_pct,
                    average_numeric_proficiency=avg_proficiency,
                    proficiency_distribution=prof_dist,
                )
            )

        top_skills.sort(key=lambda s: s.student_count, reverse=True)

        return InstitutionalSkillAnalytics(
            session_id=session_id,
            session_name=session_name,
            academic_year=academic_year,
            total_participating_students=total_participating,
            distinct_skills_evaluated=len(top_skills),
            department_summaries=dept_summaries,
            top_skills=top_skills,
        )

