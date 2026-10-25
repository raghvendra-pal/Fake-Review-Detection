from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.utils.sample_data import SAMPLE_DATASETS, get_demo_dataset
from backend.app.api.routes_analyze import run_pipeline

router = APIRouter(tags=["Demos"])

@router.get("/demos")
def list_demos():
    """
    Returns available pre-bundled offline demonstration datasets.
    """
    return [
        {
            "id": key,
            "title": data["title"],
            "description": data["description"],
            "review_count": len(data["reviews"])
        }
        for key, data in SAMPLE_DATASETS.items()
    ]

@router.get("/demo/{name}")
def run_demo(name: str, db: Session = Depends(get_db)):
    """
    Runs full pipeline on bundled demo dataset for offline demonstration.
    """
    data = get_demo_dataset(name)
    report = run_pipeline(
        reviews_input=data["reviews"],
        target_title=data["title"],
        target_url=f"https://demo.trustlens.internal/{name}",
        source_type="demo",
        db=db
    )
    report["success"] = True
    report["demo_description"] = data.get("description", "")
    return report
