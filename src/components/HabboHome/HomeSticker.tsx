
import React, { useState, useRef, useCallback } from 'react';

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

interface HomeStickerProps {
  sticker: Sticker;
  isEditMode: boolean;
  isOwner: boolean;
  onPositionChange: (stickerId: string, x: number, y: number) => void;
  onRemove: (stickerId: string) => void;
}

export const HomeSticker: React.FC<HomeStickerProps> = ({
  sticker,
  isEditMode,
  isOwner,
  onPositionChange,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: sticker.x, elementY: sticker.y });
  const stickerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: sticker.x,
      elementY: sticker.y
    });

    console.log(`🎯 Iniciando drag do sticker ${sticker.sticker_id}`);
  }, [isEditMode, isOwner, sticker.x, sticker.y, sticker.sticker_id]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(sticker.id);
  }, [sticker.id, onRemove]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, Math.min(1200 - 100, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(800 - 100, dragStart.elementY + deltaY));
        
        onPositionChange(sticker.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        console.log(`✅ Drag completo do sticker ${sticker.sticker_id}`);
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, sticker]);

  const containerStyle = {
    left: sticker.x,
    top: sticker.y,
    zIndex: isDragging ? 9999 : sticker.z_index,
    transform: `scale(${isDragging ? sticker.scale * 1.1 : sticker.scale}) rotate(${sticker.rotation}deg)`,
    transformOrigin: 'center',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    opacity: isDragging ? 0.8 : 1
  };

  console.log(`🎯 Renderizando sticker ${sticker.sticker_id} em posição (${sticker.x}, ${sticker.y}) com src: ${sticker.sticker_src}`);

  return (
    <div
      ref={stickerRef}
      className={`absolute pointer-events-auto select-none ${
        isEditMode && isOwner
          ? 'cursor-move hover:scale-110 transition-transform ring-1 ring-blue-300 ring-opacity-50 rounded' 
          : 'cursor-default'
      }`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      <img
        src={sticker.sticker_src}
        alt={`Sticker ${sticker.sticker_id}`}
        className="object-contain select-none pointer-events-none"
        style={{ 
          imageRendering: 'pixelated',
          width: 'auto',
          height: 'auto',
          maxWidth: '150px', // Increased from 120px to allow for real size
          maxHeight: '150px', // Increased from 120px to allow for real size
          minWidth: '24px', // Decreased minimum to allow smaller stickers
          minHeight: '24px' // Decreased minimum to allow smaller stickers
        }}
        draggable={false}
        onError={(e) => {
          console.error(`❌ Erro ao carregar sticker: ${sticker.sticker_src}`);
          const target = e.target as HTMLImageElement;
          target.src = '/assets/frank.png'; // Fallback
        }}
        onLoad={() => {
          console.log(`✅ Sticker carregado com sucesso: ${sticker.sticker_src}`);
        }}
      />
      
      {/* Controles de edição */}
      {isEditMode && isOwner && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/80 rounded px-2 py-1">
          <button
            onClick={handleRemove}
            className="w-5 h-5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            title="Remover"
          >
            ×
          </button>
        </div>
      )}

      {/* Indicador de drag */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
