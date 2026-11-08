"""
Unit Tests for Explainable Recommendation Engine
Verifies that recommendations are deterministic, explainable, and scoped strictly
to cohorts/departments (no individual student progression per MVP scope boundary).
RECOMMENDATION_ENGINE.md §4, §5, §8, §9
"""
import pytest
from app.modules.recommendations.recommendation_engine import RecommendationEngine
from app.schemas.analysis import SkillGapItem, DepartmentGapReport


def test_critical_core_gap_generates_bootcamp():
    gap = SkillGapItem(
        skill_id="sk-py-1",
        skill_code="SKILL-PYTHON",
        skill_name="Python",
        department_id="dept-cse-1",
        department_code="DEPT-CSE",
        relevance_type="Core",
        target_proficiency=2.0,
        actual_average_proficiency=0.8,
        proficiency_gap=1.2,
        target_coverage=70.0,
        actual_coverage=20.0,
        coverage_gap=50.0,
        priority_weight=1.5,
        gap_score=1.80, # Critical
        gap_severity="CRITICAL",
        benchmark_status="APPROVED",
    )

    rec = RecommendationEngine.generate_recommendations_from_gap(
        session_id="ses-1",
        gap=gap,
        department_name="Computer Science & Engineering",
    )

    assert rec is not None
    assert rec.initiative_category == "BOOTCAMP"
    assert rec.priority == "CRITICAL"
    assert "Bootcamp" in rec.recommendation_title
    assert "Computer Science & Engineering (DEPT-CSE) Student Cohort" == rec.target_cohort
    # Explainable justification
    assert "0.80" in rec.justification or "0.8" in rec.justification
    assert "1.80" in rec.justification or "1.8" in rec.justification
    # Verify no individual student ID is referenced
    assert "student_id" not in rec.model_dump()


def test_coverage_deficit_generates_workshop():
    gap = SkillGapItem(
        skill_id="sk-sql-1",
        skill_code="SKILL-SQL",
        skill_name="SQL",
        department_id="dept-cse-1",
        department_code="DEPT-CSE",
        relevance_type="Core",
        target_proficiency=2.0,
        actual_average_proficiency=1.8,
        proficiency_gap=0.2, # Low prof gap
        target_coverage=65.0,
        actual_coverage=25.0, # High coverage gap (40%)
        coverage_gap=40.0,
        priority_weight=1.0,
        gap_score=0.2,
        gap_severity="MODERATE",
        benchmark_status="APPROVED",
    )

    rec = RecommendationEngine.generate_recommendations_from_gap(
        session_id="ses-1",
        gap=gap,
        department_name="Computer Science & Engineering",
    )

    assert rec is not None
    assert rec.initiative_category == "WORKSHOP"
    assert rec.need_type == "COVERAGE_DEFICIT"
    assert "Workshop" in rec.recommendation_title
    assert "40.0 percentage points" in rec.justification


def test_advanced_competency_generates_certification_prep():
    gap = SkillGapItem(
        skill_id="sk-dock-1",
        skill_code="SKILL-DOCKER",
        skill_name="Docker",
        department_id="dept-cse-1",
        department_code="DEPT-CSE",
        relevance_type="Recommended",
        target_proficiency=2.5, # Targeting advanced
        actual_average_proficiency=1.5,
        proficiency_gap=1.0,
        target_coverage=50.0,
        actual_coverage=35.0,
        coverage_gap=15.0,
        priority_weight=1.0,
        gap_score=1.0,
        gap_severity="MODERATE",
        benchmark_status="APPROVED",
    )

    rec = RecommendationEngine.generate_recommendations_from_gap(
        session_id="ses-1",
        gap=gap,
        department_name="Computer Science & Engineering",
    )

    assert rec is not None
    assert rec.initiative_category == "CERTIFICATION_PREP"
    assert "Certification Track" in rec.recommendation_title
    assert "4-6 Weeks" in rec.suggested_duration


def test_satisfied_gap_generates_no_recommendation():
    satisfied_gap = SkillGapItem(
        skill_id="sk-git-1",
        skill_code="SKILL-GIT",
        skill_name="Git",
        department_id="dept-cse-1",
        department_code="DEPT-CSE",
        relevance_type="Core",
        target_proficiency=2.0,
        actual_average_proficiency=2.2,
        proficiency_gap=0.0,
        target_coverage=80.0,
        actual_coverage=85.0,
        coverage_gap=0.0,
        priority_weight=1.0,
        gap_score=0.0,
        gap_severity="SATISFIED",
        benchmark_status="APPROVED",
    )

    rec = RecommendationEngine.generate_recommendations_from_gap(
        session_id="ses-1",
        gap=satisfied_gap,
        department_name="Computer Science & Engineering",
    )

    assert rec is None


def test_department_recommendation_ranking():
    # 2 gaps: 1 critical, 1 moderate
    crit_gap = SkillGapItem(
        skill_id="sk1",
        skill_code="SKILL-PYTHON",
        skill_name="Python",
        department_id="dept-1",
        department_code="DEPT-CSE",
        relevance_type="Core",
        target_proficiency=2.0,
        actual_average_proficiency=0.5,
        proficiency_gap=1.5,
        target_coverage=70.0,
        actual_coverage=20.0,
        coverage_gap=50.0,
        priority_weight=1.5,
        gap_score=2.25,
        gap_severity="CRITICAL",
        benchmark_status="APPROVED",
    )
    mod_gap = SkillGapItem(
        skill_id="sk2",
        skill_code="SKILL-SQL",
        skill_name="SQL",
        department_id="dept-1",
        department_code="DEPT-CSE",
        relevance_type="Core",
        target_proficiency=2.0,
        actual_average_proficiency=1.5,
        proficiency_gap=0.5,
        target_coverage=65.0,
        actual_coverage=45.0,
        coverage_gap=20.0,
        priority_weight=1.0,
        gap_score=0.5,
        gap_severity="MODERATE",
        benchmark_status="APPROVED",
    )

    report = DepartmentGapReport(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        benchmarks_evaluated=2,
        approved_benchmarks_count=2,
        draft_benchmarks_count=0,
        critical_gaps_count=1,
        moderate_gaps_count=1,
        satisfied_count=0,
        gaps=[mod_gap, crit_gap], # Unsorted input
    )

    recs = RecommendationEngine.generate_for_department("ses-1", report)

    # Priority rank: CRITICAL must come before MEDIUM/LOW
    assert len(recs) == 2
    assert recs[0].priority == "CRITICAL"
    assert recs[0].skill_name == "Python"
    assert recs[1].skill_name == "SQL"

