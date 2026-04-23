# AI-Powered URL Quiz Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mandatory URL input step that uses Gemini (via `url_context`) to generate 3 SEO/AI-search yes/no questions which run before the existing 15 static questions.

**Architecture:** Bottom-up changes: type/constant updates first, then a provider-neutral AI wrapper (`aiService.ts`) that today delegates to `geminiService.ts`, then new UI components (`UrlInputStep`, `AnalysingSite`), then `AuditTool.tsx` orchestration, then downstream `Quiz`/`Results` updates so they accept a dynamic question list. Graceful failure: 2 retries return to URL input, 3rd failure falls through to static-only quiz with a toast. Final Gemini analysis prompt gains the URL.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, `@google/genai` SDK (Gemini `gemini-2.0-flash`), Lucide icons, AWS Amplify hosting.

**Spec:** `docs/superpowers/specs/2026-04-23-ai-url-quiz-design.md`

**Testing note:** This repo has no test framework — `npm run lint` (`tsc --noEmit`) is the only automated check. Each task ends with a lint run plus a commit. The "functional correctness" gate before localhost is Task 13 — a sub-agent code review. TDD steps are adapted to this reality (type-check after each task; visual/manual verification at the end).

---

## File Structure

**New files:**
- `services/aiService.ts` — provider-neutral wrapper around the AI service; today delegates to `geminiService.ts`, tomorrow can delegate to a Claude equivalent.
- `components/UrlInputStep.tsx` — URL input screen with helper copy, validation, retry banner, fallback link.
- `components/AnalysingSite.tsx` — loading screen with rotating copy while Gemini analyses the URL.

**Modified files:**
- `types.ts` — add `URL_INPUT` / `ANALYSING_SITE` app states, `DynamicQuestion` type, extended category union.
- `constants.ts` — rename `MAX_SCORE` → `STATIC_MAX_SCORE`, add `'SEO & AI Search'` to `CATEGORY_TRANSLATIONS`.
- `services/geminiService.ts` — add `generateSiteQuestions(url, lang)` using `url_context` tool; `generateStrategicAnalysis` accepts optional `siteUrl` arg.
- `components/AuditTool.tsx` — owns `siteUrl`, `aiQuestions`, `failureCount`; orchestrates the new states; composes `[...aiQuestions, ...STATIC_QUESTIONS]` into the quiz.
- `components/Quiz.tsx` — accepts `questions: DynamicQuestion[]` prop instead of importing `QUESTIONS`.
- `components/Results.tsx` — accepts `questions` prop; computes `maxScore` dynamically.
- `components/FullResults.tsx` — accepts `siteUrl`; passes through to `aiService.generateStrategicAnalysis`.

---

## Task 1: Update type definitions

**Files:**
- Modify: `types.ts`

- [ ] **Step 1: Add new app states + dynamic question type**

Open `types.ts`. Replace its entire content with:

```ts
export type Language = 'en' | 'it' | 'es' | 'pl';

export type QuestionCategory =
  | 'Direct Booking'
  | 'Metasearch'
  | 'Analytics'
  | 'CRM'
  | 'SEO & AI Search';

export interface QuestionContent {
  text: string;
  subtext: string;
}

export interface Question {
  id: number;
  translations: Record<Language, QuestionContent>;
  category: QuestionCategory;
  weight: number;
}

export interface DynamicQuestion extends Question {
  source: 'static' | 'ai';
}

export enum AnswerValue {
  YES = 'YES',
  NO = 'NO'
}

export interface Answer {
  questionId: number;
  value: AnswerValue;
}

export interface AnalysisResult {
  score: number;
  rating: string;
  summary: string;
  recommendations: string[];
}

export enum AppState {
  WELCOME = 'WELCOME',
  URL_INPUT = 'URL_INPUT',
  ANALYSING_SITE = 'ANALYSING_SITE',
  QUIZ = 'QUIZ',
  SCORE = 'SCORE',
  FULL_RESULTS = 'FULL_RESULTS'
}
```

- [ ] **Step 2: Type-check**

Run: `cd ~/Documents/GitHub/Directbookinghealthscore && npm run lint 2>&1`
Expected: passes cleanly. (Note: the `category` field on existing `QUESTIONS` in `constants.ts` is already one of the four original values; union widening is safe.)

