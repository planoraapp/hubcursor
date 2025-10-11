import React from 'react';
import { HotelTag } from './HotelTag';

interface HomeCardProps {
  home: {
    user_id: string;
    habbo_name?: string;
    hotel?: string;
    updated_at: string;
    background_type?: string;
    background_value?: string;
  };
  onHomeClick: (userId: string, habboName?: string, hotel?: string) => void;
}

export const HomeCard: React.FC<HomeCardProps> = ({ 
  home, 
  onHomeClick
}) => {
  const handleClick = () => {
    console.log('🖱️ HomeCard clicado:', { 
      user_id: home.user_id, 
      habbo_name: home.habbo_name, 
      hotel: home.hotel 
    });
    onHomeClick(home.user_id, home.habbo_name, home.hotel);
  };

  // Gerar URL do background da casa baseado no tipo
  const getHomeBackgroundUrl = () => {
    if (!home.background_value) return null;
    
    // Detectar automaticamente se é uma URL de imagem
    const isImageUrl = home.background_value.startsWith('http') || 
                      home.background_value.startsWith('/') ||
                      home.background_value.includes('.gif') ||
                      home.background_value.includes('.png') ||
                      home.background_value.includes('.jpg') ||
                      home.background_value.includes('.jpeg') ||
                      home.background_value.includes('.webp');
    
    // Se for uma URL de imagem, usar diretamente
    if (isImageUrl) {
      return `url(${home.background_value})`;
    }
    
    // Se for uma cor hexadecimal
    if (home.background_value.startsWith('#')) {
      return `linear-gradient(135deg, ${home.background_value} 0%, ${home.background_value}dd 100%)`;
    }
    
    // Se for um nome de background (como "bghabbohub"), tentar construir a URL
    if (home.background_value === 'bghabbohub') {
      return `url(/assets/bghabbohub.png)`;
    }
    
    // Fallback para o tipo definido
    switch (home.background_type) {
      case 'image':
        return `url(${home.background_value})`;
      case 'color':
        return `linear-gradient(135deg, ${home.background_value} 0%, ${home.background_value}dd 100%)`;
      case 'repeat':
        return `url(${home.background_value})`;
      case 'cover':
        return `url(${home.background_value})`;
      case 'default':
        // Para tipo "default", tentar construir a URL baseada no valor
        if (home.background_value === 'bghabbohub') {
          return `url(/assets/bghabbohub.png)`;
        }
        return `url(/assets/${home.background_value}.png)`;
      default:
        return null;
    }
  };

  const backgroundUrl = getHomeBackgroundUrl();

  // Determinar cor de fundo baseada no tipo de background
  const getBackgroundColor = () => {
    if (home.background_value?.startsWith('#')) {
      return home.background_value;
    }
    if (home.background_type === 'color' && home.background_value) {
      return home.background_value;
    }
    return '#c7d2dc'; // Cor padrão
  };

  // Determinar configurações de background baseadas no tipo
  const getBackgroundSettings = () => {
    switch (home.background_type) {
      case 'repeat':
        return {
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat'
        };
      case 'cover':
        return {
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        };
    }
  };

  const backgroundSettings = getBackgroundSettings();

  return (
    <div 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 min-w-[200px] h-32 flex-shrink-0 rounded-lg overflow-hidden relative"
      onClick={handleClick}
    >
      {/* Home Preview Canvas - Ocupando toda a altura */}
      <div 
        className="w-full h-full relative"
        style={{ 
          backgroundColor: getBackgroundColor(),
          backgroundImage: backgroundUrl,
          backgroundSize: backgroundSettings.backgroundSize,
          backgroundPosition: 'center',
          backgroundRepeat: backgroundSettings.backgroundRepeat,
          imageRendering: 'pixelated' // Preserva a pixel art
        }}
      >
        {/* Overlay sutil para melhorar legibilidade do avatar */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Avatar do usuário sobreposto - Sem bordas, ocupando toda a altura */}
        <div className="absolute inset-0 flex items-end justify-end p-2">
          {home.habbo_name ? (
            <img
              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${home.habbo_name}&size=l&direction=2&head_direction=3&gesture=sml&action=std`}
              alt={home.habbo_name}
              className="h-full w-auto object-contain"
              style={{ imageRendering: 'pixelated' }} // Preserva a pixel art
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/assets/placeholder.svg';
              }}
            />
          ) : (
            <div className="h-full w-16 bg-gray-300/50 flex items-center justify-center rounded">
              <span className="text-xs text-gray-600">?</span>
            </div>
          )}
        </div>
        
        {/* Nome do usuário e tag do hotel sobrepostos */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div 
            className="text-white text-sm px-2 py-1"
            style={{
              textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
            }}
          >
            {home.habbo_name || 'Usuário'}
          </div>
          {home.hotel && (
            <HotelTag 
              hotelId={home.hotel} 
              size="sm" 
              className="w-fit"
            />
          )}
        </div>
      </div>
    </div>
  );
};