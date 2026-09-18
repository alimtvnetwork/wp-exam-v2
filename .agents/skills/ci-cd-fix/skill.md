---
name: ci-cd-fix
description: Diagnoses, isolates, and repairs CI/CD pipeline and linter failures without disabling checks.
---

# CI/CD Fix Skill

## Core Enforcements
1. Never disable CI/CD steps or linter rules.
2. Run targeted linters first for immediate feedback.
3. Run python 03-ai-scripts/06-cicd-local-runner.py for comprehensive gate verification.
4. Total ban on ctions/upload-artifact in GitHub Actions.
