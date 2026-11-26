import re
from typing import Dict, Any, List
from urllib.parse import urlparse, parse_qs
from google_play_scraper import app as gplay_app, reviews as gplay_reviews, Sort

def extract_package_id(url: str) -> str:
    """
    Extracts Google Play package name (e.g. com.spotify.music) from a Play Store URL or raw package ID.
    """
    cleaned = url.strip()
    # Check if raw package name was passed directly (e.g. com.spotify.music)
    if re.match(r'^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$', cleaned):
        return cleaned

    # Add protocol if missing for standard URL parsing
    test_url = cleaned if cleaned.startswith(("http://", "https://")) else f"https://{cleaned}"

    parsed = urlparse(test_url)
    qs = parse_qs(parsed.query)
    if "id" in qs and qs["id"]:
        return qs["id"][0].strip()
    
    # Try regex fallback on URL path or query
    match = re.search(r'[?&]id=([a-zA-Z0-9._]+)', cleaned)
    if match:
        return match.group(1).strip()
        
    return ""

def scrape_playstore_reviews(url: str, max_reviews: int = 60) -> Dict[str, Any]:
    """
    Scrapes reviews and app metadata from Google Play Store using google-play-scraper.
    Does not require an API key and is not blocked by cloud providers.
    """
    package_id = extract_package_id(url)
    if not package_id:
        return {
            "success": False,
            "is_blocked": False,
            "status_code": 400,
            "error_code": "INVALID_PLAY_STORE_URL",
            "title": "Google Play Store",
            "message": "Could not extract package ID from the provided Google Play Store URL. Example format: https://play.google.com/store/apps/details?id=com.spotify.music",
            "reviews": []
        }
        
    try:
        # 1. Fetch App Metadata
        title = package_id
        developer = ""
        try:
            app_info = gplay_app(package_id)
            title = app_info.get("title", package_id)
            developer = app_info.get("developer", "")
        except Exception:
            pass # Continue to review fetching even if metadata fails
            
        full_title = f"{title} (by {developer})" if developer else title
        
        # 2. Fetch Recent Reviews
        raw_reviews, _ = gplay_reviews(
            package_id,
            lang="en",
            country="us",
            sort=Sort.NEWEST,
            count=max_reviews
        )
        
        # If no reviews in US store, fallback to global English
        if not raw_reviews:
            try:
                raw_reviews, _ = gplay_reviews(
                    package_id,
                    lang="en",
                    sort=Sort.NEWEST,
                    count=max_reviews
                )
            except Exception:
                pass
        
        if not raw_reviews:
            return {
                "success": False,
                "is_blocked": False,
                "status_code": 200,
                "error_code": "NO_REVIEWS_FOUND",
                "platform": "google_play",
                "title": full_title,
                "message": f"Successfully connected to '{full_title}', but no reviews were found on Google Play Store.",
                "reviews": [],
                "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"],
                "suggested_demo": "ecommerce-burst"
            }
            
        formatted_reviews: List[Dict[str, Any]] = []
        for r in raw_reviews:
            body = (r.get("content") or "").strip()
            if not body:
                continue
                
            at_date = r.get("at")
            date_str = at_date.strftime("%Y-%m-%d") if at_date else "Recent"
            
            user_name = (r.get("userName") or "Google User").strip()
            score = float(r.get("score") or 5.0)
            thumbs = int(r.get("thumbsUpCount") or 0)
            
            formatted_reviews.append({
                "reviewer_name": user_name,
                "review_text": body,
                "rating": score,
                "date": date_str,
                "helpful_votes": thumbs,
                "verified_purchase": True # Play Store reviews require downloading/purchasing the app
            })
            
        return {
            "success": True,
            "is_blocked": False,
            "status_code": 200,
            "title": full_title,
            "platform": "google_play",
            "reviews": formatted_reviews
        }
        
    except Exception as e:
        err_msg = str(e)
        if "not found" in err_msg.lower():
            return {
                "success": False,
                "is_blocked": False,
                "status_code": 404,
                "error_code": "APP_NOT_FOUND",
                "title": f"Google Play ({package_id})",
                "message": f"Application with package ID '{package_id}' was not found on Google Play Store.",
                "reviews": []
            }
        return {
            "success": False,
            "is_blocked": False,
            "status_code": 500,
            "error_code": "PLAYSTORE_FETCH_ERROR",
            "title": f"Google Play ({package_id})",
            "message": f"Failed to retrieve Google Play reviews: {err_msg}",
            "reviews": []
        }
