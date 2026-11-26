import re
import json
import httpx
from bs4 import BeautifulSoup
from typing import Dict, Any, List
from urllib.parse import urlparse

from backend.app.core.config import settings
from backend.app.scrapers.proxy_scraper import fetch_with_smart_proxy

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
}

def extract_trustpilot_company(url: str) -> str:
    """
    Extracts the domain/company name from a Trustpilot review URL.
    E.g. https://www.trustpilot.com/review/netflix.com -> netflix.com
    """
    path_parts = [p for p in urlparse(url).path.split("/") if p]
    if len(path_parts) >= 2 and path_parts[0] == "review":
        return path_parts[1]
    return "Company"

def parse_trustpilot_html(html: str, target_name: str) -> List[Dict[str, Any]]:
    """
    Extracts reviews from Trustpilot HTML using JSON-LD and DOM card selectors.
    """
    soup = BeautifulSoup(html, "html.parser")
    reviews: List[Dict[str, Any]] = []
    
    # 1. Check for JSON-LD schema first
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
            items = data if isinstance(data, list) else [data]
            for item in items:
                graph = item.get("@graph", [item])
                for entry in graph:
                    revs = entry.get("review") or entry.get("reviews")
                    if revs:
                        if isinstance(revs, dict):
                            revs = [revs]
                        for r in revs:
                            author = r.get("author", {})
                            name = author.get("name") if isinstance(author, dict) else str(author or "Consumer")
                            body = (r.get("reviewBody") or r.get("description") or "").strip()
                            rating_val = 5.0
                            try:
                                rating_val = float(r.get("reviewRating", {}).get("ratingValue", 5.0))
                            except Exception:
                                rating_val = 5.0
                            date_str = r.get("datePublished", "Recent")
                            if body and len(body) > 5:
                                reviews.append({
                                    "reviewer_name": name,
                                    "review_text": body,
                                    "rating": rating_val,
                                    "date": date_str,
                                    "helpful_votes": 0,
                                    "verified_purchase": True
                                })
        except Exception:
            continue
            
    if reviews:
        return reviews
        
    # 2. Check DOM Review Cards
    articles = soup.find_all("article")
    for art in articles:
        # Check if article represents a review card
        text_el = art.find(attrs={"data-service-review-text-typography": True}) or art.find("p", attrs={"class": lambda c: c and "typography_body" in str(c)})
        if not text_el:
            continue
        body = text_el.get_text(strip=True)
        if len(body) < 10:
            continue
            
        author_el = art.find(attrs={"data-consumer-name-typography": True}) or art.find(attrs={"data-consumer-name": True})
        name = author_el.get_text(strip=True) if author_el else "Trustpilot User"
        
        # Rating from image alt or data-service-review-rating
        rating_val = 5.0
        star_img = art.find("img", alt=re.compile(r'Rated \d+ out of \d+ stars', re.I))
        if star_img and star_img.get("alt"):
            match = re.search(r'Rated (\d+)', star_img["alt"])
            if match:
                rating_val = float(match.group(1))
        else:
            rating_container = art.find(attrs={"data-service-review-rating": True})
            if rating_container and rating_container.get("data-service-review-rating"):
                try:
                    rating_val = float(rating_container["data-service-review-rating"])
                except Exception:
                    rating_val = 5.0
                    
        # Date
        time_el = art.find("time")
        date_str = time_el.get("datetime", "Recent").split("T")[0] if time_el else "Recent"
        
        # Verified
        verified = bool(art.find(attrs={"data-service-review-verification-badge": True}) or "verified" in art.get_text().lower())
        
        reviews.append({
            "reviewer_name": name,
            "review_text": body,
            "rating": rating_val,
            "date": date_str,
            "helpful_votes": 0,
            "verified_purchase": verified
        })
        
    return reviews

async def scrape_trustpilot_reviews(url: str) -> Dict[str, Any]:
    """
    Scrapes a Trustpilot review profile.
    Uses residential/smart proxy if configured, or direct fetch with fallback.
    """
    company = extract_trustpilot_company(url)
    title = f"{company.capitalize()} on Trustpilot"
    
    # 1. Try configured proxy (ScraperAPI / Apify) if keys exist
    if settings.SCRAPERAPI_KEY or settings.APIFY_API_KEY:
        success, html, status, msg = await fetch_with_smart_proxy(url)
        if success and html:
            reviews = parse_trustpilot_html(html, company)
            if reviews:
                return {
                    "success": True,
                    "is_blocked": False,
                    "status_code": 200,
                    "title": title,
                    "platform": "trustpilot",
                    "reviews": reviews
                }
                
    # 2. Try direct fetch
    try:
        async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(url)
            if resp.status_code in (401, 403, 429, 503):
                return {
                    "success": False,
                    "is_blocked": True,
                    "status_code": resp.status_code,
                    "error_code": "SCRAPER_BLOCKED",
                    "title": title,
                    "platform": "trustpilot",
                    "message": f"Trustpilot restricted automated server access (HTTP {resp.status_code} Cloudflare Shield). Use the TrustLens Chrome Extension or 1-Click Bookmarklet to import reviews directly from your active browser session.",
                    "reviews": []
                }
                
            content = resp.text
            if "verifying connection" in content.lower() or "challenge-running" in content.lower():
                return {
                    "success": False,
                    "is_blocked": True,
                    "status_code": 403,
                    "error_code": "SCRAPER_BLOCKED",
                    "title": title,
                    "platform": "trustpilot",
                    "message": "Trustpilot presented a Cloudflare Turnstile verification challenge. Use the TrustLens Chrome Extension or 1-Click Bookmarklet to analyze this page without server restrictions.",
                    "reviews": []
                }
                
            reviews = parse_trustpilot_html(content, company)
            if not reviews:
                return {
                    "success": False,
                    "is_blocked": False,
                    "status_code": 200,
                    "error_code": "NO_REVIEWS_FOUND",
                    "title": title,
                    "platform": "trustpilot",
                    "message": f"Connected to '{title}', but no reviews were found in the static response.",
                    "reviews": []
                }
                
            return {
                "success": True,
                "is_blocked": False,
                "status_code": 200,
                "title": title,
                "platform": "trustpilot",
                "reviews": reviews
            }
            
    except Exception as e:
        return {
            "success": False,
            "is_blocked": False,
            "status_code": 500,
            "error_code": "TRUSTPILOT_FETCH_ERROR",
            "title": title,
            "platform": "trustpilot",
            "message": f"Failed to retrieve Trustpilot reviews: {str(e)}",
            "reviews": []
        }
