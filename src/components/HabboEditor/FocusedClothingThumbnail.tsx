
import { useState } from 'react';
import { ViaJovemFlashItem } from '@/hooks/useFlashAssetsViaJovem';

interface FocusedClothingThumbnailProps {
  item: ViaJovemFlashItem;
  colorId: string;
  gender: 'M' | 'F';
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Sistema de crop para focar na peça específica
const getCropParameters = (category: string) => {
  const cropMap = {
    // Focar no tronco para camisetas
    'ch': '&crop=0,20,64,45',
    // Focar na cabeça para cabelos  
    'hr': '&crop=0,0,64,35',
    // Focar na cabeça para rostos
    'hd': '&crop=0,0,64,35', 
    // Focar nas pernas para calças
    'lg': '&crop=0,35,64,64',
    // Focar nos pés para sapatos
    'sh': '&crop=0,50,64,64',
    // Focar na cabeça para chapéus
    'ha': '&crop=0,0,64,40',
    // Focar nos olhos para óculos
    'ea': '&crop=15,10,35,25',
    // Focar no peito para acessórios
    'ca': '&crop=10,25,45,45',
    // Focar no corpo para casacos
    'cc': '&crop=0,15,64,55',
    // Focar na cintura
    'wa': '&crop=15,40,45,55',
    // Focar no peito para estampas
    'cp': '&crop=5,20,55,50'
  };
  
  return cropMap[category] || '';
};

const FocusedClothingThumbnail = ({ 
  item, 
  colorId, 
  gender, 
  isSelected = false, 
  onClick,
  className = '' 
}: FocusedClothingThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URL focada na peça específica - similar ao ViaJovem
  const getFocusedThumbnailUrl = (item: ViaJovemFlashItem, colorId: string): string => {
    const cropParams = getCropParameters(item.category);
    const baseUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.category}-${item.figureId}-${colorId}&gender=${gender}&size=l&direction=2&head_direction=2&action=std&gesture=std`;
    
    // Se tem crop específico, aplicar
    if (cropParams) {
      return `${baseUrl}${cropParams}`;
    }
    
    return baseUrl;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    console.error('❌ [FocusedThumbnail] Erro ao carregar:', item.name);
  };

  const thumbnailUrl = getFocusedThumbnailUrl(item, colorId);

  return (
    <div
      className={`
        relative cursor-pointer transition-all duration-200 hover:scale-105
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}
        ${className}
      `}
      onClick={onClick}
      title={item.name}
    >
      {/* Container da imagem com aspect ratio */}
      <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden border border-gray-200 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            style={{ imageRendering: 'pixelated' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            <span>Erro</span>
          </div>
        )}

        {/* Badge de raridade */}
        {item.club === 'hc' && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded font-bold">
            HC
          </div>
        )}

        {/* Indicador de seleção */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
            <div className="bg-blue-500 text-white rounded-full p-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Nome da peça */}
      <div className="mt-1 text-xs text-center text-gray-700 font-medium">
        {item.name}
      </div>
    </div>
  );
};

export default FocusedClothingThumbnail;
