
import React from 'react';
import { X } from 'lucide-react';
import { HabboPalette } from '@/data/habboTemplariosData';

interface TemplariosColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: HabboPalette;
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  categoryName: string;
}

const TemplariosColorModal: React.FC<TemplariosColorModalProps> = ({
  isOpen,
  onClose,
  palette,
  selectedColor,
  onColorSelect,
  categoryName
}) => {
  if (!isOpen) return null;

  const selectableColors = Object.entries(palette).filter(([_, color]) => color.selectable === 1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cores - {categoryName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-6 gap-2">
          {selectableColors.map(([colorId, color]) => (
            <button
              key={colorId}
              onClick={() => onColorSelect(colorId)}
              className={`w-12 h-12 rounded border-2 transition-all ${
                selectedColor === colorId 
                  ? 'border-blue-500 ring-2 ring-blue-300' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ backgroundColor: `#${color.hex}` }}
              title={`Cor ${colorId} - #${color.hex}${color.club === 2 ? ' (HC)' : ''}`}
            >
              {color.club === 2 && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full border border-yellow-600" />
                </div>
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplariosColorModal;
