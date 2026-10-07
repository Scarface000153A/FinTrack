from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "Finance Tracker API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database settings
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/finance_tracker"

    # Security settings
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS settings - read from env var or use defaults
    @property
    def BACKEND_CORS_ORIGINS(self):
        origins_env = os.environ.get("BACKEND_CORS_ORIGINS", "")
        if origins_env:
            return [origin.strip() for origin in origins_env.split(",")]
        # Default origins for development
        return ["http://localhost:3000", "http://localhost:8080"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()