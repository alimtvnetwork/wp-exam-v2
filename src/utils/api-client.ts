/**
 * Unified API Client with Dual-Backend Support (Laravel REST & WordPress REST).
 *
 * Automatically tries Laravel REST endpoint (/api/v1/...) first, and seamlessly
 * falls back to WordPress plugin endpoint (/wp-json/wp-exam/v1/...) or offline fallback.
 */

export async function unifiedFetch(
  laravelPath: string,
  wpPath: string,
  init?: RequestInit
): Promise<Response> {
  try {
    const laravelRes = await fetch(laravelPath, init);
    const isSuccess = laravelRes.ok;

    if (isSuccess) {
      return laravelRes;
    }
  } catch {
    // Continue to fallback
  }

  return fetch(wpPath, init);
}
