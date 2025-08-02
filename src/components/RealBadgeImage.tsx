
import { useState, useCallback, useEffect } from 'react';
import { AlertCircle, Shield } from 'lucide-react';

interface RealBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showFallback?: boolean;
  verified?: boolean;
}

const RealBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md',
  showFallback = true,
  verified = true
}: RealBadgeImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // URLs prioritárias APENAS para badges reais/verificados
  const realBadgeUrls = [
    // 1. HabboAssets (mais confiável, prioridade máxima)
    `https://habboassets.com/c_images/album1584/${code}.gif`,
    
    // 2. Habbo Oficial (backup principal)
    `https://images.habbo.com/c_images/album1584/${code}.gif`,
    
    // 3. HabboWidgets (backup secundário)
    `https://www.habbowidgets.com/images/badges/${code}.gif`,
    
    // 4. Habbo Imaging (último recurso)
    `https://www.habbo.com/habbo-imaging/badge/${code}.gif`
  ];

  const handleImageError = useCallback(() => {
    console.log(`⚠️ [RealBadge] Falha ao carregar ${code} da URL ${currentUrlIndex + 1}/${realBadgeUrls.length}`);
    
    if (currentUrlIndex < realBadgeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
      setImageLoaded(false);
    } else {
      console.error(`❌ [RealBadge] TODAS as URLs falharam para o badge REAL ${code}`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, realBadgeUrls.length, code]);

  const handleImageLoad = useCallback(() => {
    console.log(`✅ [RealBadge] Badge REAL ${code} carregado com sucesso da URL ${currentUrlIndex + 1}`);
    setIsLoading(false);
    setHasError(false);
    setImageLoaded(true);
    
    // Cache da URL bem-sucedida para badges reais
    if (typeof window !== 'undefined') {
      const cacheKey = `real_badge_${code}`;
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          url: realBadgeUrls[currentUrlIndex],
          timestamp: Date.now(),
          urlIndex: currentUrlIndex,
          verified: true
        }));
      } catch (e) {
        console.warn('Falha ao cachear badge real:', e);
      }
    }
  }, [code, realBadgeUrls, currentUrlIndex]);

  // Reset quando o code muda
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
    setImageLoaded(false);

    // Verificar cache para badges reais
    if (typeof window !== 'undefined') {
      const cacheKey = `real_badge_${code}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { timestamp, urlIndex, verified } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24h
          
          if (!isExpired && verified && urlIndex < realBadgeUrls.length) {
            setCurrentUrlIndex(urlIndex);
            console.log(`💾 [RealBadge] Cache hit para badge real ${code}: URL ${urlIndex + 1}`);
          }
        }
      } catch (e) {
        console.warn('Cache inválido para badge real', code, e);
      }
    }
  }, [code, realBadgeUrls.length]);

  if (hasError && !showFallback) {
    return null;
  }

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-red-50 border-2 border-red-200 rounded`}>
        <div className="text-center">
          <AlertCircle className="w-3 h-3 text-red-500 mx-auto mb-1" />
          <span className="text-xs font-bold text-red-600 leading-none">
            {code.slice(0, 3)}
          </span>
          <div className="text-xs text-red-500 mt-1">ERRO</div>
        </div>
      </div>
    );
  }

  const currentUrl = realBadgeUrls[currentUrlIndex];
  
  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded overflow-hidden`}>
      {/* Indicador de badge verificado */}
      {verified && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <Shield className="w-2 h-2 text-white" />
        </div>
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-blue-50 animate-pulse flex items-center justify-center border border-blue-200">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        </div>
      )}
      
      <img
        key={`${code}_${currentUrlIndex}`}
        src={currentUrl}
        alt={name || `Badge Real ${code}`}
        title={`${code} - ${name} (Verificado)`}
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

export default RealBadgeImage;
