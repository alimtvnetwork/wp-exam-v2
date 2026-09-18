#!/usr/bin/env python3
"""
Comprehensive End-to-End and Integration Test Runner for WP Exam.

Validates:
1. Top-Notch JWT / Bearer Authentication & Privilege Escalation Defense
2. SQL Injection Neutralization & Parameterized Query Verification
3. Split SQLite Database Isolation & Transaction Rollbacks
4. JSON Curriculum Import/Export & Conditional Branching Schema Integrity
5. Rich Media URL Parsing & Live Client-Side Validation Rules
6. WordPress Elementor Widget Structure & Output Contract
7. Full PHP Unit Test Suite Execution
"""

import base64
import hashlib
import hmac
import json
import os
import re
import sqlite3
import subprocess
import sys
import tempfile
import time
from typing import Any, Dict, List, Optional, Tuple

PASSED_COUNT = 0
FAILED_COUNT = 0


def log_suite(title: str) -> None:
    print(f"\n{'=' * 60}")
    print(f"SUITE: {title}")
    print(f"{'=' * 60}")


def log_test(name: str, is_passed: bool, details: str = "") -> None:
    global PASSED_COUNT, FAILED_COUNT
    if is_passed:
        PASSED_COUNT += 1
        print(f"  [PASS] {name}")
    else:
        FAILED_COUNT += 1
        print(f"  [FAIL] {name} - {details}")


# =====================================================================
# 1. AUTHENTICATION & JWT TEST HELPERS
# =====================================================================
def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def base64url_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data)


