
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Crown } from 'lucide-react';

interface OfficialHabboColorPaletteProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
}

// Cores oficiais baseadas no código do KiHabbo
const OFFICIAL_HABBO_COLORS = [
  // Tons de pele básicos
  { id: '1', hex: '#F5DA88', name: 'Pele Clara', category: 'skin' },
  { id: '2', hex: '#FFDBC1', name: 'Pele Média', category: 'skin' },
  { id: '3', hex: '#FFCB98', name: 'Pele Morena', category: 'skin' },
  { id: '4', hex: '#F4AC54', name: 'Pele Escura', category: 'skin' },
  { id: '5', hex: '#FF987F', name: 'Pele Muito Escura', category: 'skin' },
  
  // Cores básicas
  { id: '28', hex: '#F1E5DA', name: 'Bege', category: 'basic', hc: true },
  { id: '1352', hex: '#644628', name: 'Marrom Escuro', category: 'basic' },
  { id: '1423', hex: '#926338', name: 'Marrom Médio', category: 'basic' },
  { id: '1413', hex: '#A97C44', name: 'Marrom Claro', category: 'basic' },
  { id: '1364', hex: '#B3957F', name: 'Bege Escuro', category: 'basic' },
  { id: '1408', hex: '#BD9562', name: 'Dourado', category: 'basic' },
  { id: '106', hex: '#C2A896', name: 'Rosa Suave', category: 'hc', hc: true },
  { id: '99', hex: '#CA9072', name: 'Salmão', category: 'basic' },
  { id: '98', hex: '#CBBC90', name: 'Amarelo Pálido', category: 'basic' },
  
  // Cores HC Premium (com overlay)
  { id: '61', hex: '#FFB366', name: 'HC Laranja', category: 'hc', hc: true },
  { id: '92', hex: '#FF6B6B', name: 'HC Coral', category: 'hc', hc: true },
  { id: '100', hex: '#4ECDC4', name: 'HC Turquesa', category: 'hc', hc: true },
  { id: '101', hex: '#45B7D1', name: 'HC Azul Céu', category: 'hc', hc: true },
  { id: '102', hex: '#96CEB4', name: 'HC Verde Menta', category: 'hc', hc: true },
  { id: '104', hex: '#FFEAA7', name: 'HC Amarelo Suave', category: 'hc', hc: true },
  { id: '105', hex: '#DDA0DD', name: 'HC Lilás', category: 'hc', hc: true },
  { id: '143', hex: '#A8E6CF', name: 'HC Verde Pastel', category: 'hc', hc: true },
];

const OfficialHabboColorPalette = ({ selectedColor, onColorSelect }: OfficialHabboColorPaletteProps) => {
  const skinColors = OFFICIAL_HABBO_COLORS.filter(c => c.category === 'skin');
  const basicColors = OFFICIAL_HABBO_COLORS.filter(c => c.category === 'basic');
  const hcColors = OFFICIAL_HABBO_COLORS.filter(c => c.category === 'hc');

  const ColorSection = ({ colors, title, icon }: { colors: typeof skinColors, title: string, icon?: React.ReactNode }) => {
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
              className={`w-8 h-8 p-0 border-2 transition-all duration-200 relative ${
                selectedColor === color.id 
                  ? 'border-blue-500 ring-2 ring-blue-300 scale-110 shadow-lg' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ 
                backgroundColor: color.hex,
                backgroundImage: color.hc ? "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVBiVY/z//z8DJQAggJiYmJgoAYAAYqJUHUAAAcREqTqAAGKiVB1AADFRqg4ggJgoVQcQQEyUqgMIICZK1QEEEBO16gACiIladQABxESjOoAAYqJRHUAAMdGoDiCAmGhUBxBATDSqAwggJhrVAQQQE43qAAKIiUZ1AAHERGkdQAAxUVoHEEBMlNYBBBATpXUAAcREaR1AADFRWgcQQEyU1gEEEBOldQABxERpHUAAMVFaBxBATJTWAQQQE6V1AAHERGkdQAAxUVoHEEBMlNYBBBATpXUAAcREaR1AADFRWgcQQEyU1gEEEBOldQABxERpHUAAMVFaBxBATJTWAQQQE6V1AAHERGkdQAAxUVoHEEBMlNYBBBATpXUAAcREaR1AADFRWgcQQEyU1gEEEBOldQABxERpHUAAMVFaBxBATJTWAQQYADVZBwMqoOJMAAAAAElFTkSuQmCC')" : undefined,
                backgroundSize: color.hc ? '10px 10px' : undefined
              }}
              onClick={() => onColorSelect(color.id)}
              title={`${color.name} (#${color.hex}) ${color.hc ? '- HC' : ''}`}
            >
              {/* Badge HC pequena no canto */}
              {color.hc && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">H</span>
                </div>
              )}
            </Button>
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
          Cores Oficiais Habbo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ColorSection 
          colors={skinColors} 
          title="Tons de Pele" 
        />
        
        <ColorSection 
          colors={basicColors} 
          title="Cores Básicas" 
        />
        
        <ColorSection 
          colors={hcColors} 
          title="Habbo Club" 
          icon={<Crown className="w-4 h-4 text-yellow-600" />}
        />

        <div className="text-center pt-2 border-t">
          <p className="text-xs text-gray-600">
            Cor selecionada: <span className="font-semibold">
              {OFFICIAL_HABBO_COLORS.find(c => c.id === selectedColor)?.name || 'Padrão'}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficialHabboColorPalette;
