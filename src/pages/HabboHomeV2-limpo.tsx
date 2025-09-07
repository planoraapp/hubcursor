import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Edit3, Save, X, Palette, Move, Plus, Trash2, Settings } from 'lucide-react';
import { useHabboHomeV2 } from '@/hooks/useHabboHomeV2';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';
import { MobileLayout } from '@/components/ui/mobile-layout';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset, useSidebar } from '@/components/ui/sidebar';

const HabboHomeV2: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Estado de edição
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const {
    habboData,
    homeData,
    loading,
    isOwner,
    updateWidget,
    updateSticker,
    updateBackground,
    reload
  } = useHabboHomeV2(username || '');

  // Extrair dados da homeData
  const widgets = homeData?.widgets || [];
  const stickers = homeData?.stickers || [];
  const background = homeData?.background || null;
  const guestbook = []; // TODO: Implementar guestbook
  
  // Funções de edição
  const updateWidgetPosition = (widgetId: string, x: number, y: number) => {
    if (isEditMode && isOwner) {
      updateWidget(widgetId, { x, y });
    }
  };

  const updateStickerPosition = (stickerId: string, x: number, y: number) => {
    if (isEditMode && isOwner) {
      updateSticker(stickerId, { x, y });
    }
  };

  const removeSticker = (stickerId: string) => {
    if (isEditMode && isOwner) {
      updateSticker(stickerId, { is_visible: false });
    }
  };

  const removeWidget = (widgetId: string) => {
    if (isEditMode && isOwner) {
      updateWidget(widgetId, { is_visible: false });
    }
  };

  const addSticker = (stickerType: string) => {
    if (isEditMode && isOwner) {
      // Implementar adição de sticker
      console.log('Adicionando sticker:', stickerType);
    }
  };

  const addWidget = (widgetType: string) => {
    if (isEditMode && isOwner) {
      // Implementar adição de widget
      console.log('Adicionando widget:', widgetType);
    }
  };

  const reloadData = reload;

  console.log('🎨 HabboHomeV2 renderizada:', {
    username,
    isOwner,
    isEditMode,
    widgetsCount: widgets.length,
    stickersCount: stickers.length,
    background,
    loading,
    isMobile
  });

  const handleStickerAdd = async (stickerType: string) => {
    console.log('🎯 Tentando adicionar sticker:', { stickerType });
    
    const x = Math.random() * (1080 - 100) + 50;
    const y = Math.random() * (1800 - 100) + 50;
    
    addSticker(stickerType);
  };

  const handleBackgroundChange = async (type: 'color' | 'cover' | 'repeat', value: string) => {
    if (isEditMode && isOwner) {
      console.log('🎨 Mudando background:', { type, value });
      await updateBackground({ background_value: value, background_type: type });
      setShowBackgroundPicker(false);
    }
  };

  const handleSave = async () => {
    console.log('💾 Salvando home...');
    try {
      await reloadData();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Mobile menu items
  const mobileMenuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/' },
    { id: 'homes', label: 'Homes', icon: '🏘️', path: '/homes' },
    { id: 'console', label: 'Console', icon: '🎮', path: '/console' },
  ];

  const handleMobileItemClick = (item: any) => {
    navigate(item.path);
  };

  if (loading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-center volter-font">Carregando home...</p>
          </CardContent>
        </Card>
      </div>
    );

    return isMobile ? (
      <MobileLayout
        menuItems={mobileMenuItems}
        onItemClick={handleMobileItemClick}
        currentPath={`/homes/${username}`}
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
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-bold mb-4 volter-font">Usuário não encontrado</h2>
            <p className="text-center text-gray-600 mb-6 volter-font">
              O usuário "{username}" não foi encontrado ou não possui uma home.
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
        currentPath={`/homes/${username}`}
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
      {/* Botão Editar Home - Flutuante */}
      {!isMobile && isOwner && !isEditMode && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setIsEditMode(true)}
            variant="default"
            size="lg"
            className="volter-font shadow-xl"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Editar Home
          </Button>
        </div>
      )}

      <div className="relative">
        <HomeCanvas
          widgets={widgets}
          stickers={stickers}
          background={background as any}
          habboData={habboData}
          guestbook={guestbook}
          isEditMode={isEditMode}
          isOwner={isOwner}
          onWidgetPositionChange={updateWidgetPosition}
          onStickerPositionChange={updateStickerPosition}
          onStickerRemove={removeSticker}
          onWidgetRemove={removeWidget}
          onBackgroundChange={handleBackgroundChange}
          onStickerAdd={handleStickerAdd}
          onWidgetAdd={addWidget}
          onSave={handleSave}
          onExitEditMode={() => setIsEditMode(false)}
          onEnterEditMode={() => setIsEditMode(true)}
          showBackgroundPicker={showBackgroundPicker}
          setShowBackgroundPicker={setShowBackgroundPicker}
          showWidgetPicker={showWidgetPicker}
          setShowWidgetPicker={setShowWidgetPicker}
          showStickerPicker={showStickerPicker}
          setShowStickerPicker={setShowStickerPicker}
        />
      </div>
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
