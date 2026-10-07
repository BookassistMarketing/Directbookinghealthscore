# Event stand pages (white label)

One hidden kiosk page per event at `https://www.directbookinghealthscore.com/event/<slug>`.
The hotelier fills in a HubSpot form on the stand tablet, the AI Visibility Audit runs on their
website in the event's language, and the report is saved on their HubSpot contact, where the
event's workflow emails it to them.

- Page: `app/event/[slug]/page.tsx` + `event.css`, component `components/EventStandAudit.tsx`
- Skins: `lib/events/<slug>.ts` (all copy, images, colours, form, person, dates), registered in `lib/events/index.ts`
- Shared "About Bookassist" panel per language: `lib/events/about.ts` (only `ABOUT_IT` so far)
- Report save: `POST /api/event-report` → `app/api/event-report/handler.ts`
- Kiosk: `AppShell` hides header/footer/cookie banner under `/event/`; `middleware.ts` skips the locale redirect there
- Not linked, not in the sitemap, noindex
- Countdown (optional `countdown` in the skin): live timer under the urgency pill, to `endsAt`; hides itself once over
- QR idle screen (optional `qr` in the skin): `/event/<slug>/qr`, a big QR code to the stand page (with `utm_source=<slug>&utm_medium=qr`)
  so visitors scan it with their own phone while the tablet sits on the counter; it asks the browser to keep the screen on.
  Code drawn on the server (`qrcode` package) in `app/event/[slug]/qr/page.tsx`, screen in `components/EventQrScreen.tsx`
- Local test without a form submission: `/event/<slug>?testLead=example.com&testEmail=you@example.com` (dev only; there is no Gemini key locally, so the audit itself won't run)

## HubSpot contact properties (group "Event audits")

| Label | Internal name | Notes |
|---|---|---|
| Event audit report | `ttg_audit_report` | HTML, print with `{{ contact.ttg_audit_report }}` |
| Event audit score | `ttg_audit_score` | number /100 |
| Event audit website | `ttg_audit_url` | |
| Event audit date | `ttg_audit_date` | workflow trigger |
| Event audit event | `event_audit_event` | the skin slug, e.g. `ttg-2026` |

The `ttg_` internal names come from the first event (TTG 2026) and can't be renamed in HubSpot.
Only the labels are neutral, so use the labels in the UI and the internal names in tokens.
`scripts/hubspot-event-audit-properties.mjs` creates any that are missing and reapplies the labels.

Each audit overwrites these on the contact (latest audit wins).

## Add an event

1. **Form.** Create (or reuse) a HubSpot form with at least `email` and `website` (+ `company`),
   contacts set as marketing contacts. Copy its GUID.
2. **Skin.** Copy `lib/events/ttg-2026.ts` to `lib/events/<slug>.ts`. The slug is the URL and the
   value of `event_audit_event`, so pick it once (e.g. `itb-2027`). Set the copy, `language`,
   `timeZone`, `hubspotFormId`, urgency dates, person, optional `theme` colours. Omit what the
   event doesn't need (`partnerLogo`, `background`, `person`, `urgency`, `countdown`, `qr`, `about`, `hero.photo`).
   For a language other than Italian, add `ABOUT_<LANG>` in `about.ts` first (or omit `about`).
   No hyphens or dashes in copy; "Booking Engine", "Guest Journey", "Rate Recommender" (never translated).
3. **Images** in `public/events/<slug>/` (partner logo, hero photo, optional background tile).
   Bookassist assets and people photos are in `public/events/shared/`.
4. **Register** the skin in `lib/events/index.ts`.
5. **HubSpot email.** Clone the latest event report email (TTG: "IT - TTG - Stand Audit Report",
   223408146447), adapt copy, sender and meeting link. Tokens stay the same.
6. **HubSpot workflow.** Clone the TTG one (flow 1894825613). Trigger: *Event audit date is known*
   **AND** *Event audit event is equal to `<slug>`*, re-enrollment on. Steps: send the email,
   internal notification to the salesperson.
7. Push to `main` (Amplify deploys), open `/event/<slug>` on the tablet, run one real test audit
   with your own email, check the email + notification.
