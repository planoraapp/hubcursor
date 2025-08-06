
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StickerCategory } from './StickerCategory';
import { DraggableSticker } from './DraggableSticker';

interface StickerInventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const STICKER_DATA = {
  emoticons: [
    { id: 'heart_1', src: '/assets/home/stickers/emoticons/heart.png', name: 'Coração' },
    { id: 'smile_1', src: '/assets/home/stickers/emoticons/smile.png', name: 'Sorriso' },
    { id: 'star_eyes_1', src: '/assets/home/stickers/emoticons/star_eyes.png', name: 'Estrelas nos Olhos' },
    { id: 'wink_1', src: '/assets/home/stickers/emoticons/wink.png', name: 'Piscadinha' },
    { id: 'love_1', src: '/assets/home/stickers/emoticons/love.png', name: 'Apaixonado' },
    { id: 'cool_1', src: '/assets/home/stickers/emoticons/cool.png', name: 'Legal' }
  ],
  decorative: [
    { id: 'star_1', src: '/assets/home/stickers/decorative/star.png', name: 'Estrela' },
    { id: 'flower_1', src: '/assets/home/stickers/decorative/flower.png', name: 'Flor' },
    { id: 'diamond_1', src: '/assets/home/stickers/decorative/diamond.png', name: 'Diamante' },
    { id: 'crown_1', src: '/assets/home/stickers/decorative/crown.png', name: 'Coroa' },
    { id: 'rainbow_1', src: '/assets/home/stickers/decorative/rainbow.png', name: 'Arco-íris' },
    { id: 'sparkles_1', src: '/assets/home/stickers/decorative/sparkles.png', name: 'Brilhos' }
  ],
  text: [
    { id: 'hello_1', src: '/assets/home/stickers/text/hello.png', name: 'Olá' },
    { id: 'wow_1', src: '/assets/home/stickers/text/wow.png', name: 'Wow' },
    { id: 'cool_text_1', src: '/assets/home/stickers/text/cool.png', name: 'Legal' },
    { id: 'awesome_1', src: '/assets/home/stickers/text/awesome.png', name: 'Incrível' },
    { id: 'yeah_1', src: '/assets/home/stickers/text/yeah.png', name: 'Yeah' },
    { id: 'party_1', src: '/assets/home/stickers/text/party.png', name: 'Festa' }
  ]
};

export const StickerInventory = ({ isOpen, onClose }: StickerInventoryProps) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof STICKER_DATA>('emoticons');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="volter-font text-xl text-center">
            Inventário de Stickers
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 justify-center">
            <StickerCategory
              category="emoticons"
              isActive={activeCategory === 'emoticons'}
              onClick={() => setActiveCategory('emoticons')}
              icon="😊"
            />
            <StickerCategory
              category="decorative"
              isActive={activeCategory === 'decorative'}
              onClick={() => setActiveCategory('decorative')}
              icon="✨"
            />
            <StickerCategory
              category="text"
              isActive={activeCategory === 'text'}
              onClick={() => setActiveCategory('text')}
              icon="💬"
            />
          </div>

          {/* Stickers Grid */}
          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
            {STICKER_DATA[activeCategory].map((sticker) => (
              <div
                key={sticker.id}
                className="flex flex-col items-center p-2 bg-white rounded-lg hover:bg-blue-50 transition-colors"
              >
                <DraggableSticker
                  id={sticker.id}
                  src={sticker.src}
                  category={activeCategory}
                  size="medium"
                />
                <span className="text-xs text-gray-600 mt-1 text-center">
                  {sticker.name}
                </span>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="volter-font">💡 Dica: Arraste os stickers para sua home!</p>
            <p className="text-xs mt-1">Clique e arraste qualquer sticker para decorar sua página.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
