# Handoff — Direct Booking Health Score

Single rolling handoff for the project. Newest session at the top. Older sessions kept verbatim for context and to preserve "why we did X" when reading the codebase later.

---

# 25 June 2026 — Mobile pass: compact figures, hamburger redesign, horizontal-overflow fix, Simulator label localised

Working session driven by Des O'Mahony's mobile feedback on the Revenue Simulator (screenshot:
truncated euro figures) plus the user's note that the mobile layout was "not great" and the
revenue calculator felt "missing". One commit landed on `main` and deployed to Amplify.

## 1. Revenue Simulator — compact k/m figures (Des's asks)

Des: "a few number glitches on mobile" + "maybe switch to k rather than '000s". Both were the
same root issue — the result tiles are locked to `grid-cols-3` on every breakpoint with
`text-xl` figures, so `+€180,000` could not fit in a third-of-a-phone-width tile and clipped.

- `components/RevenueSimulator.tsx` — added a `compactNum` helper and repointed the existing
  `fmtEUR` / `fmtSignedEUR` at it (names kept, so every call site became compact automatically):
  `130500 → €131k`, `180000 → €180k`, `28000 → €28k`, `5000000 → €5m`. Uses the U+2212 minus for
  negatives (no-hyphen rule). The "on €X gross" subtitle now uses `compactNum(gross)`. The Total
  online revenue **input** stays a raw editable number.
- Result tiles made mobile-safe: `grid-cols-3 gap-2 sm:gap-3`, `p-3 sm:p-4`, `min-w-0`, figures
  `text-base sm:text-xl whitespace-nowrap` so `+€` can never wrap to its own line.

## 2. Mobile hamburger menu — rebuilt twice

First pass fixed the user's structural asks; second pass filled it out (it looked empty).

- Security & Privacy **removed** from the menu (it lives in the footer; reachable by scrolling).
- Language moved to the **bottom** as a native `<select>` dropdown, replacing the 7-button grid
  that was overflowing on the right.
- Tools are now **descriptive cards** (icon in a `bg-white/20` square + name + the translated
  one-line description that already lived in `headerLabels`), left-aligned, solid brand colour.
- New **quick-links row**: Blog · Security · Contact (Security → `/security`, Contact → book-a-demo).
- New outlined **Book a Demo** CTA (outlined so it doesn't clash with the blue Hotel Tech Audit
  card), then the language dropdown — both pinned to the bottom with `mt-auto` + `min-h-full`.
- Added two new translated label keys to `headerLabels` (all 7 langs): `security`, `bookDemo`
  (bookDemo reuses the Revenue Simulator wording).

## 3. App-wide horizontal-overflow fix (the real menu-overflow cause)

The hamburger tool buttons kept spilling past the panel's right edge. Root cause was **not** the
menu — it was app-wide horizontal overflow (the home hero glow is `140vw`, `Home.tsx:89`). On
mobile that widens the *layout viewport*, and a `position: fixed` element sized with `inset-x-0`
stretches to that wider layout viewport, rendering wider than the visible screen.

Fix: `overflow-x-clip` on the AppShell root div (`components/AppShell.tsx`). `overflow-x-clip`
clips without establishing a scroll container, so it does **not** break the `sticky` header or
clip the `fixed` menu. This snaps the layout viewport back to the visible width — fixing the menu
buttons **and** removing any sideways scroll site-wide.

## 4. Home hero — Revenue Simulator CTA mobile-only

User: don't want the Revenue Simulator button on the **desktop** homepage (header pills already
cover it). Added a third coral CTA in the hero (`components/Home.tsx`) gated `sm:hidden` — shows
on mobile only; desktop keeps the two audit CTAs. Added a `cta3` label to all 7 `labelsMap` entries.

## 5. "Simulator" localised (Revenue stays English)

User rule: keep "Revenue" English, translate "Simulator". Applied consistently across header pills,
mobile menu (`headerLabels.revenueSimulator`), home hero `cta3`, and the simulator page eyebrow
(`RevenueSimulator.tsx` `LABELS[*].eyebrow`):

| EN | IT | ES | PL | FR | DE | CS |
|---|---|---|---|---|---|---|
| Revenue Simulator | Revenue Simulatore | Revenue Simulador | Revenue Symulator | Revenue Simulateur | Revenue Simulator | Revenue Simulátor |

(DE "Simulator" is identical spelling, so unchanged.)

## State at end of session

- Commit `04cebc2` pushed to `main`; Amplify rebuild triggered. Verified on localhost + emulated
  375px mobile (tsc clean, no clipping, no horizontal scroll, menu buttons fit). **Not yet checked
  on a real device or confirmed Amplify went green.**

## Open / carry-over

1. **Real-device check** of the menu + simulator figures in a couple of languages after deploy.
2. **Translation QA** — the new `security` / `bookDemo` strings and the "Simulator" forms are
   Claude-translated, not native-reviewed (same caveat as the rest of the simulator copy).
3. **`previews/` still uncommitted** — `what-if-direct-revenue.html`, `cpa-dashboard.html`,
   `header-options.html`, `header-option-b.html`. Decide commit-as-artefacts vs gitignore.

## Files touched

```
M  components/RevenueSimulator.tsx   — compactNum + fmtEUR repoint, mobile tiles, eyebrow localised
M  components/AppShell.tsx           — menu rebuild, overflow-x-clip, security/bookDemo labels, Simulator localised
M  components/Home.tsx               — mobile-only Revenue Simulator hero CTA, cta3 labels, Simulator localised
```

---

# 24 June 2026 — Header redesign implemented & iterated, Revenue Simulator polished + fully localised, heartbeat auto-align

Working session continuing from the 23 June handoff. Five commits landed on `main` across two pushes, all deployed to Amplify. Picked up the open "implement Option B header" item — the header then evolved well beyond the original Option B spec through live iteration with the user.

## 1. Revenue Simulator alignment fixes (commit `b7cc095`)

- The two-card panel forced both cards to equal height (grid stretch), leaving a dead gap at the bottom of the shorter "Hotel inputs" card. Fixed with `lg:items-start` so the inputs card hugs its content.
- In the dark headline card, `+€130,500` was wrapping (the `+` dropped to its own line) so the two big figures didn't share a baseline. Headline figures dropped to `text-3xl sm:text-4xl` + `whitespace-nowrap tracking-tight` so both stay on one line.

## 2. Middleware redirect-loop fix (commit `9406b74`) — was a live production bug

A non-English-locale browser visiting `/revenue-simulator` hit `ERR_TOO_MANY_REDIRECTS`: the Accept-Language/cookie rule redirected `/revenue-simulator → /<locale>/revenue-simulator`, and the English-only strip rule redirected it straight back. Reproduced with curl (both legs 307). Fixed at the time by exempting `/revenue-simulator` from locale-prefixing (like `/staff`). **This exemption was later removed in §5** when the page became fully localised — the page now routes normally.

## 3. Header redesign — implemented, then heavily reworked (commit `83645c2`)

Started from the approved Option B (two-row, coloured pills) but the user iterated live to a different final shape. **What is live now:**

- **Single-row header.** Left: logo + "Hotel Health Clinic / Powered by Bookassist", with a **Home** button and **Blog** beside it (ghost pills — `rounded-full`, gray-700 semibold, hover/active light-blue background). Right: the three tool pills + the language switcher.
- **Tool pills are solid brand colours on every page** (the user explicitly wanted "active colours for all of them on the homepage"):
  - Hotel Tech Audit → `bg-brand-blue`
  - AI Visibility Audit → `bg-brand-success`
  - Revenue Simulator → `bg-brand-accent` (coral red `#E63946`) — **NOT yellow**; the user rejected the brand-yellow from the Option B spec. (`brand-yellow` token was added then removed; net no change to `index.css`.)
  - The current page's pill gets `ring-2 ring-offset-2` + a white dot.
- **Hover preview cards** on each tool pill: fade + slide-in card with the tool's coloured icon + a one-line description, translated into all 7 languages (added to the `headerLabels` map in `AppShell.tsx`).
- **Language switcher** was moved to the footer briefly, then back to the header top-right per the user. Home + Contact removed from the right side; Contact Us removed from the header entirely (still in footer). Mobile hamburger updated to match.

The `previews/header-options.html` + `header-option-b.html` mocks from 23 June drove the initial pick; the final implementation diverges from them — treat `AppShell.tsx` as the source of truth, not those mocks.

## 4. Hero heartbeat auto-aligns to the title (commit `0b1c67f`)

