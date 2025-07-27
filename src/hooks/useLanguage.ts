
import { useState, useEffect } from 'react';

export type Language = 'pt' | 'es' | 'en';

export const translations = {
  pt: {
    appTitle: 'HABBO HUB',
    homeTitle: 'Bem-vindo ao Habbo Hub',
    homeSubtitle: 'Sua central de ferramentas e informações para o Habbo Hotel. Explore os dados públicos mais recentes e otimize sua experiência no jogo.',
    latestNews: 'Últimas Notícias',
    featuredRooms: 'Quartos em Destaque',
    exploreRoomsTitle: 'Explorador de Quartos',
    exploreRoomsSubtitle: 'Pesquise e filtre os quartos públicos mais populares do Habbo Hotel.',
    catalogTitle: 'Catálogo de Items',
    catalogSubtitle: 'Explore todos os emblemas disponíveis no Habbo Hotel BR através da nossa API oficial.',
    badgeGuideTitle: 'Guia de Emblemas',
    badgeGuideSubtitle: 'Explore a vasta coleção de emblemas do Habbo. Descubra como obtê-los e os mais raros!',
    rankingsTitle: 'Classificação Habbo',
    rankingsSubtitle: 'Veja os Habbos e quartos em destaque nos rankings.',
    profileCheckerTitle: 'Verificador de Perfil Habbo',
    profileCheckerSubtitle: 'Pesquise por qualquer Habbo e veja seu perfil público, emblemas, grupos e quartos!',
    toolsTitle: 'Ferramentas Habbo',
    toolsSubtitle: 'Utilitários para otimizar sua experiência e estratégia no Habbo.',
    languageLabel: 'Idioma:',
    userNameGuest: 'Convidado Habbo',
    offlineStatus: 'Offline',
    onlineStatus: 'Online',
    loginButton: 'Entrar',
    logoutButton: 'Sair',
    habboPremiumTitle: 'Habbo Hub Premium',
    habboPremiumDesc: 'Desbloqueie filtros avançados e alertas personalizados!',
    subscribeNow: 'Assine Já!',
    inicio: 'Início',
    quartos: 'Explorar Quartos',
    catalogo: 'Catálogo',
    guias: 'Guia de Emblemas',
    classificacao: 'Classificação',
    perfil: 'Verificador de Perfil',
    ferramentas: 'Ferramentas'
  },
  es: {
    appTitle: 'HABBO HUB',
    homeTitle: 'Bienvenido a Habbo Hub',
    homeSubtitle: 'Tu centro de herramientas e información para Habbo Hotel. Explora los datos públicos más recientes y optimiza tu experiencia de juego.',
    latestNews: 'Últimas Noticias',
    featuredRooms: 'Salas Destacadas',
    exploreRoomsTitle: 'Explorador de Salas',
    exploreRoomsSubtitle: 'Busca y filtra las salas públicas más populares de Habbo Hotel.',
    catalogTitle: 'Catálogo de Artículos',
    catalogSubtitle: 'Explora todas las placas disponibles en Habbo Hotel ES a través de nuestra API oficial.',
    badgeGuideTitle: 'Guía de Placas',
    badgeGuideSubtitle: 'Explora la vasta colección de placas de Habbo. ¡Descubre cómo conseguirlas y las más raras!',
    rankingsTitle: 'Clasificación Habbo',
    rankingsSubtitle: 'Mira a los Habbos y salas destacadas en los rankings.',
    profileCheckerTitle: 'Verificador de Perfil Habbo',
    profileCheckerSubtitle: 'Busca cualquier Habbo y ve su perfil público, placas, grupos y salas!',
    toolsTitle: 'Herramientas Habbo',
    toolsSubtitle: 'Utilidades para optimizar tu experiencia y estrategia en Habbo.',
    languageLabel: 'Idioma:',
    userNameGuest: 'Invitado Habbo',
    offlineStatus: 'Fuera de Línea',
    onlineStatus: 'En Línea',
    loginButton: 'Entrar',
    logoutButton: 'Salir',
    habboPremiumTitle: 'Habbo Hub Premium',
    habboPremiumDesc: '¡Desbloquea filtros avanzados y alertas personalizadas!',
    subscribeNow: '¡Suscríbete Ahora!',
    inicio: 'Inicio',
    quartos: 'Explorar Salas',
    catalogo: 'Catálogo',
    guias: 'Guía de Placas',
    classificacao: 'Clasificación',
    perfil: 'Verificador de Perfil',
    ferramentas: 'Herramientas'
  },
  en: {
    appTitle: 'HABBO HUB',
    homeTitle: 'Welcome to Habbo Hub',
    homeSubtitle: 'Your central hub for tools and information about Habbo Hotel. Explore the latest public data and optimize your in-game experience.',
    latestNews: 'Latest News',
    featuredRooms: 'Featured Rooms',
    exploreRoomsTitle: 'Room Explorer',
    exploreRoomsSubtitle: 'Search and filter the most popular public rooms in Habbo Hotel.',
    catalogTitle: 'Item Catalog',
    catalogSubtitle: 'Explore all badges available in Habbo Hotel through our official API.',
    badgeGuideTitle: 'Badge Guide',
    badgeGuideSubtitle: 'Explore the vast collection of Habbo badges. Discover how to get them and the rarest ones!',
    rankingsTitle: 'Habbo Rankings',
    rankingsSubtitle: 'See top Habbos and rooms on the leaderboards.',
    profileCheckerTitle: 'Habbo Profile Checker',
    profileCheckerSubtitle: 'Search for any Habbo and view their public profile, badges, groups, and rooms!',
    toolsTitle: 'Habbo Tools',
    toolsSubtitle: 'Utilities to optimize your Habbo experience and strategy.',
    languageLabel: 'Language:',
    userNameGuest: 'Guest Habbo',
    offlineStatus: 'Offline',
    onlineStatus: 'Online',
    loginButton: 'Login',
    logoutButton: 'Logout',
    habboPremiumTitle: 'Habbo Hub Premium',
    habboPremiumDesc: 'Unlock advanced filters and custom alerts!',
    subscribeNow: 'Subscribe Now!',
    inicio: 'Home',
    quartos: 'Explore Rooms',
    catalogo: 'Catalog',
    guias: 'Badge Guide',
    classificacao: 'Rankings',
    perfil: 'Profile Checker',
    ferramentas: 'Tools'
  }
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('habboHubLang') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('habboHubLang', language);
  };

  const t = (key: string) => {
    return translations[currentLanguage][key as keyof typeof translations[Language]] || key;
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
