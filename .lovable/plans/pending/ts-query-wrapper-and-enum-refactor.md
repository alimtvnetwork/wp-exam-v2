# TS Query Wrapper & Enum Refactor

## Goal
Audit the entire codebase to fix query logic and typing according to strict rules, and create a wrapper for queries in TS that automatically logs failures to reduce scattered logging code.

## Rules
1. Do not introduce any magic strings or magic numbers anywhere unless it is explicitly for the logger.
2. In TypeScript, rather than using strings as sub-items or comparing string union types like "pass" | "fail" | "fallback", use Enums.
3. Every single Enum must end with the suffix "Type".
4. Always use explicit boolean state checks like `response.isFail` or explicit checks rather than inverting success booleans like `!response.isSuccess`.

## Scope
- `src/**/*.ts`, `src/**/*.tsx`
