
import { useLanguage, Language } from '../hooks/useLanguage';
import flagBrazilImg from '/assets/flagbrazil.png';
import flagSpainImg from '/assets/flagspain.png';
import flagComImg from '/assets/flagcom.png';

interface LanguageSelectorProps {
  isCollapsed?: boolean;
}

export const LanguageSelector = ({ isCollapsed = false }: LanguageSelectorProps) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'pt' as Language, flag: flagBrazilImg, name: 'Português' },
    { code: 'es' as Language, flag: flagSpainImg, name: 'Español' },
    { code: 'en' as Language, flag: flagComImg, name: 'English' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  if (isCollapsed) {
    return (
      <div className="p-2 border-t border-gray-300">
        <div className="flex justify-center">
          <button
            onClick={() => {
              const currentIndex = languages.findIndex(lang => lang.code === currentLanguage);
              const nextIndex = (currentIndex + 1) % languages.length;
              changeLanguage(languages[nextIndex].code);
            }}
            className="p-2 rounded-md transition-all duration-200 hover:scale-110 hover:bg-white/10"
            title={currentLang?.name}
          >
            <img 
              src={currentLang?.flag} 
              alt={currentLang?.name}
              className="w-6 h-4 object-cover rounded-sm"
            />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-300">
      <div className="flex justify-center space-x-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`
              p-2 rounded-md transition-all duration-200 hover:scale-110 border-2
              ${currentLanguage === lang.code
                ? 'bg-sky-400 border-sky-500 shadow-lg'
                : 'bg-white/80 border-gray-300 hover:bg-white hover:shadow-sm'
              }
            `}
            title={lang.name}
          >
            <img 
              src={lang.flag} 
              alt={lang.name}
              className="w-8 h-5 object-cover rounded-sm"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
