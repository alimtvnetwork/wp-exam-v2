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

  const toAbsoluteUrl = (path: string): string => {
    const isFullUrl = path.startsWith('http://') || path.startsWith('https://');

    if (isFullUrl) {
      return path;
    }

    const hasWindow = (typeof window !== 'undefined');
    const hasOrigin = Boolean(hasWindow && window.location?.origin && window.location.origin !== 'null');
    const origin = hasOrigin ? window.location.origin : 'http://localhost';
    const startsWithSlash = path.startsWith('/');
    const prefix = startsWithSlash ? '' : '/';

    return `${origin}${prefix}${path}`;
  };

  const laravelUrl = toAbsoluteUrl(laravelPath);
  const wpUrl = toAbsoluteUrl(wpPath);

  try {
    const laravelRes = await fetch(laravelUrl, requestOptions);
    const isSuccess = laravelRes.ok;

    if (isSuccess) {
      return laravelRes;
    }
  } catch {
    // Continue to WordPress fallback
  }

  return fetch(wpUrl, requestOptions);
}
