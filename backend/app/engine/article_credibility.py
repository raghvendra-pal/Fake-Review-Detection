import re
from urllib.parse import urlparse
from typing import Dict, Any, List

# Known domain reputations database
KNOWN_DOMAINS = {
    # High credibility / authoritative news
    "reuters.com": ("High Credibility", "Authoritative international news agency with strict editorial standards."),
    "apnews.com": ("High Credibility", "Associated Press wire service, verified primary source reporting."),
    "bbc.com": ("High Credibility", "Public service broadcaster with established fact-checking protocols."),
    "nature.com": ("Scientific Authority", "Peer-reviewed scientific journal."),
    "science.org": ("Scientific Authority", "Peer-reviewed academic research."),
    "nytimes.com": ("High Credibility", "Established legacy reporting with public correction logs."),
    "wsj.com": ("High Credibility", "Verified financial and international journalism."),
    "theguardian.com": ("High Credibility", "Established independent news organization."),
    
    # Satire / Parody
    "theonion.com": ("Satire", "Humorous satirical publisher; claims are fictional parody."),
    "babylonbee.com": ("Satire", "Satirical publication; not factual reporting."),
    "clickhole.com": ("Satire", "Parody and satirical clickbait humor."),
    
    # Questionable / Low credibility / Clickbait domains
    "infowars.com": ("High Risk / Misinformation", "Documented history of promoting unverified conspiracy claims."),
    "beforeitsnews.com": ("High Risk / User Generated", "Unmoderated clickbait and unverified conspiracy theories."),
    "worldnewsdailyreport.com": ("Fabricated Content", "Known fabricated hoax articles.")
}

CLICKBAIT_PATTERNS = [
    re.compile(r"you won't believe", re.I),
    re.compile(r"what happened next will shock you", re.I),
    re.compile(r"doctors hate this", re.I),
    re.compile(r"this one simple trick", re.I),
    re.compile(r"will blow your mind", re.I),
    re.compile(r"they don't want you to know", re.I),
    re.compile(r"the secret that", re.I),
    re.compile(r"the real truth about", re.I),
    re.compile(r"what nobody is telling you", re.I),
    re.compile(r"shocking revelation", re.I),
]

SENSATIONAL_WORDS = {
    "bombshell", "explosive", "terrifying", "horrific", "insane", "unbelievable",
    "destroyed", "slammed", "obliterated", "annihilated", "unmasked", "exposed",
    "panic", "catastrophe", "apocalypse", "miraculous", "mind-blowing", "traitor"
}

def analyze_article_credibility(
    text: str,
    url: str = None,
    title: str = None
) -> Dict[str, Any]:
    """
    Evaluates news article / text for credibility, clickbait characteristics,
    sensationalism density, and source domain reputation.
    """
    clean_text = text.strip() if text else ""
    full_text = f"{title or ''} {clean_text}".strip()
    
    words = re.findall(r"\b[A-Za-z0-9'-]+\b", full_text)
    num_words = max(1, len(words))
    lower_text = full_text.lower()
    
    # 1. Clickbait Scoring
    clickbait_matches = []
    for pattern in CLICKBAIT_PATTERNS:
        if pattern.search(lower_text):
            clickbait_matches.append(pattern.pattern)
            
    # Check for question headlines / excessive punctuation
    if title and title.endswith("?"):
        clickbait_matches.append("Question Headline (Betteridge's Law)")
    if "!" in (title or ""):
        clickbait_matches.append("Exclamation mark in headline")
        
    clickbait_score = min(100.0, float(len(clickbait_matches) * 25.0))
    
    # 2. Sensationalism & Emotional Manipulation
    sensational_hits = [w for w in words if w.lower() in SENSATIONAL_WORDS]
    sensational_density = len(sensational_hits) / num_words
    sensational_score = min(100.0, round(sensational_density * 400.0 + (len(sensational_hits) * 6.0), 1))
    
    # 3. Domain Reputation Check
    domain_reputation = "Unknown Domain"
    domain_detail = "No URL provided or unindexed domain."
    domain_name = None
    domain_penalty = 15.0  # slight unknown penalty
    
    if url:
        try:
            parsed = urlparse(url)
            host = parsed.netloc.lower()
            if host.startswith("www."):
                host = host[4:]
            domain_name = host
            
            if host in KNOWN_DOMAINS:
                domain_reputation, domain_detail = KNOWN_DOMAINS[host]
                if domain_reputation in ("High Credibility", "Scientific Authority"):
                    domain_penalty = 0.0
                elif domain_reputation == "Satire":
                    domain_penalty = 60.0
                else:
                    domain_penalty = 70.0
            else:
                domain_reputation = "Unverified Domain"
                domain_detail = f"Domain '{host}' is not in verified top-tier news registry."
                domain_penalty = 20.0
        except Exception:
            pass
            
    # 4. Composite Credibility Score (0 to 100)
    # Higher = more credible
    credibility_penalty = (clickbait_score * 0.35) + (sensational_score * 0.35) + (domain_penalty * 0.30)
    credibility_score = max(5.0, min(98.0, round(100.0 - credibility_penalty, 1)))
    
    if credibility_score >= 75.0:
        verdict = "High Credibility"
    elif credibility_score >= 45.0:
        verdict = "Mixed / Unverified Credibility"
    else:
        verdict = "Low Credibility / Clickbait"
        
    # Highlights
    highlighted_claims = []
    for w in set(sensational_hits[:8]):
        highlighted_claims.append({
            "term": w,
            "type": "sensational_language",
            "explanation": "Emotionally charged hyperbole intended to trigger visceral engagement."
        })
    for m in clickbait_matches[:3]:
        highlighted_claims.append({
            "term": m,
            "type": "clickbait_marker",
            "explanation": "Formulaic sensational teaser pattern."
        })
        
    key_takeaways = []
    if clickbait_score > 50:
        key_takeaways.append(f"Strong clickbait framing detected ({clickbait_score}/100).")
    if sensational_score > 40:
        key_takeaways.append("Elevated frequency of emotionally charged, inflammatory rhetoric.")
    if domain_name:
        key_takeaways.append(f"Source: {domain_name} ({domain_reputation}).")
    if credibility_score >= 75:
        key_takeaways.append("Tone appears measured and analytical with restrained language.")

    return {
        "title": title or "Analyzed Article",
        "url": url,
        "credibility_score": credibility_score,
        "clickbait_score": clickbait_score,
        "sensationalism_score": sensational_score,
        "domain_reputation": domain_reputation,
        "domain_detail": domain_detail,
        "domain_name": domain_name,
        "verdict": verdict,
        "flagged_phrases": highlighted_claims,
        "key_takeaways": key_takeaways
    }
