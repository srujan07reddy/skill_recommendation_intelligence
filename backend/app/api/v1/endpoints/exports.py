"""
SSIP Export Endpoints
API_DOCUMENTATION.md §20, ADR-004, ADR-005
"""
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.permissions import get_current_token_payload
from app.storage.persistent.database import get_db
from app.storage.session_factory import get_session_store
from app.storage.interfaces.session_store import AbstractSessionStore
from app.modules.exports.export_service import ExportService
from app.schemas.export import ExportCreateRequest, ExportMetadataResponse

router = APIRouter(tags=["Exports & Packages"])


def get_export_service(
    session_store: AbstractSessionStore = Depends(get_session_store),
) -> ExportService:
    return ExportService(session_store=session_store)


@router.post(
    "/sessions/{session_id}/exports",
    response_model=ExportMetadataResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate reports or complete analysis package",
)
async def create_export(
    session_id: str,
    request: ExportCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_token_payload),
    service: ExportService = Depends(get_export_service),
):
    """
    Generate PDF, Excel, CSV or complete analysis ZIP package (ADR-004, ADR-005).
    Original uploads strictly excluded by default.
    """
    return await service.generate_export(session_id, request, db, current_user)


@router.get(
    "/exports/{export_id}",
    response_model=ExportMetadataResponse,
    summary="Retrieve export metadata",
)
async def get_export_metadata(
    export_id: str,
    current_user: Dict[str, Any] = Depends(get_current_token_payload),
    service: ExportService = Depends(get_export_service),
):
    return await service.get_export(export_id)


@router.get(
    "/exports/{export_id}/download",
    summary="Download temporary export file",
)
async def download_export(
    export_id: str,
    token: str = Query(..., description="Single-use or 24-hour signed download token"),
    service: ExportService = Depends(get_export_service),
):
    """
    Download export file using authorized token (ADR-004).
    """
    file_path, filename = await service.get_export_file(export_id, token)
    media_type = "application/octet-stream"
    if filename.endswith(".pdf"):
        media_type = "application/pdf"
    elif filename.endswith(".xlsx"):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif filename.endswith(".csv"):
        media_type = "text/csv"
    elif filename.endswith(".zip"):
        media_type = "application/zip"

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type,
    )


@router.get(
    "/exports",
    response_model=List[ExportMetadataResponse],
    summary="List active exports",
)
async def list_exports(
    session_id: Optional[str] = Query(None, description="Filter by session ID"),
    current_user: Dict[str, Any] = Depends(get_current_token_payload),
    service: ExportService = Depends(get_export_service),
):
    return await service.list_exports(session_id)


@router.delete(
    "/exports/{export_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete temporary export file immediately",
)
async def delete_export(
    export_id: str,
    current_user: Dict[str, Any] = Depends(get_current_token_payload),
    service: ExportService = Depends(get_export_service),
):
    await service.delete_export(export_id)
    return None
