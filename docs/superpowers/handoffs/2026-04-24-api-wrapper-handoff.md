# Handoff — API Wrapper Move to Server-Side (2026-04-24)

## Today's change in one sentence

Moved every Gemini call behind server-side Next.js API routes so `GEMINI_API_KEY` and the prompts never ship to the browser. Same feature, tighter security posture.

## Current state

- Working tree clean. Feature is functionally unchanged for the end user.
- **26 local commits** ahead of `origin/main`. Nothing pushed yet.
- Lint (`npm run lint`) passes clean.
- Compliance check passed conditionally (see "Compliance notes" below).

## What changed

**New files:**
- `app/api/analyse-site/route.ts` — POST `{ url, language }` → `{ questions: AIQuestion[] }`. Wraps `generateSiteQuestions`.
- `app/api/submit-assessment/route.ts` — POST `{ answers, language, siteUrl }` → `{ analysis: string }`. Wraps `generateStrategicAnalysis`.

**Modified:**
- `services/geminiService.ts` — reads `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix). Only imported by the API routes now.
- `services/aiService.ts` — rewritten to `fetch` our `/api/*` routes instead of importing `geminiService` directly. Client-side, no Gemini SDK in the bundle.
- `components/AuditTool.tsx` — imports `generateStrategicAnalysis` from `aiService` (previously `submitAssessment` from `apiService`). Also adds `console.error` on strategic-analysis failure.
- `.env.example` — updated to document `GEMINI_API_KEY` (server-only) and deprecate `NEXT_PUBLIC_GEMINI_API_KEY`.

**Deleted:**
- `services/apiService.ts` — 505 lines of mocks + ipapi.co geolocation. Replaced by the real Gemini-backed route.

## Commits since `origin/main` (yesterday + today, oldest first)

Yesterday's AI URL Quiz feature:

```
2ea1e5c docs: add spec for AI-powered URL quiz layer
3023cde docs: add implementation plan for AI URL quiz layer
1d1b96e feat(types): add URL_INPUT/ANALYSING_SITE states and DynamicQuestion type
c65b5e9 feat: add SEO & AI Search category, rename MAX_SCORE to STATIC_MAX_SCORE
43b8be6 feat(gemini): add generateSiteQuestions with url_context + optional siteUrl in analysis
1ec99b7 fix(gemini): filter empty AI questions and throw if none valid
b0c06ed feat: add provider-neutral aiService wrapper
3ea6a64 refactor(ai): move AIQuestion type ownership to aiService wrapper
29ddf42 feat: add UrlInputStep component with validation and retry banner
74d141c fix(UrlInputStep): translate step chip and add a11y attributes
8965ee4 feat: add AnalysingSite loading screen with rotating copy
e78328c refactor(Quiz): accept questions prop instead of importing constants
b9f61e1 refactor(Results): compute maxScore dynamically from questions prop
81cb012 refactor(FullResults): accept siteUrl and use aiService wrapper
663499d feat(AuditTool): orchestrate URL_INPUT + ANALYSING_SITE flow with failure handling
cff71e3 fix(AuditTool): log site-analysis errors and add 30s timeout
0959e97 refactor(FullResults): use questions prop for gap analysis
6fa3333 fix: display siteUrl in FullResults header and guard Quiz empty questions
43c9d51 fix(UrlInputStep): use type=text so bare hostnames like bookassist.com submit
b57349f docs: handoff notes for AI URL quiz layer — paused before push
```

Today's API wrapper move:

```
c5f61f3 refactor(gemini): read GEMINI_API_KEY (server-only) instead of NEXT_PUBLIC_
b427e85 feat(api): add /api/analyse-site route (POST url+language → AI questions)
d225751 feat(api): add /api/submit-assessment route (POST answers+lang+siteUrl → analysis)
bbcd53c refactor(ai): call /api routes via fetch instead of importing geminiService
bb70095 refactor: delete apiService.ts, route strategic analysis through aiService
```

## Before you push to main — REQUIRED Amplify env change

The old env var `NEXT_PUBLIC_GEMINI_API_KEY` is dead. The new server-side routes read `GEMINI_API_KEY`. If you push without updating Amplify, Gemini calls will fail with `MISSING_API_KEY`.

**Amplify console steps:**
1. Amplify Console → your app → **App settings → Environment variables**.
2. Add: `GEMINI_API_KEY` = (paste the same key you had).
3. Delete: `NEXT_PUBLIC_GEMINI_API_KEY`.
4. Trigger a rebuild (it'll happen automatically when you `git push`).

**Local dev:**
1. Edit your local `.env` file (gitignored, at project root).
2. Rename `NEXT_PUBLIC_GEMINI_API_KEY=...` to `GEMINI_API_KEY=...`.
3. Restart `npm run dev`.

## How to resume tomorrow

1. **Verify locally first**: `cd ~/Documents/GitHub/Directbookinghealthscore && npm run dev`. Visit `/hotel-audit`, enter `bookassist.com`, confirm the AI questions appear. Open DevTools Network tab → `/api/analyse-site` and `/api/submit-assessment` should be the only XHRs that hit Gemini indirectly. The Gemini SDK should NOT appear in any JS bundle response.
2. **If working**: update Amplify env as above, then `git push origin main`.
3. **If broken locally with `MISSING_API_KEY`**: your local `.env` still has `NEXT_PUBLIC_GEMINI_API_KEY`. Rename it to `GEMINI_API_KEY` and restart.

## Compliance notes (from today's AI Agent Compliance Check)

- ✅ **Gemini paid tier confirmed by user** — no training-data concern.
- ✅ **Google Cloud DPA covers EU → US transfer** (SCCs included).
- ✅ **ipapi.co geolocation fully removed** — zero personal-data capture now.
- ⚠️ **EU AI Act Article 50 disclosure** — in force from **August 2026**. The UI mentions "AI-search readiness" which is borderline. Before that date, add an explicit "This audit uses AI (Google Gemini)" line somewhere visible on the URL input step or the analysing screen. Non-urgent but put a reminder in the calendar.
- ℹ️ **Privacy notice**: worth adding a one-liner "We send your site URL and answers to Google Gemini for AI analysis." Not a blocker.

## Outstanding items (carry-over from yesterday, still deferred)

- Retry helper duplication between `generateSiteQuestions` and `generateStrategicAnalysis` in `geminiService.ts`.
- `useMemo` on `quizQuestions` in `AuditTool.tsx`.
- `AbortController` on in-flight strategic analysis.
- Root `CLAUDE.md` is stale (still describes Vite/GH Pages/3 languages).

## Known gotchas

- **Zombie dev servers.** If the UI renders unstyled, `pkill -9 -f "next dev"`, `rm -rf .next`, restart.
- **`type="url"`** — fixed yesterday. Input is now `type="text"` with `inputMode="url"` so bare `bookassist.com` submits.
- **Gemini latency.** `url_context` calls take 10–15s in practice. The AnalysingSite screen rotates copy every 2s. 30s hard timeout in `AuditTool#withTimeout`.
- **The ipapi.co call is gone** — if you've been expecting geolocation data in the payload, it's no longer captured. Wire it back in via a route + consent gate if you need it later.

## Memory items captured today

- Run `/ai-agent-compliance-check` at **planning** and **before execution** for any AI-touching feature. Re-check whenever a new tool or data flow is added.
