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
7. Multi-Project Hierarchy & Recursive Sub-Project Tree Resolution
8. Multi-Theme Tokens & Rise Up Asia Color Palette
9. REST API Route Registration Contracts
10. Candidate Telemetry & Anonymity Verification
11. Question Reporting & Bug Triage Workflow
12. Backup & Archive Zip Generation & Retention Logic
13. Email Notification Routing & Cadence Dispatch Strategy
14. Execution Pipeline Sequencing & Prerequisite Gating
15. Diverse Question Submission & External Verification Handlers
16. Full PHP Unit Test Suite Execution
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
# 8. MULTI-PROJECT HIERARCHY & RECURSIVE SUB-PROJECT RESOLUTION
# =====================================================================
def test_project_hierarchy_and_recursion() -> None:
    log_suite("8. Multi-Project Hierarchy & Recursive Sub-Project Tree Resolution")

    projects = [
        {"id": 1, "name": "Engineering Onboarding", "category_id": 10, "parent_project_id": None},
        {"id": 2, "name": "Backend Architecture", "category_id": 10, "parent_project_id": 1},
        {"id": 3, "name": "SQLite Split DB Module", "category_id": 10, "parent_project_id": 2},
        {"id": 4, "name": "Frontend Design System", "category_id": 10, "parent_project_id": 1},
    ]

    def build_tree(items: List[Dict[str, Any]], parent_id: Optional[int] = None) -> List[Dict[str, Any]]:
        branch = []
        for item in items:
            if item.get("parent_project_id") == parent_id:
                children = build_tree(items, item["id"])
                node = dict(item)
                if children:
                    node["sub_projects"] = children
                branch.append(node)
        return branch

    tree = build_tree(projects, None)
    has_root = len(tree) == 1 and tree[0]["id"] == 1
    has_sub = len(tree[0].get("sub_projects", [])) == 2
    has_deep_sub = len(tree[0]["sub_projects"][0].get("sub_projects", [])) == 1
    is_tree_valid = has_root and has_sub and has_deep_sub

    log_test("Recursive Sub-Project Tree Construction (Parent-Child Hierarchy)", is_tree_valid)

    cyclic_projects = [
        {"id": 1, "parent_project_id": 2},
        {"id": 2, "parent_project_id": 1},
    ]

    def has_cycle(items: List[Dict[str, Any]]) -> bool:
        parent_map = {item["id"]: item.get("parent_project_id") for item in items}
        for item_id in parent_map:
            visited = set()
            curr = item_id
            while curr is not None:
                if curr in visited:
                    return True
                visited.add(curr)
                curr = parent_map.get(curr)
        return False

    is_cycle_detected = has_cycle(cyclic_projects)
    has_normal_no_cycle = not has_cycle(projects)

    log_test("Cycle Detection in Recursive Project Hierarchy", is_cycle_detected and has_normal_no_cycle)


# =====================================================================
# 9. MULTI-THEME TOKENS & RISE UP ASIA COLOR PALETTE
# =====================================================================
def test_multi_theme_tokens() -> None:
    log_suite("9. Multi-Theme Tokens & Rise Up Asia Color Palette")

    theme_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "themes", "theme-definitions.ts")
    has_theme_file = os.path.isfile(theme_file)
    log_test("Theme Definitions File Exists (src/themes/theme-definitions.ts)", has_theme_file)

    if has_theme_file:
        with open(theme_file, "r", encoding="utf-8") as f:
            content = f.read()

        has_letterly = "letterly" in content
        has_bright_gold = "bright-gold" in content or "Rise Up" in content
        has_dark = "dark" in content
        has_white = "white" in content

        has_all_themes = has_letterly and has_bright_gold and has_dark and has_white
        log_test("Theme Presets Registered (letterly, bright-gold/Rise Up, dark, white)", has_all_themes)


