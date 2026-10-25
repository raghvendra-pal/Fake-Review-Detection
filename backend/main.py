import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.engine.classifier import FakeReviewClassifier
from backend.app.api.routes_analyze import router as analyze_router
from backend.app.api.routes_reports import router as reports_router
from backend.app.api.routes_tools import router as tools_router
from backend.app.api.routes_demo import router as demo_router

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_DEFAULT])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and warm up ML model
    print("[TrustLens] Initializing database...")
    init_db()
    print("[TrustLens] Warming up classifier model...")
    clf = FakeReviewClassifier.get_instance()
    if not clf.is_loaded:
        print("[TrustLens] Model not yet trained or loaded. Training fallback baseline...")
        try:
            from backend.scripts.train import train_and_evaluate
            data_file = os.path.join(settings.BASE_DIR, "..", "data", "synthetic_reviews.csv")
            train_and_evaluate(data_file, settings.MODEL_PATH, settings.MANIFEST_PATH)
            clf.load_model()
        except Exception as e:
            print(f"[TrustLens] Could not auto-train: {e}")
            
    print("[TrustLens] System ready.")
    yield
    print("[TrustLens] Shutting down.")

app = FastAPI(
    title="TrustLens API",
    version="1.0.0",
    description="Enterprise-grade Forensic Fake Review & Spam Campaign Detection Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Attach Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(analyze_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(tools_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["System"])
def health_check():
    clf = FakeReviewClassifier.get_instance()
    return {
        "status": "operational",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "model_loaded": clf.is_loaded,
        "vocabulary_size": len(clf.vectorizer.vocabulary_) if clf.is_loaded and clf.vectorizer else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
