import React from 'react';
import { Button } from './Button';
import { ShieldCheck, BarChart2, Globe, Zap } from 'lucide-react';
import { EditableText, EditableImage } from './Editable';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

interface HomeProps {
  onStart: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStart }) => {
  const { language } = useContent();

  const labelsMap: Record<Language, any> = {
    en: { title: 'Maximise Your <span class="text-brand-blue">Digital Revenue</span> Potential', subtitle: "The Hotel Health Clinic is the industry standard for assessing hospitality technology infrastructure. We analyse your <strong>Direct Booking Strategy</strong>, <strong>Metasearch Connectivity</strong>, and <strong>Marketing ROI</strong> to identify critical performance gaps.", cta: "Launch Free Tech Audit", f1t: "Secure Your Data", f1d: "In an era of privacy-first browsing, legacy tracking destroys attribution. Our audit checks for <strong>GA4 implementation</strong> and <strong>First-Party Data compliance</strong>.", f2t: "Dominate Metasearch", f2d: "Are you bidding on parity-loss dates? <strong>Metasearch Optimisation</strong> requires granular inventory management and real-time rate parity checks.", f3t: "High-Conversion Engines", f3d: "Friction kills conversion. From <strong>Digital Wallets</strong> to dynamic multi-currency, modern travellers demand a seamless experience.", f4t: "AI-Driven Personalisation", f4d: "Leverage <strong>Predictive Analytics</strong> and <strong>Dynamic Content Personalisation</strong> to serve the right offer to the right guest.", bt: "Ready to diagnose your digital health?", bd: "Join thousands of hoteliers optimising their revenue strategy. The audit takes less than 3 minutes.", bcta: "Start Assessment Now" },
    it: { title: 'Massimizza il tuo <span class="text-brand-blue">Potenziale di Ricavo</span> Digitale', subtitle: "L'Hotel Health Clinic è lo standard del settore per valutare l'infrastruttura tecnologica alberghiera. Analizziamo la tua <strong>Strategia di Prenotazione Diretta</strong> e il <strong>ROI del Marketing</strong>.", cta: "Lancia l'Audit Gratuito", f1t: "Proteggi i Tuoi Dati", f1d: "In un'era incentrata sulla privacy, il tracciamento legacy distrugge l'attribuzione. Verifichiamo la <strong>conformità ai dati di prima parte</strong>.", f2t: "Domina i Metamotori", f2d: "Stai puntando su date in perdita di parità? L'<strong>Ottimizzazione dei Metamotori</strong> richiede una gestione granulare dell'inventario.", f3t: "Motori ad Alta Conversione", f3d: "La frizione uccide la conversione. Dai <strong>Portafogli Digitali</strong> alle multi-valute dinamiche, i viaggiatori esigono fluidità.", f4t: "Personalizzazione AI", f4d: "Sfrutta l'<strong>Analisi Predittiva</strong> e la <strong>Personalizzazione dei Contenuti</strong> per servire l'offerta giusta all'ospite giusto.", bt: "Pronto a diagnosticare la tua salute digitale?", bd: "Unisciti a migliaia di albergatori che ottimizzano la loro strategia. L'audit richiede meno di 3 minuti.", bcta: "Inizia la Valutazione" },
    es: { title: 'Maximiza tu <span class="text-brand-blue">Potencial de Ingresos</span> Digitales', subtitle: "Hotel Health Clinic es el estándar de la industria para evaluar la infraestructura tecnológica hotelera. Analizamos tu <strong>Estrategia de Reserva Directa</strong> y el <strong>ROI de Marketing</strong>.", cta: "Iniciar Auditoría Gratuita", f1t: "Asegura tus Datos", f1d: "En la era de la privacidad, el seguimiento heredado destruye la atribución. Comprobamos la <strong>implementación de GA4</strong> y el cumplimiento de datos.", f2t: "Domina los Metabuscadores", f2d: "¿Estás pujando en fechas sin paridad? La <strong>Optimización de Metabuscadores</strong> requiere gestión de inventario en tiempo real.", f3t: "Motores de Alta Conversión", f3d: "La fricción mata la conversión. Desde <strong>Billeteras Digitales</strong> hasta multidivisa dinámica, el viajero exige fluidez.", f4t: "Personalización con IA", f4d: "Utiliza <strong>Analítica Predictiva</strong> y <strong>Personalización de Contenido</strong> para ofrecer la oferta adecuada al huésped adecuado.", bt: "¿Listo para diagnosticar tu salud digital?", bd: "Únete a miles de hoteleros que optimizan su estrategia. La auditoría toma menos de 3 minutos.", bcta: "Iniciar Evaluación Ahora" }
  };

  const l = labelsMap[language];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-10 sm:mb-16">
        <div className="mb-8 max-w-3xl mx-auto">
          <EditableText id="home.hero.title" as="h1" defaultText={l.title} className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4 sm:mb-6 leading-tight" />
          <EditableText id="home.hero.subtitle" as="p" multiline defaultText={l.subtitle} className="text-base sm:text-xl text-gray-600 leading-relaxed px-0 sm:px-4" />
        </div>
        <div className="mb-8 sm:mb-12">
            <EditableImage id="home.hero.image" defaultSrc="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200&auto=format&fit=crop" alt="Hotel Tech" className="w-full max-w-4xl mx-auto h-56 sm:h-96 object-cover rounded-2xl shadow-md" />
        </div>
        <div className="print:hidden">
          <Button onClick={onStart} className="w-full sm:w-auto mx-auto text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all">
            <EditableText id="home.hero.cta" defaultText={l.cta} as="span" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-12 mb-12 sm:mb-20">
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4"><ShieldCheck className="w-6 h-6 text-brand-blue" /></div>
          <EditableText id="home.feat1.title" as="h3" defaultText={l.f1t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat1.desc" as="p" multiline defaultText={l.f1d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-4"><Globe className="w-6 h-6 text-brand-success" /></div>
          <EditableText id="home.feat2.title" as="h3" defaultText={l.f2t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat2.desc" as="p" multiline defaultText={l.f2d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4"><Zap className="w-6 h-6 text-indigo-600" /></div>
          <EditableText id="home.feat3.title" as="h3" defaultText={l.f3t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat3.desc" as="p" multiline defaultText={l.f3d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 break-inside-avoid">
          <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center mb-4"><BarChart2 className="w-6 h-6 text-brand-accent" /></div>
          <EditableText id="home.feat4.title" as="h3" defaultText={l.f4t} className="text-xl sm:text-2xl font-bold text-gray-900 mb-2" />
          <EditableText id="home.feat4.desc" as="p" multiline defaultText={l.f4d} className="text-sm sm:text-base text-gray-600 leading-relaxed" />
        </div>
      </div>

      <div className="bg-brand-blue rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center text-white relative overflow-hidden print:hidden">
        <div className="relative z-10">
          <EditableText id="home.bottom.title" as="h2" defaultText={l.bt} className="text-2xl sm:text-3xl font-bold mb-4" />
          <EditableText id="home.bottom.desc" as="p" defaultText={l.bd} className="text-blue-100 mb-8 max-w-2xl mx-auto text-sm sm:text-base" />
          <Button onClick={onStart} variant="secondary" className="w-full sm:w-auto mx-auto px-8 py-3 text-lg font-semibold">
            <EditableText id="home.bottom.cta" defaultText={l.bcta} as="span" />
          </Button>
        </div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>
    </div>
  );
};