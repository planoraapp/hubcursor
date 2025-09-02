
import React, { useState, useRef, useEffect, memo, useCallback } from 'react';

interface OptimizedDroppedStickerProps {
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
  onZIndexChange?: (id: string, zIndex: number) => void;
  onRemove?: (id: string) => void;
}

export const OptimizedDroppedSticker: React.FC<OptimizedDroppedStickerProps> = memo(({
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
  onZIndexChange,
  onRemove
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: x, elementY: y });
  const elementRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  // Throttled position update using RAF
  const throttledPositionUpdate = useCallback((newX: number, newY: number) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (onPositionChange) {
        onPositionChange(id, newX, newY);
      }
    });
  }, [id, onPositionChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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

    // Bring to front
    if (onZIndexChange) {
      onZIndexChange(id, Date.now());
    }

    console.log(`🎯 Starting drag for sticker ${stickerId}`);
  }, [isEditMode, x, y, onZIndexChange, id, stickerId]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(id);
    }
  }, [id, onRemove]);

  const handleZIndexUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onZIndexChange) {
      onZIndexChange(id, zIndex + 1);
    }
  }, [id, onZIndexChange, zIndex]);

  const handleZIndexDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onZIndexChange) {
      onZIndexChange(id, Math.max(1, zIndex - 1));
    }
  }, [id, onZIndexChange, zIndex]);

  // Mouse move and up handlers with RAF optimization
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, Math.min(1200, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(800, dragStart.elementY + deltaY));
        
        throttledPositionUpdate(newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        console.log(`✅ Drag completed for sticker ${stickerId}`);
        setIsDragging(false);
      }
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
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, dragStart, throttledPositionUpdate, stickerId]);

  const containerStyle = {
    left: x,
    top: y,
    zIndex: isDragging ? 9999 : zIndex,
    transform: `scale(${isDragging ? scale * 1.1 : scale}) rotate(${rotation}deg)`,
    transformOrigin: 'center',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div
      ref={elementRef}
      className={`absolute pointer-events-auto select-none ${
        isEditMode 
          ? `cursor-move hover:scale-110 transition-transform ${isDragging ? 'z-50' : ''}` 
          : 'cursor-default'
      } ${isEditMode ? 'ring-1 ring-blue-300 ring-opacity-50 rounded' : ''}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      <img
        src={src}
        alt={`Sticker ${stickerId}`}
        className="select-none pointer-events-none"
        draggable={false}
        style={{ imageRendering: 'pixelated' }}
        onError={(e) => {
          console.error(`Error loading sticker: ${src}`);
          const target = e.target as HTMLImageElement;
          target.src = '/assets/frank.png'; // Fallback
        }}
      />
      
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 flex gap-1 bg-black/80 rounded px-2 py-1">
          <button
            onClick={handleZIndexUp}
            className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            title="Trazer para frente"
          >
            ↑
          </button>
          <button
            onClick={handleZIndexDown}
            className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
            title="Enviar para trás"
          >
            ↓
          </button>
          <button
            onClick={handleRemove}
            className="w-5 h-5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            title="Remover"
          >
            ×
          </button>
        </div>
      )}

      {/* Dragging indicator */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
});

OptimizedDroppedSticker.displayName = 'OptimizedDroppedSticker';
