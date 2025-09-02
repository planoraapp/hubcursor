
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sticker, X, Plus } from 'lucide-react';
import { STICKER_ASSETS, getStickersByCategory, type StickerAsset } from '@/data/stickerAssets';

interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  zIndex: number;
  createdAt: string;
}

interface InteractiveStickerSystemProps {
  stickers: PlacedSticker[];
  isEditMode: boolean;
  isOwner: boolean;
  canvasSize: { width: number; height: number };
  onStickerAdd: (sticker: { stickerId: string; x: number; y: number }) => void;
  onStickerMove: (stickerId: string, x: number, y: number) => void;
  onStickerRemove: (stickerId: string) => void;
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
  const [stickerPopoverOpen, setStickerPopoverOpen] = useState(false);

  const handleStickerClick = useCallback((stickerId: string) => {
    if (isEditMode && isOwner) {
      setSelectedSticker(selectedSticker === stickerId ? null : stickerId);
    }
  }, [isEditMode, isOwner, selectedSticker]);

  const handleAddSticker = useCallback((stickerAsset: StickerAsset) => {
    if (!isOwner) return;
    
    // Add sticker at center of canvas
    const x = (canvasSize.width - stickerAsset.width) / 2;
    const y = (canvasSize.height - stickerAsset.height) / 2;
    
    onStickerAdd({
      stickerId: stickerAsset.id,
      x,
      y
    });
    
    setStickerPopoverOpen(false);
  }, [isOwner, canvasSize, onStickerAdd]);

  const handleRemoveSticker = useCallback((stickerId: string) => {
    if (!isOwner) return;
    onStickerRemove(stickerId);
    setSelectedSticker(null);
  }, [isOwner, onStickerRemove]);

  const renderSticker = (placedSticker: PlacedSticker) => {
    const stickerAsset = STICKER_ASSETS.find(s => s.id === placedSticker.stickerId);
    if (!stickerAsset) return null;

    const isSelected = selectedSticker === placedSticker.id;

    return (
      <div
        key={placedSticker.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        } ${isEditMode ? 'hover:ring-2 hover:ring-gray-300' : ''}`}
        style={{
          left: placedSticker.x,
          top: placedSticker.y,
          zIndex: placedSticker.zIndex,
          width: stickerAsset.width,
          height: stickerAsset.height
        }}
        onClick={() => handleStickerClick(placedSticker.id)}
      >
        <img
          src={stickerAsset.src}
          alt={stickerAsset.name}
          className="w-full h-full object-contain"
          style={{ imageRendering: 'pixelated' }}
          draggable={false}
        />
        
        {isSelected && isEditMode && isOwner && (
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 w-6 h-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveSticker(placedSticker.id);
            }}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Render all placed stickers */}
      {stickers.map(renderSticker)}

      {/* Add Sticker Button - only show in edit mode for owners */}
      {isEditMode && isOwner && (
        <div className="absolute top-4 right-4 z-50">
          <Popover open={stickerPopoverOpen} onOpenChange={setStickerPopoverOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Sticker
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sticker className="w-4 h-4" />
                    Escolher Sticker
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="emoticons">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="emoticons" className="text-xs">Emoticons</TabsTrigger>
                      <TabsTrigger value="decorative" className="text-xs">Decorativos</TabsTrigger>
                      <TabsTrigger value="text" className="text-xs">Texto</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="emoticons" className="mt-3">
                      <div className="grid grid-cols-4 gap-2">
                        {getStickersByCategory('emoticons').map((sticker) => (
                          <Button
                            key={sticker.id}
                            variant="outline"
                            className="p-2 h-auto aspect-square"
                            onClick={() => handleAddSticker(sticker)}
                          >
                            <img
                              src={sticker.src}
                              alt={sticker.name}
                              className="w-6 h-6 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="decorative" className="mt-3">
                      <div className="grid grid-cols-4 gap-2">
                        {getStickersByCategory('decorative').map((sticker) => (
                          <Button
                            key={sticker.id}
                            variant="outline"
                            className="p-2 h-auto aspect-square"
                            onClick={() => handleAddSticker(sticker)}
                          >
                            <img
                              src={sticker.src}
                              alt={sticker.name}
                              className="w-6 h-6 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="text" className="mt-3">
                      <div className="grid grid-cols-4 gap-2">
                        {getStickersByCategory('text').map((sticker) => (
                          <Button
                            key={sticker.id}
                            variant="outline"
                            className="p-2 h-auto aspect-square"
                            onClick={() => handleAddSticker(sticker)}
                          >
                            <img
                              src={sticker.src}
                              alt={sticker.name}
                              className="w-6 h-6 object-contain"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </Button>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Instructions for edit mode */}
      {isEditMode && isOwner && stickers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-blue-100/90 backdrop-blur-sm rounded-lg p-4 text-center">
            <Sticker className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 volter-font">
              Clique em "Adicionar Sticker" para personalizar sua home!
            </p>
          </div>
        </div>
      )}
    </>
  );
};
