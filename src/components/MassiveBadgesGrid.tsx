
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Filter, Award, RefreshCw } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { VirtualizedBadgeGrid } from './VirtualizedBadgeGrid';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { useEnhancedBadges, EnhancedBadgeItem } from '../hooks/useEnhancedBadges';

const CATEGORIES = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'official', label: '👑 Staff' },
  { value: 'achievements', label: '🏆 Conquistas' },
  { value: 'fansites', label: '⭐ Fã-sites' },
  { value: 'others', label: '📦 Outros' }
];

export const MassiveBadgesGrid: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<EnhancedBadgeItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [allBadges, setAllBadges] = useState<EnhancedBadgeItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 800,
    height: 600
  });

  const { data, isLoading, error, refetch } = useEnhancedBadges({
    limit: 1000,
    search: searchTerm,
    category: selectedCategory,
    enabled: true
  });

  // Atualizar badges quando dados chegam
  useEffect(() => {
    if (data?.badges) {
      if (currentPage === 1) {
        setAllBadges(data.badges);
      } else {
        setAllBadges(prev => [...prev, ...data.badges]);
      }
    }
  }, [data, currentPage]);

  // Reset ao mudar categoria ou busca
  useEffect(() => {
    setCurrentPage(1);
    setAllBadges([]);
  }, [selectedCategory, searchTerm]);

  // Observar dimensões do container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const handleBadgeClick = useCallback((badge: EnhancedBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const loadNextPage = useCallback(async () => {
    if (!isLoading && data?.metadata?.hasMore) {
      setCurrentPage(prev => prev + 1);
      // A query será re-executada automaticamente
    }
  }, [isLoading, data?.metadata?.hasMore]);

  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setAllBadges([]);
    refetch();
  }, [refetch]);

  const filteredBadges = searchTerm 
    ? allBadges.filter(badge => 
        badge.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        badge.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allBadges;

  return (
    <div className="space-y-4">
      <PanelCard title="Sistema Massivo de Emblemas - Otimizado V3">
        <div className="space-y-4">
          {/* Controles */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emblemas por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="habbo-input w-full pl-10 pr-4 py-3 text-base"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="habbo-input px-4 py-3 min-w-[200px]"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleRefresh}
                className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                title="Atualizar emblemas"
                disabled={isLoading}
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Status de carregamento */}
          {isLoading && allBadges.length === 0 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Carregando emblemas...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 font-semibold mb-2">Erro ao carregar emblemas</p>
              <button
                onClick={handleRefresh}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Grid Virtualizado */}
          <div 
            ref={containerRef}
            className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden"
            style={{ height: '650px' }}
          >
            {filteredBadges.length > 0 && (
              <VirtualizedBadgeGrid
                badges={filteredBadges}
                onBadgeClick={handleBadgeClick}
                hasNextPage={data?.metadata?.hasMore || false}
                loadNextPage={loadNextPage}
                isLoading={isLoading}
                containerWidth={containerDimensions.width}
                containerHeight={650}
              />
            )}
          </div>

          {/* Estatísticas */}
          <div className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-3">
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                📊 <strong>Carregados:</strong> {allBadges.length} emblemas
              </span>
              <span className="flex items-center gap-1">
                🔍 <strong>Exibidos:</strong> {filteredBadges.length}
              </span>
              <span className="flex items-center gap-1">
                ⭐ <strong>Raros:</strong> {allBadges.filter(b => b.rarity !== 'common').length}
              </span>
              {data?.metadata?.hasMore && (
                <span className="flex items-center gap-1">
                  📈 <strong>Mais disponíveis</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Modal */}
      {selectedBadge && (
        <BadgeDetailsModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
