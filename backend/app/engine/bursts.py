import math
from datetime import datetime, timezone
from collections import defaultdict
from typing import List, Dict, Any, Tuple

def parse_date_lenient(date_str: Any) -> datetime:
    """
    Attempts to parse diverse date formats into a standard datetime object.
    Falls back to current date if missing or unparseable.
    """
    if not date_str or not isinstance(date_str, str):
        return datetime.now(timezone.utc)
        
    formats = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%B %d, %Y",
        "%b %d, %Y",
        "%d %B %Y",
        "%d %b %Y"
    ]
    cleaned = date_str.strip().split(".")[0]  # strip sub-second
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    return datetime.utcnow()

def detect_time_series_bursts(reviews: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int, float]:
    """
    Groups reviews by date (day or month depending on range), calculates rolling mean & std,
    and identifies statistical burst spike windows.
    Returns:
      (timeline_data, burst_windows_count, burst_penalty_score)
    """
    if not reviews:
        return [], 0, 0.0
        
    date_buckets = defaultdict(list)
    for r in reviews:
        d_obj = parse_date_lenient(r.get("date") or r.get("review_date"))
        day_key = d_obj.strftime("%Y-%m-%d")
        date_buckets[day_key].append(float(r.get("rating", 5.0)))
        
    sorted_days = sorted(date_buckets.keys())
    if len(sorted_days) <= 1:
        # If all reviews are on single day or no dates, check volume
        total = len(reviews)
        single_day_burst = total >= 15
        timeline = [{
            "date": sorted_days[0] if sorted_days else "Recent",
            "review_count": total,
            "average_rating": round(sum(date_buckets[sorted_days[0]]) / max(1, total), 2) if sorted_days else 5.0,
            "is_burst": single_day_burst
        }]
        return timeline, (1 if single_day_burst else 0), (35.0 if single_day_burst else 0.0)
        
    counts = [len(date_buckets[day]) for day in sorted_days]
    mean_count = sum(counts) / len(counts)
    variance = sum((c - mean_count) ** 2 for c in counts) / len(counts)
    std_dev = math.sqrt(variance)
    
    threshold = max(4.0, mean_count + (1.2 * std_dev))
    burst_windows = 0
    timeline = []
    
    for day in sorted_days:
        cnt = len(date_buckets[day])
        ratings = date_buckets[day]
        avg_r = sum(ratings) / max(1, cnt)
        is_spike = (cnt >= threshold and cnt >= 4) or (cnt >= 2.0 * mean_count and cnt >= 5)
        if is_spike:
            burst_windows += 1
            
        timeline.append({
            "date": day,
            "review_count": cnt,
            "average_rating": round(avg_r, 2),
            "is_burst": is_spike
        })
        
    burst_penalty = min(50.0, burst_windows * 20.0)
    return timeline, burst_windows, burst_penalty

def analyze_rating_distribution(reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyzes rating distribution shape and identifies J-curve or Polarization anomalies.
    """
    total = len(reviews)
    if total == 0:
        return {
            "distribution": {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0},
            "j_curve_detected": False,
            "polarization_detected": False,
            "distribution_penalty": 0.0,
            "verdict_reason": "No reviews to analyze"
        }
        
    dist = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    for r in reviews:
        try:
            val = int(round(float(r.get("rating", 5.0))))
            val = max(1, min(5, val))
            dist[str(val)] += 1
        except Exception:
            dist["5"] += 1
            
    pct_5 = dist["5"] / total
    pct_1 = dist["1"] / total
    pct_middle = (dist["2"] + dist["3"] + dist["4"]) / total
    
    # 1. Unnatural J-Curve (e.g. 90%+ 5 stars, almost no moderate feedback)
    j_curve = total >= 15 and pct_5 >= 0.85 and pct_middle < 0.10
    
    # 2. Polarized Review Brigading (e.g., concentrated 1-star review bomb + 5-star defense)
    polarized = total >= 15 and pct_1 >= 0.30 and pct_5 >= 0.40 and pct_middle < 0.15
    
    penalty = 0.0
    reason = "Balanced natural distribution"
    
    if j_curve:
        penalty += 25.0
        reason = "Suspicious J-curve: Unnaturally high 5-star concentration with near-zero neutral reviews."
    elif polarized:
        penalty += 30.0
        reason = "Polarized brigade pattern: High 1-star and 5-star conflict with hollow middle."
    elif total >= 10 and pct_5 == 1.0:
        penalty += 20.0
        reason = "100% 5-star ratings without any variance."
        
    return {
        "distribution": dist,
        "j_curve_detected": j_curve,
        "polarization_detected": polarized,
        "distribution_penalty": penalty,
        "verdict_reason": reason
    }
