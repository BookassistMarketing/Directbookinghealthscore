'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Activity, Menu, X, Globe } from 'lucide-react';
import { EditableText } from './Editable';
import { useContent } from '../contexts/ContentContext';
import { Language } from '../types';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage } = useContent();
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const isActive = (path: string) => {
    if (path === '/blog') return pathname.startsWith('/blog');
    return pathname === path;
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'it', label: 'Italiano' },
    { code: 'es', label: 'Español' },
    { code: 'pl', label: 'Polski' },
  ];

  const headerLabels: Record<Language, { contact: string; start: string }> = {
    en: { contact: 'Contact Us', start: 'Start Audit' },
    it: { contact: 'Contattaci', start: "Inizia l'Audit" },
    es: { contact: 'Contáctanos', start: 'Empieza el Audit' },
    pl: { contact: 'Kontakt', start: 'Rozpocznij Audyt' },
  };

  const labels = headerLabels[language];

  return (
    <div className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] bg-[#F4F6F8] font-sans text-gray-900 flex flex-col print:bg-white print:h-auto print:min-h-0">
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200 print:static print:shadow-none print:border-b-2 print:border-brand-blue">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer active:opacity-80 transition-opacity flex-shrink-0"
            onClick={() => navigateTo('/')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-blue rounded-lg flex items-center justify-center shadow-md flex-shrink-0 print:shadow-none">
              <Activity className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg sm:text-xl font-bold text-brand-blue tracking-tight leading-none">
                <EditableText id="app.header.title" defaultText="Direct Booking Health Score" as="span" />
              </h1>
              <p className="hidden sm:block text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1 print:block">
                <EditableText id="app.header.subtitle" defaultText="Hotel Tech & Marketing Audit Tool" as="span" />
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200 print:hidden">
              <Globe size={16} className="text-gray-400 ml-1" />
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2 py-1 text-[10px] sm:text-xs font-bold rounded uppercase transition-colors ${
                    language === lang.code
                      ? 'bg-brand-blue text-white shadow-sm'
                      : 'text-gray-400 hover:text-brand-blue hover:bg-white'
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-6 lg:gap-8 print:hidden">
              <button
                onClick={() => navigateTo('/')}
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('/hotel-audit')}
                className={`text-sm font-medium transition-colors ${isActive('/hotel-audit') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}
              >
                Hotel Audit
              </button>
              <button
                onClick={() => navigateTo('/blog')}
                className={`text-sm font-medium transition-colors ${isActive('/blog') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}
              >
                Blog
              </button>
              <button
                onClick={() => navigateTo('/contact')}
                className={`text-sm font-medium transition-colors ${isActive('/contact') ? 'text-brand-blue font-bold' : 'text-gray-500 hover:text-brand-blue'}`}
              >
                {labels.contact}
              </button>
              <button
                onClick={() => navigateTo('/hotel-audit')}
                className="bg-brand-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors shadow-sm"
              >
                {labels.start}
              </button>
            </div>

            <div className="md:hidden flex items-center print:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 top-16 sm:top-20 z-40 h-[calc(100vh-4rem)] overflow-y-auto print:hidden">
            <div className="px-4 py-6 space-y-3 flex flex-col pb-20">
              <button
                onClick={() => navigateTo('/')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Home
              </button>
              <button
                onClick={() => navigateTo('/hotel-audit')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/hotel-audit') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Hotel Audit Tool
              </button>
              <button
                onClick={() => navigateTo('/blog')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/blog') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Blog
              </button>
              <button
                onClick={() => navigateTo('/contact')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/contact') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {labels.contact}
              </button>
              <button
                onClick={() => navigateTo('/security')}
                className={`text-left px-4 py-4 rounded-lg text-lg ${isActive('/security') ? 'bg-blue-50 text-brand-blue font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                Security & Privacy
              </button>
              <div className="pt-4 border-t border-gray-100 mt-2">
                <button
                  onClick={() => navigateTo('/hotel-audit')}
                  className="w-full bg-brand-blue text-white px-4 py-4 rounded-xl text-lg font-medium shadow-md active:scale-[0.98] transition-transform"
                >
                  {labels.start}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow flex flex-col items-center justify-start w-full pt-4 sm:pt-6 pb-12 print:pt-4 print:pb-0">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 sm:py-12 mt-auto print:border-t-0 print:py-4 print:mt-4 break-inside-avoid">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Direct Booking Health Score. All rights reserved.</p>
          <p className="mt-2 text-xs uppercase tracking-widest text-gray-300 print:text-gray-500">
            Technology Provided by Bookassist
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <button
              onClick={() => navigateTo('/security')}
              className="text-gray-400 hover:text-brand-blue transition-colors"
            >
              Security & Privacy
            </button>
            <button
              onClick={() => navigateTo('/contact')}
              className="text-gray-400 hover:text-brand-blue transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
