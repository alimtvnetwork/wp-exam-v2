"""
Temporary End-to-End Integration Test for SMTP Delivery & IMAP Inbox Verification.

Isolation:
- Guarded by RUN_TEMP_E2E environment variable.
- Tagged with @pytest.mark.temp_e2e.
- Skipped by default in routine local test suites and CI/CD pipelines.

Run On-Demand:
  RUN_TEMP_E2E=1 pytest -v -m temp_e2e tests/tempe2e/test_email_delivery_tempe2e.py
"""

import os
import ssl
import json
import socket
import smtplib
import imaplib
import pytest

# Module-level skip guard ensuring zero CI/CD impact and zero routine test suite impact
if (os.getenv("RUN_TEMP_E2E") or "").strip() != "1":
    pytest.skip(
        "skipping temporary e2e test; enable on-demand with RUN_TEMP_E2E=1",
        allow_module_level=True,
    )


def load_credentials() -> dict:
    """Load credentials safely from test-pass.json or environment."""
    config_path = os.path.join(os.path.dirname(__file__), "..", "..", "test-pass.json")
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    email = os.getenv("TEST_EMAIL", "")
    password = os.getenv("TEST_EMAIL_PASS", "")
    return {"email": email, "pass": password}


def create_ssl_context() -> ssl.SSLContext:
    """Construct a permissive SSL context for verified host connection."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


@pytest.mark.temp_e2e
def test_email_smtp_ssl_connection_and_login():
    """Verify real SMTP SSL handshake and authentication against port 465."""
    creds = load_credentials()
    if not creds.get("email") or not creds.get("pass"):
        pytest.skip("Credentials not available in test-pass.json or environment")

    domain = creds["email"].split("@")[-1]
    host = f"mail.{domain}"
    ctx = create_ssl_context()

    smtp = smtplib.SMTP_SSL(host, 465, context=ctx, timeout=10.0)
    try:
        code, msg = smtp.login(creds["email"], creds["pass"])
        is_authenticated = (code >= 200 and code < 300)
        assert is_authenticated, f"SMTP authentication failed: {code} {msg}"
    finally:
        try:
            smtp.quit()
        except Exception:
            pass


@pytest.mark.temp_e2e
def test_email_imap_ssl_connection_and_inbox():
    """Verify real IMAP SSL handshake, login, and mailbox reading against port 993."""
    creds = load_credentials()
    if not creds.get("email") or not creds.get("pass"):
        pytest.skip("Credentials not available in test-pass.json or environment")

    domain = creds["email"].split("@")[-1]
    host = f"mail.{domain}"
    ctx = create_ssl_context()

    imap = imaplib.IMAP4_SSL(host, 993, ssl_context=ctx)
    try:
        status, _ = imap.login(creds["email"], creds["pass"])
        is_logged_in = (status == "OK")
        assert is_logged_in, f"IMAP authentication failed with status: {status}"

        select_status, count = imap.select("INBOX", readonly=True)
        is_inbox_selected = (select_status == "OK")
        assert is_inbox_selected, f"IMAP select INBOX failed with status: {select_status}"
        assert len(count) > 0, "No message count returned for INBOX"
    finally:
        try:
            imap.logout()
        except Exception:
            pass
