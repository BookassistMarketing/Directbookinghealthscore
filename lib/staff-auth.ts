import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

// ---------------------------------------------------------------------------
// Token model
// ---------------------------------------------------------------------------
// Token = base64url(JSON.stringify({iat, exp})) + '.' + base64url(HMAC-SHA256(payload, STAFF_TOKEN_SECRET))
// Lifetime: 30 days. No user identity inside — just signed proof the password
// was entered correctly at time `iat`.

const TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60; // 30 days

interface TokenPayload {
  iat: number; // unix seconds
  exp: number; // unix seconds
}

function base64urlEncode(input: string): string {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function getTokenSecret(): string {
  const secret = process.env.STAFF_TOKEN_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('STAFF_TOKEN_SECRET is required (≥ 32 chars) in production');
    }
    // Dev fallback so local testing works even if .env.local isn't set up yet.
    // Production deploys MUST set the real value in Amplify env vars.
    return 'dev-only-staff-token-secret-change-in-prod-XXXXXXXX';
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getTokenSecret()).update(payload).digest('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Build a freshly signed staff token. Caller is expected to have already
 * verified the password.
 */
export function signStaffToken(): { token: string; expiresAt: number } {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = { iat: now, exp: now + TOKEN_LIFETIME_SECONDS };
  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const signature = sign(payloadB64);
  return { token: `${payloadB64}.${signature}`, expiresAt: payload.exp * 1000 };
}

/**
 * Returns true only if the token's signature matches and `exp` is in the
 * future. Any malformation, signature mismatch, or expiry returns false.
 */
export function verifyStaffToken(token: unknown): boolean {
  if (typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;

  const expected = sign(payloadB64);
  if (expected.length !== signature.length) return false;
  try {
    const ok = timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(signature, 'utf8'));
    if (!ok) return false;
  } catch {
    return false;
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64));
  } catch {
    return false;
  }
  if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') return false;
  if (payload.exp <= Math.floor(Date.now() / 1000)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Password verification
// ---------------------------------------------------------------------------

/**
 * Constant-time comparison of the user-supplied password against
 * STAFF_PASSWORD. Both buffers are zero-padded to the longer length so we
 * never reveal whether the input was the right length.
 */
export function verifyStaffPassword(input: unknown): boolean {
  if (typeof input !== 'string') return false;
  const expected = process.env.STAFF_PASSWORD;
  if (!expected || expected.length === 0) {
    // Misconfigured server. Refuse all logins rather than silently allowing.
    console.error('[staff-auth] STAFF_PASSWORD is not set');
    return false;
  }
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  const len = Math.max(a.length, b.length);
  const padA = Buffer.alloc(len);
  const padB = Buffer.alloc(len);
  a.copy(padA);
  b.copy(padB);
  const equal = timingSafeEqual(padA, padB);
  return equal && a.length === b.length;
}

// ---------------------------------------------------------------------------
// In-memory rate limiting (per-IP)
// ---------------------------------------------------------------------------
// Resets on Amplify cold start, which is fine for low-stakes shared-password.
// 10 attempts per IP per 15 minutes.

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 10;

interface AttemptRecord {
  count: number;
  firstAttemptAt: number;
}

const attemptsByIp = new Map<string, AttemptRecord>();

export function checkStaffAuthRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = attemptsByIp.get(ip);

  if (!record || now - record.firstAttemptAt > RATE_LIMIT_WINDOW_MS) {
    attemptsByIp.set(ip, { count: 1, firstAttemptAt: now });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstAttemptAt)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * Sleep for a random 200–500ms. Used on failed auth attempts to slow brute
 * force and partially mask timing differences between "wrong password" and
 * "server error" responses.
 */
export function randomAuthDelay(): Promise<void> {
  const ms = 200 + Math.floor(Math.random() * 300);
  return new Promise(resolve => setTimeout(resolve, ms));
}
