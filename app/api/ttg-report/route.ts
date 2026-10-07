import { NextRequest } from 'next/server';
import { handleEventReport } from '../event-report/handler';

// Old URL of /api/event-report, kept for a tablet still running the pre white
// label page (it sends no event). Delete after TTG 2026 (16 Oct).

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function POST(req: NextRequest) {
  return handleEventReport(req, 'ttg-2026');
}
