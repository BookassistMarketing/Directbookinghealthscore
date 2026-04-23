# AI-Powered URL Quiz Layer — Design Spec

**Date:** 2026-04-23
**Status:** Approved by user, ready for implementation plan

---

## Context

The Direct Booking Health Score audit today runs 15 hardcoded yes/no questions across four categories (Direct Booking, Metasearch, Analytics, CRM). Every hotel gets the same quiz regardless of their actual site. The final Gemini analysis reasons only over the Q&A — it never sees the hotel's website.

We're adding a site-specific layer on the front of the audit. The user enters their website URL; Gemini fetches and analyses the site for SEO and AI-search (AEO/GEO) readiness; it generates 3 context-aware yes/no questions that run before the existing 15; the final analysis references the site and the new gaps. This gives each audit a personalised front end and introduces a fifth scoring category: "SEO & AI Search."

The user has flagged they may switch from Gemini to Claude later — so the AI provider must live behind a thin interface that makes swapping a one-file change.

---

## Goals

- Every audit starts with a mandatory website URL.
- AI analyses the site and generates exactly 3 yes/no questions focused on SEO + AI search readiness.
- Those 3 questions run BEFORE the existing 15 static questions.
- Quiz results and final analysis include the new category and reference the site URL.
- Graceful failure: 2 retries, then fall through to the static 15 with a user-visible notice.
- Provider-agnostic AI layer: swap Gemini for Claude later without touching consumers.

## Non-goals

