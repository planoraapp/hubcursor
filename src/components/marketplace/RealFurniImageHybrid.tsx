
import { useState, useCallback, useMemo } from 'react';
import { Package2 } from 'lucide-react';

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

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  // URLs otimizadas com foco em tipos específicos
  const imageUrls = useMemo(() => {
    const baseUrls = [];
    
    // Priorizar URLs baseadas no tipo e características do item
    const isLTD = name.toLowerCase().includes('ltd') || className.toLowerCase().includes('ltd');
    const isHC = name.toLowerCase().includes('hc') || className.toLowerCase().includes('hc_');
    const isRare = name.toLowerCase().includes('rare') || name.toLowerCase().includes('throne') || name.toLowerCase().includes('dragon');
    
    // URLs específicas para itens especiais
    if (isLTD) {
      baseUrls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel}/dcr/hof_furni/${className}.png`
      );
    }
    
    if (isHC) {
      baseUrls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel}/dcr/hof_furni/${className}.png`
      );
    }
    
    if (isRare) {
      baseUrls.push(
        `https://images.habbo.com/dcr/hof_furni/${hotel}/${className}.png`,
        `https://www.habbo.${hotel}/dcr/hof_furni/${className}.png`,
        `https://images.habbo.com/dcr/hof_furni/${className}.png`
      );
    }

    // URLs padrão do Habbo
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

    baseUrls.push(
      `https://images.habbo.com/dcr/hof_furni/${mappedHotel}/${className}.png`,
      `https://www.habbo.${mappedHotel}/dcr/hof_furni/${className}.png`,
      `https://images.habbo.com/dcr/hof_furni/${className}.png`,
      `https://habbo-stories.s3.amazonaws.com/web_promo/lpromo_${className}.png`,
      `https://www.habbo.com/dcr/hof_furni/${className}.png`
    );

    return baseUrls;
  }, [className, hotel, name]);

  const handleImageError = useCallback(() => {
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      setHasError(true);
    }
  }, [currentUrlIndex, imageUrls.length]);

  const handleImageLoad = useCallback(() => {
    setHasError(false);
  }, []);

  if (hasError || imageUrls.length === 0) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 border-2 border-gray-300 rounded flex items-center justify-center`}>
        <Package2 size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} bg-gray-50 border-2 border-gray-300 rounded overflow-hidden flex items-center justify-center`}>
      <img
        src={imageUrls[currentUrlIndex]}
        alt={name}
        className="max-w-full max-h-full object-contain"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
};

export default RealFurniImageHybrid;