- [ ] **Step 3: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add types.ts
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat(types): add URL_INPUT/ANALYSING_SITE states and DynamicQuestion type"
```

---

## Task 2: Rename MAX_SCORE and add new category translations

**Files:**
- Modify: `constants.ts`

- [ ] **Step 1: Rename MAX_SCORE to STATIC_MAX_SCORE**

Open `constants.ts` and find the line defining `MAX_SCORE`:

```ts
export const MAX_SCORE = QUESTIONS.reduce((acc, q) => acc + q.weight, 0);
```

Change to:

```ts
export const STATIC_MAX_SCORE = QUESTIONS.reduce((acc, q) => acc + q.weight, 0);
```

- [ ] **Step 2: Find all consumers of MAX_SCORE and update**

Run: `cd ~/Documents/GitHub/Directbookinghealthscore && grep -rn "MAX_SCORE" --include="*.ts" --include="*.tsx"`

For each hit (likely just `components/Results.tsx`), replace `MAX_SCORE` → `STATIC_MAX_SCORE` temporarily. This will be replaced with dynamic computation in Task 9; for now we keep it compiling.

- [ ] **Step 3: Add 'SEO & AI Search' to CATEGORY_TRANSLATIONS**

In `constants.ts`, find the `CATEGORY_TRANSLATIONS` object. Add this entry at the end (before the closing `};`):

```ts
  'SEO & AI Search': {
    en: 'SEO & AI Search',
    it: 'SEO e Ricerca AI',
    es: 'SEO y Búsqueda con IA',
    pl: 'SEO i Wyszukiwanie AI',
  },
```

- [ ] **Step 4: Type-check**

Run: `npm run lint 2>&1`
Expected: passes.

- [ ] **Step 5: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add constants.ts components/Results.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat: add SEO & AI Search category, rename MAX_SCORE to STATIC_MAX_SCORE"
```

---

## Task 3: Add generateSiteQuestions to geminiService

**Files:**
- Modify: `services/geminiService.ts`

- [ ] **Step 1: Add AIQuestion type + generateSiteQuestions function**

Open `services/geminiService.ts`. At the top (after existing imports), add:

```ts
import type { Language } from '../types';

export interface AIQuestion {
  text: string;
  subtext: string;
  category: 'SEO & AI Search';
  weight: number;
}
```

At the bottom of the file, add:

```ts
const SITE_QUESTION_SYSTEM_PROMPT = (lang: Language) => {
  const langName = { en: 'English', it: 'Italian', es: 'Spanish', pl: 'Polish' }[lang];
  return `You are a hotel digital-marketing diagnostician specialising in SEO and AI-search (AEO/GEO) readiness. Given a hotel's website URL, analyse its homepage and return EXACTLY 3 yes/no diagnostic questions the hotel operator should answer about their site.

Each question must target a specific gap or risk you identified from the site. Focus areas: meta tags, structured data (JSON-LD), page speed signals, canonical tags, mobile responsiveness, booking-engine visibility to crawlers, freshness of content, FAQ/Q&A blocks, and how cleanly answer engines (ChatGPT, Perplexity, Gemini) can cite the site.

Output a strict JSON array — no commentary, no markdown fences. Shape:
[
  {
    "text": "Is your homepage title tag under 60 characters and does it include your brand + city?",
    "subtext": "Short, branded title tags drive CTR and help AI answer engines cite your site accurately.",
    "category": "SEO & AI Search",
    "weight": 10
  }
]

