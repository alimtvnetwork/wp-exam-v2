# Coding Guidelines Agent Rules

> Authoritative rules for all AI agents generated from `.ai-memory/coding-guidelines.md` and `02-spec/02-coding-guidelines/`.

## 1. Strict Boolean Standard
- Boolean variables, properties, and functions MUST use `is` or `has` prefixes exclusively (`isActive`, `hasAccess`).
- Prefixes like `can`, `should`, `was`, `will`, `did` are strictly FORBIDDEN.
- Invert negative names to positive forms (`isReady` instead of `isNotReady`).
- TOTAL BAN on explicit boolean equality checks: `if isReady == true` or `if (isValid === true)` are forbidden. Use implicit evaluation: `if isReady`.
- TOTAL BAN on mixed polarity in a single conditional join: `if isA && !isB` is forbidden.

## 2. Function & File Size Limits
- Functions: 8 lines preferred, 15 lines hard maximum cap (excluding comments and blank lines).
- React component files: 100 lines maximum cap.
- Classes/structs: 120 lines maximum cap.
- Any source file: 300 lines maximum cap.

## 3. Zero Nested If
- Flatten all conditional nesting using guard clauses, early returns, or extracted functions.
- Depth > 1 is an automatic rejection.

## 4. Parameter Structs
- Functions with > 3 parameters or signature > 100 characters must place each parameter on its own line.
- Functions with > 4 parameters or 2+ adjacent same-typed parameters must use a dedicated `*Params` struct or options object.

## 5. Vertical Line Gaps & Whitespace
- Exactly one blank line before every `return` or `throw` (unless sole statement in block).
- Exactly one blank line after closing `}` (unless followed by `}`, `else`, `case`, `catch`).
- Never two blank lines in a row anywhere.
- No blank lines immediately after `{` or before `}`.

## 6. Enums Over Unions
- String unions (e.g. `'pass' | 'fail'`) are strictly BANNED in TypeScript.
- Use TypeScript `enum` declarations with the `Type` suffix (e.g., `QuestionType`, `StatusType`).
- No magic strings or numbers anywhere.

## 7. Go Specific Rules
- No bare void: functions must return `Result[T]` or `*appfault.AppError`.
- Go interfaces must use the idiomatic `-er` suffix (e.g. `Writer`, `Streamer`, `Executor`). Suffixing with `Interface` is BANNED.
- Use `Id` (not `ID`) in identifiers and fields.
