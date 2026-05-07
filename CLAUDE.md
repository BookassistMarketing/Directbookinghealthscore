# Direct Booking Health Score — Claude Code Briefing

This file is automatically loaded by Claude Code at the start of every session. It provides full context about this project so you do not need to be reminded of the structure, stack, or rules.

---

## What This Project Is

The Direct Booking Health Score is a hotel technology and marketing audit tool built for Bookassist. It exposes **two distinct tools** to hoteliers, both powered by Google Gemini:

1. **Hotel Tech Audit** (`/hotel-audit`) — a 15-question quiz across categories (Direct Booking, Metasearch, Analytics, CRM, SEO & AI Search) that scores the hotel's stack and produces an AI-written strategic narrative.
2. **AI Visibility Audit** (`/ai-visibility-audit`) — a single-URL input that submits the hotel's website to Gemini with the "Bookassist AI Readiness Auditor" system prompt and renders a structured markdown report with: `## AI Visibility & Optimisation Summary` header, weighted scoring breakdown table, recurring issues table (impact on AI & GEO search), recommended fixes & score uplift table, and a static "Book a Demo" CTA card. The loading screen shows rotating "Did you know?" fact cards (7 s interval, 10 facts × 7 languages).

Live at: https://directbookinghealthscore.com — hosted on **AWS Amplify** (rebuilds on `git push origin main`).

---

## Tech Stack

- **Framework:** Next.js 15 App Router with React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini API (`@google/genai`) — `gemini-3-flash-preview`, server-only via Next.js API routes
- **Markdown rendering:** `react-markdown` + `remark-gfm` (table support for the AI Readiness Report)
- **Charts:** Recharts
- **Icons:** Lucide React
- **PDF Export:** html2canvas + jsPDF + html2pdf, loaded via CDN in `app/layout.tsx`
- **Deployment:** AWS Amplify (continuous deployment from `main`)

---

## Application Flow

### Hotel Tech Audit (`/hotel-audit`)

State machine in `types.ts` / `components/AuditTool.tsx`:
```
WELCOME → QUIZ → SCORE → FULL_RESULTS
```
- WELCOME — landing card + Start CTA
- QUIZ — 15 questions across 5 categories with Yes/No answers
- SCORE — interim score view with option to unlock full report
- FULL_RESULTS — AI-generated strategic analysis + PDF export

### AI Visibility Audit (`/ai-visibility-audit`)

Five-state client component (`components/AiAudit.tsx`):
```
idle (URL form) → loading (Did You Know? cards) → preview (blurred teaser) → form_gate (lead capture) → done (full markdown report + CTA)
```

### Consent gating

Both tools call Gemini, so both show a consent modal on first arrival per browser session. Acceptance is stored in `sessionStorage` under `hhc_gemini_consent`.

---

## Internationalisation (7 languages)

Supported locales: **English (en), Italian (it), Spanish (es), Polish (pl), French (fr), German (de), Czech (cs)**.

### URL routing
- English at root: `/`, `/hotel-audit`, `/ai-visibility-audit`, `/blog`, `/blog/[slug]`, `/security`
- Other locales prefixed: `/it/...`, `/fr/...`, `/de/...`, `/es/...`, `/pl/...`, `/cs/...`
- Each locale is server-rendered for crawler indexation; `hreflang` link tags emitted on every page; one canonical per locale; sitemap emits one URL per (page × locale).

### Content
- All quiz questions + categories live in `constants.ts` with `Record<Language, ...>` translation maps
- All UI labels live in inline `Record<Language, ...>` maps inside their components
- Blog posts use `<slug>.<lang>.md` filename pattern (e.g. `2026-03-20-why-hotels-lose-money-to-otas.fr.md`); the bare `<slug>.md` is English

### Translation rules (Bookassist Translation skill)
- Source language: UK English
- Spanish uses `tú` (informal); German uses `Sie` (formal)
- Untranslatable terms: `Bookassist`, `OTA`, `GA4`, `ROI`, `CPA`, `GEO`, `Booking.com`, `Trivago`, `Metasearch` (per skill rule)
- Mandatory phrases: see `~/Desktop/translation-v3.skill` (BOOK A DEMO → EINE DEMO BUCHEN, etc.)

**When you change any UI text, update all 7 language entries in the same edit.**

---

## Key Files

