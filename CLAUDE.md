# Direct Booking Health Score — Claude Code Briefing

This file is automatically loaded by Claude Code at the start of every session. It provides full context about this project so you do not need to be reminded of the structure, stack, or rules.

---

## What This Project Is

The Direct Booking Health Score is a hotel technology and marketing audit tool built for Bookassist. It presents hoteliers with a structured questionnaire, analyses their answers using Google Gemini AI, and generates a scored health report that identifies revenue leakage and recommends improvements to their direct booking strategy.

It is deployed as a public website at: https://directbookinghealthscore.com
It is hosted on GitHub Pages and deployed via the `npm run deploy` command.

---

## Tech Stack

- **Framework:** React 19 with TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS 4
- **AI:** Google Gemini API (`@google/genai`) — Gemini Flash model
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion (`motion/react`)
- **PDF Export:** html2canvas + jsPDF loaded via CDN in `index.html`
- **Deployment:** gh-pages (`npm run deploy`)

---

## Application State Machine

The app moves through exactly four states in sequence. This is defined in `types.ts` and managed in `App.tsx`:

```
WELCOME → QUIZ → ANALYZING → RESULTS
```

- **WELCOME** — Landing page, language selector, start button
- **QUIZ** — Multi-step questionnaire across categories
- **ANALYZING** — Loading screen while Gemini processes answers
- **RESULTS** — Scored health report with AI recommendations and PDF export

---

## Key Files — What Each One Does

| File | Purpose |
|---|---|
| `constants.ts` | All quiz questions, answer options, category configs, and all translations (EN/IT/ES). This is the primary file for content changes. |
| `types.ts` | Core TypeScript types: `AppState`, `Language`, `Question`, `Answer`, `AnalysisResult` |
| `App.tsx` | Top-level component. Manages app state transitions, header, and navigation between states |
| `services/geminiService.ts` | Google Gemini API integration. Builds the prompt, calls the API, parses the response |
| `contexts/ContentContext.tsx` | Global React Context for language and content state |
| `index.html` | Entry point. Contains CDN scripts for html2canvas and jsPDF — do not remove these |
| `vite.config.ts` | Vite build config. Sets the correct base path for GitHub Pages deployment |
| `components/` | All UI components — quiz steps, results display, score cards, PDF export button |

---

## Multi-Language Rules

This project supports three languages: **English (EN)**, **Italian (IT)**, and **Spanish (ES)**.

**Every content change must be made in all three languages.** Never update English copy without also updating the Italian and Spanish equivalents. All translations live in `constants.ts`.

If a user asks to add or edit a question, heading, label, or any visible text — always update all three language versions in the same change.

---

## Commands

Run these from the project root (`~/Documents/GitHub/Directbookinghealthscore`):

```bash
npm run dev       # Start local dev server at http://localhost:3000 — use this to preview changes
npm run build     # Build for production (outputs to dist/)
npm run lint      # TypeScript type-check — run this to catch errors before deploying
npm run deploy    # Deploy to GitHub Pages (makes changes live on the website)
```

---

## API Key

The Gemini API key is read from environment variables in this priority order:
`VITE_GEMINI_API_KEY` → `GEMINI_API_KEY` → `VITE_API_KEY` → `API_KEY`

It is stored in a `.env` file in the project root which is not committed to GitHub. Do not hardcode the API key anywhere in the source files.

---

## What NOT to Touch Without Good Reason

- The CDN script tags in `index.html` (html2canvas and jsPDF) — removing these will break PDF export
- The base path configuration in `vite.config.ts` — changing this will break the GitHub Pages deployment
- The Gemini model name in `services/geminiService.ts` — only change if explicitly asked to upgrade the model
- The `.env` file — never commit this to GitHub

---

## Bookassist Brand Context

This tool is built for Bookassist. Key brand terms to use consistently:

- "Direct booking" (not "direct reservation")
- "OTA" (Online Travel Agency) — always capitalised
- "CPA" (Cost Per Acquisition) — always capitalised
- "Health Score" — capitalised when referring to the tool's output
- Tone: professional, clinical, data-driven. The tool is positioned as a diagnostic instrument.

---

## Deployment Notes

- Changes are not live until `npm run deploy` is run OR until pushed to main and GitHub Pages rebuilds
- After deploying, allow 1–3 minutes for changes to appear live on the website
- The `dist/` folder is the built output — never edit files inside `dist/` directly
