import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useEnhancedHabboHome } from '@/hooks/useEnhancedHabboHome';
import { useToast } from '@/hooks/use-toast';
import { OptimizedDraggableWidget } from '@/components/HabboHome/OptimizedDraggableWidget';
import { OptimizedDroppedSticker } from '@/components/HabboHome/OptimizedDroppedSticker';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';

const EnhancedHabboHome: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

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
    updateStickerPosition,
    removeStickerFromDb,
    updateBackground,
    addGuestbookEntry,
    getWidgetSizeRestrictions,
    handleSaveLayout,
    handleStickerDrop,
    addWidget
  } = useEnhancedHabboHome(username || '');

  console.log('🏠 EnhancedHabboHome renderizada:', {
    username,
    isOwner,
    isEditMode,
    widgetsCount: widgets.length,
    stickersCount: stickers.length,
    background
  });

  // Handle sticker operations
  const handleStickerAdd = useCallback(async (stickerId: string, stickerSrc: string, category: string) => {
    console.log('🎯 Tentando adicionar sticker:', { stickerId, stickerSrc, category });
    
    if (!handleStickerDrop) {
      console.error('❌ Função handleStickerDrop não disponível');
      return;
    }

    try {
      await handleStickerDrop(stickerId, stickerSrc, category);
      // Removido toast de sucesso - apenas minimizar abas
    } catch (error) {
      console.error('❌ Erro ao adicionar sticker:', error);
      toast({
        title: "Erro ao adicionar sticker",
        description: "Não foi possível adicionar o sticker.",
        variant: "destructive"
      });
    }
  }, [handleStickerDrop, toast]);

  const handleStickerPositionChange = useCallback((id: string, x: number, y: number) => {
    console.log('🎯 Mudando posição do sticker:', { id, x, y });
    if (updateStickerPosition) {
      updateStickerPosition(id, x, y);
    }
  }, [updateStickerPosition]);

  const handleStickerZIndexChange = useCallback((id: string, zIndex: number) => {
    console.log('🎯 Mudando Z-index do sticker:', { id, zIndex });
    // TODO: Implementar Z-index para stickers
  }, []);

  const handleStickerRemove = useCallback((id: string) => {
    console.log('🎯 Removendo sticker:', id);
    if (removeStickerFromDb) {
      removeStickerFromDb(id);
      toast({
        title: "Sticker removido",
        description: "O sticker foi removido da sua home."
      });
    }
  }, [removeStickerFromDb, toast]);

  // Handle background change
  const handleBackgroundChange = useCallback((bg: { type: 'color' | 'image'; value: string }) => {
    console.log('🎨 Mudando background:', bg);
    if (updateBackground) {
      updateBackground(bg.type === 'image' ? 'cover' : 'color', bg.value);
      toast({
        title: "Fundo alterado!",
        description: "O fundo da sua home foi alterado."
      });
    }
  }, [updateBackground, toast]);

  // Handle widget addition - Updated to return Promise<boolean>
  const handleWidgetAdd = useCallback(async (widgetType: string): Promise<boolean> => {
    console.log('📦 Adicionando widget:', widgetType);
    
    if (!addWidget) {
      console.error('❌ Função addWidget não disponível');
      return false;
    }
    
    try {
      await addWidget(widgetType);
      // Removido toast de sucesso - apenas minimizar abas
      
      return true; // Return success
    } catch (error) {
      console.error('❌ Erro ao adicionar widget:', error);
      toast({
        title: "Erro ao adicionar widget",
        description: "Não foi possível adicionar o widget.",
        variant: "destructive"
      });
      
      return false; // Return failure
    }
  }, [addWidget, toast]);

  // Handle save - agora conectado ao handleSaveLayout do hook
  const handleSave = useCallback(async () => {
    console.log('💾 Salvando home...');
    await handleSaveLayout();
  }, [handleSaveLayout]);

  // Handle drag state changes
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex w-full" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
            <div className="text-lg volter-font text-white habbo-text">
              Carregando Habbo Home...
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!habboData) {
    return (
      <div className="min-h-screen flex w-full" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
              <CardTitle className="text-center volter-font">Usuário não encontrado</CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <p className="text-gray-700 mb-4 volter-font">
                O usuário "{username}" não foi encontrado ou não possui uma Habbo Home.
              </p>
              <Button onClick={() => navigate('/')} className="volter-font">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Console
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const backgroundStyle = {
    backgroundColor: background.background_type === 'color' ? background.background_value : '#c7d2dc',
    backgroundImage: background.background_type === 'cover' ? `url("${background.background_value}")` : undefined,
    backgroundSize: background.background_type === 'cover' ? 'cover' : undefined,
    backgroundPosition: background.background_type === 'cover' ? 'center' : undefined,
    backgroundRepeat: background.background_type === 'cover' ? 'no-repeat' : undefined
  };

  console.log('🎨 Background style aplicado:', backgroundStyle);

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
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={isEditMode ? 'edit-mode-widget' : ''}
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
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: 'url(https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/acma_notepad.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="w-full h-full p-3 flex flex-col">
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto flex-1">
                {guestbook.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-black volter-font font-bold">
                      Nenhuma anotação ainda...
                    </p>
                    <p className="text-xs text-black volter-font">
                      Seja o primeiro a deixar uma anotação!
                    </p>
                  </div>
                ) : (
                  guestbook.map((entry) => (
                    <div key={entry.id} className="p-2">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-black volter-font">
                          {entry.author_habbo_name}
                        </span>
                        <span className="text-xs text-black volter-font">
                          {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-black volter-font font-medium leading-relaxed">
                        {entry.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              {!isOwner && (
                <div className="text-center py-2 mt-3">
                  <p className="text-xs text-black volter-font font-medium">
                    Faça login para deixar uma anotação
                  </p>
                </div>
              )}
            </div>
          </div>
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
        ) : widgetType === 'info' ? (
          <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3">
              <CardTitle className="volter-font text-center text-lg habbo-text">
                ℹ️ Informações
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 text-sm volter-font">
                <p><strong>Nome:</strong> {habboData.name}</p>
                <p><strong>Hotel:</strong> {habboData.hotel?.toUpperCase() || 'BR'}</p>
                <p><strong>Status:</strong> {habboData.is_online ? '🟢 Online' : '🔴 Offline'}</p>
                <p><strong>Missão:</strong> {habboData.motto || 'Não definida'}</p>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </OptimizedDraggableWidget>
    );
  };

  return (
    <div className="min-h-screen" style={{ 
      backgroundImage: 'url(/assets/bghabbohub.png)',
      backgroundRepeat: 'repeat'
    }}>
      {/* Enhanced Toolbar */}
      <EnhancedHomeToolbar
        isEditMode={isEditMode}
        isOwner={isOwner}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onSave={handleSave}
        onBackgroundChange={(type, value) => handleBackgroundChange({ type: type === 'cover' || type === 'repeat' ? 'image' : 'color', value })}
        onStickerSelect={handleStickerAdd}
        onWidgetAdd={handleWidgetAdd}
        isDragging={isDragging}
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
                  <Badge className="bg-white/20 text-white volter-font">
                    Widgets: {widgets.length} | Stickers: {stickers.length}
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
                onClick={() => navigate('/')}
                className="text-white border-white/30 hover:bg-white/10 volter-font"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Home Canvas Container */}
        <div className="flex justify-center">
          <div 
            className="home-canvas relative w-[1200px] h-[800px] rounded-lg overflow-hidden shadow-2xl"
            style={backgroundStyle}
          >
            {/* Render Widgets */}
            {widgets.map(renderWidget)}

            {/* Render Stickers */}
            {stickers.map((sticker) => (
              <OptimizedDroppedSticker
                key={sticker.id}
                id={sticker.id}
                stickerId={sticker.sticker_id}
                src={sticker.sticker_src}
                category={sticker.category}
                x={sticker.x}
                y={sticker.y}
                zIndex={sticker.z_index}
                scale={sticker.scale}
                rotation={sticker.rotation}
                isEditMode={isEditMode}
                onPositionChange={handleStickerPositionChange}
                onZIndexChange={handleStickerZIndexChange}
                onRemove={handleStickerRemove}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}

            {/* Empty State */}
            {widgets.length === 0 && stickers.length === 0 && !loading && (
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
                  💡 Modo de edição ativo - use a toolbar para adicionar itens
                </p>
              </div>
            )}

            {/* Canvas Border for Edit Mode */}
            {isEditMode && (
              <div className="absolute inset-0 border-4 border-dashed border-blue-400 pointer-events-none rounded-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHabboHome;
