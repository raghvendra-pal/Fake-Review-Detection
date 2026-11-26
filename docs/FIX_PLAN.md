# TrustLens: Full Fix, Security Hardening, Accuracy Upgrade, and Deploy-Readiness Plan

**Document:** `docs/FIX_PLAN.md`  
**Date:** November 2026  
**Architect:** Full-Stack & Application Security Engineer  
**Status:** In Progress

---

## 1. Repository Inventory & Baseline

### 1.1 Backend Architecture (FastAPI + Python 3.13)
- **Framework:** FastAPI with Uvicorn, Pydantic v2 Settings.
- **Database:** SQLAlchemy 2.0 ORM with SQLite (development) and PostgreSQL readiness.
- **ML Engine:** Sublinear TF-IDF (`ngram_range=(1,2)`, `max_features=12000`) + Calibrated Logistic Regression + Localized token attribution.
- **Rule Engines:** Linguistic behavioral analysis (superlatives, length, readability, sentiment-rating mismatch, perplexity heuristic), Account clustering (RapidFuzz Levenshtein & Jaro-Winkler), Spam burst detection (Z-score spike windows), Network community graph (NetworkX).
- **Scraper Suite:** SSRF-protected router covering Google Play Store (`google-play-scraper`), Trustpilot, Yelp Fusion API, Google Places API, with smart proxies (ScraperAPI / Apify) and graceful client-side fallbacks.
- **Backend Routes:**
  - `GET /` & `GET /health`
  - `POST /api/analyze-url`
  - `POST /api/analyze-reviews`
  - `POST /api/analyze-file`
  - `POST /api/quick-check`
  - `POST /api/compare`
  - `POST /api/article-check`
  - `GET /api/reports`
  - `GET /api/report/{id}`
  - `GET /api/report/{id}/export`
  - `GET /api/demos` & `GET /api/demo/{name}`

### 1.2 Frontend Architecture (Next.js 14 App Router + Tailwind CSS)
- **Pages:**
  - `/` (Home landing page + interactive search)
  - `/report/[id]` (Full forensic intelligence dashboard)
  - `/bulk` (Batch review table + ring detection)
  - `/compare` (Side-by-side trust comparison)
  - `/quick-check` (Single review attribution scanner)
  - `/article-check` (News credibility & clickbait analysis)
  - `/history` (Audit log & past reports)
  - `/methodology` (Algorithmic explanations & statistical models)
  - `/api-docs` (REST API documentation)
  - `/extension` (Browser extension & 1-click bookmarklet guide)
- **Root Layout:** `frontend/src/app/layout.tsx` (Contains global styles, fonts, `<Navbar />`, `<Footer />`).

---

## 2. Execution Phases

### Phase A: Critical UI Bug & Nav Layout Fix
1. **Header Duplication Fix**:
   - `frontend/src/app/extension/page.tsx` currently imports and renders `<Navbar />` and `<Footer />`, while `frontend/src/app/layout.tsx` *already* renders `<Navbar />` and `<Footer />` globally.
   - Remove `<Navbar />` and `<Footer />` from `extension/page.tsx` and ensure all sub-pages rely exclusively on the single root layout navbar.
2. **Navbar Clutter & Wrap Fix**:
   - Add `whitespace-nowrap` to all navigation labels.
   - Reorganize navbar into 5 primary links: `Home`, `Quick Check`, `Bulk Analyzer`, `Compare`, `History`.
   - Move secondary links (`News Credibility`, `Browser Extension`, `Methodology`, `API Docs`) under an accessible `"More"` dropdown.
   - Retain primary CTA buttons (`Instant Check` and `Analyze Bulk`).
   - Add responsive mobile hamburger menu with accessible drawer (focus trap, Escape key handling, backdrop lock, ARIA expanded state).
   - Ensure active link highlighting matches current route via `pathname`.

### Phase B: Security Hardening & Audit
1. **Secrets & Env Variables**:
   - Audit all code for hardcoded secrets, move to `.env` with strict validation via Pydantic Settings.
   - Ensure only `NEXT_PUBLIC_` variables are accessible in frontend.
   - Update `.gitignore` to strictly exclude `.env`, `.env.local`, `*.pem`, `*.key`.
   - Update `.env.example` with clean placeholders.
