import 'server-only';
import { validatePublicUrl } from './api-security';

// Server-side HTML prefetch for the AI Visibility Audit. Replaces Gemini's
// urlContext tool, which was the main driver of 30s Lambda timeouts: it
// fetched, parsed JS, AND analysed in one round-trip, often exceeding the
// 30s budget. We now fetch the raw HTML ourselves (no JS execution, capped
// at 500KB, 5s budget), extract the signals that matter for AI-readiness
// scoring (title, meta, JSON-LD, headings, links, alt text, body copy),
// and hand a structured text blob to Gemini. The model then only has to
// score — typically 3-8s vs 20-30s with urlContext.
//
// Trade-off: pure-SPA hotel sites that render everything client-side will
// look empty to us. Most hotels run WordPress / custom CMS / static HTML
// so this is a rare case in practice.

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 500_000;
const MAX_BODY_TEXT_CHARS = 30_000;
const MAX_REDIRECTS = 5;

export type PrefetchResult =
  | { status: 'ok'; content: string }
  | { status: 'error'; code: 'URL_FETCH_TIMEOUT' | 'URL_FETCH_FAILED' | 'URL_NOT_HTML' };

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; BookassistAuditBot/1.0; +https://directbookinghealthscore.com)',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
  'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,es;q=0.7,it;q=0.7,de;q=0.7',
};

export async function fetchHotelPageText(url: string): Promise<PrefetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response: Response;
  try {
    response = await followRedirectsSafely(url, controller.signal);
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === 'AbortError') {
      return { status: 'error', code: 'URL_FETCH_TIMEOUT' };
    }
    return { status: 'error', code: 'URL_FETCH_FAILED' };
  }
  clearTimeout(timer);

  if (!response.ok) {
    return { status: 'error', code: 'URL_FETCH_FAILED' };
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!/html|xml/i.test(contentType)) {
    return { status: 'error', code: 'URL_NOT_HTML' };
  }

  // Stream-read with a hard byte cap so a 50MB page can't OOM the Lambda.
  const reader = response.body?.getReader();
  let html: string;
  if (!reader) {
    html = await response.text();
  } else {
    let total = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      chunks.push(value);
      if (total > MAX_BYTES) {
        try { await reader.cancel(); } catch { /* noop */ }
        break;
      }
    }
    const decoder = new TextDecoder('utf-8', { fatal: false });
    html = chunks.map(c => decoder.decode(c, { stream: true })).join('') + decoder.decode();
  }

  return { status: 'ok', content: extractRelevant(html, response.url || url) };
}

// Follow up to MAX_REDIRECTS hops, re-running validatePublicUrl on every
// Location header. Without this, an attacker could submit a URL on a public
// domain that 302s to http://169.254.169.254/... and we'd happily fetch the
// AWS instance metadata endpoint server-side (classic SSRF).
async function followRedirectsSafely(initialUrl: string, signal: AbortSignal): Promise<Response> {
  let currentUrl = initialUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(currentUrl, {
      method: 'GET',
      redirect: 'manual',
      signal,
      headers: COMMON_HEADERS,
    });

    // 3xx with a Location header: re-validate and loop.
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location');
      if (!location) return res;
      // Drain so the connection can be reused.
      try { await res.body?.cancel(); } catch { /* noop */ }

      const next = new URL(location, currentUrl).toString();
      const validated = validatePublicUrl(next);
      if (typeof validated !== 'string') {
        throw new Error('URL_FETCH_FAILED');
      }
      currentUrl = validated;
      continue;
    }

    return res;
  }
  throw new Error('URL_FETCH_FAILED');
}

function extractRelevant(html: string, sourceUrl: string): string {
  // JSON-LD has to be extracted BEFORE we strip script tags below.
  const jsonLdBlocks = collectAll(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    .map(m => m[1].trim())
    .filter(Boolean);

  // Strip JS / CSS / no-script so they don't pollute headings or body text.
  const stripped = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, '');

  const title = (stripped.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim();

  const metaTags = collectAll(stripped, /<meta\b([^>]+)>/gi)
    .map(m => ({
      key: attr(m[1], 'name') || attr(m[1], 'property') || '',
      content: attr(m[1], 'content') || '',
    }))
    .filter(m => m.key && m.content);

  const canonical = collectAll(stripped, /<link\b([^>]*)>/gi)
    .map(m => ({ rel: attr(m[1], 'rel'), href: attr(m[1], 'href') }))
    .find(l => l.rel === 'canonical')?.href ?? null;

  const headings: { tag: string; text: string }[] = [];
  for (const tag of ['h1', 'h2', 'h3'] as const) {
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    for (const m of collectAll(stripped, re)) {
      const text = stripTags(m[1]).trim();
      if (text) headings.push({ tag, text });
    }
  }

  const linkTexts = collectAll(stripped, /<a\b[^>]*>([\s\S]*?)<\/a>/gi)
    .map(m => stripTags(m[1]).trim())
    .filter(t => t.length > 0 && t.length < 200);

  const altTexts = collectAll(stripped, /<img\b[^>]*\salt=["']([^"']*)["']/gi)
    .map(m => m[1].trim())
    .filter(Boolean);
  const imgTotal = collectAll(stripped, /<img\b/gi).length;

  const bodyHtml = stripped.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? stripped;
  const bodyText = stripTags(bodyHtml)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_BODY_TEXT_CHARS);

  const parts: string[] = [];
  parts.push(`URL: ${sourceUrl}`);
  if (title) parts.push(`TITLE: ${title}`);
  if (canonical) parts.push(`CANONICAL: ${canonical}`);
  if (metaTags.length > 0) {
    parts.push('META TAGS:');
    for (const m of metaTags) parts.push(`- ${m.key}: ${m.content}`);
  }
  if (jsonLdBlocks.length > 0) {
    parts.push(`JSON-LD STRUCTURED DATA (${jsonLdBlocks.length} block(s)):`);
    for (const block of jsonLdBlocks) parts.push(block.slice(0, 5000));
  }
  if (headings.length > 0) {
    parts.push('HEADINGS:');
    for (const h of headings.slice(0, 80)) parts.push(`- ${h.tag.toUpperCase()}: ${h.text}`);
  }
  if (linkTexts.length > 0) {
    const unique = Array.from(new Set(linkTexts)).slice(0, 100);
    parts.push(`LINK TEXTS: ${unique.join(' | ')}`);
  }
  parts.push(`IMAGES: ${imgTotal} total, ${altTexts.length} with non-empty alt`);
  if (altTexts.length > 0) {
    parts.push(`ALT SAMPLES: ${altTexts.slice(0, 20).join(' | ')}`);
  }
  if (bodyText) parts.push(`BODY TEXT:\n${bodyText}`);

  return parts.join('\n\n');
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

function attr(attrs: string, name: string): string | undefined {
  return attrs.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1];
}

function collectAll(text: string, re: RegExp): RegExpMatchArray[] {
  const out: RegExpMatchArray[] = [];
  for (const m of text.matchAll(re)) out.push(m);
  return out;
}
