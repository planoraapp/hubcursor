
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHabboAssetsBadges, HabboAssetsBadge } from '../hooks/useHabboAssetsBadges';

const CATEGORIES = [
  { value: 'all', label: 'Todos', icon: '📦' },
  { value: 'official', label: 'Oficiais', icon: '🛡️' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐' },
  { value: 'others', label: 'Outros', icon: '🎨' }
];

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
      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 border border-gray-300 rounded">
        <span className="text-xs font-bold text-gray-600">
          {badge.code.slice(0, 4)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 relative">
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

  const { data, isLoading, error, isFetching } = useHabboAssetsBadges({
    search: searchTerm,
    category: activeCategory,
    page: currentPage,
    limit: 100,
    enabled: true
  });

  // Log para debug
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
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
        data?.metadata?.hasMore &&
        !isLoading &&
        !isLoadingMore &&
        !isFetching
      ) {
        console.log('📜 [CleanBadgesGrid] Loading more badges...');
        setIsLoadingMore(true);
        setCurrentPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    console.error('❌ [CleanBadgesGrid] Error state:', error);
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-red-600 mb-4">
            <h3 className="text-lg font-semibold">Erro ao Carregar Emblemas</h3>
            <p className="text-sm mt-2">Não foi possível carregar os emblemas do HabboAssets</p>
            <p className="text-xs mt-1 text-gray-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Emblemas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Pesquisar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {data?.metadata?.total || 0} encontrados
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              Fonte: HabboAssets
            </Badge>
            {isLoading && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                Carregando...
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs das Categorias */}
      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="grid grid-cols-5 mb-6">
          {CATEGORIES.map(category => (
            <TabsTrigger key={category.value} value={category.value} className="text-xs sm:text-sm">
              <span className="mr-1">{category.icon}</span>
              <span className="hidden sm:inline">{category.label}</span>
              <span className="ml-1">({categoryStats[category.value as keyof typeof categoryStats]})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(category => (
          <TabsContent key={category.value} value={category.value}>
            {isLoading && currentPage === 1 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-700 font-bold text-lg">Carregando Emblemas...</p>
                <p className="text-gray-500 text-sm mt-1">Buscando dados do HabboAssets</p>
              </div>
            ) : allBadges.length > 0 ? (
              <>
                <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24 gap-2">
                  {allBadges.map((badge, index) => (
                    <div
                      key={`${badge.code}_${index}`}
                      className="group relative hover:scale-110 transition-transform duration-200"
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
                    <p className="text-sm text-gray-600">Carregando mais emblemas...</p>
                  </div>
                )}

                {/* Fim dos resultados */}
                {data?.metadata && !data.metadata.hasMore && allBadges.length > 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    🎉 Todos os emblemas foram carregados! ({allBadges.length} total)
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum emblema encontrado</p>
                <p className="text-gray-500 text-sm mt-1">
                  {isLoading ? 'Carregando...' : 'Tente ajustar os filtros ou fazer uma busca diferente'}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
