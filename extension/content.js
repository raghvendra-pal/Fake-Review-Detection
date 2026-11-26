/**
 * TrustLens Chrome Extension Content Script
 * Validates incoming runtime messages and triggers secure DOM extraction.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Security: Validate message origin and structure
  if (!request || typeof request !== "object") {
    sendResponse({ success: false, error: "Invalid message payload" });
    return true;
  }

  if (request.action === "EXTRACT_REVIEWS") {
    try {
      if (typeof window.extractReviewsFromCurrentPage === "function") {
        const data = window.extractReviewsFromCurrentPage();
        sendResponse({ success: true, data });
      } else {
        sendResponse({ success: false, error: "Extractor engine not yet initialized on active DOM." });
      }
    } catch (err) {
      sendResponse({ success: false, error: String(err && err.message ? err.message : err) });
    }
  }
  return true;
});
