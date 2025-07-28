import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageSelectorProps {
  collapsed?: boolean;
}

export const LanguageSelector = ({ collapsed = false }: LanguageSelectorProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  const languages = [
    { code: 'pt-BR', name: 'Português (BR)', flag: '/assets/flagbrazil.png' },
    { code: 'en-US', name: 'English (US)', flag: '/assets/flagcom.png' },
    { code: 'es-ES', name: 'Español (ES)', flag: '/assets/flagspain.png' },
  ];

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
  };

  if (collapsed) {
    return (
      <div className="p-2 flex justify-center">
        <img 
          src="/assets/flagbrazil.png" 
          alt="Language" 
          className="w-6 h-6 rounded cursor-pointer hover:opacity-75 transition-opacity"
          title="Idioma: Português (BR)"
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="font-bold text-gray-800 mb-3 text-center">Idioma</h3>
      <div className="space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
              ${selectedLanguage === lang.code 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-sm'
              }
            `}
          >
            <img src={lang.flag} alt={lang.name} className="w-5 h-5 rounded" />
            <span className="text-sm font-medium">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
