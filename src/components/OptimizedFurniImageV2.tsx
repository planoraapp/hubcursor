import { useState, useEffect } from 'react';

interface OptimizedFurniImageV2Props {
  id: string;
  name?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const OptimizedFurniImageV2 = ({ 
  id, 
  name = '', 
  className = '',
  size = 'small'
}: OptimizedFurniImageV2Props) => {
  const [imageError, setImageError] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Prioritized URLs: Supabase bucket first, then fallbacks
  const getFurniUrls = (furniId: string) => [
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${furniId}.png`,
    `https://habbowidgets.com/habbo_imaging/furni/${furniId}.png`,
    `https://www.habbo.com/habbo-imaging/furni/${furniId}.png`,
    `https://images.habbo.com/habbo-imaging/furni/${furniId}.png`,
    `https://habboassets.com/furniture/icons/${furniId}.png`
  ];

  const furniUrls = getFurniUrls(id);
  const currentUrl = furniUrls[currentUrlIndex];

  const handleImageError = () => {
    if (currentUrlIndex < furniUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  // Reset when id changes
  useEffect(() => {
    setImageError(false);
    setCurrentUrlIndex(0);
    setIsLoading(true);
  }, [id]);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12', 
    large: 'w-16 h-16'
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center text-xs text-gray-400 ${sizeClasses[size]} ${className}`}>
        <span className="text-[8px]">?</span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      <img
        src={currentUrl}
        alt={name || `Furni ${id}`}
        className="w-full h-full object-contain"
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default OptimizedFurniImageV2;