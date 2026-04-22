# Handoff — CloudFront Stale Cache Bug

**Date:** 2026-04-22
**Status:** Unresolved. Awaiting AWS Support ticket OR Amplify build-cache workaround attempt.

---

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

### Option B — Clear Amplify build cache (boss's suggestion)

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

**Option B3** — Both of the above combined.

### Option C — Workaround: rename the blog route

If urgent and support is slow, add Next.js middleware to rewrite `/blog` to a new path (`/blog-v2`). Stuck POPs have nothing cached at the new path → forced fresh fetch. Ugly but effective. Takes ~15 min.

## How to Verify Any Fix Worked

1. Wait ~5–10 min after the attempted fix
2. Open `directbookinghealthscore.com/blog` on **mobile data (4G/5G)** — not WiFi
3. Expected: PL button in header + blog image + real blog title

If that specific device/network combo that was previously broken now shows the correct site, it's fixed.

## Key Files and Context

- `app/layout.tsx` — contains `export const revalidate = 60` (line 7)
- `amplify.yml` — Amplify build config, where boss's build-cache workaround would go
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