- Dynamic question count (always 3 for predictability).
- Optional URL step (mandatory, per user decision).
- Server-side fetching or caching of site content (Gemini's `url_context` handles this).
- Changing the existing 15 questions or their weights.

---

## Architecture

### State machine

`types.ts` gains two states:

```ts
enum AppState {
  WELCOME,
  URL_INPUT,        // new
  ANALYSING_SITE,   // new
  QUIZ,
  SCORE,
  FULL_RESULTS
}
```

### Flow

```
WELCOME
  │ onStart
  ▼
URL_INPUT ◄──── back on failure (attempts 1 & 2)
  │ submit URL
  ▼
ANALYSING_SITE ──── failure #3 ──► QUIZ (static only, toast shown)
  │ success
  ▼
QUIZ (3 AI + 15 static, concatenated)
  │ onComplete
  ▼
SCORE ──► FULL_RESULTS
```

### Provider-neutral AI layer

New file: `services/aiService.ts`

```ts
export interface AIQuestion {
  text: string;
  subtext: string;
  category: 'SEO & AI Search';
  weight: number;    // always 10
}

export async function generateSiteQuestions(
  url: string,
  language: Language
): Promise<AIQuestion[]>;

export async function generateStrategicAnalysis(
  answers: Answer[],
  url: string | null,
  language: Language
): Promise<string>;
```

Internally `aiService.ts` delegates to `geminiService.ts` (existing). Future Claude switch = create `claudeService.ts` with matching signatures, flip the imports in `aiService.ts`. Nothing else changes.

### Component tree (additions in **bold**)

```
AuditTool (state owner)
├── WelcomeScreen (unchanged)
├── UrlInputStep          ← NEW
├── AnalysingSite         ← NEW (loading screen)
├── Quiz (takes questions[] prop instead of reading QUESTIONS constant)
├── Results (computes MAX_SCORE dynamically from given questions)
└── FullResults (unchanged visual, gets URL passed through)
```

---

## Components

### `UrlInputStep.tsx` (new)

- Single text input, placeholder `bookassist.com`.
- Client-side normalise: prepend `https://` if scheme missing; validate with `new URL()`.
- Submit button disabled until URL is valid.
- Helper copy below input (translated EN/IT/ES/PL): "We analyse your site's SEO and AI-search readiness to tailor this audit to you."
- On failure, re-renders with error banner: "Couldn't analyse that URL — try another?" and keeps the input populated.
- After 2 failures, shows a subtle link: "Continue without site analysis" that jumps to `QUIZ` with only the 15 static questions.

### `AnalysingSite.tsx` (new)

- Full-screen loading state while `generateSiteQuestions` runs.
- Rotating progress copy every 2s:
  1. "Fetching your site…"
  2. "Checking SEO signals…"
  3. "Evaluating AI search readiness…"
- No cancel button (call is short enough; 429-retry handled internally).

### `Quiz.tsx` (modified)

- New prop: `questions: DynamicQuestion[]`.
- Remove the `import { QUESTIONS } from '../constants'` — parent now supplies the list.
- Progress bar uses `questions.length` (no hardcoded 15).
- Everything else (auto-advance, answer collection) unchanged.

### `AuditTool.tsx` (modified)

- Owns: `appState`, `answers`, `siteUrl`, `aiQuestions`, `failureCount`.
- Composes final question list: `[...aiQuestions, ...STATIC_QUESTIONS]`.
- Handles state transitions and failure counting.

### `Results.tsx` (modified)

- Accept `questions` prop alongside `answers`.
- Compute `MAX_SCORE = questions.reduce((a, q) => a + q.weight, 0)` locally.
- Category breakdown automatically shows "SEO & AI Search" when those answers are present.

---

## Data types

```ts
// types.ts additions

export interface DynamicQuestion extends Question {
  source: 'static' | 'ai';
}

export type QuestionCategory =
  | 'Direct Booking'
  | 'Metasearch'
  | 'Analytics'
  | 'CRM'
  | 'SEO & AI Search';   // new
```

---

## Data flow

1. User clicks "Start Audit" → `appState = URL_INPUT`.
2. User enters URL, clicks submit → `siteUrl` saved, `appState = ANALYSING_SITE`.
3. `aiService.generateSiteQuestions(url, lang)` called.
4. Gemini `gemini-2.0-flash` with `url_context` tool enabled. System prompt constrains output to strict JSON of 3 yes/no questions, `category: "SEO & AI Search"`, `weight: 10`, localised to the current language.
5. On success → `aiQuestions` stored, `appState = QUIZ`. Quiz renders 3 AI questions first, then the 15 static.
6. On failure → increment `failureCount`, return to `URL_INPUT` with error banner (attempts 1 & 2) or auto-advance to `QUIZ` with static-only and a one-time toast (attempt 3).
7. Quiz completes → `appState = SCORE`. `Results` computes dynamic `MAX_SCORE` and renders.
8. User clicks "Get Full Report" → `appState = FULL_RESULTS`. `generateStrategicAnalysis(answers, siteUrl, lang)` runs; prompt includes the URL so the analysis can reference the actual site.

---

## AI prompt sketch

### `generateSiteQuestions`

```
System:
You are a hotel digital-marketing diagnostician. Given a hotel's website URL,
analyse it for SEO and AI-search (AEO/GEO) readiness. Return exactly 3 yes/no
questions the user should answer about their site, each targeting a specific
gap or risk you identified.

Output format (strict JSON, no commentary):
[
  {
    "text": "Is your homepage title tag under 60 characters and include your hotel brand + city?",
    "subtext": "Short, branded title tags drive CTR on Google and help AI answer engines cite your site correctly.",
    "category": "SEO & AI Search",
    "weight": 10
  },
  ...3 total
]

All text must be in: {language name}.
Tone: clinical, professional, concise. No emojis. No links.

User:
Analyse this hotel site and generate the 3 questions: {url}
```

Use `url_context` tool; single call. Expect ~10–15 s.

### `generateStrategicAnalysis` (modified)

Existing prompt gets one added line: `"The hotel's website is: {url}. Reference it by name if relevant."` — only appended when `url` is non-null.

---

## Scoring changes

- `MAX_SCORE` constant in `constants.ts` renamed to `STATIC_MAX_SCORE` (kept for reference/fallback). Consumers stop importing it.
- `Results.tsx` computes `maxScore` from its `questions` prop.
- AI questions weighted 10 each → total max grows 156 → 186 when AI layer succeeds.
- Score percentage formula unchanged: `(earned / maxScore) * 100`.

---

## Translations

New strings to add (EN/IT/ES/PL) in the appropriate `labelsMap`:

| Key | Location |
|---|---|
| `urlStep.heading` | UrlInputStep |
| `urlStep.helper` | UrlInputStep |
| `urlStep.placeholder` | UrlInputStep |
| `urlStep.submit` | UrlInputStep |
| `urlStep.errorBanner` | UrlInputStep |
| `urlStep.fallbackLink` | UrlInputStep (shown after 2 failures) |
| `analysing.copy1/2/3` | AnalysingSite (3 rotating messages) |
| `quiz.toast.fallback` | AuditTool one-time toast on failure #3 |
| Category: `SEO & AI Search` | `constants.ts#CATEGORY_TRANSLATIONS` |

---

## Error handling

| Case | Behaviour |
|---|---|
| Invalid URL (client-side) | Submit button stays disabled; no API call. |
| Gemini 429 | Existing exponential backoff (2s/4s/8s, 3 attempts). Counts as one user-facing failure if all retries fail. |
| Gemini timeout or non-JSON response | Count one user-facing failure; show error banner. |
| `url_context` can't reach site (404, blocked, etc.) | Gemini returns an explanation; we detect "could not fetch" and treat as one user-facing failure. |
| Network error | Count one user-facing failure. |
| 3rd failure | Auto-advance to `QUIZ` with static-only; show toast "We couldn't analyse your site — continuing with standard audit." |

---

## Testing plan

1. **Type-check:** `npm run lint` clean.
2. **Sub-agent review:** dispatch a code-reviewer sub-agent to audit the changed files against this spec before localhost verification. (Per user preference — always do this before showing localhost.)
3. **Happy path:** enter `bookassist.com`, see analysing screen, see 3 AI questions with SEO/AI-search content, complete static 15, see results with "SEO & AI Search" category bar, see final analysis that references bookassist.com.
4. **Retry path:** enter `thisdomaindoesnotexist-12345.com`, see error banner, enter a valid URL, continue.
5. **Fallback path:** enter 2 bad URLs, third attempt shows toast + static-only quiz.
6. **Language switching:** in IT/ES/PL, confirm all new UI copy + AI-generated questions render in the selected language.
7. **Scoring:** verify a site that answers YES to all 18 scores 100%; verify skipping to static-only scores correctly against MAX=156.

---

## Out of scope (flag for follow-up)

- Server-side URL fetching or caching (currently relying on Gemini's `url_context`).
- Background analysis while the user answers the static questions (today: sequential with a loading screen).
- Persistence: not saving past audits; state resets on reload.
- A/B testing the AI prompt.
- Updating the project's root `CLAUDE.md` which is still stale (Vite/GH Pages/3 languages) — separate cleanup task.

---

## Open questions resolved

- URL mandatory? → **Yes.**
- AI question count? → **Fixed at 3.**
- AI questions before or after static? → **Before.**
- Failure mode? → **2 retries then fall through with toast.**
- AI provider? → **Gemini `url_context` today; design provider-neutral for future Claude swap.**
