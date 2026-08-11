# Error Handling and Enums

## Context
Following a user correction regarding scattered logging and typing practices.

## Decisions
1. **Query Wrapper**: Create a wrapper for queries in PHP/Python/TS that automatically logs failures to reduce scattered logging code.
2. **Magic Strings/Numbers**: Do not introduce any magic strings or magic numbers anywhere unless it is explicitly for the logger, and mention that in the typing.
3. **Enums Over Unions**: In TypeScript, rather than using strings as sub-items or comparing string union types (pipes) like `"pass" | "fail" | "fallback"`, you must use Enums. Enums are the best.
4. **Enum Naming**: Every single Enum must end with the suffix `Type` (e.g., `StatusType`).
5. **Explicit Boolean Checks**: Always use explicit boolean state checks like `response.isFail` or explicit checks rather than inverting success booleans like `!response.isSuccess`.
