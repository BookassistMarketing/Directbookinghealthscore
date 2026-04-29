import { NextRequest, NextResponse } from 'next/server';
import { generateStrategicAnalysis } from '../../../services/geminiService';
import {
  isOriginAllowed,
  isValidLanguage,
  validatePublicUrl,
  sanitiseGeminiError,
} from '../../../lib/api-security';
import type { Answer } from '../../../types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_ANSWERS = 50;

function isAnswer(v: unknown): v is Answer {
  if (!v || typeof v !== 'object') return false;
  const a = v as { questionId?: unknown; value?: unknown };
  return typeof a.questionId === 'number' && (a.value === 'YES' || a.value === 'NO');
}

export async function POST(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'FORBIDDEN_ORIGIN' }, { status: 403 });
  }

  let body: { answers?: unknown; language?: unknown; siteUrl?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 });
  }

  const answers = body.answers;
  if (!Array.isArray(answers) || answers.length === 0 || answers.length > MAX_ANSWERS || !answers.every(isAnswer)) {
    return NextResponse.json({ error: 'INVALID_ANSWERS' }, { status: 400 });
  }

  if (!isValidLanguage(body.language)) {
    return NextResponse.json({ error: 'INVALID_LANGUAGE' }, { status: 400 });
  }

  let siteUrl: string | null = null;
  if (typeof body.siteUrl === 'string' && body.siteUrl.length > 0) {
    const urlCheck = validatePublicUrl(body.siteUrl);
    if (typeof urlCheck !== 'string') {
      return NextResponse.json({ error: urlCheck.error }, { status: 400 });
    }
    siteUrl = urlCheck;
  }

  try {
    const analysis = await generateStrategicAnalysis(answers, body.language, siteUrl);
    return NextResponse.json({ analysis });
  } catch (err) {
    const { code, status } = sanitiseGeminiError(err, 'api/submit-assessment');
    return NextResponse.json({ error: code }, { status });
  }
}