The ECG line used hardcoded per-locale baseline y-values (`en:215, it:183, es:194`; `pl/fr/de/cs` all defaulted to `230` and were never tuned), so it was misaligned in most languages. Replaced with live measurement: a `useEffect` in `Home.tsx` measures the title's actual bottom edge (via a wrapper ref) relative to the heartbeat overlay box, converts to the 0–400 viewBox scale, and feeds it to `<Heartbeat baseline={…} />`. Re-measures via `ResizeObserver` + resize listener + on language change. The old per-locale numbers remain only as a first-paint fallback. Self-corrects at every language and width now.

## 5. Revenue Simulator fully localised into all 7 languages (commit `0b82a3e`)

The simulator was English-only; now localised like every other page.

- **`components/RevenueSimulator.tsx`** — all ~30 UI strings moved into a `Record<Language, RSLabels>` map (en/it/es/pl/fr/de/cs). Interpolated sentences (the CPA "X pts below/above … the 13% industry target" badge, "Shifting X% → Y% direct on €Z gross", the benchmark line, the Now/After mix labels) are small functions on the label object so word order stays natural per language. Reads `language` from `useContent()`.
- **`app/[lang]/revenue-simulator/page.tsx`** — NEW localized route mirroring `hotel-audit`: translated SEO title/description, `canonicalFor` + `buildHreflang`, JSON-LD.
- **`app/revenue-simulator/page.tsx`** — English route now emits hreflang for all locales (was en/x-default only) + JSON-LD.
- **`middleware.ts`** — removed BOTH the `/<locale>/revenue-simulator → /revenue-simulator` strip rule AND the §2 loop-exemption. French browser now resolves `/revenue-simulator → /fr/revenue-simulator → 200`, no loop.
- **`app/sitemap.ts`** — `/revenue-simulator` moved from `englishOnlyEntries` (deleted) into the per-locale `staticPages`; emits one URL per locale with hreflang.

Verified: `tsc` clean, all 7 localized routes 200, French redirect loop-free.

## Open at end of session

1. **Translation QA** — the Revenue Simulator copy (7 languages) AND the header tool-description tooltips (7 languages) are AI-produced in the app's style, not native-reviewed. Worth a read-through; same caveat as the blog posts and demo reports.
2. **`previews/` still uncommitted** — `what-if-direct-revenue.html`, `cpa-dashboard.html`, `header-options.html`, `header-option-b.html`. The header mocks are now superseded by the live `AppShell.tsx`. Still a decision: commit as design artefacts or gitignore.
3. **Local-only permission** — added `PowerShell(curl.exe *)` to `.claude/settings.local.json` (gitignored) so localhost status checks stop prompting. Personal to this machine, not in git.

## Commits (chronological)

```
9406b74  fix: stop /revenue-simulator redirect loop for non-English locales
b7cc095  fix: align Revenue Simulator input card and headline figures
83645c2  feat: redesign header nav with tool pills and hover previews
0b1c67f  fix: auto-align hero heartbeat to the title in every language
0b82a3e  feat: localize the Revenue Simulator into all 7 languages
```

## Files touched this session

```
M  components/RevenueSimulator.tsx       — alignment fixes + full 7-language labels map
M  components/AppShell.tsx               — header redesign, tool pills, hover previews, ghost nav, 7-lang descriptions
M  components/Home.tsx                   — heartbeat auto-align (measure title, ResizeObserver)
M  middleware.ts                         — removed simulator redirect + exemption
M  app/revenue-simulator/page.tsx        — hreflang for all locales + JSON-LD
A  app/[lang]/revenue-simulator/page.tsx — new localized route
M  app/sitemap.ts                        — revenue-simulator now per-locale
```

---

# 23 June 2026 — English-leak prompt fix, Revenue Simulator shipped & iterated, header redesign in flight

Working session. Two commits landed on `main` and deployed to Amplify; a third piece of work (header redesign) is approved but not yet implemented — paused mid-session.

## 1. Localised AI audit reports were leaking English chrome (FIXED)

While running a full smoke test of the site (all 7 locales × 5 pages + sitemap + robots + staff = 45 URLs, all 200, hreflang 8 per page), the API smoke test caught a real bug.

**Scope of the leak (tested against `hotel-lesmouettes.com/fr/index.html` in all 7 langs):**

| Locale | Before | Score (before) |
|---|---|---|
| FR | 5/5 English markers leaked (H1 + every label) | 70 |
| ES | 3/5 leaked (`Overall score:`, `URL analysed:`, `## What we observed`) | 67 |
| PL | 3/5 leaked (same as ES) | 77 |
| CS | 2/5 leaked (`URL analysed:`, `## What we observed`) | 67 |
| IT | clean | 68 |
| DE | clean | 66 |
| EN | n/a (baseline) | 70 |

**Root cause:** the 22 June `temperature: 0` + `topP: 0.1` pin made Gemini extremely deterministic. The `AI_READINESS_SYSTEM_PROMPT` had two competing instructions — a `REQUIRED OUTPUT STRUCTURE` section that quoted English example strings (`# AI Visibility & Optimisation Summary`, `Overall score:`, `## What we observed`, etc.) AND a separate `OUTPUT LANGUAGE` block telling the model to translate everything. At the old default temperature (~1.0) Gemini followed the translation instruction; at `temperature: 0` it reproduced the English example strings verbatim. The 19 June fix that "localised the chrome" had only been tested in Spanish, before the 22 June temperature pin existed.

**Fix (commit `5b2c094`):**

- New `REPORT_LABELS: Record<Language, ...>` map in `services/geminiService.ts` — pre-computed H1, H2s, inline labels, tier names, table column headers, and refusal notes for every locale.
- Prompt rewritten to inline the actual target-language strings (`# ${L.reportTitle}`, `## ${L.h2WhatWeObserved}`, `${L.tableCategoryRow}`, etc.) and explicitly instruct Gemini to emit those strings VERBATIM as fixed text. English no longer appears in the prompt for non-English locales — there's nothing for the model to leak.
- `looksLikeAiReadinessReport` shape validator in `lib/api-security.ts` updated. Marker 1 was hard-coded to match the English H1 ("ai visibility … optimisation summary") and would have rejected every non-English report as INVALID. Now matches a multilingual root regex `(visibili|widoczn|sichtbar|viditelnost|optim)` against the first `#` line. Marker 2 gained "score" to catch FR "Score global".

**Verification (post-deploy):**

| Locale | After | Score (after) |
|---|---|---|
| FR | **0/6 leaks** ✅ | 70 |
| ES | **0/6 leaks** ✅ | 69 |
| PL | **0/6 leaks** ✅ | 70 |
| IT | **0/6 leaks** ✅ | 68 |
| DE | **0/6 leaks** ✅ | 68 |
| CS | not tested — Gemini timed out twice at the 20s budget. Validator keywords (`viditelnost`, `celkové`) are in place so it'll pass when CS does land. | — |

**Bonus:** score spread across languages on the same hotel collapsed from **11 points (66-77 before)** to **2 points (68-70 after)**. Removing the English bait from the prompt also tightened cross-language scoring variance.

## 2. Revenue Simulator shipped at `/revenue-simulator` (English-only)

New free tool for sales reps to use live in prospect meetings. Source supplied by a colleague (live at `bookassist.hotelwebsitedesign.com/`) — ported the calculator math verbatim, rebuilt the UI in the what-if-slider design language the user approved earlier in the session.

**Math (unchanged from source):**

```
directRev   = gross × directShare
otaRev      = gross × (1 - directShare)
mktSpend    = directRev × marketingReinvestment%
directCost  = directRev × directBookingCommission% + mktSpend + serviceFees
otaCost     = otaRev × otaCommission%
netRevenue  = gross − (directCost + otaCost)
totalCPA    = (directCost + otaCost) / gross × 100
```

**Inputs (live recalc on every change):** Total online revenue €, Current direct share (slider), and a collapsible "Channel economics" block with OTA commission %, Direct booking commission %, Marketing reinvestment %, Service fees €. Defaults are typical Bookassist-managed-client figures (€5M revenue, 40% direct, 18% / 2.15% / 2.8% commissions, €2,800 fees).

**Outputs:** Target direct share slider with industry-benchmark hint → big brand-blue→teal gradient card with the annual net revenue uplift → 3 stat tiles (New Total CPA with delta-vs-current pts badge, OTA commission saved, Direct marketing reinvested) → Now-vs-After mix bar → one-line industry-benchmark comparison at the 13% CPA standard → Book a Demo CTA.

