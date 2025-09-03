
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Crown } from 'lucide-react';
import { OFFICIAL_HABBO_PALETTES, getCategoryPalette, isValidColorForCategory } from '@/lib/enhancedCategoryMapperV2';

interface OfficialHabboColorSelectorProps {
  selectedCategory: string;
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  availableColors?: string[];
  children: React.ReactNode;
}

const OfficialHabboColorSelector = ({
  selectedCategory,
  selectedColor,
  onColorSelect,
  availableColors = [],
  children
}: OfficialHabboColorSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Obter paleta oficial correta para a categoria
  const palette = getCategoryPalette(selectedCategory);
  
  // Filtrar cores disponíveis se especificado
  const colorsToShow = availableColors.length > 0
    ? palette.colors.filter(color => availableColors.includes(color.id))
    : palette.colors;

  const handleColorSelect = (colorId: string) => {
    // Validar se a cor é válida para a categoria
    if (isValidColorForCategory(colorId, selectedCategory)) {
      onColorSelect(colorId);
      setIsOpen(false);
    }
  };

  const getPaletteInfo = () => {
    switch (selectedCategory) {
      case 'hd':
      case 'sk':
        return {
          name: 'Paleta 1 - Tons de Pele',
          description: 'Cores oficiais Habbo para pele',
          icon: '🤏'
        };
      case 'hr':
        return {
          name: 'Paleta 2 - Cores de Cabelo',
          description: 'Cores oficiais Habbo para cabelo',
          icon: '💇'
        };
      default:
        return {
          name: 'Paleta 3 - Cores de Roupas',
          description: 'Cores oficiais Habbo para roupas e acessórios',
          icon: '👕'
        };
    }
  };

  const paletteInfo = getPaletteInfo();
  const selectedColorData = palette.colors.find(c => c.id === selectedColor);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4" side="right" align="start">
        <div className="space-y-4">
          {/* Header da Paleta */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{paletteInfo.icon}</span>
            <div>
              <div className="font-bold text-sm">{paletteInfo.name}</div>
              <div className="text-xs text-gray-600">{paletteInfo.description}</div>
            </div>
          </div>

          {/* Cor Selecionada */}
          {selectedColorData && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div 
                className="w-8 h-8 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: selectedColorData.hex }}
              />
              <div>
                <div className="font-medium text-sm">{selectedColorData.name}</div>
                <div className="text-xs text-gray-500">ID: {selectedColorData.id}</div>
              </div>
              {selectedColorData.isHC && (
                <Crown className="w-4 h-4 text-yellow-500" />
              )}
            </div>
          )}

          {/* Grid de Cores */}
          <div className="grid grid-cols-6 gap-2">
            {colorsToShow.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                size="sm"
                className={`
                  w-12 h-12 p-0 border-2 rounded-lg transition-all duration-200 relative
                  ${selectedColor === color.id 
                    ? 'border-blue-500 ring-2 ring-blue-300 scale-105' 
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorSelect(color.id)}
                title={`${color.name} ${color.isHC ? '(HC Premium)' : ''}`}
              >
                {/* Indicador HC */}
                {color.isHC && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                    HC
                  </div>
                )}
                
                {/* Indicador de Selecionado */}
                {selectedColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </Button>
            ))}
          </div>

          {/* Estatísticas da Paleta */}
          <div className="text-xs text-gray-500 space-y-1 border-t pt-2">
            <div className="flex justify-between">
              <span>Total de cores:</span>
              <Badge variant="secondary">{colorsToShow.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Cores HC Premium:</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {colorsToShow.filter(c => c.isHC).length}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Cores Gratuitas:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {colorsToShow.filter(c => !c.isHC).length}
              </Badge>
            </div>
          </div>

          {/* Info sobre as Paletas */}
          <div className="text-xs text-gray-500 p-2 bg-blue-50 rounded">
            <div className="font-medium mb-1">💡 Sistema de Paletas Habbo:</div>
            <div>• <strong>Paleta 1</strong>: Tons de pele (categoria HD)</div>
            <div>• <strong>Paleta 2</strong>: Cores de cabelo (categoria HR)</div>
            <div>• <strong>Paleta 3</strong>: Roupas e acessórios (demais)</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OfficialHabboColorSelector;
