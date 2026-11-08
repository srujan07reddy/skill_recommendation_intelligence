"""
SSIP Student Web Assessment Form Schemas
API_DOCUMENTATION.md §11, VALIDATION_RULES.md §6, ADR-001, ADR-006, ADR-007
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict


class SkillAssessmentItem(BaseModel):
    skill_name: str = Field(..., description="Canonical skill name or recognized alias")
    proficiency_level: str = Field(..., description="Strict 3-tier: BEGINNER, INTERMEDIATE, EXPERT (ADR-007)")
    experience_type: Optional[List[str]] = Field(default_factory=list, description="Coursework, Project, Internship, Self-taught")
    evidence_description: Optional[str] = Field(None, max_length=500, description="Brief description of experience or project")


class StudentAssessmentSubmission(BaseModel):
    student_identifier: str = Field(..., min_length=2, max_length=60, description="Student roll number or registration ID (pseudonymized immediately via ADR-001)")
    department_code: str = Field(..., description="Department code e.g. DEPT-CSE")
    program_code: Optional[str] = Field(None, description="Degree program code e.g. PRG-SET-CSE")
    skills: List[SkillAssessmentItem] = Field(..., min_length=1, description="At least one skill must be provided")


class StudentAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    submission_id: str
    session_id: str
    session_student_ref: str # HMAC-SHA256 pseudonymized hash (ADR-001)
    recorded_skills_count: int
    submitted_at: str
    status: str = "SUBMITTED"
    message: str = "Assessment successfully recorded into active session buffer."


class TaxonomyFormResponse(BaseModel):
    session_id: str
    session_name: str
    allowed_proficiency_levels: List[str] # ["BEGINNER", "INTERMEDIATE", "EXPERT"]
    departments: List[Dict[str, Any]]
    available_skills: List[Dict[str, Any]]

