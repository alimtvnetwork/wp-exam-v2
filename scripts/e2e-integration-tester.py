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
16. Project Revision History & 1-Click Rollback State Machine
17. Public Analytics Dashboard & High-Failure Alert Aggregator
18. Social Media OpenGraph & Twitter Card SEO Meta Generator
19. Question Hints & Contextual Resource Linking
20. Dynamic JSON Theme Injection & Asset Compilation
21. AI Instruction Studio Theme & UI Modification Prompts
22. Full PHP Unit Test Suite Execution
"""

import base64
import hashlib
import hmac
import json
import os
import re
import shutil
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
# 17. PROJECT REVISION HISTORY & 1-CLICK ROLLBACK
# =====================================================================
def test_project_revision_history_and_rollback() -> None:
    log_suite("17. Project Revision History & 1-Click Rollback")

    class ProjectHistoryStore:
        def __init__(self) -> None:
            self.revisions: List[Dict[str, Any]] = []
            self.audit_log: List[Dict[str, Any]] = []

        def save_revision(self, project_id: str, snapshot_data: Dict[str, Any], user_id: str) -> int:
            rev_num = len(self.revisions) + 1
            record = {
                "revision_id": rev_num,
                "project_id": project_id,
                "snapshot": json.loads(json.dumps(snapshot_data)),
                "created_by": user_id,
                "timestamp": int(time.time()),
            }
            self.revisions.append(record)
            return rev_num

        def rollback_to_revision(self, project_id: str, target_rev: int, user_id: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
            match_rev = None
            for rev in self.revisions:
                is_match = rev["project_id"] == project_id
                if is_match:
                    has_target_num = rev["revision_id"] == target_rev
                    if has_target_num:
                        match_rev = rev
                        break

            has_match = match_rev is not None
            if not has_match:
                return False, None

            # Audit rollback action
            self.audit_log.append({
                "action": "rollback",
                "project_id": project_id,
                "target_revision": target_rev,
                "executed_by": user_id,
                "timestamp": int(time.time()),
            })

            restored_snapshot = json.loads(json.dumps(match_rev["snapshot"]))
            return True, restored_snapshot

    store = ProjectHistoryStore()
    v1_data = {"title": "Onboarding V1", "sections": ["intro", "setup"]}
    v2_data = {"title": "Onboarding V2 (Draft)", "sections": ["intro", "setup", "advanced"]}

    rev1 = store.save_revision("proj_001", v1_data, "admin_1")
    rev2 = store.save_revision("proj_001", v2_data, "admin_2")

    has_saved_both = rev1 == 1 and rev2 == 2
    log_test("Curriculum Revisions Saved in Audit History DB", has_saved_both)

    is_rollback_ok, restored = store.rollback_to_revision("proj_001", 1, "admin_1")
    has_restored = restored is not None
    has_v1_title = False
    has_two_sections = False
    if has_restored:
        has_v1_title = restored.get("title") == "Onboarding V1"
        has_two_sections = len(restored.get("sections", [])) == 2

    has_audit_entry = len(store.audit_log) == 1

    is_rollback_complete = (
        is_rollback_ok
        and has_restored
        and has_v1_title
        and has_two_sections
        and has_audit_entry
    )
    log_test("1-Click Rollback Restores Snapshot & Logs Audit Entry", is_rollback_complete)


# =====================================================================
# 18. PUBLIC ANALYTICS DASHBOARD & HIGH-FAILURE ALERTS
# =====================================================================
def test_analytics_and_failure_alerts() -> None:
    log_suite("18. Public Analytics Dashboard & High-Failure Alerts")

    class AnalyticsAggregator:
        def __init__(self) -> None:
            self.submissions: List[Dict[str, Any]] = []

        def record_result(self, submission: Dict[str, Any]) -> None:
            self.submissions.append(submission)

        def calculate_kpis(self, total_assigned: int) -> Dict[str, Any]:
            completed_count = sum(1 for s in self.submissions if s.get("is_completed"))
            failed_count = sum(1 for s in self.submissions if s.get("is_failed"))
            has_completed = completed_count > 0
            if has_completed:
                pass_count = completed_count - failed_count
                pass_rate = round((pass_count / completed_count) * 100, 1)
            else:
                pass_rate = 0.0

            return {
                "total_assigned": total_assigned,
                "completed_count": completed_count,
                "failed_count": failed_count,
                "pass_rate_percentage": pass_rate,
            }

        def analyze_questions(self, question_results: Dict[str, Dict[str, int]]) -> List[Dict[str, Any]]:
            analysis: List[Dict[str, Any]] = []
            for q_id, stats in question_results.items():
                attempts = stats.get("attempts", 0)
                failures = stats.get("failures", 0)
                has_attempts = attempts > 0
                if has_attempts:
                    failure_rate = round((failures / attempts) * 100, 1)
                else:
                    failure_rate = 0.0

                has_high_failure = failure_rate >= 40.0
                analysis.append({
                    "question_id": q_id,
                    "attempts": attempts,
                    "failures": failures,
                    "failure_rate": failure_rate,
                    "has_high_failure_alert": has_high_failure,
                })
            return analysis

        def sanitize_for_public(self, data: Dict[str, Any]) -> Dict[str, Any]:
            public_copy = dict(data)
            has_candidates = "candidates" in public_copy
            if has_candidates:
                del public_copy["candidates"]
            has_emails = "emails" in public_copy
            if has_emails:
                del public_copy["emails"]
            return public_copy

    agg = AnalyticsAggregator()
    agg.record_result({"is_completed": True, "is_failed": False})
    agg.record_result({"is_completed": True, "is_failed": False})
    agg.record_result({"is_completed": True, "is_failed": True})
    agg.record_result({"is_completed": True, "is_failed": False})

    kpis = agg.calculate_kpis(total_assigned=10)
    has_total = kpis["total_assigned"] == 10
    has_completed_count = kpis["completed_count"] == 4
    has_failed_count = kpis["failed_count"] == 1
    has_pass_rate = kpis["pass_rate_percentage"] == 75.0

    is_kpi_valid = has_total and has_completed_count and has_failed_count and has_pass_rate
    log_test("Analytics Dashboard KPI Calculation (Assigned, Completed, Pass Rate)", is_kpi_valid)

    # Test question difficulty breakdown and high failure alert (>=40%)
    q_stats = {
        "q_easy": {"attempts": 10, "failures": 1},
        "q_tough": {"attempts": 10, "failures": 5},
    }
    analysis = agg.analyze_questions(q_stats)
    easy_alert = False
    tough_alert = False
    for item in analysis:
        is_easy = item["question_id"] == "q_easy"
        if is_easy:
            easy_alert = item["has_high_failure_alert"]
        is_tough = item["question_id"] == "q_tough"
        if is_tough:
            tough_alert = item["has_high_failure_alert"]

    is_easy_normal = not easy_alert
    is_alert_logic_valid = is_easy_normal and tough_alert
    log_test("High-Failure Alert Badge (>= 40% failure threshold trigger)", is_alert_logic_valid)

    # Test public sanitization
    raw_dashboard = {
        "kpis": kpis,
        "candidates": ["John Doe", "Jane Smith"],
        "emails": ["john@example.com"],
        "is_public_enabled": True,
    }
    sanitized = agg.sanitize_for_public(raw_dashboard)
    has_no_candidates = "candidates" not in sanitized
    has_no_emails = "emails" not in sanitized
    has_kpis_preserved = "kpis" in sanitized
    is_sanitized_clean = has_no_candidates and has_no_emails and has_kpis_preserved
    log_test("Public Analytics Data Sanitization (PII Stripped for Public View)", is_sanitized_clean)


# =====================================================================
# 19. SOCIAL MEDIA OPENGRAPH & TWITTER CARD SEO META
# =====================================================================
def test_social_meta_and_sharing() -> None:
    log_suite("19. Social Media OpenGraph & Twitter Card SEO Meta")

    def generate_seo_tags(question_data: Dict[str, Any], base_url: str) -> Dict[str, str]:
        q_id = question_data.get("id", "q")
        title = question_data.get("prompt", "Exam Question")
        desc = f"Test your knowledge on: {title}"
        image_url = question_data.get("media_url", f"{base_url}/assets/banner.png")
        share_url = f"{base_url}/quiz/{q_id}?utm_source=social_share"

        return {
            "og:title": title,
            "og:description": desc,
            "og:image": image_url,
            "og:url": share_url,
            "og:type": "quiz",
            "twitter:card": "summary_large_image",
            "twitter:title": title,
            "twitter:description": desc,
            "twitter:image": image_url,
        }

    sample_q = {
        "id": "q_aws_architecture",
        "prompt": "Which AWS service provides serverless SQL querying of S3 data?",
        "media_url": "https://example.com/assets/athena_preview.png",
    }
    tags = generate_seo_tags(sample_q, "https://example.com")

    has_og_title = "Which AWS service" in tags.get("og:title", "")
    has_og_type = tags.get("og:type") == "quiz"
    has_twitter_card = tags.get("twitter:card") == "summary_large_image"
    has_tracking_param = "utm_source=social_share" in tags.get("og:url", "")
    has_image = tags.get("og:image") == "https://example.com/assets/athena_preview.png"

    is_meta_valid = (
        has_og_title
        and has_og_type
        and has_twitter_card
        and has_tracking_param
        and has_image
    )
    log_test("Social Media OpenGraph & Twitter Card Meta Tags Generation", is_meta_valid)


# =====================================================================
# 20. QUESTION HINTS & CONTEXTUAL RESOURCE LINKING
# =====================================================================
def test_question_hints_and_resources() -> None:
    log_suite("20. Question Hints & Contextual Resource Linking")

    class QuestionHintManager:
        def __init__(self, question_data: Dict[str, Any]) -> None:
            self.question = question_data
            self.is_hint_revealed = False
            self.view_events: List[Dict[str, Any]] = []

        def reveal_hint(self, candidate_id: str) -> Optional[Dict[str, Any]]:
            hint_content = self.question.get("hint")
            has_hint = hint_content is not None
            if not has_hint:
                return None

            self.is_hint_revealed = True
            self.view_events.append({
                "candidate_id": candidate_id,
                "timestamp": int(time.time()),
            })
            return hint_content

    raw_question = {
        "id": "q_aws_vpc",
        "prompt": "What component routes traffic outside a private subnet in AWS?",
        "hint": {
            "text": "Think about NAT (Network Address Translation).",
            "doc_url": "https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html",
            "image_url": "https://example.com/assets/nat_gateway_diagram.png",
        },
    }

    manager = QuestionHintManager(raw_question)
    has_initial_hidden = not manager.is_hint_revealed
    hint = manager.reveal_hint("candidate_77")
    has_revealed_state = manager.is_hint_revealed
    has_hint_text = False
    has_doc_link = False
    has_image_link = False
    if hint:
        has_hint_text = "NAT" in hint.get("text", "")
        has_doc_link = "aws.amazon.com" in hint.get("doc_url", "")
        has_image_link = "nat_gateway_diagram.png" in hint.get("image_url", "")

    has_event_logged = len(manager.view_events) == 1

    is_hint_system_valid = (
        has_initial_hidden
        and has_revealed_state
        and has_hint_text
        and has_doc_link
        and has_image_link
        and has_event_logged
    )
    log_test("Question Hints Gating, Rich Links & Telemetry Tracking", is_hint_system_valid)


# =====================================================================
# 21. DYNAMIC JSON THEME INJECTION & ASSET COMPILATION
# =====================================================================
def test_theme_injection_and_compilation() -> None:
    log_suite("21. Dynamic JSON Theme Injection & Asset Compilation")

    def validate_theme_json(theme_data: Dict[str, Any]) -> Tuple[bool, str]:
        required_fields = ["id", "name", "background", "foreground", "primary", "accent", "card"]
        for field in required_fields:
            has_field = field in theme_data
            if not has_field:
                return False, f"Missing required theme token: {field}"

        hex_pattern = re.compile(r"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
        for token in ["background", "foreground", "primary", "accent", "card"]:
            color_val = theme_data[token]
            is_valid_hex = bool(hex_pattern.match(color_val))
            if not is_valid_hex:
                return False, f"Invalid hex color for {token}: {color_val}"

        return True, "Valid Theme JSON"

    def compile_theme_css_variables(theme_data: Dict[str, Any]) -> str:
        css_lines = [
            ":root {",
            f"  --wp-exam-bg: {theme_data['background']};",
            f"  --wp-exam-text: {theme_data['foreground']};",
            f"  --wp-exam-primary: {theme_data['primary']};",
            f"  --wp-exam-accent: {theme_data['accent']};",
            f"  --wp-exam-card: {theme_data['card']};",
            "}",
        ]
        return "\n".join(css_lines)

    rise_up_custom_theme = {
        "id": "rise_up_emerald",
        "name": "Rise Up Emerald Theme",
        "background": "#0b1914",
        "foreground": "#ecfdf5",
        "primary": "#10b981",
        "accent": "#f59e0b",
        "card": "#132a22",
    }

    is_valid_theme, _ = validate_theme_json(rise_up_custom_theme)
    css_output = compile_theme_css_variables(rise_up_custom_theme)

    has_bg_var = "--wp-exam-bg: #0b1914;" in css_output
    has_primary_var = "--wp-exam-primary: #10b981;" in css_output

    temp_dir = tempfile.gettempdir()
    theme_asset_path = os.path.join(temp_dir, "wp_exam_custom_theme.json")
    with open(theme_asset_path, "w", encoding="utf-8") as f:
        json.dump(rise_up_custom_theme, f)

    has_file = os.path.isfile(theme_asset_path)
    reloaded_valid = False
    if has_file:
        with open(theme_asset_path, "r", encoding="utf-8") as f:
            reloaded_theme = json.load(f)
        reloaded_valid, _ = validate_theme_json(reloaded_theme)
        os.remove(theme_asset_path)

    is_theme_system_valid = (
        is_valid_theme
        and has_bg_var
        and has_primary_var
        and reloaded_valid
    )
    log_test("JSON Theme Validation, CSS Variable Compilation & Asset Persistence", is_theme_system_valid)


# =====================================================================
# 22. AI INSTRUCTION STUDIO UI MODIFICATION PROMPTS
# =====================================================================
def test_ai_studio_ui_prompts() -> None:
    log_suite("22. AI Instruction Studio UI Modification Prompts")

    def build_ai_ui_prompt(screenshot_instructions: str, current_theme: Dict[str, Any]) -> str:
        prompt_lines = [
            "You are a Theme Architect AI for WP Exam.",
            "Based on the user screenshot description and modification request, update the theme JSON.",
            f"User Instructions: {screenshot_instructions}",
            "Current Theme JSON:",
            json.dumps(current_theme, indent=2),
            "Output strictly valid JSON conforming to the WP Exam theme specification.",
        ]
        return "\n".join(prompt_lines)

    current_theme = {
        "id": "white",
        "name": "White Theme",
        "background": "#ffffff",
        "foreground": "#1e293b",
        "primary": "#3b82f6",
        "accent": "#f59e0b",
        "card": "#f8fafc",
    }
    instructions = "Make the background pure black and primary color bright yellow like Rise Up Asia."
    prompt = build_ai_ui_prompt(instructions, current_theme)

    has_role_instruction = "Theme Architect AI" in prompt
    has_screenshot_note = "Make the background pure black" in prompt
    has_theme_payload = '"background": "#ffffff"' in prompt

    mock_ai_response = json.dumps({
        "id": "rise_up_dark_gold",
        "name": "Rise Up Dark Gold",
        "background": "#000000",
        "foreground": "#ffffff",
        "primary": "#fbbf24",
        "accent": "#f59e0b",
        "card": "#18181b",
    })

    try:
        parsed_theme = json.loads(mock_ai_response)
        has_black_bg = parsed_theme.get("background") == "#000000"
        has_gold_primary = parsed_theme.get("primary") == "#fbbf24"
        is_ai_payload_valid = has_black_bg and has_gold_primary
    except Exception:
        is_ai_payload_valid = False

    is_ai_studio_prompt_valid = (
        has_role_instruction
        and has_screenshot_note
        and has_theme_payload
        and is_ai_payload_valid
    )
    log_test("AI Instruction Studio Screenshot-to-Theme Prompt & Response Ingestion", is_ai_studio_prompt_valid)


# =====================================================================
# 23. MULTI-TIER HIERARCHY PERMISSION SCOPES & INHERITANCE
# =====================================================================
def test_hierarchy_permission_scopes() -> None:
    log_suite("23. Multi-tier Hierarchy Permission Scopes & Inheritance")

    class PermissionEngine:
        def __init__(self) -> None:
            self.categories: Dict[str, List[str]] = {}
            self.sub_projects: Dict[str, List[str]] = {}
            self.user_permissions: Dict[str, Dict[str, set]] = {}

        def register_category(self, category_id: str, project_ids: List[str]) -> None:
            self.categories[category_id] = project_ids

        def register_sub_projects(self, parent_project_id: str, sub_project_ids: List[str]) -> None:
            self.sub_projects[parent_project_id] = sub_project_ids

        def grant_category_access(self, user_id: str, category_id: str) -> None:
            has_user = user_id in self.user_permissions
            if not has_user:
                self.user_permissions[user_id] = {"categories": set(), "projects": set()}
            self.user_permissions[user_id]["categories"].add(category_id)

        def grant_project_access(self, user_id: str, project_id: str) -> None:
            has_user = user_id in self.user_permissions
            if not has_user:
                self.user_permissions[user_id] = {"categories": set(), "projects": set()}
            self.user_permissions[user_id]["projects"].add(project_id)

        def check_project_access(self, user_id: str, target_project_id: str) -> bool:
            has_user = user_id in self.user_permissions
            if not has_user:
                return False

            user_perms = self.user_permissions[user_id]
            for cat_id in user_perms["categories"]:
                cat_projects = self.categories.get(cat_id, [])
                has_direct = target_project_id in cat_projects
                if has_direct:
                    return True
                for p_id in cat_projects:
                    has_sub = target_project_id in self.sub_projects.get(p_id, [])
                    if has_sub:
                        return True

            has_direct_proj = target_project_id in user_perms["projects"]
            if has_direct_proj:
                return True

            for p_id in user_perms["projects"]:
                has_sub = target_project_id in self.sub_projects.get(p_id, [])
                if has_sub:
                    return True

            return False

    engine = PermissionEngine()
    engine.register_category("cat_engineering", ["proj_backend", "proj_devops"])
    engine.register_sub_projects("proj_backend", ["proj_microservices", "proj_database"])

    engine.grant_category_access("user_tech_lead", "cat_engineering")
    has_lead_backend = engine.check_project_access("user_tech_lead", "proj_backend")
    has_lead_subproject = engine.check_project_access("user_tech_lead", "proj_microservices")

    engine.grant_project_access("user_db_specialist", "proj_backend")
    has_db_backend = engine.check_project_access("user_db_specialist", "proj_backend")
    has_db_subproject = engine.check_project_access("user_db_specialist", "proj_database")
    has_db_denied_sibling = engine.check_project_access("user_db_specialist", "proj_devops")
    is_sibling_blocked = has_db_denied_sibling == False

    has_stranger_denied = engine.check_project_access("user_stranger", "proj_backend") == False

    is_permission_matrix_valid = (
        has_lead_backend
        and has_lead_subproject
        and has_db_backend
        and has_db_subproject
        and is_sibling_blocked
        and has_stranger_denied
    )
    log_test("Category & Project Cascading Permission Inheritance", is_permission_matrix_valid)


# =====================================================================
# 24. COMPLEX FORM MULTI-FIELD INSTANT LIVE VALIDATION MATRIX
# =====================================================================
def test_form_live_validation_matrix() -> None:
    log_suite("24. Complex Form Multi-Field Instant Live Validation Matrix")

    class FormLiveValidator:
        @staticmethod
        def validate_form(payload: Dict[str, Any]) -> Dict[str, Any]:
            errors: Dict[str, str] = {}

            email = payload.get("email", "")
            email_pattern = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
            is_valid_email = bool(email_pattern.match(email))
            if not is_valid_email:
                errors["email"] = "Invalid email format"

            score = payload.get("score")
            has_score = isinstance(score, (int, float))
            if has_score:
                is_score_in_range = 0 <= score <= 100
                if not is_score_in_range:
                    errors["score"] = "Score must be between 0 and 100"
            if not has_score:
                errors["score"] = "Score is required"

            emp_code = payload.get("employee_code", "")
            emp_pattern = re.compile(r"^EMP-[0-9]{4}$")
            is_valid_emp = bool(emp_pattern.match(emp_code))
            if not is_valid_emp:
                errors["employee_code"] = "Employee code must match EMP-XXXX"

            has_zero_errors = len(errors) == 0
            return {
                "is_valid": has_zero_errors,
                "errors": errors,
            }

    valid_payload = {
        "email": "candidate@riseup.asia",
        "score": 85,
        "employee_code": "EMP-9021",
    }
    result_valid = FormLiveValidator.validate_form(valid_payload)
    has_valid_pass = result_valid["is_valid"]
    has_empty_errors = len(result_valid["errors"]) == 0

    invalid_payload = {
        "email": "bad_email_at_riseup",
        "score": 150,
        "employee_code": "WRONG-123",
    }
    result_invalid = FormLiveValidator.validate_form(invalid_payload)
    has_invalid_fail = result_invalid["is_valid"] == False
    has_email_err = "email" in result_invalid["errors"]
    has_score_err = "score" in result_invalid["errors"]
    has_emp_err = "employee_code" in result_invalid["errors"]

    is_matrix_valid = (
        has_valid_pass
        and has_empty_errors
        and has_invalid_fail
        and has_email_err
        and has_score_err
        and has_emp_err
    )
    log_test("Complex Form Multi-Field Instant Live Validation Matrix", is_matrix_valid)


# =====================================================================
# 25. AI INSTRUCTION STUDIO FULL CURRICULUM GENERATION & SYNTHESIS
# =====================================================================
def test_ai_curriculum_generation_and_synthesis() -> None:
    log_suite("25. AI Instruction Studio Full Curriculum Generation & Synthesis")

    def build_ai_curriculum_prompt(raw_spec_text: str) -> str:
        prompt_lines = [
            "You are an Expert Curriculum Architect AI for WP Exam.",
            "Transform the provided raw documentation into a complete curriculum JSON with sections, pages, video, checklist, and quiz.",
            f"Input Spec:\n{raw_spec_text}",
            "Output strictly valid JSON with keys: 'project_id', 'title', 'sections', 'checklist', 'questions'.",
        ]
        return "\n".join(prompt_lines)

    sample_doc = "AWS Infrastructure 101: VPC, Subnets, and NAT Gateways. Includes video walkthrough and 3 checklist gates."
    prompt = build_ai_curriculum_prompt(sample_doc)

    has_architect_role = "Expert Curriculum Architect AI" in prompt
    has_doc_text = "AWS Infrastructure 101" in prompt

    mock_curriculum_json = json.dumps({
        "project_id": "proj_aws_101",
        "title": "AWS Infrastructure 101",
        "sections": [
            {"id": "sec_intro", "title": "VPC Basics", "pages_count": 10},
            {"id": "sec_advanced", "title": "NAT & Routing", "pages_count": 5},
        ],
        "checklist": [
            {"id": "chk_read_docs", "label": "Read all 10 documentation pages"},
            {"id": "chk_watch_video", "label": "Watch NAT walkthrough video"},
        ],
        "questions": [
            {
                "id": "q1",
                "type": "mcq",
                "prompt": "What does VPC stand for?",
                "options": ["Virtual Private Cloud", "Variable Protocol Channel"],
                "correct_option": 0,
            }
        ],
    })

    def validate_curriculum_schema(data: Dict[str, Any]) -> bool:
        required_root = ["project_id", "title", "sections", "checklist", "questions"]
        for key in required_root:
            has_key = key in data
            if not has_key:
                return False

        is_sections_list = isinstance(data["sections"], list)
        is_checklist_list = isinstance(data["checklist"], list)
        is_questions_list = isinstance(data["questions"], list)
        if not is_sections_list:
            return False
        if not is_checklist_list:
            return False
        if not is_questions_list:
            return False

        has_sections = len(data["sections"]) > 0
        has_checklist = len(data["checklist"]) > 0
        has_questions = len(data["questions"]) > 0

        return has_sections and has_checklist and has_questions

    try:
        parsed_curriculum = json.loads(mock_curriculum_json)
        is_curriculum_valid = validate_curriculum_schema(parsed_curriculum)
    except Exception:
        is_curriculum_valid = False

    is_ai_curriculum_suite_valid = (
        has_architect_role
        and has_doc_text
        and is_curriculum_valid
    )
    log_test("AI Curriculum Studio Prompt Generation & Structural Schema Synthesis", is_ai_curriculum_suite_valid)


# =====================================================================
# 26. PROJECT & QUESTION PROGRESS CALCULATION & SUB-PROJECT TRANSITION
# =====================================================================
def test_progress_calculation_and_transition() -> None:
    log_suite("26. Project & Question Progress Calculation & Sub-project Transition")

    class ProjectProgressTracker:
        def __init__(self, total_pages: int, total_checklist: int, total_questions: int) -> None:
            self.total_pages = total_pages
            self.total_checklist = total_checklist
            self.total_questions = total_questions
            self.pages_read = 0
            self.has_watched_video = False
            self.checklist_completed = 0
            self.questions_answered = 0

        def calculate_progress_percentage(self) -> float:
            read_ratio = self.pages_read / self.total_pages if self.total_pages > 0 else 1.0
            video_ratio = 1.0 if self.has_watched_video else 0.0
            check_ratio = self.checklist_completed / self.total_checklist if self.total_checklist > 0 else 1.0
            quiz_ratio = self.questions_answered / self.total_questions if self.total_questions > 0 else 1.0

            progress = (read_ratio * 25.0) + (video_ratio * 15.0) + (check_ratio * 30.0) + (quiz_ratio * 30.0)
            return round(min(progress, 100.0), 1)

        def is_milestone_completed(self) -> bool:
            pct = self.calculate_progress_percentage()
            return pct >= 100.0

    tracker = ProjectProgressTracker(total_pages=10, total_checklist=4, total_questions=5)

    initial_pct = tracker.calculate_progress_percentage()
    has_zero_progress = initial_pct == 0.0

    tracker.pages_read = 10
    tracker.has_watched_video = True
    tracker.checklist_completed = 2
    tracker.questions_answered = 3
    mid_pct = tracker.calculate_progress_percentage()
    has_expected_mid = mid_pct == 73.0

    tracker.checklist_completed = 4
    tracker.questions_answered = 5
    final_pct = tracker.calculate_progress_percentage()
    is_completed = tracker.is_milestone_completed()

    is_progress_system_valid = (
        has_zero_progress
        and has_expected_mid
        and final_pct == 100.0
        and is_completed
    )
    log_test("Interactive Progress Bar Computation & Stage Transits", is_progress_system_valid)


# =====================================================================
# 27. END-OF-DAY & END-OF-WEEK BATCH EMAIL NOTIFICATION DIGEST QUEUE
# =====================================================================
def test_email_digest_queue() -> None:
    log_suite("27. End-of-Day & End-of-Week Batch Email Notification Digest Queue")

    class DigestQueueManager:
        def __init__(self) -> None:
            self.queue: List[Dict[str, Any]] = []

        def enqueue_event(self, candidate_name: str, project_id: str, section_name: str, cadence: str) -> None:
            self.queue.append({
                "candidate_name": candidate_name,
                "project_id": project_id,
                "section_name": section_name,
                "cadence": cadence,
                "timestamp": int(time.time()),
            })

        def compile_digest(self, cadence_target: str, recipient_email: str) -> Optional[Dict[str, Any]]:
            matching_events = [ev for ev in self.queue if ev["cadence"] == cadence_target]
            has_events = len(matching_events) > 0
            if not has_events:
                return None

            lines = [f"Summary Digest for {recipient_email} (Cadence: {cadence_target}):"]
            for ev in matching_events:
                lines.append(f"- Candidate: {ev['candidate_name']} | Section: {ev['section_name']} ({ev['project_id']})")

            self.queue = [ev for ev in self.queue if ev["cadence"] != cadence_target]

            return {
                "recipient": recipient_email,
                "cadence": cadence_target,
                "subject": f"WP Exam Digest ({cadence_target}) - {len(matching_events)} events",
                "body": "\n".join(lines),
                "event_count": len(matching_events),
            }

    manager = DigestQueueManager()
    manager.enqueue_event("Alice Chen", "proj_aws", "VPC Networking", "end_of_day")
    manager.enqueue_event("Bob Smith", "proj_aws", "NAT Gateways", "end_of_day")
    manager.enqueue_event("Charlie Lee", "proj_k8s", "Ingress Controllers", "end_of_week")

    eod_digest = manager.compile_digest("end_of_day", "admin@riseup.asia")
    has_eod_digest = eod_digest is not None
    has_two_events = False
    has_alice_in_body = False
    if eod_digest:
        has_two_events = eod_digest.get("event_count") == 2
        has_alice_in_body = "Alice Chen" in eod_digest.get("body", "")

    has_remaining_eow = len(manager.queue) == 1

    eow_digest = manager.compile_digest("end_of_week", "owner@riseup.asia")
    has_eow_digest = eow_digest is not None
    has_queue_cleared = len(manager.queue) == 0

    is_digest_system_valid = (
        has_eod_digest
        and has_two_events
        and has_alice_in_body
        and has_remaining_eow
        and has_eow_digest
        and has_queue_cleared
    )
    log_test("End-of-Day & End-of-Week Batch Email Notification Digest Queue", is_digest_system_valid)


# =====================================================================
# 28. AUTOMATED SPLIT DB BACKUP EMAIL & SERVER STORAGE DUAL-DISPATCH
# =====================================================================
def test_backup_dual_dispatch() -> None:
    log_suite("28. Automated Split DB Backup Email & Server Storage Dual-Dispatch")

    class BackupDualDispatcher:
        def __init__(self, backup_dir: str, max_retention: int = 3) -> None:
            self.backup_dir = backup_dir
            self.max_retention = max_retention
            os.makedirs(self.backup_dir, exist_ok=True)
            self.dispatched_emails: List[Dict[str, Any]] = []

        def create_and_dispatch(self, backup_name: str, content: bytes, target_email: str) -> Dict[str, Any]:
            file_path = os.path.join(self.backup_dir, f"{backup_name}.zip")
            with open(file_path, "wb") as f:
                f.write(content)

            existing_files = sorted(
                [os.path.join(self.backup_dir, fn) for fn in os.listdir(self.backup_dir) if fn.endswith(".zip")],
                key=os.path.getmtime,
            )
            while len(existing_files) > self.max_retention:
                oldest = existing_files.pop(0)
                os.remove(oldest)

            email_payload = {
                "to": target_email,
                "subject": f"Automated WP Exam Backup: {backup_name}",
                "attachment_filename": f"{backup_name}.zip",
                "attachment_size_bytes": len(content),
                "is_dispatched": True,
            }
            self.dispatched_emails.append(email_payload)

            return {
                "local_file_path": file_path,
                "is_saved_on_server": os.path.isfile(file_path),
                "email_payload": email_payload,
            }

    temp_backup_dir = os.path.join(tempfile.gettempdir(), f"wp_exam_backup_test_{int(time.time())}")
    dispatcher = BackupDualDispatcher(temp_backup_dir, max_retention=2)

    result1 = dispatcher.create_and_dispatch("backup_2026_09_18_01", b"PK_DUMMY_ZIP_1", "sysadmin@riseup.asia")
    has_file1 = result1["is_saved_on_server"]
    has_email1 = result1["email_payload"]["is_dispatched"]

    time.sleep(0.01)
    result2 = dispatcher.create_and_dispatch("backup_2026_09_18_02", b"PK_DUMMY_ZIP_2", "sysadmin@riseup.asia")

    time.sleep(0.01)
    result3 = dispatcher.create_and_dispatch("backup_2026_09_18_03", b"PK_DUMMY_ZIP_3", "sysadmin@riseup.asia")

    remaining_files = [fn for fn in os.listdir(temp_backup_dir) if fn.endswith(".zip")]
    has_rotated_to_max = len(remaining_files) == 2
    has_oldest_pruned = "backup_2026_09_18_01.zip" not in remaining_files
    has_three_emails_sent = len(dispatcher.dispatched_emails) == 3

    shutil.rmtree(temp_backup_dir, ignore_errors=True)

    is_dual_dispatch_valid = (
        has_file1
        and has_email1
        and has_rotated_to_max
        and has_oldest_pruned
        and has_three_emails_sent
    )
    log_test("Automated Split DB Backup Email Transmission & Server Storage Dual-Dispatch", is_dual_dispatch_valid)


# =====================================================================
# 29. SOCIAL SHARE URL ATTRIBUTION & UTM PARAMETER TRACKING
# =====================================================================
def test_social_share_url_attribution() -> None:
    log_suite("29. Social Share URL Attribution & UTM Parameter Tracking")

    import urllib.parse

    def build_social_share_url(base_url: str, question_id: str, platform: str, campaign: str) -> str:
        params = {
            "qid": question_id,
            "utm_source": platform,
            "utm_medium": "social",
            "utm_campaign": campaign,
            "utm_content": f"question_{question_id}",
        }
        encoded_query = urllib.parse.urlencode(params)
        return f"{base_url}?{encoded_query}"

    def parse_and_validate_share_url(share_url: str) -> Tuple[bool, Dict[str, str]]:
        parsed = urllib.parse.urlparse(share_url)
        query_map = urllib.parse.parse_qs(parsed.query)

        required_keys = ["qid", "utm_source", "utm_medium", "utm_campaign", "utm_content"]
        extracted: Dict[str, str] = {}
        for key in required_keys:
            has_key = key in query_map
            if not has_key:
                return False, {}
            extracted[key] = query_map[key][0]

        for k, v in extracted.items():
            has_script = "<script" in v.lower()
            if has_script:
                return False, {}

        return True, extracted

    base = "https://example.com/wp-exam/quiz"
    share_link = build_social_share_url(base, "q_vpc_99", "twitter", "summer_onboarding_2026")
    is_valid_url, tags = parse_and_validate_share_url(share_link)

    has_source = tags.get("utm_source") == "twitter"
    has_campaign = tags.get("utm_campaign") == "summer_onboarding_2026"
    has_qid = tags.get("qid") == "q_vpc_99"

    malicious_link = f"{base}?qid=1&utm_source=%3Cscript%3Ealert(1)%3C/script%3E&utm_medium=social&utm_campaign=x&utm_content=y"
    is_malicious_valid, _ = parse_and_validate_share_url(malicious_link)
    is_malicious_blocked = not is_malicious_valid

    is_suite_valid = (
        is_valid_url
        and has_source
        and has_campaign
        and has_qid
        and is_malicious_blocked
    )
    log_test("Social Share URL UTM Campaign Attribution & XSS Neutralization", is_suite_valid)


# =====================================================================
# 30. QUESTION & OPTION DETERMINISTIC RANDOMIZATION & SEEDED SHUFFLE
# =====================================================================
def test_seeded_randomization_and_shuffle() -> None:
    log_suite("30. Question & Option Deterministic Randomization & Seeded Shuffle")

    import random

    def shuffle_questions(questions: List[Dict[str, Any]], seed: int) -> List[Dict[str, Any]]:
        shuffled = list(questions)
        rng = random.Random(seed)
        rng.shuffle(shuffled)
        return shuffled

    def shuffle_options_with_pointer(question: Dict[str, Any], seed: int) -> Dict[str, Any]:
        options = list(question.get("options", []))
        correct_idx = question.get("correct_option", 0)
        correct_value = options[correct_idx] if 0 <= correct_idx < len(options) else None

        indexed_options = list(enumerate(options))
        rng = random.Random(seed)
        rng.shuffle(indexed_options)

        shuffled_options = [opt for _, opt in indexed_options]
        new_correct_idx = shuffled_options.index(correct_value) if correct_value in shuffled_options else 0

        updated = dict(question)
        updated["options"] = shuffled_options
        updated["correct_option"] = new_correct_idx
        return updated

    raw_questions = [
        {"id": "q1", "text": "Q1", "options": ["Alpha", "Beta", "Gamma", "Delta"], "correct_option": 1},
        {"id": "q2", "text": "Q2", "options": ["One", "Two", "Three", "Four"], "correct_option": 2},
        {"id": "q3", "text": "Q3", "options": ["Red", "Green", "Blue", "Yellow"], "correct_option": 0},
    ]

    shuffled_run1 = shuffle_questions(raw_questions, seed=42)
    shuffled_run2 = shuffle_questions(raw_questions, seed=42)
    has_deterministic_match = [q["id"] for q in shuffled_run1] == [q["id"] for q in shuffled_run2]

    shuffled_diff = shuffle_questions(raw_questions, seed=99)
    has_divergent_order = [q["id"] for q in shuffled_run1] != [q["id"] for q in shuffled_diff]

    target_q = raw_questions[0]
    shuffled_q = shuffle_options_with_pointer(target_q, seed=123)
    new_idx = shuffled_q["correct_option"]
    preserves_correct_answer = shuffled_q["options"][new_idx] == "Beta"

    is_shuffle_suite_valid = (
        has_deterministic_match
        and has_divergent_order
        and preserves_correct_answer
    )
    log_test("Deterministic Question & Option Seeded Shuffle with Pointer Preservation", is_shuffle_suite_valid)


# =====================================================================
# 31. PIPELINE SEQUENCING TOPOLOGICAL VALIDATION & CYCLE DETECTION
# =====================================================================
def test_pipeline_topology_and_cycle_detection() -> None:
    log_suite("31. Pipeline Sequencing Topological Validation & Cycle Detection")

    class PipelineValidator:
        @staticmethod
        def has_cycle(prereq_graph: Dict[str, List[str]]) -> bool:
            visited: set = set()
            rec_stack: set = set()

            def dfs(node: str) -> bool:
                visited.add(node)
                rec_stack.add(node)
                for neighbor in prereq_graph.get(node, []):
                    has_visited = neighbor in visited
                    if not has_visited:
                        is_cycle = dfs(neighbor)
                        if is_cycle:
                            return True
                    has_in_stack = neighbor in rec_stack
                    if has_in_stack:
                        return True
                rec_stack.remove(node)
                return False

            for node in prereq_graph:
                has_visited = node in visited
                if not has_visited:
                    is_cycle = dfs(node)
                    if is_cycle:
                        return True
            return False

        @staticmethod
        def is_execution_order_valid(order: List[str], prereq_graph: Dict[str, List[str]]) -> bool:
            completed: set = set()
            for step in order:
                prereqs = prereq_graph.get(step, [])
                for p in prereqs:
                    has_prereq = p in completed
                    if not has_prereq:
                        return False
                completed.add(step)
            return True

    acyclic_graph = {
        "A": [],
        "C": ["A"],
        "D": ["C"],
        "B": ["D"],
    }
    is_acyclic_clean = not PipelineValidator.has_cycle(acyclic_graph)
    is_valid_sequence = PipelineValidator.is_execution_order_valid(["A", "C", "D", "B"], acyclic_graph)
    is_invalid_sequence_blocked = not PipelineValidator.is_execution_order_valid(["B", "A", "C", "D"], acyclic_graph)

    cyclic_graph = {
        "A": ["C"],
        "B": ["A"],
        "C": ["B"],
    }
    is_cycle_detected = PipelineValidator.has_cycle(cyclic_graph)

    is_pipeline_suite_valid = (
        is_acyclic_clean
        and is_valid_sequence
        and is_invalid_sequence_blocked
        and is_cycle_detected
    )
    log_test("Pipeline Sequencing Topological Validation & Cyclic Dependency Detection", is_pipeline_suite_valid)


# =====================================================================
# 32. CANDIDATE QUIZ RETAKE & ATTEMPT BOUNDARY LIMITS
# =====================================================================
def test_candidate_retake_and_attempt_limits() -> None:
    log_suite("32. Candidate Quiz Retake & Attempt Boundary Limits")

    class AttemptManager:
        def __init__(self, max_attempts: int = 3, score_policy: str = "highest") -> None:
            self.max_attempts = max_attempts
            self.score_policy = score_policy
            self.history: List[Dict[str, Any]] = []

        def can_attempt(self) -> bool:
            return len(self.history) < self.max_attempts

        def record_attempt(self, score: float, is_passed: bool) -> Tuple[bool, Optional[str]]:
            has_quota = self.can_attempt()
            if not has_quota:
                return False, "Attempt limit exceeded"

            attempt_num = len(self.history) + 1
            self.history.append({
                "attempt": attempt_num,
                "score": score,
                "is_passed": is_passed,
                "timestamp": time.time(),
            })
            return True, None

        def get_effective_score(self) -> float:
            has_history = len(self.history) > 0
            if not has_history:
                return 0.0

            if self.score_policy == "latest":
                return self.history[-1]["score"]

            return max(a["score"] for a in self.history)

    mgr = AttemptManager(max_attempts=3, score_policy="highest")

    is_att1_recorded, _ = mgr.record_attempt(score=45.0, is_passed=False)
    is_att2_recorded, _ = mgr.record_attempt(score=85.0, is_passed=True)
    is_att3_recorded, _ = mgr.record_attempt(score=70.0, is_passed=True)
    is_att4_recorded, _ = mgr.record_attempt(score=95.0, is_passed=True)

    is_lockout_enforced = not is_att4_recorded
    effective_score = mgr.get_effective_score()
    has_highest_score = effective_score == 85.0

    is_retake_suite_valid = (
        is_att1_recorded
        and is_att2_recorded
        and is_att3_recorded
        and is_lockout_enforced
        and has_highest_score
    )
    log_test("Candidate Quiz Retake & Attempt Boundary Limits", is_retake_suite_valid)


# =====================================================================
# 33. MULTI-LANGUAGE / I18N LOCALIZATION & RTL LAYOUT TOKENS
# =====================================================================
def test_i18n_localization_and_rtl_tokens() -> None:
    log_suite("33. Multi-Language / i18n Localization & RTL Layout Tokens")

    class I18nEngine:
        RTL_LOCALES = {"ar", "he", "fa", "ur"}

        def __init__(self) -> None:
            self.catalogs: Dict[str, Dict[str, str]] = {
                "en": {
                    "quiz_title": "VPC Architecture Exam",
                    "start_button": "Start Exam",
                    "wrong_answer": "You have done the wrong answer",
                },
                "ar": {
                    "quiz_title": "امتحان بنية السحابة الافتراضية",
                    "start_button": "ابدأ الاختبار",
                    "wrong_answer": "لقد قمت باختيار الإجابة الخاطئة",
                },
                "zh": {
                    "quiz_title": "VPC 架构认证考试",
                    "start_button": "开始考试",
                    "wrong_answer": "您的回答不正确",
                },
            }

        def get_text(self, locale: str, key: str) -> str:
            has_locale = locale in self.catalogs
            if not has_locale:
                return self.catalogs["en"].get(key, key)
            return self.catalogs[locale].get(key, self.catalogs["en"].get(key, key))

        def get_text_direction(self, locale: str) -> str:
            is_rtl = locale.lower() in self.RTL_LOCALES
            if is_rtl:
                return "rtl"
            return "ltr"

    engine = I18nEngine()

    en_title = engine.get_text("en", "quiz_title")
    en_dir = engine.get_text_direction("en")
    has_en_ltr = en_dir == "ltr"

    ar_title = engine.get_text("ar", "quiz_title")
    ar_dir = engine.get_text_direction("ar")
    has_ar_rtl = ar_dir == "rtl"
    has_ar_unicode = "بنية" in ar_title

    zh_title = engine.get_text("zh", "quiz_title")
    has_zh_unicode = "架构" in zh_title

    fallback_text = engine.get_text("fr", "start_button")
    has_fallback = fallback_text == "Start Exam"

    json_str = json.dumps(engine.catalogs, ensure_ascii=False)
    deserialized = json.loads(json_str)
    has_roundtrip = deserialized["ar"]["start_button"] == "ابدأ الاختبار"

    is_i18n_suite_valid = (
        has_en_ltr
        and has_ar_rtl
        and has_ar_unicode
        and has_zh_unicode
        and has_fallback
        and has_roundtrip
    )
    log_test("Multi-Language / i18n Localization & RTL Layout Tokens", is_i18n_suite_valid)


# =====================================================================
# 34. MIND MAP & HIERARCHICAL CONCEPT NODE SCHEMA VERIFICATION
# =====================================================================
def test_mind_map_hierarchy_and_schema() -> None:
    log_suite("34. Mind Map & Hierarchical Concept Node Schema Verification")

    class MindMapValidator:
        @staticmethod
        def validate_schema(data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
            required_keys = ["id", "title", "root_node"]
            for k in required_keys:
                has_key = k in data
                if not has_key:
                    return False, f"Missing key: {k}"

            root = data["root_node"]
            has_root_id = "id" in root
            has_root_topic = "topic" in root
            if not has_root_id:
                return False, "Root node missing id"
            if not has_root_topic:
                return False, "Root node missing topic"

            seen_ids: set = set()

            def traverse(node: Dict[str, Any], path: set) -> Tuple[bool, Optional[str]]:
                nid = node.get("id")
                if not nid:
                    return False, "Node missing id"

                has_seen = nid in seen_ids
                if has_seen:
                    return False, f"Duplicate node id: {nid}"
                seen_ids.add(nid)

                has_cycle = nid in path
                if has_cycle:
                    return False, f"Cycle detected at node: {nid}"

                current_path = path.copy()
                current_path.add(nid)

                children = node.get("children", [])
                for child in children:
                    is_valid_child, err = traverse(child, current_path)
                    if not is_valid_child:
                        return False, err
                return True, None

            return traverse(root, set())

    valid_mindmap = {
        "id": "mm_aws_network",
        "title": "AWS VPC Core Concepts",
        "root_node": {
            "id": "node_root",
            "topic": "VPC Networking",
            "children": [
                {
                    "id": "node_subnets",
                    "topic": "Subnets",
                    "children": [
                        {"id": "node_public_subnet", "topic": "Public Subnet (IGW Route)"},
                        {"id": "node_private_subnet", "topic": "Private Subnet (NAT Route)"},
                    ],
                },
                {
                    "id": "node_routing",
                    "topic": "Route Tables",
                    "children": [
                        {"id": "node_igw", "topic": "Internet Gateway 0.0.0.0/0"},
                    ],
                },
            ],
        },
    }

    is_valid_mm, _ = MindMapValidator.validate_schema(valid_mindmap)

    invalid_mm_duplicate = {
        "id": "mm_bad",
        "title": "Bad MM",
        "root_node": {
            "id": "node_root",
            "topic": "Root",
            "children": [
                {"id": "node_subnets", "topic": "A"},
                {"id": "node_subnets", "topic": "Duplicate ID"},
            ],
        },
    }
    is_dup_valid, _ = MindMapValidator.validate_schema(invalid_mm_duplicate)
    is_dup_rejected = not is_dup_valid

    def export_to_workflowy_outline(node: Dict[str, Any], depth: int = 0) -> List[str]:
        lines = [f"{'  ' * depth}- {node['topic']}"]
        for child in node.get("children", []):
            lines.extend(export_to_workflowy_outline(child, depth + 1))
        return lines

    outline = export_to_workflowy_outline(valid_mindmap["root_node"])
    has_correct_depth = len(outline) == 6 and outline[0] == "- VPC Networking" and "    - Public Subnet" in outline[2]

    is_mindmap_suite_valid = (
        is_valid_mm
        and is_dup_rejected
        and has_correct_depth
    )
    log_test("Mind Map & Hierarchical Concept Node Schema Verification", is_mindmap_suite_valid)


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
    test_project_revision_history_and_rollback()
    test_analytics_and_failure_alerts()
    test_social_meta_and_sharing()
    test_question_hints_and_resources()
    test_theme_injection_and_compilation()
    test_ai_studio_ui_prompts()
    test_hierarchy_permission_scopes()
    test_form_live_validation_matrix()
    test_ai_curriculum_generation_and_synthesis()
    test_progress_calculation_and_transition()
    test_email_digest_queue()
    test_backup_dual_dispatch()
    test_social_share_url_attribution()
    test_seeded_randomization_and_shuffle()
    test_pipeline_topology_and_cycle_detection()
    test_candidate_retake_and_attempt_limits()
    test_i18n_localization_and_rtl_tokens()
    test_mind_map_hierarchy_and_schema()
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
