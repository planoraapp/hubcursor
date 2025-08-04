
import React, { useState } from 'react';

interface SimplifiedItemThumbnailProps {
  category: string;
  figureId: string;
  colorId?: string;
  gender: 'M' | 'F';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

const SimplifiedItemThumbnail = ({ 
  category, 
  figureId, 
  colorId = '1',
  gender,
  isSelected = false, 
  onClick,
  className = '' 
}: SimplifiedItemThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate focused thumbnail URL that isolates the specific clothing piece
  const generateIsolatedThumbnailUrl = () => {
    // Use a minimal base figure to isolate the specific piece
    const baseFigure = `hd-180-1.${category}-${figureId}-${colorId}`;
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${baseFigure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
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
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-200'}
        ${className}
      `} onClick={onClick}>
        <span className="text-xs text-gray-500 font-mono">{figureId}</span>
      </div>
    );
  }

  return (
    <div className={`
      relative w-20 h-20 bg-transparent rounded cursor-pointer overflow-hidden
      transition-all duration-200 hover:scale-105
      ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
      ${className}
    `} onClick={onClick}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Clothing item image */}
      <img
        src={generateIsolatedThumbnailUrl()}
        alt={`${category}-${figureId}`}
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
        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default SimplifiedItemThumbnail;
