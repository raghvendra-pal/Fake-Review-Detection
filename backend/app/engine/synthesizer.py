from typing import List, Dict, Any, Tuple

def synthesize_forensic_report(
    reviews_input: List[Dict[str, Any]],
    ml_results: List[Dict[str, Any]],
    linguistic_results: List[Dict[str, Any]],
    account_cards: List[Dict[str, Any]],
    burst_timeline: List[Dict[str, Any]],
    burst_windows: int,
    burst_penalty: float,
    distribution_analysis: Dict[str, Any],
    network_graph: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synthesizes multi-factor forensic inputs into an overall Trust Score, Verdict,
    Listing Fake Probability, and consolidated review forensic items.
    """
    total_reviews = len(reviews_input)
    if total_reviews == 0:
        return {
            "trust_score": 100.0,
            "verdict": "Trustworthy",
            "fake_probability": 0.0,
            "flagged_reviews_count": 0,
            "forensic_reviews": [],
            "metrics_summary": {}
        }
        
    forensic_reviews = []
    flagged_count = 0
    total_ml_prob = 0.0
    total_ling_risk = 0.0
    
    # Reviewer name to cluster ID mapping
    uname_to_cluster = {}
    uname_to_risk = {}
    for card in account_cards:
        uname_to_cluster[card["reviewer_name"]] = card.get("cluster_id")
        uname_to_risk[card["reviewer_name"]] = card.get("account_risk_score", 0.0)
        
    for i in range(total_reviews):
        r_raw = reviews_input[i]
        ml = ml_results[i]
        ling = linguistic_results[i]
        
        ml_prob = ml.get("fake_probability", 0.0)
        ling_risk = ling.get("linguistic_risk_score", 0.0)
        u_name = r_raw.get("reviewer_name", "Anonymous")
        acc_risk = uname_to_risk.get(u_name, 0.0)
        
        # Combined per-review fake likelihood
        combined_prob = round(min(100.0, (ml_prob * 0.50) + (ling_risk * 0.35) + (acc_risk * 0.15)), 1)
        is_flagged = combined_prob >= 50.0 or len(ling.get("flags", [])) >= 2 or acc_risk >= 70.0
        
        if is_flagged:
            flagged_count += 1
            
        total_ml_prob += combined_prob
        total_ling_risk += ling_risk
        
        forensic_reviews.append({
            "id": f"rev_{i + 1}",
            "reviewer_name": u_name,
            "reviewer_id": f"usr_{abs(hash(u_name)) % 1000000:06d}",
            "review_text": r_raw.get("review_text", ""),
            "rating": float(r_raw.get("rating", 5.0)),
            "review_date": r_raw.get("date") or r_raw.get("review_date") or "Recent",
            "helpful_votes": int(r_raw.get("helpful_votes", 0)),
            "verified_purchase": bool(r_raw.get("verified_purchase", False)),
            "fake_probability": combined_prob,
            "is_flagged": is_flagged,
            "linguistic_flags": ling.get("flags", []),
            "top_suspicious_words": ml.get("token_attributions", []),
            "account_cluster_id": uname_to_cluster.get(u_name),
            "account_risk_score": acc_risk
        })
        
    avg_fake_prob = round(total_ml_prob / max(1, total_reviews), 1)
    avg_ling_risk = total_ling_risk / max(1, total_reviews)
    
    # Systemic Forensic Deductions
    rings_detected = network_graph.get("rings_detected", 0)
    ring_deduction = min(35.0, rings_detected * 18.0)
    
    burst_deduction = min(25.0, burst_windows * 15.0)
    
    dist_deduction = min(20.0, float(distribution_analysis.get("distribution_penalty", 0.0)))
    
    # Text-level forensic deductions (scaled from 0 to 45)
    text_penalty = (avg_fake_prob * 0.30) + (avg_ling_risk * 0.20)
    
    # Coordinated campaign compound multiplier
    campaign_penalty = 0.0
    if rings_detected >= 1 and (burst_windows >= 1 or distribution_analysis.get("j_curve_detected")):
        campaign_penalty = 12.0  # Coordinated bot farm signature detected
        
    total_penalty = text_penalty + ring_deduction + burst_deduction + dist_deduction + campaign_penalty
    
    trust_score = round(max(0.0, min(100.0, 100.0 - total_penalty)), 1)
    
    if trust_score >= 75.0:
        verdict = "Trustworthy"
    elif trust_score >= 45.0:
        verdict = "Suspicious"
    else:
        verdict = "High Risk"
        
    # Key warnings and positive highlights
    key_warnings = []
    if avg_fake_prob >= 40.0:
        key_warnings.append(f"Elevated overall deceptive review probability ({avg_fake_prob}%).")
    if rings_detected > 0:
        key_warnings.append(f"Identified {rings_detected} coordinated fake review ring(s) posting cross-account duplicate text.")
    if burst_windows > 0:
        key_warnings.append(f"Detected {burst_windows} anomalous review burst spike(s) over short timeframes.")
    if distribution_analysis.get("j_curve_detected"):
        key_warnings.append("Unnatural J-curve rating distribution with extreme 5-star concentration.")
    if distribution_analysis.get("polarization_detected"):
        key_warnings.append("Polarized review distribution indicating possible review brigading.")
        
    positive_indicators = []
    if rings_detected == 0:
        positive_indicators.append("No coordinated bot syndicates or cross-account duplicate rings detected.")
    if burst_windows == 0:
        positive_indicators.append("Organic, evenly distributed review timeline with no spam bursts.")
    if not distribution_analysis.get("j_curve_detected") and not distribution_analysis.get("polarization_detected"):
        positive_indicators.append("Healthy rating variance with realistic moderate feedback.")
        
    # Calculate stats
    ai_count = sum(1 for l in linguistic_results if l.get("ai_generated_likelihood", 0.0) >= 0.65)
    mismatch_count = sum(1 for l in linguistic_results if any("Mismatch" in f for f in l.get("flags", [])))
    verified_count = sum(1 for r in reviews_input if r.get("verified_purchase"))
    avg_length = sum(len(r.get("review_text", "").split()) for r in reviews_input) / max(1, total_reviews)
    
    metrics_summary = {
        "rating_distribution": distribution_analysis.get("distribution", {}),
        "j_curve_detected": distribution_analysis.get("j_curve_detected", False),
        "polarization_detected": distribution_analysis.get("polarization_detected", False),
        "distribution_verdict": distribution_analysis.get("verdict_reason", ""),
        "burst_windows_detected": burst_windows,
        "account_rings_detected": rings_detected,
        "avg_review_length": round(avg_length, 1),
        "sentiment_mismatches": mismatch_count,
        "ai_generated_ratio": round((ai_count / max(1, total_reviews)) * 100, 1),
        "verified_purchase_ratio": round((verified_count / max(1, total_reviews)) * 100, 1),
        "burst_timeline": burst_timeline,
        "key_warnings": key_warnings,
        "positive_indicators": positive_indicators
    }
    
    return {
        "trust_score": trust_score,
        "verdict": verdict,
        "fake_probability": avg_fake_prob,
        "total_reviews": total_reviews,
        "flagged_reviews_count": flagged_count,
        "forensic_reviews": forensic_reviews,
        "metrics_summary": metrics_summary
    }
