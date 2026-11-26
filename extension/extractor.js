/**
 * TrustLens DOM Review Extractor Engine
 * Supports Amazon, Flipkart, Trustpilot, Google Maps, Yelp, and Generic fallback.
 */

function parseRating(text) {
  if (!text) return 5.0;
  const match = text.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const val = parseFloat(match[1]);
    return val > 5.0 ? Math.min(val / 20.0, 5.0) : val; // Handle 100-point scales
  }
  return 5.0;
}

function parseDate(text) {
  if (!text) return "Recent";
  const cleaned = text.replace(/Reviewed in.*?on/i, '').replace(/on/i, '').trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return cleaned || "Recent";
}

function extractFromAmazon() {
  const reviews = [];
  const title = document.querySelector('#productTitle')?.innerText?.trim() ||
                document.querySelector('h1.product-title')?.innerText?.trim() ||
                document.title.split(':')[0].trim();

  // Try standard review cards
  const cards = document.querySelectorAll('div[data-hook="review"], .review, [id^="customer_review-"]');
  cards.forEach(card => {
    const authorEl = card.querySelector('[data-hook="review-author"] .a-profile-name') ||
                     card.querySelector('.a-profile-name') ||
                     card.querySelector('.review-author');
    const author = authorEl?.innerText?.trim() || "Amazon Customer";

    const bodyEl = card.querySelector('[data-hook="review-body"] span') ||
                   card.querySelector('.review-text-content span') ||
                   card.querySelector('.review-text');
    const body = bodyEl?.innerText?.trim() || "";
    if (body.length < 5) return;

    const starEl = card.querySelector('[data-hook="review-star-rating"] span') ||
                   card.querySelector('.a-icon-alt') ||
                   card.querySelector('.review-rating span');
    const rating = parseRating(starEl?.innerText || starEl?.textContent || "5.0");

    const dateEl = card.querySelector('[data-hook="review-date"]') || card.querySelector('.review-date');
    const date = parseDate(dateEl?.innerText || "");

    const verifiedEl = card.querySelector('[data-hook="avp-badge"]') ||
                       card.querySelector('.a-declarative[data-action="reviews:filter-by-verified-purchase"]');
    const isVerified = Boolean(verifiedEl || card.innerText.includes("Verified Purchase"));

    const helpfulEl = card.querySelector('[data-hook="helpful-vote-statement"]') || card.querySelector('.cr-vote-text');
    const helpfulMatch = helpfulEl?.innerText?.match(/(\d+)/);
    const helpfulVotes = helpfulMatch ? parseInt(helpfulMatch[1], 10) : 0;

    reviews.push({
      reviewer_name: author,
      review_text: body,
      rating: rating,
      date: date,
      helpful_votes: helpfulVotes,
      verified_purchase: isVerified
    });
  });

  return { platform: "amazon", title, reviews };
}

function extractFromFlipkart() {
  const reviews = [];
  const title = document.querySelector('span.B_NuCI')?.innerText?.trim() ||
                document.querySelector('h1')?.innerText?.trim() ||
                document.title.split('|')[0].trim();

  const cards = document.querySelectorAll('div._27M-vq, div._16vuXW, div.cPHDOP, div.col.EPCmJX, div._2wzgFH');
  cards.forEach(card => {
    const authorEl = card.querySelector('p._2sc7ZR') || card.querySelector('p._2V57B3');
    const author = authorEl?.innerText?.trim() || "Flipkart Customer";

    const bodyEl = card.querySelector('div.t-ZTKy div div') ||
                   card.querySelector('div.t-ZTKy') ||
                   card.querySelector('div.ZmyHeo') ||
                   card.querySelector('div._6K-7Co');
    const body = bodyEl?.innerText?.trim() || "";
    if (body.length < 5) return;

    const ratingEl = card.querySelector('div._3LWZlK') || card.querySelector('div.XQDdHH');
    const rating = parseRating(ratingEl?.innerText || "5");

    const dateParas = card.querySelectorAll('p._2sc7ZR');
    const dateText = dateParas.length > 1 ? dateParas[1].innerText : "Recent";

    const isVerified = Boolean(card.innerText.includes("Certified Buyer") || card.innerText.includes("Verified"));

    reviews.push({
      reviewer_name: author,
      review_text: body,
      rating: rating,
      date: dateText,
      helpful_votes: 0,
      verified_purchase: isVerified
    });
  });

  return { platform: "flipkart", title, reviews };
}

function extractFromTrustpilot() {
  const reviews = [];
  const title = document.querySelector('span.title_title__99bds')?.innerText?.trim() ||
                document.querySelector('h1')?.innerText?.trim() ||
                document.title.split('|')[0].trim();

  const cards = document.querySelectorAll('article[data-service-review-card-paper], article, div.styles_reviewCard__');
  cards.forEach(card => {
    const authorEl = card.querySelector('[data-consumer-name-typography]') ||
                     card.querySelector('aside span') ||
                     card.querySelector('.typography_heading-xxs__KVAY4');
    const author = authorEl?.innerText?.trim() || "Trustpilot Reviewer";

    const bodyEl = card.querySelector('[data-service-review-text-typography]') ||
                   card.querySelector('p.typography_body-l__KUYFJ') ||
                   card.querySelector('p[data-service-review-text]');
    const body = bodyEl?.innerText?.trim() || "";
    if (body.length < 5) return;

    let rating = 5.0;
    const ratingContainer = card.querySelector('[data-service-review-rating]');
    if (ratingContainer) {
      rating = parseFloat(ratingContainer.getAttribute('data-service-review-rating') || "5");
    } else {
      const starImg = card.querySelector('img[alt*="Rated"]');
      if (starImg?.alt) rating = parseRating(starImg.alt);
    }

    const timeEl = card.querySelector('time');
    const date = timeEl?.getAttribute('datetime')?.split('T')[0] || timeEl?.innerText?.trim() || "Recent";

    const isVerified = Boolean(
      card.querySelector('[data-service-review-verification-badge]') ||
      card.innerText.toLowerCase().includes("verified")
    );

    reviews.push({
      reviewer_name: author,
      review_text: body,
      rating: rating,
      date: date,
      helpful_votes: 0,
      verified_purchase: isVerified
    });
  });

  return { platform: "trustpilot", title, reviews };
}

