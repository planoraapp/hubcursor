
import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { UnifiedClothingItem } from '@/hooks/useUnifiedClothingAPI';

interface EnhancedClothingThumbnailProps {
  item: UnifiedClothingItem;
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

  // Generate HabboEmotion individual PNG sprite URLs
  const generateRealClothingUrls = useCallback(() => {
    const urls: string[] = [];
    const category = item.part;
    const itemId = item.item_id;
    const code = item.code;
    
    // PRIORITY 1: HabboEmotion individual PNG sprites (main goal)
    if (code && category && itemId) {
      // Primary color first, then fallback colors
      urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_std_${category}_${itemId}_${selectedColorId}_0.png`);
      urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_std_${category}_${itemId}_0_0.png`);
      urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_std_${category}_${itemId}_1_0.png`);
      
      // Try other poses if standard doesn't work
      urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_sit_${category}_${itemId}_${selectedColorId}_0.png`);
      urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_crr_${category}_${itemId}_${selectedColorId}_0.png`);
    }
    
    // PRIORITY 2: Use image_url from unified API if available
    if (item.image_url) {
      urls.push(item.image_url);
    }
    
    // PRIORITY 3: Alternative HabboEmotion patterns
    if (code) {
      urls.push(`https://www.habboemotion.com/assets/clothing/${code}.png`);
    }
    
    // PRIORITY 4: Official Habbo individual clothing (fallback)
    if (category && itemId) {
      urls.push(`https://www.habbo.com/habbo-imaging/clothing/${category}/${itemId}/${selectedColorId}.png`);
    }
    
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
  }, [item.item_id, selectedColorId]);

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
            {item.code ? item.code.substring(0, 8) : String(item.item_id)}
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
        key={`real_${item.item_id}_${currentUrlIndex}_${selectedColorId}`}
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
