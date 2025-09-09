import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useHabboHomeV2 } from '@/hooks/useHabboHomeV2';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';
import { HubHomeAssets } from '@/components/HabboHome/HubHomeAssets';
import { MobileLayout } from '@/components/ui/mobile-layout';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';

const HabboHomeV2: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Estados para controlar os modais de edição
  const [showAssetsModal, setShowAssetsModal] = useState(false);
  const [currentAssetType, setCurrentAssetType] = useState<'stickers' | 'widgets' | 'backgrounds'>('stickers');

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
    loading,
    isMobile
  });

  const handleStickerAdd = async (stickerId: string, stickerSrc: string, category: string) => {
    console.log('🎯 Tentando adicionar sticker:', { stickerId, stickerSrc, category });
    
    // O hook useHabboHomeV2 já define a posição no canto superior esquerdo (20, 20)
    // Então não precisamos passar x e y aqui
    await addSticker(stickerId, 0, 0, stickerSrc, category);
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

  // Funções para controlar os modais de edição
  const handleOpenAssetsModal = (type: 'stickers' | 'widgets' | 'backgrounds') => {
    setCurrentAssetType(type);
    setShowAssetsModal(true);
  };

  const handleAssetSelect = (asset: any) => {
    console.log('🎯 Asset selecionado:', asset);
    
    if (asset.type === 'background') {
      // Para backgrounds, usar o callback existente
      handleBackgroundChange('cover', asset.src);
    } else if (asset.type === 'sticker') {
      // Para stickers, usar o callback existente
      handleStickerAdd(asset.id, asset.src, asset.category);
    } else if (asset.type === 'widget') {
      // Para widgets, usar o callback existente
      addWidget(asset.id);
    }
    
    setShowAssetsModal(false);
  };

  // Mobile dock items
  const mobileMenuItems = [
    { id: 'home', label: 'Início', icon: '/assets/home.png', order: 1 },
    { id: 'homes', label: 'Home', icon: '/assets/homepadrao.png', order: 2 },
    { id: 'console', label: 'Console', icon: '/assets/consoleon3.gif', order: 3 },
    { id: 'journal', label: 'Jornal', icon: '/assets/news.png', order: 4 },
    { id: 'tools', label: 'Ferramentas', icon: '/assets/ferramentas.png', order: 5 }
  ];

  const handleMobileItemClick = (itemId: string) => {
    switch (itemId) {
      case 'home':
        navigate('/');
        break;
      case 'homes':
        navigate('/home');
        break;
      case 'console':
        navigate('/console');
        break;
      case 'journal':
        navigate('/journal');
        break;
      default:
        console.log('Mobile item clicked:', itemId);
    }
  };

  if (loading) {
    const loadingContent = (
      <div className="flex-1 flex items-center justify-center" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-white" />
          <div className="text-lg volter-font text-white habbo-text">
            Carregando Habbo Home...
          </div>
        </div>
      </div>
    );

    return isMobile ? (
      <MobileLayout
        menuItems={mobileMenuItems}
        onItemClick={handleMobileItemClick}
        currentPath={`/home/${username}`}
      >
        {loadingContent}
      </MobileLayout>
    ) : (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1 ml-0 transition-all duration-300">
            <main>{loadingContent}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  if (!habboData) {
    const errorContent = (
      <div className="flex-1 flex items-center justify-center" style={{ 
        backgroundImage: 'url(/assets/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
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
      </div>
    );

    return isMobile ? (
      <MobileLayout
        menuItems={mobileMenuItems}
        onItemClick={handleMobileItemClick}
        currentPath={`/home/${username}`}
      >
        {errorContent}
      </MobileLayout>
    ) : (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1 ml-0 transition-all duration-300">
            <main>{errorContent}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  const homeContent = (
    <div className="flex-1 relative" style={{ 
      backgroundImage: 'url(/assets/bghabbohub.png)',
      backgroundRepeat: 'repeat'
    }}>


      <div className={`p-4 ${isMobile ? 'pb-24' : ''}`}>
        <Card className="mb-6 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-b-2 border-black">
            <CardTitle className={`volter-font habbo-text text-center ${isMobile ? 'text-lg' : 'text-2xl'}`}>
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
            onOpenAssetsModal={handleOpenAssetsModal}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            onSave={handleSave}
            onBackgroundChange={handleBackgroundChange}
            onStickerAdd={handleStickerAdd}
            onWidgetAdd={addWidget}
          />
        </div>
      </div>

      {/* Modal de Assets das Hub Homes */}
      {showAssetsModal && (
        <HubHomeAssets
          type={currentAssetType}
          onSelect={handleAssetSelect}
          onClose={() => setShowAssetsModal(false)}
        />
      )}
    </div>
  );

  return isMobile ? (
    <MobileLayout
      menuItems={mobileMenuItems}
      onItemClick={handleMobileItemClick}
      currentPath={`/homes/${username}`}
    >
      {homeContent}
    </MobileLayout>
  ) : (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1 ml-0 transition-all duration-300">
          <main>{homeContent}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default HabboHomeV2;