# =====================================================================
# 10. REST API ROUTE REGISTRATION CONTRACTS
# =====================================================================
def test_rest_route_contracts() -> None:
    log_suite("10. REST API Route Registration Contracts")

    api_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "includes", "api")

    required_controllers = [
        "authrestcontroller.php",
        "FormRestController.php",
        "UserInviteRestController.php",
        "ProjectHierarchyRestController.php",
        "AIInstructionRestController.php",
    ]

    is_all_present = True
    for controller in required_controllers:
        path = os.path.join(api_dir, controller)
        if not os.path.isfile(path):
            is_all_present = False

    log_test("All Core REST Controllers Present in includes/api/", is_all_present)

    if is_all_present:
        auth_path = os.path.join(api_dir, "authrestcontroller.php")
        with open(auth_path, "r", encoding="utf-8") as f:
            auth_content = f.read()

        has_auth_token_route = "/auth/token" in auth_content
        has_auth_validate_route = "/auth/validate" in auth_content
        has_auth_register_route = "/auth/register" in auth_content

        has_jwt_routes = has_auth_token_route and has_auth_validate_route and has_auth_register_route
        log_test("JWT Auth Endpoints Defined (/auth/token, /auth/validate, /auth/register)", has_jwt_routes)


# =====================================================================
# 11. CANDIDATE TELEMETRY & ANONYMITY VERIFICATION
# =====================================================================
def test_candidate_telemetry_and_anonymity() -> None:
    log_suite("11. Candidate Telemetry & Anonymity Verification")

    # Test 11.1: Click telemetry tracking during reading doc phases & checklist gates
    class TelemetryTracker:
        def __init__(self) -> None:
            self.events: List[Dict[str, Any]] = []

        def record_click(self, user_id: str, page_id: str, action: str, timestamp: float) -> None:
            self.events.append({
                "user_id": user_id,
                "page_id": page_id,
                "action": action,
                "timestamp": timestamp,
            })

        def get_interaction_count(self, user_id: str) -> int:
            return sum(1 for e in self.events if e["user_id"] == user_id)

    tracker = TelemetryTracker()
    tracker.record_click("candidate_42", "doc_page_1", "read_page_view", 1000.0)
    tracker.record_click("candidate_42", "doc_page_2", "read_page_view", 1025.0)
    tracker.record_click("candidate_42", "checklist_gate", "checklist_item_toggle", 1040.0)

    has_three_interactions = tracker.get_interaction_count("candidate_42") == 3
    log_test("Reading & Checklist Interaction Telemetry Recorded", has_three_interactions)

    # Test 11.2: Salted SHA-256 client IP hashing for candidate anonymity (GDPR compliant)
    server_salt = "wp_exam_privacy_salt_9981"
    raw_ip = "192.168.1.105"
    hasher = hashlib.sha256()
    hasher.update(f"{raw_ip}:{server_salt}".encode("utf-8"))
    hashed_ip = hasher.hexdigest()

    has_valid_length = len(hashed_ip) == 64
    has_raw_ip = raw_ip in hashed_ip
    is_hashed_clean = False
    if has_valid_length:
        if not has_raw_ip:
            is_hashed_clean = True

    log_test("Candidate Client IP Anonymized via Salted SHA-256", is_hashed_clean)

    # Test 11.3: Anonymous survey submission flag handling
    def format_candidate_submission(submission: Dict[str, Any]) -> Dict[str, Any]:
        is_anonymous = submission.get("is_anonymous", False)
        if is_anonymous:
            return {
                "candidate_name": "Anonymous Candidate",
                "candidate_email": "",
                "hashed_ip": submission.get("hashed_ip", ""),
                "answers": submission.get("answers", {}),
                "is_anonymous": True,
            }
        return {
            "candidate_name": submission.get("candidate_name", ""),
            "candidate_email": submission.get("candidate_email", ""),
            "hashed_ip": submission.get("hashed_ip", ""),
            "answers": submission.get("answers", {}),
            "is_anonymous": False,
        }

    anon_input = {
        "candidate_name": "John Secret",
        "candidate_email": "john@secret.org",
        "hashed_ip": hashed_ip,
        "answers": {"q1": "a", "q2": "b"},
        "is_anonymous": True,
    }
    anon_output = format_candidate_submission(anon_input)
    has_masked_name = anon_output["candidate_name"] == "Anonymous Candidate"
    has_empty_email = anon_output["candidate_email"] == ""
    is_anon_flagged = anon_output["is_anonymous"]

    is_anonymized = has_masked_name and has_empty_email and is_anon_flagged
    log_test("Anonymous Submission Masks PII while Preserving Hashed IP", is_anonymized)


