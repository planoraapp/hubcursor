
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Move, RotateCw, Palette, Sticker } from 'lucide-react';

interface Sticker {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
}

interface InteractiveStickerSystemProps {
  className?: string;
  stickers?: Sticker[];
  isEditMode?: boolean;
  isOwner?: boolean;
  canvasSize?: { width: number; height: number };
  onStickerAdd?: (stickerData: any) => Promise<any>;
  onStickerMove?: (stickerId: string, x: number, y: number) => Promise<any>;
  onStickerRemove?: (stickerId: string) => void;
}

export const InteractiveStickerSystem: React.FC<InteractiveStickerSystemProps> = ({ 
  className,
  stickers = [],
  isEditMode = false,
  isOwner = false,
  canvasSize = { width: 900, height: 600 },
  onStickerAdd,
  onStickerMove,
  onStickerRemove
}) => {
  const [localStickers, setLocalStickers] = useState<Sticker[]>(stickers);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addSticker = async (sticker: any) => {
    const newSticker = { ...sticker, id: Date.now().toString(), x: 50, y: 50, rotation: 0 };
    
    if (onStickerAdd) {
      await onStickerAdd(newSticker);
    } else {
      setLocalStickers([...localStickers, newSticker]);
    }
  };

  const handleSelect = (stickerId: string) => {
    setSelectedSticker(localStickers.find(sticker => sticker.id === stickerId) || null);
  };

  const handleMove = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker || !isEditMode) return;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left - selectedSticker.width / 2;
    const y = e.clientY - containerRect.top - selectedSticker.height / 2;

    if (onStickerMove) {
      await onStickerMove(selectedSticker.id, x, y);
    } else {
      setLocalStickers(localStickers.map(sticker =>
        sticker.id === selectedSticker.id ? { ...sticker, x, y } : sticker
      ));
    }
  };

  const handleRotate = () => {
    if (!selectedSticker || !isEditMode) return;
    setLocalStickers(localStickers.map(sticker =>
      sticker.id === selectedSticker.id ? { ...sticker, rotation: sticker.rotation + 15 } : sticker
    ));
  };

  const handleRemove = () => {
    if (!selectedSticker || !isEditMode) return;
    if (onStickerRemove) {
      onStickerRemove(selectedSticker.id);
    } else {
      setLocalStickers(localStickers.filter(sticker => sticker.id !== selectedSticker.id));
    }
    setSelectedSticker(null);
  };

  const displayStickers = onStickerAdd ? stickers : localStickers;

  if (!isOwner && !isEditMode) {
    return (
      <div className={className}>
        <div className="relative w-full h-full">
          {displayStickers.map(sticker => (
            <img
              key={sticker.id}
              src={sticker.src}
              alt={sticker.name}
              className="absolute"
              style={{
                width: sticker.width + 'px',
                height: sticker.height + 'px',
                left: sticker.x + 'px',
                top: sticker.y + 'px',
                transform: `rotate(${sticker.rotation}deg)`,
                userSelect: 'none',
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Interactive Sticker System</h2>
          {isEditMode && (
            <div className="space-x-2">
              <Button size="sm" variant="outline" onClick={handleRotate} disabled={!selectedSticker}>
                <RotateCw className="w-4 h-4 mr-2" />
                Rotate
              </Button>
              <Button size="sm" variant="destructive" onClick={handleRemove} disabled={!selectedSticker}>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
        </div>
        <Card className="relative h-80 border-2 border-dashed border-gray-400 overflow-hidden">
          <div
            className="absolute inset-0"
            ref={containerRef}
            onMouseMove={handleMove}
          >
            {displayStickers.map(sticker => (
              <img
                key={sticker.id}
                src={sticker.src}
                alt={sticker.name}
                className={`absolute ${isEditMode ? 'cursor-move' : ''}`}
                style={{
                  width: sticker.width + 'px',
                  height: sticker.height + 'px',
                  left: sticker.x + 'px',
                  top: sticker.y + 'px',
                  transform: `rotate(${sticker.rotation}deg)`,
                  userSelect: 'none',
                }}
                onClick={() => isEditMode && handleSelect(sticker.id)}
              />
            ))}
          </div>
        </Card>
        {isEditMode && (
          <div className="p-4">
            <Button onClick={() => addSticker({ 
              name: 'Habbo Logo', 
              src: '/assets/LogoHabbo.png', 
              width: 80, 
              height: 40 
            })}>
              <Sticker className="w-4 h-4 mr-2" />
              Add Habbo Logo
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
