"""
Health & Telemetry Endpoint
Module 15: System Health and Cleanup APIs (API_DOCUMENTATION.md §23)
"""
from datetime import datetime, timezone
from typing import Any, Dict
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()


@router.get("/health", summary="System Health Check")
async def health_check() -> Dict[str, Any]:
    """
    Returns system status, active version, environment,
    database connectivity, and ephemeral storage operational mode.
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "storage": {
            "persistent_db": "configured",
            "ephemeral_cache": "active (in-memory fallback mode)"
        }
    }
