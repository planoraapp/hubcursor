
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Palette, Package, Save, Eye } from 'lucide-react';

interface HomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onToggleEditMode: () => void;
  onOpenBackgroundModal: () => void;
  onOpenInventoryModal: () => void;
}

export const HomeToolbar: React.FC<HomeToolbarProps> = ({
  isEditMode,
  isOwner,
  onToggleEditMode,
  onOpenBackgroundModal,
  onOpenInventoryModal
}) => {
  if (!isOwner) {
    return (
      <div className="mb-4">
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-3 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold volter-font">Visitando esta Home</h2>
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Eye className="w-3 h-3 mr-1" />
              Modo Visitante
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 rounded-lg shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-bold volter-font">Controles da Minha Home</h2>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant={isEditMode ? "secondary" : "outline"}
              onClick={onToggleEditMode}
              className={isEditMode ? 
                "bg-yellow-500 text-black hover:bg-yellow-400 volter-font" : 
                "bg-white/20 text-white hover:bg-white/30 volter-font"
              }
            >
              <Edit3 className="w-4 h-4 mr-1" />
              {isEditMode ? 'Finalizar Edição' : 'Editar Posições'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onOpenBackgroundModal}
              className="bg-white/20 text-white hover:bg-white/30 volter-font"
            >
              <Palette className="w-4 h-4 mr-1" />
              Backgrounds
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onOpenInventoryModal}
              className="bg-white/20 text-white hover:bg-white/30 volter-font"
            >
              <Package className="w-4 h-4 mr-1" />
              Inventário
            </Button>

            {isEditMode && (
              <Badge className="bg-green-500 text-white volter-font">
                <Save className="w-3 h-3 mr-1" />
                Auto-Save
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
