
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Save, Palette, Sticker, Plus, Image } from 'lucide-react';
import { AssetSelector } from './AssetSelector';

interface HomeToolbarV2Props {
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
  '#ffb6c1', '#98fb98', '#87ceeb', '#dda0dd', '#f0e68c'
];

export const HomeToolbarV2: React.FC<HomeToolbarV2Props> = ({ 
  isEditMode, 
  isOwner, 
  onEditModeChange, 
  onSave,
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd
}) => {
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  console.log('🛠️ HomeToolbarV2 renderizada:', { isOwner, isEditMode });

  if (!isOwner) {
    return (
      <div className="w-full bg-gray-100 border-b-2 border-gray-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="volter-font">
              <Eye className="w-3 h-3 mr-1" />
              Modo Visitante
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  const handleColorSelect = (color: string) => {
    console.log('🎨 Cor selecionada:', color);
    onBackgroundChange?.({ type: 'color', value: color });
    setShowColorPicker(false);
  };

  const handleBackgroundImageSelect = (asset: any) => {
    console.log('🖼️ Background de imagem selecionado:', asset);
    onBackgroundChange?.({ type: 'image', value: asset.url || asset.src });
    setShowBackgrounds(false);
  };

  const handleStickerSelect = (asset: any) => {
    console.log('🎯 Sticker selecionado:', asset);
    const stickerSrc = asset.url || asset.src;
    onStickerAdd?.(asset.id, stickerSrc, 'Stickers');
    setShowStickers(false);
  };

  return (
    <>
      {/* Main Toolbar */}
      <div className="w-full bg-blue-600 border-b-2 border-blue-800 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg volter-font text-white">
                Personalizar Home
              </h2>
              <Badge variant={isEditMode ? "default" : "secondary"} className="volter-font bg-white text-blue-600">
                {isEditMode ? 'Editando' : 'Visualizando'}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Mode Toggle */}
              <Button
                onClick={() => onEditModeChange(!isEditMode)}
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                className={isEditMode ? 
                  "bg-yellow-500 text-black hover:bg-yellow-400 volter-font" : 
                  "bg-white/20 text-white hover:bg-white/30 volter-font border-white/30"
                }
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
                  <Separator orientation="vertical" className="h-6 bg-white/30" />
                  
                  {/* Color Background Button */}
                  <Button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 volter-font border-white/30"
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Cores
                  </Button>
                  
                  {/* Image Background Button - Papéis */}
                  <Button
                    onClick={() => setShowBackgrounds(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 volter-font border-white/30"
                  >
                    <Image className="w-4 h-4 mr-1" />
                    Papéis
                  </Button>
                  
                  {/* Stickers Button */}
                  <Button
                    onClick={() => setShowStickers(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 volter-font border-white/30"
                  >
                    <Sticker className="w-4 h-4 mr-1" />
                    Stickers
                  </Button>

                  <Separator orientation="vertical" className="h-6 bg-white/30" />
                  
                  {/* Save Button */}
                  <Button 
                    onClick={onSave} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white volter-font"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && isEditMode && (
        <div className="w-full bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Image Selector (Papéis) */}
      <AssetSelector
        open={showBackgrounds}
        onOpenChange={setShowBackgrounds}
        onAssetSelect={handleBackgroundImageSelect}
        type="backgrounds"
        title="Papéis de Parede"
      />

      {/* Sticker Selector */}
      <AssetSelector
        open={showStickers}
        onOpenChange={setShowStickers}
        onAssetSelect={handleStickerSelect}
        type="stickers"
        title="Stickers"
      />
    </>
  );
};
