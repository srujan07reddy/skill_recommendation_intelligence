"""
SSIP Ephemeral Governance Endpoints
API_DOCUMENTATION.md §18, ADR-002
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_token_payload, require_roles
from app.storage.persistent.database import get_db
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.modules.governance.proposal_service import ProposalService
from app.schemas.governance import (
    ProposalCreateRequest,
    ProposalUpdateRequest,
    ProposalDecisionRequest,
    ProposalResponse,
)

router = APIRouter(prefix="/governance", tags=["Governance Proposals"])


def get_proposal_service(
    session_store: AbstractSessionStore = Depends(get_session_store),
) -> ProposalService:
    return ProposalService(session_store=session_store)


@router.post(
    "/proposals",
    response_model=ProposalResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create departmental proposal",
)
async def create_proposal(
    request: ProposalCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_roles(["HOD", "Dean", "Administrator"])),
    service: ProposalService = Depends(get_proposal_service),
):
    """
    HOD creates a session-scoped proposal based on skill gaps or recommendations (ADR-002).
    """
    return await service.create_proposal(request, db, current_user)


@router.get(
    "/proposals",
    response_model=List[ProposalResponse],
    summary="List active proposals",
)
async def list_proposals(
    session_id: Optional[str] = Query(None, description="Filter by assessment session ID"),
    department_id: Optional[str] = Query(None, description="Filter by department ID"),
    current_user: Dict[str, Any] = Depends(get_current_token_payload),
    service: ProposalService = Depends(get_proposal_service),
):
    """
    Retrieve proposals. HODs are scoped to their department; Deans/Admins view all.
    """
    return await service.list_proposals(session_id, department_id, current_user)


@router.get(
    "/proposals/{proposal_id}",
    response_model=ProposalResponse,
    summary="Retrieve specific proposal",
)
async def get_proposal(
    proposal_id: str,
    current_user: Dict[str, Any] = Depends(get_current_token_payload),
    service: ProposalService = Depends(get_proposal_service),
):
    return await service.get_proposal(proposal_id)


@router.patch(
    "/proposals/{proposal_id}",
    response_model=ProposalResponse,
    summary="Update eligible proposal",
)
async def update_proposal(
    proposal_id: str,
    request: ProposalUpdateRequest,
    current_user: Dict[str, Any] = Depends(require_roles(["HOD", "Dean", "Administrator"])),
    service: ProposalService = Depends(get_proposal_service),
):
    """
    Update proposal content while in DRAFT or CHANGES_REQUESTED state.
    """
    return await service.update_proposal(proposal_id, request, current_user)


@router.post(
    "/proposals/{proposal_id}/submit",
    response_model=ProposalResponse,
    summary="Submit proposal to Dean",
)
async def submit_proposal(
    proposal_id: str,
    current_user: Dict[str, Any] = Depends(require_roles(["HOD", "Dean", "Administrator"])),
    service: ProposalService = Depends(get_proposal_service),
):
    """
    Transitions proposal from DRAFT to SUBMITTED state.
    """
    return await service.submit_proposal(proposal_id, current_user)


@router.post(
    "/proposals/{proposal_id}/decision",
    response_model=ProposalResponse,
    summary="Record Dean decision",
)
async def record_decision(
    proposal_id: str,
    decision_req: ProposalDecisionRequest,
    current_user: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator"])),
    service: ProposalService = Depends(get_proposal_service),
):
    """
    Dean records institutional review outcome (APPROVED, REJECTED, CHANGES_REQUESTED, DEFERRED).
    """
    return await service.record_decision(proposal_id, decision_req, current_user)