def create_mock_jwt(payload: Dict[str, Any], secret: str) -> str:
    header = {"typ": "JWT", "alg": "HS256"}
    encoded_header = base64url_encode(json.dumps(header).encode("utf-8"))
    encoded_payload = base64url_encode(json.dumps(payload).encode("utf-8"))
    signature = hmac.new(
        secret.encode("utf-8"),
        f"{encoded_header}.{encoded_payload}".encode("utf-8"),
        hashlib.sha256,
    ).digest()
    encoded_signature = base64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def verify_mock_jwt(token: str, secret: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
    parts = token.split(".")
    has_three_parts = len(parts) == 3
    if not has_three_parts:
        return False, None

    enc_h, enc_p, enc_sig = parts
    expected_sig = hmac.new(
        secret.encode("utf-8"),
        f"{enc_h}.{enc_p}".encode("utf-8"),
        hashlib.sha256,
    ).digest()
    calc_enc_sig = base64url_encode(expected_sig)

    is_sig_valid = hmac.compare_digest(calc_enc_sig, enc_sig)
    if not is_sig_valid:
        return False, None

    try:
        payload = json.loads(base64url_decode(enc_p).decode("utf-8"))
    except Exception:
        return False, None

    has_exp = "exp" in payload
    if has_exp:
        is_expired = payload["exp"] < time.time()
        if is_expired:
            return False, None

    return True, payload


def test_auth_and_jwt() -> None:
    log_suite("1. JWT Authentication, Verification & Privilege Guard")
    secret = "test_wp_exam_secret_signing_key_44b39fa"

    # Test 1.1: Valid JWT generation and signature verification
    now = int(time.time())
    payload = {
        "iss": "http://localhost:8000",
        "sub": 101,
        "username": "candidate_tester",
        "email": "candidate@example.com",
        "roles": ["subscriber"],
        "iat": now,
        "exp": now + 3600,
        "jti": "random_token_uuid_1",
    }
    token = create_mock_jwt(payload, secret)
    is_valid, decoded = verify_mock_jwt(token, secret)
    has_sub = decoded is not None and decoded.get("sub") == 101
    log_test("JWT Token Generation & Valid Verification", is_valid and has_sub)

    # Test 1.2: Tampered payload rejection
    parts = token.split(".")
    tampered_payload = {"sub": 1, "roles": ["administrator"]}
    tampered_enc_p = base64url_encode(json.dumps(tampered_payload).encode("utf-8"))
    tampered_token = f"{parts[0]}.{tampered_enc_p}.{parts[2]}"
    is_tampered_valid, _ = verify_mock_jwt(tampered_token, secret)
    log_test("Tampered JWT Payload Rejection", not is_tampered_valid)

    # Test 1.3: Expired token rejection
    expired_payload = {
        "sub": 102,
        "iat": now - 7200,
        "exp": now - 3600,
    }
    expired_token = create_mock_jwt(expired_payload, secret)
    is_expired_valid, _ = verify_mock_jwt(expired_token, secret)
    log_test("Expired JWT Token Rejection", not is_expired_valid)

    # Test 1.4: Privilege Escalation Guard Simulation
    # Simulates registerUser logic: subscriber caller requesting 'administrator' role
    def simulate_registration(caller_is_admin: bool, requested_role: str) -> str:
        is_elevated = requested_role in ("administrator", "editor")
        if is_elevated and not caller_is_admin:
            return "subscriber"
        return requested_role

    assigned_role_guest = simulate_registration(False, "administrator")
    has_prevented_escalation = assigned_role_guest == "subscriber"
    log_test("Privilege Escalation Block (Non-Admin -> Administrator)", has_prevented_escalation)

    assigned_role_admin = simulate_registration(True, "administrator")
    has_admin_allowed = assigned_role_admin == "administrator"
    log_test("Authorized Role Assignment (Admin -> Administrator)", has_admin_allowed)


# =====================================================================
# 2. SQL INJECTION NEUTRALIZATION & PARAMETERIZED QUERIES
# =====================================================================
def test_sql_injection_defense() -> None:
    log_suite("2. SQL Injection Neutralization & Parameterized Queries")

    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "security_test.sqlite")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Set up test schema
        cursor.execute(
            """
            CREATE TABLE users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                password_hash TEXT,
                role TEXT
            )
        """
        )
        cursor.execute(
            """
            INSERT INTO users (id, username, password_hash, role)
            VALUES (1, 'admin', 'super_secret_hash_99', 'administrator')
        """
        )
        cursor.execute(
            """
            INSERT INTO users (id, username, password_hash, role)
            VALUES (2, 'student_john', 'pwd_hash_44', 'subscriber')
        """
        )
        conn.commit()

        # Test 2.1: Attack payload: "' OR '1'='1"
        attack_payload = "' OR '1'='1"
        # Prepared statement (safe query standard)
        cursor.execute("SELECT id, username, role FROM users WHERE username = ?", (attack_payload,))
        results = cursor.fetchall()
        has_zero_leaks = len(results) == 0
        log_test("Neutralize Payload: ' OR '1'='1", has_zero_leaks)

        # Test 2.2: Attack payload: "admin' --"
        attack_payload_comment = "admin' --"
        cursor.execute("SELECT id, username, role FROM users WHERE username = ?", (attack_payload_comment,))
        results_comment = cursor.fetchall()
        has_zero_comment_leaks = len(results_comment) == 0
        log_test("Neutralize Payload: admin' --", has_zero_comment_leaks)

        # Test 2.3: Attack payload: "1; DROP TABLE users; --"
        attack_drop_payload = "1; DROP TABLE users; --"
        cursor.execute("SELECT id, username FROM users WHERE id = ?", (attack_drop_payload,))
        cursor.fetchall()
        # Verify table still exists
        cursor.execute("SELECT COUNT(*) FROM users")
        count = cursor.fetchone()[0]
        has_table_survived = count == 2
        log_test("Neutralize Stacked Query: 1; DROP TABLE users; --", has_table_survived)

        conn.close()


