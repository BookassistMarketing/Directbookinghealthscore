# Staff Bypass Page — Design

**Date:** 2026-06-18
**Project:** Direct Booking Health Score
**Status:** Spec approved, ready for implementation planning

---

## Goal

Provide a hidden route at `/staff` that lets Bookassist staff bypass the HubSpot lead-capture gate on both audits, so they can demo, test, or generate reports without polluting the CRM with internal entries.

## Non-goals

- Not building per-user accounts (no Cognito, no individual logins).
- Not building an admin dashboard for viewing past audits.
- Not logging staff usage anywhere.
- Not translating the staff page (internal use only).

## User flow

1. Staff member navigates to `https://directbookinghealthscore.com/staff` (URL shared internally; not linked from any nav or sitemap).
2. Sees a centred card with a single password field and "Sign in" button.
3. Enters the shared password. Server verifies; on success returns a signed token.
4. Page switches to a "Signed in" view with two buttons: **Run Hotel Tech Audit** and **Run AI Visibility Audit**.
5. Clicking either navigates to the existing audit page, where the lead-capture modal is suppressed because the audit page's mount-time bypass check sees a valid token.
6. A small "Bookassist Staff Mode" pill is shown on bypassed audit pages so the staff member can tell they're in bypass mode.
7. Token persists in `localStorage` for 30 days. After expiry, the staff member is dumped back to the normal lead-capture flow on next audit visit; they sign in again at `/staff` to refresh.
8. "Sign out" link on `/staff` clears the token.

## Architecture

### Routes & pages

- **`app/staff/page.tsx`** — client component. Two views: password form (signed out) and hub (signed in). English only; not localised.
  - `metadata.robots = { index: false, follow: false }` to keep it out of search indexes.
  - Excluded from `app/sitemap.ts` (no entry generated).
  - Excluded from any nav: not added to `AppShell.tsx`.

### API routes

- **`POST /api/staff/auth`** (`app/api/staff/auth/route.ts`)
  - Body: `{ password: string }`
  - Verifies against `process.env.STAFF_PASSWORD` using `crypto.timingSafeEqual` on equal-length buffers (input padded to env-var length).
  - On success: builds `token = base64url(payload).signature` where `payload = { iat: <now>, exp: <now + 30d> }` and `signature = HMAC-SHA256(payload, process.env.STAFF_TOKEN_SECRET)`. Returns `{ token, expiresAt }`.
  - On failure: returns `401` after a random 200–500ms delay (slows brute force).
  - In-memory rate limit: max 10 attempts per IP per 15 minutes → returns `429` past that.
  - `export const runtime = 'nodejs'` (needs `crypto`).

- **`POST /api/staff/verify`** (`app/api/staff/verify/route.ts`)
  - Body: `{ token: string }`
  - Splits payload/signature, recomputes HMAC, checks signature match + `exp > now`. Returns `{ valid: true }` or `401`.
  - `export const runtime = 'nodejs'`.

### Shared lib

- **`lib/staffBypass.ts`**
  ```ts
  export async function checkStaffBypass(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('bookassist_staff_token');
    if (!token) return false;
    const res = await fetch('/api/staff/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return res.ok;
  }

  export function clearStaffToken() {
    localStorage.removeItem('bookassist_staff_token');
    localStorage.removeItem('bookassist_staff_token_expires_at');
  }
  ```

### Integration into existing audits

- **`components/AiAudit.tsx`** — on mount, call `checkStaffBypass()`. Store result in `isStaffBypass` state. In the flow that transitions `preview → form_gate`, skip straight to `done` when `isStaffBypass === true`. Do not mount `<LeadCapture/>`.
- **`components/AuditTool.tsx`** — same pattern. After SCORE state, the gate that currently routes through `LeadCapture` is skipped when `isStaffBypass === true`, sending the user directly to `FULL_RESULTS`.
- **Staff mode badge**: small pill rendered at the top of both audit pages when `isStaffBypass === true`, label "Bookassist Staff Mode".

The `LeadCapture` component itself is **not modified**. The parent components simply skip mounting it.

## Token model

