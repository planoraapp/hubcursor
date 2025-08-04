
import React, { useState } from 'react';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';

interface ViaJovemStyleThumbnailProps {
  item: ViaJovemFlashItem;
  colorId: string;
  gender: 'M' | 'F';
  hotel: string;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const ViaJovemStyleThumbnail = ({ 
  item, 
  colorId, 
  gender,
  hotel,
  isSelected = false, 
  onClick,
  className = '' 
}: ViaJovemStyleThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate clean thumbnail showing only the specific clothing piece
  const generateCleanThumbnail = () => {
    // Create minimal figure string to isolate the clothing piece
    const baseFigure = `hd-180-1.${item.category}-${item.figureId}-${colorId}`;
    const hotelUrl = hotel === 'com' ? 'habbo.com' : `habbo.${hotel}`;
    return `https://www.${hotelUrl}/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`
        w-20 h-20 bg-gray-100 rounded cursor-pointer flex items-center justify-center
        transition-all duration-200 hover:bg-gray-200
        ${isSelected ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
        ${className}
      `} onClick={onClick}>
        <div className="text-center">
          <div className="text-lg">📦</div>
          <div className="text-xs text-gray-600 mt-1">{item.figureId}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      relative w-20 h-20 bg-transparent rounded cursor-pointer overflow-hidden
      transition-all duration-200 hover:scale-105 hover:shadow-md
      ${isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''}
      ${className}
    `} onClick={onClick}>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Clean clothing item image */}
      <img
        src={generateCleanThumbnail()}
        alt={item.name}
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

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-1 right-1 bg-purple-500 text-white rounded-full p-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Club badge (minimal) */}
      {item.club === 'hc' && (
        <div className="absolute top-1 left-1 bg-yellow-500 text-black text-xs px-1 rounded font-bold">
          HC
        </div>
      )}
    </div>
  );
};

export default ViaJovemStyleThumbnail;
