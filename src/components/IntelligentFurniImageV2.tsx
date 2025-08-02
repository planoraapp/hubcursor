
import { useState, useCallback, useEffect } from 'react';
import { Package } from 'lucide-react';

interface IntelligentFurniImageV2Props {
  swfName: string;
  name: string;
  originalUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const IntelligentFurniImageV2 = ({ 
  swfName, 
  name, 
  originalUrl,
  className = '', 
  size = 'md' 
}: IntelligentFurniImageV2Props) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const generateFurniUrls = useCallback((swf: string, original?: string) => {
    const urls = [];
    
    // 1. URL original se fornecida
    if (original && original.includes('http')) {
      urls.push(original);
    }
    
    // 2. HabboWidgets (mais confiável para furnis)
    urls.push(
      `https://www.habbowidgets.com/images/furni/${swf}.gif`,
      `https://habbowidgets.com/images/furni/${swf}.gif`,
      `https://www.habbowidgets.com/images/${swf}.gif`
    );
    
    // 3. HabboEmotion
    urls.push(
      `https://habboemotion.com/images/furnis/${swf}.png`,
      `https://cdn.habboemotion.com/furnis/${swf}.gif`
    );
    
    // 4. Habbo Oficial
    urls.push(
      `https://images.habbo.com/dcr/hof_furni/${swf}.png`,
      `https://www.habbo.com.br/habbo-imaging/furni/${swf}.png`
    );
    
    return [...new Set(urls)];
  }, []);

  const furniUrls = generateFurniUrls(swfName, originalUrl);

  const handleImageError = useCallback(() => {
    if (currentUrlIndex < furniUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, furniUrls.length]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [swfName]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded border-2 border-dashed border-gray-300 ${className}`}>
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded animate-pulse"></div>
      )}
      <img 
        key={`${swfName}_${currentUrlIndex}`}
        src={furniUrls[currentUrlIndex]}
        alt={name}
        className={`w-full h-full object-contain rounded pixelated ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default IntelligentFurniImageV2;
