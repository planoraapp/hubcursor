
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

  // Optimized image URLs with priority order
  const getImageUrls = (className: string, type: string, hotel: string) => [
    // Unity 2025 Asset Bundles (primary source)
    `https://images.habbo.com/habbo-asset-bundles/production/2020.3.15f2/0.0.44/WebGL/Furni/66732/72612/${className}.png`,
    `https://images.habbo.com/habbo-asset-bundles/production/2020.3.15f2/0.0.44/WebGL/Furni/66732/72612/${className}.gif`,
    
    // Official Habbo HOF Furni (most reliable fallback)
    `https://images.habbo.com/dcr/hof_furni/${type}/${className}.png`,
    `https://www.habbo.com/dcr/hof_furni/${type}/${className}.png`,
    
    // Hotel-specific imaging
    `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`,
    `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/badge/${className}.gif`,
    
    // HabboWidgets (reliable third-party)
    `https://habbowidgets.com/images/furni/${className}.png`,
    `https://habbowidgets.com/images/furni/${className}.gif`,
    `https://www.habbowidgets.com/images/furni/${className}.png`,
    
    // HabboEmotion
    `https://habboemotion.com/images/furnis/${className}.png`,
    `https://cdn.habboemotion.com/furnis/${className}.gif`,
    
    // Alternative Unity paths
    `https://images.habbo.com/c_images/catalogue/${className}.png`,
    `https://images.habbo.com/c_images/furni/${className}.png`,
    
    // Supabase storage as final fallback
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${className}.png`,
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/${className}.png`
  ];

  const imageUrls = getImageUrls(className, type, hotel);
  const currentUrl = imageUrls[currentImageIndex];

  const handleImageError = () => {
    console.log(`❌ [RealFurniImage] Failed to load: ${currentUrl} for ${className}`);
    
    if (currentImageIndex < imageUrls.length - 1) {
      console.log(`🔄 [RealFurniImage] Trying next URL (${currentImageIndex + 1}/${imageUrls.length}) for ${className}`);
      setCurrentImageIndex(prev => prev + 1);
    } else {
      console.log(`❌ [RealFurniImage] All URLs failed for ${className}, showing fallback icon`);
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ [RealFurniImage] Successfully loaded: ${currentUrl} for ${className}`);
  };

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
        className="object-contain max-w-full max-h-full pixelated transition-opacity duration-200"
        style={{ 
          imageRendering: 'pixelated'
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        title={`${name} (${className})`}
      />
    </div>
  );
};

export default RealFurniImage;
