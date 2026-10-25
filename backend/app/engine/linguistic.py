import re
import math
from typing import Dict, Any, List, Tuple

# Suspicious extreme superlative phrases common in paid/fake promotional reviews
SUPERLATIVES = {
    "best purchase ever", "changed my life", "miracle product", "flawless perfection",
    "must buy", "100% recommend", "don't hesitate", "best item on the market",
    "blown away", "simply the best", "exceeded all expectations", "cannot live without",
    "holy grail", "unbelievable results", "worth every single penny", "five stars aren't enough",
    "absolutely phenomenal", "truly miraculous", "godsend", "pure magic", "run don't walk"
}

# Templated review patterns frequently found in review farms / click-workers
TEMPLATES = [
    re.compile(r"item arrived (on time|quickly|safely)\.? (works|great) (thanks|thank you) seller", re.I),
    re.compile(r"great product (highly|very) recommend to (all|everyone)", re.I),
    re.compile(r"fast shipping (and|very) good quality\.? recommend", re.I),
    re.compile(r"i love it (so much|very much)\.? will buy again", re.I),
    re.compile(r"very good (product|quality),? as described\.? thanks", re.I),
]

# Common positive and negative words for fast, self-contained sentiment polarity calculation
POSITIVE_WORDS = {
    "great", "excellent", "love", "amazing", "wonderful", "perfect", "good", "nice",
    "awesome", "fantastic", "pleased", "happy", "recommend", "best", "superb",
    "brilliant", "outstanding", "flawless", "sturdy", "durable", "impressive"
}

NEGATIVE_WORDS = {
    "horrible", "terrible", "awful", "worst", "broken", "broke", "disappointed",
    "disappointing", "waste", "garbage", "trash", "useless", "scam", "defective",
    "poor", "cheap", "damaged", "regret", "slow", "fail", "failed", "unusable"
}

# Formulaic transitional phrases typical of LLMs / generative bots
AI_MARKERS = {
    "in conclusion", "to summarize", "it is worth noting", "all in all", "furthermore",
    "it is important to note", "delves into", "testament to", "serves as a testament",
    "standout feature", "impressive array", "without a doubt, this", "seamless blend"
}

def calculate_readability(text: str) -> Tuple[float, str]:
    """
    Calculates Flesch Reading Ease score and returns reading grade level.
    Higher = easier to read (90-100 = 5th grade, 60-70 = 8th/9th grade, <30 = college graduate).
    """
    words = re.findall(r"\b[A-Za-z]+\b", text)
    sentences = re.split(r"[.!?]+", text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    if not words or not sentences:
        return 70.0, "Standard"
        
    num_words = len(words)
    num_sentences = max(1, len(sentences))
    
    # Syllables estimation
    def count_syllables(word: str) -> int:
        w = word.lower()
        count = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and not w.endswith("le") and len(w) > 2:
            count = max(1, count - 1)
        return max(1, count)
        
    num_syllables = sum(count_syllables(w) for w in words)
    
    words_per_sentence = num_words / num_sentences
    syllables_per_word = num_syllables / num_words
    
    flesch_score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    flesch_score = max(0.0, min(100.0, round(flesch_score, 1)))
    
    if flesch_score >= 80:
        level = "Very Easy / Casual"
    elif flesch_score >= 60:
        level = "Standard / Natural"
    elif flesch_score >= 40:
        level = "Complex / Formal"
    else:
        level = "Academic / Dense"
        
    return flesch_score, level

def estimate_sentiment_polarity(text: str) -> float:
    """
    Calculates normalized sentiment polarity from -1.0 (very negative) to +1.0 (very positive).
    """
    words = [w.lower() for w in re.findall(r"\b[A-Za-z]+\b", text)]
    if not words:
        return 0.0
        
    pos_count = sum(1 for w in words if w in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w in NEGATIVE_WORDS)
    
    # Check negation patterns (e.g. "not good", "never works")
    for i in range(len(words) - 1):
        if words[i] in {"not", "never", "no", "hardly", "barely"}:
            if words[i + 1] in POSITIVE_WORDS:
                pos_count -= 1
                neg_count += 1
            elif words[i + 1] in NEGATIVE_WORDS:
                neg_count -= 1
                pos_count += 1
                
    total = pos_count + neg_count
    if total == 0:
        return 0.1  # slightly neutral-positive default
    return round((pos_count - neg_count) / max(1, total), 2)

def estimate_ai_likelihood(text: str) -> float:
    """
    Evaluates AI-generated likelihood heuristic based on sentence length variance (burstiness proxy),
    presence of formulaic AI transitional phrases, and vocabulary uniformity.
    Returns 0.0 to 1.0 (1.0 = highly likely AI generated).
    """
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 3]
    if len(sentences) < 2:
        return 0.15
        
    lengths = [len(re.findall(r"\b\w+\b", s)) for s in sentences]
    mean_length = sum(lengths) / len(lengths)
    variance = sum((l - mean_length) ** 2 for l in lengths) / len(lengths)
    std_dev = math.sqrt(variance)
    
    # Low sentence variance (uniform rhythmic sentences) is characteristic of LLMs
    variance_penalty = 0.35 if (std_dev < 2.5 and mean_length > 8) else 0.05
    
    # Check for AI transitional markers
    lower_text = text.lower()
    marker_hits = sum(1 for marker in AI_MARKERS if marker in lower_text)
    marker_penalty = min(0.5, marker_hits * 0.25)
    
    # Check structured bullet or balanced "pros/cons" in short text
    structure_penalty = 0.15 if ("pros:" in lower_text and "cons:" in lower_text) else 0.0
    
    score = min(0.95, variance_penalty + marker_penalty + structure_penalty)
    return round(score, 2)

