// src/components/badges/UnifiedBadgeGrid.tsx
// Componente unificado que substitui HybridUnifiedBadgesGrid e HybridBadgeTabsGrid
import React, { useState, useMemo, useCallback } from 'react';
import { Search, RefreshCw, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PanelCard } from '../PanelCard';
import { BadgeDetailsModal } from '../BadgeDetailsModal';
import { useHybridUnifiedBadges, usePopulateInitialBadges } from '../../hooks/useHybridUnifiedBadges';
import ValidatedBadgeImage from '../ValidatedBadgeImage';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/I18nContext';

const CATEGORIES = [
  { value: 'all', label: 'Todos', icon: '🌟' },
  { value: 'official', label: 'Oficiais', icon: '🛡️' },
  { value: 'achievements', label: 'Conquistas', icon: '🏆' },
  { value: 'fansites', label: 'Fã-sites', icon: '⭐' },
  { value: 'others', label: 'Outros', icon: '🎨' }
];

interface UnifiedBadgeGridProps {
  variant?: 'grid' | 'tabs';
  limit?: number;
  enablePopulate?: boolean;
}

export const UnifiedBadgeGrid: React.FC<UnifiedBadgeGridProps> = ({
  variant = 'grid',
  limit = 1000,
  enablePopulate = true
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const { data, isLoading, error, refetch } = useHybridUnifiedBadges({
    limit,
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
    }, {} as Record<string, any[]>);
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

  const handleBadgeClick = useCallback((badge: any) => {
    setSelectedBadge(badge);
  }, []);

  const { t } = useI18n();
  
  const handleRefresh = useCallback(() => {
    toast.info(t('toast.updatingBadges'));
    refetch();
  }, [refetch, t]);

  const handlePopulateInitial = useCallback(() => {
    if (enablePopulate) {
      populateMutation.mutate();
    }
  }, [enablePopulate, populateMutation]);

  if (isLoading) {
    return (
      <PanelCard>
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          Carregando badges...
        </div>
      </PanelCard>
    );
  }

  if (error) {
    return (
      <PanelCard>
        <div className="text-center p-8 text-red-600">
          Erro ao carregar badges. Tente novamente.
        </div>
      </PanelCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar badges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          {enablePopulate && (
            <Button 
              onClick={handlePopulateInitial} 
              variant="outline" 
              size="sm"
              disabled={populateMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Popular
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          {CATEGORIES.map((category) => (
            <TabsTrigger key={category.value} value={category.value}>
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {/* Grid de badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {filteredBadges.map((badge) => (
              <div
                key={badge.badge_code}
                onClick={() => handleBadgeClick(badge)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <ValidatedBadgeImage
                  badgeCode={badge.badge_code}
                  size={64}
                  className="w-16 h-16 mx-auto"
                />
                <p className="text-xs text-center mt-1 truncate">
                  {badge.badge_name}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes */}
      {selectedBadge && (
        <BadgeDetailsModal
          badge={selectedBadge}
          onClose={() => setSelectedBadge(null)}
        />
      )}
    </div>
  );
};
