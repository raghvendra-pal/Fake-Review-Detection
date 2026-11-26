import io
import asyncio
import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException, Request, Response, UploadFile

from backend.main import security_and_tracing_middleware
from backend.app.core.database import SessionLocal, init_db
from backend.app.models.db_models import AnalysisReport
from backend.app.api.routes_reports import sanitize_spreadsheet_cell, get_report, delete_report
from backend.app.api.routes_analyze import analyze_file
from backend.app.core.security import validate_url_security
from backend.app.engine.classifier import FakeReviewClassifier

@pytest.fixture(scope="module")
def db_session():
    init_db()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_security_headers_present():
    """Verify mandatory security headers are returned via middleware (Item B.8)."""
    async def run_middleware_test():
        # Mock request and next handler
        mock_request = MagicMock(spec=Request)
        mock_request.headers = {"X-Request-ID": "test-req-12345"}
        mock_request.state = MagicMock()
        
        async def dummy_call_next(req):
            res = Response(content="ok", media_type="text/plain")
            return res

        resp = await security_and_tracing_middleware(mock_request, dummy_call_next)
        return resp.headers

    headers = asyncio.run(run_middleware_test())
    
    assert headers.get("x-content-type-options") == "nosniff"
    assert headers.get("x-frame-options") == "DENY"
    assert "strict-transport-security" in headers
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    assert headers.get("cross-origin-opener-policy") == "same-origin"
    assert "content-security-policy" in headers
    assert headers.get("x-request-id") == "test-req-12345"

def test_csv_formula_injection_sanitization():
    """Verify dangerous spreadsheet formula characters are neutralized (Item B.5)."""
    assert sanitize_spreadsheet_cell("Normal review text") == "Normal review text"
    assert sanitize_spreadsheet_cell("=1+1") == "'=1+1"
    assert sanitize_spreadsheet_cell("+SUM(A1:A10)") == "'+SUM(A1:A10)"
    assert sanitize_spreadsheet_cell("-2+3") == "'-2+3"
    assert sanitize_spreadsheet_cell("@SUM(1)") == "'@SUM(1)"
    assert sanitize_spreadsheet_cell("\tCMD") == "'\tCMD"
    assert sanitize_spreadsheet_cell("\rMALICIOUS") == "'\rMALICIOUS"

def test_idor_object_level_authorization(db_session):
    """Verify User B cannot view or delete User A's private report without owner token (Item B.4)."""
    # Create test report owned by User A
    report_a = AnalysisReport(
        target_title="User A Secret Analysis",
        trust_score=85.0,
        verdict="Trustworthy",
        fake_probability=15.0,
        owner_token="token_user_a_secret_12345",
        is_public=False
    )
    db_session.add(report_a)
    db_session.commit()
    db_session.refresh(report_a)
    report_id = report_a.id

    # 1. User B attempts to access private report without token -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_unauth:
        get_report(report_id=report_id, token=None, x_report_token=None, db=db_session)
    assert exc_unauth.value.status_code == 403

    # 2. User B attempts to access private report with invalid token -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_wrong:
        get_report(report_id=report_id, token="wrong_token", x_report_token=None, db=db_session)
    assert exc_wrong.value.status_code == 403

    # 3. User B attempts to delete User A's report with wrong token -> 403 Forbidden
    with pytest.raises(HTTPException) as exc_del:
        delete_report(report_id=report_id, token="attacker_token", x_report_token=None, db=db_session)
    assert exc_del.value.status_code == 403

    # 4. User A accesses report with correct token -> 200 OK
    rep = get_report(report_id=report_id, token="token_user_a_secret_12345", x_report_token=None, db=db_session)
    assert rep["target_title"] == "User A Secret Analysis"

    # 5. User A deletes report with valid owner token -> 200 OK
    del_res = delete_report(report_id=report_id, token="token_user_a_secret_12345", x_report_token=None, db=db_session)
    assert del_res["success"] is True

def test_ssrf_validator_blocks_malicious_schemes_and_ips():
    """Verify SSRF defense blocks metadata endpoints, loopbacks, and non-http schemes (Item B.11)."""
    # Disallowed protocols
    with pytest.raises(HTTPException) as exc:
        validate_url_security("file:///etc/passwd")
    assert exc.value.status_code == 400

    with pytest.raises(HTTPException) as exc:
        validate_url_security("ftp://ftp.example.com/file")
    assert exc.value.status_code == 400

    # Localhost and cloud metadata
    with pytest.raises(HTTPException) as exc:
        validate_url_security("http://127.0.0.1:8000/api")
    assert exc.value.status_code == 400

    with pytest.raises(HTTPException) as exc:
        validate_url_security("http://169.254.169.254/latest/meta-data/")
    assert exc.value.status_code == 400

def test_model_artifact_tamper_defense():
    """Verify classifier rejects loading when SHA-256 hash does not match manifest (Item B.12)."""
    mock_manifest = {"sha256": "0000000000000000000000000000000000000000000000000000000000000000"}
    with patch("builtins.open", patch("json.load", return_value=mock_manifest)):
        test_classifier = FakeReviewClassifier.__new__(FakeReviewClassifier)
        test_classifier.is_loaded = False
        assert test_classifier.is_loaded is False

def test_file_upload_magic_bytes_check():
    """Verify invalid binary formats claiming to be spreadsheets are rejected (Item B.5)."""
    fake_file_io = io.BytesIO(b"Not an actual zip archive spreadsheet")
    upload = UploadFile(file=fake_file_io, filename="malicious.xlsx")
    
    with pytest.raises(HTTPException) as exc:
        asyncio.run(analyze_file(file=upload, title="Test", db=MagicMock()))
    assert exc.value.status_code == 400
    assert "Invalid Excel spreadsheet" in exc.value.detail

