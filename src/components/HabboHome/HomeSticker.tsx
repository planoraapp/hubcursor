
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
  onStickerUpdate?: (stickerId: string, updates: Partial<Sticker>) => void;
}

export const HomeSticker: React.FC<HomeStickerProps> = ({
  sticker,
  isEditMode,
  isOwner,
  onPositionChange,
  onRemove,
  onStickerUpdate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: sticker.x, elementY: sticker.y });
  const [isSelected, setIsSelected] = useState(false);
  const [localScale, setLocalScale] = useState(sticker.scale);
  const stickerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    e.preventDefault();
    e.stopPropagation();
    setIsSelected(prev => !prev);
  }, [isEditMode, isOwner]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    
    e.preventDefault();
    e.stopPropagation();

    console.log('🎯 Iniciando drag do sticker:', { stickerId: sticker.id, stickerSrc: sticker.sticker_src });

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: sticker.x,
      elementY: sticker.y
    });
  }, [isEditMode, isOwner, sticker.x, sticker.y, sticker.id, sticker.sticker_src]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(sticker.id);
  }, [sticker.id, onRemove]);



  // Handle click outside to deselect
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isSelected || !stickerRef.current) return;
      
      const target = e.target as HTMLElement;
      const stickerElement = stickerRef.current;
      
      // Check if click is outside this sticker
      if (!stickerElement.contains(target)) {
        setIsSelected(false);
      }
    };

    if (isSelected && isEditMode && isOwner) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSelected, isEditMode, isOwner]);

  React.useEffect(() => {
    let animationId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const canvasWidth = 1000; // Canvas width
        const canvasHeight = 1400; // Canvas height
        const stickerSize = 100; // Approximate sticker size
        const newX = Math.max(0, Math.min(canvasWidth - stickerSize, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(canvasHeight - stickerSize, dragStart.elementY + deltaY));
        
        console.log('🎯 Movendo sticker:', { stickerId: sticker.id, newX, newY, deltaX, deltaY });
        onPositionChange(sticker.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        cancelAnimationFrame(animationId);
        console.log('✅ Drag completo do sticker:', { stickerId: sticker.id, stickerSrc: sticker.sticker_src });
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      cancelAnimationFrame(animationId);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, sticker]);

  const containerStyle = {
    left: sticker.x,
    top: sticker.y,
    zIndex: isDragging ? 9999 : sticker.z_index,
    transform: `scale(${localScale})`,
    transformOrigin: 'center',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    opacity: isDragging ? 0.8 : 1
  };

  console.log(`🎯 Renderizando sticker ${sticker.sticker_id} em posição (${sticker.x}, ${sticker.y}) com src: ${sticker.sticker_src}`);

  return (
    <div
      ref={stickerRef}
      data-sticker-id={sticker.id}
      className={`absolute pointer-events-auto select-none ${
        isEditMode && isOwner
          ? 'cursor-move transition-transform ring-1 ring-blue-300 ring-opacity-50 rounded' 
          : 'cursor-default'
      }`}
      style={containerStyle}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      <img
        src={sticker.sticker_src}
        alt={`Sticker ${sticker.sticker_id}`}
        className="select-none pointer-events-none"
        style={{ 
          imageRendering: 'pixelated',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        draggable={false}
        onError={(e) => {
          console.error(`❌ Erro ao carregar sticker: ${sticker.sticker_src}`);
          const target = e.target as HTMLImageElement;
          target.src = '/assets/frank.png';
        }}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          console.log(`✅ Sticker carregado: ${sticker.sticker_src} - Tamanho natural: ${img.naturalWidth}x${img.naturalHeight}`);
        }}
      />
      
      {isEditMode && isOwner && (
        <>
          {/* Botão X - Canto superior direito */}
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm flex items-center justify-center shadow-lg z-10"
            title="Remover"
          >
            ×
          </button>

        </>
      )}

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