def evaluate_linguistic_signals(
    review_text: str,
    rating: float = 5.0,
    product_title: str = ""
) -> Dict[str, Any]:
    """
    Comprehensive rule-based behavioral and linguistic forensic analysis.
    Returns flags, scores, and an aggregate penalty multiplier.
    """
    flags: List[str] = []
    suspicious_snippets: List[str] = []
    text_clean = review_text.strip()
    words = re.findall(r"\b[A-Za-z0-9'-]+\b", text_clean)
    num_words = len(words)
    lower_text = text_clean.lower()
    
    # 1. Superlative Density
    found_superlatives = [s for s in SUPERLATIVES if s in lower_text]
    if len(found_superlatives) >= 2 or (len(found_superlatives) == 1 and num_words < 25):
        flags.append("Excessive Superlatives")
        suspicious_snippets.extend(found_superlatives)
        
    # 2. Templated Review Syntax
    for pattern in TEMPLATES:
        if pattern.search(text_clean):
            flags.append("Templated Review Syntax")
            break
            
    # 3. Text Length Anomalies
    if num_words < 4 and rating in (1.0, 5.0):
        flags.append("Extremely Brief Polarized Review")
    elif num_words > 400 and len(found_superlatives) >= 3:
        flags.append("Overly Verbose Promotional Text")
        
    # 4. Caps & Exclamation Shouting
    exclamation_count = text_clean.count("!")
    caps_words = [w for w in words if w.isupper() and len(w) > 1 and w not in {"USA", "USB", "LED", "TV", "PC", "AC", "DC", "UK", "EU"}]
    if len(caps_words) >= 3 or (len(words) > 0 and len(caps_words) / len(words) > 0.35):
        flags.append("Excessive Capitalization")
    if exclamation_count >= 4 or (num_words > 0 and exclamation_count / max(1, num_words) > 0.3):
        flags.append("Punctuation Anomalies (Multiple !)")
        
    # 5. Emoji & Repeated Character Stuffing
    if re.search(r"([!?.A-Za-z])\1{4,}", text_clean):
        flags.append("Repeated Character Spam (e.g. 'sooooo goooood')")
        
    # 6. Readability & Complexity
    flesch_score, reading_level = calculate_readability(text_clean)
    
    # 7. Sentiment vs Rating Discordance
    polarity = estimate_sentiment_polarity(text_clean)
    if rating >= 4.0 and polarity < -0.2:
        flags.append("Severe Sentiment-to-Rating Mismatch (High Rating with Negative Language)")
    elif rating <= 2.0 and polarity > 0.4:
        flags.append("Severe Sentiment-to-Rating Mismatch (Low Rating with Praising Language)")
        
    # 8. AI-Generated Text Likelihood
    ai_prob = estimate_ai_likelihood(text_clean)
    if ai_prob >= 0.65:
        flags.append("High AI-Generated Text Likelihood")
        
    # 9. Keyword Stuffing
    if product_title and len(product_title) > 4:
        title_keywords = [k.lower() for k in re.findall(r"\b\w{4,}\b", product_title)]
        if title_keywords:
            stuffing_count = sum(lower_text.count(kw) for kw in title_keywords[:3])
            if stuffing_count >= 4 and num_words < 60:
                flags.append("Product Keyword Stuffing")

    # Composite linguistic risk score (0 to 100)
    flag_weights = {
        "Templated Review Syntax": 35,
        "Severe Sentiment-to-Rating Mismatch (High Rating with Negative Language)": 40,
        "Severe Sentiment-to-Rating Mismatch (Low Rating with Praising Language)": 40,
        "Excessive Superlatives": 25,
        "High AI-Generated Text Likelihood": 30,
        "Product Keyword Stuffing": 25,
        "Extremely Brief Polarized Review": 20,
        "Repeated Character Spam (e.g. 'sooooo goooood')": 20,
        "Excessive Capitalization": 15,
        "Punctuation Anomalies (Multiple !)": 15,
        "Overly Verbose Promotional Text": 20,
    }
    
    raw_risk = sum(flag_weights.get(f, 15) for f in flags)
    linguistic_risk_score = min(100.0, float(raw_risk))

    return {
        "flags": flags,
        "linguistic_risk_score": linguistic_risk_score,
        "flesch_reading_score": flesch_score,
        "reading_level": reading_level,
        "sentiment_polarity": polarity,
        "ai_generated_likelihood": ai_prob,
        "suspicious_snippets": suspicious_snippets,
        "num_words": num_words
    }
