import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, User } from 'lucide-react';
import { OFFICIAL_HABBO_PALETTES } from '@/lib/enhancedCategoryMapperV2';

interface SkinColorSelectorProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  selectedGender: 'M' | 'F';
  className?: string;
}

export const SkinColorSelector = ({
  selectedColor,
  onColorSelect,
  selectedGender,
  className = ''
}: SkinColorSelectorProps) => {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const skinPalette = OFFICIAL_HABBO_PALETTES.skin;

  const generatePreviewUrl = (colorId: string) => {
    // Preview isolado apenas do rosto com diferentes tons
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-${colorId}&gender=${selectedGender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  };

  const handleColorSelect = (colorId: string) => {
    onColorSelect(colorId);
  };

  const selectedColorData = skinPalette.colors.find(c => c.id === selectedColor);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <div>
            <div className="font-bold">Cor de Pele</div>
            <div className="text-xs text-muted-foreground">Tons oficiais Habbo</div>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {skinPalette.colors.length} opções
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cor Selecionada com Preview */}
        {selectedColorData && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="w-12 h-12 border-2 border-border rounded-lg overflow-hidden">
              <img
                src={generatePreviewUrl(selectedColorData.id)}
                alt={selectedColorData.name}
                className="w-full h-full object-cover pixelated"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.backgroundColor = selectedColorData.hex;
                }}
              />
            </div>
            <div className="flex-1">
              <div className="font-medium">{selectedColorData.name}</div>
              <div className="text-sm text-muted-foreground">
                ID: {selectedColorData.id} • {selectedColorData.hex}
              </div>
            </div>
            <div 
              className="w-6 h-6 rounded-full border-2 border-border"
              style={{ backgroundColor: selectedColorData.hex }}
            />
          </div>
        )}

        {/* Grid de Tons de Pele */}
        <div className="grid grid-cols-4 gap-3">
          {skinPalette.colors.map((color) => (
            <Button
              key={color.id}
              variant="outline"
              className={`
                h-16 p-2 border-2 rounded-lg transition-all duration-200 relative flex flex-col items-center justify-center
                ${selectedColor === color.id 
                  ? 'border-primary ring-2 ring-primary/30 scale-105 shadow-md' 
                  : 'border-border hover:border-primary/50 hover:scale-105'
                }
              `}
              onClick={() => handleColorSelect(color.id)}
              onMouseEnter={() => setHoveredColor(color.id)}
              onMouseLeave={() => setHoveredColor(null)}
              title={color.name}
            >
              {/* Preview da Face */}
              <div className="w-8 h-8 border border-border rounded overflow-hidden mb-1">
                <img
                  src={generatePreviewUrl(color.id)}
                  alt={color.name}
                  className="w-full h-full object-cover pixelated"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    img.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div 
                  className="w-full h-full hidden"
                  style={{ backgroundColor: color.hex }}
                />
              </div>
              
              {/* Nome da Cor */}
              <div className="text-xs font-medium text-center leading-tight">
                {color.name.split(' ')[0]}
              </div>

              {/* Indicador de Selecionado */}
              {selectedColor === color.id && (
                <div className="absolute top-1 right-1">
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Info sobre a Paleta */}
        <div className="text-xs text-muted-foreground p-3 bg-orange-50 rounded border border-orange-200">
          <div className="font-medium mb-1 text-orange-900">🤏 Paleta de Tons de Pele:</div>
          <div>Esta categoria altera apenas a cor da sua pele, mantendo todos os outros itens do avatar.</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkinColorSelector;