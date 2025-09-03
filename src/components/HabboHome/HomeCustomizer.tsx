
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Palette, Image, Sticker, Settings, Save, Edit, Eye } from 'lucide-react';

interface HomeCustomizerProps {
  isEditMode: boolean;
  isOwner: boolean;
  onToggleEditMode: () => void;
  onSaveLayout: () => void;
  onBackgroundChange: (background: { type: 'color' | 'repeat' | 'cover'; value: string }) => void;
  onStickerInventoryOpen: () => void;
  onWidgetAdd: (widgetType: string) => void;
}

export const HomeCustomizer: React.FC<HomeCustomizerProps> = ({
  isEditMode,
  isOwner,
  onToggleEditMode,
  onSaveLayout,
  onBackgroundChange,
  onStickerInventoryOpen,
  onWidgetAdd
}) => {
  const [selectedBgColor, setSelectedBgColor] = useState('#c7d2dc');

  const backgroundColors = [
    '#c7d2dc', '#f0f0f0', '#e8f4f8', '#f5e6d3', '#ffe6e6',
    '#e6f3e6', '#f0e6ff', '#fff0e6', '#e6e6ff', '#ffe6f0'
  ];

  const backgroundImages = [
    '/assets/backgrounds/bg1.gif',
    '/assets/backgrounds/bg2.gif',
    '/assets/backgrounds/bg3.gif',
    '/assets/backgrounds/bg4.gif',
    '/assets/backgrounds/bg5.gif'
  ];

  const availableWidgets = [
    { id: 'usercard', name: 'Cartão do Usuário', icon: '👤' },
    { id: 'guestbook', name: 'Livro de Visitas', icon: '📝' },
    { id: 'rating', name: 'Avaliação', icon: '⭐' },
    { id: 'info', name: 'Informações', icon: 'ℹ️' },
    { id: 'traxplayer', name: 'Player de Música', icon: '🎵' }
  ];

  if (!isOwner) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-80 shadow-xl border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm volter-font">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Customizar Home
            </div>
            <Badge variant={isEditMode ? "default" : "secondary"} className="volter-font">
              {isEditMode ? 'Editando' : 'Visualizando'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Toggle Edit Mode */}
          <div className="flex gap-2">
            <Button
              onClick={onToggleEditMode}
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              className="flex-1 volter-font"
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
              <Button onClick={onSaveLayout} size="sm" className="volter-font">
                <Save className="w-4 h-4 mr-1" />
                Salvar
              </Button>
            )}
          </div>

          {isEditMode && (
            <Tabs defaultValue="background" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="background" className="text-xs volter-font">Fundo</TabsTrigger>
                <TabsTrigger value="stickers" className="text-xs volter-font">Stickers</TabsTrigger>
                <TabsTrigger value="widgets" className="text-xs volter-font">Widgets</TabsTrigger>
              </TabsList>

              <TabsContent value="background" className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium mb-2 volter-font">Cores Sólidas</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {backgroundColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedBgColor(color);
                          onBackgroundChange({ type: 'color', value: color });
                        }}
                        className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                          selectedBgColor === color ? 'border-blue-500' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 volter-font">Imagens de Fundo</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {backgroundImages.map((bg, index) => (
                      <button
                        key={index}
                        onClick={() => onBackgroundChange({ type: 'repeat', value: bg })}
                        className="h-16 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors overflow-hidden"
                      >
                        <img
                          src={bg}
                          alt={`Background ${index + 1}`}
                          className="w-full h-full object-cover"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="stickers" className="space-y-3">
                <Button
                  onClick={onStickerInventoryOpen}
                  className="w-full volter-font"
                  variant="outline"
                >
                  <Sticker className="w-4 h-4 mr-2" />
                  Abrir Inventário de Stickers
                </Button>
                <p className="text-xs text-gray-600 volter-font">
                  Clique para abrir o inventário completo de stickers, mockups e assets para personalizar sua home.
                </p>
              </TabsContent>

              <TabsContent value="widgets" className="space-y-3">
                <div className="space-y-2">
                  {availableWidgets.map((widget) => (
                    <Button
                      key={widget.id}
                      onClick={() => onWidgetAdd(widget.id)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start volter-font"
                    >
                      <span className="mr-2">{widget.icon}</span>
                      {widget.name}
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!isEditMode && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 volter-font">
                Clique em "Editar" para personalizar sua home
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
