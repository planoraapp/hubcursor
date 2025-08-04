
import React, { useState } from 'react';
import { RealHabboItem, generateIsolatedThumbnail } from '@/hooks/useRealHabboData';

interface ViaJovemStyleThumbnailProps {
  item: RealHabboItem;
  colorId: string;
  gender: 'M' | 'F';
  hotel: string;
  isSelected?: boolean;
  onClick?: () => void;
  onColorChange?: (colorId: string) => void;
  className?: string;
}

const ViaJovemStyleThumbnail = ({ 
  item, 
  colorId, 
  gender,
  hotel,
  isSelected = false, 
  onClick,
  onColorChange,
  className = '' 
}: ViaJovemStyleThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Gerar URL isolada igual ViaJovem
  const thumbnailUrl = generateIsolatedThumbnail(item.category, item.figureId, colorId, gender, hotel);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    console.error('❌ [ViaJovemThumbnail] Erro ao carregar:', {
      item: item.name,
      figureId: item.figureId,
      category: item.category,
      url: thumbnailUrl
    });
  };

  // Reset quando props mudam
  React.useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [item.figureId, colorId]);

  const getClubBadgeStyle = (club: string) => {
    switch (club) {
      case 'HC':
        return 'bg-yellow-500 text-black';
      case 'LTD':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Container principal igual ViaJovem */}
      <div
        className={`
          clothes-object cursor-pointer transition-all duration-200 hover:scale-105
          w-16 h-16 bg-gray-100 rounded border-2 relative overflow-hidden
          ${isSelected ? 'selected border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}
        `}
        data-clothing={item.figureId}
        onClick={onClick}
        title={`${item.name} (${item.figureId})`}
        style={{
          backgroundImage: !imageError && !isLoading ? `url(${thumbnailUrl})` : 'none',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Imagem isolada (fallback se background não funcionar) */}
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-contain opacity-0"
            style={{ imageRendering: 'pixelated' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
            <span className="text-sm">❌</span>
            <span className="text-[10px] mt-1">{item.figureId}</span>
          </div>
        )}

        {/* Badge de raridade */}
        {item.club !== 'FREE' && (
          <div className={`absolute top-1 right-1 text-xs px-1 py-0.5 rounded font-bold text-shadow ${getClubBadgeStyle(item.club)}`}>
            {item.club}
          </div>
        )}

        {/* Indicador de seleção */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/20 border-2 border-blue-400 rounded flex items-center justify-center">
            <div className="bg-blue-500 text-white rounded-full p-1">
              <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info da peça */}
      <div className="mt-1">
        <div className="text-xs text-center text-gray-700 font-medium truncate">
          {item.name}
        </div>
        <div className="text-[10px] text-center text-gray-500">
          ID: {item.figureId}
        </div>
      </div>

      {/* Paleta de cores (igual ViaJovem) */}
      {item.colors.length > 1 && (
        <div className="mt-1 flex justify-center gap-0.5 flex-wrap">
          {item.colors.slice(0, 6).map((color) => (
            <button
              key={color}
              className={`w-2 h-2 rounded-sm border hover:scale-125 transition-all duration-200 ${
                colorId === color ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-300'
              }`}
              style={{ backgroundColor: getHabboColorHex(color) }}
              onClick={(e) => {
                e.stopPropagation();
                onColorChange?.(color);
              }}
              title={`Cor ${color}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Sistema de cores oficial do Habbo (simplificado)
const getHabboColorHex = (colorId: string): string => {
  const colors: Record<string, string> = {
    '1': '#FFFFFF', '2': '#000000', '3': '#C0C0C0', '4': '#808080',
    '5': '#FFC0CB', '6': '#D2B48C', '21': '#1C1C1C', '26': '#DC143C',
    '31': '#32CD32', '45': '#8B4513', '61': '#4169E1', '80': '#654321',
    '82': '#6495ED', '92': '#FFD700', '100': '#FF69B4', '104': '#8B0000',
    '106': '#FF8C00', '143': '#9370DB'
  };
  
  return colors[colorId] || '#E5E5E5';
};

export default ViaJovemStyleThumbnail;