**English-only treatment:** single canonical URL with no hreflang alternates; sitemap entry is unprefixed; new middleware rule redirects `/<locale>/revenue-simulator` → `/revenue-simulator` so a French visitor clicking the nav button still lands on the English page rather than 404. When localised, the redirect can be removed and the page moves under `app/[lang]/`.

**Files (commit `2f6bafd`):**

```
A  app/revenue-simulator/page.tsx        — server component, English-only metadata
A  components/RevenueSimulator.tsx       — client component, full state + calc
M  components/AppShell.tsx               — third nav CTA (outline-blue) on desktop + mobile
M  middleware.ts                         — /<locale>/revenue-simulator redirect
M  app/sitemap.ts                        — englishOnlyEntries array, single unprefixed URL
```

**Build verified locally:** `npm run build` exit 0, `/revenue-simulator` listed as static prerendered (3.5 kB, 106 kB first-load JS).

## 3. Header redesign — picked Option B with colour, NOT implemented yet

With three CTAs in the header (Hotel Tech Audit, AI Visibility Audit, Revenue Simulator), the bar started feeling crowded. Built `previews/header-options.html` with three layout options:

- **A** — single "Free Tools" mega-dropdown
- **B** — slim utility top row + a tools-strip second row with pill buttons
- **C** — compact icon-text pills inline

User picked **B with each tool keeping its identifying colour**, then approved the coloured-pill mockup at `previews/header-option-b.html`.

**The treatment to implement:**

| Tool | Active state | Inactive state |
|---|---|---|
| Hotel Tech Audit | `bg-brand-blue text-white` + small white dot | `bg-brand-blue/10 text-brand-blue` |
| AI Visibility Audit | `bg-brand-success text-white` + small white dot | `bg-brand-success/10 text-brand-success` |
| Revenue Simulator | `bg-brand-yellow text-brand-blue` + brand-blue dot | tinted yellow (`rgba(248, 207, 86, 0.25)`) + brand-blue text |

Hover on any inactive pill = flip to its solid colour. The top row keeps logo, Blog, Contact, language switcher only. The tools strip lives on a brand-light band beneath the top row, horizontal-scrolls on mobile so it never wraps, with a small "Free Tools" eyebrow label on desktop.

**Why brand-yellow for Revenue Simulator:** already in the project palette (`#F8CF56` from `globals.css`), reads well for a "money/calculator" tool, and gives the third pill its own identity instead of being a colourless outline button.

## 4. Revenue Simulator iterated on Michael O'Toole feedback

Michael reviewed the just-shipped simulator and replied:

> "Very focused on direct share, whereas I'd prefer to highlight total CPA more, based against the CPA target of 13%. Industry bench for direct share also very high here, maybe a better target would be 40%+. That bottom right graph could maybe incorporate CPA analysis. But looks nice and quick and easy to use and understand for clients which is important."

**First pass (commit `2b8994a`):**

- Split the gradient hero card into a 50/50 grid — `New Total CPA: 10.24%` (with "X pts below/above the 13% industry target" line) on the left, `+€178,200 / year` net revenue uplift on the right, faint white divider between them. Both treated as headline metrics.
- Replaced the now-redundant "New Total CPA" stat tile with a `CPA vs current` delta tile (`−3.56 pts from 13.80%`). OTA-saved + marketing-reinvested tiles unchanged.
- Expanded the bottom mix block into "Booking mix & cost composition": under each Now/After mix bar, a second thinner stacked bar showed the cost breakdown (OTA commission `#64748B` / direct commission `brand-blue` / marketing `#F4A261` / service fees `#CBD5E1`), scaled to the larger of the two totals so the absolute cost reduction was visible. Added 4-swatch legend underneath and inline CPA + total cost on each row label.
- Industry-benchmark hint under the target slider changed from `~50–65%` → `40%+`.

**User reaction:** "it's a bit too complex for public audience."

**Trim (commit `4b6d00f`):**

- Dropped the stacked cost-composition bar, the 4-swatch legend, and the dense per-row labels.
- Restored the simple Now/After mix bars with just `33% direct · 67% OTA`-style labels.
- Reverted the `metrics()` function to its original return shape now that the per-cost breakdown isn't rendered.
- **Kept** from the first pass: split CPA-left / €-right hero, CPA-vs-current stat tile, 40%+ benchmark hint.

Final output panel on `/revenue-simulator`: split hero (CPA % left, € uplift right) → 3 stat tiles → simple Now/After mix bars → 13% benchmark line. Michael's primary asks (CPA prominence, 40%+ benchmark) preserved; the cost-composition piece that pushed it past "public audience" complexity was the casualty.

## 5. Open at end of session

1. **Implement Option B in `AppShell.tsx`.** Two-row header, coloured pills as specified above. The existing single-row code in `components/AppShell.tsx:130-211` (desktop) and `:225-296` (mobile) is what needs replacing. Mobile pattern likely keeps the hamburger drawer but lists the three coloured pills in a vertical stack inside it.

2. **CS chrome leak retest** — couldn't verify this morning because Gemini timed out at the 20s budget on both attempts. Worth a single retry to confirm the localised CS labels emit cleanly.

3. **Uncommitted preview HTML files** in `previews/` — none of them are in git yet (`what-if-direct-revenue.html`, `cpa-dashboard.html`, `header-options.html`, `header-option-b.html`). Decide whether to commit them as design artefacts under `previews/` or leave them gitignored.

4. **Pre-existing uncommitted deletions** (since before this session): `HANDOFF-2026-05-07.md`, `HANDOFF-2026-06-18.md`, `HANDOFF-2026-06-19.md` are deleted but not yet committed. Content is merged into this rolling HANDOFF.md. Safe to commit the deletions when convenient.

## Commits (chronological)

```
5b2c094  Embed localised AI audit report chrome in prompt to stop English leaks
2f6bafd  Add Direct Booking Revenue Simulator at /revenue-simulator
2b8994a  Reframe Revenue Simulator hero around Total CPA and add cost composition
4b6d00f  Trim Revenue Simulator back to a public-friendly density
```

## Files touched this session

```
M  services/geminiService.ts             — REPORT_LABELS map + prompt rewrite (commit 5b2c094)
M  lib/api-security.ts                   — shape validator multilingual regex
A  app/revenue-simulator/page.tsx        — new English-only route
A  components/RevenueSimulator.tsx       — new component; later iterated on Michael feedback (2b8994a, 4b6d00f)
M  components/AppShell.tsx               — third nav CTA (will be replaced by Option B)
M  middleware.ts                         — locale-prefixed simulator redirect
M  app/sitemap.ts                        — englishOnlyEntries
A  previews/what-if-direct-revenue.html  — earlier in session, not committed
A  previews/cpa-dashboard.html           — earlier in session, not committed
A  previews/header-options.html          — header design exploration, not committed
A  previews/header-option-b.html         — picked option with coloured pills, not committed
```

---

# 22 June 2026 — AI audit timeouts, scoring stability, server-side prefetch

Working session triggered by Cynthia reporting two bugs on the AI Visibility Audit: same URL giving different scores (73 vs 83 on `gavarni.com/fr/`), and the audit only succeeding "1 in 3" attempts. Shipped five commits across one afternoon. All on `main`, all deployed via Amplify.

## What landed on the live site

### 1. Deterministic scoring (commit `7c8b6fa`)

Both Gemini calls in `services/geminiService.ts` (`generateAiReadinessReport` and `generateStrategicAnalysis`) now pin `temperature: 0` + `topP: 0.1`. Previously they ran at the SDK default (~1.0), so the LLM resampled the category scores on every call — that was the 73↔83 spread. Still not perfectly identical (URL fetch content can vary slightly), but should be a 1–3 point band now instead of 10+.

### 2. Staff-only error diagnostics (commit `7c8b6fa`)

The visitor-facing French error pill is fully generic — every failure mode shows the same string, so we couldn't tell `INVALID_RESPONSE` from `UPSTREAM_ERROR` from `RATE_LIMITED`. `services/aiService.ts` now exports a new `ApiError` type with `status`, `code`, `requestId` extracted from the `/api/ai-audit` JSON body. In `components/AiAudit.tsx` a `[debug] status=X code=Y requestId=Z` line renders under the error pill **only when `staffRole !== null`**. Visitors still see only the localised generic message.

This was the diagnostic infrastructure that let us identify Bug 2.

