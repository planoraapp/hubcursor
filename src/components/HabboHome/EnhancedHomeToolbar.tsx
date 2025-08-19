import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AssetSelector } from './AssetSelector';

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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showWallpaperSelector, setShowWallpaperSelector] = useState(false);
  const [showStickerSelector, setShowStickerSelector] = useState(false);

  if (!isOwner) {
    return (
      <div className="w-full bg-muted/50 border-b border-border p-3 text-center">
        <span className="text-sm text-muted-foreground font-medium font-volter">
          👁️ Modo Visitante
        </span>
      </div>
    );
  }

  const handleColorSelect = (color: string) => {
    onBackgroundChange('color', color);
    setActiveMenu(null);
  };

  const handleBackgroundSelect = (asset: any) => {
    onBackgroundChange('cover', asset.url);
    setShowWallpaperSelector(false);
    setActiveMenu(null);
  };

  const handleStickerSelectInternal = (asset: any) => {
    // Generate a unique ID for the sticker
    const stickerId = `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    onStickerSelect(stickerId, asset.url, asset.category);
    setShowStickerSelector(false);
    setActiveMenu(null);
  };

  const handleWidgetAdd = (widgetType: string) => {
    onWidgetAdd(widgetType);
    setActiveMenu(null);
  };

  const handleCancel = () => {
    onToggleEditMode(); // Exit edit mode without saving
    setActiveMenu(null);
  };

  const handleSave = () => {
    onSave();
    onToggleEditMode(); // Exit edit mode after saving
    setActiveMenu(null);
  };

  return (
    <>
      {/* Sliding Toolbar Container */}
      <div className={`
        w-full max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-xl overflow-hidden
        transform transition-all duration-700 ease-out z-30 relative
        ${isEditMode 
          ? 'translate-y-0 opacity-100 scale-100 visible' 
          : '-translate-y-full opacity-0 scale-95 pointer-events-none invisible'
        }
      `}>
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4">
          
          {/* Header with Save/Cancel */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-volter text-foreground flex items-center gap-2">
              🎨 Personalizar Home
            </h3>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                className="flex items-center gap-2 text-xs"
              >
                <img src="/assets/NO.png" alt="Cancel" className="w-4 h-4" />
                Cancelar
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2 text-xs bg-primary hover:bg-primary/90"
              >
                <img src="/assets/Save.png" alt="Save" className="w-4 h-4" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex items-center justify-center gap-3">
            
            {/* Wallpaper Button */}
            <div className="relative">
              <Button
                variant={activeMenu === 'wallpaper' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMenu(activeMenu === 'wallpaper' ? null : 'wallpaper')}
                className="flex items-center gap-2 text-xs font-volter"
              >
                🖼️ Papel de Parede
              </Button>
              
              {activeMenu === 'wallpaper' && (
                <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-4 min-w-[350px] z-50 animate-scale-in">
                  
                  {/* Colors Section */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium font-volter mb-3">Cores Pastéis</h4>
                    <div className="flex gap-0">
                      {PASTEL_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => handleColorSelect(color.value)}
                          className="flex-1 h-12 border-2 border-white hover:border-primary transition-all hover:scale-105 hover:z-10 relative first:rounded-l-lg last:rounded-r-lg"
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Images Section */}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowWallpaperSelector(true)}
                      className="w-full text-xs font-volter"
                    >
                      🖼️ Escolher Imagem de Fundo
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Stickers Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStickerSelector(true)}
              className="flex items-center gap-2 text-xs font-volter"
            >
              ✨ Adesivos
            </Button>

            {/* Widgets Button */}
            <div className="relative">
              <Button
                variant={activeMenu === 'widgets' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveMenu(activeMenu === 'widgets' ? null : 'widgets')}
                className="flex items-center gap-2 text-xs font-volter"
              >
                📦 Widgets
              </Button>
              
              {activeMenu === 'widgets' && (
                <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-xl p-3 min-w-[280px] z-50 animate-scale-in">
                  {WIDGET_TYPES.map((widget) => (
                    <div key={widget.id} className="mb-1 last:mb-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleWidgetAdd(widget.id)}
                        className="w-full text-left justify-start p-3 h-auto flex-col items-start hover:bg-accent/50"
                      >
                        <div className="font-medium text-xs font-volter">{widget.name}</div>
                        <div className="text-xs text-muted-foreground">{widget.description}</div>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Asset Selectors */}
      <AssetSelector
        open={showWallpaperSelector}
        onOpenChange={setShowWallpaperSelector}
        onAssetSelect={handleBackgroundSelect}
        type="backgrounds"
        title="Escolher Papel de Parede"
      />

      <AssetSelector
        open={showStickerSelector}
        onOpenChange={setShowStickerSelector}
        onAssetSelect={handleStickerSelectInternal}
        type="stickers"
        title="Escolher Adesivo"
      />
    </>
  );
};