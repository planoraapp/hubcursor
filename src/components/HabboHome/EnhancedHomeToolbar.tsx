
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Eye, Save, Palette, Sticker, Plus, Grid, Settings } from 'lucide-react';
import { AssetSelector } from './AssetSelector';
import { useHomeAssets } from '@/hooks/useHomeAssets';

interface EnhancedHomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onEditModeChange: (editMode: boolean) => void;
  onSave?: () => void;
  onBackgroundChange?: (bg: { type: 'color' | 'image'; value: string }) => void;
  onStickerAdd?: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd?: (widgetType: string) => void;
}

const BACKGROUND_COLORS = [
  '#c7d2dc', '#f0f8ff', '#e6f3e6', '#fff0e6', '#ffe6e6',
  '#e6e6ff', '#f0e6ff', '#ffe6f0', '#f5f5dc', '#e0ffff',
  '#ffb6c1', '#98fb98', '#87ceeb', '#dda0dd', '#f0e68c',
  '#fafad2', '#d3d3d3', '#ffe4b5', '#ffd700', '#ffc0cb'
];

const AVAILABLE_WIDGETS = [
  { id: 'avatar', name: 'Avatar', icon: '👤' },
  { id: 'guestbook', name: 'Livro de Visitas', icon: '📝' },
  { id: 'rating', name: 'Avaliação', icon: '⭐' },
  { id: 'info', name: 'Informações', icon: 'ℹ️' },
  { id: 'music', name: 'Player de Música', icon: '🎵' },
  { id: 'photos', name: 'Fotos', icon: '📷' }
];

export const EnhancedHomeToolbar = ({ 
  isEditMode, 
  isOwner, 
  onEditModeChange, 
  onSave,
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd
}: EnhancedHomeToolbarProps) => {
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const { assets, loading } = useHomeAssets();

  console.log('🛠️ EnhancedHomeToolbar renderizada:', { 
    isOwner, 
    isEditMode, 
    assetsLoaded: !loading,
    stickerCount: assets.Stickers.length,
    backgroundCount: assets['Papel de Parede'].length
  });

  // Sempre mostrar para debug - remover depois
  const shouldShowToolbar = true; // isOwner;

  if (!shouldShowToolbar) {
    console.log('⚠️ Toolbar não será exibida - usuário não é proprietário');
    return null;
  }

  const handleColorSelect = (color: string) => {
    console.log('🎨 Cor selecionada:', color);
    onBackgroundChange?.({ type: 'color', value: color });
    setShowColorPicker(false);
  };

  const handleBackgroundImageSelect = (asset: any) => {
    console.log('🖼️ Background de imagem selecionado:', asset);
    onBackgroundChange?.({ type: 'image', value: asset.url || asset.src });
  };

  const handleStickerSelect = (asset: any) => {
    console.log('🎯 Sticker selecionado:', asset);
    const stickerSrc = asset.url || asset.src;
    onStickerAdd?.(asset.id, stickerSrc, 'Stickers');
  };

  const handleWidgetAdd = (widgetType: string) => {
    console.log('📦 Adicionando widget via toolbar:', widgetType);
    onWidgetAdd?.(widgetType);
    setShowWidgets(false);
  };

  return (
    <>
      {/* Main Toolbar */}
      <div className="w-full toolbar-blur border-b-2 border-black shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg volter-font text-gray-800">
                  Personalizar Home
                </h2>
                <Badge variant={isEditMode ? "default" : "secondary"} className="volter-font">
                  {isEditMode ? 'Editando' : 'Visualizando'}
                </Badge>
                <Badge variant="outline" className="volter-font">
                  Assets: {assets.Stickers.length + assets['Papel de Parede'].length}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Mode Toggle */}
              <Button
                onClick={() => onEditModeChange(!isEditMode)}
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                className="volter-font"
              >
                {isEditMode ? (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Visualizar
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </>
                )}
              </Button>

              {isEditMode && (
                <>
                  <Separator orientation="vertical" className="h-6" />
                  
                  {/* Color Background Button */}
                  <Button
                    onClick={() => setShowColorPicker(true)}
                    variant="outline"
                    size="sm"
                    className="volter-font"
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Cores
                  </Button>
                  
                  {/* Image Background Button */}
                  <Button
                    onClick={() => setShowBackgrounds(true)}
                    variant="outline"
                    size="sm"
                    className="volter-font"
                  >
                    🖼️ Papéis ({assets['Papel de Parede'].length})
                  </Button>
                  
                  {/* Stickers Button */}
                  <Button
                    onClick={() => setShowStickers(true)}
                    variant="outline"
                    size="sm"
                    className="volter-font"
                  >
                    <Sticker className="w-4 h-4 mr-1" />
                    Stickers ({assets.Stickers.length})
                  </Button>
                  
                  {/* Widgets Button */}
                  <Button
                    onClick={() => setShowWidgets(true)}
                    variant="outline"
                    size="sm"
                    className="volter-font"
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Widgets
                  </Button>

                  <Separator orientation="vertical" className="h-6" />
                  
                  {/* Save Button */}
                  <Button onClick={onSave} size="sm" className="volter-font">
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker Dialog */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="volter-font">Escolher Cor de Fundo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-grid">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Background Image Selector */}
      <AssetSelector
        open={showBackgrounds}
        onOpenChange={setShowBackgrounds}
        onAssetSelect={handleBackgroundImageSelect}
        type="backgrounds"
      />

      {/* Sticker Selector */}
      <AssetSelector
        open={showStickers}
        onOpenChange={setShowStickers}
        onAssetSelect={handleStickerSelect}
        type="stickers"
      />

      {/* Widget Selection Dialog */}
      <Dialog open={showWidgets} onOpenChange={setShowWidgets}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="volter-font">Adicionar Widget</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2">
            {AVAILABLE_WIDGETS.map((widget) => (
              <Button
                key={widget.id}
                onClick={() => handleWidgetAdd(widget.id)}
                variant="outline"
                className="w-full justify-start volter-font"
              >
                <span className="mr-2 text-lg">{widget.icon}</span>
                {widget.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
