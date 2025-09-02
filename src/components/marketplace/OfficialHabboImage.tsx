
import { useState, useEffect } from 'react';
import { Package2 } from 'lucide-react';

interface OfficialHabboImageProps {
  className: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

// Cache global de URLs que funcionam (limpar periodicamente)
const imageCache = new Map<string, string>();
const failedUrls = new Set<string>();

// Limpar cache de falhas a cada 10 minutos
setInterval(() => {
  failedUrls.clear();
}, 10 * 60 * 1000);

export const OfficialHabboImage = ({ 
  className, 
  name, 
  size = 'md',
  priority = false 
}: OfficialHabboImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // URLs oficiais melhoradas com mapeamento específico
  const generateImageUrls = (classname: string): string[] => {
    if (!classname) return [];
    
    const cached = imageCache.get(classname);
    if (cached) return [cached];
    
    // Mapeamento específico para itens conhecidos
    const specificMappings: Record<string, string[]> = {
      'frank': ['/assets/frank.png'],
      'throne': [
        'https://images.habbo.com/c_images/catalogue/icon_catalogue_hc_15.png',
        'https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=throne'
      ],
      'dragon_lamp': [
        'https://images.habbo.com/c_images/catalogue/icon_catalogue_rare_dragonlamp.png',
        'https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=dragon_lamp'
      ],
      'hc_chair': [
        'https://images.habbo.com/c_images/catalogue/hc_chair.png',
        'https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=hc_chair'
      ]
    };

    if (specificMappings[classname]) {
      return specificMappings[classname];
    }
    
    return [
      // 1. Images.habbo.com - Fonte oficial principal
      `https://images.habbo.com/c_images/catalogue/${classname}.png`,
      
      // 2. Habbo-imaging - Gerador oficial de ícones
      `https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=${classname}`,
      
      // 3. Variações do nome
      `https://images.habbo.com/c_images/catalogue/icon_${classname}.png`,
      `https://images.habbo.com/c_images/catalogue/icon_catalogue_${classname}.png`,
      
      // 4. DCR Furni - Fonte oficial alternativa
      `https://images.habbo.com/dcr/hof_furni/${classname}.png`,
      
      // 5. Gordon (se disponível)
      `https://images.habbo.com/gordon/production/${classname}_icon.png`,
    ].filter(url => !failedUrls.has(url));
  };

  const imageUrls = generateImageUrls(className);

  const handleImageError = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      failedUrls.add(currentUrl);
    }
    
    if (currentUrlIndex < imageUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      imageCache.set(className, currentUrl);
    }
    setIsLoading(false);
    setHasError(false);
  };

  // Reset quando className muda
  useEffect(() => {
    setCurrentUrlIndex(0);
    setIsLoading(true);
    setHasError(false);
  }, [className]);

  // Placeholder melhorado para erro ou sem URLs
  if (hasError || imageUrls.length === 0) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300 rounded-lg flex items-center justify-center shadow-sm`}>
        <Package2 
          size={size === 'sm' ? 14 : size === 'md' ? 18 : 24} 
          className="text-blue-500" 
        />
      </div>
    );
  }

  const currentUrl = imageUrls[currentUrlIndex];

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      {currentUrl && (
        <img
          src={currentUrl}
          alt={name}
          className={`${sizeClasses[size]} object-contain rounded-lg border-2 border-gray-200 transition-opacity duration-200 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ imageRendering: 'pixelated' }}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  );
};
