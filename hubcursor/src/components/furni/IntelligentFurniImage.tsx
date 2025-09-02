
import React, { useState, useCallback } from 'react';
import { Package, ImageOff } from 'lucide-react';

interface IntelligentFurniImageProps {
  item: {
    className: string;
    name: string;
    imageUrl?: string;
    id?: string;
  };
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const IntelligentFurniImage: React.FC<IntelligentFurniImageProps> = ({ 
  item, 
  className = '', 
  size = 'medium' 
}) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Improved fallback sources with better reliability
  const imageSources = [
    item.imageUrl,
    `https://images.habbo.com/dcr/hof_furni/icons/${item.className}.png`,
    `https://www.habbo.com/habbo-imaging/furni/${item.className}.png`,
    `https://habbo.com.br/habbo-imaging/furni/${item.className}.png`,
  ].filter(Boolean);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16', 
    large: 'w-24 h-24'
  };

  const handleImageError = useCallback(() => {
    const nextIndex = currentSrcIndex + 1;
    if (nextIndex < imageSources.length) {
      setCurrentSrcIndex(nextIndex);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentSrcIndex, imageSources.length]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  // Enhanced placeholder with pixelated theme
  const PlaceholderComponent = () => (
    <div className={`${sizeClasses[size]} ${className} bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center p-1`}>
      <Package size={size === 'small' ? 16 : size === 'medium' ? 20 : 28} className="text-gray-400 mb-1" />
      <span className="text-xs text-gray-500 text-center font-mono leading-tight" style={{ fontSize: size === 'small' ? '0.6rem' : '0.7rem' }}>
        {item.name?.slice(0, size === 'small' ? 8 : 12) || item.className?.slice(0, size === 'small' ? 8 : 12) || 'Item'}
      </span>
    </div>
  );

  if (hasError || imageSources.length === 0) {
    return <PlaceholderComponent />;
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded flex items-center justify-center">
          <ImageOff size={16} className="text-gray-400" />
        </div>
      )}
      <img
        src={imageSources[currentSrcIndex]}
        alt={item.name || item.className}
        className={`w-full h-full object-contain rounded ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default IntelligentFurniImage;
