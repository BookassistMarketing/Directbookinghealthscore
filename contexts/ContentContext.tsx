import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

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
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('hhc_lang');
    return (saved as Language) || 'en';
  });
  
  const [content, setContent] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`hhc_content_${language}`);
    if (saved) {
      try {
        setContent(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load content", e);
      }
    } else {
      setContent({});
    }
  }, [language]);

  const updateContent = (key: string, value: string) => {
    const newContent = { ...content, [key]: value };
    setContent(newContent);
    localStorage.setItem(`hhc_content_${language}`, JSON.stringify(newContent));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hhc_lang', lang);
  };

  const toggleEditing = () => setIsEditing(prev => !prev);

  const resetContent = () => {
    if (window.confirm("Are you sure you want to reset all content for this language to defaults?")) {
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