"""
SSIP Export Schemas
EXPORT_ARCHITECTURE.md §4, §5, §15, API_DOCUMENTATION.md §20, ADR-004, ADR-005
"""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class ExportMode(str, Enum):
    REPORTS_ONLY = "REPORTS_ONLY"
    COMPLETE_ANALYSIS = "COMPLETE_ANALYSIS"


class ExportFormat(str, Enum):
    PDF = "PDF"
    XLSX = "XLSX"
    CSV = "CSV"
    ZIP = "ZIP"


class ExportCreateRequest(BaseModel):
    export_mode: ExportMode = Field(default=ExportMode.REPORTS_ONLY)
    format: ExportFormat = Field(default=ExportFormat.PDF)
    department_id: Optional[str] = Field(default=None, description="Scope export to specific department if set")
    include_original_upload: bool = Field(
        default=False,
        description="ADR-005: Raw original uploads strictly excluded by default to protect student privacy."
    )
    include_identifiable_data: bool = Field(
        default=False,
        description="Zero-Retention: Never package identifiable student records."
    )
    analysis_revision: int = Field(default=1, ge=1)


class ExportMetadataResponse(BaseModel):
    export_id: str
    session_id: str
    session_name: str
    export_mode: str
    format: str
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    filename: str
    file_size_bytes: int
    sha256_hash: str
    download_url: str
    download_token: str
    created_at: str
    expires_at: str
    status: str = "COMPLETED"

