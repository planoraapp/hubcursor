
import { useState, useEffect, createContext, useContext } from 'react';
import { useGeolocation } from './useGeolocation';

export type Language = 'pt' | 'es';

interface LanguageContextType {
  currentLanguage: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Navegação
    noticias: 'Notícias',
    forum: 'Fórum',
    catalogo: 'Catálogo',
    emblemas: 'Emblemas',
    editor: 'Editor',
    mercado: 'Mercado',
    
    // Perfil
    userNameGuest: 'Visitante',
    onlineStatus: 'Online',
    offlineStatus: 'Offline',
    loginButton: 'Entrar',
    logoutButton: 'Sair',
    
    // Premium
    habboPremiumTitle: 'Habbo Premium',
    habboPremiumDesc: 'Acesso exclusivo a recursos especiais',
    subscribeNow: 'Assinar Agora',
    
    // Geral
    languageLabel: 'Idioma',
    homeTitle: 'Bem-vindo ao Habbo Hub',
    homeSubtitle: 'Sua central de ferramentas para Habbo Hotel',
    latestNews: 'Últimas Notícias',
    featuredRooms: 'Quartos em Destaque',
    catalogEnhancedTitle: 'Catálogo Aprimorado',
    badgesEnhancedTitle: 'Emblemas Aprimorados'
  },
  es: {
    // Navegación
    noticias: 'Noticias',
    forum: 'Foro',
    catalogo: 'Catálogo',
    emblemas: 'Emblemas',
    editor: 'Editor',
    mercado: 'Mercado',
    
    // Perfil
    userNameGuest: 'Invitado',
    onlineStatus: 'Conectado',
    offlineStatus: 'Desconectado',
    loginButton: 'Entrar',
    logoutButton: 'Salir',
    
    // Premium
    habboPremiumTitle: 'Habbo Premium',
    habboPremiumDesc: 'Acceso exclusivo a funciones especiales',
    subscribeNow: 'Suscribirse Ahora',
    
    // General
    languageLabel: 'Idioma',
    homeTitle: 'Bienvenido a Habbo Hub',
    homeSubtitle: 'Tu centro de herramientas para Habbo Hotel',
    latestNews: 'Últimas Noticias',
    featuredRooms: 'Habitaciones Destacadas',
    catalogEnhancedTitle: 'Catálogo Mejorado',
    badgesEnhancedTitle: 'Emblemas Mejorados'
  }
};

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
  const { country, loading } = useGeolocation();

  useEffect(() => {
    // Verificar se há idioma salvo
    const savedLanguage = localStorage.getItem('habbo-hub-language') as Language;
    
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'es')) {
      setCurrentLanguage(savedLanguage);
    } else if (!loading && country) {
      // Definir idioma baseado na geolocalização
      const detectedLanguage = country === 'spain' ? 'es' : 'pt';
      setCurrentLanguage(detectedLanguage);
      localStorage.setItem('habbo-hub-language', detectedLanguage);
    }
  }, [country, loading]);

  const changeLanguage = (lang: Language) => {
    setCurrentLanguage(lang);
    localStorage.setItem('habbo-hub-language', lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
