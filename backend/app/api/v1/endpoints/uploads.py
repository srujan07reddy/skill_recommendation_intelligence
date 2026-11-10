"""
SSIP Bulk Dataset Upload & Ingestion Endpoints
API_DOCUMENTATION.md §12, VALIDATION_RULES.md §7, ADR-001, ADR-006, ADR-007
Supports session-scoped upload and direct HOD section-wise Excel/CSV bulk ingestion.
"""
import secrets
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException, ForbiddenException
from app.core.permissions import require_roles
from app.storage.persistent.database import get_db
from app.storage.persistent.models.academic import Department
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.schemas.upload import ValidationReportResponse, UploadConfirmResponse, RowValidationError
from app.modules.ingestion.file_parser import parse_uploaded_file
from app.modules.validation.validation_service import (
    ValidationService,
    TaxonomyLookupCache,
    resolve_column_mappings,
)

router = APIRouter(prefix="/sessions/{session_id}/uploads", tags=["Uploads"])
direct_router = APIRouter(prefix="/uploads", tags=["Direct Bulk Uploads"])


async def _resolve_hod_department(
    current_token: Dict[str, Any], db: AsyncSession
) -> tuple[Optional[Department], bool]:
    """Returns (hod_department, is_hod_only)."""
    user_roles = [r.lower() for r in current_token.get("roles", [])]
    is_hod_only = "hod" in user_roles and "dean" not in user_roles and "administrator" not in user_roles
    user_dept_id = current_token.get("department_id")

    if not user_dept_id:
        return None, is_hod_only

    try:
        dept_uuid = uuid.UUID(str(user_dept_id))
        res = await db.execute(select(Department).where(Department.department_id == dept_uuid))
        return res.scalar_one_or_none(), is_hod_only
    except (ValueError, TypeError):
        res = await db.execute(select(Department).where(Department.department_code == str(user_dept_id)))
        return res.scalar_one_or_none(), is_hod_only


async def _process_upload_into_preview(
    session: Dict[str, Any],
    file: UploadFile,
    section: Optional[str],
    current_token: Dict[str, Any],
    session_store: AbstractSessionStore,
    db: AsyncSession,
) -> ValidationReportResponse:
    """Shared pipeline: validates uploaded file, pseudonymizes records, and caches preview."""
    session_id = session["session_id"]
    if session["status"] in ("Closed", "Cleaned", "PURGED"):
        raise ValidationException(f"Cannot upload data to a session in '{session['status']}' state.")

    session_hmac_secret = session.get("session_hmac_secret")
    if not session_hmac_secret:
        raise ValidationException("Session missing cryptographic HMAC secret.")

    hod_dept, is_hod_only = await _resolve_hod_department(current_token, db)
    if is_hod_only and not hod_dept:
        raise ForbiddenException("HOD account is missing an assigned department.")

    default_dept_code = hod_dept.department_code if hod_dept else None
    restrict_dept_code = hod_dept.department_code if (is_hod_only and hod_dept) else None

    filename, raw_rows = await parse_uploaded_file(file)
    taxonomy_cache = await TaxonomyLookupCache.load_from_db(db)

    first_row_keys = [k for k in raw_rows[0].keys() if k != "_row_num"]
    col_map = resolve_column_mappings(first_row_keys)
    format_detected = "LONG" if ("skill_name" in col_map and "proficiency_level" in col_map) else "WIDE"

    valid_records, validation_errors, error_rows_cnt, warning_rows_cnt = ValidationService.validate_batch(
        raw_rows=raw_rows,
        taxonomy=taxonomy_cache,
        session_hmac_secret=session_hmac_secret,
        default_department_code=default_dept_code,
        default_section=section,
        restrict_to_department_code=restrict_dept_code,
    )

    upload_id = str(uuid.uuid4())
    total_rows = len(raw_rows)
    valid_cnt = len(valid_records)
    sections_detected = sorted({r.get("section", "General") for r in valid_records}) if valid_records else (
        [section.strip()] if section and section.strip() else []
    )

    validation_status = "VALID"
    if error_rows_cnt > 0:
        validation_status = "INVALID"
    elif warning_rows_cnt > 0:
        validation_status = "WARNINGS"

    preview_data = {
        "upload_id": upload_id,
        "session_id": session_id,
        "filename": filename,
        "validation_status": validation_status,
        "total_rows": total_rows,
        "valid_rows_count": valid_cnt,
        "error_rows_count": error_rows_cnt,
        "warning_rows_count": warning_rows_cnt,
        "sections_detected": sections_detected,
        "format_detected": format_detected,
        "errors": [e.model_dump() for e in validation_errors],
        "sample_valid_rows": valid_records[:5],
        "valid_records": valid_records,
    }

    await session_store.store_upload_preview(upload_id, preview_data, ttl_seconds=3600)

    return ValidationReportResponse(
        upload_id=upload_id,
        session_id=session_id,
        filename=filename,
        validation_status=validation_status,
        total_rows=total_rows,
        valid_rows_count=valid_cnt,
        error_rows_count=error_rows_cnt,
        warning_rows_count=warning_rows_cnt,
        sections_detected=sections_detected,
        format_detected=format_detected,
        errors=validation_errors,
        sample_valid_rows=valid_records[:5],
    )


