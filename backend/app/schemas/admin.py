"""
SSIP Institutional Hierarchy & Account Provisioning Schemas
Supports:
- Administrator: Creating Schools, Departments under Schools, and Dean credentials per School.
- Dean: Creating HOD email IDs & login credentials for Departments under their assigned School.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class SchoolCreateRequest(BaseModel):
    school_code: str = Field(..., min_length=2, max_length=50, description="e.g. SCH-LAW")
    school_name: str = Field(..., min_length=3, max_length=200, description="e.g. School of Law")
    description: Optional[str] = None


class DepartmentCreateRequest(BaseModel):
    school_id: str = Field(..., description="Parent School UUID or school_code")
    department_code: str = Field(..., min_length=2, max_length=50, description="e.g. DEPT-AI")
    department_name: str = Field(..., min_length=3, max_length=200, description="e.g. Artificial Intelligence & Data Science")
    program_code: Optional[str] = Field(None, description="Optional initial degree program code (e.g. PRG-SET-AI)")
    program_name: Optional[str] = Field(None, description="Optional initial degree program name")
    qualification: Optional[str] = Field("B.Tech", description="Degree qualification (e.g. B.Tech, B.Sc)")


class DeanCreateRequest(BaseModel):
    school_id: str = Field(..., description="Assigned School UUID or school_code (One Dean per School)")
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr = Field(..., description="Dean institutional email (can be used for login)")
    username: Optional[str] = Field(None, min_length=3, max_length=100, description="Optional login username; defaults from email")
    password: str = Field(..., min_length=8, description="Login password (minimum 8 characters)")
    must_change_password: bool = Field(False, description="Force password rotation on first login")
    replace_existing: bool = Field(False, description="Deactivate previous Dean role for this school if one exists")


class HodCreateRequest(BaseModel):
    department_id: str = Field(..., description="Target Department UUID or department_code within Dean's school")
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr = Field(..., description="HOD institutional email (can be used for login)")
    username: Optional[str] = Field(None, min_length=3, max_length=100, description="Optional login username; defaults from email")
    password: str = Field(..., min_length=8, description="Login password (minimum 8 characters)")
    must_change_password: bool = Field(False, description="Force password rotation on first login")


class StaffCredentialResponse(BaseModel):
    user_id: str
    full_name: str
    email: str
    username: str
    role: str
    school_id: Optional[str] = None
    school_code: Optional[str] = None
    school_name: Optional[str] = None
    department_id: Optional[str] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    account_status: str
    must_change_password: bool


class UserStatusUpdateRequest(BaseModel):
    account_status: str = Field(..., pattern="^(Active|Disabled)$")


class ResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8)
    must_change_password: bool = False


class DeanUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    school_id: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    account_status: Optional[str] = Field(None, pattern="^(Active|Disabled)$")
    must_change_password: Optional[bool] = None
    replace_existing: bool = False


class HodUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=200)
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    department_id: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)
    account_status: Optional[str] = Field(None, pattern="^(Active|Disabled)$")
    must_change_password: Optional[bool] = None

