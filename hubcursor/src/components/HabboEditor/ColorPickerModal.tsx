
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';
import { getOfficialColorPalette } from '@/utils/partPreview';

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
  const colors = getOfficialColorPalette(category);
  
  const handleColorClick = (colorId: string) => {
    onColorSelect(colorId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            🎨 Escolher Cor
            <Badge variant="outline" className="text-xs">
              {itemName}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Cores Disponíveis */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-6 gap-2">
              {colors.map((color) => (
                <Button
                  key={color.id}
                  variant="outline"
                  size="sm"
                  className={`w-12 h-12 p-0 border-2 transition-all duration-200 rounded-full ${
                    selectedColor === color.id 
                      ? 'border-blue-500 ring-2 ring-blue-300 scale-110' 
                      : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleColorClick(color.id)}
                  title={`${color.name} (${color.id})`}
                />
              ))}
            </div>
          </div>

          {/* Informação sobre cores HC (se aplicável) */}
          {category !== 'hd' && (
            <div className="text-center text-xs text-gray-600 bg-yellow-50 p-2 rounded">
              <Crown className="w-4 h-4 inline mr-1" />
              Algumas cores podem ser exclusivas do Habbo Club
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
