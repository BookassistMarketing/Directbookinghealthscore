import { NextRequest, NextResponse } from 'next/server';
import { generateAiReadinessReport } from '../../../services/geminiService';
import {
  isOriginAllowed,
  isValidLanguage,
  validatePublicUrl,
  checkAuditRateLimit,
  attachRateLimitCookie,
  sanitiseGeminiError,
  looksLikeAiReadinessReport,
} from '../../../lib/api-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'FORBIDDEN_ORIGIN', requestId }, { status: 403 });
  }

  const retryAfter = checkAuditRateLimit(req);
  if (retryAfter !== null) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', retryAfter, requestId },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter) },
      }
    );
  }

  let body: { url?: unknown; language?: unknown; honeypot?: unknown; formAgeMs?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', requestId }, { status: 400 });
  }

  // Bot defence: honeypot must be empty, form must have been visible for ≥1.5s.
  // Real users never see the honeypot field; bots fill all fields. Real users
  // need at least a moment to type/paste a URL; bots submit instantly.
  // Return a generic 400 to avoid telling attackers which signal tripped.
  const honeypot = typeof body.honeypot === 'string' ? body.honeypot : '';
  const formAgeMs = typeof body.formAgeMs === 'number' ? body.formAgeMs : 0;
  if (honeypot.length > 0 || formAgeMs < 1500) {
    console.warn('[api/ai-audit] Bot defence triggered', { requestId, honeypotFilled: honeypot.length > 0, formAgeMs });
    return NextResponse.json({ error: 'INVALID_REQUEST', requestId }, { status: 400 });
  }

  const urlCheck = validatePublicUrl(body.url);
  if (typeof urlCheck !== 'string') {
    return NextResponse.json({ error: urlCheck.error, requestId }, { status: 400 });
  }

  if (!isValidLanguage(body.language)) {
    return NextResponse.json({ error: 'INVALID_LANGUAGE', requestId }, { status: 400 });
  }

  try {
    const report = await generateAiReadinessReport(urlCheck, body.language);

    // Output shape validation — defends against prompt injection and
    // hallucinated/refused responses. If the response doesn't look like
    // the expected report, treat as upstream failure.
    if (!looksLikeAiReadinessReport(report)) {
      console.error('[api/ai-audit] Response failed shape validation', {
        requestId,
        url: urlCheck,
        responseLength: report.length,
        responseStart: report.slice(0, 200),
      });
      return NextResponse.json({ error: 'INVALID_RESPONSE', requestId }, { status: 502 });
    }

    return attachRateLimitCookie(NextResponse.json({ report, requestId }));
  } catch (err) {
    const { code, status } = sanitiseGeminiError(err, `api/ai-audit [${requestId}]`);
    return NextResponse.json({ error: code, requestId }, { status });
  }
}
