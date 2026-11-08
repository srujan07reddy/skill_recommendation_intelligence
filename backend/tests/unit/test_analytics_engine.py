"""
Unit Tests for Skill Analysis Engine & Gap Analysis Engine
Verifies mathematical correctness across edge cases: 100% beginner, 100% expert, empty cohorts,
and ADR-008 DRAFT benchmark filtering.
"""
import uuid
import pytest
from app.modules.analysis.analysis_engine import SkillAnalysisEngine
from app.modules.analysis.gap_engine import SkillGapEngine
from app.schemas.analysis import DepartmentSkillAnalytics
from app.storage.persistent.models.taxonomy import DepartmentSkillMapping, Skill


def test_proficiency_distribution_100_percent_beginner():
    records = [
        {"proficiency_level": "BEGINNER"},
        {"proficiency_level": "BEGINNER"},
        {"proficiency_level": "BEGINNER"},
    ]
    dist, avg_score = SkillAnalysisEngine.compute_proficiency_distribution(records)

    assert dist.beginner_count == 3
    assert dist.intermediate_count == 0
    assert dist.expert_count == 0
    assert dist.beginner_percentage == 100.0
    assert dist.intermediate_percentage == 0.0
    assert dist.expert_percentage == 0.0
    assert avg_score == 1.0


def test_proficiency_distribution_100_percent_expert():
    records = [
        {"proficiency_level": "EXPERT"},
        {"proficiency_level": "EXPERT"},
    ]
    dist, avg_score = SkillAnalysisEngine.compute_proficiency_distribution(records)

    assert dist.expert_count == 2
    assert dist.expert_percentage == 100.0
    assert avg_score == 3.0


def test_proficiency_distribution_mixed_cohort():
    # 2 Beginner (1.0), 2 Intermediate (2.0), 1 Expert (3.0)
    # Total = 5, Weighted sum = 2*1 + 2*2 + 1*3 = 2 + 4 + 3 = 9.0.
    # Avg = 9.0 / 5 = 1.80
    records = [
        {"proficiency_level": "BEGINNER"},
        {"proficiency_level": "BEGINNER"},
        {"proficiency_level": "INTERMEDIATE"},
        {"proficiency_level": "INTERMEDIATE"},
        {"proficiency_level": "EXPERT"},
    ]
    dist, avg_score = SkillAnalysisEngine.compute_proficiency_distribution(records)

    assert dist.beginner_count == 2
    assert dist.intermediate_count == 2
    assert dist.expert_count == 1
    assert dist.beginner_percentage == 40.0
    assert dist.intermediate_percentage == 40.0
    assert dist.expert_percentage == 20.0
    assert avg_score == 1.80


def test_proficiency_distribution_empty_cohort():
    records = []
    dist, avg_score = SkillAnalysisEngine.compute_proficiency_distribution(records)

    assert dist.total_classified == 0
    assert dist.beginner_percentage == 0.0
    assert avg_score == 0.0


def test_department_skill_aggregation_and_deduplication():
    # 3 distinct students, one student reported multiple skills
    records = [
        {"session_student_ref": "STU-001", "department_code": "DEPT-CSE", "skill_id": "sk1", "skill_name": "Python", "proficiency_level": "INTERMEDIATE"},
        {"session_student_ref": "STU-002", "department_code": "DEPT-CSE", "skill_id": "sk1", "skill_name": "Python", "proficiency_level": "EXPERT"},
        {"session_student_ref": "STU-003", "department_code": "DEPT-CSE", "skill_id": "sk2", "skill_name": "SQL", "proficiency_level": "BEGINNER"},
    ]

    result = SkillAnalysisEngine.analyze_department_skills(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        records=records,
        total_eligible_students=100
    )

    assert result.participating_students == 3
    assert result.participation_rate == 3.0 # (3 / 100) * 100
    assert result.skills_count == 2

    # Find Python
    python_skill = next(s for s in result.skills if s.skill_name == "Python")
    assert python_skill.student_count == 2
    # Coverage: 2 out of 3 participating students = 66.67%
    assert python_skill.coverage_percentage == 66.67
    # Avg score: (2.0 + 3.0) / 2 = 2.50
    assert python_skill.average_numeric_proficiency == 2.50


