
import React, { useState, useMemo, useCallback } from 'react';
import { Search, RefreshCw, Download, HardDrive } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PanelCard } from './PanelCard';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { HybridSystemStatus } from './HybridSystemStatus';
import { useHybridUnifiedBadges, usePopulateInitialBadges, HybridUnifiedBadgeItem } from '../hooks/useHybridUnifiedBadges';
import ValidatedBadgeImage from './ValidatedBadgeImage';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'all', label: 'Todos', icon: '🌟', color: 'from-blue-100 to-purple-100' },
  { value: 'official', label: 'Oficiais', icon: '🛡️', color: 'from-blue-100 to-indigo-100' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆', color: 'from-yellow-100 to-orange-100' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐', color: 'from-purple-100 to-pink-100' },
  { value: 'others', label: 'Outros', icon: '🎨', color: 'from-gray-100 to-slate-100' }
];

export const HybridUnifiedBadgesGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<HybridUnifiedBadgeItem | null>(null);

  const { data, isLoading, error, refetch } = useHybridUnifiedBadges({
    limit: 1000,
    search: searchTerm,
    category: activeTab,
    enabled: true
  });

  const populateMutation = usePopulateInitialBadges();

  // Badges categorizados
  const categorizedBadges = useMemo(() => {
    if (!data?.badges) return {};
    
    return data.badges.reduce((acc, badge) => {
      const category = badge.category || 'others';
      if (!acc[category]) acc[category] = [];
      acc[category].push(badge);
      return acc;
    }, {} as Record<string, HybridUnifiedBadgeItem[]>);
  }, [data?.badges]);

  // Badges filtrados para exibição
  const filteredBadges = useMemo(() => {
    const allBadges = data?.badges || [];
    let filtered = activeTab === 'all' ? allBadges : (categorizedBadges[activeTab] || []);
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(badge => 
        badge.badge_code.toLowerCase().includes(searchLower) ||
        badge.badge_name.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [data?.badges, categorizedBadges, activeTab, searchTerm]);

  const handleBadgeClick = useCallback((badge: HybridUnifiedBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const handleRefresh = useCallback(() => {
    toast.info('Atualizando sistema simplificado...');
    refetch();
  }, [refetch]);

  const handlePopulateInitial = useCallback(async () => {
    toast.info('Populando base de dados do Storage do Supabase...');
    
    try {
      const result = await populateMutation.mutateAsync();
      toast.success(`População concluída! ${result.populated || 0} emblemas do storage adicionados.`);
      refetch(); // Atualizar dados após população
    } catch (error) {
      toast.error('Erro ao popular base de dados');
          }
  }, [populateMutation, refetch]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Verificar se precisa de população inicial
  const needsPopulation = (data?.badges?.length || 0) < 50;

  return (
    <div className="space-y-4">
      <PanelCard title="Sistema Simplificado de Emblemas - Storage + HabboWidgets">
        <div className="space-y-4">
          {/* Status do Sistema Simplificado */}
          <HybridSystemStatus
            metadata={data?.metadata}
            isLoading={isLoading}
            error={error}
            badgeCount={data?.badges?.length || 0}
          />

          {/* Controles Simplificados */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar emblemas (Storage + HabboWidgets)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            
            <div className="flex gap-2">
              {needsPopulation && (
                <Button
                  onClick={handlePopulateInitial}
                  disabled={populateMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2"
                >
                  <HardDrive size={20} className={populateMutation.isPending ? 'animate-spin' : ''} />
                  {populateMutation.isPending ? 'Populando...' : 'Popular do Storage'}
                </Button>
              )}
              
              <Button
                onClick={handleRefresh}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Tabs com Categorias */}
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
                  <div className={`bg-gradient-to-r ${category.color} text-gray-700 px-2 py-1 rounded-full text-xs font-bold border border-gray-300`}>
                    {category.value === 'all' 
                      ? (data?.badges?.length || 0)
                      : (categorizedBadges[category.value]?.length || 0)
                    }
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(category => (
              <TabsContent key={category.value} value={category.value} className="mt-6">
                <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Header da categoria */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        <span className="font-bold text-gray-800">
                          {filteredBadges.length} Emblemas - {category.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 bg-green-100 px-2 py-1 rounded">
                        Sistema Simplificado
                      </div>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-700 font-bold text-lg">Carregando Sistema Simplificado...</p>
                      <p className="text-gray-500 text-sm mt-1">Storage Supabase + HabboWidgets</p>
                    </div>
                  )}

                  {error && !data && (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2 font-medium">Erro no Sistema Simplificado</p>
                      <p className="text-gray-500 text-sm mb-4">{error.message}</p>
                      <Button onClick={handleRefresh} variant="outline">
                        Tentar novamente
                      </Button>
                    </div>
                  )}

                  {!isLoading && filteredBadges.length > 0 && (
                    <div className="p-4">
                      <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
                        {filteredBadges.map((badge) => (
                          <div
                            key={badge.id}
                            className="group relative aspect-square cursor-pointer hover:scale-110 transition-transform duration-200 border-2 border-transparent hover:border-green-300 rounded"
                            onClick={() => handleBadgeClick(badge)}
                            title={`${badge.badge_code} - ${badge.badge_name} (${badge.source})`}
                          >
                            <img
                              src={badge.image_url}
                              alt={`${badge.badge_code} - ${badge.badge_name}`}
                              className="w-full h-full object-contain rounded"
                              style={{ imageRendering: 'pixelated' }}
                              loading="lazy"
                            />
                            
                            {/* Indicador de fonte */}
                            <div className="absolute -bottom-1 -right-1 text-xs bg-black bg-opacity-75 text-white px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              {badge.source === 'SupabaseStorage' ? '📦' : '🌐'}
                            </div>
                            
                            {/* Contador de validações */}
                            {badge.validation_count > 1 && (
                              <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {badge.validation_count > 9 ? '9+' : badge.validation_count}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isLoading && !error && filteredBadges.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Nenhum emblema encontrado nesta categoria</p>
                      {needsPopulation && (
                        <div className="mt-4">
                          <Button onClick={handlePopulateInitial} disabled={populateMutation.isPending}>
                            <HardDrive className="w-4 h-4 mr-2" />
                            {populateMutation.isPending ? 'Populando...' : 'Popular do Storage'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Estatísticas do Sistema */}
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {data?.badges?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Total</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-indigo-600">
                  {categorizedBadges.official?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Oficiais</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">
                  {categorizedBadges.achievements?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Conquistas</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-pink-600">
                  {categorizedBadges.fansites?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Fã-sites</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-600">
                  {categorizedBadges.others?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Outros</div>
              </div>
            </div>
          </div>
        </div>
      </PanelCard>

      {/* Modal de Detalhes */}
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
            source: selectedBadge.source,
            scrapedAt: selectedBadge.created_at,
            metadata: {
              source_info: selectedBadge.source,
              validation_count: selectedBadge.validation_count
            }
          }}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
