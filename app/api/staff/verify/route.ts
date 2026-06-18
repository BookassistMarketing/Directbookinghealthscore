import { NextRequest, NextResponse } from 'next/server';
import { isOriginAllowed } from '../../../../lib/api-security';
import { verifyStaffToken } from '../../../../lib/staff-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'FORBIDDEN_ORIGIN' }, { status: 403 });
  }

  let body: { token?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_REQUEST' }, { status: 400 });
  }

  const verified = verifyStaffToken(body.token);
  if (!verified) {
    return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 401 });
  }

  return NextResponse.json({ valid: true, role: verified.role });
}
