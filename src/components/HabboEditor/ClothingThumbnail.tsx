
import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface ClothingThumbnailProps {
  category: string;
  itemId: string;
  colorId?: string;
  className?: string;
  alt?: string;
  hotel?: string;
  // Informações adicionais do tutorial
  isRare?: boolean;
  isLTD?: boolean;
  isNFT?: boolean;
  isHC?: boolean;
  rarity?: 'normal' | 'rare' | 'ltd' | 'nft' | 'hc';
  scientificCode?: string;
  // Sistema duotone do tutorial
  isDuotone?: boolean;
  colorIndex?: string;
  // URLs do tutorial
  swfUrl?: string;
  iconUrl?: string;
  // Propriedades do figuredata
  colorable?: boolean;
  selectable?: boolean;
  preselectable?: boolean;
  sellable?: boolean;
  paletteId?: string;
}

const ClothingThumbnail = ({ 
  category, 
  itemId, 
  colorId = '1', 
  className = '', 
  alt = '',
  hotel = 'com.br',
  isRare = false,
  isLTD = false,
  isNFT = false,
  isHC = false,
  rarity = 'normal',
  scientificCode,
  isDuotone = false,
  colorIndex = '1',
  swfUrl,
  iconUrl,
  colorable = false,
  selectable = true,
  preselectable = false,
  sellable = false,
  paletteId
}: ClothingThumbnailProps) => {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Array de URLs possíveis para thumbnails, em ordem de prioridade
  // Priorizar URLs do tutorial quando disponíveis
  const thumbnailUrls = [
    // URL do ícone oficial do tutorial (prioridade máxima)
    iconUrl,
    
    // HabboWidgets (mais provável de funcionar)
    `https://www.habbowidgets.com/clothing/${category}/${itemId}_${colorId}.png`,
    
    // Habbo Assets CDN
    `https://images.habbo.com/c_images/clothing/icon_${category}_${itemId}_${colorId}.png`,
    
    // Habbo Official Imager (isolado)
    `https://www.habbo.${hotel}/habbo-imaging/clothing/${category}/${itemId}/${colorId}.png`,
    
    // Avatar completo como fallback (gera só a peça)
    `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${category}-${itemId}-${colorId}&direction=2&head_direction=3&size=s&img_format=png&gesture=std&action=std`,
    
    // Habbo Stories CDN
    `https://habbo-stories-content.s3.amazonaws.com/clothing/${category}/${itemId}.png`
  ].filter(Boolean); // Remove URLs vazias

  const handleImageError = () => {
    console.log(`❌ [ClothingThumbnail] Failed to load: ${thumbnailUrls[currentUrlIndex]}`);
    
    if (currentUrlIndex < thumbnailUrls.length - 1) {
      setCurrentUrlIndex(prev => prev + 1);
    } else {
      console.log(`💥 [ClothingThumbnail] All URLs failed for ${category}-${itemId}`);
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ [ClothingThumbnail] Successfully loaded: ${thumbnailUrls[currentUrlIndex]}`);
    setIsLoading(false);
    setHasError(false);
  };

  // Reset quando props mudam
  useEffect(() => {
    setCurrentUrlIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [category, itemId, colorId]);

  // Função para renderizar badge de raridade
  const renderRarityBadge = () => {
    if (isNFT) {
      return (
        <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center z-10">
          <span className="text-xs text-white font-bold">NFT</span>
        </div>
      );
    }
    if (isLTD) {
      return (
        <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center z-10">
          <span className="text-xs text-white font-bold">LTD</span>
        </div>
      );
    }
    if (isRare) {
      return (
        <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center z-10">
          <span className="text-xs text-white font-bold">R</span>
        </div>
      );
    }
    if (isHC) {
      return (
        <div className="absolute top-1 right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center z-10">
          <span className="text-xs text-white font-bold">HC</span>
        </div>
      );
    }
    return null;
  };

  const renderDuotoneBadge = () => {
    if (isDuotone) {
      return (
        <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center z-10">
          <span className="text-xs text-white font-bold">2</span>
        </div>
      );
    }
    return null;
  };

  const renderPropertiesBadges = () => {
    const badges = [];
    
    if (colorable) {
      badges.push(
        <div key="colorable" className="absolute bottom-1 left-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center z-10" title="Colorável">
          <span className="text-xs text-white font-bold">C</span>
        </div>
      );
    }
    
    if (sellable) {
      badges.push(
        <div key="sellable" className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center z-10" title="Vendável">
          <span className="text-xs text-white font-bold">$</span>
        </div>
      );
    }
    
    return badges;
  };

  if (hasError) {
    return (
      <div className={`relative flex items-center justify-center bg-gray-200 rounded ${className}`}>
        <div className="text-center p-2">
          <AlertCircle className="w-4 h-4 text-gray-500 mx-auto mb-1" />
          <span className="text-xs font-bold text-gray-600 block">
            {itemId}
          </span>
        </div>
        {renderRarityBadge()}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <img 
        src={thumbnailUrls[currentUrlIndex]}
        alt={alt || `${category}-${itemId}`}
        className={`w-full h-full object-contain pixelated ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        style={{ imageRendering: 'pixelated' }}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
        title={`${category}-${itemId} (${colorId})${scientificCode ? ` - ${scientificCode}` : ''} - ${rarity} - ${colorable ? 'Colorável' : 'Não colorável'}`}
      />
      {renderRarityBadge()}
      {renderDuotoneBadge()}
      {renderPropertiesBadges()}
    </div>
  );
};

export default ClothingThumbnail;
