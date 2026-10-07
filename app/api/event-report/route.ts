import { NextRequest } from 'next/server';
import { handleEventReport } from './handler';

// Saves an event stand audit on the HubSpot contact. See ./handler.ts.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(req: NextRequest) {
  return handleEventReport(req);
}
