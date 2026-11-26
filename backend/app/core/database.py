from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings
from backend.app.models.db_models import Base

# SQLite configuration requires check_same_thread=False for multi-threaded FastAPI access
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Auto-migration for SQLite to guarantee newly added columns exist
    if settings.DATABASE_URL.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                inspector = inspect(engine)
                existing_cols = {c["name"] for c in inspector.get_columns("analysis_reports")}
                if "owner_token" not in existing_cols:
                    conn.execute(text("ALTER TABLE analysis_reports ADD COLUMN owner_token VARCHAR(64)"))
                if "is_public" not in existing_cols:
                    conn.execute(text("ALTER TABLE analysis_reports ADD COLUMN is_public BOOLEAN DEFAULT 1"))
                conn.commit()
        except Exception:
            pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
