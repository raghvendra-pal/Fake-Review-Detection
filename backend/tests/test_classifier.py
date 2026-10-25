import pytest
from backend.app.engine.classifier import FakeReviewClassifier

def test_classifier_single_prediction():
    clf = FakeReviewClassifier.get_instance()
    assert clf.is_loaded is True
    
    # Deceptive review sample
    fake_text = "Best product ever! Changed my life completely! You must buy this right now! 100% recommend to everyone!"
    res_fake = clf.predict_single(fake_text)
    assert res_fake["fake_probability"] >= 50.0
    assert len(res_fake["token_attributions"]) > 0
    assert any(a["type"] == "suspicious" for a in res_fake["token_attributions"])
    
    # Authentic review sample
    auth_text = "I've been using this keyboard for two weeks. Build quality is fairly decent, though the cable is somewhat short."
    res_auth = clf.predict_single(auth_text)
    assert res_auth["fake_probability"] < 50.0

def test_classifier_batch_prediction():
    clf = FakeReviewClassifier.get_instance()
    texts = [
        "Item arrived on time. Works great thanks seller. Highly recommended to all buyers!",
        "Purchased after reading comparisons. Setup took 10 minutes. Moderate battery life."
    ]
    results = clf.predict_batch(texts)
    assert len(results) == 2
    assert results[0]["fake_probability"] > results[1]["fake_probability"]
