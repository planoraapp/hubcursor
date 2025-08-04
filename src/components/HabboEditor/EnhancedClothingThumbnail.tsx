
import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { HabboEmotionClothingItem } from '@/hooks/useHabboEmotionClothing';

interface EnhancedClothingThumbnailProps {
  item: HabboEmotionClothingItem;
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

  // Gerar URLs de imagem com múltiplos fallbacks usando padrão correto
  const generateImageUrls = useCallback(() => {
    const urls: string[] = [];
    const category = item.part;
    const itemId = item.id || 1000;
    const code = item.code || `${category}_${itemId}`;
    
    // Mapeamento de categorias para nomes de sprites
    const categoryNames: Record<string, string> = {
      'hr': 'hair',
      'ch': 'shirt', 
      'lg': 'trousers',
      'sh': 'shoes',
      'ha': 'hat',
      'ea': 'glasses',
      'cc': 'jacket',
      'ca': 'chest_accessory',
      'wa': 'belt',
      'fa': 'face_accessory',
      'cp': 'chest_print',
      'hd': 'head'
    };
    
    const categoryName = categoryNames[category] || 'shirt';
    const spriteName = code.includes('_U_') ? code : `${categoryName}_U_${code}`;
    
    // 1. URL principal do HabboEmotion (formato correto)
    urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${spriteName}/h_std_${category}_${itemId}_2_0.png`);
    
    // 2. Variações do sprite name
    urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${code}/h_std_${category}_${itemId}_2_0.png`);
    urls.push(`https://files.habboemotion.com/habbo-assets/sprites/clothing/${categoryName}_${itemId}/h_std_${category}_${itemId}_2_0.png`);
    
    // 3. URLs alternativas com diferentes estruturas
    urls.push(`https://files.habboemotion.com/habbo-assets/clothing/${category}/${spriteName}/h_std_${category}_${itemId}_2_0.png`);
    urls.push(`https://files.habboemotion.com/sprites/clothing/${spriteName}/h_std_${category}_${itemId}_2_0.png`);
    
    // 4. Fallbacks para outros domínios/formatos
    urls.push(`https://habboemotion.com/assets/sprites/clothing/${spriteName}/h_std_${category}_${itemId}_2_0.png`);
    urls.push(`https://cdn.habboemotion.com/clothing/${category}/${itemId}.png`);
    
    // 5. Usar URL original se fornecida
    if (item.imageUrl) {
      urls.push(item.imageUrl);
    }
    
    // 6. Fallback genérico do Habbo oficial
    urls.push(`https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${selectedColorId}&direction=2&head_direction=3&size=${size}&img_format=png&gesture=std&action=std`);
    
    return [...new Set(urls)]; // Remove duplicates
  }, [item, selectedColorId, size]);

  const thumbnailUrls = generateImageUrls();

  const handleImageError = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    console.log(`❌ [EnhancedThumbnail] Failed: ${currentUrl} (${item.name})`);
    
    // Mark this URL as failed in cache
    imageCache.set(currentUrl, false);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log(`💥 [EnhancedThumbnail] All URLs failed for ${item.name} (${item.id})`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, thumbnailUrls, imageCache, item]);

  const handleImageLoad = useCallback(() => {
    const currentUrl = thumbnailUrls[currentUrlIndex];
    console.log(`✅ [EnhancedThumbnail] Success: ${currentUrl} (${item.name})`);
    
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
            {item.code.split('_').pop() || '?'}
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
            {item.source === 'supabase-comprehensive' ? 'SC' : item.source === 'comprehensive-fallback' ? 'CF' : 'HE'}
          </div>
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
