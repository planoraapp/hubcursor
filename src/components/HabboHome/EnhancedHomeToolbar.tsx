import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
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
  onWidgetAdd: (widgetType: string) => void;
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

  if (!isOwner) {
    return (
      <div className="w-full bg-muted/50 border-b border-border p-3 text-center">
        <span className="text-sm text-muted-foreground font-medium font-volter">
          👁️ Modo Visitante
        </span>
      </div>
    );
  }

  const handleWallpaperSelect = (type: 'color' | 'image', value: string) => {
    if (type === 'color') {
      onBackgroundChange('color', value);
    } else {
      onBackgroundChange('cover', value);
    }
    setShowWallpaperSelector(false);
  };

  const handleStickerSelectInternal = (asset: any) => {
    console.log('🎯 Asset selecionado no toolbar:', asset);
    onStickerSelect(asset.id, asset.url, asset.category);
    setShowStickerSelector(false);
  };

  const handleWidgetAdd = (widgetType: string) => {
    onWidgetAdd(widgetType);
    setShowWidgetSelector(false);
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
        w-full max-w-5xl mx-auto bg-card border border-border rounded-lg shadow-xl overflow-hidden
        transform transition-all duration-700 ease-out z-30 relative
        ${isEditMode 
          ? 'translate-y-0 opacity-100 scale-100 visible' 
          : '-translate-y-full opacity-0 scale-95 pointer-events-none invisible'
        }
      `}>
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left: Title */}
            <h3 className="text-lg font-volter text-foreground flex items-center gap-2">
              🎨 Personalizar Home
            </h3>

            {/* Center: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWallpaperSelector(true)}
                className="flex items-center gap-2 text-xs font-volter"
              >
                🖼️ Papel de Parede
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStickerSelector(true)}
                className="flex items-center gap-2 text-xs font-volter"
              >
                ✨ Adesivos
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetSelector(true)}
                className="flex items-center gap-2 text-xs font-volter"
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
                className="flex items-center gap-2 text-xs font-volter"
              >
                <img src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/forum-images/NO.png" alt="Cancel" className="w-4 h-4" />
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2 text-xs font-volter bg-primary hover:bg-primary/90"
              >
                <img src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/forum-images/YES.png" alt="Save" className="w-4 h-4" />
                Salvar
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
    </>
  );
};