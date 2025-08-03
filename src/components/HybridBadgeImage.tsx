
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Award } from 'lucide-react';

interface HybridBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

const HybridBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md',
  showFallback = true
}: HybridBadgeImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // URLs priorizadas para badges
  const badgeUrls = useMemo(() => [
    // 1. HabboWidgets (mais confiável para badges)
    `https://www.habbowidgets.com/images/badges/${code}.gif`,
    `https://habbowidgets.com/images/badges/${code}.gif`,
    
    // 2. HabboAssets
    `https://habboassets.com/c_images/album1584/${code}.gif`,
    `https://www.habboassets.com/c_images/album1584/${code}.gif`,
    
    // 3. Habbo Oficial
    `https://images.habbo.com/c_images/album1584/${code}.gif`,
    `https://www.habbo.com/habbo-imaging/badge/${code}`,
    `https://www.habbo.com.br/habbo-imaging/badge/${code}`,
    
    // 4. Outras fontes
    `https://habboemotion.com/images/badges/${code}.gif`,
    `https://cdn.habboemotion.com/badges/${code}.gif`,
  ], [code]);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6', 
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const handleImageError = useCallback(() => {
    console.log(`❌ [HybridBadgeImage] Falha URL ${currentUrlIndex + 1}/${badgeUrls.length} para badge ${code}`);
    
    if (currentUrlIndex < badgeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
      setImageLoaded(false);
    } else {
      setHasError(true);
      setIsLoading(false);
      console.log(`💥 [HybridBadgeImage] Todas URLs falharam para badge ${code}`);
    }
  }, [currentUrlIndex, badgeUrls.length, code]);

  const handleImageLoad = useCallback(() => {
    console.log(`✅ [HybridBadgeImage] Badge ${code} carregado da URL ${currentUrlIndex + 1}`);
    setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
  }, [code, currentUrlIndex]);

  // Reset quando o código muda
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
    setImageLoaded(false);
  }, [code]);

  if (hasError && !showFallback) {
    return null;
  }

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded`}>
        <div className="text-center">
          <Award className="w-3 h-3 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 leading-none">
            {code.slice(0, 3)}
          </span>
        </div>
      </div>
    );
  }

  const currentUrl = badgeUrls[currentUrlIndex];
  
  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        </div>
      )}
      
      <img
        key={`${code}_${currentUrlIndex}`}
        src={currentUrl}
        alt={name || code}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default HybridBadgeImage;
