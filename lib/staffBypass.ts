// Client-side helpers for the hidden /staff bypass. The token itself is opaque
// to the browser — the server signed it, the server verifies it. The browser
// only stores it and sends it back.

export const STAFF_TOKEN_KEY = 'bookassist_staff_token';
export const STAFF_TOKEN_EXPIRES_KEY = 'bookassist_staff_token_expires_at';

// Cookie flag read by middleware.ts to skip the locale redirect for signed-in
// staff. The cookie is non-authoritative — actual bypass on audit pages still
// requires a valid server-verified token. The cookie's only job is to keep
// staff on English pages regardless of their locale preference.
const STAFF_COOKIE_NAME = 'hhc_staff';

/**
 * Returns true if a valid (server-verified) staff token is present in
 * localStorage. Safe to call during SSR — returns false on the server.
 *
 * Each call hits /api/staff/verify. Callers should cache the result in
 * component state for the lifetime of the component to avoid extra round
 * trips.
 */
export async function checkStaffBypass(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(STAFF_TOKEN_KEY);
  if (!token) return false;

  try {
    const res = await fetch('/api/staff/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (res.ok) return true;
    // Token rejected — purge it so subsequent calls don't loop.
    if (res.status === 401) clearStaffToken();
    return false;
  } catch {
    return false;
  }
}

export function clearStaffToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STAFF_TOKEN_KEY);
  localStorage.removeItem(STAFF_TOKEN_EXPIRES_KEY);
  // Clear the cookie so the locale middleware resumes redirecting normally.
  document.cookie = `${STAFF_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}

export function storeStaffToken(token: string, expiresAt: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STAFF_TOKEN_KEY, token);
  localStorage.setItem(STAFF_TOKEN_EXPIRES_KEY, String(expiresAt));
  // Set a cookie the middleware can read. 30-day lifetime to match the token.
  const maxAge = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
  document.cookie = `${STAFF_COOKIE_NAME}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

export function getStoredExpiresAt(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STAFF_TOKEN_EXPIRES_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
