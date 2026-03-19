import React, { useState } from 'react';
import { Answer, AnswerValue, Language } from '../types';
import { QUESTIONS, CATEGORY_TRANSLATIONS } from '../constants';
import { useContent } from '../contexts/ContentContext';
import { CheckCircle2, XCircle } from 'lucide-react';
import { EditableText } from './Editable';

interface QuizProps {
  onComplete: (answers: Answer[]) => void;
}

export const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const { language } = useContent();

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex) / QUESTIONS.length) * 100;

  const handleAnswer = (value: AnswerValue) => {
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      value: value
    };
    
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(updatedAnswers);
    }
  };

  const qId = `quiz.q${currentQuestion.id}`;
  const translatedCategory = CATEGORY_TRANSLATIONS[currentQuestion.category]?.[language] || currentQuestion.category;
  
  const labelMap: Record<Language, { progress: string; yes: string; no: string; live: string }> = {
    en: { progress: 'Diagnostic Progress', yes: 'Yes, fully implemented', no: 'No, not yet', live: 'Live Analysis Active' },
    it: { progress: 'Avanzamento Diagnosi', yes: 'Sì, completamente implementato', no: 'No, non ancora', live: 'Analisi in Tempo Reale Attiva' },
    es: { progress: 'Progreso del Diagnóstico', yes: 'Sí, totalmente implementado', no: 'No, todavía no', live: 'Análisis en Vivo Activo' }
  };

  const labels = labelMap[language];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-8 w-full flex flex-col h-full">
      <div className="mb-6 sm:mb-8 flex-shrink-0">
        <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          <span>
             <EditableText id="quiz.progress.label" defaultText={labels.progress} as="span" />
          </span>
          <span>{currentIndex + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-blue transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden min-h-[50vh] sm:min-h-[400px] flex flex-col flex-grow">
        <div className="p-5 sm:p-12 flex-grow flex flex-col justify-center">
          <span className="inline-block px-3 py-1 bg-blue-50 text-brand-blue text-xs font-bold tracking-wider rounded-full mb-4 sm:mb-6 w-fit">
            {translatedCategory.toUpperCase()}
          </span>
          
          <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-snug">
             <EditableText 
               id={`${qId}.text`} 
               defaultText={currentQuestion.translations[language].text} 
               multiline 
             />
          </div>
          
          <div className="text-gray-500 text-base sm:text-lg leading-relaxed">
             <EditableText 
               id={`${qId}.subtext`} 
               defaultText={currentQuestion.translations[language].subtext} 
               multiline
             />
          </div>
        </div>

        <div className="bg-gray-50 p-4 sm:p-10 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-auto">
          <button
            onClick={() => handleAnswer(AnswerValue.NO)}
            className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-brand-accent hover:text-brand-accent hover:bg-red-50 transition-all duration-200 group active:scale-[0.98]"
          >
            <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="font-semibold text-lg">
               <EditableText id="quiz.btn.no" defaultText={labels.no} as="span" />
            </span>
          </button>

          <button
            onClick={() => handleAnswer(AnswerValue.YES)}
            className="flex items-center justify-center gap-3 p-4 rounded-xl border-2 border-gray-200 bg-white text-gray-600 hover:border-brand-success hover:text-brand-success hover:bg-teal-50 transition-all duration-200 group active:scale-[0.98]"
          >
            <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className="font-semibold text-lg">
               <EditableText id="quiz.btn.yes" defaultText={labels.yes} as="span" />
            </span>
          </button>
        </div>
      </div>
      
      <div className="mt-6 sm:mt-8 text-center text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-2 flex-shrink-0">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
        <EditableText id="quiz.live.indicator" defaultText={labels.live} as="span" />
      </div>
    </div>
  );
};