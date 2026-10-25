from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List
import os

class Settings(BaseSettings):
    model_config = ConfigDict(case_sensitive=True, env_file=".env", extra="allow")
    
    PROJECT_NAME: str = "TrustLens"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "trustlens-dev-secret-key-change-in-production-12345")
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"
    ]
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./trustlens.db")
    RATE_LIMIT_DEFAULT: str = "60/minute"
    RATE_LIMIT_ANALYZE: str = "20/minute"
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH: str = os.path.join(BASE_DIR, "..", "models", "fake_review_model.joblib")
    MANIFEST_PATH: str = os.path.join(BASE_DIR, "..", "models", "model_manifest.json")
    DATA_DIR: str = os.path.join(BASE_DIR, "..", "data")

settings = Settings()
