
import { useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

interface IntelligentBadgeImageProps {
  code: string;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const IntelligentBadgeImage = ({ code, name, className = '', size = 'md' }: IntelligentBadgeImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate multiple URL patterns for maximum success rate
  const generateImageUrls = useCallback((badgeCode: string) => {
    const urls = [
      `https://www.habbowidgets.com/images/badges/${badgeCode}.gif`,
      `https://habbowidgets.com/images/badges/${badgeCode}.gif`,
      `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
      `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}.gif`,
      `https://habboemotion.com/images/badges/${badgeCode}.gif`,
      `https://cdn.habboemotion.com/badges/${badgeCode}.gif`,
      `https://images.habbo.com/web_images/badges/${badgeCode}.gif`,
      // Alternative formats
      `https://www.habbowidgets.com/images/badges/${badgeCode}.png`,
      `https://habbowidgets.com/images/badges/${badgeCode}.png`
    ];
    
    return urls;
  }, []);

  const imageUrls = generateImageUrls(code);

  const handleImageError = useCallback(() => {
    console.log(`❌ Badge image failed: ${imageUrls[currentUrlIndex]} (${code})`);
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log(`💥 All badge URLs failed for ${code}`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, imageUrls, code]);

  const handleImageLoad = useCallback(() => {
    console.log(`✅ Badge image loaded: ${imageUrls[currentUrlIndex]} (${code})`);
    setIsLoading(false);
    setHasError(false);
  }, [currentUrlIndex, imageUrls, code]);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <AlertCircle className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {code.slice(0, 4)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      <img 
        key={`${code}_${currentUrlIndex}`}
        src={imageUrls[currentUrlIndex]}
        alt={name}
        className={`w-full h-full object-contain rounded ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default IntelligentBadgeImage;
