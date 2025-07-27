
import { useLanguage, Language } from '../hooks/useLanguage';

export const LanguageSelector = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'pt' as Language, flag: '🇧🇷', name: 'Português' },
    { code: 'es' as Language, flag: '🇪🇸', name: 'Español' }
  ];

  return (
    <div className="p-4 border-t border-white/20">
      <div className="flex justify-center space-x-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              p-3 rounded-full transition-all duration-200 hover:scale-110
              ${currentLanguage === lang.code
                ? 'bg-white/30 shadow-lg ring-2 ring-white/50'
                : 'bg-white/10 hover:bg-white/20'
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
