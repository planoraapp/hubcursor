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
  isDragging?: boolean;
  showStickerPicker?: boolean;
  setShowStickerPicker?: (show: boolean) => void;
  showWidgetPicker?: boolean;
  setShowWidgetPicker?: (show: boolean) => void;
  showBackgroundPicker?: boolean;
  setShowBackgroundPicker?: (show: boolean) => void;
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
  onWidgetAdd,
  isDragging = false,
  showStickerPicker = false,
  setShowStickerPicker,
  showWidgetPicker = false,
  setShowWidgetPicker,
  showBackgroundPicker = false,
  setShowBackgroundPicker
}) => {
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [currentAssetType, setCurrentAssetType] = useState<'stickers' | 'widgets' | 'backgrounds'>('stickers');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOwner) {
    return null;
  }

  // Se não está em modo de edição, não mostra nada (o botão está no centro da página)
  if (!isEditMode) {
    return null;
  }

  const handleAssetSelect = (asset: any) => {
    console.log('🎯 [EnhancedHomeToolbar] Asset selecionado:', asset);
    console.log('🎯 [EnhancedHomeToolbar] Tipo do asset:', asset.type);
    console.log('🎯 [EnhancedHomeToolbar] Estado atual isMinimized:', isMinimized);
    console.log('🎯 [EnhancedHomeToolbar] Props disponíveis:', {
      onStickerSelect: !!onStickerSelect,
      onWidgetAdd: !!onWidgetAdd,
      onBackgroundChange: !!onBackgroundChange,
      setShowStickerPicker: !!setShowStickerPicker,
      setShowWidgetPicker: !!setShowWidgetPicker
    });
    
    if (asset.type === 'background') {
      // Para backgrounds, usar o callback existente
      console.log('🎯 Processando background');
      onBackgroundChange('cover', asset.src);
    } else if (asset.type === 'sticker') {
      // Para stickers, usar o callback existente e minimizar toolbar
      console.log('🎯 [EnhancedHomeToolbar] Processando sticker - minimizando toolbar');
      onStickerSelect(asset.id, asset.src, asset.category);
      setIsMinimized(true); // Minimizar após adicionar sticker
      setShowStickerPicker?.(false); // Fechar picker se existir
      console.log('🎯 [EnhancedHomeToolbar] Toolbar minimizada para sticker');
    } else if (asset.type === 'widget') {
      // Para widgets, usar o callback existente e minimizar toolbar
      console.log('🎯 [EnhancedHomeToolbar] Processando widget - minimizando toolbar');
      onWidgetAdd(asset.id);
      setIsMinimized(true); // Minimizar após adicionar widget
      setShowWidgetPicker?.(false); // Fechar picker se existir
      console.log('🎯 [EnhancedHomeToolbar] Toolbar minimizada para widget');
    } else {
      console.log('🎯 Tipo de asset não reconhecido:', asset.type);
    }
    
    setShowAssetsModal(false);
    console.log('🎯 [EnhancedHomeToolbar] Modal fechado');
  };

  const handleOpenAssetsModal = (type: 'stickers' | 'widgets' | 'backgrounds') => {
    console.log('🎯 [EnhancedHomeToolbar] Abrindo modal de assets:', type);
    console.log('🎯 [EnhancedHomeToolbar] Estado atual showAssetsModal:', showAssetsModal);
    setCurrentAssetType(type);
    setShowAssetsModal(true);
    console.log('🎯 [EnhancedHomeToolbar] Modal definido como true');
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
      <div 
        className={`fixed top-4 right-4 z-50 space-y-3 transition-opacity duration-200 ${
          isDragging ? 'opacity-30' : 'opacity-100'
        }`}
        style={{
          opacity: isDragging ? 0.3 : 1 // 70% de transparência quando arrastando
        }}
        data-dragging={isDragging}
        data-minimized={isMinimized}
      >
        {/* Botão Sair da Edição */}
        <Button
          onClick={onToggleEditMode}
          className="bg-red-500 hover:bg-red-600 text-white font-bold volter-font border-2 border-black shadow-lg"
          size="lg"
        >
          ❌ Sair da Edição
        </Button>

        {/* Botão Minimizar/Expandir */}
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold volter-font border-2 border-black shadow-lg"
          size="lg"
        >
          {isMinimized ? '📖 Expandir' : '📕 Minimizar'}
        </Button>

        {/* Botões de Edição - só mostram se não estiver minimizado */}
        {!isMinimized && (
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
        )}

        {/* Botões de Ação - sempre visíveis */}
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
