
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';

interface ColorPickerPopoverProps {
  colors: string[];
  selectedColor?: string;
  onColorSelect: (color: string) => void;
  itemName: string;
}

const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  itemName
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-black hover:bg-gray-100 p-1"
          title={`Cores para ${itemName}`}
        >
          <Palette className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="center">
        <div className="text-xs font-bold mb-2 text-center">Cores - {itemName}</div>
        <div className="grid grid-cols-6 gap-1">
          {colors.map((color, index) => (
            <Button
              key={index}
              onClick={() => {
                onColorSelect(color);
                setIsOpen(false);
              }}
              className={`w-6 h-6 p-0 border rounded ${
                selectedColor === color ? 'border-blue-500 border-2' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
              title={`Cor ${index + 1}`}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ColorPickerPopover;
