"""
Student Skill Intelligence Platform (SSIP) — FastAPI Backend
Main Application Entrypoint
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import (
    SSIPException,
    ssip_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.api.v1.router import api_router
from app.storage.session_factory import get_session_store
from app.modules.session_cleanup.cleanup_worker import get_cleanup_worker
from app.core.security_headers import SecurityHeadersMiddleware, RateLimitMiddleware

# Initialize structured logging with zero-retention filter
logger = setup_logging(debug=settings.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start session cleanup background worker (ADR-004, TASK-08-01)
    store = get_session_store()
    worker = get_cleanup_worker(store)
    worker.start()
    yield
    # Shutdown: Stop cleanup worker
    worker.stop()


# Create FastAPI application instance
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Stateless, session-based skill intelligence platform for Jeppiaar University.",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Security Headers & Rate Limiting (TASK-09-04)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, max_requests_per_minute=500)

# Register centralized exception handlers
app.add_exception_handler(SSIPException, ssip_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", summary="Root Status")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_PREFIX}/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

