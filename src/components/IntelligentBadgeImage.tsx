
import { useState, useCallback, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface IntelligentBadgeImageProps {
  code: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  transparent?: boolean;
}

const IntelligentBadgeImage = ({ 
  code, 
  name, 
  className = '', 
  size = 'md', 
  transparent = false 
}: IntelligentBadgeImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);

  // Cache inteligente no localStorage
  const getCacheKey = (badgeCode: string) => `habbo_badge_${badgeCode}_url`;
  
  // 15+ URLs de fallback para máxima chance de sucesso
  const generateMegaImageUrls = useCallback((badgeCode: string) => {
    const urls = [
      // URLs primárias - HabboWidgets
      `https://www.habbowidgets.com/images/badges/${badgeCode}.gif`,
      `https://habbowidgets.com/images/badges/${badgeCode}.gif`,
      
      // URLs oficiais Habbo
      `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
      `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}.gif`,
      `https://habbo.com.br/habbo-imaging/badge/${badgeCode}.gif`,
      `https://habbo.com/habbo-imaging/badge/${badgeCode}.gif`,
      `https://www.habbo.com/habbo-imaging/badge/${badgeCode}.gif`,
      `https://images.habbo.com/album1584/${badgeCode}.gif`,
      `https://images.habbo.com/web_images/badges/${badgeCode}.gif`,
      
      // URLs HabboEmotion
      `https://habboemotion.com/images/badges/${badgeCode}.gif`,
      `https://cdn.habboemotion.com/badges/${badgeCode}.gif`,
      `https://api.habboemotion.com/badges/${badgeCode}.gif`,
      
      // URLs alternativas e CDNs
      `https://habblet-production.s3.amazonaws.com/badges/${badgeCode}.gif`,
      `https://cdn.jsdelivr.net/gh/santaclauz/habbo-badges/${badgeCode}.gif`,
      `https://raw.githubusercontent.com/habbo-hotel/badges/main/${badgeCode}.gif`,
      
      // Formatos PNG como backup
      `https://www.habbowidgets.com/images/badges/${badgeCode}.png`,
      `https://habbowidgets.com/images/badges/${badgeCode}.png`,
      `https://images.habbo.com/c_images/album1584/${badgeCode}.png`,
      `https://habboemotion.com/images/badges/${badgeCode}.png`,
      
      // URLs de cache/proxy
      `https://habbo-cache.vercel.app/badges/${badgeCode}.gif`,
      `https://habbo-proxy.herokuapp.com/badges/${badgeCode}.gif`
    ];
    
    return urls;
  }, []);

  const imageUrls = generateMegaImageUrls(code);

  // Verificar cache ao montar
  useEffect(() => {
    const cacheKey = getCacheKey(code);
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { url, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 horas
      
      if (!isExpired && url) {
        setCachedUrl(url);
        setIsLoading(false);
        setHasError(false);
        return;
      }
    }
    
    // Se não tem cache válido, começar do primeiro URL
    setCurrentUrlIndex(0);
  }, [code]);

  const handleImageError = useCallback(() => {
    console.log(`❌ Badge image failed: ${imageUrls[currentUrlIndex]} (${code})`);
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log(`💥 All ${imageUrls.length} badge URLs failed for ${code}`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, imageUrls, code]);

  const handleImageLoad = useCallback(() => {
    const successUrl = imageUrls[currentUrlIndex];
    console.log(`✅ Badge image loaded: ${successUrl} (${code})`);
    
    // Salvar URL bem-sucedida no cache
    const cacheKey = getCacheKey(code);
    localStorage.setItem(cacheKey, JSON.stringify({
      url: successUrl,
      timestamp: Date.now()
    }));
    
    setIsLoading(false);
    setHasError(false);
  }, [currentUrlIndex, imageUrls, code]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center ${transparent ? 'bg-transparent' : 'bg-gray-100'} rounded border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {code.slice(0, 4)}
          </span>
        </div>
      </div>
    );
  }

  const imageUrl = cachedUrl || imageUrls[currentUrlIndex];

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && !cachedUrl && (
        <div className={`absolute inset-0 ${transparent ? 'bg-transparent' : 'bg-gray-100'} rounded animate-pulse flex items-center justify-center`}>
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      <img 
        key={`${code}_${currentUrlIndex}_${cachedUrl ? 'cached' : 'fresh'}`}
        src={imageUrl}
        alt={name}
        className={`w-full h-full object-contain rounded ${
          isLoading && !cachedUrl ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300 ${transparent ? 'bg-transparent' : ''}`}
        style={{ 
          imageRendering: 'pixelated',
          backgroundColor: transparent ? 'transparent' : undefined
        }}
        onError={cachedUrl ? undefined : handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default IntelligentBadgeImage;
