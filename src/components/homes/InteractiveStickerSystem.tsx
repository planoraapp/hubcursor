
import React, { useState, useCallback } from 'react';
import { useHomeAssets } from '@/hooks/useHomeAssets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stickers, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

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

interface InteractiveStickerSystemProps {
  stickers: Sticker[];
  isEditMode: boolean;
  isOwner: boolean;
  canvasSize: { width: number; height: number };
  onStickerAdd?: (stickerData: any) => void;
  onStickerMove?: (stickerId: string, x: number, y: number) => void;
  onStickerRemove?: (stickerId: string) => void;
}

export const InteractiveStickerSystem: React.FC<InteractiveStickerSystemProps> = ({
  stickers,
  isEditMode,
  isOwner,
  canvasSize,
  onStickerAdd,
  onStickerMove,
  onStickerRemove
}) => {
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showStickerPanel, setShowStickerPanel] = useState(false);
  const { assets, getAssetUrl } = useHomeAssets();

  const handleStickerClick = useCallback((stickerId: string, e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.stopPropagation();
    setSelectedSticker(stickerId);
  }, [isEditMode]);

  const handleStickerDrag = useCallback((stickerId: string, e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const sticker = stickers.find(s => s.id === stickerId);
    if (!sticker) return;
    
    const startStickerX = sticker.x;
    const startStickerY = sticker.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const newX = Math.max(0, Math.min(canvasSize.width - 64, startStickerX + deltaX));
      const newY = Math.max(0, Math.min(canvasSize.height - 64, startStickerY + deltaY));
      
      onStickerMove?.(stickerId, newX, newY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isEditMode, isOwner, stickers, canvasSize, onStickerMove]);

  const handleAddSticker = useCallback((asset: any) => {
    if (!onStickerAdd) return;
    
    const stickerData = {
      sticker_id: asset.id,
      sticker_src: getAssetUrl(asset),
      category: asset.category,
      x: Math.random() * (canvasSize.width - 100),
      y: Math.random() * (canvasSize.height - 100),
      z_index: Math.max(...stickers.map(s => s.z_index), 0) + 1,
      rotation: 0,
      scale: 1
    };
    
    onStickerAdd(stickerData);
    setShowStickerPanel(false);
  }, [onStickerAdd, getAssetUrl, canvasSize, stickers]);

  return (
    <>
      {/* Stickers on Canvas */}
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className={`absolute cursor-pointer transition-all duration-200 ${
            isEditMode ? 'hover:scale-110' : ''
          } ${selectedSticker === sticker.id ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: sticker.x,
            top: sticker.y,
            zIndex: sticker.z_index,
            transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotation || 0}deg)`,
            transformOrigin: 'center'
          }}
          onClick={(e) => handleStickerClick(sticker.id, e)}
          onMouseDown={(e) => isEditMode && handleStickerDrag(sticker.id, e)}
        >
          <img
            src={sticker.sticker_src}
            alt={`Sticker ${sticker.sticker_id}`}
            className="max-w-16 max-h-16 object-contain pointer-events-none"
            draggable={false}
          />
          
          {/* Edit Controls */}
          {isEditMode && selectedSticker === sticker.id && (
            <div className="absolute -top-2 -right-2 flex gap-1">
              <Button
                size="sm"
                variant="destructive"
                className="w-6 h-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onStickerRemove?.(sticker.id);
                  setSelectedSticker(null);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Sticker Panel */}
      {isEditMode && isOwner && (
        <div className="absolute top-4 right-4 z-50">
          {!showStickerPanel ? (
            <Button
              onClick={() => setShowStickerPanel(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Stickers className="w-4 h-4 mr-2" />
              Adicionar Stickers
            </Button>
          ) : (
            <Card className="w-80 max-h-96 overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Escolher Sticker</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowStickerPanel(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {assets.Stickers?.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => handleAddSticker(asset)}
                      className="aspect-square bg-gray-100 rounded border-2 border-transparent hover:border-purple-400 transition-all p-1"
                    >
                      <img
                        src={getAssetUrl(asset)}
                        alt={asset.name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
};