All text must be in ${langName}. Tone: clinical, professional, concise. No emojis, no links. "category" MUST be the literal string "SEO & AI Search". "weight" MUST be 10.`;
};

export async function generateSiteQuestions(
  url: string,
  lang: Language,
  attempt = 1
): Promise<AIQuestion[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Analyse this hotel site and generate the 3 questions: ${url}`,
      config: {
        systemInstruction: SITE_QUESTION_SYSTEM_PROMPT(lang),
        tools: [{ urlContext: {} }],
      },
    });

    const text = response.text?.trim() ?? '';
    const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI returned invalid question list');
    }

    return parsed.slice(0, 3).map((q: AIQuestion) => ({
      text: String(q.text ?? ''),
      subtext: String(q.subtext ?? ''),
      category: 'SEO & AI Search' as const,
      weight: 10,
    }));
  } catch (error: any) {
    if ((error?.status === 429 || error?.message?.includes('429')) && attempt < 3) {
      await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
      return generateSiteQuestions(url, lang, attempt + 1);
    }
    throw error;
  }
}
```

Note: `ai` is the existing SDK instance already declared in the file.

- [ ] **Step 2: Update generateStrategicAnalysis to accept optional siteUrl**

Find the existing `generateStrategicAnalysis` function signature. Change it to accept an optional `siteUrl` param:

```ts
export async function generateStrategicAnalysis(
  answers: Answer[],
  lang: Language,
  siteUrl: string | null = null,
  attempt = 1
): Promise<string> {
```

Then find the `contents:` string in the `ai.models.generateContent` call inside it. Append the site URL line to the prompt when present. Change:

```ts
      contents: `Perform a digital health diagnosis for a hotel that scored ${scorePercent}% in their technical audit. Technical gaps identified:\n${gapsList}`,
```

to:

```ts
      contents: `Perform a digital health diagnosis for a hotel that scored ${scorePercent}% in their technical audit. Technical gaps identified:\n${gapsList}${siteUrl ? `\n\nThe hotel's website is: ${siteUrl}. Reference it by name where relevant.` : ''}`,
```

Also update the recursive retry call at the bottom of the function to pass `siteUrl` through:

```ts
      return generateStrategicAnalysis(answers, lang, siteUrl, attempt + 1);
```

- [ ] **Step 3: Type-check**

Run: `npm run lint 2>&1`
Expected: passes. If the `tools: [{ urlContext: {} }]` line errors on the `@google/genai` type, replace with the SDK's actual key (may be `url_context` depending on SDK version — check `node_modules/@google/genai` types if it errors; `urlContext` is the current JS SDK camelCase form).

- [ ] **Step 4: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add services/geminiService.ts
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat(gemini): add generateSiteQuestions with url_context + optional siteUrl in analysis"
```

---

## Task 4: Create aiService wrapper

**Files:**
- Create: `services/aiService.ts`

- [ ] **Step 1: Create the wrapper**

Write this to `services/aiService.ts`:

```ts
import type { Language, Answer } from '../types';
import {
  generateSiteQuestions as geminiGenerateSiteQuestions,
  generateStrategicAnalysis as geminiGenerateStrategicAnalysis,
  type AIQuestion,
} from './geminiService';

export type { AIQuestion };

export function generateSiteQuestions(url: string, lang: Language): Promise<AIQuestion[]> {
  return geminiGenerateSiteQuestions(url, lang);
}

export function generateStrategicAnalysis(
  answers: Answer[],
  lang: Language,
  siteUrl: string | null = null
): Promise<string> {
  return geminiGenerateStrategicAnalysis(answers, lang, siteUrl);
}
```

This is the one file a future Claude swap would edit.

- [ ] **Step 2: Type-check**

Run: `npm run lint 2>&1`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add services/aiService.ts
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat: add provider-neutral aiService wrapper"
```

---

## Task 5: Create UrlInputStep component

**Files:**
- Create: `components/UrlInputStep.tsx`

- [ ] **Step 1: Write the component**

Write this to `components/UrlInputStep.tsx`:

```tsx
'use client';

import React, { useState } from 'react';
import { Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { Button } from './Button';

interface UrlInputStepProps {
  onSubmit: (url: string) => void;
  onSkipToStatic: () => void;
  failureCount: number;
  errorMessage: string | null;
}

export const UrlInputStep: React.FC<UrlInputStepProps> = ({
  onSubmit,
  onSkipToStatic,
  failureCount,
  errorMessage,
}) => {
  const { language } = useContent();
  const [value, setValue] = useState('');

  const labels: Record<Language, {
    heading: string;
    helper: string;
    placeholder: string;
    submit: string;
    fallbackLink: string;
    invalid: string;
  }> = {
    en: {
      heading: 'What is your hotel website?',
      helper: "We analyse your site's SEO and AI-search readiness to tailor this audit to you.",
      placeholder: 'yourhotel.com',
      submit: 'Analyse my site',
      fallbackLink: 'Continue without site analysis',
      invalid: 'Please enter a valid website URL.',
    },
    it: {
      heading: 'Qual è il sito del tuo hotel?',
      helper: 'Analizziamo la preparazione SEO e di ricerca AI del tuo sito per personalizzare questo audit.',
      placeholder: 'tuohotel.com',
      submit: 'Analizza il mio sito',
      fallbackLink: 'Continua senza analisi del sito',
      invalid: 'Inserisci un URL valido.',
    },
    es: {
      heading: '¿Cuál es el sitio web de tu hotel?',
      helper: 'Analizamos la preparación SEO y de búsqueda con IA de tu sitio para adaptar esta auditoría a ti.',
      placeholder: 'tuhotel.com',
      submit: 'Analizar mi sitio',
      fallbackLink: 'Continuar sin análisis del sitio',
      invalid: 'Introduce una URL válida.',
    },
    pl: {
      heading: 'Jaka jest strona Twojego hotelu?',
      helper: 'Analizujemy gotowość SEO i wyszukiwania AI Twojej strony, aby dostosować ten audyt.',
      placeholder: 'twojhotel.pl',
      submit: 'Analizuj moją stronę',
      fallbackLink: 'Kontynuuj bez analizy strony',
      invalid: 'Wprowadź prawidłowy adres URL.',
    },
  };
  const l = labels[language];

  const normaliseUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const u = new URL(withScheme);
      if (!u.hostname.includes('.')) return null;
      return u.toString();
    } catch {
      return null;
    }
  };

  const normalised = normaliseUrl(value);
  const canSubmit = normalised !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalised) onSubmit(normalised);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-widest uppercase mb-5">
          <Globe size={12} /> Step 1
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">{l.heading}</h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">{l.helper}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={l.placeholder}
          className="w-full px-5 py-4 text-lg rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition"
          autoFocus
        />

        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-brand-accent bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-4 text-lg rounded-xl font-black shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {l.submit} <ArrowRight size={18} className="inline ml-2" />
        </Button>
      </form>

      {failureCount >= 2 && (
        <div className="text-center mt-6">
          <button
            onClick={onSkipToStatic}
            className="text-sm text-gray-400 hover:text-brand-blue underline transition-colors"
          >
            {l.fallbackLink}
          </button>
        </div>
      )}
    </div>
  );
};
```

Note on the `Button` component: check its signature in `components/Button.tsx`. If it doesn't accept `type` or `disabled` props, replace the `<Button …>` usage with a native `<button …>` styled with the same Tailwind classes as the existing Button component.

- [ ] **Step 2: Verify Button component accepts type/disabled**

Run: `cd ~/Documents/GitHub/Directbookinghealthscore && grep -nE "interface.*ButtonProps|type ButtonProps|React\.FC<" components/Button.tsx | head -20`

Read the file if needed. If `type` or `disabled` aren't passed through, edit `components/Button.tsx` to accept `type?: 'button' | 'submit' | 'reset'` and `disabled?: boolean` and spread them onto the underlying `<button>`.

- [ ] **Step 3: Type-check**

Run: `npm run lint 2>&1`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/UrlInputStep.tsx components/Button.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat: add UrlInputStep component with validation and retry banner"
```

