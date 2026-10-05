# Strictly Avoid Rules

> Universal Hard Prohibitions (CODE RED) from `.ai-memory/strictly-avoid.md`.

1. **NEVER Disable CI/CD**: Never comment out, bypass, or delete CI/CD steps or linter checks.
2. **NEVER Use Absolute Paths**: No `file:///` or drive letters (`C:\...`) in repo files or test strings. Use repo-relative paths only.
3. **NEVER Allow Uppercase Root Readme**: Root readme must strictly be lowercase `readme.md`.
4. **NEVER Build readme.txt Timestamp Generator**: Total ban on any timestamp/date/time generator for `readme.txt`.
5. **NEVER Implement Spec 19 Main Worker Service**: Spec 19 in this repo is spec-only.
6. **NEVER Upload CI Artifacts**: Total ban on `actions/upload-artifact` in GitHub Actions. Output diagnostics directly to `$GITHUB_STEP_SUMMARY`.
7. **NEVER Commit Test Reports / Binaries**: Exclude all test outputs, binaries, coverage reports, and caches via `.gitignore`.
8. **NEVER Commit Isolated 1-2 Plan/Doc Files**: Always commit all modified files together as a single atomic unit and `git push` immediately.
9. **NEVER Render "Candidate Response" Subheadings**: Total ban on `Candidate Response` label or subheadings in runner and presentation views.
10. **NEVER Use Gold as Dominant Text/Highlight in Riseup Theme**: Gold (`#E8C547`) is strictly an active indicator mark, never a dominant surface, body text, or question title highlight (brand cream `#F7F1E6` must be used for acronyms and emphasis).
