import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Edit3, Save, X, Palette, Move, Plus, Trash2, Settings } from 'lucide-react';
import { useHabboHomeV2 } from '@/hooks/useHabboHomeV2';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
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
    addSticker,
    addWidget,
    removeSticker,
    removeWidget,
    reload
  } = useHabboHomeV2(username || '');

  // Extrair dados da homeData
  const widgets = homeData?.widgets || [];
  const stickers = homeData?.stickers || [];
  const background = homeData?.background || null;
  const guestbook = homeData?.guestbook || [];
  
  // Funções de edição
  const updateWidgetPosition = (widgetId: string, x: number, y: number) => {
    console.log('📊 Atualizando posição do widget:', { widgetId, x, y, isEditMode, isOwner });
    if (isEditMode && isOwner) {
      updateWidget(widgetId, { x, y });
    }
  };

  const updateStickerPosition = (stickerId: string, x: number, y: number) => {
    console.log('🎭 Atualizando posição do sticker:', { stickerId, x, y, isEditMode, isOwner });
    if (isEditMode && isOwner) {
      updateSticker(stickerId, { x, y });
    }
  };

  // Funções de adição/remoção usando o hook
  const handleAddSticker = (stickerData: any) => {
    if (isEditMode && isOwner) {
      console.log('🎭 Adicionando sticker:', stickerData);
      addSticker(stickerData);
    }
  };

  const handleAddWidget = (widgetType: string) => {
    console.log('📊 Tentando adicionar widget:', { widgetType, isEditMode, isOwner });
    
    if (isEditMode && isOwner) {
      console.log('📊 Adicionando widget:', widgetType);
      addWidget(widgetType);
      console.log('✅ Widget adicionado com sucesso!');
    } else {
      console.log('❌ Não é possível adicionar widget:', { isEditMode, isOwner });
    }
  };

  const handleRemoveSticker = (stickerId: string) => {
    if (isEditMode && isOwner) {
      console.log('🗑️ Removendo sticker:', stickerId);
      removeSticker(stickerId);
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (isEditMode && isOwner) {
      console.log('🗑️ Removendo widget:', widgetId);
      removeWidget(widgetId);
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

  const handleStickerAdd = async (stickerData: any) => {
    console.log('🎯 Tentando adicionar sticker:', { stickerData, isEditMode, isOwner });
    
    if (isEditMode && isOwner) {
      console.log('🎭 Dados posicionados:', stickerData);
      await addSticker(stickerData);
      console.log('✅ Sticker adicionado com sucesso!');
    } else {
      console.log('❌ Não é possível adicionar sticker:', { isEditMode, isOwner });
    }
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
      setIsEditMode(false); // Fecha o modo de edição após salvar
      console.log('✅ Home salva e modo de edição fechado');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  // Mobile menu items
  const mobileMenuItems = [
    { id: 'home', label: 'Home', icon: '🏠', path: '/', order: 1 },
    { id: 'homes', label: 'Homes', icon: '🏘️', path: '/homes', order: 2 },
    { id: 'console', label: 'Console', icon: '🎮', path: '/console', order: 3 },
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
          onStickerRemove={handleRemoveSticker}
          onWidgetRemove={handleRemoveWidget}
          onBackgroundChange={handleBackgroundChange}
          onStickerAdd={handleStickerAdd}
          onWidgetAdd={handleAddWidget}
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