2. **Authorization & IDOR Prevention**:
   - Scope reports with unguessable UUIDv4 + secret access tokens/tokens for sharing.
   - Enforce object-level verification on report access, exports, and deletion.
3. **Input Sanitization & Injection Defense**:
   - Pydantic models for all request inputs (character length limits, regex validation, URL scheme restrictions).
   - Spreadsheet injection mitigation: prefix dangerous leading characters (`=`, `+`, `-`, `@`, `\t`, `\r`) with single quote `'` in CSV/Excel exports.
   - Upload MIME-type and magic-byte validation on file uploads with size caps (max 10MB).
4. **Rate Limiting & Proxy Trust**:
   - SlowAPI rate limits on all endpoints with real IP resolution using trusted proxy middleware.
   - Return standard HTTP 429 with `Retry-After`.
5. **CORS & Security Headers**:
   - Disallow wildcard `*` with credentials. Explicit allowed origins from `CORS_ORIGINS`.
   - Configure security headers: CSP, HSTS, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy, COOP.
6. **Model Artifact Integrity**:
   - Compute SHA-256 hash of `fake_review_model.joblib`. Verify hash against `model_manifest.json` before loading to prevent arbitrary code execution.
7. **SSRF Guard Re-verification**:
   - Validate destination IP after DNS resolution, enforce redirects re-validation, block private/loopback/link-local/cloud metadata (169.254.169.254).
8. **Logging & Error Hygiene**:
   - Eliminate stack traces from HTTP responses; return standardized error schema with unique `request_id`.
   - Redact passwords, tokens, and PII from logs.
9. **Documentation**:
   - Generate `docs/SECURITY_AUDIT.md`.

### Phase C: Backend & ML Accuracy Upgrade
1. **Evaluation Methodology & Dataset Documentation**:
   - Document datasets and licenses in `docs/DATA.md`.
   - Implement group-aware stratified cross-validation (splitting by product and reviewer) to avoid data leakage.
2. **Model Evaluation & Metrics Reporting**:
   - Compute precision, recall, F1, ROC-AUC, PR-AUC, and Brier calibration score.
   - Document in `docs/MODEL_CARD.md`.
3. **Calibration & Uncertainty Abstention**:
   - Add confidence/abstention threshold: if probability is in ambiguous window (e.g. 42% - 58%), flag as `uncertain` with "Human Review Recommended".
4. **Threadpool Offloading**:
   - Wrap synchronous scraping and CPU-bound ML inference in threadpool (`run_in_threadpool` / `asyncio.to_thread`) to prevent blocking FastAPI event loop.

### Phase D: Frontend Quality & UX Fixes
1. **No Horizontal Scroll**:
   - Set overflow constraints (`overflow-x-hidden`) on wrappers, ensure tables use dedicated horizontal scroll containers.
2. **Metadata & SEO**:
   - Root layout metadata template (`%s | TrustLens - Fake Review Intelligence`), meta descriptions, canonical URLs, OpenGraph/Twitter cards.
   - Custom `not-found.tsx`, `error.tsx`, `global-error.tsx`.
   - `app/sitemap.ts` and `app/robots.ts`.
3. **Favicon & Web App Manifest**:
   - Add favicon.ico, icon.svg, apple-touch-icon.png, and `manifest.webmanifest`.
4. **Button & State Audit**:
   - Verify every button has loading/disabled states and no broken hrefs.

### Phase E: Domain & Deployment Readiness
1. **Config & Environment**:
   - Separate development and production settings.
   - Wire `NEXT_PUBLIC_SITE_URL` for canonical URLs, sitemap, OpenGraph.
2. **Docker & Infrastructure**:
   - Multi-stage Dockerfiles for backend and frontend with non-root user.
   - `docker-compose.yml` for unified local / staging orchestration.
3. **CI/CD Automation**:
   - GitHub Actions workflow running lint, type-check, unit tests, and security audits on push.
4. **Documentation**:
   - Comprehensive `DEPLOYMENT.md`.

### Phase F: Verification Gate
- Execute all verification checks and compile results in `docs/VERIFICATION_LOG.md`.
- Produce final wrap-up report in `docs/FINAL_REPORT.md`.
