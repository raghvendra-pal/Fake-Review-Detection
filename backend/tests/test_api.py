import pytest
from backend.main import health_check
from backend.app.core.database import SessionLocal, init_db
from backend.app.models.schemas import (
    QuickCheckRequest, AnalyzeReviewsRequest, ReviewInputItem,
    CompareRequest, CompareTargetItem, ArticleCheckRequest
)
from backend.app.api.routes_tools import quick_check, compare_targets, article_check
from backend.app.api.routes_analyze import analyze_reviews
from backend.app.api.routes_demo import list_demos, run_demo
from backend.app.api.routes_reports import list_reports, export_report

@pytest.fixture(scope="module")
def db_session():
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_health_endpoint():
    data = health_check()
    assert data["status"] == "operational"
    assert data["model_loaded"] is True
    assert data["service"] == "TrustLens"
    assert data["vocabulary_size"] > 0

def test_quick_check_endpoint():
    req = QuickCheckRequest(
        text="Best product ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!",
        rating=5.0
    )
    res = quick_check(req)
    assert res["fake_probability"] >= 50.0
    assert len(res["token_attributions"]) > 0
    assert "readability_score" in res
    assert "explanation" in res

def test_analyze_reviews_endpoint(db_session):
    req = AnalyzeReviewsRequest(
        title="Test Wireless Headset",
        reviews=[
            ReviewInputItem(reviewer_name="mark_01", review_text="Item arrived on time. Works great thanks seller.", rating=5.0),
            ReviewInputItem(reviewer_name="mark_02", review_text="Item arrived on time. Works great thanks seller.", rating=5.0),
            ReviewInputItem(reviewer_name="real_user", review_text="Good sound quality but plastic headband feels somewhat cheap.", rating=4.0)
        ]
    )
    res = analyze_reviews(req, db=db_session)
    assert res["success"] is True
    assert "trust_score" in res
    assert "network_graph" in res
    assert len(res["reviews"]) == 3
    assert res["total_reviews"] == 3

def test_demo_endpoint(db_session):
    res = run_demo("ecommerce-burst", db=db_session)
    assert res["success"] is True
    assert res["total_reviews"] > 10
    assert res["trust_score"] < 50.0  # Should be flagged as high risk

def test_list_demos():
    demos = list_demos()
    assert len(demos) >= 3
    demo_ids = [d["id"] for d in demos]
    assert "ecommerce-burst" in demo_ids
    assert "organic-app" in demo_ids

def test_compare_endpoint():
    req = CompareRequest(
        targets=[
            CompareTargetItem(
                title="Product Alpha (Bot Ring)",
                reviews=[
                    ReviewInputItem(reviewer_name="bot_1", review_text="Best product ever! Changed my life completely!", rating=5.0),
                    ReviewInputItem(reviewer_name="bot_2", review_text="Best product ever! Changed my life completely!", rating=5.0)
                ]
            ),
            CompareTargetItem(
                title="Product Beta (Organic)",
                reviews=[
                    ReviewInputItem(reviewer_name="user_1", review_text="Solid keyboard. Keycaps feel nice though cable is short.", rating=4.0),
                    ReviewInputItem(reviewer_name="user_2", review_text="Works as expected. Battery lasts about 3 days.", rating=4.0)
                ]
            )
        ]
    )
    res = compare_targets(req)
    assert "winner_title" in res
    assert len(res["targets"]) == 2
    assert res["winner_title"] == "Product Beta (Organic)"

def test_article_check_endpoint(db_session):
    req = ArticleCheckRequest(
        text="SHOCKING BOMBSHELL: You won't believe what doctors discovered in this miraculous secret cure!",
        url="https://example.com/clickbait-article"
    )
    res = article_check(req, db=db_session)
    assert res["clickbait_score"] > 20.0
    assert res["credibility_score"] < 80.0
    assert "verdict" in res

def test_list_reports(db_session):
    res = list_reports(limit=10, offset=0, db=db_session)
    assert "reports" in res
    assert res["total"] >= 1

def test_export_report_formats(db_session):
    # Fetch first report from DB
    rep_list = list_reports(limit=1, offset=0, db=db_session)
    report_id = rep_list["reports"][0]["id"]
    
    # Test JSON export
    json_resp = export_report(report_id, format="json", db=db_session)
    assert json_resp.status_code == 200
    
    # Test CSV export
    csv_resp = export_report(report_id, format="csv", db=db_session)
    assert csv_resp.media_type == "text/csv"
    
    # Test PDF export
    pdf_resp = export_report(report_id, format="pdf", db=db_session)
    assert pdf_resp.media_type == "application/pdf"
