
import { useState } from 'react';
import { OfficialHabboAsset } from '@/hooks/useOfficialHabboAssets';

interface OfficialClothingThumbnailProps {
  asset: OfficialHabboAsset;
  colorId: string;
  gender: 'M' | 'F';
  hotel: string;
  isSelected?: boolean;
  onClick?: () => void;
  onColorChange?: (colorId: string) => void;
  className?: string;
}

const OfficialClothingThumbnail = ({ 
  asset, 
  colorId, 
  gender,
  hotel,
  isSelected = false, 
  onClick,
  onColorChange,
  className = '' 
}: OfficialClothingThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // URL focada na peça específica (igual ao ViaJovem e HabboNews)
  const getThumbnailUrl = (): string => {
    const hotelDomain = hotel === 'com.br' ? 'com.br' : 'com';
    return `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?figure=${asset.category}-${asset.figureId}-${colorId}&gender=${gender}&direction=2&head_direction=2&size=s`;
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
        });
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <div className={`relative ${className}`}>
      {/* Container da thumbnail */}
      <div
        className={`
          aspect-square cursor-pointer transition-all duration-200 hover:scale-105
          bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden 
          border border-gray-200 relative
          ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:ring-1 hover:ring-gray-300'}
        `}
        onClick={onClick}
        title={`${asset.name} (${asset.figureId})`}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Imagem da peça */}
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={asset.name}
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
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

      {/* Info da peça */}
      <div className="mt-1 space-y-0.5">
        <div className="text-xs text-center text-gray-700 font-medium truncate">
          {asset.name}
        </div>
        <div className="text-[10px] text-center text-gray-500">
          {asset.category.toUpperCase()}-{asset.figureId}
        </div>
      </div>

      {/* Paleta de cores */}
      {asset.colors.length > 1 && (
        <div className="mt-1 flex justify-center gap-0.5 flex-wrap">
          {asset.colors.slice(0, 6).map((color) => {
            const colorHex = getHabboColorHex(color);
            return (
              <button
                key={color}
                className={`w-3 h-3 rounded border hover:scale-110 transition-transform ${
                  colorId === color ? 'ring-1 ring-blue-500' : 'ring-1 ring-gray-200'
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

// Função para mapear IDs de cor para hex (baseada no sistema real do Habbo)
const getHabboColorHex = (colorId: string): string => {
  const colorMap: Record<string, string> = {
    '1': '#FFFFFF', // Branco
    '2': '#000000', // Preto
    '3': '#A0A0A0', // Cinza
    '4': '#FFE4C4', // Bege
    '5': '#FFC0CB', // Rosa
    '6': '#D2B48C', // Pele
    '21': '#000000', // Preto
    '26': '#FF0000', // Vermelho
    '31': '#00FF00', // Verde
    '45': '#8B4513', // Marrom
    '61': '#0000FF', // Azul
    '80': '#654321', // Marrom escuro
    '82': '#4169E1', // Azul real
    '92': '#FFD700', // Dourado
    '100': '#FF69B4', // Rosa choque
    '104': '#8B0000', // Vermelho escuro
    '106': '#FF4500', // Laranja
    '143': '#9370DB'  // Roxo
  };
  
  return colorMap[colorId] || '#DDDDDD';
};

export default OfficialClothingThumbnail;
