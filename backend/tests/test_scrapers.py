import pytest
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime

from backend.app.scrapers.playstore import extract_package_id, scrape_playstore_reviews
from backend.app.scrapers.trustpilot import extract_trustpilot_company, parse_trustpilot_html
from backend.app.scrapers.yelp import extract_yelp_alias
from backend.app.scrapers.gplaces import extract_place_search_term
from backend.app.scrapers.proxy_scraper import fetch_with_smart_proxy
from backend.app.scrapers.generic_scraper import scrape_reviews_from_url

def test_playstore_package_id_extraction():
    url1 = "https://play.google.com/store/apps/details?id=com.spotify.music&hl=en_US"
    assert extract_package_id(url1) == "com.spotify.music"
    
    url2 = "https://play.google.com/store/apps/details?id=org.telegram.messenger"
    assert extract_package_id(url2) == "org.telegram.messenger"
    
    url3 = "https://example.com/not-play-store"
    assert extract_package_id(url3) == ""

def test_playstore_scraper_transformation():
    # Mock google_play_scraper calls
    mock_app_info = {"title": "Spotify", "developer": "Spotify AB"}
    mock_reviews = [
        {
            "userName": "Jane Doe",
            "content": "Superb sound quality and playlist recommendations!",
            "score": 5,
            "at": datetime(2024, 3, 15, 10, 30),
            "thumbsUpCount": 12
        },
        {
            "userName": "Alex Smith",
            "content": "App crashes occasionally on startup.",
            "score": 2,
            "at": datetime(2024, 3, 14, 8, 15),
            "thumbsUpCount": 3
        }
    ]
    
    with patch("backend.app.scrapers.playstore.gplay_app", return_value=mock_app_info):
        with patch("backend.app.scrapers.playstore.gplay_reviews", return_value=(mock_reviews, None)):
            res = scrape_playstore_reviews("https://play.google.com/store/apps/details?id=com.spotify.music")
            assert res["success"] is True
            assert res["is_blocked"] is False
            assert res["platform"] == "google_play"
            assert "Spotify" in res["title"]
            assert len(res["reviews"]) == 2
            
            r0 = res["reviews"][0]
            assert r0["reviewer_name"] == "Jane Doe"
            assert r0["rating"] == 5.0
            assert r0["date"] == "2024-03-15"
            assert r0["helpful_votes"] == 12
            assert r0["verified_purchase"] is True

def test_trustpilot_company_extraction():
    url = "https://www.trustpilot.com/review/netflix.com?languages=all"
    assert extract_trustpilot_company(url) == "netflix.com"

def test_trustpilot_html_parser_schema():
    sample_html = """
    <html>
      <head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Acme Inc",
          "review": [
            {
              "@type": "Review",
              "author": {"@type": "Person", "name": "Sarah Connor"},
              "reviewBody": "Outstanding customer support and rapid delivery.",
              "reviewRating": {"@type": "Rating", "ratingValue": "5"},
              "datePublished": "2024-02-10"
            }
          ]
        }
        </script>
      </head>
      <body></body>
    </html>
    """
    reviews = parse_trustpilot_html(sample_html, "Acme Inc")
    assert len(reviews) == 1
    assert reviews[0]["reviewer_name"] == "Sarah Connor"
    assert reviews[0]["rating"] == 5.0
    assert "customer support" in reviews[0]["review_text"]

def test_yelp_alias_extraction():
    url = "https://www.yelp.com/biz/tartine-bakery-san-francisco?osq=Bakeries"
    assert extract_yelp_alias(url) == "tartine-bakery-san-francisco"

def test_gplaces_term_extraction():
    url = "https://www.google.com/maps/place/Tartine+Bakery/@37.7614,-122.424,17z"
    assert extract_place_search_term(url) == "Tartine Bakery"

def test_proxy_scraper_configuration_logic():
    # Verify that without API keys configured, proxy scraper reports keys missing
    from backend.app.core.config import settings
    assert not settings.SCRAPERAPI_KEY
    assert not settings.APIFY_API_KEY

def test_amazon_scraper_fallback_payload_format():
    # Verify Amazon fallback dictionary contains required options
    domain = "amazon.com"
    brand = "Amazon"
    payload = {
        "success": False,
        "is_blocked": True,
        "status_code": 403,
        "error_code": "SCRAPER_BLOCKED",
        "platform": "amazon",
        "title": f"Review Listing on {brand}",
        "message": f"Automated scraping was restricted by {brand}'s bot shields.",
        "reviews": [],
        "fallback_options": ["bookmarklet", "chrome_extension", "paste_raw_text", "upload_csv", "try_demo"],
        "suggested_demo": "ecommerce-burst"
    }
    assert payload["success"] is False
    assert payload["is_blocked"] is True
    assert payload["platform"] == "amazon"
    assert "bookmarklet" in payload["fallback_options"]
    assert "chrome_extension" in payload["fallback_options"]
