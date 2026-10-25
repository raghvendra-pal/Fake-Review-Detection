import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def get_utc_now():
    return datetime.now(timezone.utc)

class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    target_url = Column(String(2048), nullable=True)
    target_title = Column(String(512), default="Review Analysis Target")
    source_type = Column(String(64), default="url")  # url, raw_text, file_upload, demo
    trust_score = Column(Float, nullable=False, default=100.0)  # 0 to 100
    verdict = Column(String(64), nullable=False, default="Trustworthy")  # Trustworthy, Suspicious, High Risk
    fake_probability = Column(Float, nullable=False, default=0.0)  # 0 to 100%
    total_reviews = Column(Integer, default=0)
    flagged_reviews = Column(Integer, default=0)
    
    # Structured analytics JSON blobs
    metrics_summary = Column(JSON, default=dict)
    # Includes:
    # {
    #   "rating_distribution": {"1": count, "2": count, ...},
    #   "j_curve_detected": bool,
    #   "burst_windows_detected": int,
    #   "account_rings_detected": int,
    #   "avg_review_length": float,
    #   "sentiment_mismatches": int,
    #   "ai_generated_ratio": float,
    #   "verified_purchase_ratio": float
    # }
    
    network_graph = Column(JSON, default=dict)  # nodes, links, rings
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    reviews = relationship("ReviewRecord", back_populates="report", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "target_url": self.target_url,
            "target_title": self.target_title,
            "source_type": self.source_type,
            "trust_score": round(self.trust_score, 1),
            "verdict": self.verdict,
            "fake_probability": round(self.fake_probability, 1),
            "total_reviews": self.total_reviews,
            "flagged_reviews": self.flagged_reviews,
            "metrics_summary": self.metrics_summary,
            "network_graph": self.network_graph,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class ReviewRecord(Base):
    __tablename__ = "review_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("analysis_reports.id", ondelete="CASCADE"), nullable=False)
    
    reviewer_name = Column(String(256), default="Anonymous")
    reviewer_id = Column(String(128), default="anon")
    review_text = Column(Text, nullable=False)
    rating = Column(Float, default=5.0)
    review_date = Column(String(64), nullable=True)
    helpful_votes = Column(Integer, default=0)
    verified_purchase = Column(Boolean, default=False)
    
    # Forensic metrics
    fake_probability = Column(Float, default=0.0)  # 0 to 100%
    is_flagged = Column(Boolean, default=False)
    linguistic_flags = Column(JSON, default=list)  # ["Excessive Superlatives", "Sentiment Mismatch", ...]
    top_suspicious_words = Column(JSON, default=list)  # [{"word": "miracle", "weight": 0.42, "type": "suspicious"}, ...]
    account_cluster_id = Column(String(64), nullable=True)
    account_risk_score = Column(Float, default=0.0)

    # Relationship
    report = relationship("AnalysisReport", back_populates="reviews")

    def to_dict(self):
        return {
            "id": self.id,
            "report_id": self.report_id,
            "reviewer_name": self.reviewer_name,
            "reviewer_id": self.reviewer_id,
            "review_text": self.review_text,
            "rating": self.rating,
            "review_date": self.review_date,
            "helpful_votes": self.helpful_votes,
            "verified_purchase": self.verified_purchase,
            "fake_probability": round(self.fake_probability, 1),
            "is_flagged": self.is_flagged,
            "linguistic_flags": self.linguistic_flags or [],
            "top_suspicious_words": self.top_suspicious_words or [],
            "account_cluster_id": self.account_cluster_id,
            "account_risk_score": round(self.account_risk_score, 1),
        }

class ArticleCheck(Base):
    __tablename__ = "article_checks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    url = Column(String(2048), nullable=True)
    title = Column(String(512), default="Article")
    content = Column(Text, nullable=False)
    credibility_score = Column(Float, default=50.0)  # 0 to 100 (100 = credible)
    clickbait_score = Column(Float, default=0.0)  # 0 to 100 (100 = heavy clickbait)
    sensationalism_score = Column(Float, default=0.0)  # 0 to 100 (100 = extreme sensationalism)
    domain_reputation = Column(String(64), default="Unknown")  # Trusted, Mixed, Low Trust, Questionable
    domain_name = Column(String(256), nullable=True)
    flagged_phrases = Column(JSON, default=list)
    verdict = Column(String(64), default="Mixed Credibility")
    created_at = Column(DateTime, default=get_utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "title": self.title,
            "credibility_score": round(self.credibility_score, 1),
            "clickbait_score": round(self.clickbait_score, 1),
            "sensationalism_score": round(self.sensationalism_score, 1),
            "domain_reputation": self.domain_reputation,
            "domain_name": self.domain_name,
            "flagged_phrases": self.flagged_phrases or [],
            "verdict": self.verdict,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
