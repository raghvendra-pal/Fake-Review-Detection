import pytest
from backend.app.engine.linguistic import (
    calculate_readability, estimate_sentiment_polarity,
    estimate_ai_likelihood, evaluate_linguistic_signals
)

def test_readability_calculation():
    easy_text = "The cat sat on the mat. It was a good cat."
    score, level = calculate_readability(easy_text)
    assert score >= 70.0
    
    complex_text = "The epistemological underpinnings of contemporaneous phenomenological hermeneutics necessitate rigorous contextualization."
    c_score, c_level = calculate_readability(complex_text)
    assert c_score < score

def test_sentiment_polarity():
    pos = estimate_sentiment_polarity("This is great, amazing, fantastic, love it!")
    assert pos > 0.4
    
    neg = estimate_sentiment_polarity("Horrible, broken, garbage, terrible, defective product!")
    assert neg < -0.4

def test_linguistic_flags_superlatives():
    text = "Best purchase ever! Changed my life, miracle product, flawless perfection!"
    res = evaluate_linguistic_signals(text, rating=5.0)
    assert "Excessive Superlatives" in res["flags"]
    assert res["linguistic_risk_score"] > 20.0

def test_sentiment_rating_mismatch():
    text = "Horrible waste of money, broke on day one, terrible garbage."
    res = evaluate_linguistic_signals(text, rating=5.0)
    assert any("Mismatch" in f for f in res["flags"])
