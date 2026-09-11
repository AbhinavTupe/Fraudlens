from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ===========================
    # Database
    # ===========================
    DATABASE_URL: str

    # ===========================
    # Security
    # ===========================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int

    # ===========================
    # Backend
    # ===========================
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = Field(default=8000, validation_alias=AliasChoices("BACKEND_PORT", "PORT"))

    # ===========================
    # Frontend
    # ===========================
    FRONTEND_URL: str

    # ===========================
    # Machine Learning
    # ===========================
    MODEL_PATH: str
    FRAUD_THRESHOLD: float = 0.50

    # ===========================
    # Uploads
    # ===========================
    UPLOAD_DIRECTORY: str

    # ===========================
    # Logging
    # ===========================
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()