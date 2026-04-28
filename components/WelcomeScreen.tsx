'use client';

import React from 'react';
import { Activity, BarChart3, Stethoscope } from 'lucide-react';
import { Button } from './Button';
import { EditableText } from './Editable';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const { language } = useContent();

  const labelsMap: Record<Language, any> = {
    en: { title: "Hotel Health Clinic", subtitle: "Official Tech Stack Audit", desc: "Are you losing direct revenue to OTAs due to invisible technical gaps? This <strong>Hotel Tech & Marketing Audit</strong> assesses your booking capability against the top 5% of performing hotels worldwide.", c1t: "Vulnerability Check", c1d: "Detect tracking failures and data loss.", c2t: "Conversion Logic", c2d: "Analyse funnel friction points.", c3t: "Health Score", c3d: "Get your certified maturity index.", cta: "Start Diagnostic", footer: "Data-driven. Confidential." },
    it: { title: "Hotel Health Clinic", subtitle: "Audit Tecnologico Ufficiale", desc: "Stai perdendo entrate dirette a favore delle OTA a causa di lacune tecniche invisibili? Questo <strong>Audit Tecnologico e di Marketing</strong> valuta la tua capacità di prenotazione rispetto al top 5% degli hotel più performanti al mondo.", c1t: "Controllo Vulnerabilità", c1d: "Rileva errori di tracciamento e perdita dati.", c2t: "Logica di Conversione", c2d: "Analizza i punti di frizione del funnel.", c3t: "Punteggio di Salute", c3d: "Ottieni il tuo indice di maturità certificato.", cta: "Inizia la Diagnosi", footer: "Basato sui dati. Riservato." },
    es: { title: "Hotel Health Clinic", subtitle: "Auditoría Tecnológica Oficial", desc: "¿Estás perdiendo ingresos directos frente a las OTA debido a brechas técnicas invisibles? Esta <strong>Auditoría de Tecnología y Marketing</strong> evalúa tu capacidad de reserva frente al top 5% de los hoteles con mejor desempeño del mundo.", c1t: "Control de Vulnerabilidad", c1d: "Detecta fallos de seguimiento y pérdida de datos.", c2t: "Lógica de Conversión", c2d: "Analiza puntos de fricción del embudo.", c3t: "Puntuación de Salud", c3d: "Obtén tu índice de madurez certificado.", cta: "Iniciar Diagnóstico", footer: "Basado en datos. Confidencial." },
    pl: { title: "Hotel Health Clinic", subtitle: "Oficjalny Audyt Stosu Technologicznego", desc: "Czy tracisz bezpośrednie przychody na rzecz OTA z powodu niewidocznych luk technicznych? Ten <strong>Audyt Technologii i Marketingu Hotelowego</strong> ocenia Twoją zdolność rezerwacyjną w zestawieniu z najlepszymi 5% hoteli na świecie.", c1t: "Kontrola Podatności", c1d: "Wykrywaj błędy śledzenia i utratę danych.", c2t: "Logika Konwersji", c2d: "Analizuj punkty tarcia w lejku sprzedażowym.", c3t: "Wynik Zdrowia", c3d: "Uzyskaj swój certyfikowany indeks dojrzałości.", cta: "Rozpocznij Diagnozę", footer: "Oparte na danych. Poufne." },
    fr: { title: "Hotel Health Clinic", subtitle: "Audit Technologique Officiel", desc: "Perdez-vous des revenus directs au profit des OTA en raison de lacunes techniques invisibles ? Cet <strong>Audit Technologie & Marketing Hôtelier</strong> évalue votre capacité de réservation par rapport aux 5 % d'hôtels les plus performants au monde.", c1t: "Contrôle de Vulnérabilité", c1d: "Détectez les défaillances de suivi et les pertes de données.", c2t: "Logique de Conversion", c2d: "Analysez les points de friction du tunnel.", c3t: "Score de Santé", c3d: "Obtenez votre indice de maturité certifié.", cta: "Lancer le Diagnostic", footer: "Basé sur les données. Confidentiel." },
    de: { title: "Hotel Health Clinic", subtitle: "Offizieller Tech-Stack-Audit", desc: "Verlieren Sie Direktumsatz an OTAs aufgrund unsichtbarer technischer Lücken? Dieser <strong>Hotel-Tech- & Marketing-Audit</strong> bewertet Ihre Buchungsfähigkeit im Vergleich zu den Top 5 % der leistungsstärksten Hotels weltweit.", c1t: "Schwachstellen-Check", c1d: "Tracking-Fehler und Datenverluste erkennen.", c2t: "Conversion-Logik", c2d: "Reibungspunkte im Funnel analysieren.", c3t: "Health Score", c3d: "Erhalten Sie Ihren zertifizierten Reife-Index.", cta: "Diagnose starten", footer: "Datenbasiert. Vertraulich." },
    cs: { title: "Hotel Health Clinic", subtitle: "Oficiální Audit Tech Stacku", desc: "Přicházíte o přímé příjmy ve prospěch OTA kvůli neviditelným technickým mezerám? Tento <strong>Audit hotelové technologie a marketingu</strong> hodnotí vaši rezervační schopnost ve srovnání s 5 % nejvýkonnějších hotelů na světě.", c1t: "Kontrola zranitelnosti", c1d: "Odhalte selhání trackingu a ztráty dat.", c2t: "Konverzní logika", c2d: "Analyzujte třecí body v trychtýři.", c3t: "Health Score", c3d: "Získejte certifikovaný index zralosti.", cta: "Spustit diagnostiku", footer: "Založeno na datech. Důvěrné." }
  };

  const l = labelsMap[language];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12 lg:px-8 flex flex-col items-center text-center">
      <div className="bg-white p-4 rounded-full shadow-lg mb-6 sm:mb-8">
        <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12 text-brand-blue" />
      </div>
      
      <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6 leading-tight">
        <EditableText id="welcome.title" defaultText={l.title} as="span" />
        <span className="block text-xl sm:text-3xl text-brand-blue mt-2 font-medium">
          <EditableText id="welcome.subtitle" defaultText={l.subtitle} as="span" />
        </span>
      </h1>
      
      <div className="max-w-2xl text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 leading-relaxed mx-auto px-2">
        <EditableText id="welcome.desc" defaultText={l.desc} multiline />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl mb-10 sm:mb-12">
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <Activity className="w-8 h-8 text-brand-accent mb-3 sm:mb-4 mx-auto" />
          <h3 className="font-semibold text-gray-900 mb-2">
            <EditableText id="welcome.card1.title" defaultText={l.c1t} as="span" />
          </h3>
          <p className="text-sm text-gray-500">
            <EditableText id="welcome.card1.desc" defaultText={l.c1d} as="span" />
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <BarChart3 className="w-8 h-8 text-brand-blue mb-3 sm:mb-4 mx-auto" />
          <h3 className="font-semibold text-gray-900 mb-2">
            <EditableText id="welcome.card2.title" defaultText={l.c2t} as="span" />
          </h3>
          <p className="text-sm text-gray-500">
            <EditableText id="welcome.card2.desc" defaultText={l.c2d} as="span" />
          </p>
        </div>
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100">
          <Stethoscope className="w-8 h-8 text-brand-success mb-3 sm:mb-4 mx-auto" />
          <h3 className="font-semibold text-gray-900 mb-2">
            <EditableText id="welcome.card3.title" defaultText={l.c3t} as="span" />
          </h3>
          <p className="text-sm text-gray-500">
            <EditableText id="welcome.card3.desc" defaultText={l.c3d} as="span" />
          </p>
        </div>
      </div>

      <Button onClick={onStart} className="w-full sm:w-auto text-lg px-10 py-4 shadow-lg">
        <EditableText id="welcome.cta" defaultText={l.cta} as="span" />
      </Button>
      
      <p className="mt-4 text-xs sm:text-sm text-gray-400">
        <EditableText id="welcome.footer" defaultText={l.footer} as="span" />
      </p>
    </div>
  );
};