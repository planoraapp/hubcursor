
import React from 'react';
import { HomeWidget } from './HomeWidget';
import { HomeSticker } from './HomeSticker';

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
  background_type: 'color' | 'cover' | 'repeat';
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
}

export const HomeCanvas: React.FC<HomeCanvasProps> = ({
  widgets,
  stickers,
  background,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onWidgetPositionChange,
  onStickerPositionChange,
  onStickerRemove
}) => {
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

    return baseStyle;
  };

  const backgroundStyle = getBackgroundStyle();
  
  console.log('🎨 Background aplicado:', backgroundStyle);

  return (
    <div className="flex justify-center">
      <div 
        className={`relative rounded-lg overflow-hidden shadow-2xl ${
          isEditMode ? 'border-4 border-dashed border-blue-400' : 'border-2 border-gray-300'
        }`}
        style={{
          width: '1200px',
          height: '1000px', // Increased height from 800px to 1000px
          ...backgroundStyle
        }}
      >
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

        {/* Instruções do modo de edição */}
        {isEditMode && isOwner && (
          <div className="absolute top-4 left-4 bg-blue-100/90 backdrop-blur-sm rounded-lg p-3 border border-blue-300">
            <p className="text-sm text-blue-800 volter-font">
              💡 Modo de edição ativo - use a toolbar para adicionar itens
            </p>
          </div>
        )}

        {/* Debug info */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs p-2 rounded volter-font">
          W:{widgets.length} | S:{stickers.length} | Edit:{isEditMode ? 'ON' : 'OFF'} | Owner:{isOwner ? 'YES' : 'NO'} | 1200x1000
        </div>
      </div>
    </div>
  );
};
