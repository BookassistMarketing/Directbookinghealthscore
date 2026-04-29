import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { LOCALES } from './i18n';
import type { Language } from '../types';

// ---------------------------------------------------------------------------
// Origin allowlist
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS = [
  'https://directbookinghealthscore.com',
  'https://www.directbookinghealthscore.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

/**
 * Allow same-origin SSR (no Origin header) and the explicit allowlist.
 * Reject cross-site POSTs from anywhere else.
 */
export function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // direct API tools (curl), same-origin SSR
  return ALLOWED_ORIGINS.includes(origin);
}

// ---------------------------------------------------------------------------
// Language validation
// ---------------------------------------------------------------------------

export function isValidLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// URL validation (HTTP/S only, no private/internal IPs)
// ---------------------------------------------------------------------------

const MAX_URL_LENGTH = 2048;

export type UrlValidationFailure =
  | 'URL_TOO_LONG'
  | 'INVALID_URL'
  | 'INVALID_URL_SCHEME'
  | 'INVALID_URL_HOST';

export interface UrlCheckFailure {
  error: UrlValidationFailure;
}

/**
 * Returns the canonical URL string on success, or `{ error: code }` on failure.
 * Use `typeof result === 'string'` to discriminate.
 */
export function validatePublicUrl(raw: unknown): string | UrlCheckFailure {
  if (typeof raw !== 'string' || raw.length === 0) {
    return { error: 'INVALID_URL' };
  }
  if (raw.length > MAX_URL_LENGTH) {
    return { error: 'URL_TOO_LONG' };
  }
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { error: 'INVALID_URL' };
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { error: 'INVALID_URL_SCHEME' };
  }
  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^::1$/.test(host) ||
    /^fc[0-9a-f]{2}:/i.test(host) ||
    /^fe80:/i.test(host)
  ) {
    return { error: 'INVALID_URL_HOST' };
  }
  return parsed.toString();
}

// ---------------------------------------------------------------------------
// Cookie-based rate limiting (HMAC-signed)
// ---------------------------------------------------------------------------

const RATE_LIMIT_COOKIE = 'hhc_audit_throttle';
const RATE_LIMIT_WINDOW_SECONDS = 5 * 60; // 5 minutes between successful audits

function getRateLimitSecret(): string {
  // Falls back to a build-time string in dev so local testing works without
  // env setup; production MUST set AUDIT_RATE_LIMIT_SECRET to a long random
  // value (≥ 32 chars). Cookie is server-verified — even with a known dev
  // secret, the worst case is the throttle is bypassed locally.
  const secret = process.env.AUDIT_RATE_LIMIT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUDIT_RATE_LIMIT_SECRET is required in production');
    }
    return 'dev-only-rate-limit-secret-change-in-prod-XXXXXXXX';
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getRateLimitSecret()).update(payload).digest('hex');
}

function verifySignature(payload: string, signature: string): boolean {
  const expected = sign(payload);
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Returns null if the request is within the rate limit, or the number of
 * seconds the caller should wait before retrying.
 */
export function checkAuditRateLimit(req: NextRequest): number | null {
  const cookieValue = req.cookies.get(RATE_LIMIT_COOKIE)?.value;
  if (!cookieValue) return null;
  const [tsStr, sig] = cookieValue.split('.');
  if (!tsStr || !sig) return null;
  if (!verifySignature(tsStr, sig)) return null;
  const ts = parseInt(tsStr, 10);
  if (!Number.isFinite(ts)) return null;
  const elapsed = Math.floor(Date.now() / 1000) - ts;
  if (elapsed >= RATE_LIMIT_WINDOW_SECONDS) return null;
  return RATE_LIMIT_WINDOW_SECONDS - elapsed;
}

/**
 * Add the throttle cookie to a response after a successful audit call.
 * Cookie is HttpOnly + Secure + SameSite=Strict to make it harder to forge.
 */
export function attachRateLimitCookie(res: NextResponse): NextResponse {
  const ts = Math.floor(Date.now() / 1000).toString();
  const value = `${ts}.${sign(ts)}`;
  res.cookies.set(RATE_LIMIT_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: RATE_LIMIT_WINDOW_SECONDS,
  });
  return res;
}

// ---------------------------------------------------------------------------
// Error sanitisation
// ---------------------------------------------------------------------------

export type PublicErrorCode =
  | 'INVALID_JSON'
  | 'INVALID_URL'
  | 'INVALID_URL_SCHEME'
  | 'INVALID_URL_HOST'
  | 'URL_TOO_LONG'
  | 'INVALID_LANGUAGE'
  | 'INVALID_ANSWERS'
  | 'INVALID_SITE_URL'
  | 'SITE_URL_TOO_LONG'
  | 'FORBIDDEN_ORIGIN'
  | 'METHOD_NOT_ALLOWED'
  | 'RATE_LIMITED'
  | 'SERVICE_UNAVAILABLE'
  | 'UPSTREAM_ERROR'
  | 'CONTENT_BLOCKED'
  | 'INVALID_RESPONSE';

/**
 * Map a raw exception from the Gemini SDK to a safe public error code +
 * appropriate HTTP status. Logs the real error server-side; never echoes
 * SDK internals to the client.
 */
export function sanitiseGeminiError(err: unknown, route: string): {
  code: PublicErrorCode;
  status: number;
} {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`[${route}] Gemini call failed:`, message, err);

  if (message === 'MISSING_API_KEY') {
    return { code: 'SERVICE_UNAVAILABLE', status: 503 };
  }
  if (/\b429\b/.test(message) || /quota/i.test(message) || /RESOURCE_EXHAUSTED/i.test(message)) {
    return { code: 'RATE_LIMITED', status: 429 };
  }
  if (/SAFETY/i.test(message) || /blocked/i.test(message)) {
    return { code: 'CONTENT_BLOCKED', status: 422 };
  }
  if (message === 'EMPTY_RESPONSE') {
    return { code: 'INVALID_RESPONSE', status: 502 };
  }
  return { code: 'UPSTREAM_ERROR', status: 502 };
}

// ---------------------------------------------------------------------------
// AI Readiness Report — output shape validation
// ---------------------------------------------------------------------------

/**
 * Confirm the Gemini response actually looks like a Bookassist AI Readiness
 * Report and not (a) a refusal, (b) a hallucination, (c) prompt-injected
 * non-audit content. Server-side defence: even if a malicious URL hijacks
 * the prompt, the client still sees a generic error rather than the
 * attacker's payload.
 */
export function looksLikeAiReadinessReport(text: string): boolean {
  if (!text || text.length < 200) return false;
  // Marker 1: the report's signature heading line
  const hasSummaryHeading = /ai\s+visibility\s*&?\s*optim[iz]ation\s+summary/i.test(text);
  // Marker 2: the explicit overall score line ("overall score: X / 100" — translated)
  const hasOverallScore = /(overall|punteggio|puntuación|wynik|note|gesamt|celkové).{0,40}\/\s*100/i.test(text);
  // Marker 3: at least one markdown table separator (| --- |)
  const hasMarkdownTable = /\|\s*-{2,}\s*\|/.test(text);
  // At least 2 of the 3 markers must be present
  const hits = [hasSummaryHeading, hasOverallScore, hasMarkdownTable].filter(Boolean).length;
  return hits >= 2;
}
