
import { useState } from 'react';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';
import { generateIsolatedThumbnail } from '@/lib/improvedCategoryMapper';
import HabboColorPicker from './HabboColorPicker';

interface FocusedClothingThumbnailProps {
  item: ViaJovemFlashItem;
  colorId: string;
  gender: 'M' | 'F';
  isSelected?: boolean;
  onClick?: (item: ViaJovemFlashItem) => void;
  onColorChange?: (item: ViaJovemFlashItem, colorId: string) => void;
  className?: string;
}

const FocusedClothingThumbnail = ({ 
  item, 
  colorId, 
  gender,
  isSelected = false, 
  onClick,
  onColorChange,
  className = '' 
}: FocusedClothingThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleThumbnailClick = () => {
    onClick?.(item);
  };

  const handleColorSelect = (newColorId: string) => {
    onColorChange?.(item, newColorId);
  };

  // Gerar thumbnail isolada focando apenas na peça específica
  const thumbnailUrl = generateIsolatedThumbnail(item.category, item.figureId, colorId, gender);

  if (imageError) {
    return (
      <div className={`
        w-20 h-20 bg-gray-100 rounded-lg cursor-pointer flex flex-col items-center justify-center
        transition-all duration-200 hover:bg-gray-200 border-2
        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        ${className}
      `} onClick={handleThumbnailClick}>
        <span className="text-2xl">❌</span>
        <span className="text-xs text-gray-600 mt-1">{item.figureId}</span>
      </div>
    );
  }

  return (
    <HabboColorPicker
      availableColors={item.colors}
      selectedColor={colorId}
      onColorSelect={handleColorSelect}
      categoryId={item.category}
    >
      <div className={`
        relative w-20 h-20 bg-white rounded-lg cursor-pointer overflow-hidden
        transition-all duration-200 hover:scale-105 hover:shadow-lg border-2
        ${isSelected 
          ? 'border-blue-500 ring-2 ring-blue-300 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
        }
        ${className}
      `} onClick={handleThumbnailClick}>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Thumbnail isolada da peça */}
        <img
          src={thumbnailUrl}
          alt={`${item.category}-${item.figureId}`}
          className="w-full h-full object-contain"
          style={{ 
            imageRendering: 'pixelated',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Badge HC */}
        {item.club === 'HC' && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-black text-xs px-1 py-0.5 rounded font-bold shadow-sm">
            HC
          </div>
        )}

        {/* Indicador de seleção */}
        {isSelected && (
          <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1 shadow-lg">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Indicador de cores disponíveis */}
        {item.colors.length > 1 && (
          <div className="absolute top-1 left-1 bg-purple-500 text-white rounded-full p-1 shadow-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h8v11H4V4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </HabboColorPicker>
  );
};

export default FocusedClothingThumbnail;
