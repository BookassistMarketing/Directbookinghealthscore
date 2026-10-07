import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventStandAudit } from '../../../components/EventStandAudit';
import { EVENTS, getEvent } from '../../../lib/events';

// Hidden event stand pages, one per skin in lib/events/. Kiosk on a tablet at
// the stand (AppShell drops header/footer/cookie banner under /event/).
// Not linked anywhere, not in the sitemap, noindex. One language per skin.

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(EVENTS).map(slug => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const skin = getEvent((await params).slug);
  return {
    title: skin?.pageTitle ?? 'Bookassist',
    robots: { index: false, follow: false },
  };
}

export default async function EventStandPage({ params }: Props) {
  const skin = getEvent((await params).slug);
  if (!skin) notFound();
  return <EventStandAudit skin={skin} />;
}
