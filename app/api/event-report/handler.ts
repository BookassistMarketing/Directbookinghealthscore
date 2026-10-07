import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { isOriginAllowed, validatePublicUrl, verifyReport } from '../../../lib/api-security';
import { extractScore, reportToEmailHtml } from '../../../lib/event-report-html';
import { getEvent } from '../../../lib/events';

// Event stand pages (/event/<slug>): after the AI Visibility Audit finishes,
// save the report on the HubSpot contact who just filled in the stand form.
// Each event has a HubSpot workflow triggered by "Event audit date is known"
// AND `event_audit_event` = its slug, which emails the report.
//
// Contact properties (labels "Event audit ..."; the internal names keep the
// `ttg_` prefix they were created with for TTG 2026, HubSpot can't rename them):
// ttg_audit_report, ttg_audit_score, ttg_audit_url, ttg_audit_date, event_audit_event.
//
// Abuse guards: the report must carry the HMAC proof /api/ai-audit attached
// to it (so no arbitrary text), and we only UPDATE an existing contact who
// submitted a form in the last few hours with the same website (so no
// emailing random addresses). We never create contacts here.

const HUBSPOT_API = 'https://api.hubapi.com';
const RECENT_FORM_WINDOW_MS = 3 * 60 * 60 * 1000;
const MAX_REPORT_CHARS = 100_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Contact = { id: string; properties: Record<string, string | null> };

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
    return u.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

async function hubspot(path: string, token: string, init: RequestInit): Promise<Response> {
  return fetch(`${HUBSPOT_API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    cache: 'no-store',
  });
}

async function findContact(email: string, token: string): Promise<Contact | null> {
  const res = await hubspot('/crm/v3/objects/contacts/search', token, {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'email', operator: 'EQ', value: email }] }],
      properties: ['email', 'website', 'recent_conversion_date'],
      limit: 1,
    }),
  });
  if (!res.ok) throw new Error(`HUBSPOT_SEARCH_${res.status}`);
  const data = (await res.json()) as { results?: Contact[] };
  return data.results?.[0] ?? null;
}

// `fallbackEvent` serves the old /api/ttg-report URL, whose callers send no event.
export async function handleEventReport(req: NextRequest, fallbackEvent?: string) {
  const requestId = crypto.randomUUID();

  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: 'FORBIDDEN_ORIGIN', requestId }, { status: 403 });
  }

  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) {
    console.error('[api/event-report] HUBSPOT_PRIVATE_APP_TOKEN is not set', { requestId });
    return NextResponse.json({ error: 'SERVICE_UNAVAILABLE', requestId }, { status: 503 });
  }

  let body: { event?: unknown; email?: unknown; report?: unknown; reportUrl?: unknown; reportSig?: unknown; reportIssuedAt?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', requestId }, { status: 400 });
  }

  const event = getEvent(typeof body.event === 'string' ? body.event : fallbackEvent ?? '');
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const report = typeof body.report === 'string' ? body.report : '';
  const urlCheck = validatePublicUrl(body.reportUrl);
  if (!event || !EMAIL_RE.test(email) || email.length > 254 || !report || report.length > MAX_REPORT_CHARS || typeof urlCheck !== 'string') {
    return NextResponse.json({ error: 'INVALID_REQUEST', requestId }, { status: 400 });
  }

  if (!verifyReport(urlCheck, report, body.reportIssuedAt, body.reportSig)) {
    console.warn('[api/event-report] Report proof rejected', { requestId });
    return NextResponse.json({ error: 'INVALID_REQUEST', requestId }, { status: 400 });
  }

  try {
    // The form submission can take a few seconds to land on the contact.
    let contact = await findContact(email, token);
    for (let i = 0; !contact && i < 2; i++) {
      await new Promise(r => setTimeout(r, 4000));
      contact = await findContact(email, token);
    }
    if (!contact) {
      console.warn('[api/event-report] No contact for email', { requestId });
      return NextResponse.json({ error: 'CONTACT_NOT_FOUND', requestId }, { status: 404 });
    }

    const convertedAt = Date.parse(contact.properties.recent_conversion_date ?? '');
    const recent = Number.isFinite(convertedAt) && Date.now() - convertedAt < RECENT_FORM_WINDOW_MS;
    const sameSite = hostOf(contact.properties.website) === hostOf(urlCheck);
    if (!recent || !sameSite) {
      console.warn('[api/event-report] Contact does not match a recent stand submission', { requestId, contactId: contact.id, recent, sameSite });
      return NextResponse.json({ error: 'CONTACT_MISMATCH', requestId }, { status: 409 });
    }

    const score = extractScore(report);
    const properties: Record<string, string> = {
      ttg_audit_report: reportToEmailHtml(report),
      ttg_audit_url: urlCheck,
      ttg_audit_date: new Date().toISOString(),
      event_audit_event: event.slug,
    };
    if (score !== null) properties.ttg_audit_score = String(score);

    const res = await hubspot(`/crm/v3/objects/contacts/${contact.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error('[api/event-report] HubSpot update failed', { requestId, status: res.status, detail: detail.slice(0, 500) });
      return NextResponse.json({ error: 'UPSTREAM_ERROR', requestId }, { status: 502 });
    }

    return NextResponse.json({ ok: true, requestId });
  } catch (err) {
    console.error('[api/event-report] Failed', { requestId, message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: 'UPSTREAM_ERROR', requestId }, { status: 502 });
  }
}
