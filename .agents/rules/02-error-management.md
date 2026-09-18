# Error Management Agent Rules

> Authoritative error handling rules synthesized from `02-spec/03-error-manage/`.

1. **Never Swallow Errors**: Every catch block must log context (operation name and key parameters) and rethrow or return a structured error. Silent empty catch blocks are strictly prohibited.
2. **Universal Response Envelope**: All API endpoints must adhere to `{ Status: { IsSuccess, Code, Message }, Attributes: {}, Results: [] }`.
3. **Structured Errors**: Use `appfault.Wrap()` or `appfault.New()` in Go with registered error codes. In TypeScript, wrap causes into structured error objects.
4. **Guard Before Value Access**: When consuming Result monads, verify error state before accessing payload values.
5. **Global Error Boundary & Modal**: Frontend errors must route through the centralized error store and modal, not per-component alert boxes.
