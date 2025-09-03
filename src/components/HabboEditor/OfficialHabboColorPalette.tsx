import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Palette } from 'lucide-react';
import { OFFICIAL_HABBO_PALETTES, getCategoryPalette } from '@/lib/enhancedCategoryMapperV2';

interface OfficialHabboColorPaletteProps {
  selectedCategory: string;
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  availableColors?: string[];
  showPaletteInfo?: boolean;
}

export const OfficialHabboColorPalette = ({
  selectedCategory,
  selectedColor,
  onColorSelect,
  availableColors = [],
  showPaletteInfo = true
}: OfficialHabboColorPaletteProps) => {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  // Obter paleta oficial correta para a categoria
  const palette = getCategoryPalette(selectedCategory);
  
  // Filtrar cores disponíveis se especificado
  const colorsToShow = availableColors.length > 0
    ? palette.colors.filter(color => availableColors.includes(color.id))
    : palette.colors;

  const handleColorSelect = (colorId: string) => {
    onColorSelect(colorId);
  };

  const getPaletteInfo = () => {
    switch (selectedCategory) {
      case 'hd':
      case 'sk':
        return {
          name: 'Paleta 1 - Tons de Pele',
          description: 'Cores oficiais Habbo para pele',
          icon: '🤏',
          type: 'skin'
        };
      case 'hr':
        return {
          name: 'Paleta 2 - Cores de Cabelo',
          description: 'Cores oficiais Habbo para cabelo',
          icon: '💇',
          type: 'hair'
        };
      default:
        return {
          name: 'Paleta 3 - Cores de Roupas',
          description: 'Cores oficiais Habbo para roupas e acessórios',
          icon: '👕',
          type: 'clothing'
        };
    }
  };

  const paletteInfo = getPaletteInfo();
  const selectedColorData = palette.colors.find(c => c.id === selectedColor);

  return (
    <Card className="w-full">
      {showPaletteInfo && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="text-lg">{paletteInfo.icon}</span>
            <div>
              <div className="font-bold">{paletteInfo.name}</div>
              <div className="text-xs text-muted-foreground">{paletteInfo.description}</div>
            </div>
            <Palette className="w-4 h-4 ml-auto" />
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent className="space-y-4">
        {/* Cor Selecionada */}
        {selectedColorData && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div 
              className="w-10 h-10 rounded-lg border-2 border-border shadow-sm"
              style={{ backgroundColor: selectedColorData.hex }}
            />
            <div className="flex-1">
              <div className="font-medium">{selectedColorData.name}</div>
              <div className="text-sm text-muted-foreground">
                ID: {selectedColorData.id} • {selectedColorData.hex}
              </div>
            </div>
            {selectedColorData.isHC && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Crown className="w-3 h-3 mr-1" />
                HC
              </Badge>
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
                w-full h-12 p-0 border-2 rounded-lg transition-all duration-200 relative
                ${selectedColor === color.id 
                  ? 'border-primary ring-2 ring-primary/30 scale-105 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:scale-105'
                }
                ${hoveredColor === color.id ? 'z-10' : ''}
              `}
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorSelect(color.id)}
              onMouseEnter={() => setHoveredColor(color.id)}
              onMouseLeave={() => setHoveredColor(null)}
              title={`${color.name} ${color.isHC ? '(HC Premium)' : ''}`}
            >
              {/* Indicador HC */}
              {color.isHC && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold shadow-sm">
                  HC
                </div>
              )}
              
              {/* Indicador de Selecionado */}
              {selectedColor === color.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Tooltip ao hover */}
              {hoveredColor === color.id && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20">
                  {color.name}
                </div>
              )}
            </Button>
          ))}
        </div>

        {/* Estatísticas da Paleta */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted rounded">
            <div className="text-lg font-bold">{colorsToShow.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <div className="text-lg font-bold text-yellow-700">
              {colorsToShow.filter(c => c.isHC).length}
            </div>
            <div className="text-xs text-yellow-600">HC Premium</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="text-lg font-bold text-green-700">
              {colorsToShow.filter(c => !c.isHC).length}
            </div>
            <div className="text-xs text-green-600">Gratuitas</div>
          </div>
        </div>

        {/* Info sobre as Paletas */}
        {showPaletteInfo && (
          <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded border border-blue-200">
            <div className="font-medium mb-2 text-blue-900">💡 Sistema de Paletas Habbo Oficial:</div>
            <div className="space-y-1">
              <div>• <strong>Paleta 1</strong>: Tons de pele (categoria HD/SK)</div>
              <div>• <strong>Paleta 2</strong>: Cores de cabelo (categoria HR)</div>
              <div>• <strong>Paleta 3</strong>: Roupas e acessórios (demais)</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OfficialHabboColorPalette;