
import { useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface Translations {
  // Navegação
  home: string;
  forum: string;
  console: string;
  tools: string;
  more: string;
  
  // Páginas principais
  noticias: string;
  catalogo: string;
  emblemas: string;
  editor: string;
  mercado: string;
  
  // Títulos de páginas
  badgesEnhancedTitle: string;
  catalogEnhancedTitle: string;
  exploreRoomsTitle: string;
  exploreRoomsSubtitle: string;
  topRoomsByVisitors: string;
  marketplaceTitle: string;
  
  // Premium
  habboPremiumTitle: string;
  habboPremiumDesc: string;
  subscribeNow: string;
  
  // Emblemas
  badgesTitle: string;
  loadingBadges: string;
  errorLoadingBadges: string;
  tryAgain: string;
  searchBadges: string;
  showingBadges: string;
  badges: string;
  noBadgesFound: string;
  tryDifferentSearch: string;
  noBadgesAvailable: string;
  loadingMore: string;
  
  // Categorias
  allCategories: string;
  official: string;
  achievements: string;
  fansites: string;
  others: string;
  
  // Modal de emblemas
  badgeCode: string;
  category: string;
  rarity: string;
  description: string;
  year: string;
  source: string;
  validations: string;
  lastValidation: string;
  closeModal: string;
  officialHabboBadge: string;
  
  // Raridade
  common: string;
  uncommon: string;
  rare: string;
  legendary: string;
}

const translations: Record<Language, Translations> = {
  pt: {
    // Navegação
    home: 'Início',
    forum: 'Fórum',
    console: 'Console',
    tools: 'Ferramentas',
    more: 'Mais',
    
    // Páginas principais
    noticias: 'Notícias',
    catalogo: 'Catálogo',
    emblemas: 'Emblemas',
    editor: 'Editor',
    mercado: 'Mercado',
    
    // Títulos de páginas
    badgesEnhancedTitle: 'Emblemas do Habbo',
    catalogEnhancedTitle: 'Catálogo do Habbo',
    exploreRoomsTitle: 'Explorar Quartos',
    exploreRoomsSubtitle: 'Descubra os quartos mais populares do Habbo',
    topRoomsByVisitors: 'Top Quartos por Visitantes',
    marketplaceTitle: 'Mercado do Habbo',
    
    // Premium
    habboPremiumTitle: 'Habbo Premium',
    habboPremiumDesc: 'Tenha acesso a recursos exclusivos',
    subscribeNow: 'Assinar Agora',
    
    // Emblemas
    badgesTitle: 'Emblemas do Habbo',
    loadingBadges: 'Carregando emblemas...',
    errorLoadingBadges: 'Erro ao carregar emblemas',
    tryAgain: 'Tentar Novamente',
    searchBadges: 'Buscar emblemas...',
    showingBadges: 'Mostrando',
    badges: 'emblemas',
    noBadgesFound: 'Nenhum emblema encontrado',
    tryDifferentSearch: 'Tente uma busca diferente ou altere os filtros',
    noBadgesAvailable: 'Nenhum emblema disponível nesta categoria',
    loadingMore: 'Carregando mais...',
    
    // Categorias
    allCategories: 'Todas as Categorias',
    official: 'Oficiais',
    achievements: 'Conquistas',
    fansites: 'Fã-sites',
    others: 'Outros',
    
    // Modal de emblemas
    badgeCode: 'Código',
    category: 'Categoria',
    rarity: 'Raridade',
    description: 'Descrição',
    year: 'Ano',
    source: 'Fonte',
    validations: 'Validações',
    lastValidation: 'Última Validação',
    closeModal: 'Fechar',
    officialHabboBadge: 'Emblema Oficial do Habbo',
    
    // Raridade
    common: 'Comum',
    uncommon: 'Incomum',
    rare: 'Raro',
    legendary: 'Lendário',
  },
  
  en: {
    // Navegação
    home: 'Home',
    forum: 'Forum',
    console: 'Console',
    tools: 'Tools',
    more: 'More',
    
    // Páginas principais
    noticias: 'News',
    catalogo: 'Catalog',
    emblemas: 'Badges',
    editor: 'Editor',
    mercado: 'Marketplace',
    
    // Títulos de páginas
    badgesEnhancedTitle: 'Habbo Badges',
    catalogEnhancedTitle: 'Habbo Catalog',
    exploreRoomsTitle: 'Explore Rooms',
    exploreRoomsSubtitle: 'Discover the most popular rooms in Habbo',
    topRoomsByVisitors: 'Top Rooms by Visitors',
    marketplaceTitle: 'Habbo Marketplace',
    
    // Premium
    habboPremiumTitle: 'Habbo Premium',
    habboPremiumDesc: 'Get access to exclusive features',
    subscribeNow: 'Subscribe Now',
    
    // Emblemas
    badgesTitle: 'Habbo Badges',
    loadingBadges: 'Loading badges...',
    errorLoadingBadges: 'Error loading badges',
    tryAgain: 'Try Again',
    searchBadges: 'Search badges...',
    showingBadges: 'Showing',
    badges: 'badges',
    noBadgesFound: 'No badges found',
    tryDifferentSearch: 'Try a different search or change filters',
    noBadgesAvailable: 'No badges available in this category',
    loadingMore: 'Loading more...',
    
    // Categorias
    allCategories: 'All Categories',
    official: 'Official',
    achievements: 'Achievements',
    fansites: 'Fansites',
    others: 'Others',
    
    // Modal de emblemas
    badgeCode: 'Code',
    category: 'Category',
    rarity: 'Rarity',
    description: 'Description',
    year: 'Year',
    source: 'Source',
    validations: 'Validations',
    lastValidation: 'Last Validation',
    closeModal: 'Close',
    officialHabboBadge: 'Official Habbo Badge',
    
    // Raridade
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    legendary: 'Legendary',
  },
  
  es: {
    // Navegação
    home: 'Inicio',
    forum: 'Foro',
    console: 'Consola',
    tools: 'Herramientas',
    more: 'Más',
    
    // Páginas principais
    noticias: 'Noticias',
    catalogo: 'Catálogo',
    emblemas: 'Placas',
    editor: 'Editor',
    mercado: 'Mercado',
    
    // Títulos de páginas
    badgesEnhancedTitle: 'Placas de Habbo',
    catalogEnhancedTitle: 'Catálogo de Habbo',
    exploreRoomsTitle: 'Explorar Salas',
    exploreRoomsSubtitle: 'Descubre las salas más populares de Habbo',
    topRoomsByVisitors: 'Top Salas por Visitantes',
    marketplaceTitle: 'Mercado de Habbo',
    
    // Premium
    habboPremiumTitle: 'Habbo Premium',
    habboPremiumDesc: 'Obtén acceso a funciones exclusivas',
    subscribeNow: 'Suscribirse Ahora',
    
    // Emblemas
    badgesTitle: 'Placas de Habbo',
    loadingBadges: 'Cargando placas...',
    errorLoadingBadges: 'Error al cargar placas',
    tryAgain: 'Intentar de Nuevo',
    searchBadges: 'Buscar placas...',
    showingBadges: 'Mostrando',
    badges: 'placas',
    noBadgesFound: 'No se encontraron placas',
    tryDifferentSearch: 'Prueba una búsqueda diferente o cambia los filtros',
    noBadgesAvailable: 'No hay placas disponibles en esta categoría',
    loadingMore: 'Cargando más...',
    
    // Categorias
    allCategories: 'Todas las Categorías',
    official: 'Oficiales',
    achievements: 'Logros',
    fansites: 'Fansites',
    others: 'Otros',
    
    // Modal de emblemas
    badgeCode: 'Código',
    category: 'Categoría',
    rarity: 'Rareza',
    description: 'Descripción',
    year: 'Año',
    source: 'Fuente',
    validations: 'Validaciones',
    lastValidation: 'Última Validación',
    closeModal: 'Cerrar',
    officialHabboBadge: 'Placa Oficial de Habbo',
    
    // Raridade
    common: 'Común',
    uncommon: 'Poco común',
    rare: 'Raro',
    legendary: 'Legendario',
  }
};

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Tentar recuperar do localStorage ou usar português como padrão
    try {
      const saved = localStorage.getItem('habbohub-language');
      return (saved as Language) || 'pt';
    } catch {
      return 'pt';
    }
  });

  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('habbohub-language', language);
      };

  const t = (key: keyof Translations): string => {
    return translations[currentLanguage][key] || key;
  };

  const getCurrentFlag = (): string => {
    const flags = {
      pt: '/flags/flagbrazil.png',
      en: '/flags/flagcom.png',
      es: '/flags/flagspain.png'
    };
    return flags[currentLanguage];
  };

  return {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentFlag,
    translations: translations[currentLanguage]
  };
};
