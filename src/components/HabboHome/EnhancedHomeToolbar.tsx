import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Edit, Eye, Palette, Image, Sticker, Grid3X3, Save, X } from 'lucide-react';
import { AssetSelector } from './AssetSelector';

interface EnhancedHomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onEditModeChange: (editMode: boolean) => void;
  onSave?: () => void;
  onBackgroundChange?: (bg: { type: 'color' | 'image'; value: string }) => void;
  onStickerAdd?: (stickerId: string, stickerSrc: string, category: string) => void;
  onWidgetAdd?: (widgetType: string) => void;
}

// Background colors for gradient slider
const BACKGROUND_COLORS = [
  '#ff0000', '#ff4000', '#ff8000', '#ffbf00', '#ffff00',
  '#bfff00', '#80ff00', '#40ff00', '#00ff00', '#00ff40',
  '#00ff80', '#00ffbf', '#00ffff', '#00bfff', '#0080ff',
  '#0040ff', '#0000ff', '#4000ff', '#8000ff', '#bf00ff',
  '#ff00ff', '#ff00bf', '#ff0080', '#ff0040', '#ffffff',
  '#f0f0f0', '#e0e0e0', '#d0d0d0', '#c0c0c0', '#b0b0b0',
  '#a0a0a0', '#909090', '#808080', '#707070', '#606060',
  '#505050', '#404040', '#303030', '#202020', '#000000'
];

const WIDGET_TYPES = [
  { id: 'guestbook', name: 'Livro de Visitas', description: 'Permite que visitantes deixem mensagens' },
  { id: 'rating', name: 'Avaliação', description: 'Sistema de avaliação com estrelas' }
];

export const EnhancedHomeToolbar: React.FC<EnhancedHomeToolbarProps> = ({ 
  isEditMode, 
  isOwner, 
  onEditModeChange, 
  onSave,
  onBackgroundChange,
  onStickerAdd,
  onWidgetAdd
}) => {
  const [activeMenu, setActiveMenu] = useState<'wallpaper' | 'stickers' | 'widgets' | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);

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

  const handleMenuToggle = (menu: 'wallpaper' | 'stickers' | 'widgets') => {
    if (activeMenu === menu) {
      setActiveMenu(null);
      setShowColorPicker(false);
      setShowBackgrounds(false);
      setShowStickers(false);
      setShowWidgets(false);
    } else {
      setActiveMenu(menu);
      setShowColorPicker(menu === 'wallpaper');
      setShowBackgrounds(false);
      setShowStickers(menu === 'stickers');
      setShowWidgets(menu === 'widgets');
    }
  };

  const handleColorSelect = (color: string) => {
    onBackgroundChange?.({ type: 'color', value: color });
    setShowColorPicker(false);
    setActiveMenu(null);
  };

  const handleBackgroundImageSelect = (asset: any) => {
    onBackgroundChange?.({ type: 'image', value: asset.url || asset.src });
    setShowBackgrounds(false);
    setActiveMenu(null);
  };

  const handleStickerSelect = (asset: any) => {
    const stickerSrc = asset.url || asset.src;
    onStickerAdd?.(asset.id, stickerSrc, asset.category || 'Stickers');
    setShowStickers(false);
    setActiveMenu(null);
  };

  const handleWidgetAdd = (widgetType: string) => {
    onWidgetAdd?.(widgetType);
    setShowWidgets(false);
    setActiveMenu(null);
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
                  
                  {/* 3 Category Menus */}
                  <Button
                    onClick={() => handleMenuToggle('wallpaper')}
                    variant="outline"
                    size="sm"
                    className={`bg-white/20 text-white hover:bg-white/30 volter-font border-white/30 ${
                      activeMenu === 'wallpaper' ? 'bg-white/30' : ''
                    }`}
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Wallpaper
                  </Button>
                  
                  <Button
                    onClick={() => handleMenuToggle('stickers')}
                    variant="outline"
                    size="sm"
                    className={`bg-white/20 text-white hover:bg-white/30 volter-font border-white/30 ${
                      activeMenu === 'stickers' ? 'bg-white/30' : ''
                    }`}
                  >
                    <Sticker className="w-4 h-4 mr-1" />
                    Stickers
                  </Button>

                  <Button
                    onClick={() => handleMenuToggle('widgets')}
                    variant="outline"
                    size="sm"
                    className={`bg-white/20 text-white hover:bg-white/30 volter-font border-white/30 ${
                      activeMenu === 'widgets' ? 'bg-white/30' : ''
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4 mr-1" />
                    Widgets
                  </Button>

                  <Separator orientation="vertical" className="h-6 bg-white/30" />
                  
                  {/* Save with Icon Only */}
                  <Button 
                    onClick={onSave} 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white volter-font p-2"
                    title="Salvar alterações"
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wallpaper Menu */}
      {activeMenu === 'wallpaper' && isEditMode && (
        <div className="w-full bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="space-y-6">
              {/* Background Images */}
              <div>
                <h3 className="volter-font text-gray-800 font-semibold mb-3">Imagens de Fundo</h3>
                <button
                  onClick={() => setShowBackgrounds(true)}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors volter-font text-sm"
                >
                  Selecionar Imagem de Fundo
                </button>
              </div>
              
              {/* Color Slider */}
              <div>
                <h3 className="volter-font text-gray-800 font-semibold mb-3">Cores Sólidas</h3>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {BACKGROUND_COLORS.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => handleColorSelect(color)}
                        className="min-w-[24px] h-6 rounded border border-gray-300 hover:border-blue-500 hover:scale-110 transition-all duration-200 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: color }}
                        title={`Cor ${color}`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 volter-font">
                    Deslize para ver mais cores →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stickers Menu */}
      {activeMenu === 'stickers' && isEditMode && (
        <div className="w-full bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="volter-font text-gray-800 font-semibold">Stickers</h3>
              <Button
                onClick={() => setShowStickers(true)}
                variant="outline"
                size="sm"
                className="volter-font"
              >
                Escolher Sticker
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Widgets Menu */}
      {activeMenu === 'widgets' && isEditMode && (
        <div className="w-full bg-white border-b-2 border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <h3 className="volter-font text-gray-800 font-semibold mb-3">Widgets Disponíveis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {WIDGET_TYPES.map((widget) => (
                <div
                  key={widget.id}
                  className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-colors"
                  onClick={() => handleWidgetAdd(widget.id)}
                >
                  <h4 className="volter-font text-sm font-semibold text-gray-800 mb-1">
                    {widget.name}
                  </h4>
                  <p className="text-xs text-gray-600 volter-font">
                    {widget.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Asset Selectors */}
      <AssetSelector
        open={showBackgrounds}
        onOpenChange={setShowBackgrounds}
        onAssetSelect={handleBackgroundImageSelect}
        type="backgrounds"
        title="Papéis de Parede"
      />

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