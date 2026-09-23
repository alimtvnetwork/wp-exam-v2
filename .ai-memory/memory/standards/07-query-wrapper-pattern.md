# Database Query Wrapper Pattern & Explicit Boolean States

> **Standard Version:** 1.0.0  
> **Status:** MANDATORY  
> **Scope:** Polyglot Database Access (PHP, Python, TypeScript)  
> **Traceability:** Rule AC-AI-001 / Zero Code Duplication

---

## 1. Architectural Purpose

Direct, raw database invocations (`$wpdb->query()`, `$pdo->exec()`, `sqlite3.Cursor.execute()`) scatter exception handling, lead to silent swallowed errors, and cause code duplication.

All database query execution across the repository must route through universal query wrappers that:
1. Automatically catch runtime exceptions and database errors.
2. Dispatch structured diagnostic logs (SQL context, message, stack trace) to persistent loggers.
3. Return a standardized `QueryResult` envelope with explicit positive boolean states: `isSuccess` and `isFail` (never invert `!isSuccess`).

---

## 2. Polyglot Contracts

### PHP Contract (`WpExam\Database\SqlQueryWrapper` & `WpDbQueryWrapper`)
```php
use WpExam\Database\SqlQueryWrapper;
use WpExam\Database\WpDbQueryWrapper;

// PDO / SQLite
$result = SqlQueryWrapper::execute($pdo, function (PDO $db) {
    return $db->query("SELECT * FROM wp_forms")->fetchAll();
}, "SELECT * FROM wp_forms");

if ($result->is_success) {
    processData($result->data);
} else {
    handleFailure($result->error_message);
}

// WordPress global $wpdb
$res = WpDbQueryWrapper::executeResult($wpdb, function ($db) {
    return $db->get_results("SELECT id, name FROM wp_forms");
}, "SELECT id, name FROM wp_forms");
```

### Python Contract (`scripts/db_query_wrapper.py`)
```python
from scripts.db_query_wrapper import execute_query

result = execute_query(conn, "SELECT * FROM forms WHERE id = ?", (form_id,))
if result.is_success:
    items = result.data
elif result.is_fail:
    report_error(result.error_message)
```

### TypeScript Contract (`src/utils/query-wrapper.ts`)
```typescript
import { executeQuery } from "@/utils/query-wrapper";

const result = await executeQuery(async () => {
    return await db.forms.toArray();
}, "select forms");

if (result.isSuccess) {
    renderForms(result.data);
}
```

---

## 3. Strict Rules

1. **Explicit Boolean Invariants:** Always evaluate `$result->is_success` or `result.isSuccess`. Inverted conditions like `!$result->is_success` are strictly banned; use `$result->is_fail` or `result.isFail`.
2. **Context SQL Logging:** Pass contextual SQL or operation descriptors into the wrapper so failure logs include the exact failing statement.
3. **No Swallowed Exceptions:** Wrappers must capture and log the full exception trace before returning the failure container.
