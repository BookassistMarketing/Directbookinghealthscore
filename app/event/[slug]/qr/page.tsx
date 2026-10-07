import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { EventQrScreen } from '../../../../components/EventQrScreen';
import { EVENTS, getEvent } from '../../../../lib/events';

// QR idle screen for the stand tablet: the code opens /event/<slug> on the
// visitor's phone. Only skins with a `qr` block have one. Same kiosk rules as
// the stand page (no header/footer, noindex, not in the sitemap).

const SITE = 'https://www.directbookinghealthscore.com';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(EVENTS).filter(s => s.qr).map(s => ({ slug: s.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const skin = getEvent((await params).slug);
  return {
    title: skin?.pageTitle ?? 'Bookassist',
    robots: { index: false, follow: false },
  };
}

export default async function EventQrPage({ params }: Props) {
  const skin = getEvent((await params).slug);
  if (!skin?.qr) notFound();
  // UTM tags tell scans apart from the tablet's own visits in analytics.
  const target = `${SITE}/event/${skin.slug}?utm_source=${skin.slug}&utm_medium=qr`;
  const qrSvg = await QRCode.toString(target, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 0,
    color: { dark: '#012C47', light: '#FFFFFF' },
  });
  return <EventQrScreen skin={skin} qrSvg={qrSvg} standHref={`/event/${skin.slug}`} />;
}
