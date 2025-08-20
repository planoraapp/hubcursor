
import React, { useState, useRef, useCallback } from 'react';
import { RotationControl } from './RotationControl';

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
  const [localRotation, setLocalRotation] = useState(sticker.rotation);
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

  const handleRotationChange = useCallback((rotation: number) => {
    setLocalRotation(rotation);
    if (onStickerUpdate) {
      onStickerUpdate(sticker.id, { rotation });
    }
  }, [sticker.id, onStickerUpdate]);

  const handleScaleChange = useCallback((scale: number) => {
    setLocalScale(scale);
    if (onStickerUpdate) {
      onStickerUpdate(sticker.id, { scale });
    }
  }, [sticker.id, onStickerUpdate]);

  const handleScaleUp = useCallback(() => {
    const newScale = Math.min(3, localScale + 0.1);
    handleScaleChange(newScale);
  }, [localScale, handleScaleChange]);

  const handleScaleDown = useCallback(() => {
    const newScale = Math.max(0.3, localScale - 0.1);
    handleScaleChange(newScale);
  }, [localScale, handleScaleChange]);

  React.useEffect(() => {
    let animationId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(() => {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;
          const canvasWidth = 768; // Use mobile width for consistency
          const canvasHeight = 1280; // Use mobile height for consistency
          const newX = Math.max(0, Math.min(canvasWidth - 100, dragStart.elementX + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - 100, dragStart.elementY + deltaY));
          
          onPositionChange(sticker.id, newX, newY);
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        cancelAnimationFrame(animationId);
        console.log(`✅ Drag completo do sticker ${sticker.sticker_id}`);
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
    transform: `scale(${isDragging ? Math.abs(localScale) * 1.1 : localScale}) rotate(${localRotation}deg)`,
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
          ? 'cursor-move hover:scale-110 transition-transform ring-1 ring-blue-300 ring-opacity-50 rounded' 
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
      
      {isEditMode && isOwner && isSelected && (
        <>
          {/* Botão X - Canto superior direito */}
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg z-10"
            title="Remover"
          >
            ×
          </button>

          {/* Controles de escala - Canto superior esquerdo */}
          <div className="absolute -top-2 -left-2 flex gap-1">
            <button
              onClick={handleScaleDown}
              className="w-5 h-5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center shadow-lg"
              title="Diminuir"
            >
              −
            </button>
            <button
              onClick={handleScaleUp}
              className="w-5 h-5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center shadow-lg"
              title="Aumentar"
            >
              +
            </button>
          </div>

          {/* Controle de Rotação 360° */}
          <RotationControl
            rotation={localRotation}
            onRotationChange={handleRotationChange}
            className="opacity-80 hover:opacity-100 transition-opacity"
          />
        </>
      )}

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
