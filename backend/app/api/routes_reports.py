import io
import csv
import json
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.db_models import AnalysisReport, ReviewRecord
from backend.app.utils.pdf_exporter import generate_pdf_report

router = APIRouter(tags=["Reports"])

def sanitize_spreadsheet_cell(val: Any) -> Any:
    """
    Prevents CSV / Formula Injection vulnerabilities (CWE-1236).
    Escapes dangerous leading characters (=, +, -, @, tab, CR) by prefixing with a single quote.
    """
    if isinstance(val, str) and val:
        if val[0] in ("=", "+", "-", "@", "\t", "\r"):
            return f"'{val}"
    return val

@router.get("/reports")
def list_reports(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    owner_token: Optional[str] = Query(None, description="Optional owner token to filter reports created by caller"),
    db: Session = Depends(get_db)
):
    """
    Retrieves historical analysis reports ordered by newest first.
    Filters by owner_token if provided to prevent cross-tenant data exposure.
    """
    limit_val = limit if isinstance(limit, int) else 20
    offset_val = offset if isinstance(offset, int) else 0
    
    query = db.query(AnalysisReport)
    if isinstance(owner_token, str) and owner_token.strip():
        query = query.filter(AnalysisReport.owner_token == owner_token)
    else:
        query = query.filter(AnalysisReport.is_public == True)
        
    query = query.order_by(AnalysisReport.created_at.desc())
    total = query.count()
    items = query.offset(offset_val).limit(limit_val).all()
    
    return {
        "total": total,
        "limit": limit_val,
        "offset": offset_val,
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
def get_report(
    report_id: str,
    token: Optional[str] = Query(None),
    x_report_token: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Retrieves a full forensic report by ID including reviews and network graph.
    Enforces object-level authorization for private reports.
    """
    report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
        
    # Object-level authorization check for private reports
    if not report.is_public:
        auth_token = token if isinstance(token, str) else (x_report_token if isinstance(x_report_token, str) else None)
        if not auth_token or auth_token != report.owner_token:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: This report is private. A valid owner token is required to view it."
            )
        
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

@router.delete("/report/{report_id}")
def delete_report(
    report_id: str,
    token: Optional[str] = Query(None),
    x_report_token: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Deletes an analysis report.
    Enforces strict object-level authorization (IDOR defense) requiring owner token.
    """
    report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
        
    auth_token = token if isinstance(token, str) else (x_report_token if isinstance(x_report_token, str) else None)
    if not auth_token or auth_token != report.owner_token:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Valid owner token required to delete this report."
        )
        
    db.delete(report)
    db.commit()
    return {"success": True, "message": f"Report {report_id} successfully deleted."}

@router.get("/report/{report_id}/export")
def export_report(
    report_id: str,
    format: str = Query("json", pattern="^(pdf|csv|json)$"),
    token: Optional[str] = Query(None),
    x_report_token: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Exports report in PDF, CSV, or JSON format.
    Includes CSV injection sanitization and object-level authorization checks.
    """
    report = db.query(AnalysisReport).filter(AnalysisReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Analysis report not found.")
        
    if not report.is_public:
        auth_token = token if isinstance(token, str) else (x_report_token if isinstance(x_report_token, str) else None)
        if not auth_token or auth_token != report.owner_token:
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Valid owner token required to export private report."
            )
        
    reviews = db.query(ReviewRecord).filter(ReviewRecord.report_id == report_id).all()
    report_dict = report.to_dict()
    report_dict["reviews"] = [r.to_dict() for r in reviews]
    
    fmt = format if isinstance(format, str) else "json"
    if fmt == "json":
        return JSONResponse(
            content=report_dict,
            headers={"Content-Disposition": f"attachment; filename=trustlens-report-{report_id}.json"}
        )
        
    elif fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Reviewer Name", "Rating", "Review Date", "Verified Purchase",
            "Fake Probability (%)", "Is Flagged", "Flags", "Review Text"
        ])
        for r in report_dict["reviews"]:
            # CSV Injection Sanitization: escape formula triggers
            writer.writerow([
                sanitize_spreadsheet_cell(r["reviewer_name"]),
                sanitize_spreadsheet_cell(r["rating"]),
                sanitize_spreadsheet_cell(r["review_date"]),
                "Yes" if r["verified_purchase"] else "No",
                sanitize_spreadsheet_cell(r["fake_probability"]),
                "FLAGGED" if r["is_flagged"] else "OK",
                sanitize_spreadsheet_cell("; ".join(r.get("linguistic_flags", []))),
                sanitize_spreadsheet_cell(r["review_text"])
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
