
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerPopoverProps {
  item: any;
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  children: React.ReactNode;
}

const DEFAULT_COLORS = [
  { id: '1', hex: '#FFFFFF', name: 'Branco' },
  { id: '2', hex: '#000000', name: 'Preto' },
  { id: '3', hex: '#FF0000', name: 'Vermelho' },
  { id: '4', hex: '#00FF00', name: 'Verde' },
  { id: '5', hex: '#0000FF', name: 'Azul' },
  { id: '61', hex: '#FFFF00', name: 'Amarelo' },
  { id: '92', hex: '#FF00FF', name: 'Rosa' },
  { id: '100', hex: '#00FFFF', name: 'Ciano' }
];

export const ColorPickerPopover = ({
  item,
  selectedColor,
  onColorSelect,
  children
}: ColorPickerPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!item || !item.colors || item.colors.length <= 1) {
    return <>{children}</>;
  }

  const availableColors = item.colors.length > 0 
    ? DEFAULT_COLORS.filter(color => item.colors.includes(color.id))
    : DEFAULT_COLORS.slice(0, 5);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-48 p-3" 
        align="center"
        side="top"
        sideOffset={5}
      >
        <div className="space-y-2">
          <div className="text-xs font-medium text-center flex items-center justify-center gap-1">
            <Palette className="w-3 h-3" />
            Cores Disponíveis
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {availableColors.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                size="sm"
                className={`w-8 h-8 p-0 rounded border-2 transition-all ${
                  selectedColor === color.id 
                    ? 'border-blue-500 ring-1 ring-blue-300 scale-110' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  onColorSelect(color.id);
                  setIsOpen(false);
                }}
                title={color.name}
              >
                {selectedColor === color.id && (
                  <div className="w-2 h-2 rounded-full bg-white/90 border border-black/20" />
                )}
              </Button>
            ))}
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            {availableColors.length} cores
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
