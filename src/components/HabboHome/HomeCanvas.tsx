
import React from 'react';
import { HomeWidget } from './HomeWidget';
import { HomeSticker } from './HomeSticker';
import { ExpandableHomeToolbar } from './ExpandableHomeToolbar';
import { useIsMobile } from '@/hooks/use-mobile';

interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
}

interface Sticker {
  id: string;
  sticker_id: string;
  x: number;
  y: number;
  z_index: number;
  scale: number;
  rotation: number;
  sticker_src: string;
  category: string;
}

interface Background {
  background_type: 'color' | 'cover' | 'repeat' | 'image';
  background_value: string;
}

interface HabboData {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
  memberSince?: string;
}

interface HomeCanvasProps {
  widgets: Widget[];
  stickers: Sticker[];
  background: Background;
  habboData: HabboData;
  guestbook: any[];
  isEditMode: boolean;
  isOwner: boolean;
  onWidgetPositionChange: (widgetId: string, x: number, y: number) => void;
  onStickerPositionChange: (stickerId: string, x: number, y: number) => void;
  onStickerRemove: (stickerId: string) => void;
  onWidgetRemove?: (widgetId: string) => void;
  onOpenAssetsModal?: (type: 'stickers' | 'widgets' | 'backgrounds') => void;
  onToggleEditMode?: () => void;
  onSave?: () => void;
  onBackgroundChange?: (type: 'color' | 'cover' | 'repeat', value: string) => void;
  onStickerAdd?: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd?: (widgetType: string) => Promise<boolean>;
  onGuestbookSubmit?: (message: string) => Promise<any>;
  onGuestbookDelete?: (entryId: string) => Promise<void>;
  currentUser?: {
    id: string;
    habbo_name: string;
  } | null;
}

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
  console.log('🖼️ HomeCanvas renderizando:', {
    widgetsCount: widgets.length,
    stickersCount: stickers.length,
    background,
    isEditMode,
    isOwner
  });

  // Intelligent background style logic
  const getBackgroundStyle = () => {
    const baseStyle = {
      backgroundColor: background.background_type === 'color' ? background.background_value : '#c7d2dc',
    };

    if (background.background_type === 'cover' || background.background_type === 'repeat') {
      return {
        ...baseStyle,
        backgroundImage: `url("${background.background_value}")`,
        backgroundSize: background.background_type === 'cover' ? 'cover' : 'auto',
        backgroundPosition: background.background_type === 'cover' ? 'center' : 'top left',
        backgroundRepeat: background.background_type === 'repeat' ? 'repeat' : 'no-repeat'
      };
    }

    // Para imagens únicas (não cover nem repeat), esticar para preencher o canvas
    if (background.background_type === 'image') {
      return {
        ...baseStyle,
        backgroundImage: `url("${background.background_value}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    return baseStyle;
  };

  const backgroundStyle = getBackgroundStyle();
  
  console.log('🎨 Background aplicado:', backgroundStyle);

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
        {(() => {
          console.log('🔍 [DEBUG] Condições do botão de edição:', {
            isOwner,
            isEditMode,
            hasToggleEditMode: !!onToggleEditMode,
            shouldShow: isOwner && !isEditMode && onToggleEditMode
          });
          return null;
        })()}
        {isOwner && !isEditMode && onToggleEditMode && (
          <div className="absolute top-4 right-4 z-30">
            <button
              onClick={onToggleEditMode}
              className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-110 shadow-lg bg-yellow-500 hover:bg-yellow-600 border-2 border-black cursor-pointer"
              style={{
                width: '48px',
                height: '48px',
                backgroundImage: `url('https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home-assets/editinghome.png')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                imageRendering: 'pixelated'
              }}
              title="Entrar no Modo de Edição"
            />
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

        {/* Estado vazio */}
        {widgets.length === 0 && stickers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 text-center border-2 border-black">
              <h3 className="text-xl text-gray-800 mb-2 volter-font">
                Home em construção
              </h3>
              <p className="text-gray-600 volter-font">
                Esta Habbo Home ainda está sendo configurada.
              </p>
              {isOwner && (
                <p className="text-sm text-blue-600 mt-2 volter-font">
                  Clique em "Editar" para personalizar!
                </p>
              )}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};