- Payload: `{ iat: number (unix seconds), exp: number (unix seconds) }`
- Encoding: `base64url(JSON.stringify(payload)) + '.' + base64url(hmacSha256(payloadB64, STAFF_TOKEN_SECRET))`
- Lifetime: 30 days.
- Storage: `localStorage.bookassist_staff_token` (raw token), `localStorage.bookassist_staff_token_expires_at` (ISO string, used only for UI hints — server is source of truth).
- The token does NOT contain any user identity (no email, no name). It's just "signed proof the password was entered correctly at time `iat`."

## Environment variables (new)

Both must be added to **Amplify → App settings → Environment variables** and to `.env.local` for local dev:

| Var | Purpose | Example |
|---|---|---|
| `STAFF_PASSWORD` | Shared password | `correct-horse-battery-staple` |
| `STAFF_TOKEN_SECRET` | HMAC signing secret | 32 random bytes hex, generated once with `openssl rand -hex 32` |

Neither has `NEXT_PUBLIC_` prefix — they must NEVER reach the browser bundle. Both are referenced only inside `app/api/staff/*/route.ts`.

## Edge cases & error handling

- **Token expires mid-audit**: `checkStaffBypass()` returns `false` on the verify call (401). Audit page treats it as no bypass; normal LeadCapture flow kicks in. User can sign back in at `/staff`.
- **Wrong password**: 401 with random delay 200–500ms. Form shows generic "Invalid password" message.
- **Rate limited**: 429 with "Too many attempts. Wait 15 minutes." message.
- **`STAFF_PASSWORD` or `STAFF_TOKEN_SECRET` not set**: API routes return 500. Documented in the spec but should be caught at deploy time by setting both env vars in Amplify before merging.
- **Stale token after env-var rotation**: if `STAFF_TOKEN_SECRET` is rotated, all existing tokens become invalid. Verify will 401. Staff sign in again. (This is the intended way to revoke all sessions.)

## Security posture

- Password is shared. If it leaks, rotate `STAFF_PASSWORD` in Amplify, redeploy. All future sign-ins use the new password.
- To force-revoke ALL existing browser sessions in addition to rotating the password, also rotate `STAFF_TOKEN_SECRET`.
- This is **not** strong auth. It's a soft gate to keep bots and casual visitors out, while keeping internal usage frictionless. The threat model is "someone curious finds the URL," not "a motivated attacker tries to break in."
- If the security needs ever escalate (e.g. real customer data on the staff side), migrate to Cognito.

## Testing

- Local: set both env vars in `.env.local`. Visit `localhost:3000/staff`, sign in, click both audit buttons, verify no `LeadCapture` modal appears and the "Bookassist Staff Mode" badge is visible.
- Negative: visit `/staff` without signing in, manually set a garbage token in localStorage, visit audit page → bypass should NOT activate (verify endpoint rejects fake token).
- Negative: visit `/hotel-audit` and `/ai-visibility-audit` in a fresh incognito browser → normal lead-capture flow appears (no bypass leak).
- Brute force: rapid-fire incorrect passwords via curl → after 10 attempts, 429 response.

## Out of scope (explicit non-features)

- No email field, no per-user identity.
- No HubSpot logging when staff bypass.
- No audit history / saved reports / share links.
- No nav link from public pages to `/staff`.
- No localised versions of `/staff`.

## Files touched

**New:**
- `app/staff/page.tsx`
- `app/api/staff/auth/route.ts`
- `app/api/staff/verify/route.ts`
- `lib/staffBypass.ts`

**Modified:**
- `components/AiAudit.tsx` — bypass check + skip gate + staff mode badge
- `components/AuditTool.tsx` — bypass check + skip gate + staff mode badge
- `.env.local` — add `STAFF_PASSWORD`, `STAFF_TOKEN_SECRET` (local dev only, gitignored)
- Amplify env vars — add `STAFF_PASSWORD`, `STAFF_TOKEN_SECRET`

**Unchanged but verified:**
- `app/sitemap.ts` — confirm `/staff` is NOT in the generated URL list
- `components/AppShell.tsx` — confirm `/staff` is NOT added to nav
- `components/LeadCapture.tsx` — no changes; parent simply doesn't mount it when bypass active
