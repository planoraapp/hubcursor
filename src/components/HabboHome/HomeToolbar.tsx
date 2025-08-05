
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Palette, Sticker, Save } from 'lucide-react';

interface HomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onToggleEditMode: () => void;
  onOpenBackgroundModal: () => void;
  onOpenStickersModal: () => void;
}

export const HomeToolbar: React.FC<HomeToolbarProps> = ({
  isEditMode,
  isOwner,
  onToggleEditMode,
  onOpenBackgroundModal,
  onOpenStickersModal
}) => {
  if (!isOwner) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Habbo Home</h2>
          <Badge variant="secondary" className="bg-white/20 text-white">
            Modo Visitante
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-t-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Minha Habbo Home</h2>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isEditMode ? "secondary" : "outline"}
            onClick={onToggleEditMode}
            className={isEditMode ? "bg-yellow-500 text-black hover:bg-yellow-400" : "bg-white/20 text-white hover:bg-white/30"}
          >
            <Edit3 className="w-4 h-4 mr-1" />
            {isEditMode ? 'Sair do Edit' : 'Editar'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenBackgroundModal}
            className="bg-white/20 text-white hover:bg-white/30"
          >
            <Palette className="w-4 h-4 mr-1" />
            Fundo
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenStickersModal}
            className="bg-white/20 text-white hover:bg-white/30"
          >
            <Sticker className="w-4 h-4 mr-1" />
            Stickers
          </Button>

          {isEditMode && (
            <Badge className="bg-green-500 text-white">
              <Save className="w-3 h-3 mr-1" />
              Auto-Save
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
