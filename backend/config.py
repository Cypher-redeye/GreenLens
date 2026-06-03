from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Neon PostgreSQL connection string
    # Format: postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
    # Get this from: https://console.neon.tech -> your project -> Connection Details
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/greenlens"
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    GEMINI_API_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = ""
    CORS_ORIGIN: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    settings = Settings()
    if settings.ENVIRONMENT.lower() == "production" and settings.SECRET_KEY == "your-super-secret-key-change-this-in-production":
        raise ValueError("FATAL: SECRET_KEY is not set for production! You must set a secure SECRET_KEY environment variable.")
    return settings
