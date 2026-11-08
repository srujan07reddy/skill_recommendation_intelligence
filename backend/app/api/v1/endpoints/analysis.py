"""
SSIP Skill Analysis & Gap Analytics Endpoints
API_DOCUMENTATION.md §15, §16, ANALYTICS_SPECIFICATION.md §5-§11, ADR-007, ADR-008
"""
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException
from app.core.permissions import get_current_token_payload, require_roles
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import Department
from app.storage.persistent.models.taxonomy import Skill, SkillCategory, SkillDomain, DepartmentSkillMapping
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.schemas.analysis import (
    DepartmentSkillAnalytics,
    InstitutionalSkillAnalytics,
    DepartmentGapReport,
    InstitutionalGapReport,
)
from app.modules.analysis.analysis_engine import SkillAnalysisEngine
from app.modules.analysis.gap_engine import SkillGapEngine
from app.modules.analysis.benchmark_service import BenchmarkService

router = APIRouter(prefix="/analysis", tags=["Skill Analysis & Gaps"])


async def _load_taxonomy_details(db: AsyncSession) -> Dict[str, Dict[str, str]]:
    """Loads skill code, category, and domain names into an in-memory lookup map."""
    stmt = (
        select(Skill)
        .options(
            selectinload(Skill.category).selectinload(SkillCategory.domain)
        )
    )
    res = await db.execute(stmt)
    details: Dict[str, Dict[str, str]] = {}
    for s in res.scalars().all():
        cat_name = s.category.category_name if s.category else "General"
        dom_name = s.category.domain.domain_name if s.category and s.category.domain else "General"
        details[str(s.skill_id)] = {
            "skill_code": s.skill_code,
            "skill_name": s.skill_name,
            "category_name": cat_name,
            "domain_name": dom_name,
        }
    return details