def test_gap_engine_approved_vs_draft_adr008():
    skill_obj = Skill(
        skill_id=uuid.uuid4(),
        skill_code="SKILL-PYTHON",
        skill_name="Python",
    )
    draft_bm = DepartmentSkillMapping(
        mapping_id=uuid.uuid4(),
        department_id=uuid.uuid4(),
        skill_id=skill_obj.skill_id,
        taxonomy_version_id=uuid.uuid4(),
        relevance_type="Core",
        target_proficiency=2.0,
        minimum_coverage=70.0,
        priority_weight=1.5,
        status="DRAFT", # ADR-008: Draft
    )
    draft_bm.skill = skill_obj

    # Department analytics with observed python at 1.5 avg prof, 50% cov
    dept_analytics = DepartmentSkillAnalytics(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        total_eligible_students=100,
        participating_students=10,
        participation_rate=10.0,
        skills_count=1,
        skills=[
            {
                "skill_id": str(skill_obj.skill_id),
                "skill_code": "SKILL-PYTHON",
                "skill_name": "Python",
                "student_count": 5,
                "coverage_percentage": 50.0,
                "average_numeric_proficiency": 1.5,
                "proficiency_distribution": {
                    "beginner_count": 2,
                    "beginner_percentage": 40.0,
                    "intermediate_count": 3,
                    "intermediate_percentage": 60.0,
                    "expert_count": 0,
                    "expert_percentage": 0.0,
                    "total_classified": 5
                }
            }
        ]
    )

    # 1. In strict mode (include_draft=False), DRAFT benchmarks are excluded
    strict_report = SkillGapEngine.evaluate_department_gaps(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        benchmarks=[draft_bm],
        department_analytics=dept_analytics,
        include_draft=False
    )
    assert strict_report.benchmarks_evaluated == 0
    assert len(strict_report.gaps) == 0

    # 2. When include_draft=True, benchmark is evaluated
    sim_report = SkillGapEngine.evaluate_department_gaps(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        benchmarks=[draft_bm],
        department_analytics=dept_analytics,
        include_draft=True
    )
    assert sim_report.benchmarks_evaluated == 1
    gap = sim_report.gaps[0]
    # Target 2.0 - Actual 1.5 = 0.5 proficiency gap
    assert gap.proficiency_gap == 0.5
    # Target 70% - Actual 50% = 20% coverage gap
    assert gap.coverage_gap == 20.0
    # Gap Score = 0.5 * 1.5 = 0.75
    assert gap.gap_score == 0.75
    assert gap.gap_severity == "MODERATE"


def test_gap_engine_critical_missing_competency():
    skill_obj = Skill(
        skill_id=uuid.uuid4(),
        skill_code="SKILL-DOCKER",
        skill_name="Docker",
    )
    approved_bm = DepartmentSkillMapping(
        mapping_id=uuid.uuid4(),
        department_id=uuid.uuid4(),
        skill_id=skill_obj.skill_id,
        taxonomy_version_id=uuid.uuid4(),
        relevance_type="Core",
        target_proficiency=2.0,
        minimum_coverage=60.0,
        priority_weight=2.0,
        status="APPROVED",
    )
    approved_bm.skill = skill_obj

    # Empty observed skills (no students reported Docker)
    empty_dept_analytics = DepartmentSkillAnalytics(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        total_eligible_students=100,
        participating_students=20,
        participation_rate=20.0,
        skills_count=0,
        skills=[]
    )

    report = SkillGapEngine.evaluate_department_gaps(
        session_id="ses-1",
        department_id="dept-1",
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        benchmarks=[approved_bm],
        department_analytics=empty_dept_analytics,
        include_draft=False
    )

    assert report.benchmarks_evaluated == 1
    gap = report.gaps[0]
    assert gap.actual_average_proficiency == 0.0
    assert gap.proficiency_gap == 2.0
    assert gap.actual_coverage == 0.0
    assert gap.coverage_gap == 60.0
    # Gap Score = 2.0 * 2.0 = 4.0
    assert gap.gap_score == 4.0
    assert gap.gap_severity == "CRITICAL"
