
import { useState } from 'react';
import { OFFICIAL_HABBO_PALETTES } from '@/lib/enhancedCategoryMapperV2';

interface SkinColorSliderProps {
  selectedColor: string;
  onColorSelect: (colorId: string) => void;
  selectedGender: 'M' | 'F';
  className?: string;
}

export const SkinColorSlider = ({
  selectedColor,
  onColorSelect,
  selectedGender,
  className = ''
}: SkinColorSliderProps) => {
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const skinPalette = OFFICIAL_HABBO_PALETTES.skin;

  const generatePreviewUrl = (colorId: string) => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=hd-180-${colorId}&gender=${selectedGender}&size=s&direction=2&head_direction=2&action=std&gesture=std&headonly=1`;
  };

  return (
    <div className={`w-full bg-white border rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Tom de Pele</span>
        </div>
        <span className="text-xs text-gray-500">{skinPalette.colors.length} tons</span>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Background Track */}
        <div className="h-8 bg-gradient-to-r from-yellow-200 via-orange-200 to-amber-600 rounded-full border-2 border-gray-200 relative overflow-hidden">
          
          {/* Color Markers */}
          <div className="absolute inset-0 flex items-center justify-between px-1">
            {skinPalette.colors.map((color, index) => {
              const isSelected = selectedColor === color.id;
              const isHovered = hoveredColor === color.id;
              const position = (index / (skinPalette.colors.length - 1)) * 100;
              
              return (
                <div
                  key={color.id}
                  className="absolute flex items-center justify-center"
                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                >
                  {/* Clickable Area */}
                  <button
                    onClick={() => onColorSelect(color.id)}
                    onMouseEnter={() => setHoveredColor(color.id)}
                    onMouseLeave={() => setHoveredColor(null)}
                    className={`relative w-8 h-8 rounded-full border-3 transition-all duration-200 overflow-hidden ${
                      isSelected 
                        ? 'border-blue-600 scale-125 shadow-lg ring-2 ring-blue-300' 
                        : 'border-white hover:border-gray-300 hover:scale-110'
                    }`}
                    title={color.name}
                    style={{ backgroundColor: color.hex }}
                  >
                    {/* Mini Avatar Preview */}
                    <img
                      src={generatePreviewUrl(color.id)}
                      alt={color.name}
                      className="w-full h-full object-cover pixelated"
                      onError={(e) => {
                        // Fallback para cor sólida se a imagem falhar
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Hover Tooltip */}
                  {isHovered && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30">
                      {color.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Selection Info */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-600">
            {skinPalette.colors.find(c => c.id === selectedColor)?.name || 'Tom Selecionado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SkinColorSlider;
