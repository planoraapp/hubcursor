
import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Database } from 'lucide-react';
import { useHybridUnifiedBadges } from '../hooks/useHybridUnifiedBadges';
import { PanelCard } from './PanelCard';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import HybridBadgeImage from './HybridBadgeImage';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'all', label: 'Todos', icon: '🌟' },
  { value: 'official', label: 'Oficiais', icon: '🛡️' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐' },
  { value: 'others', label: 'Outros', icon: '🎨' }
];

export const CleanBadgesGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  // Usar o hook de badges unificados
  const { data, isLoading, error, refetch } = useHybridUnifiedBadges({
    limit: 1000,
    search: searchTerm,
    category: activeCategory,
    enabled: true
  });

  // Filtrar badges por categoria e busca
  const filteredBadges = useMemo(() => {
    if (!data?.badges) return [];
    
    let filtered = data.badges;
    
    // Filtrar por categoria
    if (activeCategory !== 'all') {
      filtered = filtered.filter(badge => badge.category === activeCategory);
    }
    
    // Filtrar por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.badge_code.toLowerCase().includes(searchLower) ||
        badge.badge_name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [data?.badges, activeCategory, searchTerm]);

  const handleBadgeClick = (badge: any) => {
    setSelectedBadge(badge);
  };

  const handleRefresh = () => {
    toast.info('Atualizando emblemas...');
    refetch();
  };

  console.log('🎯 [CleanBadgesGrid] Estado:', {
    isLoading,
    error,
    badgeCount: data?.badges?.length || 0,
    filteredCount: filteredBadges.length,
    activeCategory,
    searchTerm
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header com controles */}
      <div className="p-4 border-b bg-white/95">
        <div className="flex flex-col gap-4">
          {/* Título e status */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              Emblemas do Habbo
            </h2>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                {data?.badges?.length || 0} emblemas
              </span>
            </div>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar emblemas por código ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category.value}
                onClick={() => setActiveCategory(category.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {category.value === 'all' 
                    ? (data?.badges?.length || 0)
                    : data?.badges?.filter(b => b.category === category.value).length || 0
                  }
                </span>
              </button>
            ))}
          </div>

          {/* Botão de atualizar */}
          <div className="flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Carregando emblemas...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700 font-medium mb-2">Erro ao carregar emblemas</p>
              <p className="text-red-600 text-sm mb-4">{error.message}</p>
              <button
                onClick={handleRefresh}
                className="text-red-600 hover:text-red-700 underline font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Grid de badges */}
        {!isLoading && !error && filteredBadges.length > 0 && (
          <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
            {filteredBadges.map((badge) => (
              <div
                key={badge.id}
                className="group relative aspect-square cursor-pointer hover:scale-110 transition-transform duration-200 bg-gray-50 rounded border hover:border-blue-300"
                onClick={() => handleBadgeClick(badge)}
                title={`${badge.badge_code} - ${badge.badge_name}`}
              >
                <HybridBadgeImage
                  code={badge.badge_code}
                  name={badge.badge_name}
                  size="md"
                  className="w-full h-full p-1"
                />
                
                {/* Indicador de validação */}
                {badge.validation_count > 1 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {badge.validation_count > 9 ? '9+' : badge.validation_count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Nenhum resultado */}
        {!isLoading && !error && filteredBadges.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum emblema encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Tente ajustar os filtros ou fazer uma busca diferente
              </p>
              {data?.badges?.length === 0 && (
                <button
                  onClick={handleRefresh}
                  className="text-blue-600 hover:text-blue-700 underline font-medium"
                >
                  Carregar emblemas
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalhes */}
      {selectedBadge && (
        <BadgeDetailsModal
          badge={{
            id: selectedBadge.id,
            code: selectedBadge.badge_code,
            name: selectedBadge.badge_name,
            description: `Emblema ${selectedBadge.badge_code} - ${selectedBadge.badge_name}`,
            category: selectedBadge.category,
            imageUrl: selectedBadge.image_url,
            rarity: 'common',
            source: selectedBadge.source
          }}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
