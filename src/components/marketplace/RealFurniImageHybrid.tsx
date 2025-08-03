
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

  const getOptimizedImageUrls = useCallback((className: string, type: string, hotel: string) => {
    const cachedUrl = localStorage.getItem(`furni-success-${className}`);
    const urls = [];

    if (cachedUrl) {
      urls.push(cachedUrl);
    }

    const isLTD = className.toLowerCase().includes('ltd');
    const isHC = className.toLowerCase().includes('hc');
    const isRare = className.toLowerCase().includes('rare') || className.toLowerCase().includes('throne');
    const isDragon = className.toLowerCase().includes('dragon') || className.toLowerCase().includes('drago');

    // URLs especiais por tipo
    if (isLTD) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://images.habbo.com/dcr/hof_furni/LTD/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`
      );
    }

    if (isHC) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`,
        `https://images.habbo.com/dcr/hof_furni/hc/${className}.png`
      );
    }

    if (isDragon) {
      urls.push(
        `https://www.habboapi.site/images/furni/${className}.png`,
        `https://habboapi.site/images/furni/${className}.gif`,
        `https://images.habbo.com/dcr/hof_furni/rare/${className}.png`,
        `https://habbowidgets.com/images/furni/${className}.png`
      );
    }

    // URLs principais otimizadas
    urls.push(
      `https://www.habboapi.site/images/furni/${className}.png`,
      `https://www.habboapi.site/images/furni/${className}.gif`,
      `https://habboapi.site/images/furni/${className}.png`,
      `https://api.habboapi.site/furni/image/${className}`
    );
    
    const assetVersions = ['61856', '56746', '49500', '48082', '45508'];
    assetVersions.forEach(version => {
      urls.push(`https://habbofurni.com/furni_assets/${version}/${className}_icon.png`);
    });
    
    urls.push(
      `https://images.habbo.com/dcr/hof_furni/${type}/${className}.png`,
      `https://www.habbo.com/dcr/hof_furni/${type}/${className}.png`,
      `https://habbowidgets.com/images/furni/${className}.png`,
      `https://habbowidgets.com/images/furni/${className}.gif`,
      `https://www.habbowidgets.com/images/furni/${className}.png`,
      `https://habboemotion.com/images/furnis/${className}.png`,
      `https://cdn.habboemotion.com/furnis/${className}.gif`,
      `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`
    );

    return [...new Set(urls)];
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
        title={`${name} (${className}) - HabboHub Optimized`}
      />
    </div>
  );
};

export default RealFurniImageHybrid;
