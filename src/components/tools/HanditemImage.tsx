import React, { useState, useEffect } from 'react';
import { useHanditemImage } from '../../hooks/useHanditemImage';

interface HanditemImageProps {
  handitem: {
    name?: string;
    id?: number;
    id_web?: string;
    id_in_game?: string;
    category?: string;
    image?: string;
  };
  className?: string;
  alt?: string;
}

export const HanditemImage: React.FC<HanditemImageProps> = ({ 
  handitem, 
  className = "w-12 h-12 object-contain",
  alt 
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    imageError,
    currentImageIndex,
    generateImageUrls,
    handleImageError,
    resetImageState
  } = useHanditemImage();

  useEffect(() => {
    // Reset state when handitem changes
    resetImageState();
    setIsLoading(true);
    
    // Check if handitem exists
    if (!handitem) {
      setCurrentUrl('/placeholder.svg');
      setIsLoading(false);
      return;
    }
    
    // Generate all possible URLs
    const allUrls = generateImageUrls({
      name: handitem.name,
      id: handitem.id,
      idWeb: handitem.id_web,
      idInGame: handitem.id_in_game,
      category: handitem.category
    });
    
    // Start with the original image URL if available
    const urls = handitem.image ? [handitem.image, ...allUrls] : allUrls;
    
    // Set the first URL
    setCurrentUrl(urls[0] || '/placeholder.svg');
  }, [handitem, generateImageUrls, resetImageState]);

  const handleError = () => {
    if (!handitem) {
      setCurrentUrl('/placeholder.svg');
      return;
    }
    
    const allUrls = generateImageUrls({
      name: handitem.name,
      id: handitem.id,
      idWeb: handitem.id_web,
      idInGame: handitem.id_in_game,
      category: handitem.category
    });
    
    const urls = handitem.image ? [handitem.image, ...allUrls] : allUrls;
    
    if (currentImageIndex < urls.length - 1) {
      // Try next URL
      setCurrentUrl(urls[currentImageIndex + 1]);
    } else {
      // All URLs failed, use placeholder
      setCurrentUrl('/placeholder.svg');
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <img
      src={currentUrl}
      alt={alt || handitem?.name || 'Handitem'}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        opacity: isLoading ? 0.5 : 1,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
};
