"""
SSIP Bulk Upload & Ingestion Schemas
API_DOCUMENTATION.md §12, VALIDATION_RULES.md §7
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class RowValidationError(BaseModel):
    row_index: int
    column: str
    value: Optional[str] = None
    severity: str # ERROR or WARNING
    message: str


class ValidationReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    upload_id: str
    filename: str
    validation_status: str # VALID, INVALID, WARNINGS
    total_rows: int
    valid_rows_count: int
    error_rows_count: int
    warning_rows_count: int
    errors: List[RowValidationError]
    sample_valid_rows: List[Dict[str, Any]]


class UploadConfirmResponse(BaseModel):
    session_id: str
    upload_id: str
    committed_records_count: int
    status: str
    message: str

