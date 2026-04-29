#!/usr/bin/env node
/**
 * Scans the codebase for references to GEMINI_API_KEY (and other server
 * secrets) outside the explicit allowlist of server-only files. Designed
 * to be run as part of `npm run lint` and in the Amplify build pipeline.
 *
 * Defence-in-depth on top of:
 *   - `'server-only'` import in services/geminiService.ts (build-time enforced)
 *   - Lambda env-var isolation
 *
 * Exits 1 (failing the build) if any forbidden access is detected.
 */
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = process.cwd();

// Files that ARE allowed to reference these environment variables.
// Keep this list tight — server-only modules and API routes only.
const ALLOWED_PATHS = [
  'services/geminiService.ts',
  'lib/api-security.ts',
  'app/api/', // any file under the API routes directory
];

// Server secrets we never want to see referenced from the wrong place.
// Add new ones here as the codebase grows.
const FORBIDDEN_PATTERNS = [
  /process\.env\.GEMINI_API_KEY/,
  /process\.env\.AUDIT_RATE_LIMIT_SECRET/,
];

// Directories to scan. Skip node_modules, .next, build output, scripts itself.
const SCAN_DIRS = ['app', 'components', 'contexts', 'lib', 'services'];
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

function relPath(absPath) {
  return path.relative(PROJECT_ROOT, absPath).replaceAll('\\', '/');
}

function isAllowed(rel) {
  return ALLOWED_PATHS.some(allowed =>
    allowed.endsWith('/') ? rel.startsWith(allowed) : rel === allowed
  );
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      yield* walk(full);
    } else if (SCAN_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      yield full;
    }
  }
}

const violations = [];

for (const dir of SCAN_DIRS) {
  const absDir = path.join(PROJECT_ROOT, dir);
  if (!fs.existsSync(absDir)) continue;
  for (const file of walk(absDir)) {
    const rel = relPath(file);
    if (isAllowed(rel)) continue;
    const content = fs.readFileSync(file, 'utf-8');
    for (const pattern of FORBIDDEN_PATTERNS) {
      const match = content.match(pattern);
      if (match) {
        const lineNumber = content.slice(0, match.index).split('\n').length;
        violations.push({ file: rel, line: lineNumber, match: match[0] });
      }
    }
  }
}

if (violations.length > 0) {
  console.error('\n❌ Forbidden secret access detected:\n');
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} — ${v.match}`);
  }
  console.error(
    `\n  Server secrets must only be referenced from:\n${ALLOWED_PATHS.map(p => `    - ${p}`).join('\n')}\n` +
    '  If you need a new allowed location, edit scripts/check-no-secret-leaks.mjs.\n'
  );
  process.exit(1);
}

console.log('✓ No forbidden secret access detected.');
