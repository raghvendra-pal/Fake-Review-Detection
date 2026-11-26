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
    assert "uncertain" in results[0]
    assert "human_review_recommended" in results[0]

def test_classifier_abstention_and_calibration():
    clf = FakeReviewClassifier.get_instance()
    # Boundary / ambiguous review
    res = clf.predict_single("Average product. Works fine.")
    assert "uncertain" in res
    assert "human_review_recommended" in res
    if 42.0 <= res["fake_probability"] <= 58.0:
        assert res["uncertain"] is True
        assert res["human_review_recommended"] is True
    else:
        assert res["uncertain"] is False

def test_classifier_deterministic_scoring():
    clf = FakeReviewClassifier.get_instance()
    text = "Solid keyboard with tactile keys. Recommended for office use."
    run1 = clf.predict_single(text)
    run2 = clf.predict_single(text)
    assert run1["fake_probability"] == run2["fake_probability"]
    assert run1["token_attributions"] == run2["token_attributions"]
