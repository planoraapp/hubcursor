
import React, { useState, useCallback, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

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

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  // Configuração otimizada por categoria
  const getCategoryConfig = useMemo(() => {
    const configs: Record<string, { base: string; headOnly: boolean; direction: number; crop: string }> = {
      // Cabeça e rosto
      'hd': { 
        base: 'hd-180-1', 
        headOnly: true, 
        direction: 2, 
        crop: 'object-top' 
      },
      'hr': { 
        base: 'hd-180-1', 
        headOnly: true, 
        direction: 2, 
        crop: 'object-top' 
      },
      'ha': { 
        base: 'hd-180-1', 
        headOnly: true, 
        direction: 2, 
        crop: 'object-top' 
      },
      'ea': { 
        base: 'hd-180-1', 
        headOnly: true, 
        direction: 2, 
        crop: 'object-center' 
      },
      'fa': { 
        base: 'hd-180-1', 
        headOnly: true, 
        direction: 2, 
        crop: 'object-center' 
      },
      
      // Roupas superiores
      'ch': { 
        base: 'hd-180-1.lg-700-1', 
        headOnly: false, 
        direction: 2, 
        crop: 'object-center scale-125' 
      },
      'cc': { 
        base: 'hd-180-1.ch-665-1.lg-700-1', 
        headOnly: false, 
        direction: 2, 
        crop: 'object-center scale-125' 
      },
      'cp': { 
        base: 'hd-180-1.ch-665-1.lg-700-1', 
        headOnly: false, 
        direction: 2, 
        crop: 'object-center scale-125' 
      },
      
      // Roupas inferiores
      'lg': { 
        base: 'hd-180-1.ch-665-1', 
        headOnly: false, 
        direction: 2, 
        crop: 'object-bottom scale-150' 
      },
      'sh': { 
        base: 'hd-180-1.ch-665-1.lg-700-1', 
        headOnly: false, 
        direction: 4, 
        crop: 'object-bottom scale-200' 
      },
      
      // Acessórios
      'ca': { 
        base: 'hd-180-1.ch-665-1.lg-700-1', 
        headOnly: false, 
        direction: 2, 
        crop: 'object-center scale-125' 
      },
      'wa': { 
        base: 'hd-180-1.ch-665-1.lg-700-1', 
        headOnly: false, 
        direction: 2, 
        crop: 'object-center scale-125' 
      }
    };
    
    return configs[category] || configs['ch'];
  }, [category]);

  const generateThumbnailUrl = useCallback(() => {
    const config = getCategoryConfig;
    
    // Construir figura limpa
    let figure: string;
    const categoryRegex = new RegExp(`${category}-\\d+-[\\d\\.]+`);
    
    if (config.base.match(categoryRegex)) {
      figure = config.base.replace(categoryRegex, `${category}-${figureId}-${colorId}`);
    } else {
      figure = `${config.base}.${category}-${figureId}-${colorId}`;
    }
    
    // Parâmetros otimizados
    const headOnly = config.headOnly ? '&headonly=1' : '';
    const direction = `&direction=${config.direction}`;
    const headDirection = config.headOnly ? '&head_direction=3' : '&head_direction=2';
    
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=U&size=l${direction}${headDirection}${headOnly}&action=std&gesture=std`;
  }, [category, figureId, colorId, getCategoryConfig]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
    onError?.();
  }, [onError]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded`}>
        <div className="text-center">
          <AlertCircle className="w-3 h-3 text-gray-400 mx-auto mb-1" />
          <span className="text-[10px] font-bold text-gray-600">
            {figureId}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg bg-transparent`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={generateThumbnailUrl()}
        alt={itemName}
        className={`w-full h-full transition-all duration-300 ${getCategoryConfig.crop} ${
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
