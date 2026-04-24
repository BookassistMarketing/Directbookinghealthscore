// Client-side AI wrapper. All Gemini calls go through our server-side
// Next.js API routes so the API key is never bundled into the browser.
// Swapping to a different provider later = change the routes, not this file.

import type { Language, Answer } from '../types';

export interface AIQuestion {
  text: string;
  subtext: string;
  category: 'SEO & AI Search';
  weight: number;
}

async function parseError(res: Response): Promise<Error> {
  const fallback = `HTTP_${res.status}`;
  try {
    const body = await res.json();
    return new Error(body?.detail || body?.error || fallback);
  } catch {
    return new Error(fallback);
  }
}

export async function generateSiteQuestions(url: string, lang: Language): Promise<AIQuestion[]> {
  const res = await fetch('/api/analyse-site', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, language: lang }),
  });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as { questions: AIQuestion[] };
  return data.questions;
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
