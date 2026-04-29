import type { Language } from '../types';

export const BASE_URL = 'https://directbookinghealthscore.com';

// All 7 supported locales
export const LOCALES: Language[] = ['en', 'it', 'es', 'pl', 'fr', 'de', 'cs'];

// Non-English locales — these are the values valid in /[lang]/* routes.
// English stays at the root (no /en prefix) so existing inbound links don't break.
export const LOCALIZED_LOCALES: Language[] = ['it', 'es', 'pl', 'fr', 'de', 'cs'];

export const DEFAULT_LOCALE: Language = 'en';

/**
 * Returns '' for English (default, unprefixed), or '/<lang>' for non-English.
 * Use to build URLs: `${BASE_URL}${localePrefix(lang)}/hotel-audit`.
 */
export function localePrefix(lang: Language): string {
  return lang === DEFAULT_LOCALE ? '' : `/${lang}`;
}

/**
 * Parse the locale out of a pathname. Returns the matching locale if the first
 * segment is a localized prefix, otherwise returns 'en' (the default).
 *
 * Examples:
 *   '/it/hotel-audit' → 'it'
 *   '/hotel-audit'    → 'en'
 *   '/'               → 'en'
 *   '/fr'             → 'fr'
 */
export function parseLangFromPath(pathname: string | null | undefined): Language {
  if (!pathname) return DEFAULT_LOCALE;
  const seg = pathname.split('/').filter(Boolean)[0];
  if (seg && (LOCALIZED_LOCALES as string[]).includes(seg)) {
    return seg as Language;
  }
  return DEFAULT_LOCALE;
}

/**
 * Returns the equivalent path for a different locale.
 *
 * Examples:
 *   ('/hotel-audit', 'it')      → '/it/hotel-audit'
 *   ('/it/hotel-audit', 'fr')   → '/fr/hotel-audit'
 *   ('/it/hotel-audit', 'en')   → '/hotel-audit'
 *   ('/', 'it')                 → '/it'
 *   ('/it', 'en')               → '/'
 */
export function pathForLocale(pathname: string, target: Language): string {
  if (!pathname) pathname = '/';
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  // Strip current locale prefix if present
  const rest = first && (LOCALIZED_LOCALES as string[]).includes(first)
    ? segments.slice(1)
    : segments;
  const tail = rest.length > 0 ? `/${rest.join('/')}` : '';
  return `${localePrefix(target)}${tail || '/'}`;
}

/**
 * Build the metadata.alternates.languages map (hreflang) for a given page slug
 * (e.g. '/hotel-audit' or '/blog/why-hotels-lose-money-to-otas').
 * Pass an empty string for the home page.
 *
 * Includes x-default per Google's recommendation, pointing at the English
 * (default-locale) URL.
 */
export function buildHreflang(slug: string): Record<string, string> {
  const cleanSlug = slug && !slug.startsWith('/') ? `/${slug}` : slug;
  const tail = cleanSlug === '/' ? '' : cleanSlug;

  const map: Record<string, string> = {};
  for (const lang of LOCALES) {
    map[lang] = `${BASE_URL}${localePrefix(lang)}${tail || '/'}`;
  }
  map['x-default'] = `${BASE_URL}${tail || '/'}`;
  return map;
}

/**
 * Build the canonical URL for a (locale, slug) pair.
 *   ('en', '/hotel-audit')  → 'https://…/hotel-audit'
 *   ('it', '/hotel-audit')  → 'https://…/it/hotel-audit'
 */
export function canonicalFor(lang: Language, slug: string): string {
  const cleanSlug = slug && !slug.startsWith('/') ? `/${slug}` : slug;
  const tail = cleanSlug === '/' ? '' : cleanSlug;
  return `${BASE_URL}${localePrefix(lang)}${tail || '/'}`;
}
