import uuid
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.models.db_models import ArticleCheck
from backend.app.models.schemas import (
    QuickCheckRequest, QuickCheckResponse,
    CompareRequest, CompareResponse, CompareTargetResult,
    ArticleCheckRequest, ArticleCheckResponse
)
from backend.app.engine.classifier import FakeReviewClassifier
from backend.app.engine.linguistic import evaluate_linguistic_signals
from backend.app.engine.article_credibility import analyze_article_credibility
from backend.app.api.routes_analyze import run_pipeline

router = APIRouter(tags=["Tools"])

@router.post("/quick-check", response_model=QuickCheckResponse)
def quick_check(req: QuickCheckRequest):
    """
    Evaluates a single review text instantly with token-level feature attribution and linguistic checks.
    """
    text = req.text.strip()
    if len(text) < 3:
        raise HTTPException(status_code=400, detail="Text must be at least 3 characters long.")
        
    clf = FakeReviewClassifier.get_instance()
    ml_res = clf.predict_single(text)
    ling_res = evaluate_linguistic_signals(text, rating=req.rating or 5.0)
    
    ml_prob = ml_res["fake_probability"]
    ling_risk = ling_res["linguistic_risk_score"]
    
    # Combined single review fake probability
    combined_prob = round(min(100.0, (ml_prob * 0.55) + (ling_risk * 0.45)), 1)
    trust_score = round(max(0.0, min(100.0, 100.0 - combined_prob)), 1)
    
    if trust_score >= 75.0:
        verdict = "Likely Authentic"
    elif trust_score >= 45.0:
        verdict = "Suspicious / Inconclusive"
    else:
        verdict = "High Deception Likelihood"
        
    # Build human explanation
    reasons = []
    if ml_prob >= 60.0:
        reasons.append("ML classifier identified deceptive promotional phrasing patterns.")
    if ling_res.get("flags"):
        reasons.append(f"Triggered linguistic rules: {', '.join(ling_res['flags'])}.")
    if ling_res.get("ai_generated_likelihood", 0) >= 0.65:
        reasons.append("High probability of machine-generated or LLM-templated prose.")
    if not reasons:
        reasons.append("Natural syntax, balanced phrasing, and authentic lexical distribution.")
        
    explanation = " ".join(reasons)
    
    return {
        "fake_probability": combined_prob,
        "trust_score": trust_score,
        "verdict": verdict,
        "linguistic_flags": ling_res.get("flags", []),
        "readability_score": ling_res.get("flesch_reading_score", 70.0),
        "readability_level": ling_res.get("reading_level", "Standard"),
        "ai_generated_likelihood": ling_res.get("ai_generated_likelihood", 0.0),
        "sentiment_polarity": ling_res.get("sentiment_polarity", 0.0),
        "token_attributions": ml_res.get("token_attributions", []),
        "explanation": explanation
    }

@router.post("/compare", response_model=CompareResponse)
def compare_targets(req: CompareRequest):
    """
    Compares 2 to 5 review sets side-by-side and determines the most trustworthy option.
    """
    target_results = []
    
    for t in req.targets:
        reviews = [r.model_dump() for r in t.reviews]
        rep = run_pipeline(
            reviews_input=reviews,
            target_title=t.title,
            target_url=t.url,
            source_type="compare",
            db=None
        )
        
        summary = rep["metrics_summary"]
        target_results.append(
            CompareTargetResult(
                title=t.title,
                trust_score=rep["trust_score"],
                verdict=rep["verdict"],
                fake_probability=rep["fake_probability"],
                total_reviews=rep["total_reviews"],
                flagged_reviews=rep["flagged_reviews"],
                account_rings_detected=summary.get("account_rings_detected", 0),
                burst_windows_detected=summary.get("burst_windows_detected", 0),
                key_strengths=summary.get("positive_indicators", []),
                key_warnings=summary.get("key_warnings", [])
            )
        )
        
    # Sort to find winner (highest trust score)
    sorted_targets = sorted(target_results, key=lambda x: x.trust_score, reverse=True)
    winner = sorted_targets[0]
    
    delta = winner.trust_score - sorted_targets[-1].trust_score
    if delta > 15:
        summary_verdict = f"'{winner.title}' demonstrates significantly higher consumer authenticity (+{round(delta, 1)} pts higher trust score)."
    else:
        summary_verdict = f"'{winner.title}' edges out slightly, though both listings show comparable profile metrics."
        
    return {
        "comparison_id": str(uuid.uuid4()),
        "targets": target_results,
        "winner_title": winner.title,
        "summary_verdict": summary_verdict
    }

@router.post("/article-check", response_model=ArticleCheckResponse)
def article_check(req: ArticleCheckRequest, db: Session = Depends(get_db)):
    """
    Evaluates news article headline/body text or URL for credibility, sensationalism, and clickbait.
    """
    if not req.text and not req.url:
        raise HTTPException(status_code=400, detail="Must provide either article URL or text content.")
        
    text = req.text or ""
    res = analyze_article_credibility(text=text, url=req.url, title=None)
    
    db_check = ArticleCheck(
        url=req.url,
        title=res["title"],
        content=text[:5000],
        credibility_score=res["credibility_score"],
        clickbait_score=res["clickbait_score"],
        sensationalism_score=res["sensationalism_score"],
        domain_reputation=res["domain_reputation"],
        domain_name=res["domain_name"],
        flagged_phrases=res["flagged_phrases"],
        verdict=res["verdict"]
    )
    db.add(db_check)
    db.commit()
    db.refresh(db_check)
    
    return {
        "id": db_check.id,
        "url": db_check.url,
        "title": db_check.title,
        "credibility_score": db_check.credibility_score,
        "clickbait_score": db_check.clickbait_score,
        "sensationalism_score": db_check.sensationalism_score,
        "domain_reputation": db_check.domain_reputation,
        "domain_name": db_check.domain_name,
        "flagged_phrases": res["flagged_phrases"],
        "verdict": db_check.verdict,
        "key_takeaways": res["key_takeaways"],
        "created_at": db_check.created_at.isoformat() if db_check.created_at else None
    }
