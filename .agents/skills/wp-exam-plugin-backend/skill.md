---
name: wp-exam-plugin-backend
description: WordPress PHP backend architecture for WP Exam, including REST controllers, JWT auth, EnvelopeBuilder responses, autoloader, and Elementor widget integration.
---

# WP Exam: WordPress Plugin Backend Architecture

This skill guides the design, implementation, debugging, and modification of the WordPress backend plugins in `wp-plugins/wp-exam/` and `wp-plugins/wp-sam/`.

## 1. Plugin Structure & Bootstrap

```
wp-plugins/wp-exam/
├── wp-exam.php                          # Main plugin bootstrap & headers
├── composer.json                        # PHP dependencies & autoloader map
├── includes/
│   ├── Autoloader.php                   # PSR-4 autoloader for WpExam\ namespace
│   ├── class-wp-exam-activator.php      # Activation handler & MySQL dbDelta schemas
│   ├── class-wp-exam-admin.php          # Admin menu & asset enqueueing
│   ├── Core/
│   │   └── Plugin.php                   # Singleton coordinator & hook registrar
│   ├── api/                             # REST API controllers
│   │   ├── authrestcontroller.php       # JWT auth & token issuance
│   │   ├── FormRestController.php       # Form/Quiz CRUD & public submissions
│   │   ├── ProjectHierarchyRestController.php # 4-tier project tree & sections
│   │   ├── AIInstructionRestController.php    # AI curriculum studio endpoints
│   │   ├── CompletionHistoryRestController.php # Submission history & analytics
│   │   ├── EmailSettingsRestController.php    # Email notification settings
│   │   ├── JsonImportExportRestController.php # Full curriculum JSON migration
│   │   ├── SystemBackupRestController.php     # SQLite zip backups & rotation
│   │   └── UserInviteRestController.php       # Candidate tokenized invites
│   ├── Database/                        # Micro-ORM & database wrappers
│   ├── elementor/
│   │   └── quizwidget.php               # Elementor widget integration
│   ├── Enums/                           # Typed PHP 8.1 Enums with Type suffix
│   ├── ErrorHandling/
│   │   └── BootErrorCollector.php       # Pre-flight error collector
│   ├── Helpers/
│   │   └── EnvelopeBuilder.php          # Universal Response Envelope builder
│   └── Logging/
│       └── FileLogger.php               # File-based logging sink
```

## 2. Universal Response Envelope (`EnvelopeBuilder`)

All REST API endpoints MUST return responses formatted with the Universal Response Envelope:

```php
use WpExam\Helpers\EnvelopeBuilder;
use WpExam\Enums\HttpStatusType;

// Success Response
return EnvelopeBuilder::create()
    ->withStatus(HttpStatusType::Ok, 'Form retrieved successfully')
    ->withResults($formData)
    ->toRestResponse();

// Error Response
return EnvelopeBuilder::create()
    ->withStatus(HttpStatusType::NotFound, 'Form not found')
    ->withErrors(['FormId' => 'No record matches provided identifier'])
    ->toRestResponse();
```

Response JSON Structure:
```json
{
  "Status": {
    "IsSuccess": true,
    "IsFailed": false,
    "Code": 200,
    "Message": "...",
    "Timestamp": "2026-09-21T00:00:00Z"
  },
  "Attributes": {
    "RequestedAt": "2026-09-21T00:00:00Z",
    "HasAnyErrors": false,
    "TotalRecords": 1
  },
  "Results": {},
  "Errors": []
}
```

## 3. REST Routes & Authentication

- Namespace: `wp-exam/v1`
- JWT Authentication: Handled by `AuthRestController`:
  - `POST /wp-json/wp-exam/v1/auth/token`: Issues signed HS256 JWT tokens.
  - `GET /wp-json/wp-exam/v1/auth/validate`: Validates current Bearer token.
  - Injected via WordPress hook `determine_current_user` with priority 20.
- Public Routes:
  - `GET /wp-json/wp-exam/v1/forms`: Returns list of published forms.
  - `GET /wp-json/wp-exam/v1/forms/{id}`: Returns form layout. **Security Guard:** When `FormType == 'quiz'`, `CorrectAnswer` fields are stripped to prevent inspection cheating.
  - `POST /wp-json/wp-exam/v1/forms/{id}/submit`: Evaluates answers, passes through scoring rules, computes pass/fail status, and creates immutable submission record.
- Protected Routes:
  - Require `manage_options` capability or valid admin JWT token.

## 4. Elementor Widget Integration (`quizwidget.php`)

- Registers widget `WpExam\Elementor\QuizWidget` under the `elementor/widgets/register` action.
- Renders container `#wp-exam-app.wp-exam-theme` with data attributes:
  - `data-form-id`: Target quiz/form ID.
  - `data-theme`: Selected theme preset (letterly-dark, riseup-gold, etc.).
  - `data-mode`: Sequential focus runner or single-page form runner.
- Enqueues built Vite bundles from `dist/` or dev server from `http://localhost:5173`.

## 5. Coding Standards for PHP

- **PHP 8.1+ Compatibility:** Explicit types, strict typing (`declare(strict_types=1);`).
- **Enums:** All enum classes MUST end with `Type` (e.g. `FormType`, `HttpStatusType`, `FieldType`).
- **Error Handling:** Never swallow exceptions. Log with operation context via `FileLogger::getInstance()->error(...)` and record in `BootErrorCollector`.
- **Database Access:** Use `WpExam\Database\Orm` or `$wpdb->prepare()`. Raw SQL string concatenation is strictly banned.
