import React, { useState, useEffect, useMemo } from 'react';
import { useHabboAssetsBadges } from '../hooks/useHabboAssetsBadges';
import { useLanguage } from '../hooks/useLanguage';
import { Search, Filter, Grid, List, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';
import { BadgeDetailsModal } from './BadgeDetailsModal';

interface BadgeItem {
  code: string;
  name: string;
  image_url: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
}

export const CleanBadgesGrid: React.FC = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayedBadges, setDisplayedBadges] = useState<BadgeItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  console.log('🔍 [CleanBadgesGrid] Component state:', {
    activeCategory,
    searchTerm,
    currentPage,
    isLoading: false,
    isFetching: false,
    error: null,
    badgesCount: displayedBadges.length,
    dataReceived: displayedBadges.length
  });

  // Fetch badges data
  const { 
    data: badgeData, 
    isLoading, 
    isError,
    error,
    isFetching,
    refetch 
  } = useHabboAssetsBadges({
    search: searchTerm,
    category: activeCategory,
    page: currentPage,
    limit: 100,
    enabled: true
  });

  // Process and filter badges
  const badges = useMemo(() => {
    if (!badgeData?.badges) {
      console.log('📦 [CleanBadgesGrid] No badge data available');
      return [];
    }

    console.log(`📦 [CleanBadgesGrid] Received ${badgeData.badges.length} badges for page ${currentPage}`);
    return badgeData.badges;
  }, [badgeData, currentPage]);

  // Update displayed badges when data changes
  useEffect(() => {
    if (badges.length > 0) {
      if (currentPage === 1) {
        console.log('🔄 [CleanBadgesGrid] Resetting for category:', activeCategory, 'search:', searchTerm);
        setDisplayedBadges(badges);
      } else {
        console.log('📄 [CleanBadgesGrid] Appending page', currentPage, 'badges');
        setDisplayedBadges(prev => [...prev, ...badges]);
      }
      
      // Check if we have more data
      setHasMoreData(badgeData?.metadata?.hasMore || false);
    }
  }, [badges, currentPage, activeCategory, searchTerm, badgeData]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
    setDisplayedBadges([]);
    setHasMoreData(true);
  }, [searchTerm, activeCategory]);

  // Category options with translations
  const categoryOptions = [
    { value: 'all', label: t('allCategories') || 'Todas as Categorias', count: badgeData?.metadata?.categories?.all || 0 },
    { value: 'official', label: t('official') || 'Oficiais', count: badgeData?.metadata?.categories?.official || 0 },
    { value: 'achievements', label: t('achievements') || 'Conquistas', count: badgeData?.metadata?.categories?.achievements || 0 },
    { value: 'fansites', label: t('fansites') || 'Fã-sites', count: badgeData?.metadata?.categories?.fansites || 0 },
    { value: 'others', label: t('others') || 'Outros', count: badgeData?.metadata?.categories?.others || 0 },
  ];

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && !isFetching && hasMoreData && displayedBadges.length > 0) {
      console.log('🔄 [CleanBadgesGrid] Loading more badges, page:', currentPage + 1);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Handle badge click
  const handleBadgeClick = (badge: BadgeItem) => {
    setSelectedBadge(badge);
  };

  // Loading state
  if (isLoading && currentPage === 1) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-white">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">{t('badgesTitle') || 'Emblemas do Habbo'}</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-600">{t('loadingBadges') || 'Carregando emblemas...'}</p>
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
              <Button onClick={() => refetch()} variant="outline">
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

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('searchBadges') || 'Buscar emblemas...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="sm:w-48">
              <Select value={activeCategory} onValueChange={setActiveCategory}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Badge variant="secondary" className="ml-2">
                          {option.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{t('showingBadges') || 'Mostrando'} {displayedBadges.length} {t('badges') || 'emblemas'}</span>
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
      <div className="flex-1 overflow-auto" onScroll={handleScroll}>
        <div className="p-6">
          {displayedBadges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {t('noBadgesFound') || 'Nenhum emblema encontrado'}
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                {searchTerm 
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
                  ? "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3"
                  : "grid grid-cols-3 gap-4"
              }>
                {displayedBadges.map((badge) => (
                  <div
                    key={badge.code}
                    onClick={() => handleBadgeClick(badge)}
                    className={
                      viewMode === 'grid'
                        ? "group relative bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-blue-300"
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Loading more indicator */}
              {isFetching && currentPage > 1 && (
                <div className="flex justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('loadingMore') || 'Carregando mais...'}</span>
                  </div>
                </div>
              )}

              {/* End of results */}
              {!hasMoreData && displayedBadges.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">
                    {t('allBadgesLoaded') || 'Todos os emblemas foram carregados'}
                  </p>
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
            code: selectedBadge.code,
            name: selectedBadge.name,
            description: `Emblema oficial do Habbo Hotel. Este é o badge ${selectedBadge.code} - ${selectedBadge.name}.`,
            category: selectedBadge.category,
            image_url: selectedBadge.image_url,
            rarity: 'common'
          }}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