---

## Task 6: Create AnalysingSite component

**Files:**
- Create: `components/AnalysingSite.tsx`

- [ ] **Step 1: Write the component**

Write this to `components/AnalysingSite.tsx`:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

export const AnalysingSite: React.FC = () => {
  const { language } = useContent();
  const [step, setStep] = useState(0);

  const labels: Record<Language, string[]> = {
    en: [
      'Fetching your site…',
      'Checking SEO signals…',
      'Evaluating AI search readiness…',
    ],
    it: [
      'Recupero del tuo sito…',
      'Controllo dei segnali SEO…',
      'Valutazione della ricerca AI…',
    ],
    es: [
      'Obteniendo tu sitio…',
      'Comprobando señales SEO…',
      'Evaluando búsqueda con IA…',
    ],
    pl: [
      'Pobieranie Twojej strony…',
      'Sprawdzanie sygnałów SEO…',
      'Ocena gotowości wyszukiwania AI…',
    ],
  };
  const messages = labels[language];

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % messages.length);
    }, 2000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
      <Loader2 size={48} className="text-brand-blue animate-spin mb-8" />
      <p className="text-xl sm:text-2xl font-black text-gray-900 transition-opacity duration-300">
        {messages[step]}
      </p>
    </div>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `npm run lint 2>&1`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/AnalysingSite.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat: add AnalysingSite loading screen with rotating copy"
