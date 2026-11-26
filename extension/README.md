# TrustLens Chrome Extension (Manifest V3)

The official **TrustLens Browser Extension** enables 1-click extraction and forensic analysis of customer reviews directly from protected e-commerce and review platforms that block automated scrapers, including:

- **Amazon** (US, UK, DE, IN, CA, JP)
- **Flipkart**
- **Trustpilot**
- **Google Maps**
- **Yelp**
- Any generic review or testimonial page

---

## 🚀 Quick Installation (Developer Mode - 30 Seconds)

1. Open Google Chrome (or Microsoft Edge / Brave / Opera).
2. Navigate to `chrome://extensions/` in your browser address bar.
3. Toggle the **"Developer mode"** switch in the top-right corner to **ON**.
4. Click the **"Load unpacked"** button in the top-left toolbar.
5. Select the `extension/` directory from this repository:
   ```
   d:\CodeWorks\AntiGravity\FakeReviewDetection\extension
   ```
6. The **TrustLens** icon will appear in your browser toolbar! (Click the puzzle piece icon to pin it for easy access).

---

## 💡 How It Works

1. Open any product page on Amazon, Flipkart, or Trustpilot in your browser.
2. Click the **TrustLens** extension icon in your toolbar.
3. The extension instantly scans the page DOM, detects verified reviews, ratings, and timestamps.
4. Click **"Analyze in TrustLens"**:
   - The extension securely POSTs the reviews to your local TrustLens backend (`http://localhost:8000/api/analyze-reviews`).
   - TrustLens executes the full ML + linguistic + account intelligence pipeline and generates a forensic report.
   - The full interactive report automatically opens in a new tab (`http://localhost:3000/report/{id}`)!
5. You can also click **"Copy JSON"** or **"Copy CSV"** to inspect or export the raw extracted data.

---

## 🛠️ Permissions

The extension uses minimal Manifest V3 permissions:
- `activeTab`: To inspect only the currently opened product tab when you click the extension.
- `scripting`: To execute the DOM extraction routine.
- `storage`: To persist user settings.
- `host_permissions`: To allow sending the extracted review payload to `localhost:8000` / `localhost:3000`.
