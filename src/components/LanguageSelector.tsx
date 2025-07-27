
import { useLanguage, Language } from '../hooks/useLanguage';

export const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'pt' as Language, flag: '🇧🇷', name: 'Português' },
    { code: 'es' as Language, flag: '🇪🇸', name: 'Español' },
    { code: 'en' as Language, flag: '🇬🇧', name: 'English' }
  ];

  return (
    <div className="mb-6 text-center">
      <h3 className="font-bold text-gray-800 mb-2">{t('languageLabel')}</h3>
      <div className="flex justify-center space-x-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              p-2 rounded-full border-2 transition-all duration-200
              ${currentLanguage === lang.code
                ? 'border-[#007bff] shadow-[0_0_0_2px_rgba(0,123,255,0.25)]'
                : 'border-transparent hover:border-[#007bff]'
              }
            `}
            title={lang.name}
          >
            <span className="text-xl">{lang.flag}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
