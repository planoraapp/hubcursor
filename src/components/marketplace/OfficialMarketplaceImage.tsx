
import { useState, useEffect } from 'react';
import { Package2 } from 'lucide-react';

interface OfficialMarketplaceImageProps {
  className: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  priority?: boolean;
}

// Cache global otimizado para URLs oficiais
const officialImageCache = new Map<string, string>();
const failedOfficialUrls = new Set<string>();

// Limpar cache de falhas a cada 30 minutos para dar nova chance
setInterval(() => {
  failedOfficialUrls.clear();
}, 30 * 60 * 1000);

export const OfficialMarketplaceImage = ({ 
  className, 
  name, 
  size = 'md',
  priority = false 
}: OfficialMarketplaceImageProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // URLs oficiais baseadas na API oficial do Habbo
  const generateOfficialImageUrls = (classname: string): string[] => {
    if (!classname) return [];
    
    const cached = officialImageCache.get(classname);
    if (cached) return [cached];
    
    // Mapeamento específico para itens conhecidos
    const specificMappings: Record<string, string[]> = {
      'frank': ['/assets/frank.png'],
      'throne': [
        'https://images.habbo.com/c_images/catalogue/icon_catalogue_hc_15.png',
        'https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=throne'
      ],
      'dragon_lamp': [
        'https://images.habbo.com/c_images/catalogue/icon_catalogue_rare_dragonlamp.png'
      ],
      'rare_elephant_statue': [
        'https://images.habbo.com/c_images/catalogue/icon_catalogue_rare_elephant_statue.png'
      ]
    };

    if (specificMappings[classname]) {
      return specificMappings[classname];
    }
    
    // URLs oficiais priorizadas (ETAPA 2)
    return [
      // 1. Fonte Primária: Catálogo oficial
      `https://images.habbo.com/c_images/catalogue/${classname}.png`,
      
      // 2. Fonte Secundária: Gerador oficial de ícones
      `https://www.habbo.com.br/habbo-imaging/roomitemicon?classname=${classname}`,
      
      // 3. Variações do catálogo oficial
      `https://images.habbo.com/c_images/catalogue/icon_${classname}.png`,
      `https://images.habbo.com/c_images/catalogue/icon_catalogue_${classname}.png`,
      
      // 4. DCR oficial
      `https://images.habbo.com/dcr/hof_furni/${classname}.png`,
      
      // 5. Gordon oficial
      `https://images.habbo.com/gordon/production/${classname}_icon.png`,
    ].filter(url => !failedOfficialUrls.has(url));
  };

  const imageUrls = generateOfficialImageUrls(className);

  const handleImageError = () => {
    const currentUrl = imageUrls[currentUrlIndex];
    if (currentUrl) {
      failedOfficialUrls.add(currentUrl);
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
      // Cache inteligente - armazenar URLs que funcionam
      officialImageCache.set(className, currentUrl);
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

  // Placeholder melhorado para dados oficiais
  if (hasError || imageUrls.length === 0) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg flex items-center justify-center shadow-sm`}>
        <Package2 
          size={size === 'sm' ? 14 : size === 'md' ? 18 : 24} 
          className="text-yellow-600" 
        />
      </div>
    );
  }

  const currentUrl = imageUrls[currentUrlIndex];

  return (
    <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
      {isLoading && (
        <div className="absolute inset-0 bg-yellow-50 border-2 border-yellow-300 rounded-lg flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
        </div>
      )}
      {currentUrl && (
        <img
          src={currentUrl}
          alt={name}
          className={`${sizeClasses[size]} object-contain rounded-lg border-2 border-yellow-200 transition-opacity duration-200 ${
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
