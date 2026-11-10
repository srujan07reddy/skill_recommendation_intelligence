"""
SSIP Skill Analysis & Gap Analytics Schemas
API_DOCUMENTATION.md §15, §16, ANALYTICS_SPECIFICATION.md §5, §8, §11, ADR-007, ADR-008
"""
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict


class SkillProficiencyDistribution(BaseModel):
    beginner_count: int = 0
    beginner_percentage: float = 0.0
    intermediate_count: int = 0
    intermediate_percentage: float = 0.0
    expert_count: int = 0
    expert_percentage: float = 0.0
    total_classified: int = 0


class SkillDistributionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    skill_id: str
    skill_code: str
    skill_name: str
    category_name: Optional[str] = "General"
    domain_name: Optional[str] = "General"
    student_count: int
    coverage_percentage: float # Percentage of participating students having this skill
    average_numeric_proficiency: float # 1.0 (Beg) - 3.0 (Exp)
    proficiency_distribution: SkillProficiencyDistribution


class DepartmentSkillAnalytics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    department_id: str
    department_code: str
    department_name: str
    section: Optional[str] = None
    available_sections: List[str] = []
    total_eligible_students: int
    participating_students: int
    participation_rate: float
    skills_count: int
    skills: List[SkillDistributionItem]


class InstitutionalSkillAnalytics(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    session_name: str
    academic_year: str
    total_participating_students: int
    distinct_skills_evaluated: int
    department_summaries: List[Dict[str, Any]]
    top_skills: List[SkillDistributionItem]


class SkillGapItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mapping_id: Optional[str] = None
    skill_id: str
    skill_code: str
    skill_name: str
    department_id: str
    department_code: str
    relevance_type: str # Core, Recommended, Specialized, Optional
    target_proficiency: float # Target numeric (e.g. 2.0 = Intermediate)
    actual_average_proficiency: float # Observed average numeric
    proficiency_gap: float # Max(0, Target - Actual)
    target_coverage: float # Target coverage % (e.g. 70.0%)
    actual_coverage: float # Observed coverage %
    coverage_gap: float # Max(0, Target - Actual)
    priority_weight: float # 1.0 - 3.0
    gap_score: float # Proficiency Gap * Priority Weight
    gap_severity: str # CRITICAL, MODERATE, MINOR, SATISFIED
    benchmark_status: str # DRAFT or APPROVED (ADR-008)


class DepartmentGapReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    department_id: str
    department_code: str
    department_name: str
    section: Optional[str] = None
    available_sections: List[str] = []
    benchmarks_evaluated: int
    approved_benchmarks_count: int
    draft_benchmarks_count: int
    critical_gaps_count: int
    moderate_gaps_count: int
    satisfied_count: int
    gaps: List[SkillGapItem]


class InstitutionalGapReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    session_name: str
    total_benchmarks_evaluated: int
    total_critical_gaps: int
    total_moderate_gaps: int
    department_gap_summaries: List[Dict[str, Any]]
    priority_gaps: List[SkillGapItem]


class StudentSkillHave(BaseModel):
    skill_id: str
    skill_name: str
    proficiency_level: str
    numeric_proficiency: float
    raw_score: Optional[float] = None


class StudentSkillGapItem(BaseModel):
    skill_name: str
    relevance_type: str
    target_proficiency: float
    current_proficiency: float
    gap_delta: float
    status: str  # MISSING, BELOW_TARGET, MEETS_TARGET


class StudentStudyItem(BaseModel):
    skill_name: str
    action_type: str  # CORE_FOUNDATION, UPGRADE_PROFICIENCY, ADVANCED_CERTIFICATION
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW
    study_focus: str
    roadmap_slug: Optional[str] = None
    roadmap_url: Optional[str] = None
    roadmap_topics: List[str] = []


class StudentEvaluationSummary(BaseModel):
    session_student_ref: str
    section: str
    department_code: str
    average_proficiency: float
    readiness_status: str  # NEEDS_CORE_STUDY, DEVELOPING, BENCHMARK_READY
    skills_have: List[StudentSkillHave]
    skill_gaps: List[StudentSkillGapItem]
    what_to_study: List[StudentStudyItem]


class SectionEvaluationResponse(BaseModel):
    session_id: str
    department_id: str
    department_code: str
    department_name: str
    selected_section: Optional[str] = None
    available_sections: List[str] = []
    total_students: int
    total_records: int
    what_they_have: List[SkillDistributionItem]
    gap_report: DepartmentGapReport
    cohort_study_roadmap: List[Dict[str, Any]]
    student_evaluations: List[StudentEvaluationSummary]


class BenchmarkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mapping_id: str
    department_id: str
    department_code: str
    department_name: str
    skill_id: str
    skill_code: str
    skill_name: str
    relevance_type: str
    target_proficiency: float
    minimum_coverage: float
    priority_weight: float
    status: str # DRAFT, APPROVED, ARCHIVED
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    justification: Optional[str] = None


class BenchmarkApprovalRequest(BaseModel):
    justification: Optional[str] = "Institutionally approved for active curriculum gap evaluation."

