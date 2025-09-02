
import { useState, useCallback } from 'react';
import { Package } from 'lucide-react';

interface IntelligentFurniImageProps {
  swfName: string;
  name: string;
  originalUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const IntelligentFurniImage = ({ 
  swfName, 
  name, 
  originalUrl,
  className = '', 
  size = 'md' 
}: IntelligentFurniImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate multiple URL patterns for maximum success rate
  const generateImageUrls = useCallback((swf: string, original?: string) => {
    const urls = [];
    
    // Use original URL if provided and valid
    if (original && original.includes('http')) {
      urls.push(original);
    }
    
    // Safety check - ensure swf is a string before using string methods
    const safeSwf = swf || '';
    
    // Add multiple fallback patterns
    urls.push(
      `https://www.habbowidgets.com/images/furni/${safeSwf}.gif`,
      `https://habbowidgets.com/images/furni/${safeSwf}.gif`,
      `https://www.habbowidgets.com/images/${safeSwf}.gif`,
      `https://images.habbo.com/dcr/hof_furni/${safeSwf}.png`,
      `https://www.habbo.com.br/habbo-imaging/furni/${safeSwf}.png`,
      `https://habboemotion.com/images/furnis/${safeSwf}.png`,
      `https://cdn.habboemotion.com/furnis/${safeSwf}.gif`,
      // Alternative formats
      `https://www.habbowidgets.com/images/furni/${safeSwf}.png`,
      `https://habbowidgets.com/images/furni/${safeSwf}.png`,
      // Clean swf name attempts
      `https://www.habbowidgets.com/images/furni/${safeSwf.replace(/[^a-z0-9_]/gi, '')}.gif`,
      `https://habbowidgets.com/images/${safeSwf.replace(/[^a-z0-9_]/gi, '')}.gif`
    );
    
    return urls;
  }, []);

  const imageUrls = generateImageUrls(swfName, originalUrl);

  const handleImageError = useCallback(() => {
    console.log(`❌ Furni image failed: ${imageUrls[currentUrlIndex]} (${swfName})`);
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      console.log(`💥 All furni URLs failed for ${swfName}`);
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, imageUrls, swfName]);

  const handleImageLoad = useCallback(() => {
    console.log(`✅ Furni image loaded: ${imageUrls[currentUrlIndex]} (${swfName})`);
    setIsLoading(false);
    setHasError(false);
  }, [currentUrlIndex, imageUrls, swfName]);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded border-2 border-dashed border-gray-300 ${className}`}>
        <div className="text-center">
          <Package className="w-6 h-6 text-gray-400 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {name.slice(0, 8)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded animate-pulse flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      <img 
        key={`${swfName}_${currentUrlIndex}`}
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

export default IntelligentFurniImage;