### 3. Lambda timeout converted to clean error + staff throttle bypass (commit `d7828ef`)

Bug 2 root cause: Amplify Hosting caps Next.js SSR/API requests at **30 seconds**. Gemini's `urlContext` tool reliably took >25s on JS-heavy hotel sites; AWS killed the Lambda and CloudFront returned a mystery 504. From the visitor's POV: generic error pill.

`services/geminiService.ts` now races the Gemini call against a 20s budget (originally 25s, tightened in commit `8096768` to make room for the prefetch). If Gemini doesn't return, we throw `UPSTREAM_TIMEOUT` ourselves → API route returns clean 504 with known code → staff `[debug]` line shows it → visitor sees the generic message. Added `UPSTREAM_TIMEOUT` to `PublicErrorCode` and `sanitiseGeminiError`.

`app/api/ai-audit/route.ts` now reads `body.staffToken`, verifies via `verifyStaffToken`, and skips both the rate-limit check and the post-success cookie when valid. Internal QA can iterate without self-throttling. `services/aiService.ts` reads the localStorage token (`STAFF_TOKEN_KEY` from `lib/staffBypass.ts`) and includes it in the POST body.

Loading copy in all 7 languages appended a "may take up to 30 seconds — please don't refresh" sentence so visitors don't bail.

### 4. 28-second progress bar for non-staff (commit `6c33b56`)

In `components/AiAudit.tsx` loading view, a thin teal progress bar animates 0→95% over 28s via a single CSS keyframe (`auditProgress`). When the response lands the view unmounts and the bar disappears — the 95% cap means we never claim done before we actually are. Reframes the wait as intentional rather than broken. **Hidden for staff** so testing isn't artificially slowed.

### 5. Architecture change — server-side prefetch replaces `urlContext` (commit `8096768`)

The actual cure for the 504s, not the workaround. The `urlContext` tool was doing fetch + JS-parse + analysis in one round-trip; pre-fetching ourselves and handing Gemini a pre-extracted text blob means Gemini only scores (typically 3–8s instead of 20–30s).

New file `lib/sitePrefetch.ts`:

- 5-second fetch budget, 500KB byte cap, browser-style UA
- **Manual redirect handling with per-hop `validatePublicUrl` revalidation** — without this an attacker could submit a URL on a public domain that 302s to `http://169.254.169.254/` (AWS instance metadata) and we'd happily fetch it server-side (classic SSRF)
- Extracts: title, canonical, meta tags, JSON-LD blocks (preserved BEFORE script stripping), H1/H2/H3 headings, link texts, alt-text counts and samples, plain body text (capped 30k chars)
- Returns a structured blob keyed by section

`generateAiReadinessReport` now: prefetch → throws `URL_FETCH_TIMEOUT` / `URL_FETCH_FAILED` / `URL_NOT_HTML` on failure → otherwise Gemini scoring (no tools, just text). System prompt rewritten — model no longer "fetches", it analyses the EXTRACTED PAGE CONTENT block.

### 6. Score donut card in the public preview (commit `f2ba8f4`)

The public's `view === 'preview'` only showed a blurred markdown teaser — visitors had to fill in the form before they ever saw their score. Staff `view === 'done'` showed a tinted score donut + tier badge as the headline. Asymmetric and a weak lead-gen tease.

Extracted the score card JSX into a single `scoreCardElement` const in `components/AiAudit.tsx` and mounted it in both views. Visitors now see "78 / 100 — Near AI-ready" inside the gate, which is the kind of teaser that converts.

(The Tech Audit was already showing the score donut to both staff and public — no change needed there.)

## Operational change — two-GitHub-account fix

This machine had `fabienc-net` (no `BookassistMarketing` write access) cached in Windows Credential Manager, blocking every push from this session. Fix: changed `origin` remote to `https://BookassistMarketing@github.com/BookassistMarketing/Directbookinghealthscore.git` so the credential is keyed per-user. Fine-grained PAT generated against the BookassistMarketing account (Contents: Read & write on this repo only), entered into the Windows credential popup once. Future sessions in this repo push autonomously. Personal `fabienc-net` cred stays cached for `personal-cv-site` etc. — no collision.

## State at end of session

| Fix | Pushed | Amplify deployed | User verified |
|---|---|---|---|
| `temperature: 0` scoring | ✅ | ✅ | ❌ — not yet retested for tight band |
| Staff `[debug]` line | ✅ | ✅ | Indirectly (DevTools console showed `UPSTREAM_TIMEOUT`) |
| 25s/20s `UPSTREAM_TIMEOUT` race | ✅ | ✅ | ✅ — confirmed `code=UPSTREAM_TIMEOUT, status=504` reproducibly |
| Staff throttle bypass | ✅ | ✅ | ❌ |
| 28s progress bar | ✅ | ✅ | ❌ |
| Server-side prefetch | ✅ | ✅ (last push) | ❌ — deploy was minutes before session end |
| Score donut in preview | ✅ | ✅ (last push) | ❌ |

## Open items / what to check first next session

1. **Confirm `gavarni.com/fr/` now succeeds reliably** with the prefetch architecture. Pre-prefetch it was timing out at 25s every time. Post-prefetch should be 5–10s end-to-end. If it still times out, the next move is to look at whether the URL itself is slow to fetch (5s budget might be too tight) or whether Gemini is choking on the extracted content.

2. **Score sanity check.** We swapped the analysis input from "Gemini's own crawl" to "our extracted text blob". Reports may now reference different things or score differently than the urlContext-era. Skim a report and confirm the "What we observed" paragraph references things actually on the page.

3. **Edge cases worth poking at:**
   - 404 URL → expect `code=URL_FETCH_FAILED`
   - PDF link → expect `code=URL_NOT_HTML`
   - Pure-SPA hotel site (rare but exists) → prefetch will return mostly empty body text → Gemini will score poorly. If this becomes a real complaint, the mitigation is to re-add `urlContext` as a fallback when prefetch returns thin content.

4. **Cynthia.** She raised the original report. A short message confirming "deployed; please retry and let me know" would close the loop.

## Files touched

| File | Why |
|---|---|
| `services/geminiService.ts` | temperature pinning, `withTimeout` helper, `UPSTREAM_TIMEOUT_MS`, prefetch call, prompt rewrite |
| `services/aiService.ts` | new `ApiError` type, staff token in POST body |
| `lib/api-security.ts` | new error codes `UPSTREAM_TIMEOUT` + `URL_FETCH_*`, sanitiser branches |
| `lib/sitePrefetch.ts` | **new** — server-side fetch + extraction with SSRF-safe redirect handling |
| `app/api/ai-audit/route.ts` | staff token verification, conditional rate-limit + cookie |
| `components/AiAudit.tsx` | `[debug]` line, progress bar, 30s loading copy in 7 langs, `scoreCardElement` extracted and mounted in both views |

## Commits (chronological)

```
7c8b6fa  Stabilise AI audit scores and add staff-only error diagnostics
d7828ef  Convert AI audit Lambda timeouts to clean errors and exempt staff from throttle
6c33b56  Add non-staff 28s progress bar on AI audit loading screen
8096768  Replace Gemini urlContext with server-side prefetch to fix audit timeouts
f2ba8f4  Show score donut card in the public preview, not just the staff full report
```

---

# 19 June 2026 — Unified audit layout, blog scheduling, staff badge, report language picker

Single working session that touched both audit tools, both PDF exports, the blog scheduling pipeline, and shipped five blog posts. All work merged to `main` and deployed via Amplify across four pushes.

## What landed on the live site

### Both audits now share one results layout

The Hotel Tech Audit results page was a different layout (white score card, big "Status: Critical" headline, brand-blue AI assessment card). It now mirrors the AI Visibility Audit done-view exactly:

- Eyebrow badge → heading → site URL header
- Tinted donut score card (background tinted with the tier colour)
- White markdown article body
- "Book a Demo" CTA card at the bottom (hidden in staff bypass mode)

The intermediate SCORE reveal screen was removed — quiz completion now jumps straight to the results page (`AppState.SCORE` is still in the enum as inert).

### Each audit has its own theme colour

Carried through end-to-end on both screen and PDF:

- **Hotel Tech Audit** → `brand-blue` `#003366` (matches its nav button)
- **AI Visibility Audit** → `brand-success` `#2A9D8F` teal (matches its nav button)

