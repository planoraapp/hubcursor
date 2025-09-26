
import React, { useState } from 'react';
import { HomeWidget } from './HomeWidget';
import { HomeSticker } from './HomeSticker';
import { ExpandableHomeToolbar } from './ExpandableHomeToolbar';
import { useIsMobile } from '@/hooks/use-mobile';
import type { 
  Widget, 
  Sticker, 
  Background, 
  HabboData, 
  HomeCanvasProps 
} from '@/types/habbo';

export const HomeCanvas: React.FC<HomeCanvasProps> = ({
  widgets,
  stickers,
  background,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  currentUser,
  onWidgetPositionChange,
  onStickerPositionChange,
  onStickerRemove,
  onWidgetRemove,
  onOpenAssetsModal,
  onToggleEditMode,
  onSave,
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd,
  onGuestbookSubmit,
  onGuestbookDelete
}) => {
  const isMobile = useIsMobile();

    // Função para detectar se um background é "grande" (imagem única) ou "pequeno" (padrão repetido)
  const isLargeBackground = (bgValue: string): boolean => {
    // Exceções: sempre usar repeat (tratar como pequenos)
    const alwaysRepeatPatterns = [
      'papel', 'pattern', 'texture', 'tile'
    ];
    if (alwaysRepeatPatterns.some(pattern => bgValue.toLowerCase().includes(pattern.toLowerCase()))) {
      return false; // Força repeat
    }

    // Lista de backgrounds grandes que devem ser exibidos como imagem única
    const largeBackgrounds = [
      'bghabbohub.png',
      'bghabbohub.gif',
      'home.gif',
      'web_view_bg_',
      'habbo_bg_',
      'room_bg_',
      'casa_bg_',
      'ambiente_',
      'cenario_',
      'groupbg_',      // Backgrounds de grupos grandes
      'space_',        // Backgrounds espaciais
      'scifi_',        // Backgrounds de ficção científica
      'landscape_',    // Paisagens
      'city_',         // Cidades
      'forest_',       // Florestas
      'ocean_',        // Oceanos
      'mountain_',     // Montanhas
      'sky_',          // Céus
      'wallpaper_',    // Wallpapers
      'background_'    // Backgrounds genéricos
    ];
    
    // Verifica se o background contém algum dos padrões de backgrounds grandes
    const hasLargePattern = largeBackgrounds.some(pattern => bgValue.toLowerCase().includes(pattern.toLowerCase()));
    
    // Verifica se é um arquivo de background grande baseado em extensões e padrões
    const isLargeFile = bgValue.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/) && 
                       (bgValue.toLowerCase().includes('bg') || 
                        bgValue.toLowerCase().includes('background') ||
                        bgValue.toLowerCase().includes('wallpaper') ||
                        bgValue.toLowerCase().includes('landscape') ||
                        bgValue.toLowerCase().includes('room') ||
                        bgValue.toLowerCase().includes('space') ||
                        bgValue.toLowerCase().includes('city') ||
                        bgValue.toLowerCase().includes('forest') ||
                        bgValue.toLowerCase().includes('ocean') ||
                        bgValue.toLowerCase().includes('mountain') ||
                        bgValue.toLowerCase().includes('sky'));
    
    return hasLargePattern || isLargeFile;
  };

  // Intelligent background style logic
  const getBackgroundStyle = () => {
    const baseStyle = {
      backgroundColor: background.background_type === 'color' ? background.background_value : '#c7d2dc',
    };

    // Se não é uma imagem, retorna o estilo base
    if (background.background_type === 'color') {
      return baseStyle;
    }

    // Para backgrounds de imagem, aplicar lógica inteligente
    if (background.background_type === 'cover' || background.background_type === 'repeat' || background.background_type === 'image') {
      const isLarge = isLargeBackground(background.background_value);
      
      if (isLarge) {
        // Background grande: exibir como imagem única expandida
        return {
          ...baseStyle,
          backgroundImage: `url("${background.background_value}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      } else {
        // Background pequeno: repetir para preencher toda a área
        return {
          ...baseStyle,
          backgroundImage: `url("${background.background_value}")`,
          backgroundSize: 'auto',
          backgroundPosition: 'top left',
          backgroundRepeat: 'repeat'
        };
      }
    }

    return baseStyle;
  };

  const backgroundStyle = getBackgroundStyle();
  
  const isLarge = background.background_type !== 'color' ? isLargeBackground(background.background_value) : false;
  
    return (
    <div className="flex justify-center">
      <div 
        data-canvas="true"
        className={`relative rounded-lg overflow-hidden shadow-2xl ${
          isEditMode ? 'border-4 border-dashed border-blue-400' : 'border-2 border-gray-300'
        }`}
        style={{
          width: isMobile ? '768px' : '1080px',
          height: isMobile ? '1280px' : '1800px',
          ...backgroundStyle
        }}
      >
        {/* Toolbar Expansível - Dentro do Canvas */}
        {isEditMode && isOwner && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
            <ExpandableHomeToolbar
              onBackgroundChange={onBackgroundChange}
              onStickerAdd={onStickerAdd}
              onWidgetAdd={onWidgetAdd}
              onSave={onSave}
              onToggleEditMode={onToggleEditMode}
            />
          </div>
        )}

        {/* Ícone de Edição no Canto Superior Direito - Apenas para donos quando não está editando */}

        {isOwner && !isEditMode && onToggleEditMode && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={onToggleEditMode}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 shadow-lg bg-yellow-500 hover:bg-yellow-600 border-2 border-black cursor-pointer flex items-center justify-center"
              style={{
                width: '48px',
                height: '48px',
                display: 'flex',
                visibility: 'visible',
                opacity: '1',
                position: 'relative'
              }}
              title="Entrar no Modo de Edição"
            >
              <img
                src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/editinghome.png"
                alt="Editar Home"
                className="w-full h-full object-contain"
                style={{ 
                  imageRendering: 'pixelated',
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const button = target.parentElement as HTMLButtonElement;
                  button.innerHTML = '✏️';
                  button.style.fontSize = '24px';
                  button.style.color = 'black';
                }}
              />
            </button>
          </div>
        )}
        {/* Renderizar Widgets */}
        {widgets.map((widget) => (
          <HomeWidget
            key={widget.id}
            widget={widget}
            habboData={habboData}
            guestbook={guestbook}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onPositionChange={onWidgetPositionChange}
            onRemove={onWidgetRemove}
            onGuestbookSubmit={onGuestbookSubmit}
            onGuestbookDelete={onGuestbookDelete}
            currentUser={currentUser}
          />
        ))}

        {/* Renderizar Stickers */}
        {stickers.map((sticker) => (
          <HomeSticker
            key={sticker.id}
            sticker={sticker}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onPositionChange={onStickerPositionChange}
            onRemove={onStickerRemove}
          />
        ))}

      </div>
    </div>
  );
};
