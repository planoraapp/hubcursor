
import { useState, useCallback, useEffect } from 'react';
import { AlertCircle, ImageOff } from 'lucide-react';

interface EnhancedBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
}

const EnhancedBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md',
  showFallback = true
}: EnhancedBadgeImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // URLs prioritárias com máximo de fontes
  const generateBadgeUrls = useCallback((badgeCode: string) => [
    // 1. Storage Supabase (mais confiável se disponível)
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${badgeCode}.gif`,
    
    // 2. HabboWidgets (fonte principal)
    `https://www.habbowidgets.com/images/badges/${badgeCode}.gif`,
    `https://habbowidgets.com/images/badges/${badgeCode}.gif`,
    
    // 3. HabboAssets (muito confiável)
    `https://habboassets.com/c_images/album1584/${badgeCode}.gif`,
    `https://www.habboassets.com/c_images/album1584/${badgeCode}.gif`,
    
    // 4. Habbo Oficial (múltiplas versões)
    `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
    `https://www.habbo.com/habbo-imaging/badge/${badgeCode}`,
    `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}`,
    `https://habbo.es/habbo-imaging/badge/${badgeCode}`,
    `https://habbo.de/habbo-imaging/badge/${badgeCode}`,
    
    // 5. Outras fontes conhecidas
    `https://habboemotion.com/images/badges/${badgeCode}.gif`,
    `https://cdn.habboemotion.com/badges/${badgeCode}.gif`,
    `https://habbo-stories.com/images/badges/${badgeCode}.gif`,
    
    // 6. Variações de extensão
    `https://www.habbowidgets.com/images/badges/${badgeCode}.png`,
    `https://habboassets.com/c_images/album1584/${badgeCode}.png`,
  ], []);

  const badgeUrls = generateBadgeUrls(code);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const handleImageError = useCallback(() => {
    if (currentUrlIndex < badgeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
      setImageLoaded(false);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, badgeUrls.length]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
    
    // Cache URL bem-sucedida
    if (typeof window !== 'undefined') {
      const cacheKey = `badge_url_${code}`;
      const validUrl = badgeUrls[currentUrlIndex];
      localStorage.setItem(cacheKey, JSON.stringify({
        url: validUrl,
        timestamp: Date.now(),
        urlIndex: currentUrlIndex
      }));
    }
  }, [code, badgeUrls, currentUrlIndex]);

  // Verificar cache ao inicializar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cacheKey = `badge_url_${code}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { url, timestamp, urlIndex } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24h
          
          if (!isExpired && urlIndex < badgeUrls.length) {
            setCurrentUrlIndex(urlIndex);
          }
        } catch (e) {
          // Cache inválido, continuar normalmente
        }
      }
    }
    
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
    setImageLoaded(false);
  }, [code, badgeUrls]);

  if (hasError && !showFallback) {
    return null;
  }

  if (hasError) {
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
    <div className={`${sizeClasses[size]} ${className} relative rounded overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      
      <img
        key={`${code}_${currentUrlIndex}`}
        src={badgeUrls[currentUrlIndex]}
        alt={name || code}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
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

export default EnhancedBadgeImage;
