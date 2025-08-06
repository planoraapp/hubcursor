
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { STICKER_ASSETS, getStickersByCategory } from '@/data/stickerAssets';
import { DraggableSticker } from './DraggableSticker';

interface StickerInventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StickerInventory = ({ isOpen, onClose }: StickerInventoryProps) => {
  const [selectedCategory, setSelectedCategory] = useState<'emoticons' | 'decorative' | 'text'>('emoticons');

  const categories = [
    { id: 'emoticons', label: 'Emoticons', icon: '😊', count: getStickersByCategory('emoticons').length },
    { id: 'decorative', label: 'Decorativos', icon: '✨', count: getStickersByCategory('decorative').length },
    { id: 'text', label: 'Texto', icon: '📝', count: getStickersByCategory('text').length }
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 volter-font">
            ✨ Inventário de Stickers
            <Badge className="bg-blue-100 text-blue-800">
              {STICKER_ASSETS.length} stickers disponíveis
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)} className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2"
                >
                  <span>{category.icon}</span>
                  <span className="volter-font">{category.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="h-full">
                <div className="mb-3">
                  <h3 className="font-bold text-lg volter-font flex items-center gap-2">
                    {category.icon} {category.label}
                  </h3>
                  <p className="text-sm text-gray-600 volter-font">
                    Arraste os stickers para sua home • Limite: 10 por sticker
                  </p>
                </div>
                
                <ScrollArea className="h-[calc(100%-80px)]">
                  <div className="grid grid-cols-8 gap-4 p-2">
                    {getStickersByCategory(category.id).map(sticker => (
                      <div key={sticker.id} className="group relative">
                        <div className="p-3 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors bg-white shadow-sm">
                          <DraggableSticker
                            id={sticker.id}
                            src={sticker.src}
                            category={sticker.category}
                            size="medium"
                            className="mx-auto"
                          />
                        </div>
                        
                        {/* Tooltip com nome do sticker */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs volter-font opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {sticker.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600 volter-font pt-3 border-t">
          <span>💡 Dica: Arraste os stickers diretamente para sua home</span>
          <span>🔄 Clique em um sticker na home para removê-lo</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
