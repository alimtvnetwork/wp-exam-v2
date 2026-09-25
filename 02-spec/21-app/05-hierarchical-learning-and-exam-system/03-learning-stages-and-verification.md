# Learning Stages & Verification Specification

## 1. 4-Stage Learning State Machine

In accordance with the Purple focus learning design, the candidate experience is structured into an isolated, sequential 4-stage pipeline:

```
[Stage 0: Intro Hero] ──> [Stage 1: Study Docs & Video] ──> [Stage 2: Practical Checklist] ──> [Stage 3: Focus Quiz] ──> [Stage 4: Anti-Cheat Score Screen]
```

---

## 2. Stage Details & Requirements

### 2.1 Stage 1: Reading Documentation & Embedded Video
- **Multi-page Documentation Viewer**: Candidates navigate through multi-page reading material (e.g. 10-page IT Security Policy or Engineering Guidelines) with page forward/back pagination and progress dots.
- **Embedded Video Lectures**: Supports embedded training videos via responsive iframe (YouTube, Vimeo, or internal storage).
- **Click Telemetry**: Logs all candidate interaction clicks to ensure active study engagement prior to quiz entry.

### 2.2 Stage 2: Practical Verification Checklist
- **Mandatory Verification Gates**: Renders checklist items ("Have you configured 2FA?", "Have you watched the technical walkthrough?", "Have you verified SQLite migrations?").
- **Gating Logic**: Progression to the quiz is strictly disabled until all items marked `isMandatory: true` are checked by the candidate.

### 2.3 Stage 3: Interactive Single-Item Focus Quiz
- **Single Question Focus**: Only one question is visible at any given moment to maximize attention and reduce cognitive overload.
- **Visual Typography**: Bold keyword highlighting (`**What** is the primary rule?`) with subtitle guidance.
- **Options Layouts**: Large interactive pill cards with emoji icons, available in 1-column or 2-column grid arrangements.
- **Question Shuffle**: Optional randomization toggle to prevent rote positioning memorization.
- **Hints & Bug Reporting**: Contextual hint drawers and flag reporting modal.

### 2.4 Stage 4: Anti-Cheat Grading & Email Dispatch
- **Anti-Cheat Result Display**:
  - Hides correct answers on failure.
  - Exposes which questions were answered incorrectly (e.g. "You have answered incorrectly on: Question 2, Question 4").
  - Prompts candidate to review study documentation and retake the assessment.
- **Email Dispatch Notification**:
  - Confirms automatic dispatch of the completion report according to the configured cadence (`per_section`, `end_of_day`, `end_of_week`).
  - Routes notifications along the recipient chain (Candidate, Project Owner, Administrator roles).
