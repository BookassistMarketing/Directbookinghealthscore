'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Lock, FileText, CheckCircle, ShieldCheck, Loader2, ShieldAlert } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

interface LeadCaptureProps {
  onUnlock: () => void;
}

export const LeadCapture: React.FC<LeadCaptureProps> = ({ onUnlock }) => {
  const { language } = useContent();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBypass, setShowBypass] = useState(false);
  const formInitialized = useRef(false);

  const labelsMap: Record<Language, any> = {
    en: {
      title: "Your Score is Ready. Now, Get the Strategy.",
      subtitle: "To unlock your custom AI Strategic Assessment and download your full report, please confirm your details below.",
      benefit1: "Full breakdown of revenue leaks",
      benefit2: "Prioritized technical repairs",
      benefit3: "AI strategic roadmap",
      loading: "Connecting to Audit Portal...",
      bypass: "Bypass Lock (Diagnostic Mode)"
    },
    it: {
      title: "Il tuo Report Strategico è Pronto",
      subtitle: "La tua infrastruttura tecnica è stata analizzata. Completa il modulo per sbloccare la valutazione.",
      benefit1: "Analisi completa perdite ricavo",
      benefit2: "Riparazioni tecniche prioritarie",
      benefit3: "Tabella di marcia AI",
      loading: "Connessione al portale...",
      bypass: "Bypass (Modalità Diagnostica)"
    },
    es: {
      title: "Tu Informe Estratégico está Listo",
      subtitle: "Tu infraestructura técnica ha sido analizada. Completa el formulario para desbloquear la evaluación.",
      benefit1: "Desglose de fugas de ingresos",
      benefit2: "Reparaciones técnicas priorizadas",
      benefit3: "Hoja de ruta estratégica IA",
      loading: "Conectando al portal...",
      bypass: "Bypass (Modo Diagnóstico)"
    }
  };

  const l = labelsMap[language];

  useEffect(() => {
    // UPDATED IDs from your provided embed snippet
    const portalId = "6862341";
    const formId = "f5a4b323-e8ff-4c48-bcd9-0f2014220dd0";
    
    const bypassTimer = setTimeout(() => setShowBypass(true), 8000);

    const createForm = () => {
      const hbspt = (window as any).hbspt;
      if (hbspt && !formInitialized.current) {
        console.log("Initializing HubSpot Form with ID:", formId);
        try {
          hbspt.forms.create({
            region: "na1",
            portalId: portalId,
            formId: formId,
            target: "#hubspot-form-container",
            onFormReady: () => {
              console.log("HubSpot Form Ready");
              setIsLoaded(true);
            },
            onFormSubmitted: () => {
              console.log("HubSpot Form Submitted");
              onUnlock();
            }
          });
          formInitialized.current = true;
        } catch (err) {
          console.error("HubSpot Form Creation Error:", err);
        }
      }
    };

    // Load HubSpot Script if it doesn't exist
    if (!(window as any).hbspt) {
      const script = document.createElement('script');
      script.src = "//js.hsforms.net/forms/embed/v2.js";
      script.type = "text/javascript";
      script.charset = "utf-8";
      script.async = true;
      script.onload = createForm;
      document.head.appendChild(script);
    } else {
      createForm();
    }

    // Polling fallback to ensure initialization after script load or dynamic render
    const poll = setInterval(() => {
      if ((window as any).hbspt && !formInitialized.current) {
        createForm();
      }
    }, 1000);

    // Message listener for cross-origin form events
    const handleHSMessages = (event: MessageEvent) => {
      if (event.data.type === 'hsFormCallback' && 
         (event.data.eventName === 'onFormSubmitted' || event.data.eventName === 'onFormCompleted')) {
        console.log("HubSpot completion event detected via message");
        onUnlock();
      }
    };
    window.addEventListener('message', handleHSMessages);

    return () => {
      window.removeEventListener('message', handleHSMessages);
      clearInterval(poll);
      clearTimeout(bypassTimer);
    };
  }, [onUnlock]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-xl overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full animate-in fade-in zoom-in duration-500 my-auto relative pointer-events-auto overflow-hidden">
        {/* Header Section */}
        <div className="bg-brand-blue p-8 sm:p-10 text-center text-white relative">
          <div className="absolute top-4 right-4 opacity-10">
            <Lock size={80} />
          </div>
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">{l.title}</h2>
          <p className="text-blue-100 text-sm leading-relaxed opacity-80 max-w-sm mx-auto">{l.subtitle}</p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 bg-white flex flex-col">
          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8">
            {[l.benefit1, l.benefit2, l.benefit3].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                <CheckCircle className="text-brand-blue w-3 h-3 flex-shrink-0" />
                <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tight leading-tight">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="relative min-h-[400px]">
            {/* The Actual HubSpot Target */}
            <div id="hubspot-form-container" className="w-full min-h-[400px]" />
            
            {!isLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white z-20 p-8 text-center">
                <Loader2 className="animate-spin text-brand-blue w-10 h-10" />
                <p className="text-gray-900 font-bold text-lg">{l.loading}</p>
                
                {showBypass && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 max-w-xs animate-in slide-in-from-bottom-2">
                    <ShieldAlert className="mx-auto text-amber-500 mb-2" size={20} />
                    <p className="text-[10px] text-amber-700 mb-3 leading-tight uppercase font-bold">
                      Extension check: If the form is blocked by your browser, you can proceed here.
                    </p>
                    <button 
                      onClick={onUnlock} 
                      className="text-brand-blue font-black underline text-[10px] uppercase tracking-widest"
                    >
                      {l.bypass}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
          <FileText size={14} className="text-brand-blue" />
          Confidential Strategic Assessment
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        #hubspot-form-container {
          width: 100%;
          min-height: 400px;
        }
        #hubspot-form-container iframe {
          width: 100% !important;
          border: none !important;
          min-height: 400px !important;
        }
        .hs-form .hs-button {
          background-color: #003366 !important;
          border-radius: 8px !important;
          padding: 12px 24px !important;
          font-weight: 700 !important;
          border: none !important;
          color: white !important;
          cursor: pointer !important;
        }
        .hs-input {
          border-radius: 6px !important;
          border-color: #e5e7eb !important;
        }
      `}} />
    </div>
  );
};
