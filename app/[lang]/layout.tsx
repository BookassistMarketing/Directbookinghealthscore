import { notFound } from 'next/navigation';
import type { Language } from '../../types';
import { LOCALIZED_LOCALES } from '../../lib/i18n';

export function generateStaticParams() {
  return LOCALIZED_LOCALES.map(lang => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!(LOCALIZED_LOCALES as string[]).includes(lang)) {
    notFound();
  }
  // ContentProvider in root layout reads usePathname() and resolves the locale
  // from the URL — no extra wrapping needed here. This layout exists purely to
  // validate the locale param and own statically-generated paths.
  return <>{children}</>;
}
