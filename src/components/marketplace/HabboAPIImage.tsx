
import { useState } from 'react';

interface HabboAPIImageProps {
  className: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

export const HabboAPIImage = ({ className, name, size = 'md', priority = false }: HabboAPIImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setIsGenerating(false);
  };

  const handleImageError = async () => {
    if (!isGenerating) {
      setIsGenerating(true);
      // Tentar gerar a imagem fazendo uma nova requisição
      try {
        const response = await fetch(`https://habboapi.site/api/image/${className}`, {
          method: 'HEAD'
        });
        
        if (response.status === 202) {
          // Imagem está sendo gerada, aguardar e tentar novamente
          setTimeout(() => {
            setImageError(false);
            setIsLoading(true);
            setIsGenerating(false);
          }, 2000);
        } else {
          setImageError(true);
          setIsLoading(false);
          setIsGenerating(false);
        }
      } catch {
        setImageError(true);
        setIsLoading(false);
        setIsGenerating(false);
      }
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  if (imageError) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 border border-gray-300 rounded flex items-center justify-center`}>
        <span className="text-gray-500 text-xs">📦</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative`}>
      {isLoading && (
        <div className={`${sizeClasses[size]} bg-gray-200 border border-gray-300 rounded flex items-center justify-center absolute inset-0 z-10`}>
          {isGenerating ? (
            <span className="text-gray-500 text-xs animate-pulse">⚡</span>
          ) : (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      )}
      
      <img
        src={`https://habboapi.site/api/image/${className}`}
        alt={name}
        title={name}
        className={`${sizeClasses[size]} object-contain rounded border border-gray-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        style={{ 
          imageRendering: 'pixelated',
          transition: 'opacity 0.2s ease-in-out'
        }}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      
      {isGenerating && !isLoading && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">⚡</span>
        </div>
      )}
    </div>
  );
};
