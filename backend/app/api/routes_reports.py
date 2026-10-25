import io
import csv
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.db_models import AnalysisReport, ReviewRecord
from backend.app.utils.pdf_exporter import generate_pdf_report

router = APIRouter(tags=["Reports"])

@router.get("/reports")
def list_reports(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Retrieves historical analysis reports ordered by newest first.
    """
    query = db.query(AnalysisReport).order_by(AnalysisReport.created_at.desc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "reports": [
            {
                "id": r.id,
                "target_title": r.target_title,
                "target_url": r.target_url,
                "source_type": r.source_type,
                "trust_score": r.trust_score,
                "verdict": r.verdict,
                "fake_probability": r.fake_probability,
                "total_reviews": r.total_reviews,
                "flagged_reviews": r.flagged_reviews,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in items
        ]
    }

@router.get("/report/{report_id}")
def get_report(report_id: str, db: Session = Depends(get_db)):
    """
    Retrieves a full forensic report by ID including reviews and network graph.
    """
    report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
        
    reviews = db.query(ReviewRecord).filter(ReviewRecord.report_id == report_id).all()
    
    report_dict = report.to_dict()
    report_dict["reviews"] = [r.to_dict() for r in reviews]
    
    # Reconstruct account cards from reviews
    accounts_map = {}
    for r in report_dict["reviews"]:
        uname = r["reviewer_name"]
        if uname not in accounts_map:
            accounts_map[uname] = {
                "reviewer_name": uname,
                "reviewer_id": r["reviewer_id"],
                "total_reviews": 0,
                "ratings": [],
                "cluster_id": r.get("account_cluster_id"),
                "account_risk_score": r.get("account_risk_score", 0.0),
                "reviews_count": 0
            }
        accounts_map[uname]["total_reviews"] += 1
        accounts_map[uname]["ratings"].append(r["rating"])
        
    cards = []
    for uname, acc in accounts_map.items():
        ratings = acc["ratings"]
        avg_r = sum(ratings) / max(1, len(ratings))
        five_stars = sum(1 for x in ratings if x >= 4.8)
        cards.append({
            "reviewer_name": uname,
            "reviewer_id": acc["reviewer_id"],
            "total_reviews": acc["total_reviews"],
            "average_rating": round(avg_r, 2),
            "five_star_ratio": round((five_stars / max(1, len(ratings))) * 100, 1),
            "rating_variance": 0.0,
            "cluster_id": acc["cluster_id"],
            "pattern_flag": "Bot Suffix Pattern" if acc["cluster_id"] else None,
            "account_risk_score": acc["account_risk_score"]
        })
    cards.sort(key=lambda c: c["account_risk_score"], reverse=True)
    report_dict["accounts"] = cards
    
    return report_dict

@router.get("/report/{report_id}/export")
def export_report(
    report_id: str,
    format: str = Query("json", pattern="^(pdf|csv|json)$"),
    db: Session = Depends(get_db)
):
    """
    Exports report in PDF, CSV, or JSON format.
    """
    report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
        
    reviews = db.query(ReviewRecord).filter(ReviewRecord.report_id == report_id).all()
    report_dict = report.to_dict()
    report_dict["reviews"] = [r.to_dict() for r in reviews]
    
    if format == "json":
        return JSONResponse(
            content=report_dict,
            headers={"Content-Disposition": f"attachment; filename=trustlens-report-{report_id}.json"}
        )
        
    elif format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Reviewer Name", "Rating", "Review Date", "Verified Purchase",
            "Fake Probability (%)", "Is Flagged", "Flags", "Review Text"
        ])
        for r in report_dict["reviews"]:
            writer.writerow([
                r["reviewer_name"],
                r["rating"],
                r["review_date"],
                "Yes" if r["verified_purchase"] else "No",
                r["fake_probability"],
                "FLAGGED" if r["is_flagged"] else "OK",
                "; ".join(r.get("linguistic_flags", [])),
                r["review_text"]
            ])
            
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=trustlens-reviews-{report_id}.csv"}
        )
        
    elif format == "pdf":
        pdf_buffer = generate_pdf_report(report_dict)
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=trustlens-report-{report_id}.pdf"}
        )
