
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

  // Generate WORKING clothing image URLs based on REAL API data
  const generateRealClothingUrls = useCallback(() => {
    const urls: string[] = [];
    const category = item.part;
    const itemId = item.id;
    const code = item.code;
    
    console.log(`🖼️ [EnhancedThumbnail] Generating URLs for REAL item:`, {
      id: itemId,
      code,
      part: category,
      source: item.source
    });
    
    // PRIORITY 1: Official Habbo imaging (MOST RELIABLE for real items)
    urls.push(`https://www.habbo.com/habbo-imaging/clothing/${category}/${itemId}/${selectedColorId}.png`);
    urls.push(`https://www.habbo.com/habbo-imaging/clothing/${category}/${itemId}/1.png`);
    
    // PRIORITY 2: HabboAssets (reliable alternative)
    if (code) {
      urls.push(`https://www.habboassets.com/clothing/${code}.png`);
      urls.push(`https://www.habboassets.com/assets/clothing/${category}/${code}.png`);
    }
    
    // PRIORITY 3: Alternative official patterns
    urls.push(`https://images.habbo.com/c_images/clothing/${category}_${itemId}_${selectedColorId}.png`);
    urls.push(`https://images.habbo.com/c_images/clothing/icon_${category}_${itemId}_1.png`);
    
    // PRIORITY 4: Fallback to generic patterns
    urls.push(`https://www.habbo.com/habbo-imaging/clothing/${category}/${itemId}/0.png`);
    urls.push(`https://images.habbo.com/c_images/clothing/${category}_${itemId}.png`);
    
    console.log(`📋 [EnhancedThumbnail] Generated ${urls.length} URLs for real item ${itemId}`);
    return [...new Set(urls)]; // Remove duplicates
  }, [item, selectedColorId]);

  const thumbnailUrls = generateRealClothingUrls();

  const handleImageError = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    console.log(`❌ [EnhancedThumbnail] Real item image failed: ${currentUrl} (${item.name})`);
    
    imageCache.set(currentUrl, false);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log(`💥 [EnhancedThumbnail] All URLs failed for real item ${item.name} (${item.id})`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, thumbnailUrls, imageCache, item]);

  const handleImageLoad = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    console.log(`✅ [EnhancedThumbnail] Real item image success: ${currentUrl} (${item.name})`);
    
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
      
      {/* Real item indicators */}
      {!isLoading && !hasError && (
        <>
          {/* Source indicator - API Real */}
          <div className="absolute bottom-0 right-0 bg-green-600 text-white text-xs px-1 rounded-tl font-bold">
            API
          </div>
          
          {/* HC indicator only if HC */}
          {item.club === 'HC' && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-1 rounded-bl font-bold">
              HC
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedClothingThumbnail;
