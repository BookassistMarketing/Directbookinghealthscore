# Handoff — AI URL Quiz Layer (2026-04-23)

## Current state

- **19 commits** are on `main` locally. **Nothing has been pushed** — Amplify is unchanged.
- `git log origin/main..HEAD` will show everything still pending push.
- Dev server was last running on `http://localhost:3003` (ports 3000–3002 were occupied by other apps). Port isn't persisted; just restart `npm run dev` tomorrow.
- Lint (`npm run lint`) passes clean on HEAD.

## What shipped locally

Full feature: new URL-input step + Gemini `url_context` analysis + 3 AI-generated SEO/AI-search yes/no questions running before the existing 15 static questions + dynamic scoring + "Report for yourhotel.com" line in the full-report header.

Key files created:
- `components/UrlInputStep.tsx`
- `components/AnalysingSite.tsx`
- `services/aiService.ts` (provider-neutral wrapper — swap to Claude later by editing this one file)

Key files modified:
- `types.ts` — new `URL_INPUT` + `ANALYSING_SITE` states, `DynamicQuestion` type, extended `QuestionCategory`
- `constants.ts` — added `'SEO & AI Search'` category translations; renamed `MAX_SCORE` → `STATIC_MAX_SCORE`
- `services/geminiService.ts` — new `generateSiteQuestions`; `generateStrategicAnalysis` accepts optional `siteUrl`
- `services/apiService.ts` — `submitAssessment` accepts `siteUrl` and includes it in payload
- `components/AuditTool.tsx` — orchestrates new 6-state flow, 2-retries-then-fallback, 30s timeout, toast
- `components/Quiz.tsx` — accepts `questions` prop instead of importing constants
- `components/Results.tsx` — computes `maxScore` dynamically from prop
- `components/FullResults.tsx` — accepts `questions` + `siteUrl`; displays site in header

Spec and plan:
- `docs/superpowers/specs/2026-04-23-ai-url-quiz-design.md`
- `docs/superpowers/plans/2026-04-23-ai-url-quiz.md`

## Commits since `origin/main` (82d6e54..HEAD, oldest first)

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
```

## How to resume tomorrow

1. `cd ~/Documents/GitHub/Directbookinghealthscore && npm run dev` — server starts on the first free port 3000+.
2. Visit `/hotel-audit`. Verification checklist:
   - **Happy path:** enter `bookassist.com` → loading screen → 3 AI questions about SEO/AI-search → 15 static questions → score includes "SEO & AI Search" category → full report references `bookassist.com` in the header.
   - **Failure path:** `thissitedoesnotexist-abcdef.com` → error banner → try another → after 2 fails the "Continue without site analysis" link appears → 3rd fail auto-advances with toast.
   - **Languages:** switch to IT/ES/PL before starting and confirm all new copy is translated.
3. When happy, push all 19 commits:
   ```
   git -C ~/Documents/GitHub/Directbookinghealthscore push origin main
   ```
   Amplify will rebuild; site lives again within a few minutes.

## Outstanding items (non-blocking — follow-up polish)

From the final code-review subagent:
- **Retry helper duplication.** `geminiService.ts` has near-identical 429 retry/backoff in both `generateStrategicAnalysis` and `generateSiteQuestions`. Extract into a shared `withRetry(fn, isRetryable)` helper.
- **`scorePercent` divergence.** `apiService.ts#buildPayload` computes `scorePercent` using `STATIC_MAX_SCORE` (156), but the UI shows a percent based on the dynamic `maxScore` (up to 186 with AI questions). Currently the backend is mocked so this doesn't surface, but when the real backend is wired up the percent sent should match what the user saw. Pass `questions` (or `maxScore`) through `submitAssessment` and use that in `buildPayload`.
- **`useMemo` for `quizQuestions`.** `AuditTool.tsx` rebuilds `staticQuestions` / `quizQuestions` on every render. Cheap today; wrap in `useMemo([aiQuestions])` for cleanliness.
- **`AbortController` for in-flight `submitAssessment`.** If a user hits "Retake" mid-analysis, the stale promise still resolves and may briefly set analysis on the new audit cycle before being overwritten. Not observed in testing; flag only.

Out-of-band cleanup:
- The project's root `CLAUDE.md` is still stale (it describes Vite + GitHub Pages + 3 languages). Real stack is Next.js 15 + Amplify + 4 languages (EN/IT/ES/PL). Worth a 5-minute rewrite separately.

## Known gotchas from today

- **Zombie dev servers.** When iterating fast I ended up with multiple `npm run dev` instances competing for ports (3000 → 3001 → 3002 → 3003). If the UI renders unstyled, check `ps aux | grep "next dev"` and kill stragglers: `pkill -9 -f "next dev"`, then `rm -rf .next` and restart.
- **`type="url"` validator.** Early a11y pass set the URL input to `type="url"`, which made browsers block submission of bare `bookassist.com` (no scheme). Fixed in `43c9d51` — we use `type="text"` + `inputMode="url"` + our own JS validation. The value is normalised server-side before hitting Gemini.
- **Gemini URL context latency.** Real Gemini `url_context` calls can take 10–15s. The AnalysingSite screen rotates copy every 2s so it doesn't feel frozen. 30s hard timeout in `AuditTool#withTimeout`.

## If Gemini analysis keeps failing tomorrow

Most likely causes, in order:
1. `NEXT_PUBLIC_GEMINI_API_KEY` missing or expired in `.env` — check `process.env.NEXT_PUBLIC_GEMINI_API_KEY` is set and valid. A mid-audit failure will show the error banner; after 3 failures you can still complete the static quiz.
2. Gemini quota exhausted (HTTP 429) — the retry logic handles this with exponential backoff (2s, 4s, 8s) up to 3 attempts. If all three fail, it counts as one user-facing failure.
3. Target site blocks Google's fetcher — Gemini will return a "could not fetch" style response. You'll see this as a JSON parse failure (no usable questions), surfaced as a generic error. Try a different URL.

## Memory of user preferences captured today

- Don't push multi-task feature builds to main until you verify on localhost (saved as memory).
- Dispatch sub-agents to review feature code functionality before presenting the running dev server (saved as memory).
- Always present options (simplest first) before implementing anything (already memory).
