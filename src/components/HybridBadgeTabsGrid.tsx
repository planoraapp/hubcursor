
import React, { useState, useMemo } from 'react';
import { Search, RefreshCw, Database, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelCard } from './PanelCard';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { useHabboApiBadges, HabboApiBadgeItem } from '../hooks/useHabboApiBadges';
import HybridBadgeImage from './HybridBadgeImage';

const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: '📦' },
  { value: 'official', label: 'Staff', icon: '👑' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐' },
  { value: 'others', label: 'Outros', icon: '🎨' }
];

export const HybridBadgeTabsGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<HabboApiBadgeItem | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const { data, isLoading, error, refetch } = useHabboApiBadges({
    limit: 5000,
    search: searchTerm,
    category: 'all',
    forceRefresh,
    enabled: true
  });

  const categorizedBadges = useMemo(() => {
    if (!data?.badges) return {};
    
    return data.badges.reduce((acc, badge) => {
      const category = badge.category || 'others';
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    }, {} as Record<string, HabboApiBadgeItem[]>);
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

  const handleBadgeClick = (badge: HabboApiBadgeItem) => {
    setSelectedBadge(badge);
  };

  const handleRefresh = () => {
    setForceRefresh(true);
    refetch().then(() => {
      setForceRefresh(false);
    });
  };

  return (
    <div className="space-y-4">
      <PanelCard title="Sistema Híbrido de Emblemas - HabboAPI + HabboAssets">
        <div className="space-y-4">
          {/* Status do Sistema */}
          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">
                Fonte: {data?.metadata?.source === 'habbo-api' ? 'HabboAPI' : 
                       data?.metadata?.source === 'cache' ? 'Cache' : 'Fallback'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">
                Imagens: HabboAssets Priority
              </span>
            </div>
            {data?.metadata?.cacheInfo && (
              <div className="text-xs text-gray-600">
                TTL: {Math.round(data.metadata.cacheInfo.ttl / (1000 * 60 * 60))}h
              </div>
            )}
          </div>

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
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              title="Atualizar emblemas da HabboAPI"
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
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
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
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">Carregando emblemas da HabboAPI...</p>
                      <p className="text-gray-500 text-sm mt-1">Buscando dados em tempo real</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2 font-medium">Erro ao carregar emblemas da HabboAPI</p>
                      <p className="text-gray-500 text-sm mb-4">{error.message}</p>
                      <button
                        onClick={handleRefresh}
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
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
                               title="HabboAPI" />
                        </div>
                      ))}
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

          {/* Estatísticas Avançadas */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">{data?.badges?.length || 0}</div>
                <div className="text-xs text-gray-600 font-medium">Total HabboAPI</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">{filteredBadges.length}</div>
                <div className="text-xs text-gray-600 font-medium">Exibidos</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(categorizedBadges).length}
                </div>
                <div className="text-xs text-gray-600 font-medium">Categorias</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">
                  {data?.metadata?.source === 'cache' ? '⚡' : '🔄'}
                </div>
                <div className="text-xs text-gray-600 font-medium">Status</div>
              </div>
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
