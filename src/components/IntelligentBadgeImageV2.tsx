
import { useState, useCallback, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface IntelligentBadgeImageV2Props {
  code: string;
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const IntelligentBadgeImageV2 = ({ 
  code, 
  name, 
  className = '', 
  size = 'md' 
}: IntelligentBadgeImageV2Props) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URLs inteligentes com prioridade otimizada
  const generateBadgeUrls = useCallback((badgeCode: string) => {
    return [
      // 1. HabboAssets (mais confiável)
      `https://habboassets.com/c_images/album1584/${badgeCode}.gif`,
      `https://habboassets.com/web_images/badges/${badgeCode}.gif`,
      
      // 2. Habbo Oficial
      `https://www.habbo.com/habbo-imaging/badge/${badgeCode}`,
      `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`,
      `https://www.habbo.com.br/habbo-imaging/badge/${badgeCode}`,
      
      // 3. HabboEmotion
      `https://habboemotion.com/images/badges/${badgeCode}.gif`,
      `https://cdn.habboemotion.com/badges/${badgeCode}.gif`,
      
      // 4. HabboWidgets
      `https://www.habbowidgets.com/images/badges/${badgeCode}.gif`,
      `https://habbowidgets.com/images/badges/${badgeCode}.gif`,
      
      // 5. Storage como último recurso
      `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/habbo-badges/${badgeCode}.gif`,
    ];
  }, []);

  const badgeUrls = generateBadgeUrls(code);

  const handleImageError = useCallback(() => {
    if (currentUrlIndex < badgeUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  }, [currentUrlIndex, badgeUrls.length]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [code]);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  if (hasError) {
    return (
      <div className={`${sizeClasses[size]} flex items-center justify-center bg-gray-100 rounded ${className}`}>
        <AlertCircle className="w-3 h-3 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded animate-pulse"></div>
      )}
      <img 
        key={`${code}_${currentUrlIndex}`}
        src={badgeUrls[currentUrlIndex]}
        alt={name}
        className={`w-full h-full object-contain pixelated ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
};

export default IntelligentBadgeImageV2;
