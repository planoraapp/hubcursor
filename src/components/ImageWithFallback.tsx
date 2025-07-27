
import React, { useState, useEffect } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  onError?: () => void;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  fallback = '/placeholder.svg',
  className = '',
  onError
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">🖼️</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded"></div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
};
