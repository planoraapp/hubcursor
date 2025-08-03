
import { useState } from 'react';
import { Package } from 'lucide-react';

interface RealFurniImageProps {
  className: string;
  name: string;
  type?: 'roomitem' | 'wallitem';
  hotel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const RealFurniImage = ({ 
  className, 
  name, 
  type = 'roomitem', 
  hotel = 'br',
  size = 'md' 
}: RealFurniImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Real Habbo image sources in priority order
  const getImageUrls = (className: string, type: string, hotel: string) => [
    // Official DCR images (most reliable)
    `https://images.habbo.com/dcr/hof_furni/${type}/${className}.png`,
    // Hotel-specific imaging
    `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`,
    // Alternative sources
    `https://habbowidgets.com/images/furni/${className}.gif`,
    `https://habboemotion.com/images/furnis/${className}.png`,
    // Supabase storage as fallback
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${className}.png`
  ];

  const imageUrls = getImageUrls(className, type, hotel);
  const currentUrl = imageUrls[currentImageIndex];

  const handleImageError = () => {
    console.log(`❌ [RealFurniImage] Failed to load: ${currentUrl}`);
    
    if (currentImageIndex < imageUrls.length - 1) {
      console.log(`🔄 [RealFurniImage] Trying next URL for ${className}`);
      setCurrentImageIndex(prev => prev + 1);
    } else {
      console.log(`❌ [RealFurniImage] All URLs failed for ${className}`);
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ [RealFurniImage] Successfully loaded: ${currentUrl}`);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center rounded ${sizeClasses[size]}`}>
        <Package className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={currentUrl}
      alt={name}
      className={`object-contain ${sizeClasses[size]}`}
      onError={handleImageError}
      onLoad={handleImageLoad}
      loading="lazy"
      title={`${name} (${className})`}
    />
  );
};

export default RealFurniImage;