| File | Purpose |
|---|---|
| `app/page.tsx` | English home (server component, fetches recent posts in all 7 langs) |
| `app/[lang]/page.tsx` | Localised home for it/es/pl/fr/de/cs |
| `app/[lang]/layout.tsx` | Validates locale param, 404s on unknown values |
| `app/{hotel-audit,ai-visibility-audit,blog,blog/[slug],security}/page.tsx` | English server pages |
| `app/[lang]/{...}/page.tsx` | Localised mirrors of the above |
| `app/api/ai-audit/route.ts` | POST endpoint for AI Visibility Audit; Node runtime, never bundled to browser |
| `app/api/submit-assessment/route.ts` | POST endpoint for the strategic-analysis call after the quiz |
| `app/sitemap.ts` | Emits 1 URL per (page × locale) plus 1 per blog-post × locale |
| `app/layout.tsx` | Root layout, ContentProvider mount, html/body |
| `services/geminiService.ts` | All Gemini calls; has `import 'server-only'` at line 1 |
| `services/aiService.ts` | Client-side fetch wrappers around the API routes |
| `contexts/ContentContext.tsx` | Reads locale from URL via `usePathname()`; `setLanguage` does `router.push` to the locale equivalent |
| `lib/i18n.ts` | LOCALES, localePrefix, parseLangFromPath, pathForLocale, buildHreflang, canonicalFor helpers |
| `lib/blog.ts` | Markdown loader; regex hard-codes `(it|es|pl|fr|de|cs)` for locale suffix detection |
| `lib/schema.tsx` | JSON-LD schemas (Organization, WebSite, SoftwareApplication, Service, Blog, Article, etc.) |
| `constants.ts` | All quiz questions and category translations |
| `types.ts` | `Language`, `AppState`, `Question`, `Answer` |
| `components/AuditTool.tsx` | Quiz tool state machine |
| `components/AiAudit.tsx` | AI Visibility Audit — URL form, Did You Know loading cards, blurred preview gate, full report with Book a Demo CTA |
| `components/ConsentModal.tsx` | Gemini-processing disclosure (used by both tools, includes EU AI Act Article 50 phrasing) |
| `components/AppShell.tsx` | Header: logo left; desktop nav right (Home, Blog, Contact, Hotel Tech Audit, AI Visibility Audit, **language switcher**); mobile hamburger |
| `components/Home.tsx` | Home page hero; contains `Heartbeat` ECG component — per-locale baseline y-values control line position (`en:215`, `it:183`, others `~230`) |
| `components/FullResults.tsx` | Hotel Tech Audit results: score card, AI Strategic Assessment (blue box with structured markdown), PDF export, Book a Demo CTA |

---

## Commands

Run from project root (`~/Documents/GitHub/Directbookinghealthscore`):

```bash
npm run dev       # Local dev server (port 3000 or 3001 if 3000 is busy)
npm run build     # Production build
npm run lint      # tsc --noEmit (TypeScript type-check)
```

There is **no `npm run deploy`** — Amplify auto-deploys on push to `main`.

---

## API Key

The Gemini API key is read **server-side only** as `process.env.GEMINI_API_KEY`. It must be set in:

- **Local dev:** `.env.local` in the project root (gitignored — never commit)
- **Production (Amplify):** App settings → Environment variables → `GEMINI_API_KEY` (no `NEXT_PUBLIC_` prefix; that would expose it to the browser)

The key is referenced only inside `services/geminiService.ts`, which has `import 'server-only'` at line 1 — Next.js will hard-fail the build if any client component imports this file.

---

## What NOT to Touch Without Good Reason

- The `'server-only'` import in `services/geminiService.ts` — removing it can leak the API key to the browser bundle
- The `runtime = 'nodejs'` directive in `app/api/*/route.ts` — needed because `@google/genai` doesn't support edge runtime
- The CDN script tags for html2canvas/jsPDF/html2pdf in `app/layout.tsx` — removing them breaks PDF export
- The Gemini model name (`gemini-3-flash-preview`) — only change if explicitly asked
- The `.env.local` file — never commit
- `lib/i18n.ts` constants (LOCALES, LOCALIZED_LOCALES) — adding/removing a locale touches every translation map

---

## Bookassist Brand Context

- "Direct booking" (not "direct reservation")
- "OTA" (Online Travel Agency) — always capitalised
- "CPA" (Cost Per Acquisition) — always capitalised
- "Health Score" — capitalised when referring to the tool's output
- Tone: professional, clinical, data-driven. The tool is positioned as a diagnostic instrument.

Brand assets and full style guide: https://github.com/BookassistMarketing/Bookassist-Brand

---

## Deployment Notes

- Push to `main` → Amplify rebuilds → live in 3-5 minutes
- Verify after deploy: switch through all 7 languages on the home page and check `/ai-visibility-audit` returns a real Gemini report (requires `GEMINI_API_KEY` set in Amplify)
- The `dist/` and `.next/` folders are build output — never edit directly; both gitignored
