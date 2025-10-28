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
    sm: 'w-6 h-6',    // Reduzido de 8 para 6 (25% menor)
    md: 'w-10 h-10',  // Reduzido de 12 para 10 (17% menor)
    lg: 'w-13 h-13'   // Reduzido de 16 para 13 (19% menor)
  };

  // URLs reais para badges do Habbo
  const getBadgeUrl = useCallback((badgeCode: string) => {
    // Formato correto: os códigos de badges Habbo são sempre maiúsculos
    const upperCode = badgeCode.toUpperCase();
    
    // Prioridade de URLs (da mais confiável para fallback)
    return `https://images.habbo.com/c_images/album1584/${upperCode}.gif`;
  }, []);

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
        <span className="text-xs text-gray-500">{code.slice(0, 3)}</span>
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
        src={getBadgeUrl(code)}
        alt={name || `Emblema ${code}`}
        className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default SimpleBadgeImage;