@router.get("/{session_id}/distribution", response_model=InstitutionalSkillAnalytics)
async def get_institutional_distribution(
    session_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty", "IQAC"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve university-wide skill distributions, distinct student counts, and coverage percentages.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    records = await session_store.get_assessment_records(session_id)

    # Fetch active departments
    dept_res = await db.execute(select(Department).where(Department.is_active == True))
    depts = [
        {
            "department_id": str(d.department_id),
            "department_code": d.department_code,
            "department_name": d.department_name,
        }
        for d in dept_res.scalars().all()
    ]

    taxonomy_details = await _load_taxonomy_details(db)

    analytics = SkillAnalysisEngine.analyze_institutional_skills(
        session_id=session_id,
        session_name=session.get("session_name", "Assessment Session"),
        academic_year=session.get("academic_year", "2026-2027"),
        records=records,
        departments=depts,
        taxonomy_details=taxonomy_details
    )
    return analytics


@router.get("/{session_id}/departments/{department_id}", response_model=DepartmentSkillAnalytics)
async def get_department_analytics(
    session_id: str,
    department_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty", "IQAC"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve department-specific skill intelligence and 3-tier proficiency distributions.
    Enforces HOD department scoping rules.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    # Resolve department from database
    dept = None
    try:
        dept_uuid = uuid.UUID(department_id)
        res = await db.execute(select(Department).where(Department.department_id == dept_uuid))
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

    return SkillAnalysisEngine.analyze_department_skills(
        session_id=session_id,
        department_id=str(dept.department_id),
        department_code=dept.department_code,
        department_name=dept.department_name,
        records=records,
        total_eligible_students=250, # Standard cohort baseline
        taxonomy_details=taxonomy_details
    )


@router.get("/{session_id}/gaps", response_model=Any)
async def get_skill_gaps(
    session_id: str,
    department_id: Optional[str] = Query(None, description="Department UUID or code"),
    include_draft: bool = Query(False, description="ADR-008: Include unapproved DRAFT benchmarks for simulation"),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty", "IQAC"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve skill gap analysis report comparing observed cohort metrics against approved curriculum benchmarks.
    ADR-008: Seeded benchmarks in DRAFT require approval or include_draft=True.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Assessment session '{session_id}' not found or expired.")

    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")

    # If HOD, force scoping to their assigned department
    target_dept_id = department_id
    if "hod" in user_roles and "dean" not in user_roles and "administrator" not in user_roles:
        if not user_dept_id:
            raise ForbiddenException("HOD account is missing department assignment.")
        target_dept_id = str(user_dept_id)

    records = await session_store.get_assessment_records(session_id)
    taxonomy_details = await _load_taxonomy_details(db)

    if target_dept_id:
        # Resolve single department
        dept = None
        try:
            d_uuid = uuid.UUID(target_dept_id)
            res = await db.execute(select(Department).where(Department.department_id == d_uuid))
            dept = res.scalar_one_or_none()
        except (ValueError, TypeError):
            res = await db.execute(select(Department).where(Department.department_code == target_dept_id))
            dept = res.scalar_one_or_none()

        if not dept:
            raise NotFoundException(f"Department '{target_dept_id}' not found.")

        dept_analytics = SkillAnalysisEngine.analyze_department_skills(
            session_id=session_id,
            department_id=str(dept.department_id),
            department_code=dept.department_code,
            department_name=dept.department_name,
            records=records,
            total_eligible_students=250,
            taxonomy_details=taxonomy_details
        )

        benchmarks = await BenchmarkService.list_benchmarks(db, department_id=str(dept.department_id))

        gap_report = SkillGapEngine.evaluate_department_gaps(
            session_id=session_id,
            department_id=str(dept.department_id),
            department_code=dept.department_code,
            department_name=dept.department_name,
            benchmarks=benchmarks,
            department_analytics=dept_analytics,
            include_draft=include_draft
        )
        return gap_report

    # Institutional Cross-Department Gap Summary
    all_depts_res = await db.execute(select(Department).where(Department.is_active == True))
    all_depts = all_depts_res.scalars().all()

    dept_summaries: List[Dict[str, Any]] = []
    priority_gaps: List[Any] = []
    total_evaluated = 0
    total_critical = 0
    total_moderate = 0

    for d in all_depts:
        d_analytics = SkillAnalysisEngine.analyze_department_skills(
            session_id=session_id,
            department_id=str(d.department_id),
            department_code=d.department_code,
            department_name=d.department_name,
            records=records,
            total_eligible_students=250,
            taxonomy_details=taxonomy_details
        )
        bms = await BenchmarkService.list_benchmarks(db, department_id=str(d.department_id))
        report = SkillGapEngine.evaluate_department_gaps(
            session_id=session_id,
            department_id=str(d.department_id),
            department_code=d.department_code,
            department_name=d.department_name,
            benchmarks=bms,
            department_analytics=d_analytics,
            include_draft=include_draft
        )

        total_evaluated += report.benchmarks_evaluated
        total_critical += report.critical_gaps_count
        total_moderate += report.moderate_gaps_count

        dept_summaries.append({
            "department_id": str(d.department_id),
            "department_code": d.department_code,
            "department_name": d.department_name,
            "benchmarks_evaluated": report.benchmarks_evaluated,
            "critical_gaps_count": report.critical_gaps_count,
            "moderate_gaps_count": report.moderate_gaps_count,
            "satisfied_count": report.satisfied_count,
        })
        priority_gaps.extend(report.gaps)

    priority_gaps.sort(key=lambda g: g.gap_score, reverse=True)

    return InstitutionalGapReport(
        session_id=session_id,
        session_name=session.get("session_name", "Assessment Session"),
        total_benchmarks_evaluated=total_evaluated,
        total_critical_gaps=total_critical,
        total_moderate_gaps=total_moderate,
        department_gap_summaries=dept_summaries,
        priority_gaps=priority_gaps[:10] # Top 10 institutional priority gaps
    )

