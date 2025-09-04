import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Package } from 'lucide-react';
import { AssetSelector } from './AssetSelector';
import { WallpaperSelector } from './WallpaperSelector';
import { WidgetSelector } from './WidgetSelector';

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
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const [showStickerSelector, setShowStickerSelector] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  if (!isOwner) {
    return null;
  }

  const handleWallpaperSelect = (type: 'color' | 'image' | 'repeat' | 'cover', value: string) => {
    if (type === 'color') {
      onBackgroundChange('color', value);
    } else if (type === 'repeat') {
      onBackgroundChange('repeat', value);
    } else {
      onBackgroundChange('cover', value);
    }
    setShowWallpaperSelector(false);
  };

  const handleStickerSelectInternal = (asset: any) => {
    console.log('🎯 Sticker selecionado no toolbar:', asset);
    
    // Generate random position for the sticker
    const x = Math.random() * (1080 - 100) + 50;
    const y = Math.random() * (1800 - 100) + 50;
    
    // Call the parent callback with proper parameters
    onStickerSelect(asset.id, asset.url || asset.src, asset.category || 'outros');
    setShowStickerSelector(false);
  };

  const handleWidgetAdd = async (widgetType: string): Promise<boolean> => {
    try {
      const success = await onWidgetAdd(widgetType);
      if (success) {
        setShowWidgetSelector(false);
      }
      return success;
    } catch (error) {
      console.error('❌ Erro ao adicionar widget:', error);
      return false;
    }
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
      {/* Single Horizontal Bar */}
      <div className={`
        w-full max-w-3xl mx-auto ml-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden
        transform transition-all duration-700 ease-out z-50 relative pointer-events-auto
        ${isEditMode 
          ? 'translate-y-0 opacity-100 scale-100 visible' 
          : '-translate-y-full opacity-0 scale-95 pointer-events-none invisible'
        }
      `}>
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Only Edit Button */}
            <div className="flex items-center">
              <button
                onClick={onToggleEditMode}
                className="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 pointer-events-auto"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundImage: `url('https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home-assets/editinghome.png')`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  imageRendering: 'pixelated',
                  transform: 'scaleX(-1)'
                }}
                title="Sair do Modo de Edição"
              />
            </div>

            {/* Center: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWallpaperSelector(true)}
                className="flex items-center gap-2 text-xs font-volter pointer-events-auto"
              >
                🖼️ Papel de Parede
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStickerSelector(true)}
                className="flex items-center gap-2 text-xs font-volter pointer-events-auto"
              >
                ✨ Adesivos
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetSelector(true)}
                className="flex items-center gap-2 text-xs font-volter pointer-events-auto"
              >
                📦 Widgets
              </Button>
            </div>

            {/* Right: Save/Cancel */}
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2 text-xs font-volter pointer-events-auto"
              >
                ❌ Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2 text-xs font-volter bg-primary hover:bg-primary/90 pointer-events-auto"
              >
                ✅ Salvar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Selectors */}
      <WallpaperSelector
        open={showWallpaperSelector}
        onOpenChange={setShowWallpaperSelector}
        onWallpaperSelect={handleWallpaperSelect}
      />

      <AssetSelector
        open={showStickerSelector}
        onOpenChange={setShowStickerSelector}
        onAssetSelect={handleStickerSelectInternal}
        type="stickers"
        title="Escolher Adesivo"
      />

      <WidgetSelector
        isOpen={showWidgetSelector}
        onClose={() => setShowWidgetSelector(false)}
        onWidgetAdd={handleWidgetAdd}
      />

      {/* Modal de Visitante */}
      {showVisitorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border-2 border-black">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2 volter-font">
                🏠 Opções da Home
              </h3>
              <p className="text-gray-600 volter-font">
                Explore os elementos desta Habbo Home
              </p>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-2 volter-font flex items-center gap-2">
                  👤 Card de Perfil
                </h4>
                <p className="text-sm text-blue-700 volter-font">
                  Informações do usuário, avatar e estatísticas
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-800 mb-2 volter-font flex items-center gap-2">
                  📖 Livro de Visitas
                </h4>
                <p className="text-sm text-green-700 volter-font">
                  Deixe uma mensagem para o dono da home
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2 volter-font flex items-center gap-2">
                  ⭐ Sistema de Avaliação
                </h4>
                <p className="text-sm text-purple-700 volter-font">
                  Avalie esta home com like/dislike
                </p>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2 volter-font flex items-center gap-2">
                  ✨ Stickers e Decorações
                </h4>
                <p className="text-sm text-orange-700 volter-font">
                  Elementos decorativos personalizados
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={() => setShowVisitorModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white volter-font"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
