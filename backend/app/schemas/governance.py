"""
SSIP Ephemeral Governance Proposal Schemas
APPLICATION_MODULES.md §7.3, API_DOCUMENTATION.md §18, ADR-002
"""
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ProposalStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"
    DEFERRED = "DEFERRED"


class InitiativeCategory(str, Enum):
    BOOTCAMP = "BOOTCAMP"
    WORKSHOP = "WORKSHOP"
    CERTIFICATION_PREP = "CERTIFICATION_PREP"
    PRACTICAL_LAB = "PRACTICAL_LAB"


class ProposalCreateRequest(BaseModel):
    session_id: str = Field(..., description="Active assessment session ID")
    department_id: str = Field(..., description="Target department identifier")
    proposal_title: str = Field(..., min_length=3, max_length=200)
    initiative_category: InitiativeCategory = Field(default=InitiativeCategory.WORKSHOP)
    target_cohort: str = Field(default="Department Cohort", max_length=150)
    learning_outcomes: List[str] = Field(default_factory=list, description="Target competencies and outcomes")
    justification: str = Field(..., min_length=10, description="Explainable rationale referencing gap metrics")
    proposed_duration_weeks: int = Field(default=2, ge=1, le=16)
    estimated_cost: float = Field(default=0.0, ge=0.0)
    recommendation_id: Optional[str] = Field(default=None, description="Optional link to algorithmic recommendation")


class ProposalUpdateRequest(BaseModel):
    proposal_title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    initiative_category: Optional[InitiativeCategory] = None
    target_cohort: Optional[str] = None
    learning_outcomes: Optional[List[str]] = None
    justification: Optional[str] = Field(default=None, min_length=10)
    proposed_duration_weeks: Optional[int] = Field(default=None, ge=1, le=16)
    estimated_cost: Optional[float] = Field(default=None, ge=0.0)


class ProposalDecisionRequest(BaseModel):
    decision: ProposalStatus = Field(
        ...,
        description="Dean decision outcome: APPROVED, REJECTED, CHANGES_REQUESTED, or DEFERRED"
    )
    remarks: Optional[str] = Field(default=None, description="Dean review remarks or modification guidance")


class ProposalResponse(BaseModel):
    proposal_id: str
    session_id: str
    department_id: str
    department_code: str
    department_name: str
    proposal_title: str
    initiative_category: str
    target_cohort: str
    learning_outcomes: List[str]
    justification: str
    proposed_duration_weeks: int
    estimated_cost: float
    recommendation_id: Optional[str] = None
    status: ProposalStatus
    submitted_by: Optional[str] = None
    submitted_at: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    decision_remarks: Optional[str] = None
    created_at: str
    updated_at: str

