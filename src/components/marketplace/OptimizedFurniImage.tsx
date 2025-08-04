
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
    const urls: string[] = [];
    
    // Múltiplas fontes primárias para maior cobertura
    urls.push(
      // HabboFurni
      `https://habbofurni.com/furniture_images/${className}.png`,
      `https://habbofurni.com/images/furniture/${className}.png`,
      
      // Habbo oficial
      `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
      `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/dcr/hof_furni/${className}.png`,
      
      // HabboWidgets como backup rápido
      `https://www.habbowidgets.com/images/furni/${className}.gif`,
      `https://habbowidgets.com/images/furni/${className}.png`
    );

    // Detectar características especiais
    const isLTD = name.toLowerCase().includes('ltd') || className.toLowerCase().includes('ltd');
    const isHC = name.toLowerCase().includes('hc') || className.toLowerCase().includes('hc_');
    const isRare = name.toLowerCase().includes('rare') || name.toLowerCase().includes('throne');
    
    // URLs específicas para itens especiais
    if (isLTD || isHC || isRare) {
      urls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/dcr/hof_furni/${className}.png`
      );
    }

    // HabboWidgets como backup
    urls.push(
      `https://www.habbowidgets.com/images/furni/${className}.gif`,
      `https://habbowidgets.com/images/furni/${className}.gif`
    );

    // URLs padrão do Habbo
    const hotelMapping: Record<string, string> = {
      'br': 'com.br',
      'com': 'com',
      'es': 'es',
      'fr': 'fr',
      'de': 'de'
    };

    const mappedHotel = hotelMapping[hotel] || hotel;
    urls.push(
      `https://images.habbo.com/dcr/hof_furni/${mappedHotel}/${className}.png`,
      `https://www.habbo.${mappedHotel}/dcr/hof_furni/${className}.png`
    );

    // Remover URLs que já falharam e duplicatas
    return [...new Set(urls)].filter(url => !failedUrls.has(url));
  }, []);

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
