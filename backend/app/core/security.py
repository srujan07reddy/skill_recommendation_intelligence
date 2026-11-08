"""
SSIP Security Utilities
ACCESS_CONTROL.md §4, SECURITY_ARCHITECTURE.md §5, ADR-003
Provides robust bcrypt password hashing and JWT token generation/validation.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
import bcrypt
from jose import jwt, JWTError
from app.core.config import settings
from app.core.exceptions import UnauthorizedException


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    plain_bytes = plain_password.encode("utf-8")[:72]
    hashed_bytes = hashed_password.encode("utf-8")
    try:
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate a secure bcrypt password hash."""
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def create_access_token(
    user_id: str,
    username: str,
    full_name: str,
    roles: List[str],
    department_id: Optional[str] = None,
    school_id: Optional[str] = None,
    school_code: Optional[str] = None,
    must_change_password: bool = False,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Generate a signed JWT token containing user identity, role, and institutional scope claims.
    ACCESS_CONTROL.md §4.1
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(user_id),
        "username": username,
        "full_name": full_name,
        "roles": roles,
        "department_id": str(department_id) if department_id else None,
        "school_id": str(school_id) if school_id else None,
        "school_code": school_code,
        "must_change_password": must_change_password,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT access token.
    Raises UnauthorizedException on expired or malformed token.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: Optional[str] = payload.get("sub")
        if user_id is None:
            raise UnauthorizedException("Token missing subject claim")
        return payload
    except JWTError as e:
        raise UnauthorizedException(f"Invalid or expired token: {str(e)}")
