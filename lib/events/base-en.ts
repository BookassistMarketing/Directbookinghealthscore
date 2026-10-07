import type { EventSkin } from './types';
import { ABOUT_EN } from './about';

// English base skin: the starting point for the next event. Placeholder
// eyebrow and dates; no partner logo, person or background pattern. Copy this
// file for a real event (see README.md). No workflow filters on 'base-en', so
// a test audit here saves the report on the contact but sends no email.
export const BASE_EN: EventSkin = {
  slug: 'base-en',
  name: 'Event base page (EN)',
  language: 'en',
  timeZone: 'Europe/Dublin',
  pageTitle: 'Free AI Visibility Audit · Bookassist',
  // TODO: English stand form (email, company, website). This is the TTG form (Italian labels).
  hubspotFormId: 'ad2ec816-545a-4d77-9f4b-7241421d0f8a',

  hero: {
    photo: { src: '/events/shared/trade-show.jpg', alt: 'Visitors walking between trade show stands' },
    waves: true,
    slogan: true,
    eyebrow: 'Event name 2027 · Hall 00 · Stand 000',
    headline: ['Is your hotel ready', 'for AI search?'],
    lead: 'We analyse your hotel website and send you a free audit, with your score and the actions to get more direct bookings.',
    points: [
      { title: 'Your score out of 100', text: 'How Google, ChatGPT and Gemini read your website today.' },
      { title: 'What holds your direct channel back', text: 'Structured data, content and the booking path.' },
      { title: 'Your priority fixes', text: 'What to fix first and how much your score can improve.' },
    ],
  },

  form: {
    title: 'Get your free audit, right now',
    sub: 'It takes 20 seconds: see your score right here at the stand, and get it by email too.',
    submitText: 'Get my audit',
    loading: 'Loading the form…',
  },

  urgency: { label: 'Only at the event · here at the stand' },

  thanks: {
    title: 'Thank you! We are already working on your audit.',
    text: 'We are analysing your hotel website and will email you the report shortly, with your score and the first actions to get more direct bookings.',
  },

  send: {
    sending: 'Sending the report by email…',
    sent: 'Report saved: it will arrive by email shortly.',
    failed: 'Automatic sending failed: download the PDF and send it from here.',
  },

  resetText: 'New visitor',

  about: ABOUT_EN,
};
