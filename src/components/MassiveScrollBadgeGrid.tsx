
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Search, RefreshCw, Database, Zap, TrendingUp, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelCard } from './PanelCard';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { useHabboApiBadges, HabboApiBadgeItem } from '../hooks/useHabboApiBadges';
import HybridBadgeImage from './HybridBadgeImage';

const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: '📦', color: 'from-blue-100 to-purple-100' },
  { value: 'official', label: 'Staff', icon: '👑', color: 'from-yellow-100 to-orange-100' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆', color: 'from-green-100 to-emerald-100' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐', color: 'from-purple-100 to-pink-100' },
  { value: 'others', label: 'Outros', icon: '🎨', color: 'from-gray-100 to-slate-100' }
];

const ITEMS_PER_LOAD = 500; // Carrega 500 badges por vez
const GRID_COLUMNS = 'grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 2xl:grid-cols-24';

export const MassiveScrollBadgeGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<HabboApiBadgeItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, refetch } = useHabboApiBadges({
    limit: 10000, // Buscar máximo possível
    search: searchTerm,
    category: 'all',
    enabled: true
  });

  // Badges categorizados
  const categorizedBadges = useMemo(() => {
    if (!data?.badges) return {};
    
    return data.badges.reduce((acc, badge) => {
      const category = badge.category || 'others';
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    }, {} as Record<string, HabboApiBadgeItem[]>);
  }, [data?.badges]);

  // Badges filtrados para exibição
  const filteredBadges = useMemo(() => {
    const allBadges = data?.badges || [];
    let filtered = activeTab === 'all' ? allBadges : (categorizedBadges[activeTab] || []);
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.code.toLowerCase().includes(searchLower) ||
        badge.name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [data?.badges, categorizedBadges, activeTab, searchTerm]);

  // Badges visíveis (limitados para performance)
  const visibleBadges = useMemo(() => {
    return filteredBadges.slice(0, visibleCount);
  }, [filteredBadges, visibleCount]);

  // Intersection Observer para scroll infinito
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !isLoadingMore && visibleCount < filteredBadges.length) {
          setIsLoadingMore(true);
          
          // Simular carregamento com delay mínimo
          setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + ITEMS_PER_LOAD, filteredBadges.length));
            setIsLoadingMore(false);
          }, 100);
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '100px',
        threshold: 0.1
      }
    );

    const currentObserver = observerRef.current;
    if (currentObserver) {
      observer.observe(currentObserver);
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver);
      }
    };
  }, [visibleCount, filteredBadges.length, isLoadingMore]);

  // Reset visible count quando filtros mudarem
  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD);
  }, [activeTab, searchTerm]);

  const handleBadgeClick = useCallback((badge: HabboApiBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
    setVisibleCount(ITEMS_PER_LOAD);
  }, [refetch]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, []);

  const progressPercentage = Math.round((visibleCount / filteredBadges.length) * 100);

  return (
    <div className="space-y-4">
      <PanelCard title="Sistema Massivo de Emblemas - Fonte Única Otimizada">
        <div className="space-y-4">
          {/* Status do Sistema Massivo */}
          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-800">
                Fonte: {data?.metadata?.source === 'massive-collection' ? 'Coleção Massiva' : 
                       data?.metadata?.source === 'cache' ? 'Cache Otimizado' : 'Sistema Híbrido'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="font-bold text-green-800">
                Performance: Scroll Infinito
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-purple-800">
                +{data?.badges?.length || 0} Badges
              </span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar entre milhares de emblemas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              Atualizar Sistema
            </button>
          </div>

          {/* Tabs com Estatísticas */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5 h-auto">
              {CATEGORIES.map(category => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex flex-col items-center gap-1 p-3 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="hidden md:inline font-medium">{category.label}</span>
                  </div>
                  <div className={`bg-gradient-to-r ${category.color} text-gray-700 px-2 py-1 rounded-full text-xs font-bold`}>
                    {category.value === 'all' 
                      ? (data?.badges?.length || 0).toLocaleString()
                      : (categorizedBadges[category.value]?.length || 0).toLocaleString()
                    }
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(category => (
              <TabsContent key={category.value} value={category.value} className="mt-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Header da categoria com progresso */}
                  {visibleBadges.length > 0 && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-700">
                            Exibindo {visibleBadges.length.toLocaleString()} de {filteredBadges.length.toLocaleString()} badges
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {progressPercentage}% carregado
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-700 font-bold text-lg">Carregando Sistema Massivo...</p>
                      <p className="text-gray-500 text-sm mt-1">Coletando milhares de emblemas</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2 font-medium">Erro no Sistema Massivo</p>
                      <p className="text-gray-500 text-sm mb-4">{error.message}</p>
                      <button
                        onClick={handleRefresh}
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {!isLoading && !error && visibleBadges.length > 0 && (
                    <div 
                      ref={scrollContainerRef}
                      className="max-h-96 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    >
                      <div className={`grid ${GRID_COLUMNS} gap-1`}>
                        {visibleBadges.map((badge, index) => (
                          <div
                            key={`${badge.id}_${index}`}
                            className="group relative aspect-square cursor-pointer hover:scale-110 transition-transform duration-200"
                            onClick={() => handleBadgeClick(badge)}
                            title={`${badge.code} - ${badge.name}`}
                          >
                            <HybridBadgeImage
                              code={badge.code}
                              name={badge.name}
                              size="sm"
                              className="w-full h-full"
                            />
                            
                            {/* Indicador de raridade */}
                            {badge.rarity !== 'common' && (
                              <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full shadow-sm ${
                                badge.rarity === 'legendary' ? 'bg-yellow-500' :
                                badge.rarity === 'rare' ? 'bg-purple-500' : 'bg-blue-500'
                              }`} />
                            )}

                            {/* Indicador de fonte */}
                            <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                                 title="Sistema Massivo" />
                          </div>
                        ))}
                      </div>

                      {/* Loading indicator para scroll infinito */}
                      <div ref={observerRef} className="py-4">
                        {isLoadingMore && (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                            <p className="text-sm text-gray-600">Carregando mais badges...</p>
                          </div>
                        )}
                        
                        {visibleCount >= filteredBadges.length && filteredBadges.length > 0 && (
                          <div className="text-center text-gray-500 text-sm">
                            🎉 Todos os {filteredBadges.length.toLocaleString()} badges foram carregados!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && filteredBadges.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum emblema encontrado nesta categoria</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Tente ajustar os filtros ou fazer uma busca diferente
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Estatísticas Massivas */}
          <div className="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {(data?.badges?.length || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">Total Sistema</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {filteredBadges.length.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">Categoria Atual</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {visibleBadges.length.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">Carregados</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(categorizedBadges).length}
                </div>
                <div className="text-xs text-gray-600 font-medium">Categorias</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-red-600">
                  {data?.metadata?.source === 'cache' ? '⚡' : '🔄'}
                </div>
                <div className="text-xs text-gray-600 font-medium">Status</div>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Modal de Detalhes */}
      {selectedBadge && (
        <BadgeDetailsModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
