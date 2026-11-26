import os
import json
import secrets
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, field_validator

class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True, env_file=".env", extra="allow")
    
    PROJECT_NAME: str = "TrustLens"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1")
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY") or secrets.token_hex(32)
    SITE_URL: str = os.getenv("SITE_URL", "http://localhost:3000")
    
    # Safe explicit CORS origins (no wildcard '*')
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustlens.db")
    RATE_LIMIT_DEFAULT: str = os.getenv("RATE_LIMIT_DEFAULT", "60/minute")
    RATE_LIMIT_ANALYZE: str = os.getenv("RATE_LIMIT_ANALYZE", "20/minute")
    RATE_LIMIT_UPLOAD: str = os.getenv("RATE_LIMIT_UPLOAD", "10/minute")
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    
    TRUSTED_PROXIES: List[str] = ["127.0.0.1", "::1"]
    ENABLE_DOCS: bool = os.getenv("ENABLE_DOCS", "true").lower() in ("true", "1")
    
    # Optional External Service Integrations
    GOOGLE_PLACES_API_KEY: str = os.getenv("GOOGLE_PLACES_API_KEY", "")
    YELP_API_KEY: str = os.getenv("YELP_API_KEY", "")
    SCRAPERAPI_KEY: str = os.getenv("SCRAPERAPI_KEY", "")
    APIFY_API_KEY: str = os.getenv("APIFY_API_KEY", "")
    
    # Base and Model Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH: str = os.path.join(BASE_DIR, "..", "models", "fake_review_model.joblib")
    MANIFEST_PATH: str = os.path.join(BASE_DIR, "..", "models", "model_manifest.json")
    DATA_DIR: str = os.path.join(BASE_DIR, "..", "data")

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, str) and v.startswith("["):
            try:
                parsed = json.loads(v)
                return [i for i in parsed if i != "*"]
            except Exception:
                return ["http://localhost:3000", "http://127.0.0.1:3000"]
        elif isinstance(v, list):
            return [i for i in v if i != "*"]
        return ["http://localhost:3000", "http://127.0.0.1:3000"]

    def validate_production_settings(self):
        """Enforces strict fail-fast validation in production mode."""
        if self.ENVIRONMENT.lower() == "production":
            if len(self.SECRET_KEY) < 32:
                raise ValueError("CRITICAL SECURITY VIOLATION: A high-entropy SECRET_KEY (min 32 chars) must be configured in production!")
            if "*" in self.CORS_ORIGINS:
                raise ValueError("CRITICAL SECURITY VIOLATION: Wildcard '*' in CORS_ORIGINS is forbidden in production!")

settings = Settings()
settings.validate_production_settings()