```

---

## Task 7: Refactor Quiz.tsx to accept questions prop

**Files:**
- Modify: `components/Quiz.tsx`

- [ ] **Step 1: Open `components/Quiz.tsx` and replace hardcoded QUESTIONS reference with prop**

Find the top imports. Remove `import { QUESTIONS } from '../constants';` (keep other imports intact).

Find the component props interface. Change:

```ts
interface QuizProps {
  onComplete: (answers: Answer[]) => void;
}
```

to:

```ts
import type { DynamicQuestion } from '../types';

interface QuizProps {
  questions: DynamicQuestion[];
  onComplete: (answers: Answer[]) => void;
}
```

Inside the component, change:

```tsx
export const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
```

to:

```tsx
export const Quiz: React.FC<QuizProps> = ({ questions, onComplete }) => {
```

Replace every reference to `QUESTIONS` in the file with `questions` (the prop). Likely hits:
- `QUESTIONS[currentIndex]` → `questions[currentIndex]`
- `QUESTIONS.length` → `questions.length`

- [ ] **Step 2: Type-check**

Run: `npm run lint 2>&1`
Expected: fails — `AuditTool.tsx` hasn't been updated yet and still calls `<Quiz onComplete={…} />` without `questions`. This is OK; Task 10 wires it.

Skip lint enforcement for this commit and proceed — we'll restore lint cleanliness at Task 10.

- [ ] **Step 3: Commit (with lint expected-failure)**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/Quiz.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "refactor(Quiz): accept questions prop instead of importing constants"
```

---

## Task 8: Refactor Results.tsx to compute maxScore dynamically

**Files:**
- Modify: `components/Results.tsx`

- [ ] **Step 1: Replace STATIC_MAX_SCORE usage with a prop-based computation**

Open `components/Results.tsx`. Find the imports. Remove `STATIC_MAX_SCORE` (or `MAX_SCORE` if not yet renamed — Task 2 should have renamed already) from the imports. Remove the `QUESTIONS` import if present. Add:

```ts
import type { DynamicQuestion } from '../types';
```

Find the component's props interface and add `questions`:

```ts
interface ResultsProps {
  questions: DynamicQuestion[];
  answers: Answer[];
  onReset: () => void;
  onGetFullReport: () => void;
}
```

Update the destructuring in the function signature:

```tsx
export const Results: React.FC<ResultsProps> = ({ questions, answers, onReset, onGetFullReport }) => {
```

Inside the component, replace the score-calculation block. Find:

```tsx
const score = answers.reduce((acc, ans) => {
  if (ans.value === AnswerValue.YES) {
    const q = QUESTIONS.find(q => q.id === ans.questionId);
    return acc + (q ? q.weight : 0);
  }
  return acc;
}, 0);

const percentage = Math.round((score / STATIC_MAX_SCORE) * 100);
```

Replace with:

```tsx
const maxScore = questions.reduce((acc, q) => acc + q.weight, 0);

const score = answers.reduce((acc, ans) => {
  if (ans.value === AnswerValue.YES) {
    const q = questions.find(q => q.id === ans.questionId);
    return acc + (q ? q.weight : 0);
  }
  return acc;
}, 0);

const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
```

If the file computes per-category breakdowns using `QUESTIONS.filter(...)`, replace those with `questions.filter(...)` too. Grep within the file and swap all `QUESTIONS` → `questions`.

- [ ] **Step 2: Type-check**

Run: `npm run lint 2>&1`
Expected: still fails on `AuditTool.tsx` (same as Task 7). Proceed.

- [ ] **Step 3: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/Results.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "refactor(Results): compute maxScore dynamically from questions prop"
```

---

## Task 9: Pass siteUrl through FullResults

**Files:**
- Modify: `components/FullResults.tsx`

- [ ] **Step 1: Accept siteUrl prop and pass to analysis call**

Open `components/FullResults.tsx`. Find its props interface — add `siteUrl`:

```ts
interface FullResultsProps {
  // ...existing fields...
  siteUrl: string | null;
}
```

Destructure it in the function signature. Find where `generateStrategicAnalysis` is called (likely imported from `../services/geminiService`). Change the import to use the wrapper:

```ts
import { generateStrategicAnalysis } from '../services/aiService';
```

And update the call site to pass `siteUrl`:

```ts
generateStrategicAnalysis(answers, language, siteUrl)
```

If the call is inside a `useEffect`, add `siteUrl` to the dependency array.

- [ ] **Step 2: Type-check**

Run: `npm run lint 2>&1`
Expected: still fails on `AuditTool.tsx`. Proceed.

- [ ] **Step 3: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/FullResults.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "refactor(FullResults): accept siteUrl and use aiService wrapper"
```

---

## Task 10: Wire everything into AuditTool

**Files:**
- Modify: `components/AuditTool.tsx`

- [ ] **Step 1: Rewrite AuditTool to own new state and orchestrate the flow**

Open `components/AuditTool.tsx`. Replace its content with:

```tsx
'use client';

import React, { useEffect, useState } from 'react';
import { AppState, type Answer, type DynamicQuestion } from '../types';
import { QUESTIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { WelcomeScreen } from './WelcomeScreen';
import { UrlInputStep } from './UrlInputStep';
import { AnalysingSite } from './AnalysingSite';
import { Quiz } from './Quiz';
import { Results } from './Results';
import { FullResults } from './FullResults';
import { generateSiteQuestions, type AIQuestion } from '../services/aiService';

const MAX_URL_FAILURES = 3;

function aiToDynamic(q: AIQuestion, index: number, lang: string): DynamicQuestion {
  return {
    id: 1000 + index, // high ID space to avoid collision with static 1..15
    category: q.category,
    weight: q.weight,
    translations: {
      en: { text: q.text, subtext: q.subtext },
      it: { text: q.text, subtext: q.subtext },
      es: { text: q.text, subtext: q.subtext },
      pl: { text: q.text, subtext: q.subtext },
    },
    source: 'ai',
  };
}

export const AuditTool: React.FC = () => {
  const { language } = useContent();
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [aiQuestions, setAiQuestions] = useState<DynamicQuestion[]>([]);
  const [failureCount, setFailureCount] = useState(0);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fallbackToastShown, setFallbackToastShown] = useState(false);

  const staticQuestions: DynamicQuestion[] = QUESTIONS.map(q => ({ ...q, source: 'static' as const }));
  const quizQuestions: DynamicQuestion[] = [...aiQuestions, ...staticQuestions];

  const handleStart = () => {
    setAnswers([]);
    setAiQuestions([]);
    setFailureCount(0);
    setUrlError(null);
    setFallbackToastShown(false);
    setAppState(AppState.URL_INPUT);
  };

  const handleUrlSubmit = async (url: string) => {
    setSiteUrl(url);
    setUrlError(null);
    setAppState(AppState.ANALYSING_SITE);

    try {
      const aiQs = await generateSiteQuestions(url, language);
      const dyn = aiQs.map((q, i) => aiToDynamic(q, i, language));
      setAiQuestions(dyn);
      setAppState(AppState.QUIZ);
    } catch (err: any) {
      const nextCount = failureCount + 1;
      setFailureCount(nextCount);

      if (nextCount >= MAX_URL_FAILURES) {
        setFallbackToastShown(true);
        setAiQuestions([]);
        setAppState(AppState.QUIZ);
      } else {
        const errMsg = {
          en: "We couldn't analyse that URL. Please try another.",
          it: 'Non siamo riusciti ad analizzare questo URL. Prova un altro.',
          es: 'No pudimos analizar esa URL. Prueba con otra.',
          pl: 'Nie udało nam się przeanalizować tego URL. Spróbuj innego.',
        }[language];
        setUrlError(errMsg);
        setAppState(AppState.URL_INPUT);
      }
    }
  };

  const handleSkipToStatic = () => {
    setAiQuestions([]);
    setFallbackToastShown(true);
    setAppState(AppState.QUIZ);
  };

  const handleQuizComplete = (completedAnswers: Answer[]) => {
    setAnswers(completedAnswers);
    setAppState(AppState.SCORE);
  };

  const handleReset = () => {
    setAppState(AppState.WELCOME);
    setAnswers([]);
    setAiQuestions([]);
    setSiteUrl(null);
    setFailureCount(0);
    setUrlError(null);
    setFallbackToastShown(false);
  };

  useEffect(() => {
    if (fallbackToastShown && appState === AppState.QUIZ) {
      const t = setTimeout(() => setFallbackToastShown(false), 6000);
      return () => clearTimeout(t);
    }
  }, [fallbackToastShown, appState]);

  const toastCopy = {
    en: "We couldn't analyse your site — continuing with the standard audit.",
    it: 'Non siamo riusciti ad analizzare il tuo sito — continuiamo con l\'audit standard.',
    es: 'No pudimos analizar tu sitio — continuando con la auditoría estándar.',
    pl: 'Nie udało nam się przeanalizować Twojej strony — kontynuujemy audyt standardowy.',
  }[language];

  return (
    <>
      {fallbackToastShown && appState === AppState.QUIZ && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl text-sm max-w-md text-center">
          {toastCopy}
        </div>
      )}

      {appState === AppState.WELCOME && <WelcomeScreen onStart={handleStart} />}
      {appState === AppState.URL_INPUT && (
        <UrlInputStep
          onSubmit={handleUrlSubmit}
          onSkipToStatic={handleSkipToStatic}
          failureCount={failureCount}
          errorMessage={urlError}
        />
      )}
      {appState === AppState.ANALYSING_SITE && <AnalysingSite />}
      {appState === AppState.QUIZ && <Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
      {appState === AppState.SCORE && (
        <Results
          questions={quizQuestions}
          answers={answers}
          onReset={handleReset}
          onGetFullReport={() => setAppState(AppState.FULL_RESULTS)}
        />
      )}
      {appState === AppState.FULL_RESULTS && (
        <FullResults
          questions={quizQuestions}
          answers={answers}
          siteUrl={siteUrl}
          onReset={handleReset}
        />
      )}
    </>
  );
};
```

**Note:** the exact `FullResults` prop list must match what Task 9 produced. If `FullResults` takes additional props (e.g. `onReset`, `analysis` state owned by it), keep them.

- [ ] **Step 2: Verify Quiz still shows questions correctly across languages**

The `aiToDynamic` helper above writes the AI-returned text into all four language slots because Gemini returns text already in the current language. A user mid-session switching language would see stale question text — acceptable for v1 (questions are per-session), but note this in the out-of-scope list of the spec.

- [ ] **Step 3: Type-check**

Run: `npm run lint 2>&1`
Expected: passes cleanly now that all props are wired.

- [ ] **Step 4: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/AuditTool.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "feat(AuditTool): orchestrate URL_INPUT + ANALYSING_SITE flow with failure handling"
```

---

## Task 11: Update FullResults to handle dynamic questions

**Files:**
- Modify: `components/FullResults.tsx`

- [ ] **Step 1: Accept questions prop and use it for gap calculation**

Open `components/FullResults.tsx`. If it currently imports `QUESTIONS` from constants to build the gaps list, replace with a prop.

Add to the props interface:

```ts
questions: DynamicQuestion[];
```

Add the import:

```ts
import type { DynamicQuestion } from '../types';
```

Replace `QUESTIONS` references inside the file with `questions` (the prop). If it computes `gaps` by filtering answers with NO and looking up the question, use `questions.find(...)` instead.

- [ ] **Step 2: Type-check**

Run: `npm run lint 2>&1`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore add components/FullResults.tsx
git -C ~/Documents/GitHub/Directbookinghealthscore commit -m "refactor(FullResults): use questions prop for gap analysis"
```

---

## Task 12: Update home page CTA label if needed

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Confirm home page primary CTA still reads correctly**

The home page button currently says "Launch Free Tech Audit" and calls `onStart` which routes to `/hotel-audit`. That still lands on WELCOME state inside `AuditTool`, then click again to go to URL_INPUT. No change needed.

If you want to skip the WELCOME splash entirely and land on URL_INPUT, adjust `AuditTool.tsx` initial state to `AppState.URL_INPUT` — but only do this if the user has asked for it. Do not make this change without explicit confirmation.

- [ ] **Step 2: No commit**

---

## Task 13: Sub-agent code review before localhost

**Files:**
- Read-only review

- [ ] **Step 1: Dispatch a code-reviewer sub-agent**

Use the `Agent` tool with `subagent_type: "superpowers:code-reviewer"`. Prompt:

> Review the changes on branch `main` since commit `82d6e54` (the last "Powered by Bookassist" commit) against the spec at `docs/superpowers/specs/2026-04-23-ai-url-quiz-design.md`. Verify:
>
> 1. The state machine correctly transitions WELCOME → URL_INPUT → ANALYSING_SITE → QUIZ → SCORE → FULL_RESULTS.
> 2. Failure handling: 2 retries return to URL_INPUT with error banner; 3rd failure auto-advances to QUIZ with static-only and shows a toast.
> 3. `Quiz.tsx` uses the `questions` prop, not the old `QUESTIONS` import.
> 4. `Results.tsx` computes `maxScore` dynamically from the `questions` prop — not `STATIC_MAX_SCORE`.
> 5. `generateSiteQuestions` in `geminiService.ts` uses the `url_context` tool and parses JSON defensively (tolerates ```json fences).
> 6. The provider-neutral `aiService.ts` wrapper is the only place components import from.
> 7. Translations exist for all new UI copy in EN/IT/ES/PL.
> 8. The `'SEO & AI Search'` category is added to `CATEGORY_TRANSLATIONS`.
> 9. No hardcoded references to `QUESTIONS.length` or `MAX_SCORE` remain in components.
> 10. No obvious type errors (the repo's test is `npm run lint` which should pass).
>
> Report any issues as a punch list with file paths and line numbers. Flag any functional bugs, missed spec requirements, or wiring mistakes. Report under 400 words.

- [ ] **Step 2: Address any issues the review raises**

If the review is clean, proceed to Task 14. If issues are found, fix them one at a time, committing each fix, then re-dispatch the reviewer until clean.

---

## Task 14: Visual verification on localhost

**Files:**
- None (manual test)

- [ ] **Step 1: Start the dev server**

```bash
cd ~/Documents/GitHub/Directbookinghealthscore && npm run dev
```

Wait for "Ready in Xms" message.

- [ ] **Step 2: Walk through the happy path**

Open http://localhost:3000 (or 3001 if 3000 is in use) → click "Launch Free Tech Audit" → WelcomeScreen → click Start → URL_INPUT appears.

Enter `bookassist.com` → click "Analyse my site" → AnalysingSite loading screen with rotating copy → after ~10–15s, Quiz appears with 3 SEO/AI-search yes/no questions first, then 15 static.

Answer through all 18 → Results shows score (out of 186 max if AI succeeded) + category bars including "SEO & AI Search" → click "Get Full Report" → FullResults shows the AI analysis referencing bookassist.com.

- [ ] **Step 3: Test failure path**

Reset. Click Start → enter `thissitedoesnotexist-abcdef.com` → see error banner on retry. Enter another bad URL → 2nd failure. On 3rd attempt with bad URL, toast appears and quiz runs with static 15 only.

- [ ] **Step 4: Test language switching**

Switch to IT before starting → complete flow → verify URL_INPUT, AnalysingSite, AI-generated questions, and FullResults all render in Italian. Repeat spot-check for ES and PL.

- [ ] **Step 5: Only after all checks pass, report to the user that it's ready**

Per saved user preference: do NOT present the dev server URL until the code-reviewer sub-agent (Task 13) has returned clean AND the visual verification above has been performed.

---

## Task 15: Final commit and push

- [ ] **Step 1: Stop the dev server**

Kill the background process.

- [ ] **Step 2: Review commit log**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore log --oneline 82d6e54..HEAD
```

Confirm the commits form a coherent sequence. If any commits need squashing, ask the user first.

- [ ] **Step 3: Push to main**

```bash
git -C ~/Documents/GitHub/Directbookinghealthscore push origin main
```

- [ ] **Step 4: Report to the user**

State the commits pushed, Amplify will rebuild, and the feature will be live within a few minutes.

---

## Out of scope (flag in PR / report)

- Background analysis during static quiz (currently sequential).
- Caching AI-generated questions.
- Updating stale project `CLAUDE.md`.
- Language switch mid-session refreshing AI-generated questions (stale text until reset).
