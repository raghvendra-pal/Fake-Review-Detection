import re
import math
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from rapidfuzz import fuzz, distance

def extract_username_stem(name: str) -> Tuple[str, str, bool]:
    """
    Extracts base username and numeric/hex suffix pattern.
    e.g. 'john_8821' -> base='john_', suffix='8821', has_bot_suffix=True
    'alexander99' -> base='alexander', suffix='99', has_bot_suffix=True
    """
    name_clean = name.strip()
    match = re.search(r"^(.*?)([-_.]?)(\d{2,6}|[a-f0-9]{4,8})$", name_clean, re.IGNORECASE)
    if match and len(match.group(1)) >= 2:
        base = match.group(1) + match.group(2)
        suffix = match.group(3)
        return base.lower(), suffix, True
        
    # Check random-string gibberish (e.g. 'xjk881a')
    consonants = len(re.findall(r"[bcdfghjklmnpqrstvwxyz]", name_clean.lower()))
    vowels = len(re.findall(r"[aeiou]", name_clean.lower()))
    is_gibberish = len(name_clean) >= 6 and (vowels == 0 or (consonants / max(1, len(name_clean)) > 0.85))
    
    return name_clean.lower(), "", is_gibberish

def cluster_similar_usernames(reviewers: List[str], similarity_threshold: float = 85.0) -> Dict[str, Dict[str, Any]]:
    """
    Clusters usernames using RapidFuzz ratio, numeric suffix patterns, and string distance.
    Returns mapping: reviewer_name -> { cluster_id, cluster_label, is_pattern_flagged }
    """
    unique_names = list(set(r.strip() for r in reviewers if r and r.strip()))
    clusters: Dict[str, Dict[str, Any]] = {}
    
    # 1. Group by bot-like suffix pattern (e.g., base_8821, base_8822)
    stem_groups = defaultdict(list)
    for name in unique_names:
        base, suffix, flagged = extract_username_stem(name)
        if flagged and base:
            stem_groups[base].append((name, suffix))
            
    cluster_counter = 1
    processed_names = set()
    
    for base, names in stem_groups.items():
        if len(names) >= 2:
            c_id = f"pattern_cluster_{cluster_counter}"
            cluster_counter += 1
            for name, suffix in names:
                clusters[name] = {
                    "cluster_id": c_id,
                    "cluster_label": f"Bot Suffix Pattern ('{base}*')",
                    "is_pattern_flagged": True
                }
                processed_names.add(name)
                
    # 2. Fuzzy string matching for remaining names (e.g. Levenshtein / Jaro-Winkler)
    remaining_names = [n for n in unique_names if n not in processed_names]
    visited = set()
    
    for i, name1 in enumerate(remaining_names):
        if name1 in visited:
            continue
        group = [name1]
        visited.add(name1)
        for j in range(i + 1, len(remaining_names)):
            name2 = remaining_names[j]
            if name2 in visited:
                continue
            ratio = fuzz.ratio(name1.lower(), name2.lower())
            if ratio >= similarity_threshold:
                group.append(name2)
                visited.add(name2)
                
        if len(group) >= 2:
            c_id = f"fuzzy_cluster_{cluster_counter}"
            cluster_counter += 1
            for g_name in group:
                clusters[g_name] = {
                    "cluster_id": c_id,
                    "cluster_label": f"High Name Similarity ({group[0]})",
                    "is_pattern_flagged": True
                }
                
    # Fill defaults for non-clustered names
    for name in unique_names:
        if name not in clusters:
            clusters[name] = {
                "cluster_id": None,
                "cluster_label": None,
                "is_pattern_flagged": False
            }
            
    return clusters

def detect_duplicate_reviews(reviews: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Detects:
    1. Cross-account duplicate reviews (distinct accounts posting the exact or near-identical review).
    2. Intra-account duplicate reviews (same reviewer posting repetitive reviews).
    """
    n = len(reviews)
    cross_account_dups = []
    intra_account_dups = []
    
    for i in range(n):
        text_i = reviews[i].get("review_text", "").strip()
        user_i = reviews[i].get("reviewer_name", "Anon")
        if len(text_i) < 15:
            continue
            
        for j in range(i + 1, n):
            text_j = reviews[j].get("review_text", "").strip()
            user_j = reviews[j].get("reviewer_name", "Anon")
            if len(text_j) < 15:
                continue
                
            sim = fuzz.token_sort_ratio(text_i.lower(), text_j.lower())
            if sim >= 82:  # High token similarity threshold
                match_info = {
                    "review_index_1": i,
                    "review_index_2": j,
                    "similarity": round(sim, 1),
                    "reviewer_1": user_i,
                    "reviewer_2": user_j,
                    "sample_text": text_i[:80] + "..." if len(text_i) > 80 else text_i
                }
                if user_i.lower() == user_j.lower():
                    intra_account_dups.append(match_info)
                else:
                    cross_account_dups.append(match_info)
                    
    return cross_account_dups, intra_account_dups

def compute_account_risk_cards(
    reviews: List[Dict[str, Any]],
    username_clusters: Dict[str, Dict[str, Any]],
    cross_account_dups: List[Dict[str, Any]],
    intra_account_dups: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Computes forensic risk cards for every reviewer account.
    """
    account_groups = defaultdict(list)
    for idx, r in enumerate(reviews):
        uname = r.get("reviewer_name", "Anonymous")
        account_groups[uname].append((idx, r))
        
    # Build lookup of users involved in duplicates
    cross_dup_users = set()
    for d in cross_account_dups:
        cross_dup_users.add(d["reviewer_1"])
        cross_dup_users.add(d["reviewer_2"])
        
    intra_dup_users = set()
    for d in intra_account_dups:
        intra_dup_users.add(d["reviewer_1"])
        
    cards = []
    
    for uname, user_reviews in account_groups.items():
        total_revs = len(user_reviews)
        ratings = [float(r[1].get("rating", 5.0)) for r in user_reviews]
        avg_rating = sum(ratings) / max(1, total_revs)
        
        # Variance
        variance = sum((x - avg_rating) ** 2 for x in ratings) / max(1, total_revs)
        five_stars = sum(1 for x in ratings if x >= 4.8)
        five_star_ratio = five_stars / max(1, total_revs)
        
        cluster_info = username_clusters.get(uname, {})
        has_pattern = cluster_info.get("is_pattern_flagged", False)
        
        # Base risk calculation
        risk = 10.0  # baseline
        
        if uname in cross_dup_users:
            risk += 45.0  # heavily penalized for coordinated copy-pasting
        if uname in intra_dup_users:
            risk += 30.0  # repetitive posting from same account
        if has_pattern:
            risk += 25.0  # patterned bot-naming
        if total_revs >= 3 and five_star_ratio == 1.0:
            risk += 15.0  # exclusively 5-star spammer
        if total_revs >= 5 and variance < 0.05:
            risk += 10.0  # zero variance over high volume
            
        final_risk = min(100.0, max(5.0, round(risk, 1)))
        
        cards.append({
            "reviewer_name": uname,
            "reviewer_id": f"usr_{abs(hash(uname)) % 1000000:06d}",
            "total_reviews": total_revs,
            "average_rating": round(avg_rating, 2),
            "five_star_ratio": round(five_star_ratio * 100, 1),
            "rating_variance": round(variance, 3),
            "cluster_id": cluster_info.get("cluster_id"),
            "pattern_flag": cluster_info.get("cluster_label"),
            "account_risk_score": final_risk,
            "reviews_indices": [r[0] for r in user_reviews]
        })
        
    cards.sort(key=lambda c: c["account_risk_score"], reverse=True)
    return cards
