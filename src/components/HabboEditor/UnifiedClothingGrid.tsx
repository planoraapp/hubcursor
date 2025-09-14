
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Filter, Database, Zap, Shield } from 'lucide-react';
import { useUnifiedHabboCategory, UnifiedHabboClothingItem } from '@/hooks/useUnifiedHabboClothing';
import UnifiedClothingThumbnail from './UnifiedClothingThumbnail';

interface UnifiedClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (item: UnifiedHabboClothingItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const UnifiedClothingGrid = ({
  selectedCategory,
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: UnifiedClothingGridProps) => {
  const [showHCOnly, setShowHCOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: items, isLoading, error } = useUnifiedHabboCategory(selectedCategory, selectedGender);

  // Filtrar itens
  const filteredItems = useMemo(() => {
    let filtered = items || [];
    
    if (showHCOnly) {
      filtered = filtered.filter(item => item.club === 'HC');
    }
    
    if (selectedSource !== 'all') {
      filtered = filtered.filter(item => item.source === selectedSource);
    }
    
    return filtered;
  }, [items, showHCOnly, selectedSource]);

  // Estatísticas por fonte
  const sourceStats = useMemo(() => {
    const stats: Record<string, number> = {};
    items?.forEach(item => {
      stats[item.source] = (stats[item.source] || 0) + 1;
    });
    return stats;
  }, [items]);

  const handleItemClick = (item: UnifiedHabboClothingItem) => {
        onItemSelect(item, selectedColor);
  };

  const handleColorChange = (item: UnifiedHabboClothingItem, colorId: string) => {
        onItemSelect(item, colorId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Carregando sistema unificado...</span>
      </div>
    );
  }

  if (error) {
        return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p className="font-medium">Erro ao carregar sistema unificado</p>
          <p className="text-sm text-gray-600 mt-1">Múltiplas fontes indisponíveis</p>
        </div>
      </Card>
    );
  }

  if (!filteredItems.length) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Nenhum item encontrado</p>
          <p className="text-sm mt-2">Categoria: {selectedCategory} - Gênero: {selectedGender}</p>
          <Badge variant="outline" className="mt-2">Sistema Unificado</Badge>
        </div>
      </Card>
    );
  }

  const sourceButtons = [
    { key: 'all', label: 'Todas', icon: '🌟', count: items?.length || 0 },
    { key: 'viajovem', label: 'ViaJovem', icon: '🟢', count: sourceStats['viajovem'] || 0 },
    { key: 'habbowidgets', label: 'HabboWidgets', icon: '🔵', count: sourceStats['habbowidgets'] || 0 },
    { key: 'official-habbo', label: 'Oficial', icon: '🟣', count: sourceStats['official-habbo'] || 0 },
    { key: 'flash-assets', label: 'Flash', icon: '🟠', count: sourceStats['flash-assets'] || 0 }
  ].filter(btn => btn.count > 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com controles unificados */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>Sistema Híbrido Unificado</span>
              <Badge variant="secondary">{filteredItems.length} itens</Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Habbo-Imaging
              </Badge>
            </CardTitle>
            
            <div className="flex gap-2">
              <Button
                variant={showHCOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowHCOnly(!showHCOnly)}
                className="text-xs"
              >
                <Filter className="w-3 h-3 mr-1" />
                {showHCOnly ? 'Todos' : 'HC Only'}
              </Button>
              
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="text-xs"
              >
                {viewMode === 'grid' ? '📋 Lista' : '📱 Grid'}
              </Button>
            </div>
          </div>

          {/* Filtros por fonte */}
          <div className="flex flex-wrap gap-2 mt-3">
            {sourceButtons.map(btn => (
              <Button
                key={btn.key}
                variant={selectedSource === btn.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource(btn.key)}
                className="text-xs px-3 py-1"
              >
                <span className="mr-1">{btn.icon}</span>
                {btn.label}
                <Badge variant="secondary" className="ml-1 text-[10px]">
                  {btn.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Grid unificado */}
      <div className={`
        max-h-96 overflow-y-auto p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border
        ${viewMode === 'grid' 
          ? 'grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3' 
          : 'space-y-2'
        }
      `}>
        {filteredItems.map((item) => (
          <UnifiedClothingThumbnail
            key={item.id}
            item={item}
            colorId={selectedColor}
            gender={selectedGender}
            hotel={selectedHotel}
            isSelected={selectedItem === item.figureId}
            onClick={() => handleItemClick(item)}
            onColorChange={(colorId) => handleColorChange(item, colorId)}
            className={viewMode === 'list' ? 'flex items-center gap-3 p-2 bg-white rounded shadow-sm' : ''}
          />
        ))}
      </div>

      {/* Footer com estatísticas unificadas */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>🎯 Fonte: Sistema Híbrido Unificado com Habbo-Imaging ({selectedHotel})</span>
            <div className="flex items-center gap-4">
              <span>📊 Total: {filteredItems.length}</span>
              <span>🟢 VJ: {sourceStats['viajovem'] || 0}</span>
              <span>🔵 HW: {sourceStats['habbowidgets'] || 0}</span>
              <span>🟣 OF: {sourceStats['official-habbo'] || 0}</span>
              <span>🟠 FL: {sourceStats['flash-assets'] || 0}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Thumbnails focadas • Fallback automático • Cache inteligente
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedClothingGrid;
