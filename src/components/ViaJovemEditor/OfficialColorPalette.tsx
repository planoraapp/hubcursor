
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Crown } from 'lucide-react';

interface OfficialColorPaletteProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  availableColors?: string[];
}

// Cores oficiais do Habbo baseadas nos dados reais
const officialColors = [
  // Cores básicas (tons de pele e básicas)
  { id: '1', hex: '#FFDBAC', name: 'Pele Clara', category: 'basic' },
  { id: '2', hex: '#F5C2A5', name: 'Pele Média', category: 'basic' },
  { id: '3', hex: '#E8A775', name: 'Pele Morena', category: 'basic' },
  { id: '4', hex: '#D4965A', name: 'Pele Escura', category: 'basic' },
  { id: '5', hex: '#BB7748', name: 'Pele Muito Escura', category: 'basic' },
  { id: '7', hex: '#8B4513', name: 'Marrom', category: 'basic' },
  { id: '8', hex: '#000000', name: 'Preto', category: 'basic' },
  { id: '9', hex: '#FFFFFF', name: 'Branco', category: 'basic' },
  { id: '10', hex: '#FF0000', name: 'Vermelho', category: 'basic' },
  { id: '11', hex: '#00FF00', name: 'Verde Limão', category: 'basic' },
  { id: '12', hex: '#0000FF', name: 'Azul', category: 'basic' },
  { id: '13', hex: '#FFFF00', name: 'Amarelo', category: 'basic' },
  { id: '14', hex: '#FF00FF', name: 'Magenta', category: 'basic' },
  { id: '15', hex: '#00FFFF', name: 'Ciano', category: 'basic' },

  // Cores HC Premium
  { id: '61', hex: '#FFB366', name: 'HC Laranja', category: 'hc' },
  { id: '92', hex: '#FF6B6B', name: 'HC Coral', category: 'hc' },
  { id: '100', hex: '#4ECDC4', name: 'HC Turquesa', category: 'hc' },
  { id: '101', hex: '#45B7D1', name: 'HC Azul Céu', category: 'hc' },
  { id: '102', hex: '#96CEB4', name: 'HC Verde Menta', category: 'hc' },
  { id: '104', hex: '#FFEAA7', name: 'HC Amarelo Suave', category: 'hc' },
  { id: '105', hex: '#DDA0DD', name: 'HC Lilás', category: 'hc' },
  { id: '106', hex: '#F8BBD0', name: 'HC Rosa Suave', category: 'hc' },
  { id: '143', hex: '#A8E6CF', name: 'HC Verde Pastel', category: 'hc' },

  // Cores especiais/raras
  { id: '120', hex: '#FFD700', name: 'Dourado', category: 'special' },
  { id: '121', hex: '#C0C0C0', name: 'Prateado', category: 'special' },
  { id: '122', hex: '#CD7F32', name: 'Bronze', category: 'special' },
];

const OfficialColorPalette = ({ selectedColor, onColorSelect, availableColors }: OfficialColorPaletteProps) => {
  // Filter colors if specific colors are available for the item
  const displayColors = availableColors && availableColors.length > 0
    ? officialColors.filter(color => availableColors.includes(color.id))
    : officialColors;

  const basicColors = displayColors.filter(color => color.category === 'basic');
  const hcColors = displayColors.filter(color => color.category === 'hc');
  const specialColors = displayColors.filter(color => color.category === 'special');

  const ColorSection = ({ colors, title, icon }: { colors: typeof basicColors, title: string, icon?: React.ReactNode }) => {
    if (colors.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h4 className="text-sm font-medium text-gray-700">{title}</h4>
          <Badge variant="outline" className="text-xs">{colors.length}</Badge>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {colors.map((color) => (
            <Button
              key={color.id}
              variant="outline"
              size="sm"
              className={`w-8 h-8 p-0 border-2 transition-all duration-200 ${
                selectedColor === color.id 
                  ? 'border-amber-500 ring-2 ring-amber-300 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: color.hex }}
              onClick={() => onColorSelect(color.id)}
              title={`${color.name} (#${color.hex})`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="w-5 h-5" />
          Paleta Oficial Habbo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ColorSection 
          colors={basicColors} 
          title="Cores Básicas" 
        />
        
        <ColorSection 
          colors={hcColors} 
          title="Habbo Club" 
          icon={<Crown className="w-4 h-4 text-yellow-600" />}
        />
        
        <ColorSection 
          colors={specialColors} 
          title="Cores Especiais" 
          icon={<span className="text-yellow-500">⭐</span>}
        />

        {/* Color info */}
        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-600">
            Cor selecionada: <span className="font-semibold">
              {displayColors.find(c => c.id === selectedColor)?.name || 'Nenhuma'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficialColorPalette;
