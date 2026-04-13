'use client';

import React, { useRef, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { BrainCircuit, Download, Loader2, RefreshCcw, ArrowRight, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, MAX_SCORE } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { Button } from './Button';

interface FullResultsProps {
  answers: Answer[];
  analysis: string;
  analysisLoading: boolean;
  analysisError: string | null;
  onReset: () => void;
}

export const FullResults: React.FC<FullResultsProps> = ({ answers, analysis, analysisLoading, analysisError, onReset }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { language } = useContent();
  const scoreBoxRef = useRef<HTMLDivElement>(null);
  const aiBoxRef = useRef<HTMLDivElement>(null);

  const score = answers.reduce((acc, ans) => {
    if (ans.value === AnswerValue.YES) {
      const q = QUESTIONS.find(q => q.id === ans.questionId);
      return acc + (q ? q.weight : 0);
    }
    return acc;
  }, 0);

  const percentage = Math.round((score / MAX_SCORE) * 100);
  const missingCount = answers.filter(a => a.value === AnswerValue.NO).length;
  const passingCount = answers.length - missingCount;

  const statusMap: Record<Language, any> = {
    en: { critical: "Critical Condition", risk: "Digital Risk", optimized: "Optimised", subCritical: "Highly vulnerable to OTA dominance.", subRisk: "Missing profit-driving automation.", subOpt: "Performing well against industry benchmarks.", analyzing: "AI is analyzing your tech stack..." },
    it: { critical: "Condizione Critica", risk: "Rischio Digitale", optimized: "Ottimizzato", subCritical: "Altamente vulnerabile al dominio delle OTA.", subRisk: "Manca l'automazione che genera profitto.", subOpt: "Ottime prestazioni rispetto ai benchmark di settore.", analyzing: "L'IA sta analizzando la tua tecnologia..." },
    es: { critical: "Estado Crítico", risk: "Riesgo Digital", optimized: "Optimizado", subCritical: "Altamente vulnerable al dominio de las OTA.", subRisk: "Falta automatización que genere beneficios.", subOpt: "Buen desempeño frente a los estándares de la industria.", analyzing: "La IA está analizando tu tecnología..." }
  };

  const labelsMap: Record<Language, any> = {
    en: { auditComplete: "AUDIT COMPLETE", passing: "Passing Checks", gaps: "Critical Gaps", aiTitle: "AI Strategic Assessment", ctaTitle: "Visit bookassist.org to improve your Tech Score Today", downloadFull: "Download Full AI Strategic Assessment", retake: "Retake Audit", book: "Book Consultation", generating: "Exporting..." },
    it: { auditComplete: "AUDIT COMPLETATO", passing: "Controlli Superati", gaps: "Lacune Critiche", aiTitle: "Valutazione Strategica AI", ctaTitle: "Visita bookassist.org per migliorare il tuo Tech Score oggi stesso", downloadFull: "Scarica Valutazione Strategica AI Completa", retake: "Rifai l'Audit", book: "Prenota Consulenza", generating: "Esportazione..." },
    es: { auditComplete: "AUDIT COMPLETADO", passing: "Pruebas Superadas", gaps: "Brechas Críticas", aiTitle: "Evaluación Estratégica IA", ctaTitle: "Visita bookassist.org para mejorar tu Tech Score hoy mismo", downloadFull: "Descargar Evaluación Estratégica IA Completa", retake: "Repetir Audit", book: "Reservar Consultoría", generating: "Exportando..." }
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

  const data = [{ name: 'Score', value: score }, { name: 'Gap', value: MAX_SCORE - score }];

  const handleDownloadFullPdf = async () => {
    if (isGeneratingPdf || analysisLoading || !scoreBoxRef.current || !aiBoxRef.current) return;
    const html2canvas = (window as any).html2canvas;
    const jsPDFConstructor = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
    if (!html2canvas || !jsPDFConstructor) { window.print(); return; }

    setIsGeneratingPdf(true);
    try {
      const captureOpts = { scale: 2, useCORS: true, logging: false, backgroundColor: '#F4F6F8' };
      const scoreCanvas = await html2canvas(scoreBoxRef.current, captureOpts);
      const aiCanvas = await html2canvas(aiBoxRef.current, captureOpts);

      const pdf = new jsPDFConstructor({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const targetWidth = 175;
      const centerX = (pageWidth - targetWidth) / 2;

      const scoreImgData = scoreCanvas.toDataURL('image/jpeg', 0.95);
      const scoreProps = pdf.getImageProperties(scoreImgData);
      const scoreHeight = (scoreProps.height * targetWidth) / scoreProps.width;

      const aiImgData = aiCanvas.toDataURL('image/jpeg', 0.95);
      const aiProps = pdf.getImageProperties(aiImgData);
      const aiHeight = (aiProps.height * targetWidth) / aiProps.width;

      pdf.setFillColor(244, 246, 248);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      let currentY = 15;
      pdf.addImage(scoreImgData, 'JPEG', centerX, currentY, targetWidth, scoreHeight);
      currentY += scoreHeight + 12;

      if (currentY + aiHeight > pageHeight - 15) {
        pdf.addPage();
        pdf.setFillColor(244, 246, 248);
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');
        currentY = 15;
      }

      pdf.addImage(aiImgData, 'JPEG', centerX, currentY, targetWidth, aiHeight);
      pdf.save(`Hotel-Full-Strategic-Report-${percentage}pct.pdf`);
    } catch (err) {
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 sm:px-6 py-12 flex flex-col items-center mx-auto gap-10">

      {/* White Score Card */}
      <div ref={scoreBoxRef} className="w-full flex justify-center">
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

      {/* Blue AI Strategic Assessment */}
      <div ref={aiBoxRef} className="w-full flex justify-center">
        <div className="bg-brand-blue text-white rounded-[32px] shadow-2xl overflow-hidden w-full max-w-3xl">
          <div className="p-8 sm:p-10 border-b border-white/10 flex items-center justify-center gap-4 bg-white/5">
            <BrainCircuit className="w-7 h-7 text-blue-300" />
            <h3 className="text-lg sm:text-xl font-black uppercase tracking-[0.15em] opacity-90 text-center">{l.aiTitle}</h3>
          </div>
          <div className="p-8 sm:p-14">
            {analysisLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                <p className="text-xl text-blue-300 font-bold animate-pulse">{s.analyzing}</p>
              </div>
            ) : analysisError ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                <p className="text-blue-200 text-lg">Analysis generation failed. Please retake the audit.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <div className="prose prose-invert prose-blue max-w-none
                  prose-p:text-blue-50 prose-p:text-lg sm:prose-p:text-xl prose-p:leading-relaxed
                  prose-strong:text-white prose-strong:font-black
                  prose-h2:text-white prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-black
                  prose-li:text-blue-50 prose-li:text-lg">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
                <div className="pt-10 border-t border-white/10">
                  <a
                    href="https://bookassist.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col md:flex-row items-center gap-6 bg-white text-brand-blue p-8 rounded-[24px] shadow-2xl transition-all w-full no-underline hover:scale-[1.01]"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-brand-blue/5 rounded-full flex items-center justify-center">
                      <ExternalLink className="w-8 h-8" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="text-xl sm:text-2xl font-black leading-tight tracking-tight">{l.ctaTitle}</h4>
                      <p className="text-brand-blue/60 text-[10px] font-black uppercase tracking-widest mt-2">Global Leaders in Direct Revenue Strategy</p>
                    </div>
                    <ArrowRight className="hidden md:block w-10 h-10 opacity-30" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 w-full max-w-3xl">
        <button onClick={onReset} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 font-bold uppercase tracking-widest text-[10px] transition-colors">
          <RefreshCcw size={16} />
          {l.retake}
        </button>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Button
            onClick={handleDownloadFullPdf}
            variant="outline"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl"
            disabled={isGeneratingPdf || analysisLoading}
          >
            {isGeneratingPdf ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {isGeneratingPdf ? l.generating : l.downloadFull}
          </Button>
          <Button href="https://bookassist.org/book-a-demo" target="_blank" className="w-full sm:w-auto px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl">
            {l.book} <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
