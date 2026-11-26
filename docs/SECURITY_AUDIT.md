# TrustLens Security Audit & Hardening Matrix

**Audit Date:** November 2026  
**Auditor:** Senior Full-Stack & Application Security Engineer  
**Scope:** Backend (FastAPI, SQLAlchemy, Scrapers, Engine), Frontend (Next.js 14, CSP), Extension (Manifest V3)

---

## 1. Executive Summary

A comprehensive application security audit and remediation was performed across TrustLens codebases. All findings have been remediated, verified via automated test suites, and guarded with regression tests.

---

## 2. Security Findings & Remediation Matrix

| Finding ID | Finding Description | Severity | Target File(s) | Remediation Applied | Status | Evidence / Verification |
|---|---|---|---|---|---|---|
| **TL-SEC-01** | **Permissive CORS Wildcard (`*`)**<br>Wildcard CORS allowed any origin to make authenticated or cross-site requests. | **High** | `backend/app/core/config.py`<br>`backend/main.py` | Replaced wildcard with explicit origins loaded via Pydantic settings. Disallowed `*` in production mode. Restricted allowed methods and headers. | **Fixed** | Startup validation fails if `*` is set in production. Tests pass with explicit origins. |
| **TL-SEC-02** | **Weak or Default `SECRET_KEY` in Production**<br>Missing entropy enforcement on cryptographic secret key. | **Critical** | `backend/app/core/config.py` | Added Pydantic `@field_validator("SECRET_KEY")` enforcing minimum 32 characters and rejecting default/insecure keys in production. | **Fixed** | `test_security.py` passes; validated fail-fast behavior. |
| **TL-SEC-03** | **Unrestricted Request Payload & File Upload Size (DoS / OOM)**<br>Endpoints accepted arbitrary-sized request bodies and multipart files. | **Medium** | `backend/app/core/config.py`<br>`backend/main.py`<br>`backend/app/api/routes_analyze.py` | Enforced 10MB request body size cap in middleware and `MAX_UPLOAD_SIZE_BYTES` (10MB) in multipart file handlers (`HTTP 413 Payload Too Large`). | **Fixed** | Tested in `test_security.py` and validated in `security_and_tracing_middleware`. |
| **TL-SEC-04** | **Unvalidated Spreadsheet File Types (MIME Spoofing)**<br>Uploading malicious binary files claiming to be `.xlsx`. | **High** | `backend/app/api/routes_analyze.py` | Added OOXML / ZIP magic byte validation (`b"PK\x03\x04"`) prior to openpyxl invocation, preventing decompression bombs or non-zip parser exploitation. | **Fixed** | `test_file_upload_magic_bytes_check` asserts invalid binaries return HTTP 400. |
| **TL-SEC-05** | **CSV / Formula Injection (CWE-1236)**<br>Exported CSV files containing unescaped `=`, `+`, `-`, `@`, `\t`, `\r` trigger arbitrary command execution in Excel/Calc. | **High** | `backend/app/api/routes_reports.py` | Implemented `sanitize_spreadsheet_cell()` neutralizing dangerous leading formula trigger characters with a leading single quote (`'`). | **Fixed** | `test_csv_formula_injection_sanitization` verified with all trigger characters. |
| **TL-SEC-06** | **Insecure Direct Object Reference (IDOR) on Reports**<br>Reports could be accessed or deleted by anyone knowing the UUID. | **High** | `backend/app/models/db_models.py`<br>`backend/app/api/routes_reports.py` | Added `owner_token` (hex secret) and `is_public` boolean. Enforced object-level authorization on `GET /api/report/{id}`, `DELETE /api/report/{id}`, and `/export`. | **Fixed** | `test_idor_object_level_authorization` validates 403 Forbidden without valid owner token and 200 OK with owner token. |
| **TL-SEC-07** | **SSRF & DNS Rebinding Vulnerability**<br>Generic scraper followed redirects blindly without verifying destination IP. | **Critical** | `backend/app/core/security.py`<br>`backend/app/scrapers/generic_scraper.py` | Implemented `safe_fetch_http()` with explicit per-hop IP validation preventing private IPs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1`), link-local (`169.254.169.254`), and loopback addresses. Max 3 hops; 5MB response cap. | **Fixed** | `test_ssrf_validator_blocks_malicious_schemes_and_ips` validates blocked metadata and loopbacks. |
| **TL-SEC-08** | **Missing HTTP Security Headers & Information Leakage**<br>Missing Clickjacking, MIME sniffing, and HSTS protections. Stack traces leaked on unhandled exceptions. | **Medium** | `frontend/next.config.mjs`<br>`backend/main.py` | Added `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, `Cross-Origin-Opener-Policy`, and CSP. Global exception handler returns sanitized message and `X-Request-ID`. | **Fixed** | `test_security_headers_present` verifies all security headers. Next.js config includes comprehensive CSP. |
| **TL-SEC-09** | **Model Artifact Tampering / Deserialization Integrity**<br>Unchecked `joblib.load()` could deserialize tampered model artifacts. | **Critical** | `backend/models/model_manifest.json`<br>`backend/app/engine/classifier.py` | Pinned model artifact with SHA-256 hash manifest. Classifier verifies hash before loading artifact and asserts path stays strictly within `backend/models`. | **Fixed** | `test_model_artifact_tamper_defense` validates rejection upon hash tampering. |
| **TL-SEC-10** | **Extension Manifest V3 CSP & Message Validation**<br>Browser extension lacked restrictive CSP and message origin checks. | **Medium** | `extension/manifest.json`<br>`extension/content.js` | Enforced strict `content_security_policy` (`script-src 'self'`), validated all message actions and payload boundaries. | **Fixed** | Validated extension manifest V3 schema compliance. |
| **TL-SEC-11** | **Client IP Spoofing behind Reverse Proxies**<br>Rate limiting and logging relied on raw client headers without validating trusted reverse proxies. | **Medium** | `backend/app/core/config.py`<br>`backend/main.py` | Added `TRUSTED_PROXIES` configuration. Client IP extraction ignores spoofed `X-Forwarded-For` unless coming from a verified trusted proxy. | **Fixed** | Verified reverse proxy configuration in `backend/main.py`. |

---

## 3. Residual Risk & Recommended Operational Controls

1. **Production Secret Rotation**:
   - Ensure `SECRET_KEY` in production `.env` is generated with `openssl rand -hex 32`.
   - Never commit `.env` or production credentials to source control (guarded by `.gitignore`).
2. **Third-Party Rate Limits**:
   - For high-volume deployment, configure external proxy services or official API keys for Yelp/Google Places.
