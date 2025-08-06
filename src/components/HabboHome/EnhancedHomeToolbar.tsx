
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StickerInventory } from '@/components/stickers/StickerInventory';

interface EnhancedHomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onEditModeChange: (editMode: boolean) => void;
}

export const EnhancedHomeToolbar = ({ isEditMode, isOwner, onEditModeChange }: EnhancedHomeToolbarProps) => {
  const [showStickers, setShowStickers] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <div className="fixed top-4 right-4 z-50 bg-white border-2 border-gray-900 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onEditModeChange(!isEditMode)}
            variant={isEditMode ? "default" : "outline"}
            size="sm"
            className="volter-font"
          >
            {isEditMode ? 'Sair do Modo Edição' : 'Modo Edição'}
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            onClick={() => setShowStickers(true)}
            variant="outline"
            size="sm"
            className="volter-font"
            disabled={!isEditMode}
          >
            ✨ Stickers
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="volter-font"
            disabled={!isEditMode}
          >
            🎨 Fundos
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="volter-font"
            disabled={!isEditMode}
          >
            📱 Widgets
          </Button>
        </div>
      </div>

      <StickerInventory
        isOpen={showStickers}
        onClose={() => setShowStickers(false)}
      />
    </>
  );
};
