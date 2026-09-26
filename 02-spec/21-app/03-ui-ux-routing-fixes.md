# UI, UX, and Routing Fixes Specification

## 1. Overview
This specification details the remediation of 8 distinct UI, UX, and routing issues identified by the user in the Form & Assessment Builder application.

## 2. Requirements

### 2.1 File Upload Preview Bug
- **Issue**: File upload preview is missing after selection.
- **Spec**: File selection must immediately render a preview or file name chip in both the builder and the test runner.

### 2.2 Header Layout Alignment
- **Issue**: Missing back button/misaligned left header in FormBuilder.
- **Spec**: Restore a clearly visible back button. Ensure flex layout maintains proper alignment between left controls, center title, and right actions.

### 2.3 Typography & Text Density
- **Issue**: Missing Ubuntu font for headers, excessive text.
- **Spec**: All `h1` - `h6` headers must use the Ubuntu font family. Review high-density areas and truncate/simplify descriptions.

### 2.4 Slug Management & Routing
- **Issue**: URLs do not change when navigating between forms/views.
- **Spec**: Implement React Router (or equivalent) slug-based routing for builder and runner (e.g., `/builder/:formSlug`, `/runner/:formSlug`).

### 2.5 Job Selection Title
- **Issue**: Missing job selection title component.
- **Spec**: Provide a field or header for Job Selection in the relevant configuration panel.

### 2.6 Video Question Format
- **Issue**: Inability to add video to questions.
- **Spec**: Add 'Video' to question type enumerations. Provide a URL/Upload field for video block rendering in the form runner.

### 2.7 Button Sizing Consistency
- **Issue**: Buttons are irregularly sized.
- **Spec**: Define standard `sm`, `md`, `lg` button size variants in the design system and apply them uniformly.

### 2.8 Terminology: Section vs Module
- **Issue**: "Section" and "Module" used interchangeably.
- **Spec**: Standardize purely on "Section". Remove all UI occurrences of "Module".