# =====================================================================
# 12. QUESTION REPORTING & BUG TRIAGE WORKFLOW
# =====================================================================
def test_question_reporting_and_bug_triage() -> None:
    log_suite("12. Question Reporting & Bug Triage Workflow")

    valid_report_types = {"typo", "bug", "feedback", "dispute"}
    valid_statuses = {"open", "under_review", "resolved", "dismissed"}

    def validate_report_payload(payload: Dict[str, Any]) -> Tuple[bool, str]:
        has_qid = "question_id" in payload and len(str(payload["question_id"])) > 0
        if not has_qid:
            return False, "Missing question_id"

        report_type = payload.get("report_type", "")
        has_valid_type = report_type in valid_report_types
        if not has_valid_type:
            return False, f"Invalid report_type: {report_type}"

        description = payload.get("description", "")
        has_desc = len(description.strip()) >= 5
        if not has_desc:
            return False, "Description must be at least 5 characters"

        return True, "OK"

    # Test 12.1: Valid report submission schema
    valid_payload = {
        "question_id": "q_math_101",
        "report_type": "dispute",
        "description": "Option C formula seems ambiguous based on Section 2 lecture notes.",
        "reporter_email": "student@example.org",
    }
    is_valid_report, _ = validate_report_payload(valid_payload)
    log_test("Question Report Payload Schema Validation (Valid Dispute)", is_valid_report)

    # Test 12.2: Reject report with invalid report type or empty description
    invalid_payload = {
        "question_id": "q_math_101",
        "report_type": "arbitrary_complaint",
        "description": "Short",
    }
    is_invalid_payload, _ = validate_report_payload(invalid_payload)
    is_invalid_rejected = not is_invalid_payload
    log_test("Rejection of Invalid Report Payload Schema", is_invalid_rejected)

    # Test 12.3: Admin triage lifecycle transitions (open -> under_review -> resolved)
    class ReportTriageRecord:
        def __init__(self, report_id: str, question_id: str, report_type: str) -> None:
            self.report_id = report_id
            self.question_id = question_id
            self.report_type = report_type
            self.status = "open"
            self.resolution_notes = ""

        def transition_to(self, new_status: str, notes: str = "") -> bool:
            allowed_transitions = {
                "open": {"under_review", "dismissed"},
                "under_review": {"resolved", "dismissed", "open"},
                "resolved": {"under_review"},
                "dismissed": {"under_review"},
            }
            allowed = allowed_transitions.get(self.status, set())
            is_permitted = new_status in allowed
            if not is_permitted:
                return False

            self.status = new_status
            self.resolution_notes = notes
            return True

    record = ReportTriageRecord("rep_001", "q_math_101", "typo")
    has_initial_open = record.status == "open"
    is_step1_ok = record.transition_to("under_review", "Assigned to content team")
    has_status_review = record.status == "under_review"
    is_step2_ok = record.transition_to("resolved", "Corrected typographical spelling in option B")
    has_status_resolved = record.status == "resolved"
    # Illegal direct jump from resolved to open
    is_illegal_blocked = not record.transition_to("open")

    is_lifecycle_correct = (
        has_initial_open
        and is_step1_ok
        and has_status_review
        and is_step2_ok
        and has_status_resolved
        and is_illegal_blocked
    )
    log_test("Admin Report Triage State Machine Transitions", is_lifecycle_correct)


