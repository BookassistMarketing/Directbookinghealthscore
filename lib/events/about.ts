import type { AboutSection } from './types';

// "About Bookassist" panel for event pages, one per language. Only verified
// figures (25:1 and >15% / 87% from the homepage banner, +48% from the Hotel
// Degli Artisti Roma case study on bookassist.com/digital-media). Add a
// language here before using it in a skin.

const DM_GIF = { src: '/events/shared/dm.gif', w: 1120, h: 520 };
const BE_INTEL_GIF = { src: '/events/shared/be-intel.gif', w: 1120, h: 560 };

export const ABOUT_IT: AboutSection = {
  eyebrow: 'Chi è Bookassist',
  heading: 'Aiutiamo gli hotel a ottenere più prenotazioni dirette',
  intro: "Digital marketing, tecnologia e dati in un'unica partnership. Lavoriamo con te lungo tutto il **Guest Journey**, dalla prima ricerca alla prenotazione sul tuo sito, per far crescere i ricavi e ridurre il CPA.",
  pillars: [
    {
      img: { ...DM_GIF, alt: 'Digital Marketing Bookassist su smartphone: Search Ads, Metasearch, Display e AI Overview' },
      tag: 'Attrai',
      title: 'Digital Marketing',
      paragraphs: [
        'Search Ads, Metasearch, Display, AI Overview e molto altro. Il tuo **sito ufficiale davanti al viaggiatore**, ovunque cerchi.',
      ],
      figures: [
        { value: '25:1', label: 'ROI Digital Media' },
        { value: '+48%', label: 'Aumento dei ricavi, Hotel Degli Artisti Roma' },
      ],
    },
    {
      img: { ...BE_INTEL_GIF, alt: 'Il Booking Engine Bookassist con Rate Recommender su smartphone e la dashboard Intelligence su tablet' },
      tag: 'Converti e misura',
      title: 'Booking Engine e Intelligence',
      paragraphs: [
        '**Booking Engine:** il Rate Recommender suggerisce la tariffa giusta e il viaggiatore prenota diretto sul tuo sito.',
        '**Intelligence:** i tuoi dati in tempo reale per ottimizzare le campagne e ridurre il CPA.',
      ],
      figures: [
        { value: '>15%', label: 'Conversione Booking Engine' },
        { value: '87%', label: 'Camere prenotate con il Rate Recommender' },
      ],
    },
  ],
  closing: 'Uniamo esperienza, dati e tecnologia per mettere **il canale diretto al centro** del tuo hotel.',
};

export const ABOUT_EN: AboutSection = {
  eyebrow: 'About Bookassist',
  heading: 'We help hotels get more direct bookings',
  intro: 'Digital marketing, technology and data in one partnership. We work with you across the whole **Guest Journey**, from the first search to the booking on your website, to grow revenue and lower your CPA.',
  pillars: [
    {
      img: { ...DM_GIF, alt: 'Bookassist Digital Marketing on smartphones: Search Ads, Metasearch, Display and AI Overview' },
      tag: 'Attract',
      title: 'Digital Marketing',
      paragraphs: [
        'Search Ads, Metasearch, Display, AI Overview and much more. Your **official website in front of the traveller**, wherever they search.',
      ],
      figures: [
        { value: '25:1', label: 'Digital Media ROI' },
        { value: '+48%', label: 'Revenue growth, Hotel Degli Artisti Rome' },
      ],
    },
    {
      img: { ...BE_INTEL_GIF, alt: 'The Bookassist Booking Engine with Rate Recommender on a smartphone and the Intelligence dashboard on a tablet' },
      tag: 'Convert and measure',
      title: 'Booking Engine and Intelligence',
      paragraphs: [
        '**Booking Engine:** Rate Recommender suggests the right rate and the traveller books direct on your website.',
        '**Intelligence:** your data in real time to optimise campaigns and lower your CPA.',
      ],
      figures: [
        { value: '>15%', label: 'Booking Engine conversion' },
        { value: '87%', label: 'Rooms booked with Rate Recommender' },
      ],
    },
  ],
  closing: 'We bring together experience, data and technology to put **the direct channel at the heart** of your hotel.',
};
