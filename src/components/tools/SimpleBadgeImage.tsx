import React, { useState, useCallback } from 'react';

interface SimpleBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SimpleBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md' 
}: SimpleBadgeImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-200 rounded flex items-center justify-center`}>
        <span className="text-xs text-gray-500">?</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500"></div>
        </div>
      )}
      <img
        src={`/badges/c_images/album1584/${code}.gif`}
        alt={name || `Emblema ${code}`}
        className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default SimpleBadgeImage;
