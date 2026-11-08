"""
SSIP API v1 Router
Aggregates all API module routers under /api/v1.
"""
from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    auth,
    sessions,
    uploads,
    assessments,
    analysis,
    benchmarks,
    recommendations,
    governance,
    exports,
    admin,
)

api_router = APIRouter()

# Core System Health
api_router.include_router(health.router, tags=["System Health"])

# Authentication & Identity
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Identity"])

# Assessment Sessions Lifecycle
api_router.include_router(sessions.router)

# Bulk Uploads & Ingestion
api_router.include_router(uploads.router)

# Student Self-Assessment Forms
api_router.include_router(assessments.router)

# Skill Analysis & Cohort Aggregation
api_router.include_router(analysis.router)

# Curriculum Benchmarks & Approval (ADR-008)
api_router.include_router(benchmarks.router)

# Institutional Event Recommendations
api_router.include_router(recommendations.router)

# Ephemeral Governance Proposals (ADR-002)
api_router.include_router(governance.router)

# Exports & Analysis Packages (ADR-004, ADR-005)
api_router.include_router(exports.router)

# Administration, Academic Structure & Telemetry
api_router.include_router(admin.router)

