import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHabboAssetsBadges, HabboAssetsBadge } from '../hooks/useHabboAssetsBadges';
import { useLanguage, Language } from '../hooks/useLanguage';

const CATEGORIES = [
  { value: 'all', label: 'all', icon: '📦' },
  { value: 'official', label: 'official', icon: '🛡️' },
  { value: 'achievements', label: 'achievements', icon: '🏆' },
  { value: 'fansites', label: 'fansites', icon: '⭐' },
  { value: 'others', label: 'others', icon: '🎨' }
];

const TRANSLATIONS = {
  pt: {
    all: 'Todos',
    official: 'Oficiais', 
    achievements: 'Conquistas',
    fansites: 'Fã-sites',
    others: 'Outros',
    searchPlaceholder: 'Pesquisar por nome ou código...',
    foundBadges: 'encontrados',
    source: 'Fonte: HabboAssets',
    loading: 'Carregando...',
    loadingBadges: 'Carregando Emblemas...',
    fetchingData: 'Buscando dados do HabboAssets',
    loadingMore: 'Carregando mais emblemas...',
    allLoaded: 'Todos os emblemas foram carregados!',
    total: 'total',
    noResults: 'Nenhum emblema encontrado',
    tryDifferent: 'Tente ajustar os filtros ou fazer uma busca diferente',
    errorTitle: 'Erro ao Carregar Emblemas',
    errorDesc: 'Não foi possível carregar os emblemas do HabboAssets'
  },
  es: {
    all: 'Todos',
    official: 'Oficiales',
    achievements: 'Logros', 
    fansites: 'Fan-sites',
    others: 'Otros',
    searchPlaceholder: 'Buscar por nombre o código...',
    foundBadges: 'encontradas',
    source: 'Fuente: HabboAssets',
    loading: 'Cargando...',
    loadingBadges: 'Cargando Placas...',
    fetchingData: 'Obteniendo datos de HabboAssets',
    loadingMore: 'Cargando más placas...',
    allLoaded: '¡Todas las placas han sido cargadas!',
    total: 'total',
    noResults: 'No se encontraron placas',
    tryDifferent: 'Intenta ajustar los filtros o hacer una búsqueda diferente',
    errorTitle: 'Error al Cargar Placas',
    errorDesc: 'No fue posible cargar las placas de HabboAssets'
  },
  en: {
    all: 'All',
    official: 'Official',
    achievements: 'Achievements',
    fansites: 'Fan-sites', 
    others: 'Others',
    searchPlaceholder: 'Search by name or code...',
    foundBadges: 'found',
    source: 'Source: HabboAssets',
    loading: 'Loading...',
    loadingBadges: 'Loading Badges...',
    fetchingData: 'Fetching data from HabboAssets',
    loadingMore: 'Loading more badges...',
    allLoaded: 'All badges have been loaded!',
    total: 'total',
    noResults: 'No badges found',
    tryDifferent: 'Try adjusting the filters or search differently',
    errorTitle: 'Error Loading Badges',
    errorDesc: 'Could not load badges from HabboAssets'
  }
};

