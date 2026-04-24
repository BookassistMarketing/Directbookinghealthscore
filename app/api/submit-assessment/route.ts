import { NextRequest, NextResponse } from 'next/server';
import { generateStrategicAnalysis } from '../../../services/geminiService';
import type { Answer, Language } from '../../../types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_LANGUAGES: Language[] = ['en', 'it', 'es', 'pl'];

function isAnswer(v: unknown): v is Answer {
  if (!v || typeof v !== 'object') return false;
  const a = v as { questionId?: unknown; value?: unknown };
  return typeof a.questionId === 'number' && (a.value === 'YES' || a.value === 'NO');
}

export async function POST(req: NextRequest) {
  let body: { answers?: unknown; language?: unknown; siteUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const answers = body.answers;
  const language = body.language as Language;
  const siteUrl = typeof body.siteUrl === 'string' && body.siteUrl.length > 0 ? body.siteUrl : null;

  if (!Array.isArray(answers) || answers.length === 0 || !answers.every(isAnswer)) {
    return NextResponse.json({ error: 'INVALID_ANSWERS' }, { status: 400 });
  }

  if (!VALID_LANGUAGES.includes(language)) {
    return NextResponse.json({ error: 'INVALID_LANGUAGE' }, { status: 400 });
  }

  try {
    const analysis = await generateStrategicAnalysis(answers, language, siteUrl);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error('[api/submit-assessment] Gemini call failed:', err);
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR';
    const status = message === 'MISSING_API_KEY' ? 500 : 502;
    return NextResponse.json({ error: 'ANALYSIS_FAILED', detail: message }, { status });
  }
}
