"""
SSIP Backend Configuration
Manages application settings loaded from environment variables and .env files.
"""
import os
from pathlib import Path
from typing import Any, List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_SQLITE_PATH = (BACKEND_DIR / "ssip_dev.db").as_posix()


class Settings(BaseSettings):
    # Application Info
    APP_NAME: str = "Student Skill Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_debug(cls, v: Any) -> bool:
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "debug", "dev", "development")
        return bool(v)
    
    # Security
    SECRET_KEY: str = "dev_secret_change_in_production_min_32_chars_long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Persistent Storage (PostgreSQL for persistent entities, SQLite for dev fallback)
    DATABASE_URL: str = f"sqlite+aiosqlite:///{DEFAULT_SQLITE_PATH}"
    POSTGRES_USER: str = "ssip_user"
    POSTGRES_PASSWORD: str = "ssip_secret_dev"
    POSTGRES_DB: str = "ssip_db"
    POSTGRES_PORT: int = 5432

    # Ephemeral Storage (Redis with In-Memory fallback)
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_PORT: int = 6379
    SESSION_DEFAULT_TTL_HOURS: int = 24
    SESSION_MAX_TTL_HOURS: int = 168

    # Ingestion & Uploads
    MAX_UPLOAD_SIZE_MB: int = 25
    ALLOWED_UPLOAD_EXTENSIONS: str = "xlsx,csv"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

