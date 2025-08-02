
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
    // Base figures otimizadas para cada categoria
    const baseFigures: Record<string, string> = {
      'hd': 'hd-180-1', 
      'hr': 'hd-180-1.hr-828-45', 
      'ha': 'hd-180-1.hr-828-45', 
      'ea': 'hd-180-1.hr-828-45', 
      'fa': 'hd-180-1.hr-828-45', 
      'ch': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
      'cc': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
      'lg': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
      'sh': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
      'ca': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
      'wa': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1', 
      'cp': 'hd-180-1.hr-828-45.ch-665-92.lg-700-1.sh-705-1'  
    };
    
    const baseFigure = baseFigures[category] || baseFigures['ch'];
    
    // Construir figura com o item específico
    let modifiedFigure: string;
    const categoryRegex = new RegExp(`${category}-\\d+-\\d+`);
    
    if (baseFigure.match(categoryRegex)) {
      modifiedFigure = baseFigure.replace(categoryRegex, `${category}-${figureId}-${colorId}`);
    } else {
      modifiedFigure = `${baseFigure}.${category}-${figureId}-${colorId}`;
    }
    
    // Parâmetros específicos para thumbnails
    const headOnlyCategories = ['hd', 'hr', 'ha', 'ea', 'fa'];
    const headOnly = headOnlyCategories.includes(category) ? '&headonly=1' : '';
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${modifiedFigure}&gender=U&size=l&direction=2&head_direction=3${headOnly}`;
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
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded animate-pulse">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
        </div>
      )}
      <img
        src={generateThumbnailUrl()}
        alt={itemName}
        className={`w-full h-full object-contain rounded transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ imageRendering: 'pixelated' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default OptimizedItemThumbnail;
