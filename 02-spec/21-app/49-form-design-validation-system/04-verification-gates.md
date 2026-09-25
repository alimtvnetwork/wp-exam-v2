# Specification: Verification Gates & Invariants for Design Validation

Spec Reference: [01-overview.md](01-overview.md)

## 1. Quality Gates

1. **Deterministic Scoring:** Given an identical set of FormField items and FormSettings, `auditFormDesign()` must always return the exact same score and issue set.
2. **Auto-Fix Idempotency:** Executing `applyAutoFix()` on an issue must resolve that specific issue without corrupting other field attributes.
3. **No Unhandled Errors on Malformed Inputs:** Validation engine must handle empty fields, undefined options, null values, or circular DAG references without throwing runtime exceptions.
4. **TypeScript & Lint Conformance:** Zero TypeScript compile errors (`npx tsc --noEmit`) and zero ESLint errors (`npm run lint`).
