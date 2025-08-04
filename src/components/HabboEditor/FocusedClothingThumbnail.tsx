
import { useState } from 'react';
import { OfficialHabboAsset } from '@/hooks/useOfficialHabboAssets';

interface FocusedClothingThumbnailProps {
  asset: OfficialHabboAsset;
  colorId: string;
  gender: 'M' | 'F';
  hotel: string;
  isSelected?: boolean;
  onClick?: () => void;
  onColorChange?: (colorId: string) => void;
  className?: string;
}

const FocusedClothingThumbnail = ({ 
  asset, 
  colorId, 
  gender,
  hotel,
  isSelected = false, 
  onClick,
  onColorChange,
  className = '' 
}: FocusedClothingThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Avatar base que destaca a categoria específica
  const getBaseAvatarForCategory = (category: string): string => {
    const baseAvatars = {
      'hd': 'hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
      'hr': 'hd-180-1.ch-3216-61.lg-3116-61.sh-3297-61', 
      'ch': 'hd-180-1.hr-828-45.lg-3116-61.sh-3297-61',
      'cc': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
      'lg': 'hd-180-1.hr-828-45.ch-3216-61.sh-3297-61',
      'sh': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61',
      'ha': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
      'ea': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
      'ca': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
      'cp': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61',
      'wa': 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61'
    };
    
    return baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-61.lg-3116-61.sh-3297-61';
  };

  // Gerar URL com avatar focado
  const getFocusedThumbnailUrl = (): string => {
    const baseAvatar = getBaseAvatarForCategory(asset.category);
    const fullFigure = `${baseAvatar}.${asset.category}-${asset.figureId}-${colorId}`;
    const hotelDomain = hotel === 'com.br' ? 'com.br' : 'com';
    
    return `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=l`;
  };

  // CSS crop baseado na categoria para focar na área relevante
  const getCropStyle = (category: string) => {
    const cropStyles = {
      'hd': { // Rostos - focar na cabeça
        width: '80px',
        height: '80px', 
        objectPosition: 'center 20%',
        transform: 'scale(1.5)',
        transformOrigin: 'center 30%'
      },
      'hr': { // Cabelos - focar na parte superior
        width: '80px',
        height: '80px',
        objectPosition: 'center 15%', 
        transform: 'scale(1.4)',
        transformOrigin: 'center 25%'
      },
      'ch': { // Camisetas - focar no tronco
        width: '80px',
        height: '80px',
        objectPosition: 'center 45%',
        transform: 'scale(1.3)',
        transformOrigin: 'center 50%'
      },
      'cc': { // Casacos - focar no tronco
        width: '80px',
        height: '80px',
        objectPosition: 'center 40%',
        transform: 'scale(1.3)',
        transformOrigin: 'center 45%'
      },
      'lg': { // Calças - focar nas pernas
        width: '80px',
        height: '80px',
        objectPosition: 'center 70%',
        transform: 'scale(1.4)',
        transformOrigin: 'center 75%'
      },
      'sh': { // Sapatos - focar nos pés
        width: '80px',
        height: '80px',
        objectPosition: 'center 85%',
        transform: 'scale(1.6)',
        transformOrigin: 'center 90%'
      },
      'ha': { // Chapéus - focar na cabeça
        width: '80px',
        height: '80px',
        objectPosition: 'center 10%',
        transform: 'scale(1.5)',
        transformOrigin: 'center 20%'
      },
      'ea': { // Óculos - focar no rosto
        width: '80px',
        height: '80px',
        objectPosition: 'center 25%',
        transform: 'scale(1.8)',
        transformOrigin: 'center 30%'
      },
      'ca': { // Acessório peito - focar no peito
        width: '80px',
        height: '80px',
        objectPosition: 'center 50%',
        transform: 'scale(1.4)',
        transformOrigin: 'center 55%'
      },
      'cp': { // Estampas - focar no tronco
        width: '80px',
        height: '80px',
        objectPosition: 'center 50%',
        transform: 'scale(1.3)',
        transformOrigin: 'center 55%'
      },
      'wa': { // Cintura - focar na cintura
        width: '80px',
        height: '80px',
        objectPosition: 'center 60%',
        transform: 'scale(1.5)',
        transformOrigin: 'center 65%'
      }
    };

    return cropStyles[category as keyof typeof cropStyles] || cropStyles['ch'];
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
    console.error('❌ [FocusedThumbnail] Erro ao carregar:', {
      asset: asset.name,
      figureId: asset.figureId,
      category: asset.category,
      url: getFocusedThumbnailUrl()
    });
  };

  const cropStyle = getCropStyle(asset.category);
  const thumbnailUrl = getFocusedThumbnailUrl();

  return (
    <div className={`relative ${className}`}>
      {/* Container da thumbnail com crop */}
      <div
        className={`
          aspect-square cursor-pointer transition-all duration-200 hover:scale-105
          bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden 
          border-2 relative
          ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}
        `}
        onClick={onClick}
        title={`${asset.name} (${asset.figureId})`}
        style={{ width: '80px', height: '80px' }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Imagem focada da peça */}
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={asset.name}
            className="absolute inset-0"
            style={{
              ...cropStyle,
              imageRendering: 'pixelated'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-2">
            <span className="text-lg">❌</span>
            <span className="mt-1 text-center">Erro</span>
            <span className="text-[10px] mt-1">{asset.figureId}</span>
          </div>
        )}

        {/* Badge HC */}
        {asset.club === 'HC' && (
          <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded font-bold shadow-sm">
            HC
          </div>
        )}

        {/* Indicador de seleção */}
        {isSelected && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400 rounded-lg flex items-center justify-center">
            <div className="bg-blue-500 text-white rounded-full p-1 shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Info da peça */}
      <div className="mt-1 space-y-0.5">
        <div className="text-xs text-center text-gray-700 font-medium truncate">
          {asset.name}
        </div>
        <div className="text-[10px] text-center text-gray-500">
          {asset.category.toUpperCase()}-{asset.figureId}
        </div>
      </div>

      {/* Paleta de cores focada */}
      {asset.colors.length > 1 && (
        <div className="mt-1 flex justify-center gap-0.5 flex-wrap">
          {asset.colors.slice(0, 6).map((color) => {
            const colorHex = getHabboColorHex(color);
            return (
              <button
                key={color}
                className={`w-3 h-3 rounded-sm border-2 hover:scale-125 transition-all duration-200 ${
                  colorId === color ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: colorHex }}
                onClick={(e) => {
                  e.stopPropagation();
                  onColorChange?.(color);
                }}
                title={`Cor ${color}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

// Sistema de cores oficial do Habbo
const getHabboColorHex = (colorId: string): string => {
  const officialColors: Record<string, string> = {
    '1': '#FFFFFF',   // Branco
    '2': '#000000',   // Preto  
    '3': '#C0C0C0',   // Cinza claro
    '4': '#808080',   // Cinza
    '5': '#FFC0CB',   // Rosa claro
    '6': '#D2B48C',   // Tom de pele
    '21': '#1C1C1C',  // Preto escuro
    '26': '#DC143C',  // Vermelho
    '31': '#32CD32',  // Verde lima
    '45': '#8B4513',  // Marrom
    '61': '#4169E1',  // Azul royal
    '80': '#654321',  // Marrom escuro
    '82': '#6495ED',  // Azul acero
    '92': '#FFD700',  // Dourado
    '100': '#FF69B4', // Rosa choque
    '104': '#8B0000', // Vermelho escuro
    '106': '#FF8C00', // Laranja escuro
    '143': '#9370DB'  // Roxo médio
  };
  
  return officialColors[colorId] || '#E5E5E5';
};

export default FocusedClothingThumbnail;
