
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Filter } from 'lucide-react';
import { useOfficialHabboCategory, OfficialHabboAsset } from '@/hooks/useOfficialHabboAssets';
import FocusedClothingThumbnail from './FocusedClothingThumbnail';

interface OfficialClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  selectedHotel: string;
  onItemSelect: (asset: OfficialHabboAsset, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const OfficialClothingGrid = ({
  selectedCategory,
  selectedGender,
  selectedHotel,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: OfficialClothingGridProps) => {
  const [showHCOnly, setShowHCOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { data: assets, isLoading, error } = useOfficialHabboCategory(selectedCategory, selectedGender);

  // Filtrar assets
  const filteredAssets = useMemo(() => {
    let filtered = assets || [];
    
    if (showHCOnly) {
      filtered = filtered.filter(asset => asset.club === 'HC');
    }
    
    return filtered;
  }, [assets, showHCOnly]);

  const handleItemClick = (asset: OfficialHabboAsset) => {
    console.log('🎯 [OfficialGrid] Asset focado selecionado:', asset.name, asset.figureId);
    onItemSelect(asset, selectedColor);
  };

  const handleColorChange = (asset: OfficialHabboAsset, colorId: string) => {
    console.log('🎨 [OfficialGrid] Cor alterada com preview focado:', { asset: asset.name, colorId });
    onItemSelect(asset, colorId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando assets focados...</span>
      </div>
    );
  }

  if (error) {
    console.error('❌ [OfficialGrid] Erro:', error);
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p className="font-medium">Erro ao carregar assets oficiais</p>
          <p className="text-sm text-gray-600 mt-1">Sistema Habbo indisponível</p>
        </div>
      </Card>
    );
  }

  if (!filteredAssets.length) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Nenhum asset encontrado</p>
          <p className="text-sm mt-2">Categoria: {selectedCategory} - Gênero: {selectedGender}</p>
          <Badge variant="outline" className="mt-2">Sistema Oficial Focado</Badge>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com controles */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <span>Assets Focados Habbo</span>
              <Badge variant="secondary">{filteredAssets.length} itens</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Preview Focado
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
        </CardHeader>
      </Card>

      {/* Grid de assets focados */}
      <div className={`
        max-h-96 overflow-y-auto p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border
        ${viewMode === 'grid' 
          ? 'grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3' 
          : 'space-y-2'
        }
      `}>
        {filteredAssets.map((asset) => (
          <FocusedClothingThumbnail
            key={asset.id}
            asset={asset}
            colorId={selectedColor}
            gender={selectedGender}
            hotel={selectedHotel}
            isSelected={selectedItem === asset.figureId}
            onClick={() => handleItemClick(asset)}
            onColorChange={(colorId) => handleColorChange(asset, colorId)}
            className={viewMode === 'list' ? 'flex items-center gap-3 p-2 bg-white rounded shadow-sm' : ''}
          />
        ))}
      </div>

      {/* Footer com informações focadas */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>🎯 Fonte: Sistema Habbo Focado ({selectedHotel})</span>
            <span>
              📊 {filteredAssets.length} focados • 
              {filteredAssets.filter(a => a.club === 'HC').length} HC • 
              {filteredAssets.filter(a => a.club === 'FREE').length} FREE
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfficialClothingGrid;
