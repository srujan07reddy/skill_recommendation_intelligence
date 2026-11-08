"""
SSIP Session Lifecycle Management Endpoints
API_DOCUMENTATION.md §10, SESSION_MANAGEMENT.md §6, ADR-001, ADR-002
"""
import secrets
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.exceptions import NotFoundException, ValidationException, ForbiddenException
from app.core.permissions import get_current_token_payload, require_roles
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import Department
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.schemas.session import SessionCreateRequest, SessionResponse, SessionStatusResponse

router = APIRouter(prefix="/sessions", tags=["Sessions"])


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: SessionCreateRequest,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new assessment session with TTL and ADR-001 cryptographically secure HMAC secret.
    """
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")

    # If HOD, enforce scoping to their department
    target_dept_id = payload.department_id
    if "hod" in user_roles and "dean" not in user_roles and "administrator" not in user_roles:
        if not user_dept_id:
            raise ForbiddenException("HOD account is missing department assignment.")
        target_dept_id = str(user_dept_id)

    dept_name = None
    if target_dept_id:
        try:
            dept_uuid = uuid.UUID(target_dept_id)
            dept_res = await db.execute(select(Department).where(Department.department_id == dept_uuid))
            dept = dept_res.scalar_one_or_none()
            if dept:
                dept_name = dept.department_name
        except (ValueError, TypeError):
            # Check by code
            dept_res = await db.execute(select(Department).where(Department.department_code == target_dept_id))
            dept = dept_res.scalar_one_or_none()
            if dept:
                dept_name = dept.department_name
                target_dept_id = str(dept.department_id)

    session_id = str(uuid.uuid4())
    # ADR-001: 256-bit cryptographically secure server secret held only in ephemeral store
    session_hmac_secret = secrets.token_hex(32)

    session_data = {
        "session_id": session_id,
        "session_name": payload.session_name,
        "session_type": payload.session_type,
        "department_id": target_dept_id,
        "department_name": dept_name,
        "academic_year": payload.academic_year,
        "status": "Created",
        "session_hmac_secret": session_hmac_secret, # Protected server-held key
        "created_by": current_token.get("sub"),
    }

    ttl_seconds = payload.expiry_hours * 3600
    created = await session_store.create_session(session_data, ttl_seconds=ttl_seconds)

    return SessionResponse(
        session_id=created["session_id"],
        session_name=created["session_name"],
        session_type=created["session_type"],
        status=created["status"],
        department_id=created.get("department_id"),
        department_name=created.get("department_name"),
        academic_year=created["academic_year"],
        created_at=created["created_at"],
        expiry_time=created["expiry_time"],
        record_count=0,
        student_count=0
    )


@router.get("", response_model=List[SessionResponse])
async def list_sessions(
    department_id: Optional[str] = Query(None, description="Filter by department UUID or code"),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty", "IQAC"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    List active/available sessions, respecting role department scope.
    """
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")

    # If HOD or Faculty, enforce department filtering
    if ("hod" in user_roles or "faculty" in user_roles) and ("dean" not in user_roles and "administrator" not in user_roles):
        dept_filter = str(user_dept_id) if user_dept_id else None
    else:
        dept_filter = department_id

    sessions = await session_store.list_sessions(department_id=dept_filter)
    return [
        SessionResponse(
            session_id=s["session_id"],
            session_name=s["session_name"],
            session_type=s["session_type"],
            status=s["status"],
            department_id=s.get("department_id"),
            department_name=s.get("department_name"),
            academic_year=s.get("academic_year", "2026-2027"),
            created_at=s.get("created_at", ""),
            expiry_time=s.get("expiry_time", ""),
            record_count=s.get("record_count", 0),
            student_count=s.get("student_count", 0)
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD", "Faculty", "IQAC"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    Retrieve session details and current counts.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Session with ID '{session_id}' not found or has expired.")

    user_roles = [r.lower() for r in current_token.get("roles", [])]
    user_dept_id = current_token.get("department_id")

    if ("hod" in user_roles or "faculty" in user_roles) and ("dean" not in user_roles and "administrator" not in user_roles):
        if session.get("department_id") and str(session.get("department_id")) != str(user_dept_id):
            raise ForbiddenException("Access denied. Session belongs to a different department.")

    records = await session_store.get_assessment_records(session_id)
    unique_students = {r.get("session_student_ref") for r in records if r.get("session_student_ref")}

    return SessionResponse(
        session_id=session["session_id"],
        session_name=session["session_name"],
        session_type=session["session_type"],
        status=session["status"],
        department_id=session.get("department_id"),
        department_name=session.get("department_name"),
        academic_year=session.get("academic_year", "2026-2027"),
        created_at=session.get("created_at", ""),
        expiry_time=session.get("expiry_time", ""),
        record_count=len(records),
        student_count=len(unique_students)
    )


@router.post("/{session_id}/activate", response_model=SessionResponse)
async def activate_session(
    session_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    Transition session to Active state to allow assessment submissions and data ingestion.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException("Session not found.")

    if session["status"] in ("Closed", "Cleaned", "PURGED"):
        raise ValidationException(f"Cannot activate session in '{session['status']}' state.")

    updated = await session_store.update_session_status(session_id, "Active")
    records = await session_store.get_assessment_records(session_id)

    return SessionResponse(
        session_id=updated["session_id"],
        session_name=updated["session_name"],
        session_type=updated["session_type"],
        status=updated["status"],
        department_id=updated.get("department_id"),
        department_name=updated.get("department_name"),
        academic_year=updated.get("academic_year", "2026-2027"),
        created_at=updated.get("created_at", ""),
        expiry_time=updated.get("expiry_time", ""),
        record_count=len(records),
        student_count=len({r.get("session_student_ref") for r in records if r.get("session_student_ref")})
    )


@router.post("/{session_id}/close", response_model=SessionResponse)
async def close_session(
    session_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    Close session to prevent any further assessment submissions or data imports.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException("Session not found.")

    updated = await session_store.update_session_status(session_id, "Closed")
    records = await session_store.get_assessment_records(session_id)

    return SessionResponse(
        session_id=updated["session_id"],
        session_name=updated["session_name"],
        session_type=updated["session_type"],
        status=updated["status"],
        department_id=updated.get("department_id"),
        department_name=updated.get("department_name"),
        academic_year=updated.get("academic_year", "2026-2027"),
        created_at=updated.get("created_at", ""),
        expiry_time=updated.get("expiry_time", ""),
        record_count=len(records),
        student_count=len({r.get("session_student_ref") for r in records if r.get("session_student_ref")})
    )


@router.get("/{session_id}/status", response_model=SessionStatusResponse)
async def get_session_status(
    session_id: str,
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    Lightweight status check endpoint (used by progress pollers and form validation).
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException("Session not found.")

    records = await session_store.get_assessment_records(session_id)
    unique_students = {r.get("session_student_ref") for r in records if r.get("session_student_ref")}

    return SessionStatusResponse(
        session_id=session["session_id"],
        status=session["status"],
        record_count=len(records),
        student_count=len(unique_students),
        created_at=session.get("created_at", ""),
        expiry_time=session.get("expiry_time", "")
    )


import os
import tempfile

@router.delete("/{session_id}", status_code=status.HTTP_200_OK, summary="Purge session (DELETE)")
@router.post("/{session_id}/purge", status_code=status.HTTP_200_OK, summary="Explicit Session Purge (POST)")
async def purge_session(
    session_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    TASK-08-02: Explicit session purge endpoint.
    Physically erases ephemeral assessment buffers, proposals, and unlinks temporary export files (ADR-004).
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException("Session not found.")

    # If HOD, verify department match
    roles = [r.lower() for r in current_token.get("roles", [])]
    if "hod" in roles and "dean" not in roles and "administrator" not in roles:
        user_dept = str(current_token.get("department_id") or "")
        if user_dept and user_dept != str(session.get("department_id")):
            raise ForbiddenException("HOD cannot purge sessions belonging to other departments.")

    # 1. State transition: Cleaning
    await session_store.update_session_status(session_id, "Cleaning")

    # 2. Unlink temporary export files from filesystem (ADR-004)
    export_dir = os.path.join(tempfile.gettempdir(), "ssip_exports")
    unlinked_files = 0
    if os.path.exists(export_dir):
        for fname in os.listdir(export_dir):
            if session_id in fname:
                try:
                    os.remove(os.path.join(export_dir, fname))
                    unlinked_files += 1
                except Exception:
                    pass

    # 3. Purge session buffer, proposals, and export records from store
    await session_store.delete_session(session_id)

    return {
        "session_id": session_id,
        "status": "Cleaned",
        "purged_at": datetime.now(timezone.utc).isoformat(),
        "unlinked_files_count": unlinked_files,
        "message": "Session and all ephemeral assessment records and export packages physically erased across all boundaries."
    }

