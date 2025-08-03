
import { useState, useEffect } from 'react';

export type Language = 'pt' | 'en' | 'es';

interface Translations {
  // Navegação
  home: string;
  forum: string;
  console: string;
  tools: string;
  more: string;
  
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
    console.log(`🌐 [useLanguage] Language changed to: ${language}`);
  };

  const t = (key: keyof Translations): string => {
    return translations[currentLanguage][key] || key;
  };

  const getCurrentFlag = (): string => {
    const flags = {
      pt: '/assets/flagbrazil.png',
      en: '/assets/flagcom.png',
      es: '/assets/flagspain.png'
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
