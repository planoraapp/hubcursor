// src/components/HabboHub/DuotoneColorPalette.tsx
// Componente para seleção de duas cores em roupas duotone

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface DuotoneColorPaletteProps {
  primaryColors: string[];
  secondaryColors: string[];
  selectedPrimaryColor: string;
  selectedSecondaryColor: string;
  onPrimaryColorSelect: (colorId: string) => void;
  onSecondaryColorSelect: (colorId: string) => void;
  className?: string;
}

// Mapa de cores para exibição
const COLOR_MAP: Record<string, { hex: string; name: string }> = {
  '1': { hex: '#DDDDDD', name: 'Cinza Claro' },
  '2': { hex: '#96743D', name: 'Marrom' },
  '3': { hex: '#6B573B', name: 'Marrom Escuro' },
  '4': { hex: '#E7B027', name: 'Amarelo' },
  '5': { hex: '#FFF7B7', name: 'Amarelo Claro' },
  '6': { hex: '#F8C790', name: 'Pele' },
  '7': { hex: '#9F2B31', name: 'Vermelho Escuro' },
  '8': { hex: '#ED5C50', name: 'Vermelho' },
  '9': { hex: '#FFBFC2', name: 'Rosa Claro' },
  '10': { hex: '#E7D1EE', name: 'Roxo Claro' },
  '11': { hex: '#AC94B3', name: 'Roxo' },
  '12': { hex: '#7E5B90', name: 'Roxo Escuro' },
  '13': { hex: '#4F7AA2', name: 'Azul' },
  '14': { hex: '#75B7C7', name: 'Azul Claro' },
  '15': { hex: '#C5EDE6', name: 'Ciano Claro' },
  '16': { hex: '#BBF3BD', name: 'Verde Claro' },
  '17': { hex: '#6BAE61', name: 'Verde' },
  '18': { hex: '#456F40', name: 'Verde Escuro' },
  '19': { hex: '#7A7D22', name: 'Verde Oliva' },
  '20': { hex: '#595959', name: 'Cinza' },
  '21': { hex: '#1E1E1E', name: 'Preto HC' },
  '26': { hex: '#FFFFFF', name: 'Branco HC' },
  '27': { hex: '#FFF41D', name: 'Amarelo Neon HC' },
  '28': { hex: '#FFE508', name: 'Amarelo HC' },
  '29': { hex: '#FFCC00', name: 'Ouro HC' },
  '45': { hex: '#E3AE7D', name: 'Bege' },
  '61': { hex: '#000000', name: 'Preto' },
  '92': { hex: '#C99263', name: 'Marrom Claro' },
  '100': { hex: '#AE7748', name: 'Marrom Médio' },
  '101': { hex: '#945C2F', name: 'Marrom Escuro' },
  '102': { hex: '#FFC680', name: 'Dourado' },
  '104': { hex: '#DC9B4C', name: 'Laranja' },
  '106': { hex: '#FFB696', name: 'Rosa' },
  '143': { hex: '#F0DCA3', name: 'Creme' }
};

export const DuotoneColorPalette: React.FC<DuotoneColorPaletteProps> = ({
  primaryColors,
  secondaryColors,
  selectedPrimaryColor,
  selectedSecondaryColor,
  onPrimaryColorSelect,
  onSecondaryColorSelect,
  className
}) => {
  const [activePalette, setActivePalette] = useState<'primary' | 'secondary'>('primary');

  const getColorInfo = (colorId: string) => {
    return COLOR_MAP[colorId] || { hex: '#DDDDDD', name: `Cor ${colorId}` };
  };

  const renderColorButton = (
    colorId: string,
    isSelected: boolean,
    onClick: () => void,
    isPrimary: boolean
  ) => {
    const colorInfo = getColorInfo(colorId);
    
    return (
      <button
        key={colorId}
        onClick={onClick}
        className={cn(
          'w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110',
          isSelected 
            ? 'border-white shadow-lg ring-2 ring-blue-500' 
            : 'border-gray-300 hover:border-gray-400',
          isPrimary && isSelected && 'ring-blue-500',
          !isPrimary && isSelected && 'ring-purple-500'
        )}
        style={{ backgroundColor: colorInfo.hex }}
        title={`${colorInfo.name} (${colorId})`}
      >
        {isSelected && (
          <div className={cn(
            'w-full h-full rounded-full flex items-center justify-center text-xs font-bold',
            isPrimary ? 'bg-blue-500/20' : 'bg-purple-500/20'
          )}>
            {isPrimary ? '1' : '2'}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Seletor de Paleta */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActivePalette('primary')}
          className={cn(
            'px-3 py-1 rounded-md text-sm font-medium transition-colors',
            activePalette === 'primary'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          )}
        >
          Cor Principal
        </button>
        <button
          onClick={() => setActivePalette('secondary')}
          className={cn(
            'px-3 py-1 rounded-md text-sm font-medium transition-colors',
            activePalette === 'secondary'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          )}
        >
          Cor Secundária
        </button>
      </div>

      {/* Paleta de Cores Primárias */}
      {activePalette === 'primary' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Cor Principal
          </h4>
          <div className="grid grid-cols-8 gap-2">
            {primaryColors.map(colorId =>
              renderColorButton(
                colorId,
                colorId === selectedPrimaryColor,
                () => onPrimaryColorSelect(colorId),
                true
              )
            )}
          </div>
        </div>
      )}

      {/* Paleta de Cores Secundárias */}
      {activePalette === 'secondary' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            Cor Secundária
          </h4>
          <div className="grid grid-cols-8 gap-2">
            {secondaryColors.map(colorId =>
              renderColorButton(
                colorId,
                colorId === selectedSecondaryColor,
                () => onSecondaryColorSelect(colorId),
                false
              )
            )}
          </div>
        </div>
      )}

      {/* Preview das Cores Selecionadas */}
      <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: getColorInfo(selectedPrimaryColor).hex }}
          ></div>
          <span className="text-sm text-gray-600">
            {getColorInfo(selectedPrimaryColor).name}
          </span>
        </div>
        <div className="text-gray-400">+</div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-6 h-6 rounded-full border-2 border-gray-300"
            style={{ backgroundColor: getColorInfo(selectedSecondaryColor).hex }}
          ></div>
          <span className="text-sm text-gray-600">
            {getColorInfo(selectedSecondaryColor).name}
          </span>
        </div>
      </div>
    </div>
  );
};
