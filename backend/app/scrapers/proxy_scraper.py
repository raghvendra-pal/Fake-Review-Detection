import httpx
from urllib.parse import quote_plus
from typing import Tuple, Optional
from backend.app.core.config import settings

async def fetch_via_scraperapi(url: str, render_js: bool = False, timeout: float = 25.0) -> Tuple[bool, Optional[str], int, str]:
    """
    Fetches target URL via ScraperAPI proxy service if SCRAPERAPI_KEY is configured.
    Returns: (success, html_content, status_code, message)
    """
    if not settings.SCRAPERAPI_KEY:
        return False, None, 0, "SCRAPERAPI_KEY not configured"
        
    api_url = f"http://api.scraperapi.com?api_key={settings.SCRAPERAPI_KEY}&url={quote_plus(url)}&country_code=us"
    if render_js:
        api_url += "&render=true"
        
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(api_url)
            if resp.status_code == 200:
                return True, resp.text, 200, "Successfully fetched via ScraperAPI"
            return False, None, resp.status_code, f"ScraperAPI returned HTTP {resp.status_code}"
    except Exception as e:
        return False, None, 500, f"ScraperAPI proxy error: {str(e)}"

async def fetch_via_apify(url: str, timeout: float = 25.0) -> Tuple[bool, Optional[str], int, str]:
    """
    Fetches target URL via Apify proxy service if APIFY_API_KEY is configured.
    """
    if not settings.APIFY_API_KEY:
        return False, None, 0, "APIFY_API_KEY not configured"
        
    # Standard Apify proxy gateway
    proxy_url = f"http://groups-RESIDENTIAL:{settings.APIFY_API_KEY}@proxy.apify.com:8000"
    try:
        async with httpx.AsyncClient(proxy=proxy_url, timeout=timeout, follow_redirects=True) as client:
            resp = await client.get(url, headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            })
            if resp.status_code == 200:
                return True, resp.text, 200, "Successfully fetched via Apify Residential Proxy"
            return False, None, resp.status_code, f"Apify proxy returned HTTP {resp.status_code}"
    except Exception as e:
        return False, None, 500, f"Apify proxy error: {str(e)}"

async def fetch_with_smart_proxy(url: str) -> Tuple[bool, Optional[str], int, str]:
    """
    Attempts to fetch via configured scraping APIs in priority order:
    1. ScraperAPI (if SCRAPERAPI_KEY set)
    2. Apify (if APIFY_API_KEY set)
    Returns: (success, html_text, status_code, message)
    """
    if settings.SCRAPERAPI_KEY:
        success, text, status, msg = await fetch_via_scraperapi(url)
        if success:
            return success, text, status, msg
            
    if settings.APIFY_API_KEY:
        success, text, status, msg = await fetch_via_apify(url)
        if success:
            return success, text, status, msg
            
    return False, None, 0, "No scraping API keys configured or all proxies failed"
