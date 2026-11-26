import os
import sys

# Ensure both current directory and parent directory are on sys.path
_cur_dir = os.path.dirname(os.path.abspath(__file__))
_parent_dir = os.path.dirname(_cur_dir)
if _parent_dir not in sys.path:
    sys.path.insert(0, _parent_dir)
if _cur_dir not in sys.path:
    sys.path.insert(0, _cur_dir)

import uuid
import logging
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from backend.app.core.config import settings
from backend.app.core.database import init_db, SessionLocal
from backend.app.engine.classifier import FakeReviewClassifier
from backend.app.api.routes_analyze import router as analyze_router
from backend.app.api.routes_reports import router as reports_router
from backend.app.api.routes_tools import router as tools_router
from backend.app.api.routes_demo import router as demo_router

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] [req:%(name)s] %(message)s"
)
logger = logging.getLogger("trustlens")

def get_client_ip(request: Request) -> str:
    """
    Resolves client IP securely behind trusted reverse proxies (CWE-345).
    Evaluates X-Forwarded-For ONLY if immediate connection is from a trusted proxy.
    """
    client_host = request.client.host if request.client else "127.0.0.1"
    if client_host in settings.TRUSTED_PROXIES:
        x_forwarded = request.headers.get("X-Forwarded-For")
        if x_forwarded:
            return x_forwarded.split(",")[0].strip()
    return client_host

limiter = Limiter(key_func=get_client_ip, default_limits=[settings.RATE_LIMIT_DEFAULT])

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and warm up ML model
    logger.info("[TrustLens] Initializing database tables...")
    init_db()
    logger.info("[TrustLens] Warming up classifier model and verifying artifact checksum...")
    clf = FakeReviewClassifier.get_instance()
    if not clf.is_loaded:
        logger.warning("[TrustLens] Model not loaded. Ensuring fallback initialization...")
        clf.load_model()
    logger.info("[TrustLens] System ready.")
    yield
    logger.info("[TrustLens] Shutting down.")

# Gate API documentation in production mode unless explicitly enabled
is_prod = settings.ENVIRONMENT.lower() == "production"
docs_url = "/docs" if (not is_prod or settings.ENABLE_DOCS) else None
redoc_url = "/redoc" if (not is_prod or settings.ENABLE_DOCS) else None
openapi_url = "/openapi.json" if (not is_prod or settings.ENABLE_DOCS) else None

app = FastAPI(
    title="TrustLens API",
    version="1.0.0",
    description="Forensic Fake Review & Spam Campaign Detection Platform API",
    docs_url=docs_url,
    redoc_url=redoc_url,
    openapi_url=openapi_url,
    lifespan=lifespan
)

# Attach Rate Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 1. Security Headers & Correlation ID Middleware
@app.middleware("http")
async def security_and_tracing_middleware(request: Request, call_next: Callable):
    # Correlation ID
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id
    
    # Request body size cap enforcement (10MB)
    content_length = request.headers.get("Content-Length")
    if content_length and int(content_length) > settings.MAX_UPLOAD_SIZE_BYTES:
        return JSONResponse(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            content={
                "error": {
                    "code": "PAYLOAD_TOO_LARGE",
                    "message": f"Request body exceeds {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB limit.",
                    "request_id": request_id
                }
            },
            headers={"X-Request-ID": request_id}
        )
        
    response = await call_next(request)
    
    # Security Headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    
    return response

# 2. Global Unhandled Exception Handler (Zero Stack Trace Leak in Production)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    logger.error(f"[Unhandled Server Error] req_id={req_id} path={request.url.path} error={str(exc)}", exc_info=True)
    
    detail_msg = str(exc) if (settings.DEBUG or not is_prod) else "An unexpected internal server error occurred. Please contact support with the request ID."
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": detail_msg,
                "request_id": req_id
            }
        },
        headers={"X-Request-ID": req_id}
    )

# 3. CORS Configuration (Explicit Origins + Vercel Deployment Regex, No Wildcards with Credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Report-Token", "X-Request-ID"],
    expose_headers=["X-Request-ID", "Content-Disposition"]
)

# 4. Include Routers
app.include_router(analyze_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(tools_router, prefix=settings.API_V1_STR)
app.include_router(demo_router, prefix=settings.API_V1_STR)

# 5. Enhanced Health Check Endpoint
@app.get("/api/health", tags=["System"])
def health_check():
    clf = FakeReviewClassifier.get_instance()
    db_status = "connected"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "degraded"
        
    return {
        "status": "operational" if db_status == "connected" else "degraded",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "model_loaded": clf.is_loaded,
        "model_verified": clf.is_loaded,
        "vocabulary_size": len(clf.vectorizer.vocabulary_) if clf.is_loaded and clf.vectorizer else 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
