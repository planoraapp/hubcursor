
import { useState } from 'react';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';

interface FocusedClothingThumbnailProps {
  item: ViaJovemFlashItem;
  colorId: string;
  gender: 'M' | 'F';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const FocusedClothingThumbnail = ({ 
  item, 
  colorId, 
  gender, 
  isSelected = false, 
  onClick,
  className = '' 
}: FocusedClothingThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URL simples sem crop - igual ao ViaJovem original
  const getThumbnailUrl = (item: ViaJovemFlashItem, colorId: string): string => {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${colorId}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    console.error('❌ [FocusedThumbnail] Erro ao carregar:', {
      item: item.name,
      url: getThumbnailUrl(item, colorId)
    });
  };

  const thumbnailUrl = getThumbnailUrl(item, colorId);

  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-200 hover:scale-105
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}
        ${className}
      `}
      onClick={onClick}
      title={item.name}
    >
      {/* Container da imagem com aspect ratio */}
      <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden border border-gray-200 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-2">
            <span>❌</span>
            <span className="mt-1 text-center">Erro</span>
          </div>
        )}

        {/* Badge de raridade */}
        {item.club === 'hc' && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded font-bold">
            HC
          </div>
        )}

        {/* Indicador de seleção */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <div className="bg-blue-500 text-white rounded-full p-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Nome da peça */}
      <div className="mt-1 text-xs text-center text-gray-700 font-medium truncate">
        {item.name}
      </div>
      
      {/* Info técnica */}
      <div className="mt-0.5 text-[10px] text-center text-gray-500 truncate">
        {item.category.toUpperCase()}-{item.figureId}
      </div>
    </div>
  );
};

export default FocusedClothingThumbnail;
