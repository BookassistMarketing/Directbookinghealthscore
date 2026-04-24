import { NextRequest, NextResponse } from 'next/server';
import { generateSiteQuestions } from '../../../services/geminiService';
import type { Language } from '../../../types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_LANGUAGES: Language[] = ['en', 'it', 'es', 'pl'];

export async function POST(req: NextRequest) {
  let body: { url?: unknown; language?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const url = typeof body.url === 'string' ? body.url.trim() : '';
  const language = body.language as Language;

  if (!url) {
    return NextResponse.json({ error: 'MISSING_URL' }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'INVALID_URL' }, { status: 400 });
  }

  if (!VALID_LANGUAGES.includes(language)) {
    return NextResponse.json({ error: 'INVALID_LANGUAGE' }, { status: 400 });
  }

  try {
    const questions = await generateSiteQuestions(url, language);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[api/analyse-site] Gemini call failed:', err);
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    const status = message === 'MISSING_API_KEY' ? 500 : 502;
    return NextResponse.json({ error: 'ANALYSIS_FAILED', detail: message }, { status });
  }
}
