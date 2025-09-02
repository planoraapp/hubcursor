
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { HABBO_COLORS, getColorById } from '@/data/habboColors';

interface ViaJovemClothingGridCleanProps {
  items: ViaJovemFlashItem[];
  selectedCategory: string;
  selectedGender: 'M' | 'F';
  onItemSelect: (itemId: string) => void;
  onColorSelect: (colorId: string) => void;
  selectedItem: string;
  selectedColor: string;
}

export const ViaJovemClothingGridClean = ({
  items,
  selectedCategory,
  selectedGender,
  onItemSelect,
  onColorSelect,
  selectedItem,
  selectedColor
}: ViaJovemClothingGridCleanProps) => {
  const [colorPopoverOpen, setColorPopoverOpen] = useState<string | null>(null);

  // Filtrar itens por categoria e gênero
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.category === selectedCategory && 
      (item.gender === selectedGender || item.gender === 'U')
    );
  }, [items, selectedCategory, selectedGender]);

  const generateThumbnailUrl = (item: ViaJovemFlashItem, colorId: string = '1') => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${colorId}&gender=${selectedGender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
  };

  // Cores disponíveis (usando as cores padrão do ViaJovem por enquanto)
  const availableColors = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '61', '92', '45', '66', '82'
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        {filteredItems.length} itens disponíveis
      </div>
      
      <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
        {filteredItems.map((item) => (
          <div key={item.id} className="relative">
            <Popover 
              open={colorPopoverOpen === item.id} 
              onOpenChange={(open) => setColorPopoverOpen(open ? item.id : null)}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className={`aspect-square p-1 h-auto hover:bg-gray-100 transition-colors ${
                    selectedItem === item.figureId ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => {
                    onItemSelect(item.figureId);
                    setColorPopoverOpen(item.id);
                  }}
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
                          onClick={() => {
                            onColorSelect(colorId);
                            setColorPopoverOpen(null);
                          }}
                          title={colorData?.name || `Cor ${colorId}`}
                        />
                      );
                    })}
                  </div>
                  
                  <div className="text-xs text-gray-400 text-center">
                    ID: {item.figureId}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    </div>
  );
};
