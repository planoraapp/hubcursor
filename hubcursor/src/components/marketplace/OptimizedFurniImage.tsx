
import { useState, useCallback, useEffect, useMemo } from 'react';
import { Package2 } from 'lucide-react';

interface OptimizedFurniImageProps {
  className: string;
  name: string;
  type?: 'wallitem' | 'roomitem';
  hotel?: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

// Cache global para URLs bem-sucedidas
const imageCache = new Map<string, string>();
const failedUrls = new Set<string>();

const OptimizedFurniImage = ({ 
  className, 
  name, 
  type = 'roomitem',
  hotel = 'br',
  size = 'md',
  priority = false
}: OptimizedFurniImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  // Move generateFurniUrls BEFORE useMemo
  const generateFurniUrls = useCallback((className: string, name: string, hotel: string, type: string) => {
    if (!className) return [];
    
    const failedSet = new Set(failedUrls);
    const cached = getCachedUrl(className);
    
    // Mapear className para URLs reais de móveis do Habbo
    const urls = [
      // Cached URLs first (highest priority)
      ...(cached ? [cached] : []),
      
      // HabboAPI.site - Fonte primária mais confiável
      `https://habboapi.site/images/furni/${className}.png`,
      `https://habboapi.site/images/furni/${className}.gif`,
      `https://www.habboapi.site/images/furni/${className}.png`,
      
      // HabboFurni - Boa cobertura
      `https://habbofurni.com/images/furni/${className}.png`,
      `https://habbofurni.com/images/furni/${className}.gif`,
      `https://habbofurni.com/avatars/${className}.png`,
      
      // HabboWidgets - Recursos diversificados
      `https://resources.habbowidgets.com/furnidata/${className}.gif`,
      `https://resources.habbowidgets.com/furnidata/${className}.png`,
      `https://resources.habbowidgets.com/furniture/${className}.png`,
      
      // Habbo Oficial - Domínios oficiais
      `https://images.habbo.com/c_images/catalogue/${className}.png`,
      `https://images.habbo.com/c_images/catalogue/${className}.gif`,
      `https://images.habbo.com/c_images/items/${className}.png`,
      `https://images.habbo.com/dcr/hof_furni/icons/${className}_icon.png`,
      
      // Room item icons oficiais
      `https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=${className}`,
      `https://www.habbo.es/habbo-imaging/roomitemicon?classname=${className}`,
      `https://www.habbo.com/habbo-imaging/roomitemicon?classname=${className}`,
      
      // HabboEmotion (funciona para alguns mobis)
      `https://habboemotion.com/resources/c_images/catalogue/${className}.png`,
      `https://habboemotion.com/resources/items/${className}.png`,
      
      // Outras fontes confiáveis
      `https://habbo-stories.s3.amazonaws.com/furni_icons/${className}.png`,
      `https://raw.githubusercontent.com/habbo-hotel/assets/main/furni/${className}.png`,
      
      // Fallbacks para patterns específicos
      ...(className.includes('hc_') ? [
        `https://images.habbo.com/c_images/catalogue/hc_${className.replace('hc_', '')}.png`,
        `https://habboapi.site/images/furni/hc_${className.replace('hc_', '')}.png`
      ] : []),
      
      ...(className.includes('rare_') ? [
        `https://images.habbo.com/c_images/catalogue/rare_${className.replace('rare_', '')}.png`,
        `https://habboapi.site/images/furni/rare_${className.replace('rare_', '')}.png`
      ] : []),
      
      ...(className.includes('ltd_') ? [
        `https://images.habbo.com/c_images/catalogue/ltd_${className.replace('ltd_', '')}.png`,
        `https://habboapi.site/images/furni/ltd_${className.replace('ltd_', '')}.png`
      ] : [])
    ];
    
    // Filter out failed URLs and remove duplicates
    const uniqueUrls = [...new Set(urls.filter(url => url && !failedSet.has(url)))];
    console.log(`🖼️ [OptimizedFurniImage] Generated ${uniqueUrls.length} URLs for ${className}`);
    
    return uniqueUrls;
  }, []);

  // Função auxiliar para cache
  const getCachedUrl = (className: string): string | undefined => {
    const cacheKey = `${className}_${hotel}`;
    return imageCache.get(cacheKey);
  };

  // Gerar URLs otimizadas com cache - NOW generateFurniUrls is defined
  const imageUrls = useMemo(() => {
    const cacheKey = `${className}_${hotel}`;
    
    // Se já temos uma URL em cache que funciona, usar primeiro
    if (imageCache.has(cacheKey)) {
      const cachedUrl = imageCache.get(cacheKey)!;
      return [cachedUrl, ...generateFurniUrls(className, name, hotel, type)].filter(url => url !== cachedUrl);
    }
    
    return generateFurniUrls(className, name, hotel, type);
  }, [className, name, hotel, type, generateFurniUrls]);

  const handleImageError = useCallback(() => {
    const currentUrl = imageUrls[currentUrlIndex];
    console.log(`❌ [OptimizedFurniImage] Failed: ${currentUrl} (${className})`);
    
    // Marcar URL como falha
    failedUrls.add(currentUrl);
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
      console.log(`💥 [OptimizedFurniImage] All URLs failed for ${className}`);
    }
  }, [currentUrlIndex, imageUrls, className]);

  const handleImageLoad = useCallback(() => {
    const successUrl = imageUrls[currentUrlIndex];
    console.log(`✅ [OptimizedFurniImage] Loaded: ${successUrl} (${className})`);
    
    setIsLoading(false);
    setHasError(false);
    
    // Cache da URL bem-sucedida
    const cacheKey = `${className}_${hotel}`;
    imageCache.set(cacheKey, successUrl);
    
    // Salvar no localStorage para persistência
    try {
      const cache = JSON.parse(localStorage.getItem('furni-image-cache') || '{}');
      cache[cacheKey] = successUrl;
      localStorage.setItem('furni-image-cache', JSON.stringify(cache));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }, [currentUrlIndex, imageUrls, className, hotel]);

  // Carregar cache do localStorage na inicialização
  useEffect(() => {
    try {
      const cache = JSON.parse(localStorage.getItem('furni-image-cache') || '{}');
      Object.entries(cache).forEach(([key, url]) => {
        if (typeof url === 'string') {
          imageCache.set(key, url);
        }
      });
    } catch (error) {
      console.warn('Cache read error:', error);
    }
  }, []);

  // Reset quando className mudar
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [className]);

  if (hasError || imageUrls.length === 0) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center`}>
        <Package2 size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-gray-50 border-2 border-gray-300 rounded overflow-hidden flex items-center justify-center relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded"></div>
      )}
      <img
        src={imageUrls[currentUrlIndex]}
        alt={name}
        className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ imageRendering: 'pixelated' }}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
};

export default OptimizedFurniImage;
