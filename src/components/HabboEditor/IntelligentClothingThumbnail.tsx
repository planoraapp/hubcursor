
import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { HybridClothingItemV2 } from '@/hooks/useHybridClothingDataV2';

interface IntelligentClothingThumbnailProps {
  item: HybridClothingItemV2;
  hotel?: string;
  className?: string;
  size?: 's' | 'm' | 'l';
  selectedColorId?: string;
}

const IntelligentClothingThumbnail = ({ 
  item, 
  hotel = 'com.br', 
  className = '',
  size = 'm',
  selectedColorId = '1'
}: IntelligentClothingThumbnailProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageCache] = useState(new Map<string, boolean>());

  // Generate intelligent thumbnail URLs with multiple fallbacks
  const generateIntelligentUrls = useCallback(() => {
    const urls: string[] = [];
    const category = item.category;
    const figureId = item.figureId || '1';
    const colorId = selectedColorId || item.colors[0] || '1';
    const baseHotel = hotel === 'com.br' ? 'com.br' : 'com';
    const code = item.metadata?.code || `${category}_${figureId}`;

    // 1. Primary source URLs based on item source
    if (item.source === 'habboemotion') {
      urls.push(
        `https://habboemotion.com/images/clothing/${category}/${code}.png`,
        `https://habboemotion.com/assets/clothing/${code}.png`,
        `https://cdn.habboemotion.com/clothing/${code}.gif`,
        `https://habboemotion.com/images/${code}.png`
      );
    }

    if (item.source === 'habbowidgets' || urls.length === 0) {
      urls.push(
        item.imageUrl, // Original provided URL
        `https://www.habbowidgets.com/images/${code}.gif`,
        `https://www.habbowidgets.com/images/${category}${figureId}.gif`,
        `https://habbowidgets.com/images/${code}.gif`
      );
    }

    // 2. Official Habbo imaging URLs (universal fallback)
    urls.push(
      `https://www.habbo.${baseHotel}/habbo-imaging/clothing/${category}/${figureId}/${colorId}.png`,
      `https://www.habbo.${baseHotel}/habbo-imaging/clothing/${category}/${figureId}/1.png`,
      `https://images.habbo.com/c_images/clothing/icon_${category}_${figureId}_${colorId}.png`,
      `https://images.habbo.com/c_images/clothing/icon_${category}_${figureId}_1.png`
    );

    // 3. Alternative Habbo hotels as fallback
    const alternativeHotels = ['com', 'com.br', 'es', 'de', 'fr'];
    for (const altHotel of alternativeHotels) {
      if (altHotel !== baseHotel) {
        urls.push(
          `https://www.habbo.${altHotel}/habbo-imaging/clothing/${category}/${figureId}/${colorId}.png`,
          `https://www.habbo.${altHotel}/habbo-imaging/clothing/${category}/${figureId}/1.png`
        );
      }
    }

    // 4. Avatar-based fallback (shows isolated clothing item on avatar)
    urls.push(
      `https://www.habbo.${baseHotel}/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&direction=2&head_direction=3&size=${size}&img_format=png&gesture=std&action=std`
    );

    // 5. Generic placeholder
    urls.push(
      `https://via.placeholder.com/64x64/f0f0f0/666?text=${category.toUpperCase()}`
    );

    // Remove duplicates and filter empty URLs
    return [...new Set(urls)].filter(url => url && url.length > 10);
  }, [item, hotel, size, selectedColorId]);

  const thumbnailUrls = generateIntelligentUrls();

  const handleImageError = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    console.log(`❌ [IntelligentThumbnail] Failed: ${currentUrl} (${item.name})`);
    
    // Mark this URL as failed in cache
    imageCache.set(currentUrl, false);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log(`💥 [IntelligentThumbnail] All URLs failed for ${item.name} (${item.id})`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, thumbnailUrls, imageCache, item]);

  const handleImageLoad = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    console.log(`✅ [IntelligentThumbnail] Success: ${currentUrl} (${item.name})`);
    
    // Mark this URL as successful in cache
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

  // Skip to cached successful URL if available
  useEffect(() => {
    for (let i = 0; i < thumbnailUrls.length; i++) {
      if (imageCache.get(thumbnailUrls[i]) === true) {
        setCurrentUrlIndex(i);
        setIsLoading(false);
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
            {item.figureId || '?'}
          </span>
          <span className="text-xs text-gray-500 block">
            {item.source[0].toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      )}
      <img 
        key={`${item.id}_${currentUrlIndex}_${selectedColorId}`}
        src={thumbnailUrls[currentUrlIndex]}
        alt={item.name}
        className={`w-full h-full object-contain rounded border border-gray-200 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
      
      {/* Source and club indicators */}
      {!isLoading && !hasError && (
        <>
          <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-xs px-1 rounded-tl">
            {item.source === 'habboemotion' ? 'E' : item.source === 'habbowidgets' ? 'W' : 'O'}
          </div>
          {item.club === 'HC' && (
            <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-1 rounded-bl font-bold">
              HC
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default IntelligentClothingThumbnail;
