import React, { useState, useCallback, useEffect } from 'react';

interface SimpleBadgeImageProps {
  code: string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'natural';
}

const SimpleBadgeImage = ({ 
  code, 
  name = '', 
  className = '', 
  size = 'md' 
}: SimpleBadgeImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-6 h-6',    // Reduzido de 8 para 6 (25% menor)
    md: 'w-10 h-10',  // Reduzido de 12 para 10 (17% menor)
    lg: 'w-13 h-13',  // Reduzido de 16 para 13 (19% menor)
    natural: 'w-auto h-auto max-w-12 max-h-12' // Tamanho natural limitado
  };

  // URLs reais para badges do Habbo com múltiplos fallbacks
  const getBadgeUrls = useCallback((badgeCode: string) => {
    // Formato correto: os códigos de badges Habbo são sempre maiúsculos
    const upperCode = badgeCode.toUpperCase();

    const urls: string[] = [
      // URL principal - images.habbo.com (mais confiável e sem CORS)
      `https://images.habbo.com/c_images/album1584/${upperCode}.gif`,
      `https://images.habbo.com/c_images/album1584/${upperCode}.png`,
    ];

    // Se o código tiver sufixo de hotel (ex: AC4_HHUK), tentar versão sem sufixo
    if (upperCode.includes('_')) {
      const baseCode = upperCode.split('_')[0]; // Remove tudo após o primeiro _
      urls.push(
        `https://images.habbo.com/c_images/album1584/${baseCode}.gif`,
        `https://images.habbo.com/c_images/album1584/${baseCode}.png`
      );
    }

    // URLs alternativas (podem retornar 403, mas tentamos mesmo assim)
    urls.push(
      `https://www.habbo.com.br/habbo-imaging/badge/${upperCode}`,
      `https://www.habbo.com/habbo-imaging/badge/${upperCode}`
    );

    return urls;
  }, []);

  const badgeUrls = getBadgeUrls(code);

  // Reset quando o código mudar
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [code]);

  const handleImageError = useCallback(() => {
    if (currentUrlIndex < badgeUrls.length - 1) {
      // Tenta próxima URL
      setIsLoading(true);
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      // Todas as URLs falharam
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, badgeUrls.length]);

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
        src={badgeUrls[currentUrlIndex]}
        alt={name || `Emblema ${code}`}
        className={`${size === 'natural' ? '' : 'w-full h-full object-contain'} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        key={currentUrlIndex}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default SimpleBadgeImage;
