
import { useLanguage, Language } from '../hooks/useLanguage';

export const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'pt' as Language, flag: '🇧🇷', name: 'Português' },
    { code: 'es' as Language, flag: '🇪🇸', name: 'Español' }
  ];

  return (
    <div className="p-4 border-t border-gray-300">
      <div className="flex justify-center space-x-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              p-3 rounded-full transition-all duration-200 hover:scale-110 border-2
              ${currentLanguage === lang.code
                ? 'bg-sky-400 border-sky-500 shadow-lg'
                : 'bg-white/80 border-gray-300 hover:bg-white hover:shadow-sm'
              }
            `}
            title={lang.name}
          >
            <span className="text-2xl">{lang.flag}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
