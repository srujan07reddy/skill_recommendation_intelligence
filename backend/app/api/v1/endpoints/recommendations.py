"""
SSIP Explainable Recommendation Endpoints
API_DOCUMENTATION.md §17, RECOMMENDATION_ENGINE.md §4, §5, §6, §8
"""
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException
from app.core.permissions import require_roles
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import Department
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationSummaryResponse,
    RecommendationGenerateRequest,
)
from app.modules.analysis.analysis_engine import SkillAnalysisEngine
from app.modules.analysis.gap_engine import SkillGapEngine
from app.modules.analysis.benchmark_service import BenchmarkService
from app.modules.recommendations.recommendation_engine import RecommendationEngine
from app.api.v1.endpoints.analysis import _load_taxonomy_details

router = APIRouter(prefix="/recommendations", tags=["Institutional Recommendations"])


@router.get("/{session_id}/events", response_model=RecommendationSummaryResponse)
async def get_institutional_events(
    session_id: str,
    include_draft: bool = Query(False, description="ADR-008: Include candidate DRAFT benchmarks"),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty", "IQAC"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve university-wide event recommendations (Bootcamps, Workshops, Certification Tracks)
    derived from evaluated cohort gaps.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    records = await session_store.get_assessment_records(session_id)
    taxonomy_details = await _load_taxonomy_details(db)

    # Fetch active departments
    dept_res = await db.execute(select(Department).where(Department.is_active == True))
    departments = dept_res.scalars().all()

    all_recommendations: List[RecommendationResponse] = []

    for dept in departments:
        dept_analytics = SkillAnalysisEngine.analyze_department_skills(
            session_id=session_id,
            department_id=str(dept.department_id),
            department_code=dept.department_code,
            department_name=dept.department_name,
            records=records,
            total_eligible_students=250,
            taxonomy_details=taxonomy_details,
        )

        benchmarks = await BenchmarkService.list_benchmarks(db, department_id=str(dept.department_id))
        gap_report = SkillGapEngine.evaluate_department_gaps(
            session_id=session_id,
            department_id=str(dept.department_id),
            department_code=dept.department_code,
            department_name=dept.department_name,
            benchmarks=benchmarks,
            department_analytics=dept_analytics,
            include_draft=include_draft,
        )

        dept_recs = RecommendationEngine.generate_for_department(session_id, gap_report)
        all_recommendations.extend(dept_recs)

    # Sort university-wide: CRITICAL -> HIGH -> MEDIUM -> LOW
    priority_rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    all_recommendations.sort(
        key=lambda r: (
            priority_rank.get(r.priority.upper(), 99),
            -r.supporting_metrics.get("gap_score", 0.0),
        )
    )

    return RecommendationEngine.summarize_recommendations(
        session_id=session_id,
        recommendations=all_recommendations,
    )


@router.get("/{session_id}/departments/{department_id}", response_model=RecommendationSummaryResponse)
async def get_department_recommendations(
    session_id: str,
    department_id: str,
    include_draft: bool = Query(False, description="ADR-008: Include candidate DRAFT benchmarks"),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve explainable development recommendations scoped to a specific department.
    Enforces HOD department authorization guards.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    # Resolve department
    dept = None
    try:
        d_uuid = uuid.UUID(department_id)
        res = await db.execute(select(Department).where(Department.department_id == d_uuid))
        dept = res.scalar_one_or_none()
    except (ValueError, TypeError):
        res = await db.execute(select(Department).where(Department.department_code == department_id))
        dept = res.scalar_one_or_none()

    if not dept:
        raise NotFoundException(f"Department '{department_id}' not found.")

    # RBAC department scope check for HOD
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")
    if "hod" in user_roles and "dean" not in user_roles and "administrator" not in user_roles:
        if not user_dept_id or str(user_dept_id) != str(dept.department_id):
            raise ForbiddenException("Access denied. HOD role is restricted to assigned department.")

    records = await session_store.get_assessment_records(session_id)
    taxonomy_details = await _load_taxonomy_details(db)

    dept_analytics = SkillAnalysisEngine.analyze_department_skills(
        session_id=session_id,
        department_id=str(dept.department_id),
        department_code=dept.department_code,
        department_name=dept.department_name,
        records=records,
        total_eligible_students=250,
        taxonomy_details=taxonomy_details,
    )

    benchmarks = await BenchmarkService.list_benchmarks(db, department_id=str(dept.department_id))
    gap_report = SkillGapEngine.evaluate_department_gaps(
        session_id=session_id,
        department_id=str(dept.department_id),
        department_code=dept.department_code,
        department_name=dept.department_name,
        benchmarks=benchmarks,
        department_analytics=dept_analytics,
        include_draft=include_draft,
    )

    dept_recs = RecommendationEngine.generate_for_department(session_id, gap_report)

    return RecommendationEngine.summarize_recommendations(
        session_id=session_id,
        recommendations=dept_recs,
        department_id=str(dept.department_id),
        department_code=dept.department_code,
    )


@router.post("/{session_id}/generate", response_model=RecommendationSummaryResponse)
async def generate_recommendations(
    session_id: str,
    payload: RecommendationGenerateRequest,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Explicit endpoint to trigger recommendation generation for a session.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    dept_filter = payload.target_department_id
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")

    if "hod" in user_roles and "dean" not in user_roles and "administrator" not in user_roles:
        dept_filter = str(user_dept_id)

    if dept_filter:
        return await get_department_recommendations(
            session_id=session_id,
            department_id=dept_filter,
            include_draft=payload.include_draft_benchmarks,
            current_token=current_token,
            session_store=session_store,
            db=db,
        )

    return await get_institutional_events(
        session_id=session_id,
        include_draft=payload.include_draft_benchmarks,
        current_token=current_token,
        session_store=session_store,
        db=db,
    )

