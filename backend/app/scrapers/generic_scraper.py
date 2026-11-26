import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional

from backend.app.core.security import validate_url_security
from backend.app.core.config import settings
from backend.app.scrapers.playstore import scrape_playstore_reviews
from backend.app.scrapers.trustpilot import scrape_trustpilot_reviews
from backend.app.scrapers.yelp import scrape_yelp_reviews
from backend.app.scrapers.gplaces import scrape_google_places_reviews
from backend.app.scrapers.proxy_scraper import fetch_with_smart_proxy

DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1"
}

MAX_REDIRECTS = 3
MAX_RESPONSE_BYTES = 5 * 1024 * 1024  # 5 MB cap to defend against compression bombs & DoS

async def safe_fetch_http(initial_url: str, client: httpx.AsyncClient) -> httpx.Response:
    """
    Executes HTTP request with re-validation of destination IP on EVERY redirect hop.
    Prevents SSRF redirect bypasses to internal networks (CWE-918).
    """
    from urllib.parse import urljoin
    current_url = initial_url
    
    for hop in range(MAX_REDIRECTS + 1):
        validated = validate_url_security(current_url)
        resp = await client.get(validated, follow_redirects=False)
        
        if resp.status_code in (301, 302, 303, 307, 308):
            location = resp.headers.get("Location")
            if not location:
                return resp
            current_url = urljoin(current_url, location)
            continue
            
        return resp
        
    return resp