Theme covers the eyebrow badge, markdown H2 headings, table headers, Download PDF button, Book a Demo CTA card. Score-tier colours (red/amber/orange/teal) are unchanged so the score signal stays consistent across both audits. The PDF letterhead (heartbeat icon + "Hotel Health Clinic" wordmark) stays brand-blue on both — it's the umbrella mark.

### Both PDFs rebuilt around a common flow

- Page-1 letterhead — heartbeat icon left + "Hotel Health Clinic / Powered by Bookassist" + Bookassist wordmark right. Whole letterhead is a clickable PDF link annotation pointing at https://bookassist.com.
- White page background so per-block content reads as one continuous body.
- Tier-colour-tinted score card.
- Per-block capture with "keep with next" so heading paragraphs no longer orphan from their tables.
- `html2canvas-pro` for Tailwind v4 oklch support (Tech Audit was silently print-fallbacking on some properties before).
- Book a Demo CTA card is now a clickable region in the PDF — opens https://bookassist.com/book-a-demo.

### Blog scheduling pipeline

`lib/blog.ts` now exposes an `isPublished(dateStr)` helper that filters posts whose front-matter `date` is in the future. Used by `getAllPosts` (list filter) and `getAllPostSlugs` (sitemap + static params). `getPostContent` is intentionally not gated so a future post is still reachable by direct URL for preview.

Home, blog list, locale variants, and the sitemap declare `export const revalidate = 3600` — ISR regenerates within an hour of UTC midnight on the publish date. No fresh Amplify build needed.

Development always returns `true` from `isPublished` so future posts are previewable with `npm run dev`.

### Five blog posts shipped

| Date | Slug | Bookassist angle | Status |
|---|---|---|---|
| 2026-06-19 | how-ai-search-is-rewriting-hotel-discovery | Digital Media / GEO | Live |
| 2026-06-22 | the-18-percent-shift-direct-booking | Booking Platform | Scheduled |
| 2026-06-29 | why-hotel-metasearch-campaigns-lose-money | Digital Media / Metasearch | Scheduled |
| 2026-07-06 | your-hotel-website-has-2-7-seconds | Web Design / Core Web Vitals | Scheduled |
| 2026-07-13 | first-party-data-is-the-new-loyalty | Bookassist Intelligence / CRM | Scheduled |

All five posts in all seven languages (en, it, es, pl, fr, de, cs) — 35 markdown files total. Hero images sourced from standard `images.unsplash.com` (free for commercial use, attribution as courtesy).

### Other items

- `public/Bookassist - Logo.png` added — both PDF letterheads preload it with a graceful logo-less fallback.
- Tech Audit dev-preview shortcut at `/hotel-audit` (skip the 15-question quiz and load fixture answers + sample analysis straight into the results view). Gated by `process.env.NODE_ENV !== 'production'`. Mirrors the AI Audit's existing "Preview end page" link.

### Staff badge unified across pages

The "Bookassist Staff Mode" / "Signed in as Bookassist staff" pill was inconsistent across the three pages it appears on, never indicated which role had signed in (staff vs marketing — the latter unlocks the sample-report preview on the AI Audit), and didn't expose a sign-out control from the audit pages. New shared `components/StaffBadge.tsx`:

- **Staff role** — yellow pill, ShieldCheck icon, "Signed in as Bookassist staff".
- **Marketing role** — brand-blue pill, BadgeCheck icon, "Signed in as Bookassist marketing".
- Always renders a "Sign out" link next to the pill — works on `/staff`, AI Audit, and Tech Audit alike.

`/api/staff/auth` already returned `role` in the sign-in response; the staff hub now actually captures it (previously discarded). `checkStaffBypass` is unchanged.

## Files touched

```
M  app/[lang]/blog/page.tsx
M  app/[lang]/page.tsx
M  app/blog/page.tsx
M  app/page.tsx
M  app/sitemap.ts
M  app/staff/StaffHub.tsx
M  components/AiAudit.tsx
M  components/AuditTool.tsx
M  components/FullResults.tsx        (full rewrite)
M  lib/blog.ts
M  services/geminiService.ts
A  components/StaffBadge.tsx
A  public/Bookassist - Logo.png
A  blog/2026-06-19-how-ai-search-is-rewriting-hotel-discovery.{md,it.md,es.md,pl.md,fr.md,de.md,cs.md}
A  blog/2026-06-22-the-18-percent-shift-direct-booking.{md,it.md,es.md,pl.md,fr.md,de.md,cs.md}
A  blog/2026-06-29-why-hotel-metasearch-campaigns-lose-money.{md,it.md,es.md,pl.md,fr.md,de.md,cs.md}
A  blog/2026-07-06-your-hotel-website-has-2-7-seconds.{md,it.md,es.md,pl.md,fr.md,de.md,cs.md}
A  blog/2026-07-13-first-party-data-is-the-new-loyalty.{md,it.md,es.md,pl.md,fr.md,de.md,cs.md}
```

`components/Results.tsx` is on disk but no longer imported anywhere — safe to delete in a follow-up cleanup.

## Afternoon addendum — staff-only report language picker

Five further commits landed after the morning summary above.

### Per-audit report language picker (staff only)

Bookassist staff can now generate the AI Visibility Audit and Hotel Tech Audit reports — and their PDF exports — in any of the 7 supported languages, independent of the UI locale they're browsing. Lets staff on the English UI audit an Italian hotel and hand the hotelier a fully Italian PDF without leaving English.

- **AI Visibility Audit** (`components/AiAudit.tsx`) — picker appears above the URL field on the idle view, gated by `isStaffBypass`. A new `reportLang` state defaults to the URL locale at mount and persists across audits in the same session.
- **Hotel Tech Audit** (`components/AuditTool.tsx`) — picker appears below the WelcomeScreen / above the demo button, same gate. Plumbs `reportLang` into `generateStrategicAnalysis()` and into a new `reportLang?: Language` prop on `<FullResults>`.
- **FullResults** (`components/FullResults.tsx`) — chrome labels (eyebrow, "Your Tech Audit Report", tier names, Download PDF / Retake) now resolve via `labelLang = reportLang ?? language`, so a staff-generated Spanish report renders with Spanish chrome on screen and in the captured PDF. No effect for public visitors.

The 7-language report-picker label ("Generate report in" / "Generar informe en" / …) is duplicated as a small map in each component — small enough to keep inline rather than extracting.

### Report content fully localised

The AI Visibility Audit was rendering English inline labels ("Overall score", "URL analysed", "What we observed", "Weighted scoring breakdown", "Projected Score After Fixes", tier names, table column headers) even when Gemini was asked for Spanish output. The OUTPUT LANGUAGE block in `services/geminiService.ts → AI_READINESS_SYSTEM_PROMPT` is now an explicit enumerated list (H1, H2s, inline labels, tier names, table columns, all paragraph copy) so Gemini stops leaking English. Tested with Spanish; reads cleanly end-to-end now.

Also added two new chrome strings (`downloadPdf`, `exporting`) to AiAudit's 7-locale `labelsMap` — the "Download PDF" button was previously hard-coded English.

### Marketing-only "Preview end page" demos now multilingual

The demo buttons that let marketing iterate on rendering without burning Gemini credits used to load a hardcoded English markdown blob. Both demos now serve a 7-locale variant driven by the picker:

- `lib/aiAuditDemoReport.ts` — 7 markdown variants of the AI Readiness Report, used by the AI Audit's "Preview end page" link.
- `lib/techAuditDemoAnalysis.ts` — 7 markdown variants of the Tech Audit strategic analysis, used by the Tech Audit's "Preview full results" link.

The Tech Audit's demo button was also re-gated from `IS_DEV_PREVIEW` (dev-only) to `isMarketing || IS_DEV_PREVIEW`, matching the AI Audit. Marketing can now preview both flows in production.

### `/<locale>/staff` → `/staff`

`middleware.ts` now 307-redirects any `/it/staff`, `/es/staff`, `/pl/staff`, `/fr/staff`, `/de/staff`, `/cs/staff` (and any `…/staff/anything` path under them) to the canonical `/staff`. Previously these returned a Next.js 404 because there's no `app/[lang]/staff/page.tsx`. Now that the audits handle per-report language via the picker, there's no reason for staff to land on a locale-prefixed staff URL — sign in once, pick language per audit.

The redirect rule runs **before** the "skip if already on locale-prefixed path" early return — order matters.

### Afternoon commits

```
c3e87cc Redirect /<locale>/staff to /staff
08f117b Add staff-only report language picker to Hotel Tech Audit
f1f9967 Localise sample report behind marketing-only "Preview end page" shortcut
7b99c4b Localise AI Visibility Audit report chrome and inline labels
89599d9 Add staff-only report language picker on AI Visibility Audit
```

