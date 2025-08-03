
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useHabboAssetsBadges } from '../hooks/useHabboAssetsBadges';
import { useLanguage } from '../hooks/useLanguage';
import { Search, Grid, List, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { BadgeCategoryTabs } from './BadgeCategoryTabs';

interface BadgeItem {
  code: string;
  name: string;
  image_url: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
  metadata?: {
    year?: number;
    event?: string;
    source_info?: string;
  };
}

export const CleanBadgesGrid: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  // Debounce search para melhor performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  console.log('🔍 [CleanBadgesGrid] Component state:', {
    activeCategory,
    searchTerm: debouncedSearch,
    forceRefresh
  });

  // Fetch badges data - carregar todos os emblemas com debounced search
  const { 
    data: badgeData, 
    isLoading, 
    isError,
    error,
    isFetching,
    refetch 
  } = useHabboAssetsBadges({
    search: debouncedSearch,
    category: activeCategory,
    page: 1,
    limit: 5000, // Limite alto para carregar mais emblemas
    enabled: true,
    loadAll: true,
    forceRefresh
  });

  // Process and filter badges
  const badges = useMemo(() => {
    if (!badgeData?.badges) {
      console.log('📦 [CleanBadgesGrid] No badge data available');
      return [];
    }

    console.log(`📦 [CleanBadgesGrid] Received ${badgeData.badges.length} badges`);
    return badgeData.badges;
  }, [badgeData]);

  // Category options with translations and icons
  const categoryOptions = useMemo(() => [
    { 
      value: 'all', 
      label: t('allCategories') || 'Todas as Categorias', 
      icon: '🌟',
      count: badgeData?.metadata?.categories?.all || 0,
      color: 'bg-blue-100 border-blue-300 text-blue-800'
    },
    { 
      value: 'official', 
      label: t('official') || 'Oficiais', 
      icon: '🛡️',
      count: badgeData?.metadata?.categories?.official || 0,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    },
    { 
      value: 'achievements', 
      label: t('achievements') || 'Conquistas', 
      icon: '🏆',
      count: badgeData?.metadata?.categories?.achievements || 0,
      color: 'bg-green-100 border-green-300 text-green-800'
    },
    { 
      value: 'fansites', 
      label: t('fansites') || 'Fã-sites', 
      icon: '⭐',
      count: badgeData?.metadata?.categories?.fansites || 0,
      color: 'bg-purple-100 border-purple-300 text-purple-800'
    },
    { 
      value: 'others', 
      label: t('others') || 'Outros', 
      icon: '🎨',
      count: badgeData?.metadata?.categories?.others || 0,
      color: 'bg-gray-100 border-gray-300 text-gray-800'
    },
  ], [badgeData, t]);

  // Handle badge click
  const handleBadgeClick = useCallback((badge: BadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setForceRefresh(prev => !prev);
    refetch();
  }, [refetch]);

  // Handle category change
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-white">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('badgesTitle') || 'Emblemas do Habbo'}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">{t('loadingBadges') || 'Carregando emblemas...'}</p>
              <p className="text-sm text-gray-500 mt-1">Coletando e categorizando emblemas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-white">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('badgesTitle') || 'Emblemas do Habbo'}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">{t('errorLoadingBadges') || 'Erro ao carregar emblemas'}</h3>
              <p className="text-gray-600 mb-4">{error?.message || 'Tente novamente mais tarde'}</p>
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('tryAgain') || 'Tentar Novamente'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header fixo */}
      <div className="p-6 border-b bg-white">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">{t('badgesTitle') || 'Emblemas do Habbo'}</h2>
            <div className="flex items-center gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isFetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Barra de busca com debounce */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('searchBadges') || 'Buscar emblemas...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm !== debouncedSearch && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Abas de navegação com ícones */}
          <BadgeCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
            categories={categoryOptions}
          />

          {/* Stats aprimoradas */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {t('showingBadges') || 'Mostrando'} {badges.length.toLocaleString()} {t('badges') || 'emblemas'}
              </span>
              {badgeData?.metadata?.cached && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ⚡ Cache
                </Badge>
              )}
              {debouncedSearch && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  🔍 "{debouncedSearch}"
                </Badge>
              )}
            </div>
            {badgeData?.metadata?.source && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {badgeData.metadata.source}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {badges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {t('noBadgesFound') || 'Nenhum emblema encontrado'}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {debouncedSearch 
                  ? (t('tryDifferentSearch') || 'Tente uma busca diferente ou altere os filtros')
                  : (t('noBadgesAvailable') || 'Nenhum emblema disponível nesta categoria')
                }
              </p>
            </div>
          ) : (
            <>
              {/* Grid de emblemas */}
              <div className={
                viewMode === 'grid'
                  ? "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-16 gap-2"
                  : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
              }>
                {badges.map((badge, index) => (
                  <div
                    key={`${badge.code}_${index}`}
                    onClick={() => handleBadgeClick(badge)}
                    className={
                      viewMode === 'grid'
                        ? "group relative bg-white rounded-lg p-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-blue-300 hover:scale-105"
                        : "flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-blue-300"
                    }
                    title={`${badge.name} (${badge.code})`}
                  >
                    <div className={viewMode === 'grid' ? "w-full aspect-square flex items-center justify-center mb-2" : "flex-shrink-0"}>
                      <img
                        src={badge.image_url}
                        alt={badge.name}
                        className="w-8 h-8 object-contain pixel-art"
                        style={{ imageRendering: 'pixelated' }}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/emblemas.png';
                        }}
                      />
                    </div>
                    <div className={viewMode === 'grid' ? "text-center" : "flex-1 min-w-0"}>
                      <p className="text-xs font-medium text-gray-800 truncate">{badge.code}</p>
                      {viewMode === 'list' && (
                        <p className="text-xs text-gray-500 truncate">{badge.name}</p>
                      )}
                      {badge.metadata?.year && (
                        <p className="text-xs text-blue-600">{badge.metadata.year}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading indicator se ainda estiver buscando */}
              {isFetching && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('loadingMore') || 'Atualizando...'}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Badge */}
      {selectedBadge && (
        <BadgeDetailsModal
          badge={{
            id: `habbo_assets_${selectedBadge.code}`,
            code: selectedBadge.code,
            name: selectedBadge.name,
            description: `Emblema oficial do Habbo Hotel. Este é o badge ${selectedBadge.code} - ${selectedBadge.name}.`,
            category: selectedBadge.category,
            imageUrl: selectedBadge.image_url,
            rarity: 'common',
            source: selectedBadge.metadata?.source_info || 'HabboAssets',
            scrapedAt: new Date().toISOString(),
            metadata: selectedBadge.metadata
          }}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
