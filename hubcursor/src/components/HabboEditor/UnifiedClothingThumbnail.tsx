
import { useState, useCallback } from 'react';
import { UnifiedHabboClothingItem } from '@/hooks/useUnifiedHabboClothing';

interface UnifiedClothingThumbnailProps {
  item: UnifiedHabboClothingItem;
  colorId: string;
  gender: 'M' | 'F';
  hotel?: string;
  isSelected?: boolean;
  onClick?: () => void;
  onColorChange?: (colorId: string) => void;
  className?: string;
}

const HABBO_DOMAINS = ['com', 'fr', 'com.br', 'es'] as const;

const UnifiedClothingThumbnail = ({ 
  item, 
  colorId, 
  gender,
  hotel = 'com',
  isSelected = false, 
  onClick,
  onColorChange,
  className = '' 
}: UnifiedClothingThumbnailProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);

  // Gerar avatar base focado na categoria
  const getBaseAvatarForCategory = (category: string): string => {
    const baseAvatars = {
      'hd': 'hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'hr': 'hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92', 
      'ch': 'hd-180-1.hr-828-45.lg-3116-92.sh-3297-92',
      'cc': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'lg': 'hd-180-1.hr-828-45.ch-3216-92.sh-3297-92',
      'sh': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92',
      'ha': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ea': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'ca': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'cp': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
      'wa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92'
    };
    
    return baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
  };

  // Gerar URL com habbo-imaging focado
  const generateThumbnailUrl = useCallback((domainIndex: number = 0): string => {
    const domain = HABBO_DOMAINS[domainIndex] || 'com';
    const baseAvatar = getBaseAvatarForCategory(item.category);
    const fullFigure = `${baseAvatar}.${item.category}-${item.figureId}-${colorId}`;
    
    return `https://www.habbo.${domain}/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=s`;
  }, [item.category, item.figureId, colorId, gender]);

  // Sistema de crop CSS por categoria
  const getCropStyle = (category: string) => {
    const cropStyles = {
      'hd': { objectPosition: 'center 20%', transform: 'scale(1.8)' },
      'hr': { objectPosition: 'center 15%', transform: 'scale(1.6)' },
      'ch': { objectPosition: 'center 45%', transform: 'scale(1.4)' },
      'cc': { objectPosition: 'center 40%', transform: 'scale(1.4)' },
      'lg': { objectPosition: 'center 70%', transform: 'scale(1.6)' },
      'sh': { objectPosition: 'center 85%', transform: 'scale(2.0)' },
      'ha': { objectPosition: 'center 10%', transform: 'scale(1.8)' },
      'ea': { objectPosition: 'center 25%', transform: 'scale(2.2)' },
      'ca': { objectPosition: 'center 50%', transform: 'scale(1.6)' },
      'cp': { objectPosition: 'center 50%', transform: 'scale(1.4)' },
      'wa': { objectPosition: 'center 60%', transform: 'scale(1.8)' }
    };

    return cropStyles[category as keyof typeof cropStyles] || cropStyles['ch'];
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
    console.log('✅ [UnifiedThumbnail] Loaded successfully:', item.name, HABBO_DOMAINS[currentDomainIndex]);
  };

  const handleImageError = () => {
    console.log('❌ [UnifiedThumbnail] Error with domain:', HABBO_DOMAINS[currentDomainIndex]);
    
    if (currentDomainIndex < HABBO_DOMAINS.length - 1) {
      // Tentar próximo domínio
      setCurrentDomainIndex(prev => prev + 1);
      setIsLoading(true);
    } else {
      // Todos os domínios falharam
      setImageError(true);
      setIsLoading(false);
      console.error('❌ [UnifiedThumbnail] All domains failed:', item.name);
    }
  };

  const thumbnailUrl = generateThumbnailUrl(currentDomainIndex);
  const cropStyle = getCropStyle(item.category);

  // Badge de fonte
  const getSourceBadge = (source: string) => {
    const badges = {
      'viajovem': { label: 'VJ', color: 'bg-green-500' },
      'habbowidgets': { label: 'HW', color: 'bg-blue-500' },
      'official-habbo': { label: 'OF', color: 'bg-purple-500' },
      'flash-assets': { label: 'FL', color: 'bg-orange-500' }
    };
    
    return badges[source as keyof typeof badges] || { label: 'UN', color: 'bg-gray-500' };
  };

  const sourceBadge = getSourceBadge(item.source);

  return (
    <div className={`relative ${className}`}>
      {/* Container da thumbnail focada */}
      <div
        className={`
          aspect-square cursor-pointer transition-all duration-200 hover:scale-105
          bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg overflow-hidden 
          border-2 relative
          ${isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200 hover:border-gray-300'}
        `}
        onClick={onClick}
        title={`${item.name} (${item.figureId}) - ${item.source}`}
        style={{ width: '80px', height: '80px' }}
      >
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Imagem focada com habbo-imaging */}
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full"
            style={{
              ...cropStyle,
              imageRendering: 'pixelated',
              transformOrigin: 'center'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs p-2">
            <span className="text-lg">❌</span>
            <span className="mt-1 text-center">Erro</span>
            <span className="text-[10px] mt-1">{item.figureId}</span>
          </div>
        )}

        {/* Badge da fonte */}
        <div className={`absolute top-1 left-1 ${sourceBadge.color} text-white text-xs px-1 py-0.5 rounded font-bold shadow-sm`}>
          {sourceBadge.label}
        </div>

        {/* Badge HC */}
        {item.club === 'HC' && (
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
          {item.name}
        </div>
        <div className="text-[10px] text-center text-gray-500">
          {item.category.toUpperCase()}-{item.figureId}
        </div>
      </div>

      {/* Paleta de cores unificada */}
      {item.colors.length > 1 && (
        <div className="mt-1 flex justify-center gap-0.5 flex-wrap">
          {item.colors.slice(0, 6).map((color) => {
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
    '1': '#FFFFFF',
    '2': '#000000',
    '3': '#C0C0C0',
    '4': '#808080',
    '5': '#FFC0CB',
    '6': '#D2B48C',
    '21': '#1C1C1C',
    '26': '#DC143C',
    '31': '#32CD32',
    '45': '#8B4513',
    '61': '#4169E1',
    '80': '#654321',
    '82': '#6495ED',
    '92': '#FFD700',
    '100': '#FF69B4',
    '104': '#8B0000',
    '106': '#FF8C00',
    '143': '#9370DB'
  };
  
  return officialColors[colorId] || '#E5E5E5';
};

export default UnifiedClothingThumbnail;
