
import { useState, createContext, useContext, useEffect } from 'react';

export type Language = 'pt' | 'es';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('habbo-hub-language') as Language;
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'es')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('habbo-hub-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
