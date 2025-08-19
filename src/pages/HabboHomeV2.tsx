import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useHabboHomeV2 } from '@/hooks/useHabboHomeV2';
import { useToast } from '@/hooks/use-toast';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const HabboHomeV2: React.FC = () => {
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
    updateStickerPosition,
    addSticker,
    removeSticker,
    updateBackground,
    addWidget,
    removeWidget,
    reloadData
  } = useHabboHomeV2(username || '');

  console.log('🏠 HabboHomeV2 renderizada:', {
    username,
    isOwner,
    isEditMode,
    widgetsCount: widgets.length,
    stickersCount: stickers.length,
    background,
    loading
  });

  // Handle sticker operations
  const handleStickerAdd = async (stickerId: string, stickerSrc: string, category: string) => {
    console.log('🎯 Tentando adicionar sticker:', { stickerId, stickerSrc, category });
    
    const x = Math.random() * (1080 - 100) + 50;
    const y = Math.random() * (1800 - 100) + 50;
    
    const success = await addSticker(stickerId, x, y, stickerSrc, category);
    
    if (success) {
      toast({
        title: "Sticker adicionado!",
        description: "O sticker foi adicionado à sua home."
      });
    } else {
      toast({
        title: "Erro ao adicionar sticker",
        description: "Não foi possível adicionar o sticker.",
        variant: "destructive"
      });
    }
  };

  // Handle background change with new interface
  const handleBackgroundChange = async (type: 'color' | 'cover' | 'repeat', value: string) => {
    console.log('🎨 Mudando background:', { type, value });
    
    await updateBackground(type, value);
    
    let description = '';
    switch(type) {
      case 'color':
        description = 'A cor de fundo da sua home foi alterada.';
        break;
      case 'cover':
        description = 'A imagem de fundo foi aplicada (cobertura completa).';
        break;
      case 'repeat':
        description = 'A imagem de fundo foi aplicada (padrão repetido).';
        break;
    }
    
    toast({
      title: "Fundo alterado!",
      description
    });
  };

  // Handle save with real functionality
  const handleSave = async () => {
    console.log('💾 Salvando home...');
    try {
      await reloadData();
      toast({
        title: "Home salva!",
        description: "Suas alterações foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            <main className="flex-1 bg-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
                <div className="text-lg volter-font text-white habbo-text">
                  Carregando Habbo Home...
                </div>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!habboData) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            <main className="flex-1 bg-repeat flex items-center justify-center" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
              <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                  <CardTitle className="text-center volter-font">Usuário não encontrado</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-700 mb-4 volter-font">
                    O usuário "{username}" não foi encontrado ou não possui uma Habbo Home.
                  </p>
                  <Button onClick={() => navigate('/homes')} className="volter-font">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar às Homes
                  </Button>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            
            {/* Header - Simplified */}
            <div className="p-4">
              <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
                  <CardTitle className="text-2xl volter-font habbo-text text-center">
                    🏠 {habboData.habbo_name}'s Habbo Home
                  </CardTitle>
                </CardHeader>
              </Card>

              {/* Enhanced Toolbar - Positioned between header and canvas */}
              <div className="relative mb-6">
                <EnhancedHomeToolbar
                  isEditMode={isEditMode}
                  isOwner={isOwner}
                  onToggleEditMode={() => setIsEditMode(!isEditMode)}
                  onSave={handleSave}
                  onBackgroundChange={handleBackgroundChange}
                  onStickerSelect={handleStickerAdd}
                  onWidgetAdd={addWidget}
                />
              </div>

              {/* Home Canvas Container with Notch */}
              <div className="relative">
                {/* Edit Notch Button - Overlapping top-right corner */}
                {isOwner && (
                  <div className="absolute -top-4 -right-4 z-50">
                    <button
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`
                        relative overflow-hidden group
                        bg-gradient-to-br from-primary to-primary/80 
                        hover:from-primary/90 hover:to-primary/70
                        text-primary-foreground
                        border-2 border-primary-foreground/20
                        transition-all duration-300 ease-out
                        ${isEditMode 
                          ? 'rounded-t-xl rounded-b-none px-4 py-3 shadow-xl scale-105' 
                          : 'rounded-full px-3 py-2 shadow-lg hover:scale-110'
                        }
                      `}
                      title={isEditMode ? 'Sair do modo edição' : 'Entrar no modo edição'}
                    >
                      {/* Background Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Content */}
                      <div className="relative flex items-center gap-2 font-volter text-sm font-medium">
                        <div className={`transition-transform duration-300 ${isEditMode ? 'rotate-45' : ''}`}>
                          {isEditMode ? '⚙️' : '✏️'}
                        </div>
                        <span className={`transition-all duration-300 ${isEditMode ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
                          EDITANDO
                        </span>
                      </div>

                      {/* Notch Connector - Shows when active */}
                      {isEditMode && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary" />
                        </div>
                      )}

                      {/* Subtle Animation Ring */}
                      <div className={`
                        absolute inset-0 rounded-full border-2 border-primary-foreground/30
                        transition-all duration-500 ease-out
                        ${isEditMode 
                          ? 'scale-125 opacity-0' 
                          : 'scale-100 opacity-0 group-hover:opacity-100 group-hover:scale-110'
                        }
                      `} />
                    </button>
                  </div>
                )}

                {/* Home Canvas with new dimensions */}
                  <HomeCanvas
                    widgets={widgets}
                    stickers={stickers}
                    background={background}
                    habboData={habboData}
                    guestbook={guestbook}
                    isEditMode={isEditMode}
                    isOwner={isOwner}
                    onWidgetPositionChange={updateWidgetPosition}
                    onStickerPositionChange={updateStickerPosition}
                    onStickerRemove={removeSticker}
                    onWidgetRemove={removeWidget}
                  />
                </div>
              </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HabboHomeV2;
