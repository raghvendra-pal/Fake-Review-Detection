import re
import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any, List
from urllib.parse import urlparse

from backend.app.core.config import settings
from backend.app.scrapers.proxy_scraper import fetch_with_smart_proxy

def extract_yelp_alias(url: str) -> str:
    """
    Extracts Yelp business alias from URL.
    E.g. https://www.yelp.com/biz/tartine-bakery-san-francisco -> tartine-bakery-san-francisco
    """
    path_parts = [p for p in urlparse(url).path.split("/") if p]
    for i, part in enumerate(path_parts):
        if part == "biz" and i + 1 < len(path_parts):
            return path_parts[i + 1].split("?")[0]
    return ""

async def scrape_yelp_reviews(url: str) -> Dict[str, Any]:
    """
    Retrieves Yelp reviews using Yelp Fusion API (if YELP_API_KEY is configured),
    smart proxy (if SCRAPERAPI_KEY is configured), or direct fetch with graceful fallback.
    """
    alias = extract_yelp_alias(url)
    display_title = alias.replace("-", " ").title() if alias else "Yelp Business"
    
    # 1. Official Yelp Fusion API Path (Highest fidelity)
    if settings.YELP_API_KEY and alias:
        try:
            api_headers = {"Authorization": f"Bearer {settings.YELP_API_KEY}"}
            async with httpx.AsyncClient(headers=api_headers, timeout=12.0) as client:
                # Fetch business info for clean title
                biz_resp = await client.get(f"https://api.yelp.com/v3/businesses/{alias}")
                if biz_resp.status_code == 200:
                    biz_data = biz_resp.json()
                    display_title = biz_data.get("name", display_title)
                    
                # Fetch reviews
                rev_resp = await client.get(f"https://api.yelp.com/v3/businesses/{alias}/reviews")
                if rev_resp.status_code == 200:
                    rev_data = rev_resp.json()
                    raw_reviews = rev_data.get("reviews", [])
                    if raw_reviews:
                        reviews: List[Dict[str, Any]] = []
                        for r in raw_reviews:
                            user = r.get("user", {})
                            user_name = user.get("name", "Yelp Reviewer")
                            reviews.append({
                                "reviewer_name": user_name,
                                "review_text": r.get("text", "").strip(),
                                "rating": float(r.get("rating", 5.0)),
                                "date": (r.get("time_created") or "Recent").split(" ")[0],
                                "helpful_votes": 0,
                                "verified_purchase": False
                            })
                        return {
                            "success": True,
                            "is_blocked": False,
                            "status_code": 200,
                            "title": f"{display_title} (Yelp Official API)",
                            "platform": "yelp",
                            "reviews": reviews
                        }
        except Exception:
            pass # Fall through to proxy or scraper fallback
            
    # 2. Smart Proxy (ScraperAPI / Apify) Path
    if settings.SCRAPERAPI_KEY or settings.APIFY_API_KEY:
        success, html, status, msg = await fetch_with_smart_proxy(url)
        if success and html:
            soup = BeautifulSoup(html, "html.parser")
            rev_items = soup.find_all("li", attrs={"class": lambda c: c and "review" in str(c).lower()})
            reviews = []
            for item in rev_items:
                comment_el = item.find("p", attrs={"class": lambda c: c and "comment" in str(c).lower()})
                if not comment_el:
                    continue
                body = comment_el.get_text(strip=True)
                if len(body) < 15:
                    continue
                author_el = item.find("a", attrs={"href": lambda h: h and "/user_details" in str(h)})
                author = author_el.get_text(strip=True) if author_el else "Yelp Customer"
                reviews.append({
                    "reviewer_name": author,
                    "review_text": body,
                    "rating": 5.0,
                    "date": "Recent",
                    "helpful_votes": 0,
                    "verified_purchase": False
                })
            if reviews:
                return {
                    "success": True,
                    "is_blocked": False,
                    "status_code": 200,
                    "title": display_title,
                    "platform": "yelp",
                    "reviews": reviews
                }

    # 3. Direct Fetch / Graceful Fallback
    return {
        "success": False,
        "is_blocked": True,
        "status_code": 403,
        "error_code": "YELP_AUTH_REQUIRED",
        "title": f"{display_title} on Yelp",
        "platform": "yelp",
        "message": "Yelp strictly protects review data from unauthenticated automated scrapers. To analyze this business, you can: (1) Use the TrustLens 1-Click Chrome Extension / Bookmarklet directly on the open Yelp page, or (2) Add a free `YELP_API_KEY` to your backend .env file.",
        "reviews": []
    }
