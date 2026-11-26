import re
import httpx
from typing import Dict, Any, List
from urllib.parse import urlparse, unquote
from datetime import datetime, timezone

from backend.app.core.config import settings

def extract_place_search_term(url: str) -> str:
    """
    Extracts business or place query from Google Maps URL.
    E.g. /maps/place/Tartine+Bakery/@37.76... -> Tartine Bakery
    """
    parsed = urlparse(url)
    match = re.search(r'/maps/place/([^/@]+)', parsed.path)
    if match:
        raw_name = match.group(1).replace("+", " ")
        return unquote(raw_name).strip()
    return ""

async def scrape_google_places_reviews(url: str) -> Dict[str, Any]:
    """
    Retrieves Google Maps reviews via Google Places API (if GOOGLE_PLACES_API_KEY is configured)
    or returns an informative fallback directing the user to the TrustLens Chrome Extension/Bookmarklet.
    """
    search_term = extract_place_search_term(url)
    display_title = search_term or "Google Maps Place"
    
    if settings.GOOGLE_PLACES_API_KEY and search_term:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                # 1. Find Place ID
                find_url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
                find_params = {
                    "input": search_term,
                    "inputtype": "textquery",
                    "fields": "place_id,name",
                    "key": settings.GOOGLE_PLACES_API_KEY
                }
                find_resp = await client.get(find_url, params=find_params)
                if find_resp.status_code == 200:
                    candidates = find_resp.json().get("candidates", [])
                    if candidates:
                        place_id = candidates[0].get("place_id")
                        place_name = candidates[0].get("name", display_title)
                        
                        # 2. Get Place Details with Reviews
                        details_url = "https://maps.googleapis.com/maps/api/place/details/json"
                        det_params = {
                            "place_id": place_id,
                            "fields": "name,rating,reviews",
                            "key": settings.GOOGLE_PLACES_API_KEY
                        }
                        det_resp = await client.get(details_url, params=det_params)
                        if det_resp.status_code == 200:
                            result = det_resp.json().get("result", {})
                            raw_reviews = result.get("reviews", [])
                            if raw_reviews:
                                formatted_reviews: List[Dict[str, Any]] = []
                                for r in raw_reviews:
                                    author = r.get("author_name", "Google Maps User")
                                    body = r.get("text", "").strip()
                                    rating = float(r.get("rating", 5.0))
                                    time_epoch = r.get("time")
                                    date_str = datetime.fromtimestamp(time_epoch, tz=timezone.utc).strftime("%Y-%m-%d") if time_epoch else "Recent"
                                    
                                    if body:
                                        formatted_reviews.append({
                                            "reviewer_name": author,
                                            "review_text": body,
                                            "rating": rating,
                                            "date": date_str,
                                            "helpful_votes": 0,
                                            "verified_purchase": False
                                        })
                                        
                                if formatted_reviews:
                                    return {
                                        "success": True,
                                        "is_blocked": False,
                                        "status_code": 200,
                                        "title": f"{place_name} (Google Places API)",
                                        "platform": "google_maps",
                                        "reviews": formatted_reviews
                                    }
        except Exception:
            pass # Fall through to informative fallback

    return {
        "success": False,
        "is_blocked": True,
        "status_code": 403,
        "error_code": "MAPS_AUTH_REQUIRED",
        "title": f"{display_title} on Google Maps",
        "platform": "google_maps",
        "message": "Google Maps renders reviews dynamically via interactive WebGL canvases and blocks automated scrapers. To analyze this place: (1) Use the TrustLens Chrome Extension or 1-Click Bookmarklet while viewing the reviews tab on Google Maps, or (2) Configure `GOOGLE_PLACES_API_KEY` in .env.",
        "reviews": []
    }
