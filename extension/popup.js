/**
 * TrustLens Extension Popup Logic
 */

let extractedPayload = null;
const BACKEND_API = "http://localhost:8000/api/analyze-reviews";
const FRONTEND_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  initPopup();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById("btn-analyze").addEventListener("click", handleAnalyze);
  document.getElementById("btn-copy-json").addEventListener("click", handleCopyJson);
  document.getElementById("btn-copy-csv").addEventListener("click", handleCopyCsv);
  document.getElementById("btn-refresh").addEventListener("click", scanActiveTab);
}

function showToast(message, duration = 2500) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

async function scanActiveTab() {
  const pageTitleEl = document.getElementById("page-title");
  const platformBadge = document.getElementById("platform-badge");
  const countEl = document.getElementById("review-count");
  const previewList = document.getElementById("reviews-preview-list");

  pageTitleEl.innerText = "Scanning page...";
  platformBadge.innerText = "SCANNING";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      pageTitleEl.innerText = "No active browser tab found.";
      return;
    }

    // Attempt to message the content script
    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_REVIEWS" }, async (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // If content script wasn't injected yet, inject extractor and content scripts dynamically
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["extractor.js"]
          });
          
          const [execResult] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.extractReviewsFromCurrentPage ? window.extractReviewsFromCurrentPage() : null
          });

          if (execResult && execResult.result) {
            handleExtractionSuccess(execResult.result);
          } else {
            handleNoReviewsFound();
          }
        } catch (e) {
          handleNoReviewsFound(e.message);
        }
      } else {
        handleExtractionSuccess(response.data);
      }
    });
  } catch (err) {
    handleNoReviewsFound(err.message);
  }
}

function handleExtractionSuccess(data) {
  extractedPayload = data;
  const { platform, title, reviews, count } = data;

  // Platform badge
  const platformBadge = document.getElementById("platform-badge");
  platformBadge.innerText = platform.toUpperCase().replace("_", " ");
  platformBadge.style.color = "#10B981";
  platformBadge.style.borderColor = "rgba(16, 185, 129, 0.4)";

  // Title & Count
  document.getElementById("page-title").innerText = title || "Product Listing";
  document.getElementById("review-count").innerText = `${count} Reviews Found`;

  const btnAnalyze = document.getElementById("btn-analyze");
  const btnJson = document.getElementById("btn-copy-json");
  const btnCsv = document.getElementById("btn-copy-csv");

  if (count > 0) {
    btnAnalyze.disabled = false;
    btnJson.disabled = false;
    btnCsv.disabled = false;
    renderPreview(reviews);
  } else {
    btnAnalyze.disabled = true;
    btnJson.disabled = true;
    btnCsv.disabled = true;
    renderEmptyState("No reviews found. If you are on an e-commerce page, make sure reviews have loaded or scroll down.");
  }
}

function handleNoReviewsFound(msg = null) {
  document.getElementById("platform-badge").innerText = "UNKNOWN";
  document.getElementById("page-title").innerText = "Unable to read page reviews";
  document.getElementById("review-count").innerText = "0 Reviews";
  renderEmptyState(msg || "Could not access this page. Protected browser pages like chrome:// cannot be scanned.");
}

function renderEmptyState(text) {
  const previewList = document.getElementById("reviews-preview-list");
  previewList.innerHTML = `<div class="empty-state">${text}</div>`;
}

function renderPreview(reviews) {
  const previewList = document.getElementById("reviews-preview-list");
  previewList.innerHTML = "";

  reviews.slice(0, 3).forEach(r => {
    const item = document.createElement("div");
    item.className = "review-item";

    const stars = "★".repeat(Math.round(r.rating)) + "☆".repeat(5 - Math.round(r.rating));

    item.innerHTML = `
      <div class="review-item-header">
        <span class="review-author">${escapeHtml(r.reviewer_name)}</span>
        <span class="review-rating">${stars}</span>
      </div>
      <div class="review-snippet">${escapeHtml(r.review_text)}</div>
    `;
    previewList.appendChild(item);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function handleAnalyze() {
  if (!extractedPayload || !extractedPayload.reviews.length) return;

  const btn = document.getElementById("btn-analyze");
  const btnText = document.getElementById("btn-analyze-text");
  btn.disabled = true;
  btnText.innerText = "Analyzing Forensic Signals...";

  try {
    const response = await fetch(BACKEND_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_title: extractedPayload.title,
        target_url: extractedPayload.url,
        reviews: extractedPayload.reviews
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const report = await response.json();
    if (report && report.id) {
      showToast("Report generated! Opening TrustLens...");
      chrome.tabs.create({ url: `${FRONTEND_BASE}/report/${report.id}` });
    } else {
      throw new Error("Invalid report response");
    }
  } catch (err) {
    showToast(`Error connecting to TrustLens backend: ${err.message}. Make sure backend is running on localhost:8000.`);
    console.error("TrustLens analyze error:", err);
  } finally {
    btn.disabled = false;
    btnText.innerText = "Analyze in TrustLens";
  }
}

function handleCopyJson() {
  if (!extractedPayload) return;
  const jsonStr = JSON.stringify(extractedPayload.reviews, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    showToast(`Copied ${extractedPayload.reviews.length} reviews as JSON!`);
  });
}

function handleCopyCsv() {
  if (!extractedPayload || !extractedPayload.reviews.length) return;

  const headers = ["reviewer_name", "rating", "date", "verified_purchase", "helpful_votes", "review_text"];
  const rows = extractedPayload.reviews.map(r => [
    `"${(r.reviewer_name || '').replace(/"/g, '""')}"`,
    r.rating || 5,
    `"${r.date || ''}"`,
    r.verified_purchase ? "true" : "false",
    r.helpful_votes || 0,
    `"${(r.review_text || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  navigator.clipboard.writeText(csvContent).then(() => {
    showToast(`Copied ${extractedPayload.reviews.length} reviews as CSV!`);
  });
}

function initPopup() {
  scanActiveTab();
}
