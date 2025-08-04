
import { useState, useEffect } from 'react';
import { Package2 } from 'lucide-react';

interface OfficialHabboImageProps {
  className: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

// Cache global de URLs que funcionam
const imageCache = new Map<string, string>();
const failedUrls = new Set<string>();

export const OfficialHabboImage = ({ 
  className, 
  name, 
  size = 'md',
  priority = false 
}: OfficialHabboImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // URLs oficiais priorizadas do Habbo
  const generateOfficialImageUrls = (classname: string): string[] => {
    if (!classname) return [];
    
    const cached = imageCache.get(classname);
    if (cached) return [cached];
    
    return [
      // 1. Images.habbo.com - Fonte oficial principal
      `https://images.habbo.com/c_images/catalogue/${classname}.png`,
      
      // 2. Habbo-imaging - Gerador oficial de ícones
      `https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=${classname}`,
      
      // 3. DCR Furni - Fonte oficial alternativa
      `https://images.habbo.com/dcr/hof_furni/${classname}.png`,
      
      // 4. Gordon (se disponível)
      `https://images.habbo.com/gordon/production/${classname}_icon.png`,
      
      // 5. Frank específico
      ...(classname === 'frank' ? ['/assets/frank.png'] : []),
      
      // 6. Fallback genérico
      `https://images.habbo.com/c_images/catalogue/icon_${classname}.png`
    ].filter(url => !failedUrls.has(url));
  };

  const imageUrls = generateOfficialImageUrls(className);

  const handleImageError = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      failedUrls.add(currentUrl);
      console.log(`❌ [OfficialImage] Failed to load: ${currentUrl}`);
    }
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
      console.log(`❌ [OfficialImage] All URLs failed for: ${className}`);
    }
  };

  const handleImageLoad = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      imageCache.set(className, currentUrl);
      console.log(`✅ [OfficialImage] Successfully loaded: ${currentUrl}`);
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
