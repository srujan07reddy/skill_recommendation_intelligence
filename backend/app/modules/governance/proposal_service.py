"""
SSIP Ephemeral Governance Proposal Service
APPLICATION_MODULES.md §7.3, ADR-002
Manages HOD development proposals and Dean decisions within ephemeral session scope.
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException, ForbiddenException
from app.storage.memory.session_store import InMemorySessionStore
from app.storage.persistent.models.academic import Department
from app.schemas.governance import (
    ProposalCreateRequest,
    ProposalUpdateRequest,
    ProposalDecisionRequest,
    ProposalStatus,
    ProposalResponse,
)


class ProposalService:
    def __init__(self, session_store: InMemorySessionStore):
        self.session_store = session_store

    async def create_proposal(
        self,
        request: ProposalCreateRequest,
        db: AsyncSession,
        current_user: Dict[str, Any],
    ) -> ProposalResponse:
        # 1. Verify parent session exists
        session = await self.session_store.get_session(request.session_id)
        if not session:
            raise NotFoundException(f"Assessment session '{request.session_id}' not found or has expired.")

        # 2. Verify department exists (supporting both UUID and department_code like DEPT-CSE)
        try:
            dept_uuid = uuid.UUID(request.department_id)
            stmt = select(Department).where(Department.department_id == dept_uuid)
        except (ValueError, TypeError):
            stmt = select(Department).where(Department.department_code == request.department_id)
        result = await db.execute(stmt)
        dept = result.scalar_one_or_none()
        if not dept:
            raise NotFoundException(f"Department '{request.department_id}' not found.")

        # 3. RBAC Scoping: If user is HOD, verify department match
        roles = [r.lower() for r in current_user.get("roles", [])]
        if "hod" in roles and "dean" not in roles and "administrator" not in roles:
            user_dept = str(current_user.get("department_id") or "")
            if user_dept and user_dept not in (str(dept.department_id), dept.department_code):
                raise ForbiddenException("HOD cannot submit proposals for another department.")

        # 4. Generate proposal record
        prop_id = f"PROP-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc).isoformat()

        proposal_dict = {
            "proposal_id": prop_id,
            "session_id": request.session_id,
            "department_id": str(dept.department_id),
            "department_code": dept.department_code,
            "department_name": dept.department_name,
            "proposal_title": request.proposal_title,
            "initiative_category": request.initiative_category.value,
            "target_cohort": request.target_cohort,
            "learning_outcomes": request.learning_outcomes,
            "justification": request.justification,
            "proposed_duration_weeks": request.proposed_duration_weeks,
            "estimated_cost": request.estimated_cost,
            "recommendation_id": request.recommendation_id,
            "status": ProposalStatus.DRAFT.value,
            "submitted_by": current_user.get("username"),
            "submitted_at": None,
            "reviewed_by": None,
            "reviewed_at": None,
            "decision_remarks": None,
            "created_at": now,
            "updated_at": now,
        }

        created = await self.session_store.create_proposal(proposal_dict)
        return ProposalResponse(**created)

    async def get_proposal(self, proposal_id: str) -> ProposalResponse:
        p = await self.session_store.get_proposal(proposal_id)
        if not p:
            raise NotFoundException(f"Proposal '{proposal_id}' not found or session has expired.")
        return ProposalResponse(**p)

    async def list_proposals(
        self,
        session_id: Optional[str] = None,
        department_id: Optional[str] = None,
        current_user: Optional[Dict[str, Any]] = None,
    ) -> List[ProposalResponse]:
        scoped_dept_id = department_id
        if current_user:
            roles = [r.lower() for r in current_user.get("roles", [])]
            if "hod" in roles and "dean" not in roles and "administrator" not in roles:
                user_dept = current_user.get("department_id")
                if user_dept:
                    scoped_dept_id = user_dept

        records = await self.session_store.list_proposals(session_id, scoped_dept_id)
        return [ProposalResponse(**r) for r in records]

    async def update_proposal(
        self,
        proposal_id: str,
        request: ProposalUpdateRequest,
        current_user: Dict[str, Any],
    ) -> ProposalResponse:
        p = await self.session_store.get_proposal(proposal_id)
        if not p:
            raise NotFoundException(f"Proposal '{proposal_id}' not found.")

        # Only DRAFT or CHANGES_REQUESTED can be updated
        if p["status"] not in (ProposalStatus.DRAFT.value, ProposalStatus.CHANGES_REQUESTED.value):
            raise ValidationException(f"Cannot edit proposal in '{p['status']}' state.")

        # Check HOD department scoping
        roles = [r.lower() for r in current_user.get("roles", [])]
        if "hod" in roles and "dean" not in roles and "administrator" not in roles:
            user_dept = str(current_user.get("department_id") or "")
            if user_dept and user_dept not in (p["department_id"], p.get("department_code")):
                raise ForbiddenException("Cannot edit proposals belonging to other departments.")

        updates = request.model_dump(exclude_unset=True)
        if "initiative_category" in updates and updates["initiative_category"]:
            updates["initiative_category"] = updates["initiative_category"].value

        updated = await self.session_store.update_proposal(proposal_id, updates)
        return ProposalResponse(**updated)

    async def submit_proposal(
        self,
        proposal_id: str,
        current_user: Dict[str, Any],
    ) -> ProposalResponse:
        p = await self.session_store.get_proposal(proposal_id)
        if not p:
            raise NotFoundException(f"Proposal '{proposal_id}' not found.")

        if p["status"] not in (ProposalStatus.DRAFT.value, ProposalStatus.CHANGES_REQUESTED.value):
            raise ValidationException(f"Cannot submit proposal currently in '{p['status']}' state.")

        # Check HOD department scoping
        roles = [r.lower() for r in current_user.get("roles", [])]
        if "hod" in roles and "dean" not in roles and "administrator" not in roles:
            user_dept = str(current_user.get("department_id") or "")
            if user_dept and user_dept not in (p["department_id"], p.get("department_code")):
                raise ForbiddenException("Cannot submit proposals for other departments.")

        now = datetime.now(timezone.utc).isoformat()
        updates = {
            "status": ProposalStatus.SUBMITTED.value,
            "submitted_by": current_user.get("username"),
            "submitted_at": now,
        }
        updated = await self.session_store.update_proposal(proposal_id, updates)
        return ProposalResponse(**updated)

    async def record_decision(
        self,
        proposal_id: str,
        decision_req: ProposalDecisionRequest,
        dean_user: Dict[str, Any],
    ) -> ProposalResponse:
        p = await self.session_store.get_proposal(proposal_id)
        if not p:
            raise NotFoundException(f"Proposal '{proposal_id}' not found.")

        # Only Dean or Administrator can record decisions
        roles = [r.lower() for r in dean_user.get("roles", [])]
        if "dean" not in roles and "administrator" not in roles:
            raise ForbiddenException("Only the Dean of Academic Affairs or Administrator can review proposals.")

        if p["status"] not in (ProposalStatus.SUBMITTED.value, ProposalStatus.UNDER_REVIEW.value, ProposalStatus.DEFERRED.value):
            raise ValidationException(f"Cannot record decision on proposal in '{p['status']}' state.")

        valid_decisions = (
            ProposalStatus.APPROVED,
            ProposalStatus.REJECTED,
            ProposalStatus.CHANGES_REQUESTED,
            ProposalStatus.DEFERRED,
        )
        if decision_req.decision not in valid_decisions:
            raise ValidationException(f"Invalid decision '{decision_req.decision}'.")

        now = datetime.now(timezone.utc).isoformat()
        updates = {
            "status": decision_req.decision.value,
            "reviewed_by": dean_user.get("username"),
            "reviewed_at": now,
            "decision_remarks": decision_req.remarks,
        }
        updated = await self.session_store.update_proposal(proposal_id, updates)
        return ProposalResponse(**updated)
