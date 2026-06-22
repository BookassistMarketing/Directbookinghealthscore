// Client-side AI wrapper. All Gemini calls go through our server-side
// Next.js API routes so the API key is never bundled into the browser.
// Swapping to a different provider later = change the routes, not this file.

import type { Language, Answer } from '../types';
import { STAFF_TOKEN_KEY } from '../lib/staffBypass';

function readStaffToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const token = window.localStorage.getItem(STAFF_TOKEN_KEY);
  return token || undefined;
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  requestId?: string;
}

async function parseError(res: Response): Promise<ApiError> {
  const fallback = `HTTP_${res.status}`;
  try {
    const body = await res.json();
    const err = new Error(body?.detail || body?.error || fallback) as ApiError;
    err.status = res.status;
    err.code = typeof body?.error === 'string' ? body.error : undefined;
    err.requestId = typeof body?.requestId === 'string' ? body.requestId : undefined;
    return err;
  } catch {
    const err = new Error(fallback) as ApiError;
    err.status = res.status;
    return err;
  }
}

export async function generateStrategicAnalysis(
  answers: Answer[],
  lang: Language,
  siteUrl: string | null = null
): Promise<string> {
  const res = await fetch('/api/submit-assessment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, language: lang, siteUrl }),
  });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as { analysis: string };
  return data.analysis;
}

export interface BotCheckSignals {
  honeypot: string;
  formAgeMs: number;
}

export async function generateAiReadinessReport(
  url: string,
  lang: Language,
  bot: BotCheckSignals,
): Promise<string> {
  const res = await fetch('/api/ai-audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      language: lang,
      honeypot: bot.honeypot,
      formAgeMs: bot.formAgeMs,
      staffToken: readStaffToken(),
    }),
  });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as { report: string };
  return data.report;
}
