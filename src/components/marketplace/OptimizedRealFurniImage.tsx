
import { useState, useCallback } from 'react';
import { Package } from 'lucide-react';

interface OptimizedRealFurniImageProps {
  className: string;
  name: string;
  type?: 'roomitem' | 'wallitem';
  hotel?: string;
  size?: 'sm' | 'md' | 'lg';
  isLTD?: boolean;
}

export const OptimizedRealFurniImage = ({ 
  className, 
  name, 
  type = 'roomitem', 
  hotel = 'br',
  size = 'md',
  isLTD = false
}: OptimizedRealFurniImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getOptimizedImageUrls = useCallback((className: string, type: string, hotel: string, isLTD: boolean) => {
    const urls = [];
    
    // URLs específicas para LTDs
    if (isLTD) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`,
        `https://images.habbo.com/dcr/hof_furni/LTD/${className}.png`
      );
    }
    
    // HabboAPI.site (prioridade)
    urls.push(
      `https://www.habboapi.site/images/furni/${className}.png`,
      `https://habboapi.site/images/furni/${className}.gif`,
      `https://api.habboapi.site/furni/image/${className}`
    );
    
    // Habbo oficial
    urls.push(
      `https://images.habbo.com/dcr/hof_furni/${type}/${className}.png`,
      `https://www.habbo.com/dcr/hof_furni/${type}/${className}.png`
    );
    
    // HabboWidgets
    urls.push(
      `https://habbowidgets.com/images/furni/${className}.png`,
      `https://www.habbowidgets.com/images/furni/${className}.gif`
    );
    
    // Hotel específico
    urls.push(
      `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`
    );

    return [...new Set(urls)];
  }, []);

  const imageUrls = getOptimizedImageUrls(className, type, hotel, isLTD);
  const currentUrl = imageUrls[currentImageIndex];

  const handleImageError = useCallback(() => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  }, [currentImageIndex, imageUrls.length]);

  const handleImageLoad = useCallback(() => {
    // Cache localmente URL que funcionou
    if (typeof window !== 'undefined') {
      localStorage.setItem(`furni-cache-${className}`, currentUrl);
    }
  }, [currentUrl, className]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (imageError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded ${sizeClasses[size]} border border-gray-200 shadow-sm`}>
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-100 shadow-sm overflow-hidden`}>
      <img
        src={currentUrl}
        alt={name}
        className="object-contain max-w-full max-h-full transition-opacity duration-200"
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        title={`${name} (${className})`}
      />
    </div>
  );
};