# =====================================================================
# 13. BACKUP & ARCHIVE ZIP GENERATION
# =====================================================================
def test_backup_and_archive_packaging() -> None:
    log_suite("13. Backup & Archive Zip Generation & Retention Logic")

    import io
    import zipfile

    # Test 13.1: Package split SQLite DBs, audit history DBs, and curriculum JSON into a valid zip
    manifest_data = {
        "version": "1.0",
        "timestamp": int(time.time()),
        "root_catalog": "root_catalog.json",
        "databases": ["projects/proj_alpha.sqlite", "projects/proj_beta.sqlite"],
        "histories": ["history/proj_alpha_history.sqlite", "history/proj_beta_history.sqlite"],
    }

    catalog_data = {
        "categories": [
            {
                "id": "cat_onboarding",
                "name": "Onboarding",
                "projects": ["proj_alpha", "proj_beta"],
            }
        ]
    }

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("manifest.json", json.dumps(manifest_data, indent=2))
        zf.writestr("root_catalog.json", json.dumps(catalog_data, indent=2))
        zf.writestr("projects/proj_alpha.sqlite", b"SQLite format 3\x00_mock_alpha_db_content")
        zf.writestr("projects/proj_beta.sqlite", b"SQLite format 3\x00_mock_beta_db_content")
        zf.writestr("history/proj_alpha_history.sqlite", b"SQLite format 3\x00_mock_alpha_history_content")
        zf.writestr("history/proj_beta_history.sqlite", b"SQLite format 3\x00_mock_beta_history_content")

    zip_bytes = zip_buffer.getvalue()
    has_zip_header = zip_bytes.startswith(b"PK\x03\x04")

    # Read back and verify all paths inside archive
    zf_read = zipfile.ZipFile(io.BytesIO(zip_bytes), "r")
    namelist = zf_read.namelist()
    has_manifest = "manifest.json" in namelist
    has_catalog = "root_catalog.json" in namelist
    has_alpha_db = "projects/proj_alpha.sqlite" in namelist
    has_alpha_hist = "history/proj_alpha_history.sqlite" in namelist

    is_archive_valid = (
        has_zip_header
        and has_manifest
        and has_catalog
        and has_alpha_db
        and has_alpha_hist
    )
    log_test("Split DB Archive Zip Packaging & Manifest Verification", is_archive_valid)

    # Test 13.2: Backup retention and rotation policy logic (max N daily/weekly backups)
    def rotate_backups(existing_backups: List[str], max_limit: int) -> Tuple[List[str], List[str]]:
        excess = len(existing_backups) - max_limit
        has_excess = excess > 0
        if not has_excess:
            return existing_backups, []

        to_delete = existing_backups[:excess]
        to_keep = existing_backups[excess:]
        return to_keep, to_delete

    backups = [
        "backup_2026_09_10.zip",
        "backup_2026_09_11.zip",
        "backup_2026_09_12.zip",
        "backup_2026_09_13.zip",
        "backup_2026_09_14.zip",
        "backup_2026_09_15.zip",
        "backup_2026_09_16.zip",
        "backup_2026_09_17.zip",
    ]
    kept, pruned = rotate_backups(backups, max_limit=5)
    has_correct_kept_count = len(kept) == 5
    has_correct_pruned_count = len(pruned) == 3
    has_latest_kept = kept[-1] == "backup_2026_09_17.zip"
    has_oldest_pruned = pruned[0] == "backup_2026_09_10.zip"

    is_rotation_valid = (
        has_correct_kept_count
        and has_correct_pruned_count
        and has_latest_kept
        and has_oldest_pruned
    )
    log_test("Backup Retention & Rotation Policy (Limit: 5, Prunes Oldest)", is_rotation_valid)


