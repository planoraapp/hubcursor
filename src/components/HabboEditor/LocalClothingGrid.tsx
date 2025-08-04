
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, RefreshCw } from 'lucide-react';
import { useLocalHabboCategory, LocalHabboClothingItem } from '@/hooks/useLocalHabboClothing';
import { HABBO_COLORS, getColorById } from '@/data/habboColors';

interface LocalClothingGridProps {
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (item: LocalHabboClothingItem, colorId: string) => void;
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
  
  const { items, isLoading, error } = useLocalHabboCategory(selectedCategory, selectedGender);

  const generateThumbnailUrl = (item: LocalHabboClothingItem, colorId: string = '1') => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${colorId}&gender=${selectedGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
  };

  // Cores disponíveis baseadas no sistema ViaJovem
  const availableColors = useMemo(() => {
    return [
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
      '61', '92', '45', '66', '82', '100', '101', '102', '104', '105', '106', '143'
    ];
  }, []);

  const handleItemClick = (item: LocalHabboClothingItem) => {
    console.log('🎯 [LocalClothingGrid] Item selecionado:', item);
    onItemSelect(item, selectedColor);
    setColorPopoverOpen(item.id);
  };

  const handleColorSelect = (item: LocalHabboClothingItem, colorId: string) => {
    console.log('🎨 [LocalClothingGrid] Cor selecionada:', { item: item.name, colorId });
    onItemSelect(item, colorId);
    setColorPopoverOpen(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando roupas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          <p>Erro ao carregar roupas</p>
          <p className="text-sm text-gray-600 mt-1">Usando dados locais como fallback</p>
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <p>Nenhuma roupa encontrada para esta categoria</p>
          <p className="text-sm mt-2">Categoria: {selectedCategory} - Gênero: {selectedGender}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <span>Roupas Disponíveis</span>
            <Badge variant="secondary">
              {items.length} itens
            </Badge>
            <Badge variant="outline" className="ml-2">
              {items[0]?.source === 'flash-assets' ? 'Flash Assets' : 'Dados Locais'}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Grid de itens baseado no ViaJovem */}
      <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="relative">
            <Popover 
              open={colorPopoverOpen === item.id} 
              onOpenChange={(open) => setColorPopoverOpen(open ? item.id : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`aspect-square p-1 h-auto hover:bg-gray-100 transition-colors border-2 ${
                    selectedItem === item.figureId ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'
                  }`}
                  onClick={() => handleItemClick(item)}
                  title={item.name}
                >
                  <img
                    src={generateThumbnailUrl(item, selectedColor)}
                    alt={item.name}
                    className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = generateThumbnailUrl(item, '1');
                    }}
                  />
                  
                  {/* Indicador de clube */}
                  {item.club === 'hc' && (
                    <Badge className="absolute top-0 right-0 text-xs bg-yellow-500 text-white p-1">
                      HC
                    </Badge>
                  )}
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
                    ID: {item.figureId} | Fonte: {item.source}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>

      {/* Info rodapé */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>Fonte: {items[0]?.source === 'flash-assets' ? 'Flash Assets' : 'Dados Locais'}</span>
            <span>{items.length} itens carregados</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalClothingGrid;
