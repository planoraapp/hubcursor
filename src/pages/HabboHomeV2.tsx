
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useHabboHomeV2 } from '@/hooks/useHabboHomeV2';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';

const HabboHomeV2: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

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

  const handleStickerAdd = async (stickerId: string, stickerSrc: string, category: string) => {
    console.log('🎯 Tentando adicionar sticker:', { stickerId, stickerSrc, category });
    
    const x = Math.random() * (1080 - 100) + 50;
    const y = Math.random() * (1800 - 100) + 50;
    
    await addSticker(stickerId, x, y, stickerSrc, category);
  };

  const handleBackgroundChange = async (type: 'color' | 'cover' | 'repeat', value: string) => {
    console.log('🎨 Mudando background:', { type, value });
    await updateBackground(type, value);
  };

  const handleSave = async () => {
    console.log('💾 Salvando home...');
    try {
      await reloadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1 ml-0 transition-all duration-300">
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
          <SidebarInset className="flex-1 ml-0 transition-all duration-300">
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
        <SidebarInset className="flex-1 ml-0 transition-all duration-300">
          <main className="flex-1 bg-repeat relative" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            
      {/* Enhanced Toolbar */}
      <div className="fixed top-0 left-0 right-0 z-40 p-4 pointer-events-none">
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

      {/* Edit Button - Only shown when NOT in edit mode */}
      {isOwner && !isEditMode && (
        <button
          onClick={() => setIsEditMode(true)}
          className="fixed top-4 right-4 z-50 group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-110"
          style={{
            width: '48px',
            height: '48px',
            backgroundImage: `url('https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home-assets/editinghome.png')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            imageRendering: 'pixelated'
          }}
          title="Entrar no Modo de Edição"
        />
      )}

            <div className="p-4">
              <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
                  <CardTitle className="text-2xl volter-font habbo-text text-center">
                    🏠 {habboData.habbo_name}'s Habbo Home
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="relative">
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
