
import React, { useState, useMemo, useCallback } from 'react';
import { Search, RefreshCw, Database, CheckCircle, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PanelCard } from './PanelCard';
import { BadgeDetailsModal } from './BadgeDetailsModal';
import { useValidatedBadges, ValidatedBadgeItem } from '../hooks/useValidatedBadges';
import ValidatedBadgeImage from './ValidatedBadgeImage';

const CATEGORIES = [
  { value: 'all', label: 'Todas', icon: '✅', color: 'from-green-100 to-blue-100' },
  { value: 'HabboWidgets', label: 'HabboWidgets', icon: '🌐', color: 'from-blue-100 to-purple-100' },
  { value: 'HabboAssets', label: 'HabboAssets', icon: '🏛️', color: 'from-purple-100 to-pink-100' },
  { value: 'SupabaseBucket', label: 'Storage', icon: '📦', color: 'from-orange-100 to-red-100' }
];

export const ValidatedBadgesGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<ValidatedBadgeItem | null>(null);

  const { data, isLoading, error, refetch } = useValidatedBadges({
    limit: 1000,
    search: searchTerm,
    enabled: true
  });

  // Badges categorizados por fonte
  const categorizedBadges = useMemo(() => {
    if (!data?.badges) return {};
    
    return data.badges.reduce((acc, badge) => {
      const source = badge.source || 'unknown';
      if (!acc[source]) acc[source] = [];
      acc[source].push(badge);
      return acc;
    }, {} as Record<string, ValidatedBadgeItem[]>);
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

  const handleBadgeClick = useCallback((badge: ValidatedBadgeItem) => {
    setSelectedBadge(badge);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="space-y-4">
      <PanelCard title="Sistema de Emblemas Validados - 100% Reais e Verificados">
        <div className="space-y-4">
          {/* Status do Sistema Validado */}
          <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-bold text-green-800">
                Status: VALIDADO & ATIVO
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-blue-800">
                Fonte: Base de Dados Validada
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-bold text-purple-800">
                {data?.badges?.length || 0} Badges Verificados
              </span>
            </div>
          </div>

          {/* Controles */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar entre badges validados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
            
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              Atualizar Sistema Validado
            </button>
          </div>

          {/* Tabs com Estatísticas por Fonte */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4 h-auto">
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
                    } VALIDADOS
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
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-gray-800">
                          {filteredBadges.length} Badges Validados - {category.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 bg-green-100 px-2 py-1 rounded">
                        Sistema AI Validado
                      </div>
                    </div>
                  </div>

                  {isLoading && (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-700 font-bold text-lg">Carregando Badges Validados...</p>
                      <p className="text-gray-500 text-sm mt-1">Sistema de validação AI em funcionamento</p>
                    </div>
                  )}

                  {error && (
                    <div className="text-center py-8">
                      <p className="text-red-600 mb-2 font-medium">Erro no Sistema Validado</p>
                      <p className="text-gray-500 text-sm mb-4">{error.message}</p>
                      <button
                        onClick={handleRefresh}
                        className="text-green-600 hover:text-green-700 underline font-medium"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  )}

                  {!isLoading && !error && filteredBadges.length > 0 && (
                    <div className="p-4">
                      <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-2">
                        {filteredBadges.map((badge) => (
                          <div
                            key={badge.id}
                            className="group relative aspect-square cursor-pointer hover:scale-110 transition-transform duration-200 border-2 border-transparent hover:border-green-300 rounded"
                            onClick={() => handleBadgeClick(badge)}
                            title={`${badge.badge_code} - ${badge.badge_name} (VALIDADO: ${badge.source})`}
                          >
                            <ValidatedBadgeImage
                              code={badge.badge_code}
                              name={badge.badge_name}
                              size="sm"
                              className="w-full h-full"
                            />
                            
                            {/* Contador de validações */}
                            {badge.validation_count > 1 && (
                              <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
                      <p className="text-gray-600">Nenhum badge validado encontrado nesta categoria</p>
                      <p className="text-gray-500 text-sm mt-1">
                        Tente ajustar os filtros ou fazer uma busca diferente
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Estatísticas Detalhadas */}
          <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-lg p-4 border-2 border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">
                  {data?.badges?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Total Validados</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-blue-600">
                  {categorizedBadges.HabboWidgets?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">HabboWidgets</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-purple-600">
                  {categorizedBadges.HabboAssets?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">HabboAssets</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-orange-600">
                  {categorizedBadges.SupabaseBucket?.length || 0}
                </div>
                <div className="text-xs text-gray-600 font-medium">Storage</div>
              </div>
            </div>
          </div>

          {/* Aviso do Sistema */}
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <h4 className="text-green-800 font-bold">Sistema de Validação AI Implementado</h4>
                <p className="text-green-700 text-sm mt-1">
                  Todos os badges são validados em tempo real através da nova Edge Function. 
                  Zero badges fictícios, 100% reais e verificados em múltiplas fontes oficiais.
                </p>
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
