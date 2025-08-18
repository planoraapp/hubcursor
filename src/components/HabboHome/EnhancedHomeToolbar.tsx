
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Eye, Save, Palette, Sticker, Plus, Grid, Settings } from 'lucide-react';
import { getStickersByCategory } from '@/data/stickerAssets';

interface EnhancedHomeToolbarProps {
  isEditMode: boolean;
  isOwner: boolean;
  onEditModeChange: (editMode: boolean) => void;
  onSave?: () => void;
  onBackgroundChange?: (bg: { type: 'color' | 'image'; value: string }) => void;
  onStickerAdd?: (stickerId: string) => void;
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
  const [selectedBg, setSelectedBg] = useState('#c7d2dc');

  console.log('🛠️ Toolbar renderizada - isOwner:', isOwner, 'isEditMode:', isEditMode);

  if (!isOwner) {
    console.log('⚠️ Toolbar não será exibida - usuário não é proprietário');
    return null;
  }

  const handleBackgroundSelect = (type: 'color' | 'image', value: string) => {
    setSelectedBg(value);
    onBackgroundChange?.({ type, value });
    setShowBackgrounds(false);
  };

  const handleStickerAdd = (stickerId: string) => {
    console.log('🎯 Adicionando sticker via toolbar:', stickerId);
    onStickerAdd?.(stickerId);
    setShowStickers(false);
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
                  
                  {/* Background Button */}
                  <Button
                    onClick={() => setShowBackgrounds(true)}
                    variant="outline"
                    size="sm"
                    className="volter-font"
                  >
                    <Palette className="w-4 h-4 mr-1" />
                    Fundos
                  </Button>
                  
                  {/* Stickers Button */}
                  <Button
                    onClick={() => setShowStickers(true)}
                    variant="outline"
                    size="sm"
                    className="volter-font"
                  >
                    <Sticker className="w-4 h-4 mr-1" />
                    Stickers
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

      {/* Background Selection Dialog */}
      <Dialog open={showBackgrounds} onOpenChange={setShowBackgrounds}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="volter-font">Escolher Fundo da Home</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <h3 className="text-lg volter-font">Cores Sólidas</h3>
            <div className="bg-grid">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => handleBackgroundSelect('color', color)}
                  className={`bg-option ${selectedBg === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticker Selection Dialog */}
      <Dialog open={showStickers} onOpenChange={setShowStickers}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="volter-font">Adicionar Stickers</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="emoticons" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="emoticons" className="volter-font">
                😀 Emoticons
              </TabsTrigger>
              <TabsTrigger value="decorative" className="volter-font">
                ✨ Decorativos
              </TabsTrigger>
              <TabsTrigger value="text" className="volter-font">
                📝 Texto
              </TabsTrigger>
              <TabsTrigger value="animals" className="volter-font">
                🐾 Animais
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="emoticons" className="space-y-4">
              <div className="sticker-grid">
                {getStickersByCategory('emoticons').map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleStickerAdd(sticker.id)}
                    className="sticker-item"
                    title={sticker.name}
                  >
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="decorative" className="space-y-4">
              <div className="sticker-grid">
                {getStickersByCategory('decorative').map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleStickerAdd(sticker.id)}
                    className="sticker-item"
                    title={sticker.name}
                  >
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-4">
              <div className="sticker-grid">
                {getStickersByCategory('text').map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleStickerAdd(sticker.id)}
                    className="sticker-item"
                    title={sticker.name}
                  >
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="animals" className="space-y-4">
              <div className="sticker-grid">
                {getStickersByCategory('animals').map((sticker) => (
                  <button
                    key={sticker.id}
                    onClick={() => handleStickerAdd(sticker.id)}
                    className="sticker-item"
                    title={sticker.name}
                  >
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

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
