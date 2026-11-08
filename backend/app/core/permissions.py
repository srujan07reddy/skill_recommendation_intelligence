"""
SSIP Role-Based Access Control (RBAC) & Scope Enforcement
ACCESS_CONTROL.md §5, §7, SECURITY_ARCHITECTURE.md §6
"""
from typing import Any, Callable, Dict, List, Optional
import uuid
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.core.security import decode_access_token
from app.storage.persistent.database import get_db
from app.storage.persistent.models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=False
)


async def get_current_token_payload(token: Optional[str] = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """Extract and validate JWT token claims from Authorization header."""
    if not token:
        raise UnauthorizedException("Authentication token missing")
    return decode_access_token(token)


async def get_current_user(
    payload: Dict[str, Any] = Depends(get_current_token_payload),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Load the full active User record associated with the token."""
    user_id_str = payload.get("sub")
    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise UnauthorizedException("Invalid user ID in token")

    query = select(User).where(User.user_id == user_uuid, User.account_status == "Active")
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise UnauthorizedException("User account not found or disabled")

    return user


def require_roles(allowed_roles: List[str]) -> Callable:
    """
    Dependency factory enforcing that the authenticated user possesses
    at least one of the specified roles.
    Example: Depends(require_roles(["Dean", "Administrator"]))
    """
    async def role_checker(payload: Dict[str, Any] = Depends(get_current_token_payload)) -> Dict[str, Any]:
        user_roles: List[str] = payload.get("roles", [])
        # Case-insensitive role comparison
        allowed_normalized = [r.lower() for r in allowed_roles]
        user_normalized = [r.lower() for r in user_roles]

        if not any(r in allowed_normalized for r in user_normalized):
            raise ForbiddenException(
                f"Access denied. Requires one of roles: {', '.join(allowed_roles)}"
            )
        return payload

    return role_checker


def check_department_scope(
    requested_dept_id: uuid.UUID,
    payload: Dict[str, Any]
) -> None:
    """
    Enforces department scoping rules:
    - Administrator & Dean: Institutional scope (all departments permitted).
    - HOD: Scoped strictly to their assigned department_id.
    - Others: Denied.
    """
    user_roles: List[str] = [r.lower() for r in payload.get("roles", [])]
    
    # Deans and Admins have institutional cross-department access
    if "dean" in user_roles or "administrator" in user_roles:
        return

    # HOD is strictly department-scoped
    if "hod" in user_roles:
        user_dept_id = payload.get("department_id")
        if not user_dept_id or str(requested_dept_id) != str(user_dept_id):
            raise ForbiddenException(
                "Access denied. HOD role is restricted to assigned department."
            )
        return

    raise ForbiddenException("Access denied. No department viewing authority.")

