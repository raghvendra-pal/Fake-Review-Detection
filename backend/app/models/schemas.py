from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import List, Optional, Dict, Any

# ==========================================
# Input Schemas
# ==========================================

class AnalyzeUrlRequest(BaseModel):
    url: str = Field(..., description="Target product or review page URL", min_length=4, max_length=2048)

    @field_validator("url")
    @classmethod
    def validate_scheme(cls, v: str) -> str:
        s = v.strip().lower()
        if not (s.startswith("http://") or s.startswith("https://")):
            raise ValueError("Only 'http://' and 'https://' URLs are supported.")
        return v.strip()

class ReviewInputItem(BaseModel):
    reviewer_name: Optional[str] = Field("Anonymous", description="Username or display name of reviewer", max_length=128)
    reviewer_id: Optional[str] = Field(None, description="Unique account identifier if available", max_length=128)
    review_text: str = Field(..., description="Full text of the review", min_length=1, max_length=25000)
    rating: Optional[float] = Field(5.0, ge=0.5, le=5.0, description="Star rating from 1 to 5")
    date: Optional[str] = Field(None, description="ISO or human readable date string", max_length=64)
    helpful_votes: Optional[int] = Field(0, ge=0, le=1000000, description="Number of helpful votes")
    verified_purchase: Optional[bool] = Field(False, description="Verified buyer status")

class AnalyzeReviewsRequest(BaseModel):
    title: Optional[str] = Field("Custom Review Dataset", description="Listing or business title", max_length=512)
    reviews: List[ReviewInputItem] = Field(..., min_length=1, max_length=10000, description="Array of review objects")

class QuickCheckRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=25000, description="Single review text to evaluate")
    rating: Optional[float] = Field(5.0, ge=1.0, le=5.0, description="Optional rating for mismatch test")

class CompareTargetItem(BaseModel):
    title: str = Field(..., description="Item or store name", max_length=256)
    url: Optional[str] = Field(None, description="Optional product URL", max_length=2048)
    reviews: List[ReviewInputItem] = Field(..., min_length=1, max_length=2000, description="Reviews for this target")

class CompareRequest(BaseModel):
    targets: List[CompareTargetItem] = Field(..., min_length=2, max_length=5, description="2 to 5 targets to compare")

class ArticleCheckRequest(BaseModel):
    url: Optional[str] = Field(None, description="URL of the news article", max_length=2048)
    text: Optional[str] = Field(None, description="Raw text of the article headline and body", max_length=50000)

    @field_validator("url")
    @classmethod
    def validate_article_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            s = v.strip().lower()
            if not (s.startswith("http://") or s.startswith("https://")):
                raise ValueError("Article URL must use http:// or https://")
            return v.strip()
        return v

# ==========================================
# Output Schemas
# ==========================================

class TokenAttribution(BaseModel):
    word: str
    weight: float
    type: str  # 'suspicious' or 'authentic'

class ReviewForensicResult(BaseModel):
    id: str
    reviewer_name: str
    reviewer_id: str
    review_text: str
    rating: float
    review_date: Optional[str] = None
    helpful_votes: int = 0
    verified_purchase: bool = False
    fake_probability: float
    is_flagged: bool
    linguistic_flags: List[str] = []
    top_suspicious_words: List[TokenAttribution] = []
    account_cluster_id: Optional[str] = None
    account_risk_score: float = 0.0

class AccountRiskCard(BaseModel):
    reviewer_name: str
    reviewer_id: str
    total_reviews: int
    average_rating: float
    five_star_ratio: float
    rating_variance: float
    cluster_id: Optional[str] = None
    pattern_flag: Optional[str] = None
    account_risk_score: float
    reviews: List[ReviewForensicResult] = []

class NetworkNode(BaseModel):
    id: str
    label: str
    group: int
    val: float  # size
    risk_score: float
    cluster_name: str

class NetworkLink(BaseModel):
    source: str
    target: str
    value: float  # strength
    reason: str

class NetworkGraphData(BaseModel):
    nodes: List[NetworkNode] = []
    links: List[NetworkLink] = []
    rings_detected: int = 0

class MetricsSummary(BaseModel):
    rating_distribution: Dict[str, int] = {}
    j_curve_detected: bool = False
    burst_windows_detected: int = 0
    account_rings_detected: int = 0
    avg_review_length: float = 0.0
    sentiment_mismatches: int = 0
    ai_generated_ratio: float = 0.0
    verified_purchase_ratio: float = 0.0
    burst_timeline: List[Dict[str, Any]] = []

class AnalysisReportResponse(BaseModel):
    id: str
    target_url: Optional[str] = None
    target_title: str
    source_type: str
    trust_score: float
    verdict: str  # Trustworthy, Suspicious, High Risk
    fake_probability: float
    total_reviews: int
    flagged_reviews: int
    metrics_summary: Dict[str, Any]
    network_graph: Dict[str, Any]
    reviews: List[ReviewForensicResult] = []
    accounts: List[AccountRiskCard] = []
    created_at: Optional[str] = None

class QuickCheckResponse(BaseModel):
    fake_probability: float
    trust_score: float
    verdict: str
    linguistic_flags: List[str]
    readability_score: float
    readability_level: str
    ai_generated_likelihood: float
    sentiment_polarity: float
    token_attributions: List[TokenAttribution]
    explanation: str

class CompareTargetResult(BaseModel):
    title: str
    trust_score: float
    verdict: str
    fake_probability: float
    total_reviews: int
    flagged_reviews: int
    account_rings_detected: int
    burst_windows_detected: int
    key_strengths: List[str]
    key_warnings: List[str]

class CompareResponse(BaseModel):
    comparison_id: str
    targets: List[CompareTargetResult]
    winner_title: str
    summary_verdict: str

class ArticleCheckResponse(BaseModel):
    id: str
    url: Optional[str] = None
    title: str
    credibility_score: float
    clickbait_score: float
    sensationalism_score: float
    domain_reputation: str
    domain_name: Optional[str] = None
    flagged_phrases: List[Dict[str, Any]] = []
    verdict: str
    key_takeaways: List[str]
    created_at: Optional[str] = None
