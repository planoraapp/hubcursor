
import React from 'react';

interface Sticker {
  id: string;
  sticker_id: string;
  sticker_src: string;
  category: string;
  x: number;
  y: number;
  z_index: number;
  rotation?: number;
  scale?: number;
}

interface StickerSystemProps {
  stickers: Sticker[];
  isEditMode: boolean;
  canvasSize: { width: number; height: number };
}

export const StickerSystem: React.FC<StickerSystemProps> = ({
  stickers,
  isEditMode,
  canvasSize
}) => {
  return (
    <>
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className={`absolute ${isEditMode ? 'cursor-move' : 'cursor-default'}`}
          style={{
            left: sticker.x,
            top: sticker.y,
            zIndex: sticker.z_index,
            transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
          }}
        >
          <img
            src={sticker.sticker_src}
            alt={`Sticker ${sticker.sticker_id}`}
            className="max-w-16 max-h-16 object-contain"
            draggable={false}
          />
          
          {isEditMode && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600">
              <span className="text-white text-xs">×</span>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
