
import React, { useState, useMemo } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelCard } from './PanelCard';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { useEnhancedBadges, EnhancedBadgeItem } from '../hooks/useEnhancedBadges';
import { OptimizedBadgeImage } from './OptimizedBadgeImage';

const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: '📦' },
  { value: 'official', label: 'Staff', icon: '👑' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐' },
  { value: 'others', label: 'Outros', icon: '🎨' }
];

export const BadgeTabsGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<EnhancedBadgeItem | null>(null);

  const { data, isLoading, error, refetch } = useEnhancedBadges({
    limit: 5000,
    search: searchTerm,
    category: 'all',
    enabled: true
  });

  const categorizedBadges = useMemo(() => {
    if (!data?.badges) return {};
    
    return data.badges.reduce((acc, badge) => {
      const category = badge.category || 'others';
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    }, {} as Record<string, EnhancedBadgeItem[]>);
  }, [data?.badges]);

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

  const handleBadgeClick = (badge: EnhancedBadgeItem) => {
    setSelectedBadge(badge);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-4">
      <PanelCard title="Sistema de Emblemas - Organizado por Categorias">
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
            
            <button
              onClick={handleRefresh}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              title="Atualizar emblemas"
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              {CATEGORIES.map(category => (
                <TabsTrigger 
                  key={category.value} 
                  value={category.value}
                  className="flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  <span className="hidden md:inline">{category.label}</span>
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {category.value === 'all' 
                      ? (data?.badges?.length || 0)
                      : (categorizedBadges[category.value]?.length || 0)
                    }
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(category => (
              <TabsContent key={category.value} value={category.value} className="mt-4">
                <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                  {isLoading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando emblemas...</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2">Erro ao carregar emblemas</p>
                      <button
                        onClick={handleRefresh}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {!isLoading && !error && filteredBadges.length > 0 && (
                    <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
                      {filteredBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className="group relative aspect-square cursor-pointer hover:scale-110 transition-transform duration-200"
                          onClick={() => handleBadgeClick(badge)}
                          title={`${badge.code} - ${badge.name}`}
                        >
                          <OptimizedBadgeImage
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
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoading && !error && filteredBadges.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum emblema encontrado nesta categoria</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Estatísticas */}
          <div className="text-sm text-gray-500 text-center bg-gray-50 rounded-lg p-3">
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                📊 <strong>Total:</strong> {data?.badges?.length || 0} emblemas
              </span>
              <span className="flex items-center gap-1">
                🔍 <strong>Exibidos:</strong> {filteredBadges.length}
              </span>
              <span className="flex items-center gap-1">
                📂 <strong>Categoria:</strong> {CATEGORIES.find(c => c.value === activeTab)?.label}
              </span>
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
