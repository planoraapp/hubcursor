import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Move, RotateCw, Palette, Sticker } from 'lucide-react';

interface InteractiveStickerSystemProps {
  className?: string;
}

export const InteractiveStickerSystem: React.FC<InteractiveStickerSystemProps> = ({ className }) => {
  const [stickers, setStickers] = useState<any[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const addSticker = (sticker: any) => {
    setStickers([...stickers, { ...sticker, id: Date.now(), x: 50, y: 50, rotation: 0 }]);
  };

  const handleSelect = (stickerId: number) => {
    setSelectedSticker(stickers.find(sticker => sticker.id === stickerId));
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedSticker) return;

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left - selectedSticker.width / 2;
    const y = e.clientY - containerRect.top - selectedSticker.height / 2;

    setStickers(stickers.map(sticker =>
      sticker.id === selectedSticker.id ? { ...sticker, x, y } : sticker
    ));
  };

  const handleRotate = () => {
    if (!selectedSticker) return;
    setStickers(stickers.map(sticker =>
      sticker.id === selectedSticker.id ? { ...sticker, rotation: sticker.rotation + 15 } : sticker
    ));
  };

  const handleRemove = () => {
    if (!selectedSticker) return;
    setStickers(stickers.filter(sticker => sticker.id !== selectedSticker.id));
    setSelectedSticker(null);
  };

  return (
    <div className={className}>
      <Card>
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Interactive Sticker System</h2>
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
        </div>
        <Card className="relative h-80 border-2 border-dashed border-gray-400 overflow-hidden">
          <div
            className="absolute inset-0"
            ref={containerRef}
            onMouseMove={handleMove}
          >
            {stickers.map(sticker => (
              <img
                key={sticker.id}
                src={sticker.src}
                alt={sticker.name}
                className="absolute cursor-move"
                style={{
                  width: sticker.width + 'px',
                  height: sticker.height + 'px',
                  left: sticker.x + 'px',
                  top: sticker.y + 'px',
                  transform: `rotate(${sticker.rotation}deg)`,
                  userSelect: 'none',
                }}
                onClick={() => handleSelect(sticker.id)}
              />
            ))}
          </div>
        </Card>
        <div className="p-4">
          <Button onClick={() => addSticker({ id: 'habbo_logo', name: 'Habbo Logo', src: '/assets/LogoHabbo.png', width: 80, height: 40 })}>Add Habbo Logo</Button>
        </div>
      </Card>
    </div>
  );
};