### Afternoon files touched

```
M  components/AiAudit.tsx
M  components/AuditTool.tsx
M  components/FullResults.tsx
M  middleware.ts
M  services/geminiService.ts
A  lib/aiAuditDemoReport.ts
A  lib/techAuditDemoAnalysis.ts
```

## Open after 19 June

- **Translation QA** — German `Sie` and French `vous` translations across the 5 blog posts were written by Claude, not a native reviewer. Worth a quick local read-through before the last three posts publish (29 Jun → 13 Jul). Same caveat for `lib/aiAuditDemoReport.ts` and `lib/techAuditDemoAnalysis.ts` (6 non-English variants each, hand-translated).
- **Delete `components/Results.tsx`** when convenient — dead code.
- **One-off review** of the Bookassist sales paragraph that still closes every AI audit (`## Strategic Advantage for Bookassist`). Marketing accepted leaving it as-is for now; revisit if staff want a "clean audit" variant for lead-facing PDFs.
- **`generateLocalAnalysis` English leak** — `services/geminiService.ts` still hard-codes `"Critical failures in automation detected. Failure to optimize this area directly increases commission costs."` in English in the fallback path used when Gemini errors retry-exhaust. Pre-existing; not load-bearing on the happy path.

---

# 18 June 2026 — Staff bypass, role-based access, AI audit polish, PDF export, local-dev workflow

Multiple features shipped to production. Closing decision: switch to a **local-dev-first workflow** to stop burning time on the Amplify build cycle.

## What shipped today (all live on production)

### 1. Hidden `/staff` page with shared-password bypass

- Hidden route at `directbookinghealthscore.com/staff` (noindex, not in sitemap, not in nav)
- Server-side password verification via `POST /api/staff/auth`; HMAC-signed 30-day session token via `POST /api/staff/verify`
- On both audits (`/hotel-audit` + `/ai-visibility-audit`), the HubSpot lead-capture gate is skipped when a valid staff token is present
- Brand-yellow "Bookassist Staff Mode" pill on bypassed pages
- Middleware skips locale redirect for signed-in staff (`hhc_staff` cookie)
- Show/hide eye toggle on the password field
- Production env vars (set in Amplify):
  - `STAFF_PASSWORD` = `baScore-Audit-2026!` (general staff)
  - `STAFF_MARKETING_PASSWORD` = `baScore-Audit-2026!marketing` (marketing)
  - `STAFF_TOKEN_SECRET` = `7f3b2a18…` (HMAC secret)

### 2. Role-based access: `staff` vs `marketing`

- Auth route checks both passwords in constant time; role is baked into the token payload
- `staff` role: bypass lead-capture gate only
- `marketing` role: bypass + access to internal-only tooling on the AI audit (currently the demo-preview shortcut)
- Sales reps using `STAFF_PASSWORD` during prospect demos never see internal tooling, so they can't accidentally show a fake report

### 3. AI Visibility Audit polish

- **Score-preview donut card** at the top of the done view: extracts the overall score from the Gemini markdown via regex, shows it as a tier-coloured donut. The full markdown report below it is unchanged.
- **Demo preview shortcut**: a link "Preview end page with sample report" appears under the URL form when signed in as marketing. Click it → instant render with a static sample report, no Gemini call, no wait.
- **For staff (any role)**: skip the blurred preview teaser and land directly on the full report after the audit completes. Also skip the "Book a Demo" CTA banner (staff don't need to be marketed to, and the banner doesn't appear in their PDF exports).
- **Download PDF** button: real `.pdf` file download (no print dialog).

### 4. AI audit PDF export — per-block capture

Multi-iteration build of the PDF export. Final design:

- Each top-level block inside the captured region is its own `html2canvas` call (score card, each markdown heading / paragraph / table)
- Blocks are laid out on A4 pages; when the next block doesn't fit, a new page is started. Tables and cards are never split.
- For blocks taller than a full page (rare — e.g. a giant table), that one block is sliced at strict page boundaries. All other blocks stay intact.
- Uses **html2canvas-pro** (not the original html2canvas) because Tailwind v4 emits `oklch()` colour values that the original library can't parse. See memory: `tailwind-v4-oklch.md`.
- Print-dialog fallback if the CDN scripts fail to load, with a visible amber banner explaining what happened — never a silent no-op.
- Filename: `AI-Readiness-<hostname>.pdf`

### 5. Workflow infrastructure

