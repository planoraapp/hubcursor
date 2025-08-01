
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ClothingThumbnailProps {
  category: string;
  itemId: string;
  colorId?: string;
  className?: string;
  alt?: string;
  hotel?: string;
}

const ClothingThumbnail = ({ 
  category, 
  itemId, 
  colorId = '1', 
  className = '', 
  alt = '',
  hotel = 'com.br'
}: ClothingThumbnailProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Array de URLs possíveis para thumbnails, em ordem de prioridade
  const thumbnailUrls = [
    // HabboWidgets (mais provável de funcionar)
    `https://www.habbowidgets.com/clothing/${category}/${itemId}_${colorId}.png`,
    
    // Habbo Assets CDN
    `https://images.habbo.com/c_images/clothing/icon_${category}_${itemId}_${colorId}.png`,
    
    // Habbo Official Imager (isolado)
    `https://www.habbo.${hotel}/habbo-imaging/clothing/${category}/${itemId}/${colorId}.png`,
    
    // Avatar completo como fallback (gera só a peça)
    `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${category}-${itemId}-${colorId}&direction=2&head_direction=3&size=s&img_format=png&gesture=std&action=std`,
    
    // Habbo Stories CDN
    `https://habbo-stories-content.s3.amazonaws.com/clothing/${category}/${itemId}.png`
  ];

  const handleImageError = () => {
    console.log(`❌ [ClothingThumbnail] Failed to load: ${thumbnailUrls[currentUrlIndex]}`);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      console.log(`💥 [ClothingThumbnail] All URLs failed for ${category}-${itemId}`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ [ClothingThumbnail] Successfully loaded: ${thumbnailUrls[currentUrlIndex]}`);
    setIsLoading(false);
    setHasError(false);
  };

  // Reset quando props mudam
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [category, itemId, colorId]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 rounded ${className}`}>
        <div className="text-center p-2">
          <AlertCircle className="w-4 h-4 text-gray-500 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {itemId}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={thumbnailUrls[currentUrlIndex]}
        alt={alt || `${category}-${itemId}`}
        className={`w-full h-full object-contain pixelated ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default ClothingThumbnail;
