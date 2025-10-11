
import React, { useState, useRef, useCallback } from 'react';

import type { Sticker } from '@/types/habbo';
interface HomeStickerProps {
  sticker: Sticker;
  isEditMode: boolean;
  isOwner: boolean;
  onPositionChange: (stickerId: string, x: number, y: number) => void;
  onRemove: (stickerId: string) => void;
  onStickerUpdate?: (stickerId: string, updates: Partial<Sticker>) => void;
  onSelectionChange?: (stickerId: string | null) => void;
  onBringToFront?: (stickerId: string) => void;
}

export const HomeSticker: React.FC<HomeStickerProps> = ({
  sticker,
  isEditMode,
  isOwner,
  onPositionChange,
  onRemove,
  onStickerUpdate,
  onSelectionChange,
  onBringToFront
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: sticker.x, elementY: sticker.y });
  const [isSelected, setIsSelected] = useState(false);
  const [isSmallSticker, setIsSmallSticker] = useState(false);
  const stickerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    e.preventDefault();
    e.stopPropagation();
    const newSelected = !isSelected;
    setIsSelected(newSelected);
    if (onSelectionChange) {
      onSelectionChange(newSelected ? sticker.id : null);
    }
  }, [isEditMode, isOwner, isSelected, onSelectionChange, sticker.id]);

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

      }, [isEditMode, isOwner, sticker.x, sticker.y]);

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
    let hasMoved = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(() => {
          const deltaX = e.clientX - dragStart.x;
          const deltaY = e.clientY - dragStart.y;
          
          // Trazer para frente na primeira vez que mover
          if (!hasMoved && (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2)) {
            hasMoved = true;
            if (onBringToFront) {
              onBringToFront(sticker.id);
            }
          }
          
          // Obter as dimensões reais do canvas
          const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
          const canvasWidth = canvasElement ? canvasElement.offsetWidth : 768;
          const canvasHeight = canvasElement ? canvasElement.offsetHeight : 1280;
          
          // Permitir movimento por todo o canvas, considerando o tamanho do sticker
          const stickerSize = 100; // Tamanho aproximado do sticker
          const newX = Math.max(0, Math.min(canvasWidth - stickerSize, dragStart.elementX + deltaX));
          const newY = Math.max(0, Math.min(canvasHeight - stickerSize, dragStart.elementY + deltaY));
          
          onPositionChange(sticker.id, newX, newY);
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        cancelAnimationFrame(animationId);
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
  }, [isDragging, dragStart, onPositionChange, sticker, onBringToFront]);

  const containerStyle = {
    left: sticker.x,
    top: sticker.y,
    zIndex: isDragging ? 9999 : sticker.z_index,
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
          ? 'cursor-move' 
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
                    const target = e.target as HTMLImageElement;
          target.src = '/assets/frank.png';
        }}
        onLoad={(e) => {
          const img = e.target as HTMLImageElement;
          // Verificar se o sticker é pequeno (menor que 40x40)
          setIsSmallSticker(img.naturalWidth < 40 && img.naturalHeight < 40);
                  }}
      />
      
      {/* Botão de Remoção - Sempre visível em modo de edição, sobreposto */}
      {isEditMode && isOwner && (
        <button
          onClick={handleRemove}
          className="absolute transition-all z-20 opacity-50 hover:opacity-100"
          style={{ 
            top: isSmallSticker ? '-6px' : '-2px', 
            right: isSmallSticker ? '-6px' : '-2px',
            width: '16px',
            height: '16px'
          }}
          title="Remover Sticker"
        >
          <img 
            src="/assets/Xis3.png" 
            alt="Remover" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>
      )}

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
