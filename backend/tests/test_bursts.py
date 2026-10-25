import pytest
from backend.app.engine.bursts import detect_time_series_bursts, analyze_rating_distribution

def test_time_series_burst_detection():
    # 25 reviews on 2026-10-15 vs 1 review on other days
    reviews = []
    for _ in range(25):
        reviews.append({"date": "2026-10-15", "rating": 5.0})
    for d in ["2026-10-10", "2026-10-11", "2026-10-12"]:
        reviews.append({"date": d, "rating": 4.0})
        
    timeline, bursts, penalty = detect_time_series_bursts(reviews)
    assert bursts >= 1
    assert penalty > 0

def test_rating_distribution_j_curve():
    # 30 5-star reviews and 0 lower reviews
    reviews = [{"rating": 5.0} for _ in range(30)]
    res = analyze_rating_distribution(reviews)
    assert res["j_curve_detected"] is True
    assert res["distribution_penalty"] > 0
