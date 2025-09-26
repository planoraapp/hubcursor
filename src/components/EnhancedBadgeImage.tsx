
import { useState, useCallback, useEffect, useMemo } from 'react';
import { ImageOff } from 'lucide-react';

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

  // Memoizar URLs para evitar re-criação
  const badgeUrls = useMemo(() => [
    // 1. Storage Supabase (mais confiável se disponível)
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${code}.gif`,
    
    // 2. HabboWidgets (fonte principal)
    `https://www.habbowidgets.com/images/badges/${code}.gif`,
    `https://habbowidgets.com/images/badges/${code}.gif`,
    
    // 3. HabboAssets (muito confiável)
    `https://habboassets.com/c_images/album1584/${code}.gif`,
    `https://www.habboassets.com/c_images/album1584/${code}.gif`,
    
    // 4. Habbo Oficial (múltiplas versões)
    `https://images.habbo.com/c_images/album1584/${code}.gif`,
    `https://www.habbo.com/habbo-imaging/badge/${code}`,
    `https://www.habbo.com.br/habbo-imaging/badge/${code}`,
    `https://habbo.es/habbo-imaging/badge/${code}`,
    `https://habbo.de/habbo-imaging/badge/${code}`,
    
    // 5. Outras fontes conhecidas
    `https://habboemotion.com/images/badges/${code}.gif`,
    `https://cdn.habboemotion.com/badges/${code}.gif`,
    `https://habbo-stories.com/images/badges/${code}.gif`,
    
    // 6. Variações de extensão
    `https://www.habbowidgets.com/images/badges/${code}.png`,
    `https://habboassets.com/c_images/album1584/${code}.png`,
  ], [code]);

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
  }, [currentUrlIndex, badgeUrls.length, code]);

  const handleImageLoad = useCallback(() => {
        setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
    
    // Cache URL bem-sucedida
    if (typeof window !== 'undefined') {
      const cacheKey = `badge_url_${code}`;
      const validUrl = badgeUrls[currentUrlIndex];
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          url: validUrl,
          timestamp: Date.now(),
          urlIndex: currentUrlIndex
        }));
      } catch (e) {
        // Ignorar erros de localStorage
              }
    }
  }, [code, badgeUrls, currentUrlIndex]);

  // Reset state quando code muda
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
    setImageLoaded(false);

    // Verificar cache ao inicializar
    if (typeof window !== 'undefined') {
      const cacheKey = `badge_url_${code}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, urlIndex } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24h
          
          if (!isExpired && urlIndex < badgeUrls.length) {
            setCurrentUrlIndex(urlIndex);
                      }
        }
      } catch (e) {
        // Cache inválido, continuar normalmente
              }
    }
  }, [code, badgeUrls.length]);

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

  const currentUrl = badgeUrls[currentUrlIndex];
  
  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded overflow-hidden`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      
      <img
        key={`${code}_${currentUrlIndex}`} // Key único para forçar re-render
        src={currentUrl}
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