function extractFromGoogleMaps() {
  const reviews = [];
  const title = document.querySelector('h1.DUwDvf')?.innerText?.trim() ||
                document.querySelector('h1')?.innerText?.trim() ||
                document.title.split('-')[0].trim();

  const cards = document.querySelectorAll('div.jftiEf, div[data-review-id]');
  cards.forEach(card => {
    const authorEl = card.querySelector('div.d4r55') || card.querySelector('.d4r55');
    const author = authorEl?.innerText?.trim() || "Google User";

    const bodyEl = card.querySelector('span.wiI7pd') || card.querySelector('.MyEned span');
    const body = bodyEl?.innerText?.trim() || "";
    if (body.length < 5) return;

    const starEl = card.querySelector('span.kvMYJc');
    const rating = parseRating(starEl?.getAttribute('aria-label') || "5");

    const dateEl = card.querySelector('span.rsqaWe');
    const date = dateEl?.innerText?.trim() || "Recent";

    reviews.push({
      reviewer_name: author,
      review_text: body,
      rating: rating,
      date: date,
      helpful_votes: 0,
      verified_purchase: true
    });
  });

  return { platform: "google_maps", title, reviews };
}

function extractFromYelp() {
  const reviews = [];
  const title = document.querySelector('h1')?.innerText?.trim() || document.title.split('-')[0].trim();

  const cards = document.querySelectorAll('li.margin-b5__09f24__pTvws, div.review, [data-review-id]');
  cards.forEach(card => {
    const authorEl = card.querySelector('a.css-19v1rkv') || card.querySelector('[data-testid="UserPassportInfo"] a') || card.querySelector('.user-passport-info');
    const author = authorEl?.innerText?.trim() || "Yelp User";

    const bodyEl = card.querySelector('p.comment__09f24__gu0r6') || card.querySelector('.raw__09f24__T4Ezm') || card.querySelector('p span');
    const body = bodyEl?.innerText?.trim() || "";
    if (body.length < 10) return;

    const starEl = card.querySelector('div[aria-label*="star rating"]');
    const rating = parseRating(starEl?.getAttribute('aria-label') || "5");

    const dateEl = card.querySelector('span.css-chan6m');
    const date = dateEl?.innerText?.trim() || "Recent";

    reviews.push({
      reviewer_name: author,
      review_text: body,
      rating: rating,
      date: date,
      helpful_votes: 0,
      verified_purchase: false
    });
  });

  return { platform: "yelp", title, reviews };
}

function extractGenericReviews() {
  const reviews = [];
  const title = document.querySelector('h1')?.innerText?.trim() || document.title.split('|')[0].trim();

  // Look for any elements with review / comment keywords
  const candidates = document.querySelectorAll('.review, .comment, [itemprop="review"], .testimonial');
  candidates.forEach(el => {
    const bodyEl = el.querySelector('[itemprop="reviewBody"], .body, .text, .content, p') || el;
    const body = bodyEl?.innerText?.trim() || "";
    if (body.length < 15 || body.length > 4000) return;

    const authorEl = el.querySelector('[itemprop="author"], .author, .name, .user');
    const author = authorEl?.innerText?.trim() || "Customer";

    reviews.push({
      reviewer_name: author,
      review_text: body,
      rating: 5.0,
      date: "Recent",
      helpful_votes: 0,
      verified_purchase: false
    });
  });

  return { platform: "generic", title, reviews: reviews.slice(0, 50) };
}

/**
 * Universal Review Extractor Router
 */
function extractReviewsFromCurrentPage() {
  const host = window.location.hostname.toLowerCase();
  let result;

  if (host.includes("amazon.")) {
    result = extractFromAmazon();
  } else if (host.includes("flipkart.")) {
    result = extractFromFlipkart();
  } else if (host.includes("trustpilot.")) {
    result = extractFromTrustpilot();
  } else if (host.includes("google.") && window.location.pathname.includes("/maps")) {
    result = extractFromGoogleMaps();
  } else if (host.includes("yelp.")) {
    result = extractFromYelp();
  } else {
    // Try each specific extractor before generic
    result = extractFromAmazon();
    if (!result.reviews.length) result = extractFromTrustpilot();
    if (!result.reviews.length) result = extractGenericReviews();
  }

  return {
    url: window.location.href,
    platform: result.platform,
    title: result.title || document.title || "Product Listing",
    count: result.reviews.length,
    reviews: result.reviews
  };
}

// Attach to window for bookmarklet and content script access
if (typeof window !== "undefined") {
  window.extractReviewsFromCurrentPage = extractReviewsFromCurrentPage;
}