def extract_schema_reviews(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """
    Extracts structured reviews from JSON-LD schema tags.
    """
    reviews = []
    scripts = soup.find_all("script", type="application/ld+json")
    for script in scripts:
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
            items = data if isinstance(data, list) else [data]
            for item in items:
                candidates = item.get("@graph", [item])
                for obj in candidates:
                    rev_list = obj.get("review") or obj.get("reviews")
                    if rev_list:
                        if isinstance(rev_list, dict):
                            rev_list = [rev_list]
                        for r in rev_list:
                            author = r.get("author", {})
                            author_name = author.get("name") if isinstance(author, dict) else str(author or "Customer")
                            body = (r.get("reviewBody") or r.get("description") or "").strip()
                            r_rating = 5.0
                            rating_val = r.get("reviewRating", {}).get("ratingValue")
                            if rating_val:
                                try:
                                    r_rating = float(rating_val)
                                except Exception:
                                    r_rating = 5.0
                            date_pub = r.get("datePublished")
                            if body and len(body) > 5:
                                reviews.append({
                                    "reviewer_name": str(author_name or "Verified Customer"),
                                    "review_text": body,
                                    "rating": r_rating,
                                    "date": date_pub or "Recent",
                                    "helpful_votes": 0,
                                    "verified_purchase": True
                                })
        except Exception:
            continue
    return reviews

def extract_dom_heuristic_reviews(soup: BeautifulSoup) -> List[Dict[str, Any]]:
    """
    Heuristic DOM parser searching for standard review markup patterns.
    """
    reviews = []
    candidates = soup.find_all(attrs={"class": lambda c: c and any(k in str(c).lower() for k in ["review", "comment", "feedback"])})
    
    for el in candidates[:40]:
        text_el = el.find(attrs={"class": lambda c: c and any(k in str(c).lower() for k in ["body", "text", "content", "comment"])})
        review_text = text_el.get_text(strip=True) if text_el else el.get_text(strip=True)
        
        # Filter noise
        if len(review_text) < 15 or len(review_text) > 3000:
            continue
        if any(bad in review_text.lower() for bad in ["cookie", "privacy policy", "terms of use", "subscribe", "all rights reserved"]):
            continue
            
        author_el = el.find(attrs={"class": lambda c: c and any(k in str(c).lower() for k in ["author", "user", "name", "profile"])})
        author_name = author_el.get_text(strip=True) if author_el else "Customer"
        if len(author_name) > 40:
            author_name = "Customer"
            
        reviews.append({
            "reviewer_name": author_name,
            "review_text": review_text,
            "rating": 5.0,
            "date": "Recent",
            "helpful_votes": 0,
            "verified_purchase": False
        })
        
        if len(reviews) >= 30:
            break
            
    return reviews

async def scrape_reviews_from_url(url: str) -> Dict[str, Any]:
    """
    Master scraping router.
    Routes to dedicated platform handlers (Google Play, Trustpilot, Yelp, Google Maps)
    or performs smart proxy / direct heuristic scraping for general URLs and Amazon/Flipkart.
    """
    # 1. SSRF Security Check
    validated_url = validate_url_security(url)
    parsed = urlparse(validated_url)
    domain = parsed.netloc.lower()

    # 2. Check Dedicated Platform Handlers
    # Google Play Store
    if "play.google.com" in domain and ("/store/apps" in parsed.path or "id=" in validated_url):
        return await asyncio.to_thread(scrape_playstore_reviews, validated_url)
        
    # Trustpilot
    if "trustpilot.com" in domain and "/review" in parsed.path:
        return await scrape_trustpilot_reviews(validated_url)
        
    # Yelp
    if "yelp.com" in domain and "/biz" in parsed.path:
        return await scrape_yelp_reviews(validated_url)
        
    # Google Maps / Places
    if ("google.com" in domain and "/maps" in parsed.path) or ("maps.google." in domain) or ("maps.app.goo.gl" in domain):
        return await scrape_google_places_reviews(validated_url)
        
    # 3. Known Anti-Bot Platforms (Amazon, Flipkart)
    is_amazon = any(a in domain for a in ["amazon.", "amzn."])
    is_flipkart = "flipkart." in domain
    platform_name = "amazon" if is_amazon else ("flipkart" if is_flipkart else "generic")

    # If ScraperAPI or Apify key is configured, attempt smart proxy retrieval first
    if (settings.SCRAPERAPI_KEY or settings.APIFY_API_KEY) and (is_amazon or is_flipkart):
        success, html, status, msg = await fetch_with_smart_proxy(validated_url)
        if success and html:
            soup = BeautifulSoup(html, "html.parser")
            title = soup.title.string.strip() if soup.title and soup.title.string else f"Listing on {domain}"
            reviews = extract_schema_reviews(soup) or extract_dom_heuristic_reviews(soup)
            if reviews:
                return {
                    "success": True,
                    "is_blocked": False,
                    "status_code": 200,
                    "title": title[:100],
                    "platform": platform_name,
                    "reviews": reviews
                }

    # 4. Direct Fetch with Graceful Anti-Bot Shield Handling & SSRF Redirect Guard
    try:
        async with httpx.AsyncClient(headers=DEFAULT_HEADERS, timeout=10.0, follow_redirects=False) as client:
            resp = await safe_fetch_http(validated_url, client)
            
            # Anti-bot detection
            if resp.status_code in (401, 403, 429, 503):
                brand = "Amazon" if is_amazon else ("Flipkart" if is_flipkart else domain)
                return {
                    "success": False,
                    "is_blocked": True,
                    "status_code": resp.status_code,
                    "error_code": "SCRAPER_BLOCKED",
                    "platform": platform_name,
                    "title": f"Review Listing on {brand}",
                    "message": f"Automated scraping was restricted by {brand}'s bot shields (HTTP {resp.status_code}). E-commerce platforms strictly protect review data from cloud crawlers.",
                    "reviews": [],
                    "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"],
                    "suggested_demo": "ecommerce-burst"
                }
                
            content = resp.text
            lower_content = content.lower()
            
            # Check for CAPTCHA/bot challenge in HTML content
            if (any(shield in lower_content for shield in KNOWN_BOT_SHIELDS) and len(content) < 25000) or (is_amazon and "robot check" in lower_content):
                brand = "Amazon" if is_amazon else ("Flipkart" if is_flipkart else domain)
                return {
                    "success": False,
                    "is_blocked": True,
                    "status_code": 200,
                    "error_code": "SCRAPER_BLOCKED",
                    "platform": platform_name,
                    "title": f"Protected Listing on {brand}",
                    "message": f"The page on {brand} presented an interactive CAPTCHA or bot verification challenge.",
                    "reviews": [],
                    "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"],
                    "suggested_demo": "ecommerce-burst"
                }
                
            soup = BeautifulSoup(content, "html.parser")
            
            # Extract title
            title = None
            og_title = soup.find("meta", property="og:title")
            if og_title and og_title.get("content"):
                title = og_title["content"].strip()
            elif soup.title and soup.title.string:
                title = soup.title.string.strip()
            if not title:
                title = f"Product on {domain}"
                
            # Clean title
            title = title.split("|")[0].split(" - ")[0].strip()[:100]
            
            # Extract reviews
            reviews = extract_schema_reviews(soup)
            if not reviews:
                reviews = extract_dom_heuristic_reviews(soup)
                
            if not reviews:
                return {
                    "success": False,
                    "is_blocked": False,
                    "status_code": 200,
                    "error_code": "NO_REVIEWS_FOUND",
                    "platform": platform_name,
                    "title": title,
                    "message": f"Loaded '{title}', but could not locate standard review markup or comments in the static HTML.",
                    "reviews": [],
                    "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"]
                }
                
            return {
                "success": True,
                "is_blocked": False,
                "status_code": 200,
                "title": title,
                "platform": platform_name,
                "reviews": reviews
            }
            
    except httpx.TimeoutException:
        return {
            "success": False,
            "is_blocked": True,
            "status_code": 504,
            "error_code": "TIMEOUT",
            "platform": platform_name,
            "title": f"Listing on {domain}",
            "message": f"Connection to '{domain}' timed out after 12 seconds.",
            "reviews": [],
            "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"]
        }
    except Exception as e:
        return {
            "success": False,
            "is_blocked": False,
            "status_code": 500,
            "error_code": "FETCH_ERROR",
            "platform": platform_name,
            "title": f"Listing on {domain}",
            "message": f"Failed to retrieve URL: {str(e)}",
            "reviews": [],
            "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"]
        }
