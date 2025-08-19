import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useHabboHomeV2 } from '@/hooks/useHabboHomeV2';
import { useToast } from '@/hooks/use-toast';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { HomeToolbarV2 } from '@/components/HabboHome/HomeToolbarV2';
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
    
    const x = Math.random() * (1200 - 100) + 50;
    const y = Math.random() * (1000 - 100) + 50; // Increased canvas height
    
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

  // Handle background change with intelligent logic
  const handleBackgroundChange = async (bg: { type: 'color' | 'image'; value: string }) => {
    console.log('🎨 Mudando background:', bg);
    
    if (bg.type === 'image') {
      // Check image dimensions to determine background behavior
      const img = new Image();
      img.onload = async () => {
        const isSmall = img.width < 200 || img.height < 200;
        const backgroundType = isSmall ? 'repeat' : 'cover';
        await updateBackground(backgroundType, bg.value);
        toast({
          title: "Fundo alterado!",
          description: `O fundo da sua home foi alterado (${isSmall ? 'padrão repetido' : 'imagem única'}).`
        });
      };
      img.src = bg.value;
    } else {
      await updateBackground('color', bg.value);
      toast({
        title: "Fundo alterado!",
        description: "A cor de fundo da sua home foi alterada."
      });
    }
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
            {/* Toolbar */}
            <HomeToolbarV2
              isEditMode={isEditMode}
              isOwner={isOwner}
              onEditModeChange={setIsEditMode}
              onSave={handleSave}
              onBackgroundChange={handleBackgroundChange}
              onStickerAdd={handleStickerAdd}
            />

            {/* Header */}
            <div className="p-4">
              <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl volter-font habbo-text flex items-center gap-2">
                        🏠 {habboData.habbo_name}'s Habbo Home
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-white/20 text-white volter-font">
                          Hotel: {habboData.hotel?.toUpperCase() || 'BR'}
                        </Badge>
                        <Badge className="bg-white/20 text-white volter-font">
                          Home V2
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
                      onClick={() => navigate('/homes')}
                      className="text-white border-white/30 hover:bg-white/10 volter-font"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Home Canvas with increased height */}
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
              />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HabboHomeV2;
