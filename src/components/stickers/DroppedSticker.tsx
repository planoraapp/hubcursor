
import React, { useState, useRef, useEffect } from 'react';

interface DroppedStickerProps {
  id: string;
  stickerId: string;
  src: string;
  category: string;
  x: number;
  y: number;
  zIndex: number;
  scale?: number;
  rotation?: number;
  isEditMode: boolean;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onRemove?: (id: string) => void;
}

export const DroppedSticker: React.FC<DroppedStickerProps> = ({
  id,
  stickerId,
  src,
  category,
  x,
  y,
  zIndex,
  scale = 1,
  rotation = 0,
  isEditMode,
  onPositionChange,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: x, elementY: y });
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: x,
      elementY: y
    });

      };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    // Double click para remover
    if (e.detail === 2 && onRemove) {
      onRemove(id);
          }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onPositionChange) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, Math.min(1200, dragStart.elementX + deltaX)); // Limitar área da home
        const newY = Math.max(0, Math.min(1600, dragStart.elementY + deltaY));
        onPositionChange(id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
              }
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, id, stickerId]);

  return (
    <div
      ref={elementRef}
      className={`absolute pointer-events-auto ${
        isEditMode 
          ? `cursor-move ${isDragging ? 'scale-110 opacity-80' : 'hover:scale-105'} transition-transform` 
          : 'cursor-default'
      } ${isEditMode ? 'ring-2 ring-blue-300 ring-opacity-50 rounded' : ''}`}
      style={{
        left: x,
        top: y,
        zIndex: isDragging ? 9999 : zIndex,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: 'center'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <img
        src={src}
        alt={`Sticker ${stickerId}`}
        className="select-none"
        draggable={false}
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
                    const target = e.target as HTMLImageElement;
          target.src = '/assets/frank.png'; // Fallback
        }}
      />
      
      {/* Indicador de remoção no modo de edição */}
      {isEditMode && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs cursor-pointer hover:bg-red-600 transition-colors">
          ×
        </div>
      )}
    </div>
  );
};