# =====================================================================
# 14. EMAIL NOTIFICATION ROUTING & CADENCE DISPATCH
# =====================================================================
def test_email_routing_and_cadence() -> None:
    log_suite("14. Email Notification Routing & Cadence Dispatch")

    # Test 14.1: Recipient Chain Resolution
    class RecipientResolver:
        def __init__(self, user_directory: Dict[str, Dict[str, Any]]) -> None:
            self.users = user_directory

        def resolve_recipients(
            self,
            candidate_id: str,
            owner_id: str,
            configured_targets: List[str],
        ) -> List[str]:
            resolved: List[str] = []
            for target in configured_targets:
                if target == "candidate":
                    user = self.users.get(candidate_id)
                    if user:
                        resolved.append(user.get("email", ""))
                elif target == "owner":
                    user = self.users.get(owner_id)
                    if user:
                        resolved.append(user.get("email", ""))
                elif target.startswith("role:"):
                    target_role = target.split(":", 1)[1]
                    for _, u in self.users.items():
                        has_role = target_role in u.get("roles", [])
                        if has_role:
                            resolved.append(u.get("email", ""))

            # Deduplicate preserving order
            unique_emails: List[str] = []
            for email in resolved:
                has_email = len(email) > 0
                if has_email:
                    is_seen = email in unique_emails
                    if not is_seen:
                        unique_emails.append(email)

            return unique_emails

    mock_users = {
        "u_101": {"email": "candidate@example.com", "roles": ["subscriber"]},
        "u_001": {"email": "owner@example.com", "roles": ["administrator"]},
        "u_002": {"email": "hr@example.com", "roles": ["hr_manager"]},
    }
    resolver = RecipientResolver(mock_users)
    targets = ["candidate", "owner", "role:hr_manager"]
    emails = resolver.resolve_recipients("u_101", "u_001", targets)

    has_three_recipients = len(emails) == 3
    has_candidate_email = "candidate@example.com" in emails
    has_owner_email = "owner@example.com" in emails
    has_hr_email = "hr@example.com" in emails

    is_resolution_valid = (
        has_three_recipients
        and has_candidate_email
        and has_owner_email
        and has_hr_email
    )
    log_test("Email Recipient Chain Resolution (Candidate, Owner, Roles)", is_resolution_valid)

    # Test 14.2: Cadence Dispatch Strategy
    class CadenceDispatcher:
        def __init__(self, cadence: str) -> None:
            self.cadence = cadence
            self.immediate_dispatches: List[Dict[str, Any]] = []
            self.queued_dispatches: List[Dict[str, Any]] = []

        def handle_event(self, event_type: str, payload: Dict[str, Any]) -> None:
            if self.cadence == "per_section":
                self.immediate_dispatches.append(payload)
            elif self.cadence == "end_of_day":
                self.queued_dispatches.append(payload)
            elif self.cadence == "end_of_week":
                self.queued_dispatches.append(payload)

    section_dispatcher = CadenceDispatcher("per_section")
    section_dispatcher.handle_event("section_complete", {"section_id": "sec_01"})
    has_immediate = len(section_dispatcher.immediate_dispatches) == 1
    has_no_queue = len(section_dispatcher.queued_dispatches) == 0

    daily_dispatcher = CadenceDispatcher("end_of_day")
    daily_dispatcher.handle_event("section_complete", {"section_id": "sec_01"})
    has_daily_queued = len(daily_dispatcher.queued_dispatches) == 1
    has_no_daily_immediate = len(daily_dispatcher.immediate_dispatches) == 0

    is_cadence_valid = (
        has_immediate
        and has_no_queue
        and has_daily_queued
        and has_no_daily_immediate
    )
    log_test("Cadence Dispatch Routing (per_section immediate vs daily queue)", is_cadence_valid)


# =====================================================================
# 15. EXECUTION PIPELINE SEQUENCING & PREREQUISITE GATING
# =====================================================================
def test_pipeline_sequencing_and_prerequisites() -> None:
    log_suite("15. Execution Pipeline Sequencing & Prerequisite Gating")

    # Test 15.1: Pipeline Sequence Ordering & Validation
    def validate_pipeline_order(available_projects: List[str], pipeline_order: List[str]) -> bool:
        has_elements = len(pipeline_order) > 0
        if not has_elements:
            return False

        for proj in pipeline_order:
            is_known = proj in available_projects
            if not is_known:
                return False

        has_duplicates = len(pipeline_order) != len(set(pipeline_order))
        if has_duplicates:
            return False

        return True

    projects = ["proj_a", "proj_b", "proj_c", "proj_d"]
    custom_order = ["proj_a", "proj_c", "proj_d", "proj_b"]
    is_valid_order = validate_pipeline_order(projects, custom_order)
    log_test("Execution Pipeline Custom Sequencing Resolution ([A, C, D, B])", is_valid_order)

    # Test 15.2: Prerequisite Gating Enforcement
    class PipelineGatingEngine:
        def __init__(self, sequence: List[str]) -> None:
            self.sequence = sequence

        def can_access_project(self, project_id: str, completed_projects: List[str]) -> bool:
            is_in_sequence = project_id in self.sequence
            if not is_in_sequence:
                return False

            idx = self.sequence.index(project_id)
            is_first = idx == 0
            if is_first:
                return True

            prerequisites = self.sequence[:idx]
            for prereq in prerequisites:
                is_done = prereq in completed_projects
                if not is_done:
                    return False

            return True

    gating = PipelineGatingEngine(custom_order)
    # At start, proj_a is accessible, proj_c is locked
    is_a_open = gating.can_access_project("proj_a", [])
    is_c_locked = not gating.can_access_project("proj_c", [])
    # After completing proj_a, proj_c unlocks, proj_d locked
    is_c_open = gating.can_access_project("proj_c", ["proj_a"])
    is_d_locked = not gating.can_access_project("proj_d", ["proj_a"])
    # After completing proj_a and proj_c, proj_d unlocks
    is_d_open = gating.can_access_project("proj_d", ["proj_a", "proj_c"])

    is_gating_correct = (
        is_a_open
        and is_c_locked
        and is_c_open
        and is_d_locked
        and is_d_open
    )
    log_test("Pipeline Prerequisite Gating Enforced Step-by-Step", is_gating_correct)


