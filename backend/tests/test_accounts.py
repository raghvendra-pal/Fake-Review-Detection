import pytest
from backend.app.engine.accounts import (
    extract_username_stem, cluster_similar_usernames,
    detect_duplicate_reviews, compute_account_risk_cards
)

def test_extract_username_stem():
    base, suffix, flagged = extract_username_stem("alex_8821")
    assert base == "alex_"
    assert suffix == "8821"
    assert flagged is True
    
    base2, suffix2, flagged2 = extract_username_stem("normaluser")
    assert suffix2 == ""

def test_cluster_similar_usernames():
    names = ["bot_user_01", "bot_user_02", "bot_user_03", "alice_smith", "alice_smithe"]
    clusters = cluster_similar_usernames(names)
    
    assert clusters["bot_user_01"]["is_pattern_flagged"] is True
    assert clusters["bot_user_02"]["cluster_id"] == clusters["bot_user_01"]["cluster_id"]

def test_detect_duplicate_reviews():
    revs = [
        {"reviewer_name": "user_a", "review_text": "This is a great product, works as advertised, fast shipping."},
        {"reviewer_name": "user_b", "review_text": "This is a great product, works as advertised, fast shipping."},
        {"reviewer_name": "user_c", "review_text": "Completely unique and different perspective on the device."}
    ]
    cross_dups, intra_dups = detect_duplicate_reviews(revs)
    assert len(cross_dups) == 1
    assert cross_dups[0]["reviewer_1"] in ("user_a", "user_b")
    assert cross_dups[0]["similarity"] >= 95.0
