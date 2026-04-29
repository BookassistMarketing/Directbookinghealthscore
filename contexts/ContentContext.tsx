'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Language } from '../types';
import { parseLangFromPath, pathForLocale } from '../lib/i18n';

interface ContentContextType {
  content: Record<string, string>;
  updateContent: (key: string, value: string) => void;
  isEditing: boolean;
  toggleEditing: () => void;
  resetContent: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const ContentContext = createContext<ContentContextType>({
  content: {},
  updateContent: () => {},
  isEditing: false,
  toggleEditing: () => {},
  resetContent: () => {},
  language: 'en',
  setLanguage: () => {},
});

export const useContent = () => useContext(ContentContext);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  // URL is the source of truth for locale — works the same on server and client
  // so SSR output matches the URL the crawler/user requested.
  const language = parseLangFromPath(pathname);

  const [content, setContent] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(`hhc_content_${language}`);
    if (saved) {
      try {
        setContent(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load content', e);
      }
    } else {
      setContent({});
    }
  }, [language]);

  const updateContent = (key: string, value: string) => {
    const newContent = { ...content, [key]: value };
    setContent(newContent);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hhc_content_${language}`, JSON.stringify(newContent));
    }
  };

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hhc_lang', lang);
    }
    // Navigate to the locale-equivalent URL — this triggers a re-render with
    // server-side rendered content for the new locale, which is what crawlers
    // and direct visitors will see.
    router.push(pathForLocale(pathname || '/', lang));
  };

  const toggleEditing = () => setIsEditing(prev => !prev);

  const resetContent = () => {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to reset all content for this language to defaults?')) {
      setContent({});
      localStorage.removeItem(`hhc_content_${language}`);
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, isEditing, toggleEditing, resetContent, language, setLanguage }}>
      {children}
    </ContentContext.Provider>
  );
};