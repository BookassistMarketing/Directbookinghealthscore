'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { localePrefix } from '../lib/i18n';

const STORAGE_KEY = 'hhc_cookie_notice';

const labels: Record<Language, { body: string; learnMore: string; accept: string }> = {
  en: {
    body: 'We use cookies to remember your language preference and AI processing consent.',
    learnMore: 'Learn more',
    accept: 'Got it',
  },
  it: {
    body: "Utilizziamo cookie per ricordare la tua preferenza linguistica e il consenso al trattamento da parte dell'AI.",
    learnMore: 'Scopri di più',
    accept: 'Ho capito',
  },
  es: {
    body: 'Usamos cookies para recordar tu preferencia de idioma y el consentimiento de procesamiento por IA.',
    learnMore: 'Más información',
    accept: 'Entendido',
  },
  pl: {
    body: 'Używamy plików cookie, aby zapamiętać Twoje preferencje językowe i zgodę na przetwarzanie AI.',
    learnMore: 'Dowiedz się więcej',
    accept: 'Rozumiem',
  },
  fr: {
    body: "Nous utilisons des cookies pour mémoriser votre préférence linguistique et votre consentement au traitement par IA.",
    learnMore: 'En savoir plus',
    accept: 'Compris',
  },
  de: {
    body: 'Wir verwenden Cookies, um Ihre Sprachpräferenz und Ihre Einwilligung zur KI-Verarbeitung zu speichern.',
    learnMore: 'Mehr erfahren',
    accept: 'Verstanden',
  },
  cs: {
    body: 'Používáme cookies, abychom si zapamatovali vaše jazykové preference a souhlas se zpracováním AI.',
    learnMore: 'Zjistit více',
    accept: 'Rozumím',
  },
};

export const CookieBanner: React.FC = () => {
  const { language } = useContent();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) !== 'accepted') {
      setShow(true);
    }
  }, []);

  const accept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'accepted');
    }
    setShow(false);
  };

  if (!mounted || !show) return null;

  const l = labels[language];

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-40 bg-white border-t border-gray-200 shadow-lg print:hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex items-start sm:items-center gap-3 flex-1">
          <Cookie size={18} className="text-brand-blue flex-shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {l.body}{' '}
            <Link
              href={`${localePrefix(language)}/security`}
              className="text-brand-blue underline hover:no-underline whitespace-nowrap"
            >
              {l.learnMore}
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={accept}
          className="self-end sm:self-auto bg-brand-blue text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors whitespace-nowrap"
        >
          {l.accept}
        </button>
      </div>
    </div>
  );
};