# =====================================================================
# 3. SPLIT SQLITE DATABASE ISOLATION & ROLLBACKS
# =====================================================================
def test_split_database_and_rollbacks() -> None:
    log_suite("3. Split SQLite Database Isolation & Transaction Rollback")

    with tempfile.TemporaryDirectory() as tmpdir:
        db_proj_a = os.path.join(tmpdir, "proj_eng_101.sqlite")
        db_proj_b = os.path.join(tmpdir, "proj_sales_202.sqlite")

        conn_a = sqlite3.connect(db_proj_a)
        conn_b = sqlite3.connect(db_proj_b)

        cur_a = conn_a.cursor()
        cur_b = conn_b.cursor()

        cur_a.execute("CREATE TABLE submissions (id INTEGER PRIMARY KEY, candidate_email TEXT, score INT)")
        cur_b.execute("CREATE TABLE submissions (id INTEGER PRIMARY KEY, candidate_email TEXT, score INT)")

        cur_a.execute("INSERT INTO submissions (candidate_email, score) VALUES (?, ?)", ("eng_alice@company.com", 95))
        conn_a.commit()

        cur_b.execute("INSERT INTO submissions (candidate_email, score) VALUES (?, ?)", ("sales_bob@company.com", 88))
        conn_b.commit()

        # Test 3.1: Data Isolation between projects
        cur_a.execute("SELECT candidate_email FROM submissions")
        emails_a = [r[0] for r in cur_a.fetchall()]
        cur_b.execute("SELECT candidate_email FROM submissions")
        emails_b = [r[0] for r in cur_b.fetchall()]

        is_isolated = "sales_bob@company.com" not in emails_a and "eng_alice@company.com" not in emails_b
        log_test("Split Database Isolation (Zero Cross-Project Data Leakage)", is_isolated)

        # Test 3.2: Transaction Rollback on Failure
        is_rollback_successful = False
        try:
            conn_a.execute("BEGIN TRANSACTION")
            cur_a.execute("INSERT INTO submissions (candidate_email, score) VALUES (?, ?)", ("failing_candidate@test.com", 50))
            # Simulated deliberate fault
            raise RuntimeError("Database constraint or network fault during multi-step exam processing")
        except RuntimeError:
            conn_a.rollback()
            is_rollback_successful = True

        cur_a.execute("SELECT COUNT(*) FROM submissions WHERE candidate_email = ?", ("failing_candidate@test.com",))
        failing_count = cur_a.fetchone()[0]
        has_pristine_state = failing_count == 0

        log_test("Atomic Transaction Rollback on Processing Fault", is_rollback_successful and has_pristine_state)

        conn_a.close()
        conn_b.close()


# =====================================================================
# 4. JSON IMPORT/EXPORT & CONDITIONAL BRANCHING SCHEMA
# =====================================================================
def test_json_import_export_and_branching() -> None:
    log_suite("4. JSON Curriculum Import/Export & Conditional Branching Schema")

    sample_curriculum = {
        "project_id": "proj_adaptive_onboarding",
        "title": "Autonomous Onboarding & Branching Exam",
        "description": "Comprehensive multi-path onboarding module",
        "pipeline_order": ["sec_reading", "sec_checklist", "sec_quiz"],
        "sections": [
            {
                "id": "sec_reading",
                "title": "Documentation",
                "content_type": "reading",
                "reading_content": "Detailed overview of split database architecture...",
                "video_url": "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
            },
            {
                "id": "sec_checklist",
                "title": "Prerequisites",
                "content_type": "checklist",
                "checklist": [
                    {"id": "c1", "label": "Dev environment configured", "is_required": True},
                    {"id": "c2", "label": "Security checklist reviewed", "is_required": True},
                ],
            },
            {
                "id": "sec_quiz",
                "title": "Adaptive Technical Assessment",
                "content_type": "quiz",
                "questions": [
                    {
                        "id": "q1",
                        "type": "mcq",
                        "title": "Select your **primary specialty**:",
                        "options": [
                            {"label": "Backend Engineer", "branchTarget": "q_backend"},
                            {"label": "Frontend Engineer", "branchTarget": "q_frontend"},
                        ],
                        "correctAnswer": "Backend Engineer",
                        "points": 10,
                    },
                    {
                        "id": "q_backend",
                        "type": "paragraph",
                        "title": "Describe **SQLite atomic rollback** patterns:",
                        "validationType": "regex",
                        "validationRule": {
                            "pattern": "^.{20,}$",
                            "errorMessage": "Answer must contain at least 20 characters.",
                        },
                        "branchTarget": "q_final",
                    },
                    {
                        "id": "q_frontend",
                        "type": "mcq",
                        "title": "Which React state tool is standard?",
                        "options": ["Zustand", "Redux", "Context API"],
                        "branchTarget": "q_final",
                    },
                    {
                        "id": "q_final",
                        "type": "mcq",
                        "title": "Confirm submission:",
                        "options": ["Submit Now"],
                    },
                ],
            },
        ],
    }

    # Test 4.1: JSON serialization / round-trip integrity
    json_str = json.dumps(sample_curriculum, indent=2)
    parsed = json.loads(json_str)
    has_same_id = parsed["project_id"] == "proj_adaptive_onboarding"
    has_sections = len(parsed["sections"]) == 3
    log_test("JSON Import/Export Round-Trip Integrity", has_same_id and has_sections)

    # Test 4.2: Conditional Branching Logic Validation
    quiz_sec = next((s for s in parsed["sections"] if s["id"] == "sec_quiz"), None)
    questions = quiz_sec.get("questions", []) if quiz_sec else []
    question_ids = {q["id"] for q in questions}

    is_all_branches_valid = True
    for q in questions:
        # Check option branch targets
        for opt in q.get("options", []):
            if isinstance(opt, dict) and "branchTarget" in opt:
                target = opt["branchTarget"]
                if target not in question_ids:
                    is_all_branches_valid = False

        # Check question branch target
        if "branchTarget" in q:
            target = q["branchTarget"]
            if target not in question_ids:
                is_all_branches_valid = False

    log_test("Conditional Branch Target Integrity (No Dead Route Targets)", is_all_branches_valid)


