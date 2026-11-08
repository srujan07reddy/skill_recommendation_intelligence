"""
SSIP Authentication & Authorization Schemas
API_DOCUMENTATION.md §6.2, §6.3
"""
from typing import List, Optional
import uuid
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class LoginRequest(BaseModel):
    username: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Account password")


class UserSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    username: str
    email: str
    full_name: str
    roles: List[str]
    department_id: Optional[uuid.UUID] = None
    department_name: Optional[str] = None
    school_name: Optional[str] = None
    must_change_password: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserSummaryResponse


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=8, description="Minimum 8 characters with numbers and symbols")


class MessageResponse(BaseModel):
    success: bool = True
    message: str
