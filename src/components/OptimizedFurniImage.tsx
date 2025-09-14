
import React, { useState } from 'react';
import { Package } from 'lucide-react';

interface OptimizedFurniImageProps {
  furni: {
    id?: string;
    className?: string;
    name?: string;
    imageUrl?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OptimizedFurniImage: React.FC<OptimizedFurniImageProps> = ({
  furni,
  size = 'md',
  className = ''
}) => {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Lista de URLs em ordem de prioridade
  const imageUrls = React.useMemo(() => {
    const urls: string[] = [];
    
    // 1. URL fornecida diretamente
    if (furni.imageUrl) {
      urls.push(furni.imageUrl);
    }
    
    // 2. HabboAssets.com (melhor qualidade)
    if (furni.className) {
      urls.push(`https://www.habboassets.com/furniture/${furni.className}_icon.png`);
      urls.push(`https://www.habboassets.com/furniture/${furni.className}.png`);
    }
    
    // 3. Habbo oficial DCR
    if (furni.id) {
      urls.push(`https://images.habbo.com/dcr/hof_furni/${furni.id}/${furni.id}_icon.png`);
      urls.push(`https://images.habbo.com/dcr/hof_furni/${furni.id}/${furni.id}.png`);
    }
    
    // 4. Habbo Imaging (alternativo)
    if (furni.className) {
      urls.push(`https://www.habbo.com/habbo-imaging/furni/${furni.className}.png`);
    }
    
    // 5. Fallback final
    urls.push('/assets/gcreate_icon_credit.png');
    
    return [...new Set(urls)]; // Remove duplicatas
  }, [furni]);

  const handleImageError = () => {
        if (currentSrcIndex < imageUrls.length - 1) {
      setCurrentSrcIndex(currentSrcIndex + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
      };

  if (hasError || imageUrls.length === 0) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 flex items-center justify-center rounded border`}>
        <Package className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded border bg-gray-100`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <Package className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <img
        src={imageUrls[currentSrcIndex]}
        alt={furni.name || furni.className || 'Furniture'}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};
