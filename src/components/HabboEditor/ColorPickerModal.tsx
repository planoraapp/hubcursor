
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { getCategoryPalette } from '@/lib/enhancedCategoryMapperV2';

interface ColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (colorId: string) => void;
  category: string;
  itemName: string;
  selectedColor?: string;
}

export const ColorPickerModal = ({
  isOpen,
  onClose,
  onColorSelect,
  category,
  itemName,
  selectedColor = '1'
}: ColorPickerModalProps) => {
  const palette = getCategoryPalette(category);
  
  const handleColorClick = (colorId: string) => {
    onColorSelect(colorId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Escolher Cor - {itemName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Single Tone Colors */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-8 gap-2">
              {palette.colors.filter(c => !c.isHC).map((color) => (
                <Button
                  key={color.id}
                  variant="outline"
                  size="sm"
                  className={`w-8 h-8 p-0 border-2 transition-all duration-200 ${
                    selectedColor === color.id 
                      ? 'border-blue-500 ring-2 ring-blue-300 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorClick(color.id)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* HC Colors */}
          {palette.colors.some(c => c.isHC) && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Habbo Club</span>
                <Badge variant="outline" className="text-xs">Premium</Badge>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {palette.colors.filter(c => c.isHC).map((color) => (
                  <Button
                    key={color.id}
                    variant="outline"
                    size="sm"
                    className={`w-8 h-8 p-0 border-2 transition-all duration-200 relative ${
                      selectedColor === color.id 
                        ? 'border-blue-500 ring-2 ring-blue-300 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    onClick={() => handleColorClick(color.id)}
                    title={`${color.name} - HC`}
                  >
                    {/* HC badge */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-black">H</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
