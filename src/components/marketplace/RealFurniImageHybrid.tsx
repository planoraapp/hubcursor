
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Package2 } from 'lucide-react';
import { useHabboFurniApi } from '@/hooks/useHabboFurniApi';

interface RealFurniImageHybridProps {
  className: string;
  name: string;
  type?: 'wallitem' | 'roomitem';
  hotel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RealFurniImageHybrid = ({ 
  className, 
  name, 
  type = 'roomitem',
  hotel = 'br',
  size = 'md'
}: RealFurniImageHybridProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [habboFurniImageUrl, setHabboFurniImageUrl] = useState<string | null>(null);

  const { findItemByClassName } = useHabboFurniApi({ autoFetch: false });

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  // Cache de URLs bem-sucedidas
  const getCachedUrl = (className: string) => {
    try {
      const cache = localStorage.getItem('furni-image-cache');
      if (cache) {
        const parsed = JSON.parse(cache);
        return parsed[className];
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }
    return null;
  };

  const setCachedUrl = (className: string, url: string) => {
    try {
      const cache = localStorage.getItem('furni-image-cache');
      const parsed = cache ? JSON.parse(cache) : {};
      parsed[className] = url;
      localStorage.setItem('furni-image-cache', JSON.stringify(parsed));
    } catch (error) {
      console.error('Cache write error:', error);
    }
  };

  // Fetch HabboFurni image URL
  useEffect(() => {
    const fetchHabboFurniImage = async () => {
      try {
        const item = await findItemByClassName(className);
        if (item?.imageUrl) {
          setHabboFurniImageUrl(item.imageUrl);
          console.log(`🎯 [RealFurniImage] Found HabboFurni image for ${className}:`, item.imageUrl);
        }
      } catch (error) {
        console.error(`❌ [RealFurniImage] Error fetching HabboFurni image for ${className}:`, error);
      }
    };

    if (className) {
      fetchHabboFurniImage();
    }
  }, [className, findItemByClassName]);

  // URLs otimizadas com HabboFurni como prioridade
  const imageUrls = useMemo(() => {
    const cachedUrl = getCachedUrl(className);
    const urls = [];
    
    // Se temos URL em cache, usar primeiro
    if (cachedUrl) {
      urls.push(cachedUrl);
    }

    // HabboFurni.com como fonte primária (da API)
    if (habboFurniImageUrl) {
      urls.push(habboFurniImageUrl);
    }

    // HabboFurni.com URLs estáticas como backup
    urls.push(
      `https://habbofurni.com/furniture_images/${className}.png`,
      `https://habbofurni.com/images/furniture/${className}.png`,
      `https://cdn.habbofurni.com/furniture/${className}.png`
    );

    // Características especiais do item
    const isLTD = name.toLowerCase().includes('ltd') || className.toLowerCase().includes('ltd');
    const isHC = name.toLowerCase().includes('hc') || className.toLowerCase().includes('hc_');
    const isRare = name.toLowerCase().includes('rare') || name.toLowerCase().includes('throne') || name.toLowerCase().includes('dragon');
    
    // URLs específicas para itens especiais
    if (isLTD) {
      urls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel}/dcr/hof_furni/${className}.png`
      );
    }
    
    if (isHC) {
      urls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel}/dcr/hof_furni/${className}.png`
      );
    }
    
    if (isRare) {
      urls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel}/dcr/hof_furni/${className}.png`,
        `https://images.habbo.com/dcr/hof_furni/${className}.png`
      );
    }

    // URLs padrão do Habbo como fallback
    const hotelMapping: Record<string, string> = {
      'br': 'com.br',
      'com': 'com',
      'es': 'es',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'nl': 'nl',
      'fi': 'fi',
      'tr': 'com.tr'
    };

    const mappedHotel = hotelMapping[hotel] || hotel;

    urls.push(
      `https://images.habbo.com/dcr/hof_furni/${mappedHotel}/${className}.png`,
      `https://www.habbo.${mappedHotel}/dcr/hof_furni/${className}.png`,
      `https://images.habbo.com/dcr/hof_furni/${className}.png`,
      `https://habbo-stories.s3.amazonaws.com/web_promo/lpromo_${className}.png`,
      `https://www.habbo.com/dcr/hof_furni/${className}.png`,
      `https://habbowidgets.com/images/furni/${className}.gif`
    );

    // Remover duplicatas
    return [...new Set(urls)];
  }, [className, hotel, name, habboFurniImageUrl]);

  const handleImageError = useCallback(() => {
    console.log(`❌ [RealFurniImage] Image failed: ${imageUrls[currentUrlIndex]} (${className})`);
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
      console.log(`❌ [RealFurniImage] All URLs failed for ${className}`);
    }
  }, [currentUrlIndex, imageUrls.length, className]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    
    const successUrl = imageUrls[currentUrlIndex];
    console.log(`✅ [RealFurniImage] Image loaded: ${successUrl} (${className})`);
    
    // Cache da URL bem-sucedida (apenas se não for a primeira que já estava em cache)
    if (currentUrlIndex > 0 || !getCachedUrl(className)) {
      setCachedUrl(className, successUrl);
    }
  }, [currentUrlIndex, imageUrls, className]);

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
        loading="lazy"
      />
    </div>
  );
};

export default RealFurniImageHybrid;