const LanguageSelector: React.FC = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const languages = [
    { code: 'pt', name: 'Português', flag: '/assets/flagbrazil.png' },
    { code: 'en', name: 'English', flag: '/assets/flagcom.png' },
    { code: 'es', name: 'Español', flag: '/assets/flagspain.png' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code as Language)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              currentLanguage === lang.code 
                ? 'bg-blue-100 text-blue-800' 
                : 'hover:bg-gray-100'
            }`}
          >
            <img src={lang.flag} alt={lang.name} className="w-3 h-3" />
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

const BadgeImage: React.FC<{ badge: HabboAssetsBadge }> = ({ badge }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (imageError) {
    return (
      <div className="w-8 h-8 flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
        <span className="text-xs font-bold text-gray-600">
          {badge.code.slice(0, 3)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-8 h-8 relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded"></div>
      )}
      <img
        src={badge.image_url}
        alt={badge.name}
        className={`w-full h-full object-contain rounded transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ imageRendering: 'pixelated' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export const CleanBadgesGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allBadges, setAllBadges] = useState<HabboAssetsBadge[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { currentLanguage } = useLanguage();

  const t = (key: keyof typeof TRANSLATIONS.pt) => {
    return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.pt[key];
  };

  const { data, isLoading, error, isFetching } = useHabboAssetsBadges({
    search: searchTerm,
    category: activeCategory,
    page: currentPage,
    limit: 100,
    enabled: true
  });

  useEffect(() => {
    console.log('🔍 [CleanBadgesGrid] Component state:', {
      activeCategory,
      searchTerm,
      currentPage,
      isLoading,
      isFetching,
      error,
      badgesCount: allBadges.length,
      dataReceived: data?.badges?.length || 0
    });
  }, [activeCategory, searchTerm, currentPage, isLoading, isFetching, error, allBadges.length, data]);

  // Agregar badges conforme novas páginas são carregadas
  useEffect(() => {
    if (data?.badges) {
      console.log(`📦 [CleanBadgesGrid] Received ${data.badges.length} badges for page ${currentPage}`);
      if (currentPage === 1) {
        setAllBadges(data.badges);
      } else {
        setAllBadges(prev => [...prev, ...data.badges]);
      }
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Reset quando categoria ou busca mudam
  useEffect(() => {
    console.log(`🔄 [CleanBadgesGrid] Resetting for category: ${activeCategory}, search: "${searchTerm}"`);
    setCurrentPage(1);
    setAllBadges([]);
  }, [activeCategory, searchTerm]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      if (
        container.scrollTop + container.clientHeight >= container.scrollHeight - 100 &&
        data?.metadata?.hasMore &&
        !isLoading &&
        !isLoadingMore &&
        !isFetching
      ) {
        setIsLoadingMore(true);
        setCurrentPage(prev => prev + 1);
      }
    };

    const scrollContainer = document.getElementById('badges-scroll-container');
    scrollContainer?.addEventListener('scroll', handleScroll);
    
    return () => scrollContainer?.removeEventListener('scroll', handleScroll);
  }, [data?.metadata?.hasMore, isLoading, isLoadingMore, isFetching]);

  const handleCategoryChange = useCallback((category: string) => {
    console.log(`🏷️ [CleanBadgesGrid] Category changed to: ${category}`);
    setActiveCategory(category);
  }, []);

  const categoryStats = data?.metadata?.categories || {
    all: 0,
    official: 0,
    achievements: 0,
    fansites: 0,
    others: 0
  };

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-semibold">{t('errorTitle')}</h3>
            <p className="text-sm mt-2">{t('errorDesc')}</p>
            <p className="text-xs mt-1 text-gray-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header fixo */}
      <div className="p-6 border-b bg-white">
        {/* Busca */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Search className="w-5 h-5" />
              {currentLanguage === 'pt' ? 'Buscar Emblemas' : 
               currentLanguage === 'es' ? 'Buscar Placas' : 'Search Badges'}
            </h2>
            <LanguageSelector />
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {data?.metadata?.total || 0} {t('foundBadges')}
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {t('source')}
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {t('loading')}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs das Categorias */}
        <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
          <TabsList className="grid grid-cols-5 mb-4">
            {CATEGORIES.map(category => (
              <TabsTrigger key={category.value} value={category.value} className="text-xs sm:text-sm">
                <span className="mr-1">{category.icon}</span>
                <span className="hidden sm:inline">{t(category.label as keyof typeof TRANSLATIONS.pt)}</span>
                <span className="ml-1">({categoryStats[category.value as keyof typeof categoryStats]})</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Container com scroll interno */}
      <div 
        id="badges-scroll-container"
        className="flex-1 overflow-y-auto p-6"
        style={{ height: 'calc(100vh - 280px)' }}
      >
        <Tabs value={activeCategory}>
          {CATEGORIES.map(category => (
            <TabsContent key={category.value} value={category.value}>
              {isLoading && currentPage === 1 ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-700 font-bold text-lg">{t('loadingBadges')}</p>
                  <p className="text-gray-500 text-sm mt-1">{t('fetchingData')}</p>
                </div>
              ) : allBadges.length > 0 ? (
                <>
                  <div className="grid grid-cols-12 md:grid-cols-16 lg:grid-cols-20 xl:grid-cols-24 2xl:grid-cols-32 gap-1">
                    {allBadges.map((badge, index) => (
                      <div
                        key={`${badge.code}_${index}`}
                        className="group relative hover:scale-110 transition-transform duration-200 bg-gray-100 rounded p-1"
                        title={`${badge.code} - ${badge.name}`}
                      >
                        <BadgeImage badge={badge} />
                      </div>
                    ))}
                  </div>

                  {/* Loading indicator para scroll infinito */}
                  {(isLoadingMore || (isFetching && currentPage > 1)) && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">{t('loadingMore')}</p>
                    </div>
                  )}

                  {/* Fim dos resultados */}
                  {data?.metadata && !data.metadata.hasMore && allBadges.length > 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      🎉 {t('allLoaded')} ({allBadges.length} {t('total')})
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">{t('noResults')}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {isLoading ? t('loading') : t('tryDifferent')}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};
