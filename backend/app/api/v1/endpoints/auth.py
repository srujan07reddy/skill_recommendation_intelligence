"""
SSIP Authentication API Endpoints
API_DOCUMENTATION.md §6.2, §6.3, ADR-003
"""
from typing import Any, List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ValidationException
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.permissions import get_current_user, get_current_token_payload
from app.storage.persistent.database import get_db
from app.storage.persistent.models.user import User, UserRole, Role
from app.storage.persistent.models.academic import Department, School
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserSummaryResponse,
    ChangePasswordRequest,
    MessageResponse
)

router = APIRouter()


async def _build_user_summary(user: User, db: AsyncSession) -> UserSummaryResponse:
    """Helper to assemble UserSummaryResponse with role names, department and school."""
    # Load user roles with role model
    query = (
        select(UserRole)
        .where(UserRole.user_id == user.user_id, UserRole.is_active == True)
        .options(selectinload(UserRole.role))
    )
    result = await db.execute(query)
    user_roles = result.scalars().all()

    role_names: List[str] = [ur.role.role_name for ur in user_roles if ur.role]
    department_id = None
    department_name = None
    school_id = None
    school_code = None
    school_name = None

    # Check for school or department scope from assigned roles
    for ur in user_roles:
        if ur.school_id:
            school_id = ur.school_id
            sch_res = await db.execute(select(School).where(School.school_id == ur.school_id))
            sch = sch_res.scalar_one_or_none()
            if sch:
                school_code = sch.school_code
                school_name = sch.school_name

        if ur.department_id:
            department_id = ur.department_id
            dept_query = select(Department).where(Department.department_id == ur.department_id).options(selectinload(Department.school))
            dept_res = await db.execute(dept_query)
            dept = dept_res.scalar_one_or_none()
            if dept:
                department_name = dept.department_name
                if dept.school:
                    if not school_id:
                        school_id = dept.school.school_id
                        school_code = dept.school.school_code
                        school_name = dept.school.school_name

    return UserSummaryResponse(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        roles=role_names,
        department_id=department_id,
        department_name=department_name,
        school_id=school_id,
        school_code=school_code,
        school_name=school_name,
        must_change_password=user.must_change_password
    )


@router.post("/login", response_model=TokenResponse, summary="Sign in with credentials")
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    """
    Authenticate user via username or email and return signed JWT token.
    API_DOCUMENTATION.md §6.2
    """
    identifier = credentials.username.strip()
    query = (
        select(User)
        .where(
            or_(
                func.lower(User.username) == identifier.lower(),
                func.lower(User.email) == identifier.lower(),
            )
        )
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise UnauthorizedException("Invalid username or password")

    if user.account_status != "Active":
        raise UnauthorizedException(f"Account is currently {user.account_status}. Please contact administrator.")

    summary = await _build_user_summary(user, db)

    access_token = create_access_token(
        user_id=str(user.user_id),
        username=user.username,
        full_name=user.full_name,
        roles=summary.roles,
        department_id=str(summary.department_id) if summary.department_id else None,
        school_id=str(summary.school_id) if summary.school_id else None,
        school_code=summary.school_code,
        must_change_password=user.must_change_password
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=summary
    )


@router.get("/me", response_model=UserSummaryResponse, summary="Get current user profile")
async def get_current_user_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> UserSummaryResponse:
    """Returns the authenticated user's current identity, assigned roles, and scopes."""
    return await _build_user_summary(user, db)


@router.post("/change-password", response_model=MessageResponse, summary="Update account password")
async def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """
    Change user password and clear must_change_password flag.
    ADR-003
    """
    if not verify_password(data.current_password, user.password_hash):
        raise ValidationException("Current password verification failed")

    if data.new_password == data.current_password:
        raise ValidationException("New password cannot be identical to current password")

    user.password_hash = get_password_hash(data.new_password)
    user.must_change_password = False
    await db.commit()

    return MessageResponse(success=True, message="Password updated successfully")


@router.post("/logout", response_model=MessageResponse, summary="Sign out")
async def logout(_: Any = Depends(get_current_token_payload)) -> MessageResponse:
    """
    Client-side invalidation. Returns confirmation that session should be cleared.
    """
    return MessageResponse(success=True, message="Logged out successfully")

