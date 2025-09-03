import { useState, useEffect } from 'react';
import { Package2 } from 'lucide-react';

interface RealMarketplaceImageProps {
  className: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

// Cache global de URLs que funcionam
const imageCache = new Map<string, string>();
const failedUrls = new Set<string>();

export const RealMarketplaceImage = ({ 
  className, 
  name, 
  size = 'md',
  priority = false 
}: RealMarketplaceImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // URLs priorizadas para marketplace real
  const generateImageUrls = (classname: string): string[] => {
    if (!classname) return [];
    
    const cached = imageCache.get(classname);
    if (cached) return [cached];
    
    return [
      // HabboAPI.site - Mais confiável para mobis
      `https://habboapi.site/images/furni/${classname}.png`,
      `https://habboapi.site/images/furni/${classname}.gif`,
      
      // HabboFurni - Segunda opção
      `https://habbofurni.com/images/furni/${classname}.png`,
      `https://habbofurni.com/images/furni/${classname}.gif`,
      
      // HabboWidgets - Boa para marketplace
      `https://resources.habbowidgets.com/furnidata/${classname}.gif`,
      `https://resources.habbowidgets.com/furnidata/${classname}.png`,
      
      // Habbo oficial
      `https://images.habbo.com/c_images/catalogue/${classname}.png`,
      `https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=${classname}`,
      
      // HabboEmotion fallback
      `https://habboemotion.com/resources/c_images/catalogue/${classname}.png`,
      
      // Frank específico
      ...(classname === 'frank' ? ['/assets/frank.png'] : [])
    ].filter(url => !failedUrls.has(url));
  };

  const imageUrls = generateImageUrls(className);

  const handleImageError = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      failedUrls.add(currentUrl);
    }
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      imageCache.set(className, currentUrl);
    }
    setIsLoading(false);
    setHasError(false);
  };

  // Reset quando className muda
  useEffect(() => {
    setCurrentUrlIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [className]);

  // Placeholder para erro ou sem URLs
  if (hasError || imageUrls.length === 0) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center`}>
        <Package2 size={size === 'sm' ? 12 : size === 'md' ? 16 : 20} className="text-gray-400" />
      </div>
    );
  }

  const currentUrl = imageUrls[currentUrlIndex];

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      {currentUrl && (
        <img
          src={currentUrl}
          alt={name}
          className={`${sizeClasses[size]} object-contain rounded border-2 border-gray-200 transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ imageRendering: 'pixelated' }}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};