import io
import csv
import json
import secrets
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.models.db_models import AnalysisReport, ReviewRecord
from backend.app.models.schemas import (
    AnalyzeUrlRequest, AnalyzeReviewsRequest, AnalysisReportResponse
)
from backend.app.scrapers.generic_scraper import scrape_reviews_from_url
from backend.app.engine.classifier import FakeReviewClassifier
from backend.app.engine.linguistic import evaluate_linguistic_signals
from backend.app.engine.accounts import (
    cluster_similar_usernames, detect_duplicate_reviews, compute_account_risk_cards
)
from backend.app.engine.bursts import detect_time_series_bursts, analyze_rating_distribution
from backend.app.engine.graph import build_reviewer_network_graph
from backend.app.engine.synthesizer import synthesize_forensic_report

router = APIRouter(tags=["Analysis"])

def run_pipeline(
    reviews_input: List[Dict[str, Any]],
    target_title: str,
    target_url: str = None,
    source_type: str = "raw_text",
    db: Session = None
) -> Dict[str, Any]:
    """
    Executes the entire TrustLens forensic pipeline and persists report to DB.
    """
    if not reviews_input:
        raise HTTPException(status_code=400, detail="Cannot run analysis on empty review set.")
        
    clf = FakeReviewClassifier.get_instance()
    texts = [r.get("review_text", "") for r in reviews_input]
    
    # 1. ML Classification & Attribution
    ml_results = clf.predict_batch(texts)
    
    # 2. Linguistic & Behavioral Signals
    linguistic_results = []
    for r in reviews_input:
        ling = evaluate_linguistic_signals(
            r.get("review_text", ""),
            rating=float(r.get("rating", 5.0)),
            product_title=target_title
        )
        linguistic_results.append(ling)
        
    # 3. Account Intelligence & Duplicate Detection
    reviewer_names = [r.get("reviewer_name", "Anonymous") for r in reviews_input]
    username_clusters = cluster_similar_usernames(reviewer_names)
    cross_dups, intra_dups = detect_duplicate_reviews(reviews_input)
    account_cards = compute_account_risk_cards(reviews_input, username_clusters, cross_dups, intra_dups)
    
    # 4. Spam Bursts & Rating Distribution Anomaly
    burst_timeline, burst_windows, burst_penalty = detect_time_series_bursts(reviews_input)
    dist_analysis = analyze_rating_distribution(reviews_input)
    
    # 5. Network Graph & Coordinated Ring Detection
    network_graph = build_reviewer_network_graph(
        account_cards, cross_dups, username_clusters, burst_timeline
    )
    
    # 6. Multi-Factor Synthesis
    report_dict = synthesize_forensic_report(
        reviews_input=reviews_input,
        ml_results=ml_results,
        linguistic_results=linguistic_results,
        account_cards=account_cards,
        burst_timeline=burst_timeline,
        burst_windows=burst_windows,
        burst_penalty=burst_penalty,
        distribution_analysis=dist_analysis,
        network_graph=network_graph
    )
    
    # 7. Persist to Database if session provided
    report_id = None
    if db is not None:
        owner_tok = secrets.token_hex(16)
        db_report = AnalysisReport(
            target_url=target_url,
            target_title=target_title,
            source_type=source_type,
            trust_score=report_dict["trust_score"],
            verdict=report_dict["verdict"],
            fake_probability=report_dict["fake_probability"],
            total_reviews=report_dict["total_reviews"],
            flagged_reviews=report_dict["flagged_reviews_count"],
            metrics_summary=report_dict["metrics_summary"],
            network_graph=network_graph,
            owner_token=owner_tok,
            is_public=True
        )
        db.add(db_report)
        db.flush()
        report_id = db_report.id
        
        # Save individual review records
        for fr in report_dict["forensic_reviews"]:
            db_review = ReviewRecord(
                report_id=report_id,
                reviewer_name=fr["reviewer_name"],
                reviewer_id=fr["reviewer_id"],
                review_text=fr["review_text"],
                rating=fr["rating"],
                review_date=fr["review_date"],
                helpful_votes=fr["helpful_votes"],
                verified_purchase=fr["verified_purchase"],
                fake_probability=fr["fake_probability"],
                is_flagged=fr["is_flagged"],
                linguistic_flags=fr["linguistic_flags"],
                top_suspicious_words=fr["top_suspicious_words"],
                account_cluster_id=fr["account_cluster_id"],
                account_risk_score=fr["account_risk_score"]
            )
            db.add(db_review)
            
        db.commit()
        db.refresh(db_report)
        report_id = db_report.id

    return {
        "id": report_id or "adhoc_report",
        "target_url": target_url,
        "target_title": target_title,
        "source_type": source_type,
        "trust_score": report_dict["trust_score"],
        "verdict": report_dict["verdict"],
        "fake_probability": report_dict["fake_probability"],
        "total_reviews": report_dict["total_reviews"],
        "flagged_reviews": report_dict["flagged_reviews_count"],
        "metrics_summary": report_dict["metrics_summary"],
        "network_graph": network_graph,
        "owner_token": db_report.owner_token if db is not None else None,
        "reviews": report_dict["forensic_reviews"],
        "accounts": account_cards
    }

