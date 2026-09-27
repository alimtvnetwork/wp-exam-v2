# Specification: Email Template Studio, Multi-Theme Palettes & Multi-Screen Verification

## 1. Executive Summary & Purpose

This specification governs the Email Template Studio, UI-driven email template customization, multi-theme visual styling, question-level notification triggers, and multi-screen responsive verification across Desktop, Tablet, and Mobile viewports.

---

## 2. Verbatim Requirements

The following requirements are captured verbatim from the user prompt:
1. **Multi-Screen Verification**: Ensure all features are verified across multiple screen resolutions (Desktop, Tablet, Mobile/low-res < 640px).
2. **Multiple Themes for Email Templates**: Add multiple distinct color and branding themes to the email templates (Emerald, Deep Navy, Royal Blue, Vivid Purple, Warm Amber, Clean Slate).
3. **Dedicated Email Template Section in UI**: Provide a dedicated Email Template section/studio where the email layout, styling, and content can be inspected and configured directly from the builder UI.
4. **Customizable Email from UI**: Enable full customization of email templates without code modifications:
   - Header banner branding and custom company name.
   - Section visibility toggling (Applicant Details, Online Profiles, Workstation Specs, Technical Statement, Compensation).
   - Custom introductory narrative and footer notes.
   - Primary accent color palette selection.
5. **Question-Level Notification Triggers**: In addition to global form submission triggers, support assigning notification actions directly to individual question items (e.g. alert a specific email or webhook when a candidate selects a specific answer).
6. **Multi-Screen Live Preview**: Live interactive preview dock capable of simulating Desktop (680px), Tablet (540px), and Mobile (360px) screen widths in real-time with sample candidate data.

---

## 3. Architectural Design & Type Contracts

### 3.1 Email Customization Model (`src/lib/types/form.ts`)

```typescript
export type EmailThemeType = 'emerald' | 'navy' | 'blue' | 'purple' | 'amber' | 'slate';

export interface EmailSectionVisibility {
  showApplicantDetails: boolean;
  showProfilesAndLinks: boolean;
  showQualifications: boolean;
  showTechnicalStatement: boolean;
  showCompensation: boolean;
}

export interface EmailCustomizationConfig {
  theme: EmailThemeType;
  primaryColor?: string;
  companyName?: string;
  headerBannerText?: string;
  footerNoteText?: string;
  sections: EmailSectionVisibility;
}
```

### 3.2 Theme Palette Definitions (`src/lib/templates/email-template.ts`)

| Theme ID | Display Name | Primary Color | Header Background | Border Accent |
| :--- | :--- | :--- | :--- | :--- |
| `emerald` | Emerald Eco-Luxury | `#16a34a` | `#0f392b` | `#dcfce7` |
| `navy` | Executive Deep Navy | `#0b1220` | `#0f172a` | `#e2e8f0` |
| `blue` | Modern Royal Blue | `#2563eb` | `#1e3a8a` | `#dbeafe` |
| `purple` | Letterly Vivid Purple | `#7c3aed` | `#3b0764` | `#f3e8ff` |
| `amber` | Warm Sunset Amber | `#ea580c` | `#431407` | `#ffedd5` |
| `slate` | Corporate Clean Slate | `#475569` | `#1e293b` | `#f1f5f9` |

---

## 4. UI Customization Capabilities

1. **Header & Branding**:
   - Company name text input.
   - Form title / assessment header display.
   - Dynamic accent color picker or 1-click theme presets.
2. **Modular Section Visibility Switches**:
   - Section 1: Applicant & Role Details (toggleable)
   - Section 2: Portfolio & Online Profiles (toggleable)
   - Section 3: Qualifications & Workstation Specs (toggleable)
   - Section 4: Technical Statement & Self Introduction (toggleable)
   - Section 5: Compensation & Availability (toggleable)
3. **Responsive Multi-Screen Preview Dock**:
   - Desktop view (680px): Standard wide email client layout.
   - Tablet view (540px): Medium email client layout with fluid tables.
   - Mobile view (360px): Stacked single-column mobile email layout.

---

## 5. Question-Level Notification Triggers

Each question card in `sortable-field-card.tsx` provides an action button in its settings toolbar to attach a targeted notification trigger:
- Event: When question is answered or matches a specific value.
- Destination: Custom notification email or phone number.
- Custom template text override.

---

## 6. Acceptance Criteria

1. User can navigate to the Email Template Studio from the FormBuilder toolbar or Tools menu.
2. User can switch between all 6 color themes, with instant visual update in the live preview dock.
3. User can toggle individual email sections on/off, and the preview immediately reflects the changes.
4. User can test multi-screen responsiveness by toggling Desktop (680px), Tablet (540px), and Mobile (360px) viewports.
5. Question cards support configuring question-specific notification triggers.
6. Zero PII is committed or leaked in any template file.
