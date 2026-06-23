import { NextRequest, NextResponse } from 'next/server';

const LOCALIZED_LOCALES = ['it', 'es', 'pl', 'fr', 'de', 'cs'] as const;
const ALL_LOCALES = ['en', ...LOCALIZED_LOCALES] as const;
const COOKIE_NAME = 'hhc_locale';

/**
 * Parse the Accept-Language header into a sorted list of primary tags
 * (e.g. 'fr-FR,fr;q=0.9,en;q=0.8' → ['fr', 'en']).
 */
function preferredLocales(header: string): string[] {
  return header
    .split(',')
    .map(part => {
      const [tag, ...rest] = part.trim().split(';');
      const qPart = rest.find(p => p.trim().startsWith('q='));
      const q = qPart ? parseFloat(qPart.split('=')[1]) : 1;
      const primary = tag.split('-')[0].toLowerCase();
      return { primary, q };
    })
    .sort((a, b) => b.q - a.q)
    .map(x => x.primary);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /<locale>/staff(/anything) → /staff(/anything). The staff hub is
  // English-only — staff sign in once and the per-tool report-language
  // picker handles output language — so the localised entry points would
  // 404 otherwise. Must run before the locale-prefixed early-return below.
  const localisedStaff = pathname.match(/^\/(?:it|es|pl|fr|de|cs)(\/staff(?:\/.*)?)$/);
  if (localisedStaff) {
    const url = req.nextUrl.clone();
    url.pathname = localisedStaff[1];
    return NextResponse.redirect(url);
  }

  // /<locale>/revenue-simulator → /revenue-simulator. English-only for now;
  // when localised it'll move under app/[lang]/revenue-simulator and this rule
  // can be removed.
  const localisedSimulator = pathname.match(/^\/(?:it|es|pl|fr|de|cs)\/revenue-simulator$/);
  if (localisedSimulator) {
    const url = req.nextUrl.clone();
    url.pathname = '/revenue-simulator';
    return NextResponse.redirect(url);
  }

  // Skip if already on a locale-prefixed path
  if (ALL_LOCALES.some(loc => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`))) {
    return NextResponse.next();
  }

  // /staff is the hidden English-only staff bypass hub. Don't rewrite it
  // based on the user's locale cookie — the page has no localised version
  // and the redirect would 404.
  if (pathname === '/staff' || pathname.startsWith('/staff/')) {
    return NextResponse.next();
  }

  // Signed-in staff stay on English everywhere. The cookie is set by the
  // /staff hub on sign-in and cleared on sign-out. Non-authoritative — actual
  // audit bypass still requires server-verified token; cookie just suppresses
  // the locale redirect.
  if (req.cookies.get('hhc_staff')?.value === '1') {
    return NextResponse.next();
  }

  // Respect explicit cookie set by the language switcher. If the user manually
  // chose a locale, don't second-guess them on future visits.
  const cookieLocale = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieLocale === 'en') {
    return NextResponse.next();
  }
  if (cookieLocale && (LOCALIZED_LOCALES as readonly string[]).includes(cookieLocale)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${cookieLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  // First visit (no cookie): use Accept-Language
  const acceptLang = req.headers.get('accept-language') || '';
  if (!acceptLang) return NextResponse.next();

  const preferred = preferredLocales(acceptLang);
  const matched = preferred.find(p => (LOCALIZED_LOCALES as readonly string[]).includes(p));

  // English (or any non-supported language) → stay on default unprefixed path
  if (!matched) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/${matched}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Match every page except API routes, Next internals, and static files
  // (anything with a dot in the last segment, e.g. favicon.ico, sitemap.xml).
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
