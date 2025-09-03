
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface HabboColor {
  id: string;
  hex: string;
  name: string;
  isHC: boolean;
}

interface HabboColorPickerProps {
  availableColors: string[];
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  categoryId: string;
  children: React.ReactNode;
}

// Cores oficiais do Habbo organizadas por categoria
const OFFICIAL_HABBO_COLORS: Record<string, HabboColor[]> = {
  default: [
    { id: '1', hex: '#FFFFFF', name: 'Branco', isHC: false },
    { id: '2', hex: '#000000', name: 'Preto', isHC: false },
    { id: '3', hex: '#C0C0C0', name: 'Cinza Claro', isHC: false },
    { id: '4', hex: '#808080', name: 'Cinza', isHC: false },
    { id: '5', hex: '#FFC0CB', name: 'Rosa Claro', isHC: false },
    { id: '26', hex: '#DC143C', name: 'Vermelho', isHC: false },
    { id: '31', hex: '#32CD32', name: 'Verde Lima', isHC: false },
    { id: '45', hex: '#8B4513', name: 'Marrom', isHC: false },
    { id: '61', hex: '#4169E1', name: 'Azul Royal', isHC: false },
    { id: '92', hex: '#FFD700', name: 'Dourado', isHC: true },
    { id: '100', hex: '#FF69B4', name: 'Rosa Choque', isHC: true },
    { id: '104', hex: '#8B0000', name: 'Vermelho Escuro', isHC: true }
  ],
  hd: [
    { id: '1', hex: '#F5DEB3', name: 'Pele Clara', isHC: false },
    { id: '2', hex: '#DEB887', name: 'Pele Média', isHC: false },
    { id: '3', hex: '#D2B48C', name: 'Pele Morena', isHC: false },
    { id: '4', hex: '#CD853F', name: 'Pele Escura', isHC: false }
  ],
  hr: [
    { id: '1', hex: '#FFE4B5', name: 'Loiro Claro', isHC: false },
    { id: '2', hex: '#DEB887', name: 'Loiro', isHC: false },
    { id: '45', hex: '#8B4513', name: 'Castanho', isHC: false },
    { id: '61', hex: '#4169E1', name: 'Azul', isHC: true },
    { id: '92', hex: '#FFD700', name: 'Dourado', isHC: true },
    { id: '104', hex: '#8B0000', name: 'Vermelho', isHC: true }
  ]
};

const HabboColorPicker = ({ 
  availableColors, 
  selectedColor, 
  onColorSelect, 
  categoryId,
  children 
}: HabboColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getColorsForCategory = () => {
    const categoryColors = OFFICIAL_HABBO_COLORS[categoryId] || OFFICIAL_HABBO_COLORS.default;
    
    // Filtrar apenas as cores disponíveis para este item
    if (availableColors.length > 0) {
      return categoryColors.filter(color => availableColors.includes(color.id));
    }
    
    return categoryColors;
  };

  const colors = getColorsForCategory();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div onClick={() => setIsOpen(true)}>
          {children}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" side="right" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-medium">
            <Palette className="w-4 h-4" />
            Cores Disponíveis
          </div>
          
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <Button
                key={color.id}
                variant="outline"
                size="sm"
                className={`
                  w-12 h-12 p-0 border-2 rounded-lg transition-all duration-200 relative
                  ${selectedColor === color.id 
                    ? 'border-blue-500 ring-2 ring-blue-300 scale-110' 
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color.hex }}
                onClick={() => {
                  onColorSelect(color.id);
                  setIsOpen(false);
                }}
                title={`${color.name} ${color.isHC ? '(HC)' : ''}`}
              >
                {color.isHC && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
                    HC
                  </div>
                )}
                {selectedColor === color.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </Button>
            ))}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div>Total: {colors.length} cores</div>
            <div>HC: {colors.filter(c => c.isHC).length} • FREE: {colors.filter(c => !c.isHC).length}</div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default HabboColorPicker;
