from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    app_name: str = "Safety Companion API"
    debug: bool = False

    # Database - Neon (consolidated)
    database_url: str

    # Supabase removed - V2 uses SQLAlchemy only

    # External APIs (REQUIRED)
    gemini_api_key: str

    # External APIs (OPTIONAL)
    google_maps_api_key: str | None = None
    anthropic_api_key: str | None = None  # Optional - for when LLC account is ready

    # Security
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5000"]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore"
    )

@lru_cache
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()