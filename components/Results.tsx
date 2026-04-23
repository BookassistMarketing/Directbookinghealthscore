'use client';

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { RefreshCcw, ArrowRight, ExternalLink } from 'lucide-react';
import { Answer, AnswerValue, Language } from '../types';
import type { DynamicQuestion } from '../types';
import { useContent } from '../contexts/ContentContext';
import { Button } from './Button';
import { LeadCapture } from './LeadCapture';

interface ResultsProps {
  questions: DynamicQuestion[];
  answers: Answer[];
  onReset: () => void;
  onGetFullReport: () => void;
}

export const Results: React.FC<ResultsProps> = ({ questions, answers, onReset, onGetFullReport }) => {
  const [showGate, setShowGate] = useState(false);
  const { language } = useContent();

  const maxScore = questions.reduce((acc, q) => acc + q.weight, 0);

  const score = answers.reduce((acc, ans) => {
    if (ans.value === AnswerValue.YES) {
      const q = questions.find(q => q.id === ans.questionId);
      return acc + (q ? q.weight : 0);
    }
    return acc;
  }, 0);

  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);
  const missingCount = answers.filter(a => a.value === AnswerValue.NO).length;
  const passingCount = answers.length - missingCount;

  const statusMap: Record<Language, any> = {
    en: { critical: "Critical Condition", risk: "Digital Risk", optimized: "Optimised", subCritical: "Highly vulnerable to OTA dominance.", subRisk: "Missing profit-driving automation.", subOpt: "Performing well against industry benchmarks." },
    it: { critical: "Condizione Critica", risk: "Rischio Digitale", optimized: "Ottimizzato", subCritical: "Altamente vulnerabile al dominio delle OTA.", subRisk: "Manca l'automazione che genera profitto.", subOpt: "Ottime prestazioni rispetto ai benchmark di settore." },
    es: { critical: "Estado Crítico", risk: "Riesgo Digital", optimized: "Optimizado", subCritical: "Altamente vulnerable al dominio de las OTA.", subRisk: "Falta automatización que genere beneficios.", subOpt: "Buen desempeño frente a los estándares de la industria." },
    pl: { critical: "Stan Krytyczny", risk: "Ryzyko Cyfrowe", optimized: "Zoptymalizowany", subCritical: "Wysoce narażony na dominację OTA.", subRisk: "Brak automatyzacji generującej zyski.", subOpt: "Dobre wyniki w zestawieniu ze standardami branżowymi." }
  };

  const labelsMap: Record<Language, any> = {
    en: { auditComplete: "AUDIT COMPLETE", passing: "Passing Checks", gaps: "Critical Gaps", bookDemo: "Book a Demo", getFullReport: "Download Full Strategic Assessment", retake: "Retake Audit", generating: "Generating..." },
    it: { auditComplete: "AUDIT COMPLETATO", passing: "Controlli Superati", gaps: "Lacune Critiche", bookDemo: "Prenota una Demo", getFullReport: "Scarica Valutazione Strategica Completa", retake: "Rifai l'Audit", generating: "Generazione..." },
    es: { auditComplete: "AUDIT COMPLETADO", passing: "Pruebas Superadas", gaps: "Brechas Críticas", bookDemo: "Reservar una Demo", getFullReport: "Descargar Evaluación Estratégica Completa", retake: "Repetir Audit", generating: "Generando..." },
    pl: { auditComplete: "AUDYT ZAKOŃCZONY", passing: "Zaliczone Sprawdzenia", gaps: "Krytyczne Luki", bookDemo: "Zamów Prezentację", getFullReport: "Pobierz Pełną Ocenę Strategiczną", retake: "Powtórz Audyt", generating: "Generowanie..." }
  };

  const s = statusMap[language];
  const l = labelsMap[language];

  let status = s.critical;
  let color = "#E63946";
  let subtext = s.subCritical;

  if (percentage >= 40 && percentage < 70) {
    status = s.risk;
    color = "#F59E0B";
    subtext = s.subRisk;
  } else if (percentage >= 70) {
    status = s.optimized;
    color = "#2A9D8F";
    subtext = s.subOpt;
  }

  const data = [{ name: 'Score', value: score }, { name: 'Gap', value: maxScore - score }];

  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 py-12 flex flex-col items-center mx-auto">
      {showGate && (
        <LeadCapture onUnlock={() => { setShowGate(false); onGetFullReport(); }} />
      )}

      <div className="w-full flex justify-center">
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden w-full max-w-3xl">
          <div className="p-8 sm:p-14 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-shrink-0 relative w-48 h-48 sm:w-56 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" startAngle={90} endAngle={-270} dataKey="value" stroke="none" isAnimationActive={false}>
                    <Cell fill={color} />
                    <Cell fill="#F3F4F6" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-black" style={{ color }}>{percentage}%</span>
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Tech Score</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-black tracking-widest mb-6 uppercase">{l.auditComplete}</div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-tight">Status: <span style={{ color }}>{status}</span></h2>
              <p className="text-lg sm:text-xl text-gray-500 font-medium mb-8">{subtext}</p>
              <div className="flex gap-4 w-full max-w-sm mx-auto md:mx-0">
                <div className="flex-1 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">{passingCount}</div>
                  <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{l.passing}</div>
                </div>
                <div className="flex-1 bg-red-50 p-5 rounded-2xl border border-red-100 text-center">
                  <div className="text-2xl sm:text-3xl font-black text-brand-accent mb-1">{missingCount}</div>
                  <div className="text-[10px] text-red-400 font-black uppercase tracking-widest">{l.gaps}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mt-10 w-full max-w-3xl">
        <button onClick={onReset} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-bold uppercase tracking-widest text-[10px] transition-colors">
          <RefreshCcw size={16} />
          {l.retake}
        </button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button onClick={() => window.open('https://bookassist.com/book-a-demo', '_blank')} variant="outline" className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl">
            <ExternalLink size={18} />
            {l.bookDemo}
          </Button>
          <Button onClick={() => setShowGate(true)} className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl">
            {l.getFullReport} <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
