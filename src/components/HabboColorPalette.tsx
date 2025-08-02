
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { HABBO_COLORS, getBasicColors, getHCColors, type HabboColor } from '@/data/habboColors';

interface HabboColorPaletteProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  availableColors?: string[];
  compact?: boolean;
}

const HabboColorPalette = ({ 
  selectedColor, 
  onColorSelect, 
  availableColors,
  compact = false 
}: HabboColorPaletteProps) => {
  const basicColors = getBasicColors();
  const hcColors = getHCColors();
  
  // Filtrar por cores disponíveis se especificado
  const filterColors = (colors: HabboColor[]) => {
    if (!availableColors || availableColors.length === 0) return colors;
    return colors.filter(color => availableColors.includes(color.id));
  };

  const filteredBasicColors = filterColors(basicColors);
  const filteredHCColors = filterColors(hcColors);

  const ColorButton = ({ color }: { color: HabboColor }) => (
    <Button
      variant="outline"
      size="sm"
      className={`w-8 h-8 p-0 border-2 transition-all duration-200 relative group ${
        selectedColor === color.id 
          ? 'border-blue-500 ring-2 ring-blue-300 scale-110 shadow-lg z-10' 
          : 'border-gray-300 hover:border-gray-400 hover:scale-105'
      }`}
      style={{ 
        backgroundColor: `#${color.hex}`,
        backgroundImage: color.isHC ? "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFYSURBVBiVY/z//z8DJQAggJiYmJgoAYAAYqJUHUAAAcREqTqAAGKiVB1AADFRqg4ggJgoVQcQQEyUqgMIICZK1QEEEBO16gACiIladQABxESjOoAAYqJRHUAAMdGoDiCAmGhUBxBATDSqAwggJhrVAQQQE43qAAKIiUZ1AAHERGkdQAAxUVoHEEBMlNYBBBATpXUAAcREaR1AADFRWgcQQEyU1gEEEBOldQABxERpHUAAMVFaBxBATJTWAQQQE6V1AAHERGkdQAAxUVoHEEBMlNYBBBATpXUAAcREaR1AADFRWgcQQEyU1gEEEBOldQABxERpHUAAMVFaBxBATJTWAQQQE6V1AAHERGkdQAAxUVoHEEBMlNYBBBATpXUAAcREaR1AADFRWgcQQEyU1gEEEBOldQABxERpHUAAMVFaBxBATJTWAQQYADVZBwMqoOJMAAAAAElFTkSuQmCC')" : undefined,
        backgroundSize: color.isHC ? '10px 10px' : undefined
      }}
      onClick={() => onColorSelect(color.id)}
      title={`${color.name || `Cor ${color.id}`} (#${color.hex})${color.isHC ? ' - HC' : ''}`}
    >
      {/* Badge HC no canto */}
      {color.isHC && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-[8px] font-bold text-black">H</span>
        </div>
      )}
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
        {color.name || `Cor ${color.id}`}
        {color.isHC && ' (HC)'}
      </div>
    </Button>
  );

  if (compact) {
    // Modo compacto - apenas cores selecionadas
    const allColors = [...filteredBasicColors, ...filteredHCColors];
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-8 gap-1">
          {allColors.slice(0, 32).map((color) => (
            <ColorButton key={color.id} color={color} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cores Básicas */}
      {filteredBasicColors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-medium text-gray-700">Cores Básicas</h4>
            <Badge variant="outline" className="text-xs">{filteredBasicColors.length}</Badge>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {filteredBasicColors.map((color) => (
              <ColorButton key={color.id} color={color} />
            ))}
          </div>
        </div>
      )}

      {/* Cores HC */}
      {filteredHCColors.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-yellow-600" />
            <h4 className="text-sm font-medium text-gray-700">Habbo Club</h4>
            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
              {filteredHCColors.length}
            </Badge>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {filteredHCColors.map((color) => (
              <ColorButton key={color.id} color={color} />
            ))}
          </div>
        </div>
      )}

      {/* Cor selecionada */}
      <div className="text-center pt-2 border-t">
        <p className="text-xs text-gray-600">
          Cor selecionada: <span className="font-semibold">
            {HABBO_COLORS.find(c => c.id === selectedColor)?.name || `Cor ${selectedColor}`}
          </span>
          {HABBO_COLORS.find(c => c.id === selectedColor)?.isHC && (
            <Badge className="ml-1 bg-yellow-500 text-black text-xs">HC</Badge>
          )}
        </p>
      </div>
    </div>
  );
};

export default HabboColorPalette;
