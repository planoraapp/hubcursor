
import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { HabboEmotionClothing } from '@/hooks/useHabboEmotionAPI';

interface EnhancedClothingThumbnailProps {
  item: HabboEmotionClothing;
  className?: string;
  size?: 's' | 'm' | 'l';
  selectedColorId?: string;
}

const EnhancedClothingThumbnail = ({ 
  item, 
  className = '',
  size = 'm',
  selectedColorId = '1'
}: EnhancedClothingThumbnailProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageCache] = useState(new Map<string, boolean>());

  // Generate functional clothing image URLs
  const generateRealClothingUrls = useCallback(() => {
    const urls: string[] = [];
    const category = item.part;
    const itemId = item.id;
    const code = item.code;
    
    // PRIORITY 1: HabboAssets - most reliable for clothing items
    if (code) {
      urls.push(`https://habboassets.com/clothing/${code}.png`);
      urls.push(`https://www.habboassets.com/clothing/${code}.png`);
    }
    
    // PRIORITY 2: Habblet Assets (alternative reliable source)
    if (code) {
      urls.push(`https://habblet-assets.s3.amazonaws.com/clothing/${code}.png`);
    }
    
    // PRIORITY 3: Official Habbo patterns with corrected structure
    urls.push(`https://images.habbo.com/c_images/clothing/icon_${category}_${itemId}_${selectedColorId}.png`);
    urls.push(`https://images.habbo.com/c_images/clothing/${category}_${itemId}_${selectedColorId}.png`);
    
    // PRIORITY 4: Simplified patterns
    urls.push(`https://images.habbo.com/c_images/clothing/${category}_${itemId}.png`);
    
    return [...new Set(urls)]; // Remove duplicates
  }, [item, selectedColorId]);

  const thumbnailUrls = generateRealClothingUrls();

  const handleImageError = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    imageCache.set(currentUrl, false);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, thumbnailUrls, imageCache, item]);

  const handleImageLoad = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    imageCache.set(currentUrl, true);
    
    setIsLoading(false);
    setHasError(false);
  }, [currentUrlIndex, thumbnailUrls, imageCache, item]);

  // Reset when item or color changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [item.id, selectedColorId]);

  // Use cached successful URL if available
  useEffect(() => {
    for (let i = 0; i < thumbnailUrls.length; i++) {
      if (imageCache.get(thumbnailUrls[i]) === true) {
        setCurrentUrlIndex(i);
        setIsLoading(false);
        setHasError(false);
        break;
      }
    }
  }, [thumbnailUrls, imageCache]);

  const sizeClasses = {
    s: 'w-12 h-12',
    m: 'w-16 h-16',
    l: 'w-20 h-20'
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center p-1">
          <AlertCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {item.code ? item.code.substring(0, 8) : String(item.id)}
          </span>
          <span className="text-xs text-gray-500 block">
            {item.part.toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center z-10">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      )}
      <img 
        key={`real_${item.id}_${currentUrlIndex}_${selectedColorId}`}
        src={thumbnailUrls[currentUrlIndex]}
        alt={item.name || item.code}
        className={`w-full h-full object-contain rounded border border-gray-200 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
      
      {/* HC indicator only if HC */}
      {!isLoading && !hasError && item.club === 'HC' && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-1 rounded-bl font-bold">
          HC
        </div>
      )}
    </div>
  );
};

export default EnhancedClothingThumbnail;
