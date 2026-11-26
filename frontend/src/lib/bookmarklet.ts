/**
 * TrustLens Browser Bookmarklet Generator
 * Extracts reviews from Amazon, Flipkart, Trustpilot, and Google Maps with 0-install.
 */

export const BOOKMARKLET_RAW_SCRIPT = `
(function() {
  function parseRating(text) {
    if (!text) return 5.0;
    var match = text.match(/([0-9]+(?:\\.[0-9]+)?)/);
    if (match) {
      var val = parseFloat(match[1]);
      return val > 5.0 ? Math.min(val / 20.0, 5.0) : val;
    }
    return 5.0;
  }

  function parseDate(text) {
    if (!text) return "Recent";
    var cleaned = text.replace(/Reviewed in.*?on/i, '').replace(/on/i, '').trim();
    var d = new Date(cleaned);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return cleaned || "Recent";
  }

  var host = window.location.hostname.toLowerCase();
  var reviews = [];
  var title = document.title.split(/[-|:]/)[0].trim() || "Product Listing";

  // 1. Amazon Extractor
  if (host.indexOf("amazon.") !== -1) {
    var titleEl = document.querySelector('#productTitle') || document.querySelector('h1.product-title');
    if (titleEl) title = titleEl.innerText.trim();
    var cards = document.querySelectorAll('div[data-hook="review"], .review, [id^="customer_review-"]');
    cards.forEach(function(card) {
      var authorEl = card.querySelector('[data-hook="review-author"] .a-profile-name') || card.querySelector('.a-profile-name');
      var bodyEl = card.querySelector('[data-hook="review-body"] span') || card.querySelector('.review-text-content span') || card.querySelector('.review-text');
      var starEl = card.querySelector('[data-hook="review-star-rating"] span') || card.querySelector('.a-icon-alt');
      var dateEl = card.querySelector('[data-hook="review-date"]') || card.querySelector('.review-date');
      var verifiedEl = card.querySelector('[data-hook="avp-badge"]');
      var helpfulEl = card.querySelector('[data-hook="helpful-vote-statement"]');
      
      var body = bodyEl ? bodyEl.innerText.trim() : "";
      if (body.length < 5) return;
      var helpful = 0;
      if (helpfulEl && helpfulEl.innerText) {
        var hMatch = helpfulEl.innerText.match(/(\\d+)/);
        if (hMatch) helpful = parseInt(hMatch[1], 10);
      }

      reviews.push({
        reviewer_name: authorEl ? authorEl.innerText.trim() : "Amazon Customer",
        review_text: body,
        rating: parseRating(starEl ? starEl.innerText : "5"),
        date: parseDate(dateEl ? dateEl.innerText : ""),
        helpful_votes: helpful,
        verified_purchase: Boolean(verifiedEl || card.innerText.indexOf("Verified Purchase") !== -1)
      });
    });
  } 
  // 2. Flipkart Extractor
  else if (host.indexOf("flipkart.") !== -1) {
    var fTitle = document.querySelector('span.B_NuCI') || document.querySelector('h1');
    if (fTitle) title = fTitle.innerText.trim();
    var fCards = document.querySelectorAll('div._27M-vq, div._16vuXW, div.cPHDOP, div.col.EPCmJX');
    fCards.forEach(function(card) {
      var authorEl = card.querySelector('p._2sc7ZR');
      var bodyEl = card.querySelector('div.t-ZTKy div div') || card.querySelector('div.t-ZTKy');
      var ratingEl = card.querySelector('div._3LWZlK') || card.querySelector('div.XQDdHH');
      var body = bodyEl ? bodyEl.innerText.trim() : "";
      if (body.length < 5) return;
      reviews.push({
        reviewer_name: authorEl ? authorEl.innerText.trim() : "Flipkart Customer",
        review_text: body,
        rating: parseRating(ratingEl ? ratingEl.innerText : "5"),
        date: "Recent",
        helpful_votes: 0,
        verified_purchase: Boolean(card.innerText.indexOf("Certified Buyer") !== -1)
      });
    });
  }
  // 3. Trustpilot Extractor
  else if (host.indexOf("trustpilot.") !== -1) {
    var tCards = document.querySelectorAll('article[data-service-review-card-paper], article');
    tCards.forEach(function(card) {
      var authorEl = card.querySelector('[data-consumer-name-typography]') || card.querySelector('aside span');
      var bodyEl = card.querySelector('[data-service-review-text-typography]') || card.querySelector('p[data-service-review-text]');
      var ratingEl = card.querySelector('[data-service-review-rating]');
      var timeEl = card.querySelector('time');
      var body = bodyEl ? bodyEl.innerText.trim() : "";
      if (body.length < 5) return;
      reviews.push({
        reviewer_name: authorEl ? authorEl.innerText.trim() : "Trustpilot Reviewer",
        review_text: body,
        rating: parseFloat(ratingEl ? ratingEl.getAttribute('data-service-review-rating') : "5") || 5.0,
        date: timeEl ? (timeEl.getAttribute('datetime') || timeEl.innerText).split('T')[0] : "Recent",
        helpful_votes: 0,
        verified_purchase: Boolean(card.innerText.toLowerCase().indexOf("verified") !== -1)
      });
    });
  }
  // 4. Generic Extractor
  else {
    var gCards = document.querySelectorAll('.review, .comment, [itemprop="review"]');
    gCards.forEach(function(card) {
      var bodyEl = card.querySelector('[itemprop="reviewBody"], .body, .text, p') || card;
      var body = bodyEl ? bodyEl.innerText.trim() : "";
      if (body.length < 15) return;
      reviews.push({
        reviewer_name: "Customer",
        review_text: body,
        rating: 5.0,
        date: "Recent",
        helpful_votes: 0,
        verified_purchase: false
      });
    });
  }

  if (!reviews.length) {
    alert("TrustLens: No reviews could be found on this page. Scroll down to make sure reviews are loaded, or click 'See all reviews'.");
    return;
  }

  // Create Sleek On-Screen Toast
  var toast = document.createElement("div");
  toast.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;background:#070B14;color:#E2E8F0;border:1px solid #10B981;border-radius:12px;padding:16px 20px;font-family:sans-serif;box-shadow:0 10px 25px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:8px;max-width:340px;";
  toast.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><span style="color:#10B981;font-weight:bold;font-size:15px;">🛡️ TrustLens</span><span style="background:rgba(16,185,129,0.2);color:#10B981;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;">' + reviews.length + ' REVIEWS EXTRACTED</span></div><div style="font-size:12px;color:#94A3B8;">Sending reviews to TrustLens backend...</div>';
  document.body.appendChild(toast);

  // Attempt direct POST to TrustLens backend
  var payload = {
    target_title: title,
    target_url: window.location.href,
    reviews: reviews
  };

  fetch("http://localhost:8000/api/analyze-reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(function(res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  })
  .then(function(data) {
    toast.innerHTML = '<div style="color:#10B981;font-weight:bold;">Analysis complete! Opening report...</div>';
    setTimeout(function() {
      toast.remove();
      window.open("http://localhost:3000/report/" + data.id, "_blank");
    }, 800);
  })
  .catch(function(err) {
    // Fallback: Copy JSON and open TrustLens bulk analyzer
    var jsonStr = JSON.stringify(reviews, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
    }
    toast.innerHTML = '<div style="color:#F59E0B;font-weight:bold;">Copied ' + reviews.length + ' reviews to clipboard!</div><div style="font-size:11px;color:#94A3B8;margin-top:4px;">Opening TrustLens Bulk Analyzer...</div>';
    setTimeout(function() {
      toast.remove();
      window.open("http://localhost:3000/bulk", "_blank");
    }, 1500);
  });
})();
`;

// Minified URL encoded version for the <a> href attribute
export const BOOKMARKLET_HREF = `javascript:${encodeURIComponent(
  BOOKMARKLET_RAW_SCRIPT.replace(/\s+/g, " ").trim()
)}`;
