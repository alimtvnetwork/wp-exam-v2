# Subtask 06: Verification & Test Suite

> **/goal** Verify all card action, dropdown, rating, and notification trigger functionalities with unit tests and ensure clean build.
> **/learn** Positive booleans only, zero explicit true checks, strict relative paths.

## Target Files
- `src/test/spec15-card-enhancements-and-email-triggers.test.ts`

## Tasks
1. Unit test suite covering:
   - Card action button ordering (Delete left, Duplicate center, Save right).
   - Store trash ledger addition, restoration, and undo behavior.
   - Dropdown display label vs value mapping and "Other" custom text.
   - Multi-mode rating (Numbers, Stars, Emojis) and threshold feedback / Google review CTA triggers.
   - Zero PII in sanitized email template.
2. Run `npm test` and `npm run build` to verify quality gates.