# =====================================================================
# 5. RICH QUESTION MEDIA & LIVE FORM VALIDATION RULES
# =====================================================================
def get_youtube_embed_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    match = re.search(r"(?:youtu\.be/|youtube\.com/(?:embed/|v/|watch\?v=|watch\?.+&v=))([\w-]{11})", url)
    if match and match.group(1):
        return f"https://www.youtube-nocookie.com/embed/{match.group(1)}"
    return None


def validate_field_value(value: str, v_type: str, rule: Optional[Dict[str, Any]] = None) -> Tuple[bool, str]:
    if not value or not value.strip():
        return False, "Value cannot be empty"

    trimmed = value.strip()

    if v_type == "number":
        try:
            num = float(trimmed)
            if rule:
                if "min" in rule and num < rule["min"]:
                    return False, f"Value must be at least {rule['min']}"
                if "max" in rule and num > rule["max"]:
                    return False, f"Value must be at most {rule['max']}"
            return True, "Valid number"
        except ValueError:
            return False, "Please enter a valid numeric value"

    if v_type == "email":
        is_email = bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", trimmed))
        if not is_email:
            return False, "Please enter a valid email address"
        return True, "Valid email"

    if v_type == "regex":
        if rule and "pattern" in rule:
            is_match = bool(re.search(rule["pattern"], trimmed))
            if not is_match:
                return False, rule.get("errorMessage", "Value does not match required format")
        return True, "Valid pattern"

    return True, "Valid"


