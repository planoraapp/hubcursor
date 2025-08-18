
import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useHabboHome } from '@/hooks/useHabboHome';
import { useToast } from '@/hooks/use-toast';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { OptimizedDraggableWidget } from '@/components/HabboHome/OptimizedDraggableWidget';
import { OptimizedDroppedSticker } from '@/components/HabboHome/OptimizedDroppedSticker';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';

interface PlacedSticker {
  id: string;
  stickerId: string;
  src: string;
  category: string;
  x: number;
  y: number;
  zIndex: number;
  scale?: number;
  rotation?: number;
}

const EnhancedHabboHome: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    loading,
    isEditMode,
    isOwner,
    setIsEditMode,
    updateWidgetPosition,
    updateWidgetSize,
    addGuestbookEntry,
    getWidgetSizeRestrictions
  } = useHabboHome(username || '');

  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [homeBackground, setHomeBackground] = useState(background);

  // Handle sticker operations
  const handleStickerAdd = useCallback((stickerId: string) => {
    const newSticker: PlacedSticker = {
      id: `sticker_${Date.now()}`,
      stickerId,
      src: `/assets/stickers/${stickerId}.gif`,
      category: stickerId.split('_')[0],
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      zIndex: Date.now(),
      scale: 1,
      rotation: 0
    };
    
    setPlacedStickers(prev => [...prev, newSticker]);
    toast({
      title: "Sticker adicionado!",
      description: "O sticker foi adicionado à sua home."
    });
  }, [toast]);

  const handleStickerPositionChange = useCallback((id: string, x: number, y: number) => {
    setPlacedStickers(prev => 
      prev.map(sticker => 
        sticker.id === id ? { ...sticker, x, y } : sticker
      )
    );
  }, []);

  const handleStickerZIndexChange = useCallback((id: string, zIndex: number) => {
    setPlacedStickers(prev => 
      prev.map(sticker => 
        sticker.id === id ? { ...sticker, zIndex } : sticker
      )
    );
  }, []);

  const handleStickerRemove = useCallback((id: string) => {
    setPlacedStickers(prev => prev.filter(sticker => sticker.id !== id));
    toast({
      title: "Sticker removido",
      description: "O sticker foi removido da sua home."
    });
  }, [toast]);

  // Handle background change
  const handleBackgroundChange = useCallback((bg: { type: 'color' | 'image'; value: string }) => {
    setHomeBackground({
      background_type: bg.type === 'color' ? 'color' : 'repeat',
      background_value: bg.value
    });
  }, []);

  // Handle widget addition
  const handleWidgetAdd = useCallback((widgetType: string) => {
    console.log('Adding widget:', widgetType);
    toast({
      title: "Widget adicionado!",
      description: `O widget ${widgetType} foi adicionado à sua home.`
    });
  }, [toast]);

  // Handle save
  const handleSave = useCallback(() => {
    console.log('Saving home layout...');
    toast({
      title: "Home salva!",
      description: "Suas alterações foram salvas com sucesso."
    });
  }, [toast]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
          <NewAppSidebar />
          <main className="flex-1 flex items-center justify-center ml-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
              <div className="text-lg volter-font text-white habbo-text">
                Carregando Habbo Home...
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!habboData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
          <NewAppSidebar />
          <main className="flex-1 flex items-center justify-center ml-64">
            <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
              <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                <CardTitle className="text-center volter-font">Usuário não encontrado</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <p className="text-gray-700 mb-4 volter-font">
                  O usuário "{username}" não foi encontrado ou não possui uma Habbo Home.
                </p>
                <Button onClick={() => navigate('/console')} className="volter-font">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Console
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  const backgroundStyle = {
    backgroundColor: homeBackground.background_type === 'color' ? homeBackground.background_value : '#c7d2dc',
    backgroundImage: homeBackground.background_type !== 'color' ? `url("${homeBackground.background_value}")` : undefined,
    backgroundSize: homeBackground.background_type === 'repeat' ? 'repeat' : 'cover',
    backgroundPosition: homeBackground.background_type === 'repeat' ? 'top left' : 'center top',
    backgroundRepeat: homeBackground.background_type === 'repeat' ? 'repeat' : 'no-repeat'
  };

  const renderWidget = (widget: any) => {
    const widgetType = widget.widget_id || widget.widget_type;
    const sizeRestrictions = getWidgetSizeRestrictions(widgetType);

    return (
      <OptimizedDraggableWidget
        key={widget.id}
        id={widgetType}
        x={widget.x}
        y={widget.y}
        width={widget.width}
        height={widget.height}
        zIndex={widget.z_index}
        isEditMode={isEditMode}
        isResizable={sizeRestrictions.resizable}
        sizeRestrictions={sizeRestrictions}
        onPositionChange={(x, y) => updateWidgetPosition(widgetType, x, y)}
        onSizeChange={(width, height) => updateWidgetSize(widgetType, width, height)}
        onZIndexChange={(zIndex) => console.log('Z-index change:', zIndex)}
      >
        {widgetType === 'avatar' || widgetType === 'usercard' ? (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3">
              <CardTitle className="volter-font text-center text-lg habbo-text">
                👤 {habboData.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-center">
              <img
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboData.name}&direction=2&head_direction=3&size=l`}
                alt={habboData.name}
                className="w-20 h-20 mx-auto mb-2"
                style={{ imageRendering: 'pixelated' }}
              />
              <p className="text-sm volter-font">{habboData.motto || 'Sem missão definida'}</p>
              <Badge className="mt-2 volter-font">Hotel: {habboData.hotel?.toUpperCase() || 'BR'}</Badge>
            </CardContent>
          </Card>
        ) : widgetType === 'guestbook' ? (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3">
              <CardTitle className="volter-font text-center text-lg habbo-text">
                📝 Livro de Visitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {guestbook.map((entry) => (
                  <div key={entry.id} className="bg-gray-50 p-2 rounded-lg border">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs text-blue-600 volter-font">
                        {entry.author_habbo_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 volter-font">{entry.message}</p>
                  </div>
                ))}
              </div>
              {!isOwner && (
                <div className="text-center py-3 border-t">
                  <p className="text-sm text-gray-500 volter-font">
                    Faça login para deixar uma mensagem
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : widgetType === 'rating' ? (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3">
              <CardTitle className="volter-font text-center text-lg habbo-text">
                ⭐ Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 text-center">
              <div className="text-3xl mb-2 volter-font text-yellow-600">4.8</div>
              <div className="text-sm text-gray-600 volter-font">Baseado em 25 avaliações</div>
            </CardContent>
          </Card>
        ) : null}
      </OptimizedDraggableWidget>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <NewAppSidebar />
        <main className="flex-1 overflow-y-auto ml-64">
          {/* Enhanced Toolbar */}
          <EnhancedHomeToolbar
            isEditMode={isEditMode}
            isOwner={isOwner}
            onEditModeChange={setIsEditMode}
            onSave={handleSave}
            onBackgroundChange={handleBackgroundChange}
            onStickerAdd={handleStickerAdd}
            onWidgetAdd={handleWidgetAdd}
          />

          {/* Header */}
          <div className="p-4">
            <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl volter-font habbo-text flex items-center gap-2">
                      🏠 {habboData.name}'s Habbo Home
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-white/20 text-white volter-font">
                        Hotel: {habboData.hotel?.toUpperCase() || 'BR'}
                      </Badge>
                      <Badge className="bg-white/20 text-white volter-font">
                        Enhanced Home
                      </Badge>
                      {habboData.is_online && (
                        <Badge className="bg-green-500 text-white volter-font">
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/console')}
                    className="text-white border-white/30 hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Home Canvas */}
            <div className="flex justify-center">
              <div 
                className="home-canvas border-4 border-black rounded-lg relative overflow-hidden"
                style={backgroundStyle}
              >
                {/* Render Widgets */}
                {widgets.map(renderWidget)}

                {/* Render Stickers */}
                {placedStickers.map((sticker) => (
                  <OptimizedDroppedSticker
                    key={sticker.id}
                    id={sticker.id}
                    stickerId={sticker.stickerId}
                    src={sticker.src}
                    category={sticker.category}
                    x={sticker.x}
                    y={sticker.y}
                    zIndex={sticker.zIndex}
                    scale={sticker.scale}
                    rotation={sticker.rotation}
                    isEditMode={isEditMode}
                    onPositionChange={handleStickerPositionChange}
                    onZIndexChange={handleStickerZIndexChange}
                    onRemove={handleStickerRemove}
                  />
                ))}

                {/* Empty State */}
                {widgets.length === 0 && placedStickers.length === 0 && !loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8 text-center border-2 border-black">
                      <h3 className="text-xl text-gray-800 mb-2 volter-font">
                        Home em construção
                      </h3>
                      <p className="text-gray-600 volter-font">
                        Esta Habbo Home ainda está sendo configurada.
                      </p>
                      {isOwner && (
                        <p className="text-sm text-blue-600 mt-2 volter-font">
                          Clique em "Editar" para personalizar!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Edit Mode Instructions */}
                {isEditMode && isOwner && (
                  <div className="absolute top-4 left-4 bg-blue-100/90 backdrop-blur-sm rounded-lg p-3 border border-blue-300">
                    <p className="text-sm text-blue-800 volter-font">
                      💡 Modo de edição ativo - arraste widgets e stickers para reorganizar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EnhancedHabboHome;
