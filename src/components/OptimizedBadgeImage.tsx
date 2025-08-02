
import React, { useState, useCallback, useEffect } from 'react';
import { Award } from 'lucide-react';

interface OptimizedBadgeImageProps {
  code: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
  priority?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

// URLs prioritárias para badges
const getBadgeUrls = (code: string): string[] => [
  `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${code}.gif`,
  `https://habboassets.com/c_images/album1584/${code}.gif`,
  `https://images.habbo.com/c_images/album1584/${code}.gif`,
  `https://habboo-a.akamaihd.net/c_images/album1584/${code}.gif`,
  `https://www.habbo.com/habbo-imaging/badge/${code}.gif`
];

// Cache de imagens carregadas
const imageCache = new Map<string, { url: string; loaded: boolean; error: boolean }>();

export const OptimizedBadgeImage: React.FC<OptimizedBadgeImageProps> = ({
  code,
  name,
  size = 'md',
  className = '',
  showFallback = true,
  priority = false
}) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [urlIndex, setUrlIndex] = useState(0);

  const urls = getBadgeUrls(code);
  const cacheKey = code;

  // Verificar cache primeiro
  useEffect(() => {
    const cached = imageCache.get(cacheKey);
    if (cached?.loaded && !cached.error) {
      setCurrentUrl(cached.url);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    // Se não está no cache ou teve erro, começar o carregamento
    loadNextUrl();
  }, [code]);

  const loadNextUrl = useCallback(() => {
    if (urlIndex >= urls.length) {
      // Todos os URLs falharam
      setHasError(true);
      setIsLoading(false);
      imageCache.set(cacheKey, { url: '', loaded: false, error: true });
      console.warn(`❌ Failed to load badge ${code} from all ${urls.length} URLs`);
      return;
    }

    const url = urls[urlIndex];
    const img = new Image();

    const handleLoad = () => {
      setCurrentUrl(url);
      setIsLoading(false);
      setHasError(false);
      imageCache.set(cacheKey, { url, loaded: true, error: false });
      console.log(`✅ Successfully loaded badge ${code} from URL ${urlIndex + 1}/${urls.length}`);
    };

    const handleError = () => {
      console.warn(`❌ Failed to load badge ${code} from URL ${urlIndex + 1}/${urls.length}`);
      setUrlIndex(prev => prev + 1);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = url;

    // Timeout para URLs lentos
    setTimeout(() => {
      if (!img.complete) {
        img.onload = null;
        img.onerror = null;
        handleError();
      }
    }, 5000);
  }, [urlIndex, urls, code, cacheKey]);

  // Tentar próximo URL quando urlIndex muda
  useEffect(() => {
    if (urlIndex > 0 && urlIndex < urls.length && !currentUrl) {
      loadNextUrl();
    }
  }, [urlIndex, currentUrl, loadNextUrl]);

  const sizeClass = sizeClasses[size];

  if (isLoading) {
    return (
      <div className={`${sizeClass} ${className} bg-gray-200 animate-pulse rounded flex items-center justify-center`}>
        <div className="w-1/2 h-1/2 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (hasError || !currentUrl) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`${sizeClass} ${className} bg-gradient-to-br from-gray-100 to-gray-200 rounded border-2 border-gray-300 flex items-center justify-center`}
        title={`${code} - Imagem não disponível`}
      >
        <Award 
          className="w-1/2 h-1/2 text-gray-400"
          strokeWidth={1.5}
        />
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={`Badge ${code} - ${name}`}
      title={`${code} - ${name}`}
      className={`${sizeClass} ${className} object-contain`}
      loading={priority ? 'eager' : 'lazy'}
      onError={() => {
        // Se a imagem falhar após ser carregada, tentar próxima
        console.warn(`❌ Image error after load for badge ${code}`);
        setUrlIndex(prev => prev + 1);
        setCurrentUrl(null);
      }}
    />
  );
};
