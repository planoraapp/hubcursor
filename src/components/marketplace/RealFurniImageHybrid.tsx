
import { useState } from 'react';
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

  // URLs priorizando HabboAPI.site para imagens
  const getImageUrls = (className: string, type: string, hotel: string) => [
    // 1. HabboAPI.site URLs (prioritário como solicitado)
    `https://www.habboapi.site/images/furni/${className}.png`,
    `https://www.habboapi.site/images/furni/${className}.gif`,
    `https://habboapi.site/images/furni/${className}.png`,
    `https://api.habboapi.site/furni/image/${className}`,
    
    // 2. HabboFurni.com (backup)
    `https://habbofurni.com/furni_assets/45508/${className}_icon.png`,
    `https://habbofurni.com/furni_assets/48082/${className}_icon.png`,
    `https://habbofurni.com/furni_assets/49500/${className}_icon.png`,
    `https://habbofurni.com/furni_assets/56746/${className}_icon.png`,
    `https://habbofurni.com/furni_assets/61856/${className}_icon.png`,
    
    // 3. URLs oficiais do Habbo
    `https://images.habbo.com/dcr/hof_furni/${type}/${className}.png`,
    `https://www.habbo.com/dcr/hof_furni/${type}/${className}.png`,
    
    // 4. HabboWidgets (backup confiável)
    `https://habbowidgets.com/images/furni/${className}.png`,
    `https://habbowidgets.com/images/furni/${className}.gif`,
    `https://www.habbowidgets.com/images/furni/${className}.png`,
    
    // 5. Outras alternativas
    `https://habboemotion.com/images/furnis/${className}.png`,
    `https://cdn.habboemotion.com/furnis/${className}.gif`,
    
    // 6. URLs hotel-específicas
    `https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/habbo-imaging/furni/${className}.png`,
    
    // 7. Storage como último recurso
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/flash-assets/${className}.png`,
    `https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/${className}.png`
  ];

  const imageUrls = getImageUrls(className, type, hotel);
  const currentUrl = imageUrls[currentImageIndex];

  const handleImageError = () => {
    console.log(`❌ [HybridImage] Failed: ${currentUrl} (${className})`);
    if (currentImageIndex < imageUrls.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    } else {
      console.log(`💥 [HybridImage] All URLs failed for ${className}`);
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ [HybridImage] Loaded: ${currentUrl} (${className})`);
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
        className="object-contain max-w-full max-h-full transition-opacity duration-200"
        style={{ 
          imageRendering: 'pixelated'
        }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        title={`${name} (${className}) - HabboAPI.site + HabboFurni.com`}
      />
    </div>
  );
};

export default RealFurniImageHybrid;
