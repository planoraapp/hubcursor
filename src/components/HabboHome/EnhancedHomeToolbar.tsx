
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Eye, Save, Palette, Sticker, Plus, Grid, Settings } from 'lucide-react';

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
  '#e6e6ff', '#f0e6ff', '#ffe6f0', '#f5f5dc', '#e0ffff'
];

const BACKGROUND_IMAGES = [
  '/assets/backgrounds/space.gif',
  '/assets/backgrounds/nature.gif',
  '/assets/backgrounds/city.gif',
  '/assets/backgrounds/ocean.gif'
];

const AVAILABLE_WIDGETS = [
  { id: 'avatar', name: 'Avatar', icon: '👤' },
  { id: 'guestbook', name: 'Livro de Visitas', icon: '📝' },
  { id: 'rating', name: 'Avaliação', icon: '⭐' },
  { id: 'info', name: 'Informações', icon: 'ℹ️' },
  { id: 'music', name: 'Player de Música', icon: '🎵' },
  { id: 'photos', name: 'Fotos', icon: '📷' }
];

const STICKER_CATEGORIES = [
  { id: 'emoticons', name: 'Emoticons', icon: '😀' },
  { id: 'decorative', name: 'Decorativos', icon: '✨' },
  { id: 'text', name: 'Texto', icon: '📝' },
  { id: 'animals', name: 'Animais', icon: '🐾' }
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

  if (!isOwner) return null;

  const handleBackgroundSelect = (type: 'color' | 'image', value: string) => {
    setSelectedBg(value);
    onBackgroundChange?.({ type, value });
  };

  const handleStickerAdd = (stickerId: string) => {
    onStickerAdd?.(stickerId);
    setShowStickers(false);
  };

  const handleWidgetAdd = (widgetType: string) => {
    onWidgetAdd?.(widgetType);
    setShowWidgets(false);
  };

  return (
    <>
      {/* Main Toolbar */}
      <div className="w-full bg-white/95 backdrop-blur-sm border-b-2 border-black shadow-lg">
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
          
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors" className="volter-font">Cores Sólidas</TabsTrigger>
              <TabsTrigger value="images" className="volter-font">Imagens</TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="images" className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {BACKGROUND_IMAGES.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => handleBackgroundSelect('image', image)}
                    className="bg-option aspect-square rounded-lg overflow-hidden"
                  >
                    <img 
                      src={image} 
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Sticker Selection Dialog */}
      <Dialog open={showStickers} onOpenChange={setShowStickers}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="volter-font">Adicionar Stickers</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="emoticons" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              {STICKER_CATEGORIES.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="volter-font">
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {STICKER_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4">
                <div className="grid grid-cols-8 gap-3">
                  {Array.from({ length: 16 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handleStickerAdd(`${category.id}_${i}`)}
                      className="aspect-square bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors p-2"
                    >
                      <div className="text-2xl">{category.icon}</div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            ))}
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
