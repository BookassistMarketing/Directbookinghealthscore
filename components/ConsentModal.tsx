'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';
import { Button } from './Button';

interface ConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ onAccept, onDecline }) => {
  const { language } = useContent();

  const labels: Record<Language, {
    heading: string;
    body: string;
    learnMore: string;
    accept: string;
    decline: string;
  }> = {
    en: {
      heading: 'Before we start',
      body: 'Your website URL and audit answers will be processed by Google Gemini (our AI partner) to generate your tailored analysis. We do not store them. Do you accept and continue?',
      learnMore: 'Learn more about how we handle your data',
      accept: 'Accept and continue',
      decline: 'Cancel',
    },
    it: {
      heading: 'Prima di iniziare',
      body: "L'URL del tuo sito e le risposte dell'audit saranno elaborati da Google Gemini (il nostro partner AI) per generare la tua analisi personalizzata. Non li conserviamo. Accetti e vuoi continuare?",
      learnMore: 'Scopri come gestiamo i tuoi dati',
      accept: 'Accetto e continuo',
      decline: 'Annulla',
    },
    es: {
      heading: 'Antes de empezar',
      body: 'La URL de tu sitio y las respuestas de la auditoría serán procesadas por Google Gemini (nuestro socio de IA) para generar tu análisis personalizado. No las almacenamos. ¿Aceptas y quieres continuar?',
      learnMore: 'Más información sobre cómo tratamos tus datos',
      accept: 'Aceptar y continuar',
      decline: 'Cancelar',
    },
    pl: {
      heading: 'Zanim zaczniemy',
      body: 'Adres URL Twojej strony i odpowiedzi z audytu będą przetwarzane przez Google Gemini (naszego partnera AI) w celu wygenerowania spersonalizowanej analizy. Nie przechowujemy ich. Czy akceptujesz i chcesz kontynuować?',
      learnMore: 'Dowiedz się więcej o tym, jak obsługujemy Twoje dane',
      accept: 'Akceptuję i kontynuuję',
      decline: 'Anuluj',
    },
    fr: {
      heading: 'Avant de commencer',
      body: "L'URL de votre site web et les réponses de l'audit seront traitées par Google Gemini (notre partenaire IA) pour générer votre analyse personnalisée. Nous ne les conservons pas. Acceptez-vous et souhaitez-vous continuer ?",
      learnMore: 'En savoir plus sur la gestion de vos données',
      accept: 'Accepter et continuer',
      decline: 'Annuler',
    },
    de: {
      heading: 'Bevor wir beginnen',
      body: 'Die URL Ihrer Website und Ihre Audit-Antworten werden von Google Gemini (unserem KI-Partner) verarbeitet, um Ihre individuelle Analyse zu erstellen. Wir speichern sie nicht. Akzeptieren Sie und möchten Sie fortfahren?',
      learnMore: 'Mehr darüber erfahren, wie wir Ihre Daten behandeln',
      accept: 'Akzeptieren und fortfahren',
      decline: 'Abbrechen',
    },
    cs: {
      heading: 'Než začneme',
      body: 'URL vašeho webu a odpovědi z auditu budou zpracovány společností Google Gemini (naším AI partnerem) za účelem vytvoření vaší přizpůsobené analýzy. Neukládáme je. Souhlasíte a chcete pokračovat?',
      learnMore: 'Zjistit více o tom, jak nakládáme s vašimi daty',
      accept: 'Souhlasit a pokračovat',
      decline: 'Zrušit',
    },
  };
  const l = labels[language];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-modal-heading"
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand-blue" />
          </div>
          <h2 id="consent-modal-heading" className="text-xl sm:text-2xl font-black text-gray-900">
            {l.heading}
          </h2>
        </div>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">{l.body}</p>

        <Link
          href="/security"
          className="inline-block text-xs text-brand-blue underline hover:no-underline mb-6"
        >
          {l.learnMore}
        </Link>

        <div className="flex flex-col sm:flex-row-reverse gap-3">
          <Button
            onClick={onAccept}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg"
          >
            {l.accept}
          </Button>
          <button
            onClick={onDecline}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            {l.decline}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConsentDeclinedScreenProps {
  onReconsider: () => void;
  onGoHome: () => void;
}

export const ConsentDeclinedScreen: React.FC<ConsentDeclinedScreenProps> = ({ onReconsider, onGoHome }) => {
  const { language } = useContent();

  const labels: Record<Language, {
    heading: string;
    body: string;
    reconsider: string;
    goHome: string;
  }> = {
    en: {
      heading: 'We can\'t run the audit without this',
      body: 'To tailor your hotel health score, we need to send your website URL and answers to Google Gemini. Without your agreement we can\'t provide the analysis.',
      reconsider: 'Review again',
      goHome: 'Go back home',
    },
    it: {
      heading: 'Non possiamo eseguire l\'audit senza questo',
      body: 'Per personalizzare il tuo punteggio di salute alberghiera, dobbiamo inviare l\'URL del tuo sito e le risposte a Google Gemini. Senza il tuo consenso non possiamo fornire l\'analisi.',
      reconsider: 'Rivedi',
      goHome: 'Torna alla home',
    },
    es: {
      heading: 'No podemos ejecutar la auditoría sin esto',
      body: 'Para personalizar la puntuación de salud de tu hotel, necesitamos enviar la URL de tu sitio y las respuestas a Google Gemini. Sin tu consentimiento no podemos ofrecer el análisis.',
      reconsider: 'Revisar de nuevo',
      goHome: 'Volver al inicio',
    },
    pl: {
      heading: 'Nie możemy przeprowadzić audytu bez tego',
      body: 'Aby dostosować wynik zdrowia Twojego hotelu, musimy wysłać adres URL Twojej strony i odpowiedzi do Google Gemini. Bez Twojej zgody nie możemy dostarczyć analizy.',
      reconsider: 'Przejrzyj ponownie',
      goHome: 'Powrót do strony głównej',
    },
    fr: {
      heading: "Nous ne pouvons pas effectuer l'audit sans cela",
      body: "Pour personnaliser le score de santé de votre hôtel, nous devons envoyer l'URL de votre site et vos réponses à Google Gemini. Sans votre accord, nous ne pouvons pas fournir l'analyse.",
      reconsider: 'Revoir',
      goHome: "Retour à l'accueil",
    },
    de: {
      heading: 'Ohne diese Zustimmung können wir den Audit nicht durchführen',
      body: 'Um den Health Score Ihres Hotels zu personalisieren, müssen wir die URL Ihrer Website und Ihre Antworten an Google Gemini senden. Ohne Ihre Zustimmung können wir die Analyse nicht bereitstellen.',
      reconsider: 'Erneut prüfen',
      goHome: 'Zurück zur Startseite',
    },
    cs: {
      heading: 'Bez tohoto souhlasu nemůžeme audit provést',
      body: 'Abychom mohli přizpůsobit health score vašeho hotelu, musíme odeslat URL vašeho webu a odpovědi do Google Gemini. Bez vašeho souhlasu nemůžeme analýzu poskytnout.',
      reconsider: 'Znovu zkontrolovat',
      goHome: 'Zpět na úvod',
    },
  };
  const l = labels[language];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-20 sm:py-32 text-center">
      <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-7 h-7 text-brand-accent" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">{l.heading}</h2>
      <p className="text-base text-gray-500 leading-relaxed mb-8 max-w-md mx-auto">{l.body}</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onReconsider}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest"
        >
          {l.reconsider}
        </Button>
        <button
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          {l.goHome}
        </button>
      </div>
    </div>
  );
};
