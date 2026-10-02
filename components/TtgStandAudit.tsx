'use client';

import React, { useEffect, useRef, useState } from 'react';

// HubSpot form created by Fabien for the TTG stand (E-mail, Nome azienda, URL sito web + consent).
// Same portal as LeadCapture. Fields added later in HubSpot show up here automatically.
const HUBSPOT_PORTAL_ID = '6862341';
const TTG_FORM_ID = 'ad2ec816-545a-4d77-9f4b-7241421d0f8a';
const SUBMIT_TEXT = 'Ricevi il tuo audit';

const POINTS = [
  { title: 'Il tuo punteggio su 100', text: 'Come Google, ChatGPT e Gemini leggono il tuo sito oggi.' },
  { title: 'Cosa frena il canale diretto', text: 'Dati strutturati, contenuti e percorso di prenotazione.' },
  { title: 'Le correzioni prioritarie', text: 'Cosa sistemare prima e quanto può migliorare il punteggio.' },
];

const PILLARS = [
  {
    img: '/ttg-2026/dm.gif', w: 1120, h: 520,
    alt: 'Digital Marketing Bookassist su smartphone: Search Ads, Metasearch, Display e AI Overview',
    tag: 'Attrai',
    title: 'Digital Marketing',
    body: (
      <p>Search Ads, Metasearch, Display, AI Overview e molto altro. Il tuo <strong>sito ufficiale davanti al viaggiatore</strong>, ovunque cerchi.</p>
    ),
    figures: [
      { value: '25:1', label: 'ROI Digital Media' },
      { value: '+48%', label: 'Aumento dei ricavi, Hotel Degli Artisti Roma' },
    ],
  },
  {
    img: '/ttg-2026/be-intel.gif', w: 1120, h: 560,
    alt: 'Il Booking Engine Bookassist con Rate Recommender su smartphone e la dashboard Intelligence su tablet',
    tag: 'Converti e misura',
    title: 'Booking Engine e Intelligence',
    body: (
      <>
        <p><strong>Booking Engine:</strong> il Rate Recommender suggerisce la tariffa giusta e il viaggiatore prenota diretto sul tuo sito.</p>
        <p><strong>Intelligence:</strong> i tuoi dati in tempo reale per ottimizzare le campagne e ridurre il CPA.</p>
      </>
    ),
    figures: [
      { value: '>15%', label: 'Conversione Booking Engine' },
      { value: '87%', label: 'Camere prenotate con il Rate Recommender' },
    ],
  },
];

function StandForm() {
  // Bumping formKey remounts the container and builds a fresh form for the next visitor.
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  const created = useRef(false);

  useEffect(() => {
    if (submitted) return;
    created.current = false;
    setReady(false);
    const target = `ttg-hs-form-${formKey}`;

    const create = () => {
      const hbspt = (window as any).hbspt;
      if (!hbspt || created.current || !document.getElementById(target)) return;
      created.current = true;
      hbspt.forms.create({
        region: 'na1',
        portalId: HUBSPOT_PORTAL_ID,
        formId: TTG_FORM_ID,
        target: `#${target}`,
        submitText: SUBMIT_TEXT,
        css: '', // drop HubSpot's default form styles; ttg.css styles the markup

        onFormReady: () => setReady(true),
        onFormSubmitted: () => setSubmitted(true),
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
  }, [formKey, submitted]);

  if (submitted) {
    return (
      <div className="ttg__thanks" role="status">
        <h3>Grazie! Siamo già al lavoro sul tuo audit.</h3>
        <p>Analizziamo il sito del tuo hotel e Susanna ti invierà il report via email a breve, con il tuo punteggio e le prime azioni per ottenere più prenotazioni dirette.</p>
        <button
          type="button"
          className="ttg__reset"
          onClick={() => { setSubmitted(false); setFormKey(k => k + 1); }}
        >
          Nuovo contatto
        </button>
      </div>
    );
  }

  return (
    <div className="ttg__form">
      {!ready && <p className="ttg__loading">Caricamento del modulo…</p>}
      <div id={`ttg-hs-form-${formKey}`} key={formKey} />
    </div>
  );
}

export const TtgStandAudit: React.FC = () => (
  <div className="ttg">
    <section className="ttg__hero">
      <div className="ttg__logos">
        <img className="ttg__logo-l" src="/ttg-2026/logo-ttg-transparent.png" alt="TTG Travel Experience" />
        <span className="ttg__logo-sep" aria-hidden="true" />
        <img className="ttg__logo-r" src="/ttg-2026/bookassist-logo.png" alt="Bookassist" />
      </div>

      <div className="ttg__panel">
        <div className="ttg__photo">
          <img src="/ttg-2026/hero-photo.jpg" alt="Visitatori tra gli stand del TTG Travel Experience" />
        </div>

        <div className="ttg__left">
          <p className="ttg__slogan">Get More<br /><span>Direct.</span></p>
          <p className="ttg__eyebrow">TTG 2026 · Pad. C5 · Stand 324</p>
          <h1 className="ttg__h1">Il tuo hotel è pronto<br /><span>per la ricerca AI?</span></h1>
          <p className="ttg__lead">Analizziamo il sito del tuo hotel e ti inviamo un audit gratuito, con il tuo punteggio e le azioni per ottenere più prenotazioni dirette.</p>
          <ul className="ttg__points">
            {POINTS.map((p, i) => (
              <li key={p.title}>
                <span className="ttg__num">{i + 1}</span>
                <span><b>{p.title}</b><small>{p.text}</small></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ttg__card">
          <div className="ttg__person">
            <img src="/ttg-2026/susanna-yellow.png" alt="Susanna Mazzoncini" width={64} height={64} />
            <p>Il tuo audit te lo invia<b>Susanna Mazzoncini</b>Senior Sales Executive, Bookassist</p>
          </div>
          <div className="ttg__body">
            <h2 className="ttg__ftitle">Ricevi il tuo audit gratuito</h2>
            <p className="ttg__fsub">Ti bastano 20 secondi. Lo ricevi via email.</p>
            <StandForm />
          </div>
        </div>
      </div>
    </section>

    <section className="ttg__about">
      <div className="ttg__wrap">
        <div className="ttg__head">
          <p className="ttg__aeyebrow">Chi è Bookassist</p>
          <h2 className="ttg__h2">Aiutiamo gli hotel a ottenere più prenotazioni dirette</h2>
          <p className="ttg__intro">Digital marketing, tecnologia e dati in un&apos;unica partnership. Lavoriamo con te lungo tutto il <strong>Guest Journey</strong>, dalla prima ricerca alla prenotazione sul tuo sito, per far crescere i ricavi e ridurre il CPA.</p>
        </div>

        {PILLARS.map((p, i) => (
          <div key={p.title} className={`ttg__pillar${i % 2 === 1 ? ' is-flip' : ''}`}>
            <div className="ttg__vis">
              <img src={p.img} alt={p.alt} width={p.w} height={p.h} loading="lazy" />
            </div>
            <div className="ttg__txt">
              <span className="ttg__tag">{p.tag}</span>
              <h3 className="ttg__title">{p.title}</h3>
              <div className="ttg__text">{p.body}</div>
              <div className="ttg__figs">
                {p.figures.map(f => (
                  <div key={f.value}><b>{f.value}</b>{f.label}</div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <p className="ttg__close">Uniamo esperienza, dati e tecnologia per mettere <strong>il canale diretto al centro</strong> del tuo hotel.</p>
      </div>
    </section>
  </div>
);
