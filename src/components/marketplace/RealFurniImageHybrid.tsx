
import { useState, useCallback } from 'react';
import { Package } from 'lucide-react';

interface RealFurniImageHybridProps {
  className: string;
  name: string;
  type?: 'roomitem' | 'wallitem';
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
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // URLs otimizadas com cache inteligente
  const getOptimizedImageUrls = useCallback((className: string, type: string, hotel: string) => {
    // Verificar cache local primeiro
    const cachedUrl = localStorage.getItem(`furni-success-${className}`);
    const urls = [];

    // Se temos uma URL cached que funcionou, usar primeiro
    if (cachedUrl) {
      urls.push(cachedUrl);
    }

    // Detectar tipo de item especial
    const isLTD = className.toLowerCase().includes('ltd');
    const isHC = className.toLowerCase().includes('hc');
    const isRare = className.toLowerCase().includes('rare') || className.toLowerCase().includes('throne');

    // URLs específicas para LTDs
    if (isLTD) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://images.habbo.com/dcr/hof_furni/LTD/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`
      );
    }

    // URLs específicas para HC
    if (isHC) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`,
        `https://images.habbo.com/dcr/hof_furni/hc/${className}.png`
      );
    }

    // URLs específicas para raros
    if (isRare) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://images.habbo.com/dcr/hof_furni/rare/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`
      );
    }

    // HabboAPI.site URLs (prioritário)
    urls.push(
      `https://www.habboapi.site/images/furni/${className}.png`,
      `https://www.habboapi.site/images/furni/${className}.gif`,
      `https://habboapi.site/images/furni/${className}.png`,
      `https://api.habboapi.site/furni/image/${className}`
    );
    
    // HabboFurni.com (múltiplas versões de assets)
    const assetVersions = ['61856', '56746', '49500', '48082', '45508'];
    assetVersions.forEach(version => {
      urls.push(`https://habbofurni.com/furni_assets/${version}/${className}_icon.png`);
    });
    
    // URLs oficiais do Habbo
    urls.push(
      `https://images.habbo.com/dcr/hof_furni/${type}/${className}.png`,
      `https://www.habbo.com/dcr/hof_furni/${type}/${className}.png`
    );
    
    // HabboWidgets (backup confiável)
    urls.push(
      `https://habbowidgets.com/images/furni/${className}.png`,
      `https://habbowidgets.com/images/furni/${className}.gif`,
      `https://www.habbowidgets.com/images/furni/${className}.png`
    );
    
    // Outras alternativas
    urls.push(
      `https://habboemotion.com/images/furnis/${className}.png`,
      `https://cdn.habboemotion.com/furnis/${className}.gif`
    );
    
    // URLs hotel-específicas
    urls.push(
      `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`
    );

    // Storage como último recurso
    urls.push(
      `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${className}.png`,
      `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/${className}.png`
    );

    return [...new Set(urls)]; // Remove duplicates
  }, []);

  const imageUrls = getOptimizedImageUrls(className, type, hotel);
  const currentUrl = imageUrls[currentImageIndex];

  const handleImageError = useCallback(() => {
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      setImageError(true);
    }
  }, [currentImageIndex, imageUrls.length]);

  const handleImageLoad = useCallback(() => {
    // Cache URL que funcionou
    localStorage.setItem(`furni-success-${className}`, currentUrl);
  }, [currentUrl, className]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (imageError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded ${sizeClasses[size]} border border-gray-200 shadow-sm`}>
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded border border-gray-100 shadow-sm overflow-hidden`}>
      <img
        src={currentUrl}
        alt={name}
        className="object-contain max-w-full max-h-full transition-opacity duration-200"
        style={{ 
          imageRendering: 'pixelated'
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        title={`${name} (${className}) - Otimizado HabboHub`}
      />
    </div>
  );
};

export default RealFurniImageHybrid;
