
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Palette } from 'lucide-react';
import { useEditorHabboCategory } from '@/hooks/useEditorHabboClothing';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { HABBO_COLORS, getColorById } from '@/data/habboColors';
import FocusedClothingThumbnail from './FocusedClothingThumbnail';

interface LocalClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (item: ViaJovemFlashItem, colorId: string) => void;
  selectedItem?: string;
  selectedColor?: string;
  className?: string;
}

const LocalClothingGrid = ({
  selectedCategory,
  selectedGender,
  onItemSelect,
  selectedItem = '',
  selectedColor = '1',
  className = ''
}: LocalClothingGridProps) => {
  const [colorPopoverOpen, setColorPopoverOpen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'focused' | 'full'>('focused');
  
  const { items, isLoading, error } = useEditorHabboCategory(selectedCategory, selectedGender);

  // Função para detectar se uma cor é HC
  const isHCColor = (colorId: string): boolean => {
    const color = HABBO_COLORS.find(c => c.id === colorId);
    return color?.isHC || false;
  };

    // Cores disponíveis baseadas no sistema ViaJovem (cores mais usadas)
  const availableColors = useMemo(() => {
    return [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
      '21', '26', '31', '42', '45', '49', '61', '68', '92', '100', 
      '101', '102', '104', '105', '106', '143'
    ];
  }, []);

  const handleItemClick = (item: ViaJovemFlashItem) => {
        onItemSelect(item, selectedColor);
  };

  const handleColorSelect = (item: ViaJovemFlashItem, colorId: string) => {
        onItemSelect(item, colorId);
    setColorPopoverOpen(null);
  };

  const openColorPicker = (item: ViaJovemFlashItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setColorPopoverOpen(item.id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Carregando roupas ViaJovem...</span>
      </div>
    );
  }

  if (error) {
        return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p className="font-medium">Erro ao carregar roupas</p>
          <p className="text-sm text-gray-600 mt-1">Sistema ViaJovem indisponível</p>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
        return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p className="font-medium">Nenhuma roupa encontrada</p>
          <p className="text-sm mt-2">Categoria: {selectedCategory} - Gênero: {selectedGender}</p>
          <Badge variant="outline" className="mt-2">Sistema ViaJovem</Badge>
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
              <span>Roupas ViaJovem</span>
              <Badge variant="secondary">{items.length} itens</Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Flash Assets
              </Badge>
            </CardTitle>
            
            {/* Toggle para modo de visualização */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'focused' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('focused')}
                className="text-xs"
              >
                🔍 Focado
              </Button>
              <Button
                variant={viewMode === 'full' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('full')}
                className="text-xs"
              >
                👤 Completo
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de itens */}
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-2 bg-gray-50 rounded-lg">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            {viewMode === 'focused' ? (
              <FocusedClothingThumbnail
                item={item}
                colorId={selectedColor}
                gender={selectedGender}
                isSelected={selectedItem === item.figureId}
                onClick={handleItemClick}
                onColorChange={handleColorSelect}
                className="w-full"
              />
            ) : (
              <div
                className={`
                  aspect-square cursor-pointer transition-all duration-200 hover:scale-105 relative
                  ${selectedItem === item.figureId ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}
                `}
                onClick={() => handleItemClick(item)}
                title={item.name}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden border border-gray-200 relative">
                  <img
                    src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${selectedColor}&gender=${selectedGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    loading="lazy"
                  />
                  
                  {/* Special rarity indicators */}
                  <div className="absolute top-1 right-1 flex gap-1">
                    {/* HC Icon - baseado no nome do asset, propriedade club ou cor HC selecionada */}
                    {(item.name.toLowerCase().includes('hc') || 
                      item.name.toLowerCase().includes('club') ||
                      item.club === 'hc' ||
                      isHCColor(selectedColor)) && (
                      <img 
                        src="/assets/icon_HC_wardrobe.png" 
                        alt="HC" 
                        className="w-3 h-3"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    
                    {/* LTD Icon - baseado no nome do asset */}
                    {(item.name.toLowerCase().includes('ltd') || 
                      item.name.toLowerCase().includes('limited') ||
                      item.rarity === 'ltd') && (
                      <img 
                        src="/assets/icon_LTD_habbo.png" 
                        alt="LTD" 
                        className="w-3 h-3"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    
                    {/* NFT Icon - baseado no nome do asset */}
                    {(item.name.toLowerCase().includes('nft') || 
                      item.rarity === 'nft') && (
                      <img 
                        src="/assets/icon_wardrobe_nft_on.png" 
                        alt="NFT" 
                        className="w-3 h-3"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                    
                    {/* Sellable Icon - baseado no nome do asset */}
                    {(item.name.toLowerCase().includes('sell') || 
                      item.name.toLowerCase().includes('vend') ||
                      item.sellable) && (
                      <img 
                        src="/assets/icon_sellable_wardrobe.png" 
                        alt="Vendável" 
                        className="w-3 h-3"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botão de cor */}
            <Popover 
              open={colorPopoverOpen === item.id} 
              onOpenChange={(open) => setColorPopoverOpen(open ? item.id : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-0 right-0 w-6 h-6 p-0 bg-white/80 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => openColorPicker(item, e)}
                >
                  <Palette className="w-3 h-3" />
                </Button>
              </PopoverTrigger>
              
              <PopoverContent className="w-64 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">Escolha uma cor:</div>
                  
                  <div className="grid grid-cols-8 gap-1">
                    {availableColors.map((colorId) => {
                      const colorData = getColorById(colorId);
                      return (
                        <button
                          key={colorId}
                          className={`w-6 h-6 rounded border hover:scale-110 transition-transform ${
                            selectedColor === colorId ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'
                          }`}
                          style={{ 
                            backgroundColor: colorData ? `#${colorData.hex}` : '#DDDDDD'
                          }}
                          onClick={() => handleColorSelect(item, colorId)}
                          title={colorData?.name || `Cor ${colorId}`}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-gray-400 text-center">
                    ID: {item.figureId} | Fonte: ViaJovem Flash Assets
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>

      {/* Footer com informações */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>💾 Fonte: ViaJovem Flash Assets</span>
            <span>🎯 {items.length} itens • Modo {viewMode === 'focused' ? 'Focado' : 'Completo'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalClothingGrid;
