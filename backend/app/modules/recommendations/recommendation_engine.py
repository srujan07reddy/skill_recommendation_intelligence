"""
SSIP Explainable Recommendation Engine
RECOMMENDATION_ENGINE.md §4, §5, §6, §8, §9, ADR-002, ADR-008
Generates deterministic, explainable, cohort-level development recommendations from observed skill gaps.
"""
from typing import Any, Dict, List, Optional
import uuid

from app.schemas.analysis import SkillGapItem, DepartmentGapReport
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationSummaryResponse,
)


class RecommendationEngine:
    """
    Deterministic rule-based decision support engine.
    Translates observed department curriculum deficits into structured development events.
    Strictly cohort-oriented (no individual student progression tracking).
    """

    @classmethod
    def generate_recommendations_from_gap(
        cls,
        session_id: str,
        gap: SkillGapItem,
        department_name: str,
    ) -> Optional[RecommendationResponse]:
        """
        Maps a single evaluated skill gap to an explainable institutional development event.
        """
        if gap.gap_severity.upper() == "SATISFIED" or (gap.proficiency_gap <= 0 and gap.coverage_gap <= 0):
            return None

        rec_id = f"REC-{uuid.uuid4().hex[:10].upper()}"
        target_cohort = f"{department_name} ({gap.department_code}) Student Cohort"

        supporting_metrics = {
            "target_proficiency": gap.target_proficiency,
            "actual_average_proficiency": gap.actual_average_proficiency,
            "proficiency_gap": gap.proficiency_gap,
            "target_coverage": gap.target_coverage,
            "actual_coverage": gap.actual_coverage,
            "coverage_gap": gap.coverage_gap,
            "priority_weight": gap.priority_weight,
            "gap_score": gap.gap_score,
            "gap_severity": gap.gap_severity,
            "benchmark_status": gap.benchmark_status,
        }

        # Rule 1: Critical Core Competency Deficit (Large proficiency gap on Core curriculum)
        if gap.relevance_type.upper() == "CORE" and (gap.gap_score >= 1.5 or gap.proficiency_gap >= 1.0):
            return RecommendationResponse(
                recommendation_id=rec_id,
                session_id=session_id,
                department_id=gap.department_id,
                department_code=gap.department_code,
                department_name=department_name,
                skill_id=gap.skill_id,
                skill_code=gap.skill_code,
                skill_name=gap.skill_name,
                initiative_category="BOOTCAMP",
                recommendation_title=f"Intensive {gap.skill_name} Core Competency Bootcamp",
                recommendation_description=(
                    f"A structured, intensive 3-day bootcamp designed to rapidly bridge foundational "
                    f"proficiency deficits in {gap.skill_name} for the {gap.department_code} cohort."
                ),
                justification=(
                    f"The observed cohort average proficiency of {gap.actual_average_proficiency:.2f} falls "
                    f"significantly below the required Core benchmark target of {gap.target_proficiency:.1f}. "
                    f"With a priority weighting of {gap.priority_weight:.1f}x, this constitutes a critical gap score of {gap.gap_score:.2f}."
                ),
                priority="CRITICAL",
                need_type="CORE_COMPETENCY_DEFICIT",
                target_cohort=target_cohort,
                suggested_duration="3-5 Days (24-30 Contact Hours)",
                learning_objectives=[
                    f"Master foundational and intermediate application of {gap.skill_name}",
                    f"Complete 4 practical programming and problem-solving milestones in {gap.skill_name}",
                    f"Elevate cohort average proficiency toward the institutional target of {gap.target_proficiency:.1f}",
                ],
                supporting_metrics=supporting_metrics,
                rule_id="RULE-CORE-BOOTCAMP-01",
                rule_version="1.0",
                status="GENERATED",
            )

        # Rule 2: Coverage Deficit (Low student penetration against curriculum benchmark)
        if gap.coverage_gap >= 25.0:
            is_core = gap.relevance_type.upper() == "CORE"
            return RecommendationResponse(
                recommendation_id=rec_id,
                session_id=session_id,
                department_id=gap.department_id,
                department_code=gap.department_code,
                department_name=department_name,
                skill_id=gap.skill_id,
                skill_code=gap.skill_code,
                skill_name=gap.skill_name,
                initiative_category="WORKSHOP",
                recommendation_title=f"Departmental {gap.skill_name} Hands-on Workshop",
                recommendation_description=(
                    f"A practical interactive workshop aimed at expanding student adoption and exposure "
                    f"to {gap.skill_name} across the {gap.department_code} department."
                ),
                justification=(
                    f"Observed student skill coverage is {gap.actual_coverage:.1f}% against the minimum required "
                    f"departmental benchmark of {gap.target_coverage:.0f}%, resulting in a coverage deficit of {gap.coverage_gap:.1f} percentage points."
                ),
                priority="HIGH" if is_core else "MEDIUM",
                need_type="COVERAGE_DEFICIT",
                target_cohort=target_cohort,
                suggested_duration="2 Days (16 Contact Hours)",
                learning_objectives=[
                    f"Introduce core workflows, tools, and best practices in {gap.skill_name}",
                    f"Ensure at least 75% of participating students complete an introductory project",
                    f"Close the {gap.coverage_gap:.0f}% cohort coverage deficit",
                ],
                supporting_metrics=supporting_metrics,
                rule_id="RULE-COV-WORKSHOP-02",
                rule_version="1.0",
                status="GENERATED",
            )

        # Rule 3: Advanced / Specialized Competency Track
        if gap.relevance_type.upper() in ("RECOMMENDED", "SPECIALIZED") or gap.target_proficiency >= 2.5:
            return RecommendationResponse(
                recommendation_id=rec_id,
                session_id=session_id,
                department_id=gap.department_id,
                department_code=gap.department_code,
                department_name=department_name,
                skill_id=gap.skill_id,
                skill_code=gap.skill_code,
                skill_name=gap.skill_name,
                initiative_category="CERTIFICATION_PREP",
                recommendation_title=f"{gap.skill_name} Advanced Industry Certification Track",
                recommendation_description=(
                    f"A specialized guided training track preparing advanced students for professional "
                    f"accreditation and industry readiness in {gap.skill_name}."
                ),
                justification=(
                    f"The department curriculum target specifies advanced competency ({gap.target_proficiency:.1f}) "
                    f"for {gap.skill_name}. Current cohort average stands at {gap.actual_average_proficiency:.2f}."
                ),
                priority="HIGH" if gap.gap_score >= 1.0 else "MEDIUM",
                need_type="ADVANCED_SKILL_GAP",
                target_cohort=target_cohort,
                suggested_duration="4-6 Weeks (Weekend Track)",
                learning_objectives=[
                    f"Deep-dive into advanced industry architecture and patterns for {gap.skill_name}",
                    f"Prepare for aligned external professional certifications",
                    f"Complete capstone technical portfolio piece",
                ],
                supporting_metrics=supporting_metrics,
                rule_id="RULE-ADV-CERT-03",
                rule_version="1.0",
                status="GENERATED",
            )

        # Rule 4: Practical Laboratory Deficit (Default for moderate gaps)
        return RecommendationResponse(
            recommendation_id=rec_id,
            session_id=session_id,
            department_id=gap.department_id,
            department_code=gap.department_code,
            department_name=department_name,
            skill_id=gap.skill_id,
            skill_code=gap.skill_code,
            skill_name=gap.skill_name,
            initiative_category="PRACTICAL_LAB",
            recommendation_title=f"Applied {gap.skill_name} Laboratory Training",
            recommendation_description=(
                f"Hands-on guided laboratory sessions providing practical problem-solving implementation "
                f"in {gap.skill_name}."
            ),
            justification=(
                f"Department gap score of {gap.gap_score:.2f} (proficiency deficit {gap.proficiency_gap:.2f}) "
                f"indicates structured practical laboratory exercises will elevate student mastery to the {gap.target_proficiency:.1f} benchmark."
            ),
            priority="MEDIUM" if gap.gap_score >= 0.7 else "LOW",
            need_type="PRACTICAL_SKILL_GAP",
            target_cohort=target_cohort,
            suggested_duration="1-2 Days (8-12 Lab Hours)",
            learning_objectives=[
                f"Implement hands-on exercises in {gap.skill_name}",
                f"Resolve practical debugging scenarios under faculty guidance",
            ],
            supporting_metrics=supporting_metrics,
            rule_id="RULE-PRAC-LAB-04",
            rule_version="1.0",
            status="GENERATED",
        )

    @classmethod
    def generate_for_department(
        cls,
        session_id: str,
        gap_report: DepartmentGapReport,
    ) -> List[RecommendationResponse]:
        """
        Generates and ranks recommendations for a single department based on evaluated gaps.
        """
        recs: List[RecommendationResponse] = []
        for gap in gap_report.gaps:
            rec = cls.generate_recommendations_from_gap(
                session_id=session_id,
                gap=gap,
                department_name=gap_report.department_name,
            )
            if rec:
                recs.append(rec)

        # Priority ordering: CRITICAL -> HIGH -> MEDIUM -> LOW
        priority_rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        recs.sort(
            key=lambda r: (
                priority_rank.get(r.priority.upper(), 99),
                -r.supporting_metrics.get("gap_score", 0.0),
            )
        )
        return recs

    @classmethod
    def summarize_recommendations(
        cls,
        session_id: str,
        recommendations: List[RecommendationResponse],
        department_id: Optional[str] = None,
        department_code: Optional[str] = None,
    ) -> RecommendationSummaryResponse:
        """
        Summarizes recommendation distributions and categories.
        """
        crit = sum(1 for r in recommendations if r.priority.upper() == "CRITICAL")
        high = sum(1 for r in recommendations if r.priority.upper() == "HIGH")
        med = sum(1 for r in recommendations if r.priority.upper() == "MEDIUM")
        low = sum(1 for r in recommendations if r.priority.upper() == "LOW")

        cats: Dict[str, int] = {}
        for r in recommendations:
            cat = r.initiative_category
            cats[cat] = cats.get(cat, 0) + 1

        return RecommendationSummaryResponse(
            session_id=session_id,
            department_id=department_id,
            department_code=department_code,
            total_recommendations=len(recommendations),
            critical_count=crit,
            high_count=high,
            medium_count=med,
            low_count=low,
            category_breakdown=cats,
            recommendations=recommendations,
        )

