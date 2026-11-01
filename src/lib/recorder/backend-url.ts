/**
 * Resolves the base URL of the bug-report backend.
 *
 * Priority:
 * 1. `VITE_BUG_REPORT_API_URL` build-time env var (trailing slashes stripped)
 * 2. `bugReportApiUrl` value in localStorage (trailing slashes stripped)
 * 3. Empty string — meaning no backend is configured and the recorder
 *    must persist sessions locally only.
 */
export function resolveBackendBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_BUG_REPORT_API_URL as string | undefined)?.trim();

  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }

  try {
    const fromStorage = localStorage.getItem("bugReportApiUrl")?.trim();

    if (fromStorage) {
      return fromStorage.replace(/\/+$/, "");
    }
  } catch {
    // localStorage unavailable (private mode, SSR) — fall through to no-backend
  }

  return "";
}
