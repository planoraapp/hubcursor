import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CloseButton } from '@/components/ui/close-button';

interface EnhancedColorPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onColorSelect: (colorId: string) => void;
  item: any;
  selectedColor?: string;
  colorPalettes?: Record<string, any>;
}

export const EnhancedColorPickerModal: React.FC<EnhancedColorPickerModalProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  item,
  selectedColor,
  colorPalettes = {}
}) => {
  if (!item) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg">Cores Disponíveis</DialogTitle>
            <DialogDescription className="text-sm">
              {item.name} - {item.colors?.length || 0} cores
            </DialogDescription>
          </div>
          <CloseButton onClick={onClose} />
        </DialogHeader>

        <div className="grid grid-cols-6 gap-2">
          {item.colors?.map((colorId: string) => (
            <button
              key={colorId}
              onClick={() => onColorSelect(colorId)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                selectedColor === colorId
                  ? 'border-blue-500 ring-2 ring-blue-300 scale-105'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: `#${colorId}` }}
              title={`Cor ${colorId}`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
