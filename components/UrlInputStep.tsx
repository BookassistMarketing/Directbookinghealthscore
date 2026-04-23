'use client';

import React, { useState } from 'react';
import { Globe, AlertCircle, ArrowRight } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { Button } from './Button';

interface UrlInputStepProps {
  onSubmit: (url: string) => void;
  onSkipToStatic: () => void;
  failureCount: number;
  errorMessage: string | null;
}

export const UrlInputStep: React.FC<UrlInputStepProps> = ({
  onSubmit,
  onSkipToStatic,
  failureCount,
  errorMessage,
}) => {
  const { language } = useContent();
  const [value, setValue] = useState('');

  const labels: Record<Language, {
    heading: string;
    helper: string;
    placeholder: string;
    submit: string;
    fallbackLink: string;
    invalid: string;
    stepLabel: string;
  }> = {
    en: {
      heading: 'What is your hotel website?',
      helper: "We analyse your site's SEO and AI-search readiness to tailor this audit to you.",
      placeholder: 'yourhotel.com',
      submit: 'Analyse my site',
      fallbackLink: 'Continue without site analysis',
      invalid: 'Please enter a valid website URL.',
      stepLabel: 'Step 1',
    },
    it: {
      heading: 'Qual è il sito del tuo hotel?',
      helper: 'Analizziamo la preparazione SEO e di ricerca AI del tuo sito per personalizzare questo audit.',
      placeholder: 'tuohotel.com',
      submit: 'Analizza il mio sito',
      fallbackLink: 'Continua senza analisi del sito',
      invalid: 'Inserisci un URL valido.',
      stepLabel: 'Passo 1',
    },
    es: {
      heading: '¿Cuál es el sitio web de tu hotel?',
      helper: 'Analizamos la preparación SEO y de búsqueda con IA de tu sitio para adaptar esta auditoría a ti.',
      placeholder: 'tuhotel.com',
      submit: 'Analizar mi sitio',
      fallbackLink: 'Continuar sin análisis del sitio',
      invalid: 'Introduce una URL válida.',
      stepLabel: 'Paso 1',
    },
    pl: {
      heading: 'Jaka jest strona Twojego hotelu?',
      helper: 'Analizujemy gotowość SEO i wyszukiwania AI Twojej strony, aby dostosować ten audyt.',
      placeholder: 'twojhotel.pl',
      submit: 'Analizuj moją stronę',
      fallbackLink: 'Kontynuuj bez analizy strony',
      invalid: 'Wprowadź prawidłowy adres URL.',
      stepLabel: 'Krok 1',
    },
  };
  const l = labels[language];

  const normaliseUrl = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const u = new URL(withScheme);
      if (!u.hostname.includes('.')) return null;
      return u.toString();
    } catch {
      return null;
    }
  };

  const normalised = normaliseUrl(value);
  const canSubmit = normalised !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalised) onSubmit(normalised);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-20">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 text-brand-blue text-[10px] font-black tracking-widest uppercase mb-5">
          <Globe size={12} /> {l.stepLabel}
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">{l.heading}</h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">{l.helper}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="audit-url-input" className="sr-only">{l.heading}</label>
        <input
          id="audit-url-input"
          type="url"
          inputMode="url"
          autoComplete="url"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={l.placeholder}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'audit-url-error' : undefined}
          className="w-full px-5 py-4 text-lg rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition"
          autoFocus
        />

        {errorMessage && (
          <div
            id="audit-url-error"
            role="alert"
            className="flex items-center gap-2 text-sm text-brand-accent bg-rose-50 border border-rose-100 rounded-xl px-4 py-3"
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={!canSubmit}
          className="w-full py-4 text-lg rounded-xl font-black shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {l.submit} <ArrowRight size={18} className="inline ml-2" />
        </Button>
      </form>

      {failureCount >= 2 && (
        <div className="text-center mt-6">
          <button
            onClick={onSkipToStatic}
            className="text-sm text-gray-400 hover:text-brand-blue underline transition-colors"
          >
            {l.fallbackLink}
          </button>
        </div>
      )}
    </div>
  );
};
