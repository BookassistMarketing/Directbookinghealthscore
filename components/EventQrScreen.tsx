'use client';

import React, { useEffect } from 'react';
import { Countdown, Logos, Urgency, Waves, rich, skinStyle } from './EventStandAudit';
import type { EventSkin } from '../lib/events/types';

// Idle screen for the stand tablet (/event/<slug>/qr): a big QR code to the
// stand page, so visitors can run the audit on their own phone while the
// tablet sits on the counter. The SVG is drawn on the server (page.tsx).
// Copy comes from skin.qr.

export const EventQrScreen: React.FC<{ skin: EventSkin; qrSvg: string; standHref: string }> = ({ skin, qrSvg, standHref }) => {
  const qr = skin.qr!;

  // Keep the tablet screen on while this page is open (Safari 16.4+). The
  // browser drops the lock when the tab is hidden, so ask again on return.
  useEffect(() => {
    let lock: any = null;
    const request = async () => {
      try { lock = await (navigator as any).wakeLock?.request('screen'); } catch {}
    };
    const onVisible = () => { if (document.visibilityState === 'visible') request(); };
    request();
    document.addEventListener('visibilitychange', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); lock?.release?.().catch(() => {}); };
  }, []);

  return (
    <div className={`ev ev--qr${skin.background ? ' ev--pattern' : ''}`} style={skinStyle(skin)} lang={skin.language}>
      <section className="ev__hero">
        <Logos skin={skin} />

        <div className="ev__panel ev__panel--qr">
          {skin.hero.waves && <Waves />}

          <div className="ev__left">
            {skin.hero.slogan && <p className="ev__slogan">Get More<br /><span>Direct.</span></p>}
            <p className="ev__eyebrow">{qr.eyebrow}</p>
            <h1 className="ev__h1">{qr.headline[0]}<br /><span>{qr.headline[1]}</span></h1>
            <p className="ev__lead">{rich(qr.lead)}</p>
            <ul className="ev__points">
              {qr.steps.map((step, i) => (
                <li key={step}>
                  <span className="ev__num">{i + 1}</span>
                  <span><b>{step}</b></span>
                </li>
              ))}
            </ul>
          </div>

          <div className="ev__card ev__qrcard">
            <div className="ev__body">
              {skin.urgency && <Urgency urgency={skin.urgency} timeZone={skin.timeZone} />}
              {skin.countdown && <Countdown countdown={skin.countdown} />}
              <div className="ev__qr" role="img" aria-label={qr.scanLabel} dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <p className="ev__qr-label">{qr.scanLabel}</p>
              <a className="ev__qr-tap" href={standHref}>{qr.tapText}</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
