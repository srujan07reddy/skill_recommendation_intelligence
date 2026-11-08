"""
SSIP Bulk Dataset Upload & Ingestion Endpoints
API_DOCUMENTATION.md §12, VALIDATION_RULES.md §7, ADR-001, ADR-006, ADR-007
"""
import uuid
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException, ValidationException, ForbiddenException
from app.core.permissions import require_roles
from app.storage.persistent.database import get_db
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.schemas.upload import ValidationReportResponse, UploadConfirmResponse, RowValidationError
from app.modules.ingestion.file_parser import parse_uploaded_file
from app.modules.validation.validation_service import ValidationService, TaxonomyLookupCache

router = APIRouter(prefix="/sessions/{session_id}/uploads", tags=["Uploads"])


@router.post("", response_model=ValidationReportResponse, status_code=status.HTTP_200_OK)
async def upload_dataset_for_validation(
    session_id: str,
    file: UploadFile = File(...),
    current_token: Dict[str, Any] = Depends(require_roles(["Dean", "Administrator", "HOD"])),
    session_store: AbstractSessionStore = Depends(get_session_store),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts Excel (.xlsx) or CSV (.csv) dataset, parses and executes multi-stage validation.
    Stores validated records in ephemeral preview buffer without committing to session buffer.
    """
    session = await session_store.get_session(session_id)
    if not session:
        raise NotFoundException(f"Session with ID '{session_id}' not found or has expired.")

    if session["status"] in ("Closed", "Cleaned", "PURGED"):
        raise ValidationException(f"Cannot upload data to a session in '{session['status']}' state.")

    # Retrieve ADR-001 server secret key for session-scoped pseudonymization
    session_hmac_secret = session.get("session_hmac_secret")
    if not session_hmac_secret:
        raise ValidationException("Session missing cryptographic HMAC secret.")

    # Parse raw tabular data (streaming, data_only mode for Excel)
    filename, raw_rows = await parse_uploaded_file(file)

    # Load active taxonomy cache from persistent database
    taxonomy_cache = await TaxonomyLookupCache.load_from_db(db)

    # Execute batch validation and normalization
    valid_records, validation_errors, error_rows_cnt, warning_rows_cnt = ValidationService.validate_batch(
        raw_rows=raw_rows,
        taxonomy=taxonomy_cache,
        session_hmac_secret=session_hmac_secret
    )

    upload_id = str(uuid.uuid4())
    total_rows = len(raw_rows)
    valid_cnt = len(valid_records)

    validation_status = "VALID"
    if error_rows_cnt > 0:
        validation_status = "INVALID"
    elif warning_rows_cnt > 0:
        validation_status = "WARNINGS"

    # Ephemeral preview payload
    preview_data = {
        "upload_id": upload_id,
        "session_id": session_id,
        "filename": filename,
        "validation_status": validation_status,
        "total_rows": total_rows,
        "valid_rows_count": valid_cnt,
        "error_rows_count": error_rows_cnt,
        "warning_rows_count": warning_rows_cnt,
        "errors": [e.model_dump() for e in validation_errors],
        "sample_valid_rows": valid_records[:5],
        "valid_records": valid_records, # Stored temporarily until confirmation
    }

    # Store in ephemeral preview store with 1-hour TTL
    await session_store.store_upload_preview(upload_id, preview_data, ttl_seconds=3600)

    return ValidationReportResponse(
        upload_id=upload_id,
        filename=filename,
        validation_status=validation_status,
        total_rows=total_rows,
        valid_rows_count=valid_cnt,
        error_rows_count=error_rows_cnt,
        warning_rows_count=warning_rows_cnt,
        errors=validation_errors,
        sample_valid_rows=valid_records[:5]
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
        filename=preview["filename"],
        validation_status=preview["validation_status"],
        total_rows=preview["total_rows"],
        valid_rows_count=preview["valid_rows_count"],
        error_rows_count=preview["error_rows_count"],
        warning_rows_count=preview["warning_rows_count"],
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

    # Commit records to ephemeral session store
    committed_cnt = await session_store.add_assessment_records(session_id, valid_records)

    # If session was Created, automatically transition to Active
    if session["status"] == "Created":
        await session_store.update_session_status(session_id, "Active")

    # Purge upload preview buffer immediately
    await session_store.delete_upload_preview(upload_id)

    return UploadConfirmResponse(
        session_id=session_id,
        upload_id=upload_id,
        committed_records_count=committed_cnt,
        status="COMMITTED",
        message=f"Successfully imported {committed_cnt} valid assessment records into session buffer."
    )