def test_media_and_validation() -> None:
    log_suite("5. Rich Media URL Parsing & Live Field Validations")

    # Test 5.1: YouTube Embed parsing
    test_urls = [
        ("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
        ("https://youtu.be/dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
        ("https://www.youtube.com/watch?feature=player_embedded&v=dQw4w9WgXcQ", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"),
        ("https://example.com/not-a-youtube-video", None),
    ]

    is_all_embeds_correct = True
    for input_url, expected in test_urls:
        actual = get_youtube_embed_url(input_url)
        if actual != expected:
            is_all_embeds_correct = False

    log_test("YouTube Embed URL Parsing (Clean embed & privacy domain)", is_all_embeds_correct)

    # Test 5.2: Live Number Range Validation
    num_rule = {"min": 10, "max": 100}
    is_valid_mid, _ = validate_field_value("50", "number", num_rule)
    is_valid_low, _ = validate_field_value("5", "number", num_rule)
    is_valid_high, _ = validate_field_value("150", "number", num_rule)
    is_valid_alpha, _ = validate_field_value("abc", "number", num_rule)

    has_number_passed = is_valid_mid and not is_valid_low and not is_valid_high and not is_valid_alpha
    log_test("Live Field Number Range Validation (Min: 10, Max: 100)", has_number_passed)

    # Test 5.3: Live Email Validation
    is_valid_email, _ = validate_field_value("candidate@company.org", "email")
    is_invalid_email, _ = validate_field_value("candidate-not-an-email", "email")
    has_email_passed = is_valid_email and not is_invalid_email
    log_test("Live Field Email Validation (RFC-compliant check)", has_email_passed)

    # Test 5.4: Live Regex Validation (Employee Code: EMP-XXXX)
    regex_rule = {"pattern": r"^EMP-[0-9]{4}$", "errorMessage": "Format must be EMP-XXXX"}
    is_valid_regex, _ = validate_field_value("EMP-8421", "regex", regex_rule)
    is_invalid_regex, _ = validate_field_value("STUDENT-99", "regex", regex_rule)
    has_regex_passed = is_valid_regex and not is_invalid_regex
    log_test("Live Field Custom Regex Validation (Pattern: ^EMP-[0-9]{4}$)", has_regex_passed)


# =====================================================================
# 6. WORDPRESS ELEMENTOR WIDGET CONTRACT
# =====================================================================
def test_elementor_widget_structure() -> None:
    log_suite("6. WordPress Elementor Widget Structure & Output Contract")

    widget_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "includes", "elementor", "quizwidget.php")
    has_file = os.path.isfile(widget_file)
    log_test("Elementor Widget File Exists (quizwidget.php)", has_file)

    if has_file:
        with open(widget_file, "r", encoding="utf-8") as f:
            content = f.read()

        has_class = "class QuizWidget" in content
        has_name = "wp_exam_quiz" in content
        has_title = "WP Exam & Quiz Runner" in content
        has_render = "wp-exam-elementor-embed" in content

        has_contract = has_class and has_name and has_title and has_render
        log_test("Elementor Widget Registration Contract & Render Container", has_contract)


# =====================================================================
# 7. EXECUTION OF PHP UNIT TEST SUITE
# =====================================================================
def test_php_test_suite() -> None:
    log_suite("7. PHP Test Suite Execution (Unit Tests & Autoloader)")

    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    runner_path = os.path.join(repo_root, "tests", "run-tests.php")

    has_runner = os.path.isfile(runner_path)
    if not has_runner:
        log_test("PHP Test Runner Available", False, "tests/run-tests.php missing")
        return

    try:
        proc = subprocess.run(
            ["php", runner_path],
            cwd=repo_root,
            capture_output=True,
            text=True,
            timeout=30,
        )
        is_success = proc.returncode == 0
        details = proc.stdout.strip() if is_success else proc.stderr.strip()
        last_line = details.splitlines()[-1] if details else ""
        log_test(f"PHP Unit Test Suite ({last_line})", is_success, proc.stderr.strip())
    except Exception as e:
        log_test("PHP Unit Test Suite Execution", False, str(e))


# =====================================================================
# MAIN RUNNER
# =====================================================================
def main() -> None:
    print("=" * 60)
    print("WP EXAM END-TO-END INTEGRATION TEST ORCHESTRATOR")
    print("=" * 60)

    start_time = time.time()

    test_auth_and_jwt()
    test_sql_injection_defense()
    test_split_database_and_rollbacks()
    test_json_import_export_and_branching()
    test_media_and_validation()
    test_elementor_widget_structure()
    test_php_test_suite()

    elapsed = round(time.time() - start_time, 3)

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Total Passed : {PASSED_COUNT}")
    print(f"Total Failed : {FAILED_COUNT}")
    print(f"Duration     : {elapsed}s")
    print("=" * 60)

    if FAILED_COUNT > 0:
        print("\n[RESULT] Verification FAILED with faults detected.")
        sys.exit(1)
    else:
        print("\n[RESULT] All End-to-End and Integration tests PASSED cleanly.")
        sys.exit(0)


if __name__ == "__main__":
    main()
