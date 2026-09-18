# Quiz & Dynamic Form Engine — File Topology & Module Layout

Version: 2.0.0  
Updated: 2026-09-18  
AI Confidence: Production-Ready  
Ambiguity: None  

## Overview

This specification establishes the authoritative, repo-relative file topology for the WordPress WP Exam plugin. Following the architectural patterns of `wp-plugins/riseup-asia-uploader`, all backend PHP components are organized under modern PSR-4 namespaces (`WpExam\*`) and mapped by a standalone autoloader.

---

## 1. Backend PHP File Topology

All WordPress PHP files live in root and `includes/`:

```text
wp-exam/
├── wp-exam.php                                # Plugin bootstrap, autoloader registration, activation hook
├── includes/
│   ├── Autoloader.php                        # Standalone PSR-4 autoloader for WpExam\ namespace
│   ├── Activation/
│   │   └── ActivationHandler.php             # Database table migrations via dbDelta()
│   ├── Api/
│   │   ├── FormRestController.php            # REST controller for /wp-json/wp-exam/v1/ routes
│   │   └── SubmissionRestController.php      # Controller for form submissions & evaluation
│   ├── Core/
│   │   └── Plugin.php                        # Core singleton coordinator
│   ├── Database/
│   │   ├── WpDbQueryWrapper.php              # Safe $wpdb execution, error logging & transaction guards
│   │   ├── TypedQuery.php                    # Generic typed query helper wrapping PDO/wpdb
│   │   ├── DbResult.php                      # Single-item query result container (T)
│   │   ├── DbResultSet.php                   # Multi-item query result container (T[])
│   │   └── DbExecResult.php                  # Mutation result container (rows affected, insertId)
│   ├── Enums/
│   │   ├── FormType.php                      # Quiz, EmployeeSignup, Survey, GeneralForm
│   │   ├── FieldType.php                     # MultipleChoice, ShortAnswer, Textarea, Email, Phone, etc.
│   │   ├── FormAccessType.php                # Public, Authenticated, AdminOnly
│   │   ├── ResponseMessageType.php           # Standardized API response messages
│   │   └── HttpStatusType.php                # Strict HTTP status codes
│   ├── ErrorHandling/
│   │   ├── BootErrorCollector.php            # Early-boot diagnostic collector
│   │   └── FatalErrorHandler.php             # Fatal error shutdown handler
│   └── Helpers/
│       ├── EnvelopeBuilder.php               # Universal standardized response envelope builder
│       └── Traits/
│           ├── EnvelopeFactoryTrait.php      # Factory constructors (success, error, notFound)
│           ├── EnvelopeSettersTrait.php      # Fluent setters
│           └── EnvelopeBuildTrait.php        # JSON / WP_REST_Response serializer
```

---

## 2. Frontend React File Topology

The frontend is a modern React Single Page Application (SPA) located in `src/`:

```text
src/
├── main.tsx                                   # React entry point mounting to #wp-exam-app
├── App.tsx                                    # Main app layout, routing & tab state
├── index.css                                  # Global Tailwind styles & design tokens
├── components/
│   ├── ui/                                    # Reusable UI primitives (Button, Card, Input, Textarea, Dialog, etc.)
│   ├── forms/
│   │   ├── FormBuilder.tsx                    # Top-level form & question editor SPA
│   │   ├── FormSettingsCard.tsx               # Configuration panel (Type, Access, Sequential, Time Limit)
│   │   ├── FieldList.tsx                      # @dnd-kit drag-and-drop sortable field container
│   │   ├── FieldItem.tsx                      # Individual field editor card with type selector
│   │   ├── FieldTypeSelector.tsx              # Select dropdown / badges for 9 field types
│   │   ├── OptionListEditor.tsx               # Choice editor for multiple choice & dropdown
│   │   └── LivePreviewModal.tsx               # Real-time interactive preview (sequential & single page)
│   └── runner/
│       ├── FormRunner.tsx                     # Form respondent UI for public guests & logged-in users
│       ├── SequentialRunner.tsx               # Question-by-question wizard with progress & timer
│       └── SinglePageRunner.tsx               # Employee sign-up and survey form layout
├── lib/
│   ├── api/
│   │   ├── formApiClient.ts                   # Typed client consuming /wp-json/wp-exam/v1/ endpoints
│   │   └── envelope.ts                        # Universal response envelope types & unwrappers
│   └── types/
│       └── form.ts                            # Strict TypeScript interfaces matching backend models & enums
└── store/
    └── useFormStore.ts                        # Zustand store for form state, fields, mode & live preview
```

---

## 3. End-to-End Test File Topology

```text
tests/
├── e2e/
│   ├── sequential-quiz.spec.ts                # Playwright E2E test for sequential quiz execution & scoring
│   ├── employee-signup-form.spec.ts           # Playwright E2E test for public employee onboarding form
│   └── form-builder-dnd.spec.ts               # E2E test for field drag-and-drop, configuration & save
├── unit/
│   ├── FormRestControllerTest.php            # PHPUnit test for REST routes and envelope contracts
│   ├── WpDbQueryWrapperTest.php               # PHPUnit test for safe query execution & error handling
│   └── EnvelopeBuilderTest.php                # PHPUnit test for response envelope formatting
└── fixtures/
    ├── sample-quiz.json                       # Fixture data for multi-question timed quiz
    └── sample-employee-form.json              # Fixture data for employee onboarding form
```