@router.post("/analyze-url")
async def analyze_url(req: AnalyzeUrlRequest, db: Session = Depends(get_db)):
    """
    Scrapes product or review URL and runs full forensic pipeline.
    If scraping is blocked by anti-bot protections, returns graceful fallback payload.
    """
    scrape_res = await scrape_reviews_from_url(req.url)
    
    if not scrape_res.get("success"):
        # Return graceful fallback payload
        return {
            "success": False,
            "is_blocked": scrape_res.get("is_blocked", False),
            "status_code": scrape_res.get("status_code", 400),
            "error_code": scrape_res.get("error_code", "SCRAPER_ERROR"),
            "platform": scrape_res.get("platform", "generic"),
            "target_url": req.url,
            "title": scrape_res.get("title", "Target Listing"),
            "message": scrape_res.get("message", "Scraping was blocked by anti-bot verification or no reviews could be extracted."),
            "fallback_options": scrape_res.get("fallback_options", ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"]),
            "suggested_demo": "ecommerce-burst"
        }
        
    reviews = scrape_res.get("reviews", [])
    if not reviews:
        raise HTTPException(status_code=400, detail="No reviews could be extracted from page.")
        
    title = scrape_res.get("title") or "Scraped Review Target"
    report = run_pipeline(
        reviews_input=reviews,
        target_title=title,
        target_url=req.url,
        source_type="url",
        db=db
    )
    report["success"] = True
    return report

@router.post("/analyze-reviews")
def analyze_reviews(req: AnalyzeReviewsRequest, db: Session = Depends(get_db)):
    """
    Analyzes an array of raw review objects.
    """
    reviews = [r.model_dump() for r in req.reviews]
    report = run_pipeline(
        reviews_input=reviews,
        target_title=req.title or "Direct Review Dataset",
        source_type="raw_text",
        db=db
    )
    report["success"] = True
    return report

@router.post("/analyze-file")
async def analyze_file(
    file: UploadFile = File(...),
    title: str = Form(None),
    db: Session = Depends(get_db)
):
    """
    Parses CSV, XLSX, or JSON files and runs the full forensic pipeline.
    """
    filename = file.filename.lower()
    content = await file.read()
    
    # Security: File upload size limit enforcement
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Uploaded file exceeds maximum size limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024 * 1024)}MB."
        )
    
    reviews = []
    raw_rows = []
    
    try:
        if filename.endswith(".csv"):
            text_data = content.decode("utf-8", errors="replace")
            reader = csv.DictReader(io.StringIO(text_data))
            raw_rows = [row for row in reader if any(row.values())]
        elif filename.endswith((".xlsx", ".xls")):
            # Security: Validate ZIP/OOXML magic bytes for modern spreadsheet containers
            if not content.startswith(b"PK\x03\x04"):
                raise HTTPException(status_code=400, detail="Invalid Excel spreadsheet binary format.")
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
            ws = wb.active
            rows_iter = ws.iter_rows(values_only=True)
            header_row = next(rows_iter, None)
            if header_row:
                headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(header_row)]
                for r in rows_iter:
                    if any(val is not None for val in r):
                        row_dict = {headers[i]: r[i] for i in range(min(len(headers), len(r)))}
                        raw_rows.append(row_dict)
        elif filename.endswith(".json"):
            json_data = json.loads(content.decode("utf-8", errors="replace"))
            if isinstance(json_data, dict):
                raw_rows = json_data.get("reviews", [json_data])
            elif isinstance(json_data, list):
                raw_rows = json_data
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV, XLSX, or JSON.")
            
        if not raw_rows:
            raise HTTPException(status_code=400, detail="Uploaded file contains no data rows.")
            
        # Normalize column names
        sample_keys = list(raw_rows[0].keys())
        cols = {str(c).lower().strip().replace(" ", "_"): c for c in sample_keys}
        
        # Identify text column
        text_col = None
        for candidate in ["review_text", "text", "body", "review", "comment", "content", "review_body"]:
            if candidate in cols:
                text_col = cols[candidate]
                break
        if not text_col:
            raise HTTPException(status_code=400, detail="Could not find a review text column (e.g. 'review_text', 'text', 'comment') in file.")
            
        # Identify name column
        name_col = None
        for candidate in ["reviewer_name", "author", "user", "username", "name", "customer_name"]:
            if candidate in cols:
                name_col = cols[candidate]
                break
                
        # Identify rating column
        rating_col = None
        for candidate in ["rating", "stars", "score", "star_rating"]:
            if candidate in cols:
                rating_col = cols[candidate]
                break
                
        # Identify date column
        date_col = None
        for candidate in ["date", "review_date", "created_at", "timestamp", "posted_at"]:
            if candidate in cols:
                date_col = cols[candidate]
                break
                
        # Identify verified column
        verif_col = None
        for candidate in ["verified_purchase", "verified", "is_verified"]:
            if candidate in cols:
                verif_col = cols[candidate]
                break

        for row in raw_rows:
            raw_t = row.get(text_col)
            t_val = str(raw_t).strip() if raw_t is not None else ""
            if len(t_val) < 3 or t_val.lower() in ("nan", "none", "null"):
                continue
                
            raw_u = row.get(name_col) if name_col else None
            u_val = str(raw_u).strip() if raw_u is not None and str(raw_u).lower() not in ("nan", "none", "null") else "Anonymous"
            
            r_val = 5.0
            if rating_col and row.get(rating_col) is not None:
                try:
                    r_val = float(row[rating_col])
                except Exception:
                    r_val = 5.0
                    
            raw_d = row.get(date_col) if date_col else None
            d_val = str(raw_d).strip() if raw_d is not None and str(raw_d).lower() not in ("nan", "none", "null") else "Recent"
            
            raw_v = row.get(verif_col) if verif_col else False
            if isinstance(raw_v, str):
                v_val = raw_v.strip().lower() in ("true", "1", "yes", "verified")
            else:
                v_val = bool(raw_v)
            
            reviews.append({
                "reviewer_name": u_val,
                "review_text": t_val,
                "rating": r_val,
                "date": d_val,
                "verified_purchase": v_val
            })
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")
        
    if not reviews:
        raise HTTPException(status_code=400, detail="No valid review records could be parsed from file.")
        
    dataset_title = title or f"Dataset: {file.filename}"
    report = run_pipeline(
        reviews_input=reviews,
        target_title=dataset_title,
        source_type="file_upload",
        db=db
    )
    report["success"] = True
    return report
