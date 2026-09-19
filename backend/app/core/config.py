from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "NoteRecall"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "default-insecure-secret-key-replace-in-production-12345"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Database
    DATABASE_URL: str = "sqlite:///./data/noterecall.db"

    # Vector Store
    VECTOR_STORE_TYPE: str = "chroma"
    VECTOR_STORE_PATH: str = "./data/chroma_db"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # LLM Provider
    LLM_PROVIDER: str = "openai"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.2

    # SM-2 Spaced Repetition Parameters
    SM2_DEFAULT_EASE_FACTOR: float = 2.5
    SM2_MIN_EASE_FACTOR: float = 1.3

    # Worker Settings
    ASYNC_WORKER_CONCURRENCY: int = 2

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
