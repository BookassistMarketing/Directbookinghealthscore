import type { Language } from '../../types';

// One "skin" per event stand page, served at /event/<slug>. Everything the page
// shows comes from here; components/EventStandAudit.tsx holds no event copy.
// Copy strings may use **bold** (rendered as <strong>); nothing else is parsed.
// Keep skins plain data: the API route imports them on the server.

export interface Img {
  src: string;
  alt: string;
}

export interface AboutPillar {
  img: Img & { w: number; h: number };
  tag: string;
  title: string;
  paragraphs: string[];
  figures: { value: string; label: string }[];
}

// The "about Bookassist" panel under the hero. Shared per language in about.ts.
export interface AboutSection {
  eyebrow: string;
  heading: string;
  intro: string;
  pillars: AboutPillar[];
  closing: string;
}

export interface EventSkin {
  // URL slug, and the value saved in the HubSpot contact property
  // `event_audit_event` that the event's workflow filters on. Never change it
  // once the workflow is live.
  slug: string;
  name: string; // e.g. 'TTG Travel Experience 2026' (logs, alt text)
  language: Language; // page copy + the AI audit report language
  timeZone: string; // for the urgency label dates, e.g. 'Europe/Rome'
  pageTitle: string; // browser tab

  // HubSpot form on the stand (portal 6862341). Needs `email` and `website`
  // fields: the audit runs on `website`, the report is saved on `email`.
  hubspotFormId: string;

  // Optional colour overrides (CSS colours). Defaults are the Bookassist palette.
  theme?: {
    panel?: string; // hero panel background (navy)
    highlight?: string; // eyebrow, 2nd headline line, person strip (yellow)
    accent?: string; // urgency pill (red)
  };
  // Page background tile, e.g. a logo pattern. Omit for plain light grey.
  background?: { image: string; width: number; height: number };

  // Event logo shown left of the Bookassist logo. Omit for Bookassist only.
  partnerLogo?: Img;

  hero: {
    photo?: Img; // top left of the panel, fades into the panel colour
    waves: boolean; // the four drifting brand waves
    slogan: boolean; // "Get More Direct." (never translated)
    eyebrow: string; // e.g. 'TTG 2026 · Pad. C5 · Stand 324'
    headline: [string, string]; // 2nd line in the highlight colour
    lead: string;
    points: { title: string; text: string }[];
  };

  // Salesperson strip on top of the form card. Omit to hide it.
  person?: { photo: string; name: string; role: string; intro: string };

  form: {
    title: string;
    sub: string;
    submitText: string;
    loading: string;
  };

  // Pill above the form. `byDate` (YYYY-MM-DD in timeZone) overrides `label` on
  // those days, e.g. "last day". Omit to hide it.
  urgency?: { label: string; byDate?: Record<string, string> };

  // Shown when the form is sent without a website (no audit runs, staff follow up).
  thanks: { title: string; text: string };

  // Status strip above the report while it is saved on the HubSpot contact.
  send: { sending: string; sent: string; failed: string };

  resetText: string; // "new visitor" button

  about?: AboutSection;
}
