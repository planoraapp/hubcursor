import React, { useState } from 'react';
import { HomeWidget } from './HomeWidget';
import { HomeSticker } from './HomeSticker';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Edit3, Save, X, Palette, Plus, Trash2, Move } from 'lucide-react';

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
  onBackgroundChange?: (type: 'color' | 'cover' | 'repeat', value: string) => void;
  onStickerAdd?: (stickerType: string) => void;
  onWidgetAdd?: (widgetType: string) => void;
  onSave?: () => void;
  onExitEditMode?: () => void;
  showBackgroundPicker?: boolean;
  setShowBackgroundPicker?: (show: boolean) => void;
  showWidgetPicker?: boolean;
  setShowWidgetPicker?: (show: boolean) => void;
  showStickerPicker?: boolean;
  setShowStickerPicker?: (show: boolean) => void;
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
  onStickerRemove,
  onWidgetRemove,
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd,
  onSave,
  onExitEditMode,
  showBackgroundPicker = false,
  setShowBackgroundPicker,
  showWidgetPicker = false,
  setShowWidgetPicker,
  showStickerPicker = false,
  setShowStickerPicker,
}) => {
  const isMobile = useIsMobile();
  const [draggedItem, setDraggedItem] = useState<{ type: 'widget' | 'sticker', id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Função para arrastar e soltar com limites
  const handleDragStart = (e: React.MouseEvent, type: 'widget' | 'sticker', id: string) => {
    if (!isEditMode || !isOwner) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDraggedItem({ type, id });
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggedItem || !isEditMode || !isOwner) return;
    
    const canvas = document.getElementById('home-canvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;
    
    // Aplicar limites
    const maxX = 1080 - (draggedItem.type === 'widget' ? 200 : 50);
    const maxY = 1800 - (draggedItem.type === 'widget' ? 100 : 50);
    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));
    
    if (draggedItem.type === 'widget') {
      onWidgetPositionChange(draggedItem.id, constrainedX, constrainedY);
    } else {
      onStickerPositionChange(draggedItem.id, constrainedX, constrainedY);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOffset({ x: 0, y: 0 });
  };

  // Adicionar event listeners para drag
  React.useEffect(() => {
    if (draggedItem) {
      const handleMouseMove = (e: MouseEvent) => {
        handleDragMove(e as any);
      };
      
      const handleMouseUp = () => {
        handleDragEnd();
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedItem, dragOffset, isEditMode, isOwner]);

  // Widgets permitidos (apenas 3)
  const allowedWidgets = ['avatar', 'guestbook', 'rating'];
  
  // Filtrar widgets para mostrar apenas os permitidos
  const filteredWidgets = widgets.filter(widget => allowedWidgets.includes(widget.widget_type));

  return (
    <div className="relative w-full h-full">
      {/* Canvas da Home */}
      <div
        id="home-canvas"
        className="relative mx-auto overflow-hidden"
        style={{
          width: '1080px',
          height: '1800px',
          backgroundColor: background?.background_type === 'color' ? background.background_value : '#e8f4fd',
          backgroundImage: background?.background_type === 'cover' ? `url(${background.background_value})` : undefined,
          backgroundSize: background?.background_type === 'cover' ? 'cover' : undefined,
          backgroundPosition: 'center',
          backgroundRepeat: background?.background_type === 'repeat' ? 'repeat' : 'no-repeat',
        }}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
      >
        {/* Barra de Edição - Substitui o lembrete */}
        {isEditMode && isOwner && (
          <div className="absolute top-4 left-4 right-4 z-50">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg volter-font">Editor de Home</h3>
                    <Badge variant="default">
                      Modo Edição
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowBackgroundPicker?.(!showBackgroundPicker)}
                      variant="outline"
                      size="sm"
                      className="volter-font"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Background
                    </Button>
                    
                    <Button
                      onClick={() => setShowWidgetPicker?.(!showWidgetPicker)}
                      variant="outline"
                      size="sm"
                      className="volter-font"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Widgets
                    </Button>
                    
                    <Button
                      onClick={() => setShowStickerPicker?.(!showStickerPicker)}
                      variant="outline"
                      size="sm"
                      className="volter-font"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Stickers
                    </Button>
                    
                    <Button
                      onClick={onSave}
                      variant="default"
                      size="sm"
                      className="volter-font"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    
                    <Button
                      onClick={onExitEditMode}
                      variant="outline"
                      size="sm"
                      className="volter-font"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                </div>
                
                {/* Seletor de Background */}
                {showBackgroundPicker && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-bold mb-2 volter-font">Escolher Background</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        onClick={() => onBackgroundChange?.('color', '#e8f4fd')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Azul Claro
                      </Button>
                      <Button
                        onClick={() => onBackgroundChange?.('color', '#f0f8ff')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Branco
                      </Button>
                      <Button
                        onClick={() => onBackgroundChange?.('color', '#f0f0f0')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Cinza
                      </Button>
                      <Button
                        onClick={() => onBackgroundChange?.('color', '#ffe4e1')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Rosa
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Seletor de Widgets */}
                {showWidgetPicker && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-bold mb-2 volter-font">Adicionar Widgets</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => onWidgetAdd?.('guestbook')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Guestbook
                      </Button>
                      <Button
                        onClick={() => onWidgetAdd?.('rating')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Avaliações
                      </Button>
                      <Button
                        onClick={() => onWidgetAdd?.('avatar')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        Card de Perfil
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Seletor de Stickers */}
                {showStickerPicker && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-bold mb-2 volter-font">Adicionar Stickers</h4>
                    <div className="grid grid-cols-4 gap-2">
                      <Button
                        onClick={() => onStickerAdd?.('heart')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        ❤️ Coração
                      </Button>
                      <Button
                        onClick={() => onStickerAdd?.('star')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        ⭐ Estrela
                      </Button>
                      <Button
                        onClick={() => onStickerAdd?.('flower')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        🌸 Flor
                      </Button>
                      <Button
                        onClick={() => onStickerAdd?.('gem')}
                        variant="outline"
                        size="sm"
                        className="volter-font"
                      >
                        💎 Gema
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Widgets */}
        {filteredWidgets.map((widget) => (
          <div
            key={widget.id}
            className={`absolute ${isEditMode && isOwner ? 'cursor-move' : 'cursor-default'}`}
            style={{
              left: `${widget.x}px`,
              top: `${widget.y}px`,
              width: `${widget.width}px`,
              height: `${widget.height}px`,
              zIndex: widget.z_index,
              opacity: widget.is_visible ? 1 : 0.5,
              transform: 'scale(1)',
              transition: '0.2s ease-out',
            }}
            onMouseDown={(e) => handleDragStart(e, 'widget', widget.id)}
          >
            <HomeWidget
              widget={widget}
              habboData={habboData}
              guestbook={guestbook}
              isEditMode={isEditMode}
              isOwner={isOwner}
              onRemove={() => onWidgetRemove?.(widget.id)}
            />
            
            {/* Botão de remoção para widgets (exceto avatar) */}
            {isEditMode && isOwner && widget.widget_type !== 'avatar' && (
              <button
                onClick={() => onWidgetRemove?.(widget.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10"
                title="Remover widget"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}

        {/* Stickers */}
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className={`absolute ${isEditMode && isOwner ? 'cursor-move' : 'cursor-default'}`}
            style={{
              left: `${sticker.x}px`,
              top: `${sticker.y}px`,
              zIndex: sticker.z_index,
              transform: `scale(${sticker.scale}) rotate(${sticker.rotation}deg)`,
              transition: '0.2s ease-out',
            }}
            onMouseDown={(e) => handleDragStart(e, 'sticker', sticker.id)}
          >
            <HomeSticker
              sticker={sticker}
              isEditMode={isEditMode}
              isOwner={isOwner}
              onRemove={() => onStickerRemove(sticker.id)}
            />
            
            {/* Botão de remoção para stickers */}
            {isEditMode && isOwner && (
              <button
                onClick={() => onStickerRemove(sticker.id)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-10"
                title="Remover sticker"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
