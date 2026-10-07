import type { EventSkin } from './types';
import { ABOUT_IT } from './about';

// TTG Travel Experience 2026, Rimini, 14 to 16 Oct, Pad. C5 Stand 324.
// Susanna's iPad. HubSpot: report email 223408146447, workflow 1894825613.
export const TTG_2026: EventSkin = {
  slug: 'ttg-2026',
  name: 'TTG Travel Experience 2026',
  language: 'it',
  timeZone: 'Europe/Rome',
  pageTitle: 'TTG 2026 · Audit gratuito',
  hubspotFormId: 'ad2ec816-545a-4d77-9f4b-7241421d0f8a',

  background: { image: '/events/ttg-2026/logo-pattern.png', width: 260, height: 150 },
  partnerLogo: { src: '/events/ttg-2026/partner-logo.png', alt: 'TTG Travel Experience' },

  hero: {
    photo: { src: '/events/ttg-2026/hero-photo.jpg', alt: 'Visitatori tra gli stand del TTG Travel Experience' },
    waves: true,
    slogan: true,
    eyebrow: 'TTG 2026 · Pad. C5 · Stand 324',
    headline: ['Il tuo hotel è pronto', 'per la ricerca AI?'],
    lead: 'Analizziamo il sito del tuo hotel e ti inviamo un audit gratuito, con il tuo punteggio e le azioni per ottenere più prenotazioni dirette.',
    points: [
      { title: 'Il tuo punteggio su 100', text: 'Come Google, ChatGPT e Gemini leggono il tuo sito oggi.' },
      { title: 'Cosa frena il canale diretto', text: 'Dati strutturati, contenuti e percorso di prenotazione.' },
      { title: 'Le correzioni prioritarie', text: 'Cosa sistemare prima e quanto può migliorare il punteggio.' },
    ],
  },

  person: {
    photo: '/events/shared/people/susanna-mazzoncini.png',
    name: 'Susanna Mazzoncini',
    role: 'Senior Sales Executive, Bookassist',
    intro: 'Il tuo audit te lo invia',
  },

  form: {
    title: 'Ricevi il tuo audit gratuito, adesso',
    sub: 'Ti bastano 20 secondi: vedi subito il tuo punteggio qui allo stand, con Susanna, e lo ricevi anche via email.',
    submitText: 'Ricevi il tuo audit',
    loading: 'Caricamento del modulo…',
  },

  urgency: {
    label: 'Solo al TTG · dal 14 al 16 ottobre',
    byDate: {
      '2026-10-14': 'Solo fino al 16 ottobre, qui allo stand',
      '2026-10-15': 'Solo fino al 16 ottobre, qui allo stand',
      '2026-10-16': 'Ultimo giorno al TTG · fino alle 17:30',
    },
  },

  thanks: {
    title: 'Grazie! Siamo già al lavoro sul tuo audit.',
    text: 'Analizziamo il sito del tuo hotel e Susanna ti invierà il report via email a breve, con il tuo punteggio e le prime azioni per ottenere più prenotazioni dirette.',
  },

  send: {
    sending: 'Invio del report via email in corso…',
    sent: 'Report salvato: arriverà via email a breve, con una copia a Susanna.',
    failed: 'Invio automatico non riuscito: scarica il PDF e invialo da qui.',
  },

  resetText: 'Nuovo contatto',

  about: ABOUT_IT,
};
