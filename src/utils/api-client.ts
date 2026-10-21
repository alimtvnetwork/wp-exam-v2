/**
 * Unified API Client with Dual-Backend Support (Laravel REST & WordPress REST).
 *
 * Automatically tries Laravel REST endpoint (/api/v1/...) first, and seamlessly
 * falls back to WordPress plugin endpoint (/wp-json/wp-exam/v1/...) or offline fallback.
 * Automatically injects active authorization tokens.
 */

const STORAGE_TOKEN_KEY = 'wpexam_auth_token';

export async function unifiedFetch(
  laravelPath: string,
  wpPath: string,
  init?: RequestInit
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_TOKEN_KEY) : null;
  const hasToken = Boolean(token);

  const authHeaders: Record<string, string> = {};

  if (hasToken) {
    authHeaders.Authorization = `Bearer ${token}`;
    authHeaders['X-WPExam-Auth-Token'] = token!;
  }

  const mergedHeaders = {
    ...authHeaders,
    ...((init?.headers as Record<string, string>) || {}),
  };

  const requestOptions: RequestInit = {
    ...init,
    headers: mergedHeaders,
  };

  try {
    const laravelRes = await fetch(laravelPath, requestOptions);
    const isSuccess = laravelRes.ok;

    if (isSuccess) {
      return laravelRes;
    }
  } catch {
    // Continue to WordPress fallback
  }

  return fetch(wpPath, requestOptions);
}
