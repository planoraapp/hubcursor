
import React, { useState, useCallback } from 'react';

interface OptimizedItemThumbnailProps {
  category: string;
  figureId: string;
  colorId?: string;
  itemName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onError?: () => void;
}

const OptimizedItemThumbnail: React.FC<OptimizedItemThumbnailProps> = ({
  category,
  figureId,
  colorId = '1',
  itemName,
  className = '',
  size = 'md',
  onError
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const generateThumbnailUrl = useCallback(() => {
    // Figuras base mínimas e específicas por categoria
    const categoryConfigs: Record<string, { base: string; headOnly: boolean; focus: string }> = {
      'hd': { base: 'hd-180-1', headOnly: true, focus: 'head' },
      'hr': { base: 'hd-180-1', headOnly: true, focus: 'head' },
      'ha': { base: 'hd-180-1', headOnly: true, focus: 'head' },
      'ea': { base: 'hd-180-1', headOnly: true, focus: 'head' },
      'fa': { base: 'hd-180-1', headOnly: true, focus: 'head' },
      'ch': { base: 'hd-180-1.lg-700-1', headOnly: false, focus: 'torso' },
      'cc': { base: 'hd-180-1.ch-665-1.lg-700-1', headOnly: false, focus: 'torso' },
      'lg': { base: 'hd-180-1.ch-665-1', headOnly: false, focus: 'legs' },
      'sh': { base: 'hd-180-1.ch-665-1.lg-700-1', headOnly: false, focus: 'feet' },
      'ca': { base: 'hd-180-1.ch-665-1.lg-700-1', headOnly: false, focus: 'torso' },
      'wa': { base: 'hd-180-1.ch-665-1.lg-700-1', headOnly: false, focus: 'waist' },
      'cp': { base: 'hd-180-1.ch-665-1.lg-700-1', headOnly: false, focus: 'torso' }
    };
    
    const config = categoryConfigs[category] || categoryConfigs['ch'];
    
    // Construir figura limpa
    let figure: string;
    const categoryRegex = new RegExp(`${category}-\\d+-\\d+`);
    
    if (config.base.match(categoryRegex)) {
      figure = config.base.replace(categoryRegex, `${category}-${figureId}-${colorId}`);
    } else {
      figure = `${config.base}.${category}-${figureId}-${colorId}`;
    }
    
    // Parâmetros otimizados para visualização
    const headOnly = config.headOnly ? '&headonly=1' : '';
    const direction = config.focus === 'feet' ? '&direction=4' : '&direction=2';
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=U&size=l${direction}&head_direction=3${headOnly}`;
  }, [category, figureId, colorId]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
    onError?.();
  }, [onError]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded`}>
        <span className="text-xs font-bold text-gray-600 text-center">
          {figureId}
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={generateThumbnailUrl()}
        alt={itemName}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{ 
          imageRendering: 'pixelated',
          filter: 'contrast(1.1) saturate(1.1)',
          background: 'transparent'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default OptimizedItemThumbnail;
