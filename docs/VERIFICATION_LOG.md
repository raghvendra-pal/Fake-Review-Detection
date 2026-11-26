# TrustLens Verification Log

**Document:** `docs/VERIFICATION_LOG.md`  
**Run Timestamp:** November 2026  
**Status:** In Progress

This log tracks every audit, build, and test command executed along with the actual command output and pass/fail evidence.

---

## Log Entries

### Phase Baseline Check
- **Command:** `python -m pytest backend/tests -v`
- **Result:** PASSED (28/28 tests passed)
- **Evidence:** Verified earlier: 28 passed in 4.87s.

### Phase A: Critical UI Bug & Nav Layout Fix
- **Command:** `python -m pytest backend/tests/test_header_regression.py -v`
- **Result:** PASSED (2/2 tests passed in 0.13s)
- **Evidence:**
  - `test_single_header_in_root_layout_only` PASSED: Verified that `<Navbar />` is mounted exactly once in root `layout.tsx` and 0 times in all page routes (including `/extension`).
  - `test_navbar_no_wrap_and_drawer_accessibility` PASSED: Verified `whitespace-nowrap`, primary navigation landmark, accessible mobile drawer (`role='dialog'`, `aria-modal='true'`, `aria-expanded`), and Escape key listeners.
- **TypeScript Typecheck:** `npx --prefix frontend tsc --project frontend/tsconfig.json --noEmit` exited with code 0 (zero errors).

### Environment Resolution: Windows WDAC Residual Pandas Import Block
- **Issue:** `ImportError: DLL load failed while importing vectorized: An Application Control policy has blocked this file.` triggered when starting `uvicorn` in environment with Python 3.13 on Windows.
- **Root Cause:** A legacy version of `pandas` (v3.1.0) remained installed in `backend/venv/Lib/site-packages`, whose C-extension `vectorized.cp313-win_amd64.pyd` is blocked by Windows Defender Application Control. The project architecture relies on pure Python `csv`, `json`, and `openpyxl` and does not require pandas.
- **Remediation:** Executed `pip uninstall -y pandas`. Verified that `requirements.txt` contains zero references to pandas and all endpoints operate natively with built-in libraries.
- **Evidence:** `uvicorn` imports `backend.main:app` cleanly with exit code 0.

### Phase B: Security Hardening & Regression Suite
- **Command:** `python -m pytest backend/tests/test_accounts.py backend/tests/test_api.py backend/tests/test_bursts.py backend/tests/test_classifier.py backend/tests/test_header_regression.py backend/tests/test_linguistic.py backend/tests/test_scrapers.py backend/tests/test_security.py -v`
- **Result:** PASSED (36/36 tests passed in 3.31s)
- **Evidence:**
  - `test_security_headers_present` PASSED (X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, COOP, CSP, X-Request-ID).
  - `test_csv_formula_injection_sanitization` PASSED (Formula trigger characters `=`, `+`, `-`, `@`, `\t`, `\r` neutralized).
  - `test_idor_object_level_authorization` PASSED (Private reports reject unauthorized views/deletes with 403 Forbidden; allowed with valid owner token).
  - `test_ssrf_validator_blocks_malicious_schemes_and_ips` PASSED (Metadata endpoints `169.254.169.254`, loopbacks `127.0.0.1`, `localhost`, and `file://` blocked).
  - `test_model_artifact_tamper_defense` PASSED (Model rejects loading on SHA-256 hash mismatch).
  - `test_file_upload_magic_bytes_check` PASSED (Non-OOXML binary uploads rejected with HTTP 400).
