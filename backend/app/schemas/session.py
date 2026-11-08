"""
SSIP Assessment Session Schemas
API_DOCUMENTATION.md §10, SESSION_MANAGEMENT.md §6
"""
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SessionCreateRequest(BaseModel):
    session_name: str = Field(..., min_length=3, max_length=150, description="Descriptive session title")
    session_type: str = Field("COMBINED", description="FORM_COLLECTION, BULK_UPLOAD, or COMBINED")
    department_id: Optional[str] = Field(None, description="Scoped department ID or code, if not institutional")
    academic_year: str = Field("2026-2027", description="Current academic year")
    expiry_hours: int = Field(24, ge=1, le=168, description="Session TTL in hours (max 168 / 7 days)")


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    session_id: str
    session_name: str
    session_type: str
    status: str # Created, Scheduled, Active, Processing, Completed, Closed, Expired, Cleaning, Cleaned, Failed
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    academic_year: str
    created_at: str
    expiry_time: str
    record_count: int = 0
    student_count: int = 0


class SessionStatusResponse(BaseModel):
    session_id: str
    status: str
    record_count: int
    student_count: int
    created_at: str
    expiry_time: str

