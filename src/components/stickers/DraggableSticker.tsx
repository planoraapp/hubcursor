
import React from 'react';

interface DraggableStickerProps {
  id: string;
  src: string;
  category: string;
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export const DraggableSticker = ({ 
  id, 
  src, 
  category, 
  x = 0, 
  y = 0, 
  scale = 1, 
  rotation = 0,
  onDragStart,
  className = '',
  size = 'medium'
}: DraggableStickerProps) => {
  const getSizeClass = () => {
    const sizes = {
      small: 'w-8 h-8',
      medium: 'w-12 h-12',
      large: 'w-16 h-16'
    };
    return sizes[size];
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      id,
      src,
      category,
      type: 'sticker'
    }));
    
    if (onDragStart) {
      onDragStart(e);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`cursor-grab active:cursor-grabbing hover:scale-110 transition-transform ${getSizeClass()} ${className}`}
      style={{
        position: x || y ? 'absolute' : 'relative',
        left: x ? `${x}px` : undefined,
        top: y ? `${y}px` : undefined,
        transform: `scale(${scale}) rotate(${rotation}deg)`,
      }}
    >
      <img
        src={src}
        alt={`Sticker ${id}`}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />
    </div>
  );
};
