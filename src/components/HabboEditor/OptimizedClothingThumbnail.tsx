
import { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { HybridClothingItem } from '@/hooks/useHybridClothingData';

interface OptimizedClothingThumbnailProps {
  item: HybridClothingItem;
  hotel?: string;
  className?: string;
  size?: 's' | 'm' | 'l';
}

const OptimizedClothingThumbnail = ({ 
  item, 
  hotel = 'com.br', 
  className = '',
  size = 'm'
}: OptimizedClothingThumbnailProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageCache] = useState(new Map<string, boolean>());

  // Generate intelligent thumbnail URLs with multiple fallbacks
  const generateThumbnailUrls = useCallback(() => {
    const urls: string[] = [];
    const category = item.category;
    const figureId = item.figureId || item.swfName.split('_')[1] || '1';
    const colorId = item.colors[0] || '1';
    const baseHotel = hotel === 'com.br' ? 'com.br' : 'com';

    // 1. Use provided imageUrl if available (HabboWidgets)
    if (item.imageUrl && item.source === 'habbowidgets') {
      urls.push(item.imageUrl);
    }

    // 2. Official Habbo imaging with different formats
    urls.push(
      `https://www.habbo.${baseHotel}/habbo-imaging/clothing/${category}/${figureId}/${colorId}.png`,
      `https://www.habbo.${baseHotel}/habbo-imaging/clothing/${category}/${figureId}/1.png`,
      `https://images.habbo.com/c_images/clothing/icon_${category}_${figureId}_${colorId}.png`,
      `https://images.habbo.com/c_images/clothing/icon_${category}_${figureId}_1.png`
    );

    // 3. HabboWidgets alternatives
    if (item.source !== 'habbowidgets') {
      urls.push(
        `https://www.habbowidgets.com/images/${item.swfName}.gif`,
        `https://www.habbowidgets.com/images/${category}${figureId}.gif`,
        `https://www.habbowidgets.com/clothing/${category}/${figureId}_${colorId}.png`
      );
    }

    // 4. Alternative official sources
    urls.push(
      `https://habbo-stories-content.s3.amazonaws.com/clothing/${category}/${figureId}.png`,
      `https://www.habbo.com/habbo-imaging/clothing/${category}/${figureId}/${colorId}.png`
    );

    // 5. Avatar-based fallback (generates isolated clothing item)
    urls.push(
      `https://www.habbo.${baseHotel}/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&direction=2&head_direction=3&size=${size}&img_format=png&gesture=std&action=std`
    );

    return [...new Set(urls)]; // Remove duplicates
  }, [item, hotel, size]);

  const thumbnailUrls = generateThumbnailUrls();

  const handleImageError = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
        // Mark this URL as failed in cache
    imageCache.set(currentUrl, false);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      console.log(`💥 [OptimizedThumbnail] All URLs failed for ${item.name} (${item.id})`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, thumbnailUrls, imageCache, item]);

  const handleImageLoad = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
        // Mark this URL as successful in cache
    imageCache.set(currentUrl, true);
    
    setIsLoading(false);
    setHasError(false);
  }, [currentUrlIndex, thumbnailUrls, imageCache]);

  // Reset when item changes
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [item.id]);

  // Skip to cached successful URL if available
  useEffect(() => {
    for (let i = 0; i < thumbnailUrls.length; i++) {
      if (imageCache.get(thumbnailUrls[i]) === true) {
        setCurrentUrlIndex(i);
        break;
      }
    }
  }, [thumbnailUrls, imageCache]);

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-200 rounded ${className}`}>
        <div className="text-center p-1">
          <AlertCircle className="w-3 h-3 text-gray-500 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {item.figureId || item.swfName.split('_')[1] || '?'}
          </span>
          <span className="text-xs text-gray-500 block">
            {item.source[0].toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img 
        key={`${item.id}_${currentUrlIndex}`} // Force re-render on URL change
        src={thumbnailUrls[currentUrlIndex]}
        alt={item.name}
        className={`w-full h-full object-contain pixelated ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
      
      {/* Source indicator */}
      {!isLoading && !hasError && (
        <div className="absolute bottom-0 right-0 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          {item.source[0].toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default OptimizedClothingThumbnail;
