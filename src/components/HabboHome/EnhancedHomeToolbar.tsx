import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Package } from 'lucide-react';
import { HubHomeAssets } from './HubHomeAssets';

interface EnhancedHomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onToggleEditMode: () => void;
  onSave: () => void;
  onBackgroundChange: (type: 'color' | 'cover' | 'repeat', value: string) => void;
  onStickerSelect: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd: (widgetType: string) => Promise<boolean>;
}

// 7 Pastel colors matching design system
const PASTEL_COLORS = [
  { name: 'Rosa Suave', value: 'hsl(350 100% 88%)' },    // Feminine pink
  { name: 'Azul Céu', value: 'hsl(200 100% 85%)' },     // Sky blue
  { name: 'Verde Menta', value: 'hsl(160 100% 85%)' },  // Mint green
  { name: 'Amarelo Sol', value: 'hsl(50 100% 85%)' },   // Soft yellow
  { name: 'Roxo Lavanda', value: 'hsl(280 100% 88%)' }, // Lavender
  { name: 'Laranja Pêssego', value: 'hsl(30 100% 85%)' }, // Peach
  { name: 'Cinza Neutro', value: 'hsl(220 20% 88%)' }   // Neutral gray
];

const WIDGET_TYPES = [
  { id: 'avatar', name: 'Perfil do Usuário', description: 'Mostra avatar e informações' },
  { id: 'guestbook', name: 'Livro de Visitas', description: 'Permite visitantes deixarem mensagens' },
  { id: 'rating', name: 'Avaliação', description: 'Sistema de like/dislike' },
];

export const EnhancedHomeToolbar: React.FC<EnhancedHomeToolbarProps> = ({
  isEditMode,
  isOwner,
  onToggleEditMode,
  onSave,
  onBackgroundChange,
  onStickerSelect,
  onWidgetAdd
}) => {
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [currentAssetType, setCurrentAssetType] = useState<'stickers' | 'widgets' | 'backgrounds'>('stickers');

  if (!isOwner) {
    return null;
  }

  // Se não está em modo de edição, não mostra nada (o botão está no centro da página)
  if (!isEditMode) {
    return null;
  }

  const handleAssetSelect = (asset: any) => {
    console.log('🎯 Asset selecionado:', asset);
    
    if (asset.type === 'background') {
      // Para backgrounds, usar o callback existente
      onBackgroundChange('cover', asset.src);
    } else if (asset.type === 'sticker') {
      // Para stickers, usar o callback existente
      onStickerSelect(asset.id, asset.src, asset.category);
    } else if (asset.type === 'widget') {
      // Para widgets, usar o callback existente
      onWidgetAdd(asset.id);
    }
    
    setShowAssetsModal(false);
  };

  const handleOpenAssetsModal = (type: 'stickers' | 'widgets' | 'backgrounds') => {
    setCurrentAssetType(type);
    setShowAssetsModal(true);
  };

  const handleCancel = () => {
    onToggleEditMode();
  };

  const handleSave = () => {
    onSave();
    onToggleEditMode();
  };

  return (
    <>
      {/* Barra de Edição ao lado da Home */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {/* Botão Sair da Edição */}
        <Button
          onClick={onToggleEditMode}
          className="bg-red-500 hover:bg-red-600 text-white font-bold volter-font border-2 border-black shadow-lg"
          size="lg"
        >
          ❌ Sair da Edição
        </Button>

        {/* Botões de Edição */}
        <div className="space-y-2">
          <Button
            onClick={() => handleOpenAssetsModal('backgrounds')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold volter-font border-2 border-black shadow-lg w-full"
            size="lg"
          >
            🖼️ Backgrounds
          </Button>

          <Button
            onClick={() => handleOpenAssetsModal('stickers')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold volter-font border-2 border-black shadow-lg w-full"
            size="lg"
          >
            ✨ Stickers
          </Button>

          <Button
            onClick={() => handleOpenAssetsModal('widgets')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold volter-font border-2 border-black shadow-lg w-full"
            size="lg"
          >
            📦 Widgets
          </Button>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2">
          <Button 
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold volter-font border-2 border-black shadow-lg w-full"
            size="lg"
          >
            ❌ Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-green-500 hover:bg-green-600 text-white font-bold volter-font border-2 border-black shadow-lg w-full"
            size="lg"
          >
            ✅ Salvar
          </Button>
        </div>
      </div>

      {/* Modal de Assets das Hub Homes */}
      {showAssetsModal && (
        <HubHomeAssets
          type={currentAssetType}
          onSelect={handleAssetSelect}
          onClose={() => setShowAssetsModal(false)}
        />
      )}
    </>
  );
};
