# Issue 05: Universal Query Wrappers, App-Wide Theme Persistence, and Hierarchy Stability

## 1. Why it happened

Code across PHP, Python, and TypeScript previously lacked uniform query wrapper contracts with explicit boolean states (`isSuccess`, `isFail`). As a consequence, scattered `try/catch` and `try/except` blocks proliferated, silent failures occurred without centralized logging, and in some components, inverted negative checks (`!isSuccess`) violated repo-wide boolean coding standards. Concurrently, presentation themes were isolated in local React component state rather than persisted app-wide across both public landing pages and administrative interfaces, while project hierarchy state mutations caused UI instability when reordering pipeline steps or appending sections.

## 2. How it happened

1. **Scattered Database Operations:** In `app/Services/Database/splitdbmanager.php`, database migration commands executed via raw `$pdo->exec($sql)` without automated structured error logging or an explicit `QueryResult` envelope.
2. **Missing Wrapper Implementations:** While `02-spec/12-cicd-pipeline-workflows/03-reusable-ci-guards/13-query-wrapper-python-ts.md` specified `.github/scripts/query_wrapper.py`, the file was missing on disk, leading script authors to write ad-hoc exception handlers.
3. **Incomplete Boolean Contracts:** In `src/lib/query-wrapper.ts`, the `QueryResponseType<T>` interface exposed only `isFail` without explicitly defining `isSuccess: boolean`, forcing consumers to invert booleans.
4. **Local Theme Scope:** Theme state in `src/pages/Index.tsx` was unshared with `src/components/public/LandingPage.tsx` and lost on page reload.
5. **Direct State Mutation in Hierarchy Manager:** In `src/components/admin/project-hierarchy-manager.tsx`, adding sections mutated `selectedProject.sections.push()` directly, causing stale references.

## 3. Root Cause

1. `app/Services/Database/`: Absence of a standardized `QueryWrapper` class executing PDO callables with explicit boolean states (`isSuccess`, `isFail`) and error logging.
2. `.github/scripts/query_wrapper.py`: Missing Python query wrapper module specified in `13-query-wrapper-python-ts.md`.
3. `src/lib/query-wrapper.ts`: Omission of `isSuccess: boolean` on `QueryResponseType`.
4. `src/App.tsx`: Lack of a top-level `ThemeProvider` context persisting theme selection to `localStorage` and `document.documentElement`.
5. `src/components/admin/project-hierarchy-manager.tsx`: Direct array mutation and hardcoded single-theme colors.

## 4. Code Fix

1. **PHP Query Wrapper (`app/services/database/querywrapper.php`):**
   ```php
   class QueryWrapper {
       public static function execute(PDO $pdo, callable $callback, string $contextSql = ''): QueryResult {
           try {
               $data = $callback($pdo);
               return QueryResult::success($data, $contextSql);
           } catch (Throwable $e) {
               error_log("[QueryWrapper Error] SQL: {$contextSql} | Error: {$e->getMessage()}");
               return QueryResult::failure($e->getMessage(), $contextSql);
           }
       }
   }
   ```
2. **Python Query Wrapper (`.github/scripts/query_wrapper.py`):**
   ```python
   def query_wrapper(operation: Callable[..., Any], *args, **kwargs) -> Dict[str, Any]:
       try:
           data = operation(*args, **kwargs)
           return {"data": data, "error": None, "is_success": True, "is_fail": False}
       except Exception as exc:
           sys.stderr.write(f"[QueryWrapper Error]: {str(exc)}\n")
           return {"data": None, "error": exc, "is_success": False, "is_fail": True}
   ```
3. **TypeScript Query Wrapper (`src/lib/query-wrapper.ts`):**
   ```typescript
   export interface QueryResponseType<T> {
     isSuccess: boolean;
     isFail: boolean;
     status: StatusType;
     data: T | null;
     error: Error | null;
   }
   ```
4. **Global Theme Engine (`src/lib/theme-context.tsx`):**
   Created `ThemeProvider` and `ThemeSwitcher` managing 4 curated palettes with `localStorage` persistence and `Ubuntu Mono` monospace typography across code/JSON blocks.
