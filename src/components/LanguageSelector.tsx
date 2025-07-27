
import { useLanguage, Language } from '../hooks/useLanguage';
import { FlagIcon } from './FlagIcon';

export const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'pt' as Language, country: 'brazil' as const },
    { code: 'es' as Language, country: 'spain' as const }
  ];

  return (
    <div className="flex justify-center space-x-3 p-4">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`
            p-2 rounded-full border-2 transition-all duration-200 hover:scale-110
            ${currentLanguage === lang.code
              ? 'border-[#4ECDC4] shadow-[0_0_8px_rgba(78,205,196,0.4)]'
              : 'border-gray-300 hover:border-[#4ECDC4]'
            }
          `}
          title={lang.country === 'brazil' ? 'Português' : 'Español'}
        >
          <FlagIcon country={lang.country} size="md" />
        </button>
      ))}
    </div>
  );
};
