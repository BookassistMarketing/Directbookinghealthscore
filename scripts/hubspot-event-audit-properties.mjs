#!/usr/bin/env node
/**
 * Sets up the contact properties /api/event-report writes, for every event
 * stand page (/event/<slug>). Safe to re-run: creates what is missing and
 * (re)applies the neutral labels.
 *
 *   node scripts/hubspot-event-audit-properties.mjs
 *
 * The first four were created for TTG 2026 with `ttg_` internal names. HubSpot
 * never lets an internal name change, so they keep it; only the labels and the
 * group label are neutral. `event_audit_event` holds the event slug (e.g.
 * "ttg-2026"): each event's workflow filters on it, so one event's audit never
 * sends another event's email.
 *
 * Reads HUBSPOT_PRIVATE_APP_TOKEN from the environment or .env.local.
 * Needs the crm.schemas.contacts.write scope (only for this script).
 */
import fs from 'node:fs';

function readToken() {
  if (process.env.HUBSPOT_PRIVATE_APP_TOKEN) return process.env.HUBSPOT_PRIVATE_APP_TOKEN;
  if (fs.existsSync('.env.local')) {
    const m = fs.readFileSync('.env.local', 'utf-8').match(/^HUBSPOT_PRIVATE_APP_TOKEN=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  console.error('HUBSPOT_PRIVATE_APP_TOKEN not found (env or .env.local).');
  process.exit(1);
}

const token = readToken();
const GROUP = 'ttg_2026'; // internal name is fixed; label below
const GROUP_LABEL = 'Event audits';

async function call(method, path, body) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (method === 'POST' && res.status === 409) return 'exists';
  if (!res.ok) throw new Error(`${method} ${path} ${res.status}: ${await res.text()}`);
  return method === 'POST' ? 'created' : 'updated';
}

const properties = [
  {
    name: 'ttg_audit_report', label: 'Event audit report', type: 'string', fieldType: 'html',
    description: 'AI Visibility Audit report (HTML) generated on an event stand page. Printed in the event audit email.',
  },
  {
    name: 'ttg_audit_score', label: 'Event audit score', type: 'number', fieldType: 'number',
    description: 'Overall AI Visibility score out of 100 from the latest event stand audit.',
  },
  {
    name: 'ttg_audit_url', label: 'Event audit website', type: 'string', fieldType: 'text',
    description: 'Website audited on the latest event stand page.',
  },
  {
    name: 'ttg_audit_date', label: 'Event audit date', type: 'datetime', fieldType: 'date',
    description: 'When the latest event stand audit was saved. Workflow trigger (with Event audit event).',
  },
  {
    name: 'event_audit_event', label: 'Event audit event', type: 'string', fieldType: 'text',
    description: 'Event of the latest stand audit, as its page slug (e.g. ttg-2026). Filter each event workflow on it.',
  },
];

const group = { label: GROUP_LABEL, displayOrder: -1 };
console.log('group', GROUP, await call('POST', '/crm/v3/properties/contacts/groups', { name: GROUP, ...group }));
console.log('group', GROUP, await call('PATCH', `/crm/v3/properties/contacts/groups/${GROUP}`, { label: GROUP_LABEL }));

for (const p of properties) {
  const created = await call('POST', '/crm/v3/properties/contacts', { ...p, groupName: GROUP, formField: false });
  if (created === 'created') { console.log(p.name, created); continue; }
  const { label, description } = p;
  console.log(p.name, await call('PATCH', `/crm/v3/properties/contacts/${p.name}`, { label, description, groupName: GROUP }));
}