@router.post("", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
async def upload_dataset_for_validation(
    session_id: str,
    file: UploadFile = File(...),
    section: Optional[str] = Form(None),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts Excel (.xlsx, .xls) or CSV (.csv) dataset, parses and executes multi-stage validation.
    Stores validated records in ephemeral preview buffer without committing to session buffer.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Session with ID '{session_id}' not found or has expired.")

    return await _process_upload_into_preview(
        session=session,
        file=file,
        section=section,
        current_token=current_token,
        session_store=session_store,
        db=db,
    )


@direct_router.post("/direct", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
async def direct_bulk_upload(
    file: UploadFile = File(...),
    section: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    session_name: Optional[str] = Form(None),
    academic_year: str = Form("2026-2027"),
    current_token: Dict[str, Any] = Depends(require_roles(["HOD", "Dean", "Administrator"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Direct one-step Bulk Upload for HODs:
    Reuses an existing Active department session or automatically creates & activates one,
    validates the section-wise Excel/CSV spreadsheet, and returns preview report ready for 1-click commit.
    """
    hod_dept, is_hod_only = await _resolve_hod_department(current_token, db)
    if is_hod_only and not hod_dept:
        raise ForbiddenException("HOD account is missing an assigned department.")

    target_session = None
    sid_clean = (session_id or "").strip()
    if sid_clean and sid_clean.upper() not in ("AUTO", "NEW"):
        target_session = await session_store.get_session(sid_clean)
        if not target_session:
            raise NotFoundException(f"Session with ID '{session_id}' not found or has expired.")
    else:
        target_dept_id = str(hod_dept.department_id) if hod_dept else None
        if sid_clean.upper() != "NEW":
            # Look for an existing Active session matching this department
            all_sessions = await session_store.list_sessions()
            for s in all_sessions:
                if s.get("status") == "Active":
                    if not target_dept_id or s.get("department_id") == target_dept_id:
                        target_session = s
                        break

        if not target_session:
            new_sid = str(uuid.uuid4())
            sec_label = f" ({section.strip()})" if section and section.strip() else ""
            dept_label = hod_dept.department_code if hod_dept else "INST"
            auto_name = (session_name or "").strip() or f"{dept_label} Bulk Evaluation{sec_label}"
            session_data = {
                "session_id": new_sid,
                "session_name": auto_name,
                "session_type": "BULK_UPLOAD",
                "department_id": target_dept_id,
                "department_name": hod_dept.department_name if hod_dept else "Institutional",
                "academic_year": academic_year,
                "status": "Active",
                "session_hmac_secret": secrets.token_hex(32),
                "created_by": current_token.get("sub"),
            }
            target_session = await session_store.create_session(session_data, ttl_seconds=24 * 3600)

    return await _process_upload_into_preview(
        session=target_session,
        file=file,
        section=section,
        current_token=current_token,
        session_store=session_store,
        db=db,
    )


@router.get("/{upload_id}/preview", response_model=ValidationReportResponse)
async def get_upload_preview(
    session_id: str,
    upload_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    Retrieve validation preview report and sample rows for confirmation review.
    """
    preview = await session_store.get_upload_preview(upload_id)
    if not preview or preview.get("session_id") != session_id:
        raise NotFoundException(f"Upload preview '{upload_id}' not found or expired.")

    return ValidationReportResponse(
        upload_id=preview["upload_id"],
        session_id=preview["session_id"],
        filename=preview["filename"],
        validation_status=preview["validation_status"],
        total_rows=preview["total_rows"],
        valid_rows_count=preview["valid_rows_count"],
        error_rows_count=preview["error_rows_count"],
        warning_rows_count=preview["warning_rows_count"],
        sections_detected=preview.get("sections_detected", []),
        format_detected=preview.get("format_detected", "LONG"),
        errors=[RowValidationError(**e) for e in preview["errors"]],
        sample_valid_rows=preview["sample_valid_rows"]
    )


@router.post("/{upload_id}/confirm", response_model=UploadConfirmResponse)
async def confirm_upload_import(
    session_id: str,
    upload_id: str,
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store)
):
    """
    Confirm import of validated records into active session buffer.
    Deletes the temporary upload preview buffer immediately upon commit.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Session with ID '{session_id}' not found.")

    if session["status"] in ("Closed", "Cleaned", "PURGED"):
        raise ValidationException(f"Cannot commit data into a session in '{session['status']}' state.")

    preview = await session_store.get_upload_preview(upload_id)
    if not preview or preview.get("session_id") != session_id:
        raise NotFoundException(f"Upload preview '{upload_id}' not found or has expired. Please re-upload.")

    valid_records = preview.get("valid_records", [])
    if not valid_records:
        raise ValidationException("No valid records available to import from this upload.")

    committed_cnt = await session_store.add_assessment_records(session_id, valid_records)

    if session["status"] == "Created":
        await session_store.update_session_status(session_id, "Active")

    await session_store.delete_upload_preview(upload_id)

    return UploadConfirmResponse(
        session_id=session_id,
        upload_id=upload_id,
        committed_records_count=committed_cnt,
        status="COMMITTED",
        message=f"Successfully imported {committed_cnt} valid assessment records into session buffer."
    )

