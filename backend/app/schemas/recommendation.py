"""
SSIP Explainable Recommendation Schemas
API_DOCUMENTATION.md §17, RECOMMENDATION_ENGINE.md §5, §6, §8
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RecommendationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    recommendation_id: str
    session_id: str
    department_id: str
    department_code: str
    department_name: str
    skill_id: str
    skill_code: str
    skill_name: str
    initiative_category: str # BOOTCAMP, WORKSHOP, PRACTICAL_LAB, CERTIFICATION_PREP, ADVANCED_TRAINING, INTERDISCIPLINARY_PROGRAM
    recommendation_title: str
    recommendation_description: str
    justification: str # Explainable rationale referencing analytical gap metrics
    priority: str # CRITICAL, HIGH, MEDIUM, LOW
    need_type: str
    target_cohort: str
    suggested_duration: str
    learning_objectives: List[str]
    supporting_metrics: Dict[str, Any]
    roadmap_sh: Optional[Dict[str, Any]] = None
    rule_id: str
    rule_version: str = "1.0"
    status: str = "GENERATED"


class RecommendationSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    department_id: Optional[str] = None
    department_code: Optional[str] = None
    total_recommendations: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    category_breakdown: Dict[str, int]
    recommendations: List[RecommendationResponse]


class RecommendationGenerateRequest(BaseModel):
    include_draft_benchmarks: bool = False
    target_department_id: Optional[str] = None

