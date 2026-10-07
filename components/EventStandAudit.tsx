'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AiAudit } from './AiAudit';
import { ForceLanguage } from '../contexts/ContentContext';
import { saveEventReport, type ReportProof } from '../services/aiService';
import type { EventSkin } from '../lib/events/types';

// White label event stand page (/event/<slug>). Runs as a kiosk on a tablet:
// the hotelier fills in the event's HubSpot form, the AI Visibility Audit runs
// on their website, and the report is saved on their HubSpot contact, where the
// event's workflow emails it. All copy, images and colours come from the skin
// (lib/events/<slug>.ts).

// Same portal as LeadCapture. Fields added later in HubSpot show up here automatically.
const HUBSPOT_PORTAL_ID = '6862341';
const CONSENT_KEY = 'hhc_gemini_consent';

// Renders the skins' only markup, **bold**.
function rich(text: string): React.ReactNode {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

// Reads a field the visitor typed. v2 embeds pass an HTMLFormElement, older
// builds a jQuery wrapper; submissionValues arrives on onFormSubmitted in newer ones.
function readField(name: string, form: any, data?: any): string {
  const fromData = data?.submissionValues?.[name];
  if (typeof fromData === 'string' && fromData.trim()) return fromData.trim();
  const el: HTMLFormElement | undefined = form?.querySelector ? form : form?.[0];
  const input = el?.querySelector<HTMLInputElement>(`input[name="${name}"]`);
  return input?.value.trim() ?? '';
}

// Urgency pill above the form. The label can tighten on given days (event time zone).
function Urgency({ urgency, timeZone }: { urgency: NonNullable<EventSkin['urgency']>; timeZone: string }) {
  // Set after mount so the server render and the tablet's clock never disagree on hydration.
  const [label, setLabel] = useState(urgency.label);
  useEffect(() => {
    const tick = () => {
      const day = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date()); // YYYY-MM-DD
      setLabel(urgency.byDate?.[day] ?? urgency.label);
    };
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [urgency, timeZone]);
  return (
    <p className="ev__urgency">
      <span className="ev__pulse" aria-hidden="true" />
      {label}
    </p>
  );
}

// The four brand waves (spec: HubSpot/visual-system/VISUAL-SOURCE-OF-TRUTH.md §3.7,
// J_LINES/J_COLOURS from the homepage M13 module). Pure sines, each drifting slowly by one
// wavelength per loop (34 to 64 s, spec range), so the loop is seamless.
const WAVE = { w: 1440, h: 200, len: 720, amp: 55, stroke: 6 }; // amp 55 (mobile spec) so the band fits the gap under the slogan
const WAVE_LINES = [
  { colour: '#F8CF56', amp: 1.0, phase: 0, stroke: 1.0, drift: 44 },
  { colour: '#FF8F1B', amp: 0.72, phase: 1.9, stroke: 0.84, drift: 56 },
  { colour: '#F15B27', amp: 1.3, phase: 3.6, stroke: 0.75, drift: 64 },
  { colour: '#45AEB1', amp: 0.52, phase: 5.2, stroke: 0.66, drift: 34 },
];

function wavePath(amp: number, phase: number): string {
  const cy = WAVE.h / 2;
  const pts: string[] = [];
  // One extra wavelength on the right: it slides into view as the path drifts left.
  for (let x = -10; x <= WAVE.w + WAVE.len + 10; x += 8) {
    const y = cy + WAVE.amp * amp * Math.sin((x / WAVE.len) * 2 * Math.PI + phase);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}

function Waves() {
  return (
    <div className="ev__waves" aria-hidden="true">
      <svg viewBox={`0 0 ${WAVE.w} ${WAVE.h}`} preserveAspectRatio="xMidYMid slice">
        {WAVE_LINES.map(l => (
          <path key={l.colour} d={wavePath(l.amp, l.phase)} fill="none" stroke={l.colour}
            strokeWidth={WAVE.stroke * l.stroke} strokeLinecap="round" strokeLinejoin="round"
            style={{ animationDuration: `${l.drift}s` }} />
        ))}
      </svg>
    </div>
  );
}

function Logos({ skin }: { skin: EventSkin }) {
  return (
    <div className="ev__logos">
      {skin.partnerLogo && (
        <>
          <img className="ev__logo-l" src={skin.partnerLogo.src} alt={skin.partnerLogo.alt} />
          <span className="ev__logo-sep" aria-hidden="true" />
        </>
      )}
      <img className="ev__logo-r" src="/events/shared/bookassist-logo.png" alt="Bookassist" />
    </div>
  );
}

type Lead = { url: string; email: string; formStartedAt: number };

function StandForm({ skin, onLead }: { skin: EventSkin; onLead: (lead: Lead) => void }) {
  // Bumping formKey remounts the container and builds a fresh form for the next visitor.
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const created = useRef(false);
  const website = useRef('');
  const email = useRef('');
  const readyAt = useRef(Date.now());

  useEffect(() => {
    if (submitted) return;
    created.current = false;
    setReady(false);
    const target = `ev-hs-form-${formKey}`;

    const create = () => {
      const hbspt = (window as any).hbspt;
      if (!hbspt || created.current || !document.getElementById(target)) return;
      created.current = true;
      hbspt.forms.create({
        region: 'na1',
        portalId: HUBSPOT_PORTAL_ID,
        formId: skin.hubspotFormId,
        target: `#${target}`,
        submitText: skin.form.submitText,
        css: '', // drop HubSpot's default form styles; event.css styles the markup

        onFormReady: () => { readyAt.current = Date.now(); setReady(true); },
        onFormSubmit: (form: any) => { website.current = readField('website', form); email.current = readField('email', form); },
        onFormSubmitted: (form: any, data: any) => {
          const site = readField('website', form, data) || website.current;
          const mail = readField('email', form, data) || email.current;
          // With a website, hand over to the AI audit; without one, staff follow up by hand.
          if (site) onLead({ url: site, email: mail, formStartedAt: readyAt.current });
          else setSubmitted(true);
        },
      });
    };

    if (!(window as any).hbspt) {
      const existing = document.querySelector<HTMLScriptElement>('script[data-hs-v2]');
      if (!existing) {
        const s = document.createElement('script');
        s.src = 'https://js.hsforms.net/forms/embed/v2.js';
        s.async = true;
        s.dataset.hsV2 = '1';
        s.onload = create;
        document.head.appendChild(s);
      }
    } else {
      create();
    }
    // Fallback if the script was already loading from another mount.
    const poll = setInterval(() => { if (!created.current) create(); else clearInterval(poll); }, 500);
    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formKey, submitted]);

  if (submitted) {
    return (
      <div className="ev__thanks" role="status">
        <h3>{skin.thanks.title}</h3>
        <p>{rich(skin.thanks.text)}</p>
        <button
          type="button"
          className="ev__reset"
          onClick={() => { setSubmitted(false); setFormKey(k => k + 1); }}
        >
          {skin.resetText}
        </button>
      </div>
    );
  }

  return (
    <div className="ev__form">
      {!ready && <p className="ev__loading">{skin.form.loading}</p>}
      <div id={`ev-hs-form-${formKey}`} key={formKey} />
    </div>
  );
}

type SendState = 'idle' | 'sending' | 'sent' | 'failed';

function StandAuditView({ skin, lead, onReset }: { skin: EventSkin; lead: Lead; onReset: () => void }) {
  const [send, setSend] = useState<SendState>('idle');
  const sentFor = useRef<string | null>(null);

  // Saves the report on the HubSpot contact; the event's workflow sends the email.
  const handleReport = (report: string, proof: ReportProof | null) => {
    if (!lead.email || !proof || sentFor.current === proof.reportSig) return;
    sentFor.current = proof.reportSig;
    setSend('sending');
    saveEventReport({ event: skin.slug, email: lead.email, report, ...proof })
      .then(() => setSend('sent'))
      .catch(err => { console.error('[EventStandAudit] Saving the report failed:', err); setSend('failed'); });
  };

  return (
    <section className="ev__hero ev__hero--audit">
      <Logos skin={skin} />
      <div className="ev__audit">
        {send !== 'idle' && (
          <p className={`ev__send ev__send--${send}`} role="status">{skin.send[send]}</p>
        )}
        <ForceLanguage language={skin.language}>
          <AiAudit prefillUrl={lead.url} autoStart leadCaptured formStartedAt={lead.formStartedAt} onReset={onReset} onReport={handleReport} />
        </ForceLanguage>
        <div className="ev__audit-foot">
          <button type="button" className="ev__reset" onClick={onReset}>{skin.resetText}</button>
        </div>
      </div>
    </section>
  );
}

function About({ about }: { about: NonNullable<EventSkin['about']> }) {
  return (
    <section className="ev__about">
      <div className="ev__wrap">
        <div className="ev__head">
          <p className="ev__aeyebrow">{about.eyebrow}</p>
          <h2 className="ev__h2">{about.heading}</h2>
          <p className="ev__intro">{rich(about.intro)}</p>
        </div>

        {about.pillars.map((p, i) => (
          <div key={p.title} className={`ev__pillar${i % 2 === 1 ? ' is-flip' : ''}`}>
            <div className="ev__vis">
              <img src={p.img.src} alt={p.img.alt} width={p.img.w} height={p.img.h} loading="lazy" />
            </div>
            <div className="ev__txt">
              <span className="ev__tag">{p.tag}</span>
              <h3 className="ev__title">{p.title}</h3>
              <div className="ev__text">{p.paragraphs.map((t, j) => <p key={j}>{rich(t)}</p>)}</div>
              <div className="ev__figs">
                {p.figures.map(f => (
                  <div key={f.value}><b>{f.value}</b>{f.label}</div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <p className="ev__close">{rich(about.closing)}</p>
      </div>
    </section>
  );
}

function skinStyle(skin: EventSkin): React.CSSProperties {
  const style: Record<string, string> = {};
  if (skin.theme?.panel) style['--panel'] = skin.theme.panel;
  if (skin.theme?.highlight) style['--highlight'] = skin.theme.highlight;
  if (skin.theme?.accent) style['--accent'] = skin.theme.accent;
  if (skin.background) {
    style.backgroundImage = `url('${skin.background.image}')`;
    style.backgroundSize = `${skin.background.width}px ${skin.background.height}px`;
  }
  return style as React.CSSProperties;
}

export const EventStandAudit: React.FC<{ skin: EventSkin }> = ({ skin }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const { hero, person } = skin;

  // Local dev only: /event/<slug>?testLead=example.com jumps to the audit without a HubSpot submission.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const params = new URLSearchParams(window.location.search);
    const url = params.get('testLead');
    if (url) setLead({ url, email: params.get('testEmail') ?? '', formStartedAt: Date.now() - 5000 });
  }, []);

  const reset = () => {
    // Each visitor sees the Gemini disclosure for their own audit.
    try { sessionStorage.removeItem(CONSENT_KEY); } catch {}
    setLead(null);
    window.scrollTo(0, 0);
  };

  return (
    <div className={`ev${skin.background ? ' ev--pattern' : ''}`} style={skinStyle(skin)} lang={skin.language}>
      {lead ? (
        <StandAuditView key={lead.formStartedAt} skin={skin} lead={lead} onReset={reset} />
      ) : (
        <>
          <section className="ev__hero">
            <Logos skin={skin} />

            <div className={`ev__panel${hero.photo ? '' : ' ev__panel--nophoto'}`}>
              {hero.photo && (
                <div className="ev__photo">
                  <img src={hero.photo.src} alt={hero.photo.alt} />
                </div>
              )}
              {hero.waves && <Waves />}

              <div className="ev__left">
                {hero.slogan && <p className="ev__slogan">Get More<br /><span>Direct.</span></p>}
                <p className="ev__eyebrow">{hero.eyebrow}</p>
                <h1 className="ev__h1">{hero.headline[0]}<br /><span>{hero.headline[1]}</span></h1>
                <p className="ev__lead">{rich(hero.lead)}</p>
                <ul className="ev__points">
                  {hero.points.map((p, i) => (
                    <li key={p.title}>
                      <span className="ev__num">{i + 1}</span>
                      <span><b>{p.title}</b><small>{p.text}</small></span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ev__card">
                {person && (
                  <div className="ev__person">
                    <img src={person.photo} alt={person.name} width={64} height={64} />
                    <p>{person.intro}<b>{person.name}</b>{person.role}</p>
                  </div>
                )}
                <div className="ev__body">
                  {skin.urgency && <Urgency urgency={skin.urgency} timeZone={skin.timeZone} />}
                  <h2 className="ev__ftitle">{skin.form.title}</h2>
                  <p className="ev__fsub">{rich(skin.form.sub)}</p>
                  <StandForm skin={skin} onLead={l => { setLead(l); window.scrollTo(0, 0); }} />
                </div>
              </div>
            </div>
          </section>

          {skin.about && <About about={skin.about} />}
        </>
      )}
    </div>
  );
};
