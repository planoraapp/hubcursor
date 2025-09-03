
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

// URLs prioritárias para badges - organizadas por confiabilidade
const getBadgeUrls = (code: string): string[] => [
  // HabboAssets (mais confiável para badges existentes)
  `https://habboassets.com/c_images/album1584/${code}.gif`,
  // Habbo Oficial
  `https://images.habbo.com/c_images/album1584/${code}.gif`,
  // Storage do Supabase (nosso backup)
  `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${code}.gif`,
  // Habbo Widgets
  `https://www.habbowidgets.com/images/badges/${code}.gif`,
  // Habbo oficial alternativo
  `https://www.habbo.com/habbo-imaging/badge/${code}.gif`
];

// Cache global mais inteligente
const imageCache = new Map<string, { 
  url: string | null; 
  loaded: boolean; 
  error: boolean; 
  timestamp: number;
}>();

// Cache TTL de 1 hora
const CACHE_TTL = 60 * 60 * 1000;

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
    const now = Date.now();
    
    // Verificar se o cache é válido
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      if (cached.loaded && !cached.error && cached.url) {
        setCurrentUrl(cached.url);
        setIsLoading(false);
        setHasError(false);
        return;
      } else if (cached.error) {
        setHasError(true);
        setIsLoading(false);
        return;
      }
    }

    // Iniciar carregamento
    loadNextUrl();
  }, [code]);

  const testImageUrl = useCallback(async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onload = null;
        img.onerror = null;
        resolve(false);
      }, 3000); // 3 segundos timeout

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  }, []);

  const loadNextUrl = useCallback(async () => {
    if (urlIndex >= urls.length) {
      // Todos os URLs falharam
      setHasError(true);
      setIsLoading(false);
      imageCache.set(cacheKey, { 
        url: null, 
        loaded: false, 
        error: true, 
        timestamp: Date.now() 
      });
      return;
    }

    const url = urls[urlIndex];
    const success = await testImageUrl(url);

    if (success) {
      setCurrentUrl(url);
      setIsLoading(false);
      setHasError(false);
      imageCache.set(cacheKey, { 
        url, 
        loaded: true, 
        error: false, 
        timestamp: Date.now() 
      });
    } else {
      setUrlIndex(prev => prev + 1);
    }
  }, [urlIndex, urls, code, cacheKey, testImageUrl]);

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
        <div className="w-1/2 h-1/2 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  if (hasError || !currentUrl) {
    if (!showFallback) return null;
    
    return (
      <div 
        className={`${sizeClass} ${className} bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300 flex items-center justify-center`}
        title={`${code} - Badge não disponível`}
      >
        <div className="text-center">
          <Award 
            className="w-1/3 h-1/3 text-gray-400 mx-auto mb-1"
            strokeWidth={1.5}
          />
          <span className="text-xs font-bold text-gray-600 block">
            {code.slice(0, 4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={`Badge ${code} - ${name}`}
      title={`${code} - ${name}`}
      className={`${sizeClass} ${className} object-contain rounded`}
      loading={priority ? 'eager' : 'lazy'}
      style={{ imageRendering: 'pixelated' }}
      onError={() => {
        // Se a imagem falhar após ser carregada, tentar próxima
        setUrlIndex(prev => prev + 1);
        setCurrentUrl(null);
      }}
    />
  );
};
