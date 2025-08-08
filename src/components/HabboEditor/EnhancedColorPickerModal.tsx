
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { ColorPalettes } from '@/hooks/useFigureDataOfficial';

interface EnhancedColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (colorId: string) => void;
  item: any;
  selectedColor?: string;
  colorPalettes: ColorPalettes;
}

export const EnhancedColorPickerModal = ({
  isOpen,
  onClose,
  onColorSelect,
  item,
  selectedColor = '1',
  colorPalettes
}: EnhancedColorPickerModalProps) => {
  
  const handleColorClick = (colorId: string) => {
    onColorSelect(colorId);
    onClose();
  };

  // Get colors for this specific item with null safety
  const getItemColors = () => {
    // Safety check: if item is null or undefined, return default colors
    if (!item) {
      console.log(`🎨 [ColorModal] No item provided, using default colors`);
      return getDefaultColors();
    }
    
    // If item has a palette ID and we have that palette
    if (item.paletteId && colorPalettes && colorPalettes[item.paletteId]) {
      console.log(`🎨 [ColorModal] Using palette ${item.paletteId} for ${item.name || 'unknown item'}`);
      return colorPalettes[item.paletteId];
    }
    
    // If item has specific colors defined
    if (item.colors && Array.isArray(item.colors) && item.colors.length > 0) {
      console.log(`🎨 [ColorModal] Using item colors for ${item.name || 'unknown item'}:`, item.colors);
      return item.colors.map((colorId: string) => ({
        id: colorId,
        hex: getDefaultColorHex(colorId)
      }));
    }
    
    // Default colors
    console.log(`🎨 [ColorModal] Using default colors for ${item.name || 'unknown item'}`);
    return getDefaultColors();
  };

  const getDefaultColorHex = (colorId: string) => {
    const defaultColors: Record<string, string> = {
      '1': '#FFDBAC', '2': '#F5C2A5', '3': '#E8A775', '4': '#D4965A', '5': '#BB7748',
      '7': '#8B4513', '8': '#000000', '9': '#FFFFFF', '10': '#FF0000', '11': '#00FF00',
      '12': '#0000FF', '13': '#FFFF00', '14': '#FF00FF', '15': '#00FFFF', '61': '#FFB366',
      '92': '#FF6B6B', '100': '#4ECDC4', '101': '#45B7D1', '102': '#96CEB4'
    };
    return defaultColors[colorId] || '#CCCCCC';
  };

  const getDefaultColors = () => {
    return [
      { id: '1', hex: '#FFDBAC' }, { id: '2', hex: '#F5C2A5' }, { id: '3', hex: '#E8A775' },
      { id: '4', hex: '#D4965A' }, { id: '5', hex: '#BB7748' }, { id: '7', hex: '#8B4513' },
      { id: '8', hex: '#000000' }, { id: '9', hex: '#FFFFFF' }, { id: '10', hex: '#FF0000' },
      { id: '11', hex: '#00FF00' }, { id: '12', hex: '#0000FF' }, { id: '13', hex: '#FFFF00' },
      { id: '61', hex: '#FFB366' }, { id: '92', hex: '#FF6B6B' }, { id: '100', hex: '#4ECDC4' }
    ];
  };

  const itemColors = getItemColors();
  const isHC = item?.club === 'HC';
  const itemName = item?.name || 'Item';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            🎨 Escolher Cor
            <Badge variant="outline" className="text-xs">
              {itemName}
            </Badge>
            {isHC && (
              <Badge className="bg-yellow-500 text-black text-xs">
                <Crown className="w-3 h-3 mr-1" />
                HC
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-8 gap-2">
              {itemColors.map((color) => (
                <Button
                  key={color.id}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 border-2 transition-all duration-200 rounded-full ${
                    selectedColor === color.id 
                      ? 'border-blue-500 ring-2 ring-blue-300 scale-110' 
                      : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorClick(color.id)}
                  title={`Cor ${color.id} (${color.hex})`}
                />
              ))}
            </div>
          </div>

          <div className="text-center text-xs text-gray-600">
            <p>
              Cores disponíveis: <span className="font-semibold">{itemColors.length}</span>
            </p>
            {item?.paletteId && (
              <p className="text-blue-600">
                Paleta oficial: {item.paletteId}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
