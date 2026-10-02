#!/usr/bin/env node
/**
 * One-shot: creates the "TTG 2026" contact property group and the 4 properties
 * /api/ttg-report writes. Safe to re-run (existing ones are skipped).
 *
 *   node scripts/hubspot-ttg-properties.mjs
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
const GROUP = 'ttg_2026';

async function post(path, body) {
  const res = await fetch(`https://api.hubapi.com${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 409) return 'exists';
  if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text()}`);
  return 'created';
}

const properties = [
  {
    name: 'ttg_audit_report', label: 'TTG audit report', type: 'string', fieldType: 'html',
    description: 'AI Visibility Audit report (HTML) generated on the TTG 2026 stand page. Printed in the TTG audit email.',
  },
  {
    name: 'ttg_audit_score', label: 'TTG audit score', type: 'number', fieldType: 'number',
    description: 'Overall AI Visibility score out of 100 from the TTG 2026 stand audit.',
  },
  {
    name: 'ttg_audit_url', label: 'TTG audit website', type: 'string', fieldType: 'text',
    description: 'Website audited on the TTG 2026 stand page.',
  },
  {
    name: 'ttg_audit_date', label: 'TTG audit date', type: 'datetime', fieldType: 'date',
    description: 'When the latest TTG 2026 stand audit was saved. Workflow trigger.',
  },
];

console.log('group', GROUP, await post('/crm/v3/properties/contacts/groups', { name: GROUP, label: 'TTG 2026', displayOrder: -1 }));
for (const p of properties) {
  console.log(p.name, await post('/crm/v3/properties/contacts', { ...p, groupName: GROUP, formField: false }));
}
