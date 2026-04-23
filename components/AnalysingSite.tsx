'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

export const AnalysingSite: React.FC = () => {
  const { language } = useContent();
  const [step, setStep] = useState(0);

  const labels: Record<Language, string[]> = {
    en: [
      'Fetching your site…',
      'Checking SEO signals…',
      'Evaluating AI search readiness…',
    ],
    it: [
      'Recupero del tuo sito…',
      'Controllo dei segnali SEO…',
      'Valutazione della ricerca AI…',
    ],
    es: [
      'Obteniendo tu sitio…',
      'Comprobando señales SEO…',
      'Evaluando búsqueda con IA…',
    ],
    pl: [
      'Pobieranie Twojej strony…',
      'Sprawdzanie sygnałów SEO…',
      'Ocena gotowości wyszukiwania AI…',
    ],
  };
  const messages = labels[language];

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s + 1) % messages.length);
    }, 2000);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-center justify-center text-center">
      <Loader2 size={48} className="text-brand-blue animate-spin mb-8" />
      <p className="text-xl sm:text-2xl font-black text-gray-900 transition-opacity duration-300">
        {messages[step]}
      </p>
    </div>
  );
};
