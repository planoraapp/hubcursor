
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { ImageOff } from 'lucide-react';

interface OptimizedBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  priority?: boolean;
}

// Cache global para URLs bem-sucedidas
const imageCache = new Map<string, string>();
const failedImages = new Set<string>();

// URLs otimizadas com base na análise dos logs
const generateOptimizedUrls = (code: string): string[] => [
  // URLs mais confiáveis primeiro
  `https://habboassets.com/c_images/album1584/${code}.gif`,
  `https://images.habbo.com/c_images/album1584/${code}.gif`,
  `https://www.habbo.com/habbo-imaging/badge/${code}`,
  `https://habboemotion.com/images/badges/${code}.gif`,
  `https://www.habbowidgets.com/images/badges/${code}.gif`,
  
  // Fallbacks com diferentes domínios
  `https://habbo.com.br/habbo-imaging/badge/${code}`,
  `https://habbo.es/habbo-imaging/badge/${code}`,
  `https://cdn.habboemotion.com/badges/${code}.gif`,
  
  // Storage próprio como último recurso
  `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${code}.gif`,
];

const OptimizedBadgeImage: React.FC<OptimizedBadgeImageProps> = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md',
  showFallback = true,
  priority = false
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const currentUrlIndexRef = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);

  const badgeUrls = useMemo(() => generateOptimizedUrls(code), [code]);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Reset quando o código muda
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setImageLoaded(false);
    currentUrlIndexRef.current = 0;

    // Verificar cache primeiro
    const cachedUrl = imageCache.get(code);
    if (cachedUrl) {
      setCurrentUrl(cachedUrl);
      setIsLoading(false);
      setImageLoaded(true);
      return;
    }

    // Se já sabemos que falhou, mostrar fallback imediatamente
    if (failedImages.has(code)) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Começar com a primeira URL
    setCurrentUrl(badgeUrls[0]);
  }, [code, badgeUrls]);

  const handleImageError = useCallback(() => {
    const nextIndex = currentUrlIndexRef.current + 1;
    
    if (nextIndex < badgeUrls.length) {
      currentUrlIndexRef.current = nextIndex;
      setCurrentUrl(badgeUrls[nextIndex]);
      setIsLoading(true);
    } else {
      // Todas as URLs falharam
      failedImages.add(code);
      setHasError(true);
      setIsLoading(false);
      console.warn(`❌ All URLs failed for badge: ${code}`);
    }
  }, [badgeUrls, code]);

  const handleImageLoad = useCallback(() => {
    const successUrl = badgeUrls[currentUrlIndexRef.current];
    imageCache.set(code, successUrl);
    setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
  }, [badgeUrls, code]);

  // Fallback UI
  if (hasError) {
    if (!showFallback) return null;
    
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded`}>
        <div className="text-center">
          <ImageOff className="w-3 h-3 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 leading-none">
            {code.slice(0, 3)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded overflow-hidden bg-gray-50`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      
      {currentUrl && (
        <img
          ref={imgRef}
          src={currentUrl}
          alt={name || code}
          className={`w-full h-full object-contain transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ imageRendering: 'pixelated' }}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}
    </div>
  );
};

export default OptimizedBadgeImage;
