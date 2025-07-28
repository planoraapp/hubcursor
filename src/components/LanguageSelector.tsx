
import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSelectorProps {
  collapsed?: boolean;
}

export const LanguageSelector = ({ collapsed = false }: LanguageSelectorProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'pt', name: 'Português', flag: '/assets/flagbrazil.png' },
    { code: 'en', name: 'English', flag: '/assets/flagcom.png' },
    { code: 'es', name: 'Español', flag: '/assets/flagspain.png' },
  ];

  if (collapsed) {
    return (
      <div className="p-2 flex justify-center">
        <div className="w-12 h-12 rounded-lg bg-white/80 hover:bg-white hover:shadow-sm transition-all duration-200 flex items-center justify-center">
          <img 
            src={languages.find(lang => lang.code === currentLanguage)?.flag} 
            alt={currentLanguage} 
            className="w-6 h-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-lg mb-4 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-3 text-sm">Idioma</h3>
      <div className="flex space-x-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              currentLanguage === lang.code 
                ? 'bg-sky-400 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <img src={lang.flag} alt={lang.name} className="w-4 h-4" />
            <span className="text-xs">{lang.code.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