- `amplify.yml` updated to forward `STAFF_PASSWORD`, `STAFF_MARKETING_PASSWORD`, `STAFF_TOKEN_SECRET` to the Lambda runtime (the build's env-var grep allowlist). See memory: `amplify-env-var-grep.md`.
- `.env.example` documents all server-only env vars
- `scripts/check-no-secret-leaks.mjs` extended to forbid the new env vars outside `lib/staff-auth.ts` and `app/api/`

## What we DIDN'T do (reverted or skipped)

- **Full AI Readiness Report dashboard redesign** — built, shipped, then reverted. Reason: parser was too brittle against the real Gemini output format (no markdown headers). The "before" state (inline ReactMarkdown render of the full report) is what's live. Spec for the failed dashboard still committed at `docs/superpowers/specs/2026-06-18-staff-bypass-page-design.md` but doesn't reflect what's live.
- **Per-criterion ✓ / ✗ verdicts** in the scoring table — would require updating the Gemini system prompt, which the user vetoed.

## Local-dev-first workflow

The pattern of "make a change → push → wait 3-5 min for Amplify → test → see issue → fix → push again" burned a lot of time. Rule going forward:

1. Run `npm run dev` from the project root. Opens `http://localhost:3000` with hot reload.
2. `.env.local` should have `STAFF_PASSWORD`, `STAFF_MARKETING_PASSWORD`, `STAFF_TOKEN_SECRET` (test values) and `GEMINI_API_KEY` (grab from Amplify → Environment variables, click to reveal).
3. Iteration loop: Claude edits → refresh `localhost:3000` → agree → ONE commit + ONE push → one Amplify build instead of seven.
4. For pure UI iteration on the AI audit done view, use the **demo preview link** (marketing password) — no Gemini, no wait, no credits.

### Local-only test passwords

- `STAFF_PASSWORD` = `bookassist-test-2026` (different from prod)
- `STAFF_MARKETING_PASSWORD` = `marketing-test-2026` (different from prod)
- `STAFF_TOKEN_SECRET` = dev placeholder (different from prod)

Stored in `.env.local`, which is gitignored. Production uses the real values from Amplify.

## Useful artefacts

- Spec doc (still valuable for reading the staff-bypass design): `docs/superpowers/specs/2026-06-18-staff-bypass-page-design.md`
- Memory entries (auto-loaded next session):
  - `amplify-env-var-grep.md` — must add new env vars to `amplify.yml` grep
  - `tailwind-v4-oklch.md` — must use html2canvas-pro, not original html2canvas
- Commits (most recent first):
  - `06e1c86` PDF export: capture each block separately, never split tables
  - `3e358ca` Hide Book a Demo CTA from staff view
  - `ce7879a` Switch AI Audit PDF capture to html2canvas-pro for oklch support
  - `2eaacb0` Add Download PDF button to AI Visibility Audit done view
  - `ad9759f` Add show/hide password toggle to staff sign-in form
  - `76d6f6c` Gate demo-preview shortcut behind a separate marketing password
  - `a873765` Add score-preview donut to AI Visibility Audit done view
  - `6b6adec` Revert AI Readiness Report dashboard redesign
  - `25ee997` Forward staff env vars to Amplify build (grep allowlist)
  - `f75ffac` Add hidden /staff page

---

# 5 June 2026 — PARKED brainstorm: automated weekly blog publishing

**Status:** No code changes made — brainstorm-in-progress for **automated weekly blog publishing**. Parked mid-design so the user could check something. Pick up at Section 2 approval.

## Brainstorm: Automated Weekly Blog Publishing

Goal: have new blog posts publish automatically each week, related to the hospitality industry and tied back to Bookassist services.

### Decisions locked in so far

| Question | Answer |
|---|---|
| Review model | **Auto-publish, no review** (white-label site, user is OK with unreviewed AI content) |
| Cadence | **Weekly** — one post every Monday |
| Topic source | **Industry news feeds** — agent reads recent hospitality news and writes a post reacting to it |
| Specific feeds | **Skift, PhocusWire, Hospitality Net** |
| Infrastructure | **GitHub Actions cron** (free, runs in existing repo, commits to `main`, Amplify rebuilds) |
| Images | **Unsplash API** (free — confirmed with user that Unsplash has no per-download cost) |
| Post angle | News story → what it means for hoteliers → **how the right tech/marketing addresses it (Bookassist's services)**. Rotates through 7 service areas so coverage is balanced. |

### Bookassist service areas to rotate through

User confirmed these 7 — agent should cycle through them so coverage is balanced over time:

1. Direct booking tech / IBE
2. Digital marketing campaigns (paid search, display, Meta, retargeting)
3. Metasearch management (Google Hotel Ads, Trivago, Kayak)
4. SEO + AI Visibility / GEO
5. **Website design/build for hotels** (user-added)
6. **GDS connectivity** (user-added)
7. **Vouchers / gift card system** (user-added)

### Architecture presented and approved (Section 1)

GitHub Actions workflow runs Mondays 08:00 UTC. Node/TS script:

1. Fetches Skift + PhocusWire + Hospitality Net RSS (last 7 days)
2. Gemini picks best story, weighted toward this week's rotating service angle
3. Gemini writes English post (~600-800 words)
4. Unsplash API fetches a hero image by title keywords
5. Gemini translates to it/es/pl/fr/de/cs (following project translation rules — Bookassist/OTA/GA4 untranslated, Spanish `tú`, German `Sie`)
6. Writes 7 markdown files into `blog/` (matches existing `<slug>.md` + `<slug>.<lang>.md` pattern)
7. Commits + pushes to `main` with `chore: weekly auto-post — <slug>`
8. Rotation state tracked in `blog/.rotation.json`

User reply: **"yes looks ok"** → approved.

### Section 2 presented but NOT yet approved (parked here)

Component breakdown:

- **`.github/workflows/weekly-blog.yml`** — cron Mondays 08:00 UTC, also `workflow_dispatch` for manual test runs. Uses built-in `GITHUB_TOKEN` for commits.
- **`scripts/generate-weekly-post.ts`** — orchestrator. One function per stage (feeds → story pick → write → image → translate → write files → rotation → commit).
- **`scripts/lib/feeds.ts`** — RSS parsing via `rss-parser`. Exports `fetchRecentItems()` returning `{ title, link, summary, source, publishedAt }[]`.
- **`scripts/lib/prompts.ts`** — all Gemini prompts in one place (`STORY_SELECTION_PROMPT`, `ENGLISH_POST_PROMPT`, `TRANSLATION_PROMPT`) so voice/quality can be tuned without touching orchestration.

Secrets needed in GitHub repo settings:
- `GEMINI_API_KEY` (same value as Amplify)
- `UNSPLASH_ACCESS_KEY` (free, register at unsplash.com/developers)

New dev dependencies (won't bloat prod bundle):
- `rss-parser` — RSS fetching
- `tsx` — run the TS script inside Actions with no build step

**User parked here with "park this for now i need to check something update the handoff" — Section 2 approval is the next gate.**

### Remaining sections still to present after Section 2

- Section 3 — Data flow + frontmatter spec for the generated `.md` files
- Section 4 — Error handling (feed down, Gemini failure, Unsplash 429, partial translation failure)
- Section 5 — Testing strategy (dry-run mode, fixture-based test against locked-in RSS samples)

After all sections approved: write spec to `docs/superpowers/specs/2026-06-05-automated-blog-publishing-design.md`, then transition to `writing-plans` skill.

### How to resume this brainstorm

Say something like *"resume the blog automation brainstorm"* and reference this section. The next response should re-present Section 2 (components) for approval, then continue to Section 3.

---

# 7 May 2026 — Gemini model upgrade, prompt structure, Did You Know cards

All changes committed and pushed to `main`.

## 1. Gemini Model Upgrade

**Commit:** `c190f80` (by Robert Whittle, pulled at session start)
**File:** `services/geminiService.ts`

Both the strategic analysis and AI readiness audit endpoints were upgraded from `gemini-2.5-flash` → `gemini-3-flash-preview`. Verified locally against The Merrion Hotel — urlContext tool continues to work and report shape passes validation.

## 2. AI Strategic Assessment — Structured Output + Styling

**Commits:** `f947d8b`
**Files:** `services/geminiService.ts`, `components/FullResults.tsx`

**Problem:** The AI-generated strategic report in the Hotel Tech Audit (blue box) had no enforced structure — Gemini sometimes returned plain prose with no headings.

**Changes:**
- System prompt now enforces an exact 4-section output:
  ```
  ## [Assessment headline]
  ### [Translated: Critical Gaps]
  - **Gap 1**: impact
  - **Gap 2**: impact
  ### [Translated: Financial Exposure]
  [One sentence]
  ---
  *[CTA to contact Bookassist strategist]*
  ```
- All section headings translated into the active language.
- Added missing Tailwind prose classes to the blue markdown box: `prose-h3`, `prose-ul`, `prose-hr`, `prose-em` — previously h3 headings rendered unstyled.

## 3. AI Readiness Report — Markdown Structure

**Commits:** `3414d10`
**File:** `services/geminiService.ts`

**Problem:** The AI Visibility Audit report rendered as plain prose blocks — section headings had no `##` markers so ReactMarkdown couldn't style them.

**Changes:** `REQUIRED OUTPUT STRUCTURE` in `AI_READINESS_SYSTEM_PROMPT` rewritten with proper markdown:
```
## AI Visibility & Optimisation Summary
### [Hotel Name], [Location]
**Overall Score: X / 100** — [Tier]
---
## What We Observed
## Weighted Scoring Breakdown  (table)
## Recurring Issues Across the Website  (table — column renamed "Impact on AI & GEO Search")
## Recommended Fixes & Score Uplift  (table)
```

## 4. AI Readiness Report — Static Book a Demo CTA

**Commits:** `1a073ec`
**Files:** `services/geminiService.ts`, `components/AiAudit.tsx`

- Removed the AI-generated "## How Bookassist Helps" section from the prompt (was inconsistent and felt promotional when AI-written).
- Added a hardcoded branded CTA card at the bottom of the `done` view — matches the Hotel Tech Audit style (blue background, external link icon, white pill button).
- Translated into all 7 languages (`ctaTitle`, `ctaSub`, `ctaButton` added to `labelsMap`).

## 5. Header — Language Switcher Repositioned

**Commits:** `f947d8b`
**File:** `components/AppShell.tsx`

**Before:** Language switcher sat between the logo and the desktop nav, visually disconnected.
**After:** Moved inside the desktop nav, flush to the far right after the AI Visibility Audit button.

Desktop order (left → right): `Home icon | Blog | Contact Us | Hotel Tech Audit | AI Visibility Audit | [Language Switcher]`

Mobile hamburger menu is unchanged — language grid still appears there.

## 6. Home Page Heartbeat — Overflow + Positioning Fix

**Commits:** `f947d8b`
**File:** `components/Home.tsx`

**Problem:** The ECG heartbeat line was being clipped at the bottom by the hero section's `overflow-hidden`, cutting off the S-wave curve.

**Changes:**
- Removed `overflow-hidden` from the hero `<section>` (glow is a radial gradient to transparent, no visual bleed).
- Heartbeat div extended below section: `inset-y-0` → `top-0 -bottom-24`, `z-[1]` (renders over the card row below).
- Per-locale baseline y-values tuned:
  | Locale | Baseline y | Notes |
  |---|---|---|
  | `en` | `215` | Underlines the word "potential" in the heading |
  | `it` | `183` | Clears the wrapped Italian heading text |
  | `es` | `194` | Unchanged |
  | `pl`, `fr`, `de`, `cs` | `230` | Unchanged |

## 7. AI Visibility Audit — "Did You Know?" Loading Screen

**Commits:** `14eaaa3`, `5fdf20a`, `417b006`
**File:** `components/AiAudit.tsx`

Added rotating fact cards to the loading screen while Gemini analyses the hotel URL (~30 seconds wait).

**Implementation:**
- `FACTS` — `Record<Language, { text: string; category: string }[]>` — 10 facts per language × 7 languages.
- Key phrases wrapped in `**bold**` render as `<span className="text-yellow-300 font-black">` on a teal (`brand-success`) card.
- Category pill (e.g. "Revenue", "AI Search", "GEO") in navy at bottom-right.
- Rotation: starts at a random fact, advances every **7 seconds** with a `factFadeIn` CSS animation (0.5 s fade + slide).
- `didYouKnow` label translated in `labelsMap` for all 7 languages.

**To add/edit facts:** update the `FACTS` object near the top of `AiAudit.tsx` — add to all 7 language arrays to keep them in sync.

---

# 29 April 2026 — HubSpot lead gate, AI logo, hover-only heartbeat, click-to-flip cards

All shipped and live on main.

## 1. AI Visibility Audit — HubSpot lead gate (`components/AiAudit.tsx`)

Flow changed from `URL → report` to `URL → HubSpot form → report`. After the user enters a valid URL, the `LeadCapture` modal (same as hotel audit) appears. On HubSpot form submission, the Gemini analysis runs and the report renders. The `generateAiReadinessReport` API call was split into a separate `runAnalysis()` function that `LeadCapture.onUnlock` triggers.

## 2. AI logo on home CTA button (`components/Home.tsx`, `public/ai-logo.svg`)

Replaced the `<Sparkles>` Lucide icon next to "Launch AI Visibility Audit" with the Bookassist AI logo SVG. Rendered as `<img src="/ai-logo.svg" width={22} height={22}>`.

## 3. Heartbeat animation — hover-only (`components/Home.tsx`)

The ECG heartbeat trace now only animates when the mouse is over the hero section. Uses React state (`hbActive`, `hbKey`) with `onMouseEnter/onMouseLeave` on the hero `<section>`. The `hbKey` counter increments on each hover entry, causing the path elements to remount (via `key` prop) so the trace always restarts from the beginning rather than continuing from a paused mid-state.

## 4. Feature cards — click to flip with hint (`components/Home.tsx`)

Cards changed from hover-triggered flip to click-triggered. Each card has its own `flipped[i]` state (array of 4 booleans). A `RotateCw` icon in the bottom-right corner of each front face spins twice on mount (staggered 0.6s + 0.35s × index delay) to hint that the card is interactive. The icon is hidden once the card is flipped.

---

# 22 April 2026 — CloudFront Stale Cache Bug

**Status:** Unresolved. Awaiting AWS Support ticket OR Amplify build-cache workaround attempt.

## The Bug

On production (`directbookinghealthscore.com`), some users see the current build of the site while others see an old build that is missing:

- The Polish language switcher (PL button in header)
- The blog listing image
- Correct blog post titles (shows "Untitled" instead of the real title)

Affected users also report a 404 in DevTools console on the `/blog` page (`blog:1 Failed to load resource: 404`).

## Reproduction

Single device, same phone, same browser:
- On home WiFi → **new site** (correct)
- On 4G / mobile data → **old site** (broken)

Reproduced independently on:
- Multiple coworker devices (phone, laptop) on multiple networks
- A brand-new visitor (never visited before) on a home network
- A coworker in Pakistan → sees the new site correctly

## Root Cause (confirmed)

**Stale CloudFront edge POP caches.** Each CloudFront POP independently caches the site. Some POPs cached an old build (from before PL + blog image existed) with a `s-maxage=31536000` (1 year) TTL. Deploys have not invalidated these stuck POPs.

- Origin (Amplify) serves **correct HTML** — verified via `curl`. Current etag: `f0on7uimwogir`.
- Server HTML contains: PL button, blog image URL, correct titles for all 4 languages (en/it/es/pl).
- Coworkers' browsers are receiving **different HTML** than origin serves — confirming POP cache is the issue.
- The Pakistan success case + same-device WiFi-vs-4G test rules out device, browser, extension, and network-level issues.

## What Has Been Tried

All attempts below have **failed** to invalidate the stuck POPs:

1. Git push `1e88426` — trivial amplify.yml change to trigger rebuild
2. Git push `9a4980c` — permanent fix: added `export const revalidate = 60` to `app/layout.tsx` (shortens CDN TTL from 1 year to 60 seconds going forward)
3. Git push `923645b` — second trivial trigger to force another invalidation pass
4. `aws amplify start-job --app-id d3v6f1glsnjvmy --branch-name main --job-type RELEASE` — Amplify CLI-triggered redeploy

Note: `MANUAL` job type was attempted but returned `BadRequestException` — confirmed via AWS docs that `MANUAL` is only for apps not connected to Git. `RELEASE` is the correct job type for Git-connected Amplify apps.

## Current State

- Origin is serving the correct build (etag `f0on7uimwogir`, `cache-control: s-maxage=60, stale-while-revalidate=31535940`).
- `revalidate = 60` is permanently set in `app/layout.tsx` — prevents this recurring for **future** deploys.
- Stuck POPs still serve old HTML because they cached it before the new header existed.
- Amplify's CloudFront distribution is AWS-managed → not accessible from our account → we cannot issue a manual CloudFront invalidation ourselves.

## Next Steps (choose one or both)

### Option A — AWS Support ticket (recommended, most reliable)

AWS owns the managed CloudFront distribution and can purge it from their side.

**Submit via:** AWS Console → Support → Create case → Technical
**Service:** AWS Amplify
**Severity:** System impaired
**Subject:** Amplify Hosting — CloudFront cache not invalidating on deploy

**Body template:**

> App ID: `d3v6f1glsnjvmy`
> Region: `<fill in>`
> Branch: `main`
> Domain: `directbookinghealthscore.com`
>
> Deploys complete successfully but the CloudFront CDN cache at specific edge POPs is not being invalidated. Users on different networks see different versions of the same page — some receive a build from weeks ago despite multiple successful deploys.
>
> Reproducible on a single device: same phone, same browser. On WiFi the site shows the current build. On 4G the same page shows an old build (missing features added in recent deploys: a Polish language switcher and blog post images).
>
> What we've tried:
> 1. Multiple git pushes (commits `9a4980c`, `923645b`) — auto-deploy successful, etag changed at origin, stuck POPs unchanged
> 2. `aws amplify start-job --app-id d3v6f1glsnjvmy --branch-name main --job-type RELEASE` — successful redeploy, stuck POPs still serving old HTML
>
> The old HTML references JS chunk filenames that no longer exist on origin, causing 404s in the browser console (`blog:1` returns 404). This confirms the POPs are serving content from a build that has been replaced at origin.
>
> Requesting: a manual cache purge on the Amplify-managed CloudFront distribution for this app. Since Amplify-managed distributions are not exposed in our account, we cannot issue the invalidation ourselves.

### Option B — Clear Amplify build cache

Edit `amplify.yml` to force Amplify's build environment to wipe its cache. May trigger a more aggressive invalidation as a side effect, though the primary theory is CDN cache (not build cache).

**Option B1** — Comment out the `cache:` section:

```yaml
# cache:
#   paths:
#     - .next/cache/**/*
#     - .npm/**/*
#     - node_modules/**/*
```

**Option B2** — Add preBuild wipe commands:

```yaml
preBuild:
  commands:
    - rm -rf node_modules
    - rm -rf .next/cache
    - nvm use 20
    - node -v
    - npm ci --cache .npm --prefer-offline
```

**Option B3** — Both combined.

### Option C — Workaround: rename the blog route

If urgent and support is slow, add Next.js middleware to rewrite `/blog` to a new path (`/blog-v2`). Stuck POPs have nothing cached at the new path → forced fresh fetch. Ugly but effective. Takes ~15 min.

## How to Verify Any Fix Worked

1. Wait ~5–10 min after the attempted fix
2. Open `directbookinghealthscore.com/blog` on **mobile data (4G/5G)** — not WiFi
3. Expected: PL button in header + blog image + real blog title

If that specific device/network combo that was previously broken now shows the correct site, it's fixed.

## Key Files and Context

- `app/layout.tsx` — contains `export const revalidate = 60` (line 7)
- `amplify.yml` — Amplify build config, where the build-cache workaround would go
- `lib/blog.ts` — blog post loader with `|| 'Untitled'` fallback that revealed the stale-cache symptom
- `components/AppShell.tsx` — contains the PL language switcher that is missing from stuck POPs

## AWS Details

- **Amplify App ID:** `d3v6f1glsnjvmy`
- **Branch:** `main`
- **Latest commit on main:** `923645b`
- **Current origin etag:** `f0on7uimwogir`

## Commits Related to This Bug

- `9a4980c` — perf: set 60s ISR revalidate to prevent stale CDN cache (the permanent future-prevention fix)
- `923645b` — chore: trigger amplify rebuild to force cdn invalidation retry
- `1e88426` — chore: trigger amplify rebuild to invalidate stale CDN cache (earlier attempt)
