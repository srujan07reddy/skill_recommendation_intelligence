"""
SSIP Curriculum Benchmark Management Endpoints
DEPARTMENT_SKILL_MAPPING.md §4, ADR-008
Allows reviewing and approving candidate benchmarks from DRAFT to APPROVED.
"""
from typing import Any, Dict, List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ForbiddenException, ValidationException
from app.core.permissions import require_roles
from app.storage.persistent.database import get_db
from app.schemas.analysis import BenchmarkResponse, BenchmarkApprovalRequest
from app.modules.analysis.benchmark_service import BenchmarkService

router = APIRouter(prefix="/benchmarks", tags=["Curriculum Benchmarks (ADR-008)"])


@router.get("", response_model=List[BenchmarkResponse])
async def list_benchmarks(
    department_id: Optional[str] = Query(None, description="Department UUID or code"),
    school_id: Optional[str] = Query(None, description="Filter by school (Admin overall view)"),
    status: Optional[str] = Query(None, description="DRAFT, APPROVED, ARCHIVED"),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty"])),
    db: AsyncSession = Depends(get_db)
):
    """
    List curriculum benchmarks with their institutional approval status (ADR-008).
    Dean is restricted to their assigned school; Admin can see all or filter by school.
    """
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_school_id = current_token.get("school_id")

    # If Dean, enforce their school's scope
    if "dean" in user_roles and "administrator" not in user_roles and user_school_id:
        effective_school_id = str(user_school_id)
    else:
        effective_school_id = school_id

    mappings = await BenchmarkService.list_benchmarks(
        db,
        department_id=department_id,
        school_id=effective_school_id,
        status=status
    )
    return [
        BenchmarkResponse(
            mapping_id=str(m.mapping_id),
            department_id=str(m.department_id),
            department_code=m.department.department_code if m.department else "DEPT-CSE",
            department_name=m.department.department_name if m.department else "Computer Science & Engineering",
            skill_id=str(m.skill_id),
            skill_code=m.skill.skill_code if m.skill else "",
            skill_name=m.skill.skill_name if m.skill else "",
            relevance_type=m.relevance_type,
            target_proficiency=float(m.target_proficiency),
            minimum_coverage=float(m.minimum_coverage),
            priority_weight=float(m.priority_weight),
            status=m.status,
            approved_by=str(m.approved_by) if m.approved_by else None,
            approved_at=m.approved_at.isoformat() if m.approved_at else None,
            justification=m.justification
        )
        for m in mappings
    ]


@router.post("/{mapping_id}/approve", response_model=BenchmarkResponse)
async def approve_benchmark(
    mapping_id: str,
    payload: BenchmarkApprovalRequest,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
    db: AsyncSession = Depends(get_db)
):
    """
    ADR-008: Institutional sign-off endpoint for Dean to approve a candidate curriculum benchmark.
    Transitions benchmark from DRAFT to APPROVED.
    """
    approver_id_str = current_token.get("sub")
    approver_uuid = uuid.UUID(approver_id_str) if approver_id_str else uuid.uuid4()

    updated = await BenchmarkService.approve_benchmark(
        db=db,
        mapping_id=mapping_id,
        approved_by_id=approver_uuid,
        justification=payload.justification
    )

    return BenchmarkResponse(
        mapping_id=str(updated.mapping_id),
        department_id=str(updated.department_id),
        department_code="DEPT-CSE",
        department_name="Computer Science & Engineering",
        skill_id=str(updated.skill_id),
        skill_code=updated.skill.skill_code if updated.skill else "",
        skill_name=updated.skill.skill_name if updated.skill else "",
        relevance_type=updated.relevance_type,
        target_proficiency=float(updated.target_proficiency),
        minimum_coverage=float(updated.minimum_coverage),
        priority_weight=float(updated.priority_weight),
        status=updated.status,
        approved_by=str(updated.approved_by) if updated.approved_by else None,
        approved_at=updated.approved_at.isoformat() if updated.approved_at else None,
        justification=updated.justification
    )


@router.post("/departments/{department_id}/approve-all", status_code=status.HTTP_200_OK)
async def bulk_approve_benchmarks(
    department_id: str,
    payload: BenchmarkApprovalRequest,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
    db: AsyncSession = Depends(get_db)
):
    """
    ADR-008: Bulk approve all DRAFT benchmarks for an academic department.
    """
    approver_id_str = current_token.get("sub")
    approver_uuid = uuid.UUID(approver_id_str) if approver_id_str else uuid.uuid4()

    count = await BenchmarkService.bulk_approve_department_benchmarks(
        db=db,
        department_id=department_id,
        approved_by_id=approver_uuid,
        justification=payload.justification
    )

    return {
        "department_id": department_id,
        "approved_count": count,
        "status": "APPROVED",
        "message": f"Successfully approved {count} candidate curriculum benchmarks for active gap computation."
    }
