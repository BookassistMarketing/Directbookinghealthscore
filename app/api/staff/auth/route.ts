import { NextRequest, NextResponse } from 'next/server';
import { isOriginAllowed } from '../../../../lib/api-security';
import {
  verifyStaffPassword,
  signStaffToken,
  checkStaffAuthRateLimit,
  randomAuthDelay,
} from '../../../../lib/staff-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  // x-forwarded-for is set by Amplify / most CDNs. Take the first hop.
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'FORBIDDEN_ORIGIN' }, { status: 403 });
  }

  const ip = getClientIp(req);
  const rate = checkStaffAuthRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'RATE_LIMITED', retryAfter: rate.retryAfterSeconds },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds ?? 60) } }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    await randomAuthDelay();
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
  }

  const role = verifyStaffPassword(body.password);
  if (!role) {
    await randomAuthDelay();
    return NextResponse.json({ error: 'INVALID_PASSWORD' }, { status: 401 });
  }

  const { token, expiresAt } = signStaffToken(role);
  return NextResponse.json({ token, expiresAt, role });
}