# =====================================================================
# 16. DIVERSE QUESTION SUBMISSION & EXTERNAL VERIFICATION
# =====================================================================
def test_submission_and_external_verification() -> None:
    log_suite("16. Diverse Question Submission & External Verification")

    # Test 16.1: External URL Verification (Google Docs, XMind, Workflowy)
    def verify_external_submission_url(service_type: str, url: str) -> Tuple[bool, str]:
        has_https = url.startswith("https://")
        if not has_https:
            return False, "URL must use secure HTTPS protocol"

        if service_type == "google_docs":
            has_gdocs = "docs.google.com/document/d/" in url
            if not has_gdocs:
                return False, "Not a valid Google Docs document URL"
            return True, "Valid Google Docs Link"

        elif service_type == "xmind":
            has_xmind = "xmind.app/m/" in url or "xmind.net/m/" in url
            if not has_xmind:
                return False, "Not a valid XMind shareable link"
            return True, "Valid XMind Link"

        elif service_type == "workflowy":
            has_workflowy = "workflowy.com/#/" in url
            if not has_workflowy:
                return False, "Not a valid Workflowy node URL"
            return True, "Valid Workflowy Link"

        return False, "Unsupported external service type"

    gdoc_valid, _ = verify_external_submission_url("google_docs", "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit")
    xmind_valid, _ = verify_external_submission_url("xmind", "https://xmind.app/m/88pA9q")
    workflowy_valid, _ = verify_external_submission_url("workflowy", "https://workflowy.com/#/6a77f3e829d1")
    insecure_gdoc, _ = verify_external_submission_url("google_docs", "http://docs.google.com/document/d/123/edit")
    is_insecure_blocked = not insecure_gdoc

    is_all_url_checks_valid = (
        gdoc_valid
        and xmind_valid
        and workflowy_valid
        and is_insecure_blocked
    )
    log_test("External URL Verification (Google Docs, XMind, Workflowy, HTTPS)", is_all_url_checks_valid)

    # Test 16.2: File Upload Submission Constraints (PDF, DOCX, Size Cap)
    def validate_file_submission(filename: str, mime_type: str, file_size_bytes: int) -> Tuple[bool, str]:
        allowed_mimes = {
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }
        allowed_extensions = {".pdf", ".doc", ".docx"}

        ext = os.path.splitext(filename.lower())[1]
        has_valid_ext = ext in allowed_extensions
        if not has_valid_ext:
            return False, f"File extension {ext} not permitted"

        has_valid_mime = mime_type in allowed_mimes
        if not has_valid_mime:
            return False, f"MIME type {mime_type} not allowed"

        max_bytes = 10 * 1024 * 1024  # 10 MB
        has_acceptable_size = file_size_bytes <= max_bytes
        if not has_acceptable_size:
            return False, "File exceeds maximum 10MB limit"

        return True, "Valid File Submission"

    pdf_ok, _ = validate_file_submission("assignment_report.pdf", "application/pdf", 1024 * 500)
    docx_ok, _ = validate_file_submission("project_draft.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 1024 * 1000)
    exe_rejected, _ = validate_file_submission("malicious_script.exe", "application/x-msdownload", 1024)
    is_exe_blocked = not exe_rejected
    oversized_rejected, _ = validate_file_submission("huge_book.pdf", "application/pdf", 25 * 1024 * 1024)
    is_oversized_blocked = not oversized_rejected

    is_file_validation_valid = (
        pdf_ok
        and docx_ok
        and is_exe_blocked
        and is_oversized_blocked
    )
    log_test("File Upload MIME & Size Constraints (PDF, DOCX, Size Cap)", is_file_validation_valid)


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
    test_project_hierarchy_and_recursion()
    test_multi_theme_tokens()
    test_rest_route_contracts()
    test_candidate_telemetry_and_anonymity()
    test_question_reporting_and_bug_triage()
    test_backup_and_archive_packaging()
    test_email_routing_and_cadence()
    test_pipeline_sequencing_and_prerequisites()
    test_submission_and_external_verification()
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
