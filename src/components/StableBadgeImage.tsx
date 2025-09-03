
import { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

interface StableBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const StableBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md' 
}: StableBadgeImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  // Cache key para localStorage
  const getCacheKey = (badgeCode: string) => `stable_badge_${badgeCode}`;

  // URLs organizadas por prioridade e estabilidade
  const getBadgeUrls = useCallback((badgeCode: string) => [
    // Storage do Supabase (mais estável)
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-badges/${badgeCode}.gif`,
    
    // HabboWidgets (alternativa confiável)
    `https://www.habbowidgets.com/images/badges/${badgeCode}.gif`,
    
    // Habbo oficial
    `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
    `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}.gif`,
    
    // Fallbacks adicionais
    `https://habboassets.com/c_images/album1584/${badgeCode}.gif`,
    `https://habboemotion.com/images/badges/${badgeCode}.gif`
  ], []);

  const loadBadgeImage = useCallback(async () => {
    const cacheKey = getCacheKey(code);
    const cached = localStorage.getItem(cacheKey);
    
    // Verificar cache válido (24h)
    if (cached) {
      const { url, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
      
      if (!isExpired) {
        setImageUrl(url);
        setIsLoading(false);
        setHasError(false);
        return;
      }
    }

    // Buscar nova imagem
    const urls = getBadgeUrls(code);
    
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
          // Cache a URL bem-sucedida
          localStorage.setItem(cacheKey, JSON.stringify({
            url,
            timestamp: Date.now()
          }));
          
          setImageUrl(url);
          setIsLoading(false);
          setHasError(false);
          return;
        }
      } catch (error) {
        // Continuar para próxima URL
        continue;
      }
    }
    
    // Se todas as URLs falharam
    setHasError(true);
    setIsLoading(false);
  }, [code, getBadgeUrls]);

  useEffect(() => {
    loadBadgeImage();
  }, [loadBadgeImage]);

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded`}>
        <div className="text-center">
          <AlertCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600">
            {code.slice(0, 4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name || code}
          className={`w-full h-full object-contain rounded transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ imageRendering: 'pixelated' }}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default StableBadgeImage;
