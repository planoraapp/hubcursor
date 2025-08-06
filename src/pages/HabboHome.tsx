
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHabboHome } from '@/hooks/useHabboHome';
import { DraggableWidget } from '@/components/HabboHome/DraggableWidget';
import { AvatarWidget } from '@/components/HabboHome/AvatarWidget';
import { GuestbookWidget } from '@/components/HabboHome/GuestbookWidget';
import { HomeToolbar } from '@/components/HabboHome/HomeToolbar';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';

const HabboHome: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const isMobile = useIsMobile();
  
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
    addGuestbookEntry
  } = useHabboHome(username || '');

  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarChange as EventListener);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-repeat bg-cover flex" 
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <CollapsibleSidebar activeSection="homes" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} flex items-center justify-center`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-white volter-font" style={{
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}>
              Carregando Habbo Home...
            </p>
            <p className="text-sm text-white volter-font" style={{
              textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
            }}>
              de {username}
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!habboData) {
    return (
      <div className="min-h-screen bg-repeat bg-cover flex" 
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <CollapsibleSidebar activeSection="homes" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} flex items-center justify-center`}>
          <Card className="p-8 text-center max-w-md bg-white/95 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-2 volter-font">Usuário não encontrado</h2>
            <p className="text-gray-600 mb-4">
              O usuário "{username}" não foi encontrado ou não possui uma Habbo Home.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const getBackgroundStyle = () => {
    const { background_type, background_value } = background;
    
    switch (background_type) {
      case 'color':
        return { backgroundColor: background_value };
      case 'repeat':
        return {
          backgroundImage: `url(/assets/${background_value})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        };
      case 'cover':
        return {
          backgroundImage: `url(/assets/${background_value})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: '#007bff' };
    }
  };

  // Widgets padrão que devem aparecer
  const getWidgetPosition = (widgetId: string) => {
    const widget = widgets.find(w => w.widget_id === widgetId);
    return widget || {
      id: '',
      widget_id: widgetId,
      x: getDefaultPosition(widgetId).x,
      y: getDefaultPosition(widgetId).y,
      z_index: 1,
      width: getDefaultPosition(widgetId).width,
      height: getDefaultPosition(widgetId).height,
      is_visible: true
    };
  };

  const getDefaultPosition = (widgetId: string) => {
    const defaults: Record<string, { x: number; y: number; width: number; height: number }> = {
      avatar: { x: 20, y: 80, width: 300, height: 280 },
      guestbook: { x: 350, y: 80, width: 400, height: 350 },
      traxplayer: { x: 20, y: 380, width: 300, height: 200 },
      rating: { x: 780, y: 80, width: 200, height: 150 },
      tabs: { x: 350, y: 450, width: 400, height: 300 }
    };
    return defaults[widgetId] || { x: 50, y: 50, width: 200, height: 150 };
  };

  const handleWidgetPositionChange = (widgetId: string, x: number, y: number) => {
    updateWidgetPosition(widgetId, x, y);
  };

  const handleWidgetSizeChange = (widgetId: string, width: number, height: number) => {
    updateWidgetSize(widgetId, width, height);
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Habbo Home</h2>
          <p className="text-gray-600 mb-4">
            A Habbo Home está disponível apenas na versão desktop para uma melhor experiência de personalização.
          </p>
          <p className="text-sm text-gray-500">
            Acesse pelo computador para visualizar e editar sua home personalizada.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-repeat bg-cover flex" 
         style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <CollapsibleSidebar activeSection="homes" setActiveSection={() => {}} />
      
      <main className={`flex-1 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Título da página */}
        <div className="bg-white/95 backdrop-blur-sm shadow-sm border-b p-4">
          <h1 className="text-2xl font-bold text-center text-gray-800 volter-font">
            🏠 Habbo Home - {habboData.name}
          </h1>
        </div>

        {/* Container principal da home */}
        <div className="relative h-full">
          <div 
            className="relative min-h-screen overflow-hidden"
            style={getBackgroundStyle()}
          >
            {/* Barra de ferramentas */}
            <div className="relative z-50">
              <HomeToolbar
                isEditMode={isEditMode}
                isOwner={isOwner || false}
                onToggleEditMode={() => setIsEditMode(!isEditMode)}
                onOpenBackgroundModal={() => setShowBackgroundModal(true)}
                onOpenStickersModal={() => setShowStickersModal(true)}
              />
            </div>

            {/* Área dos widgets */}
            <div className="relative" style={{ minHeight: '800px' }}>
              {/* Avatar Widget (fixo, sempre visível) */}
              <DraggableWidget
                id="avatar"
                x={getWidgetPosition('avatar').x}
                y={getWidgetPosition('avatar').y}
                width={getWidgetPosition('avatar').width}
                height={getWidgetPosition('avatar').height}
                zIndex={getWidgetPosition('avatar').z_index}
                isEditMode={isEditMode}
                isResizable={false}
                onPositionChange={(x, y) => handleWidgetPositionChange('avatar', x, y)}
              >
                <AvatarWidget habboData={habboData} isOwner={isOwner} />
              </DraggableWidget>

              {/* Guestbook Widget */}
              <DraggableWidget
                id="guestbook"
                x={getWidgetPosition('guestbook').x}
                y={getWidgetPosition('guestbook').y}
                width={getWidgetPosition('guestbook').width}
                height={getWidgetPosition('guestbook').height}
                zIndex={getWidgetPosition('guestbook').z_index}
                isEditMode={isEditMode}
                onPositionChange={(x, y) => handleWidgetPositionChange('guestbook', x, y)}
                onSizeChange={(w, h) => handleWidgetSizeChange('guestbook', w, h)}
              >
                <GuestbookWidget
                  entries={guestbook}
                  onAddEntry={addGuestbookEntry}
                  isOwner={isOwner}
                />
              </DraggableWidget>

              {/* Placeholder widgets - TraxPlayer */}
              <DraggableWidget
                id="traxplayer"
                x={getWidgetPosition('traxplayer').x}
                y={getWidgetPosition('traxplayer').y}
                width={getWidgetPosition('traxplayer').width}
                height={getWidgetPosition('traxplayer').height}
                zIndex={getWidgetPosition('traxplayer').z_index}
                isEditMode={isEditMode}
                onPositionChange={(x, y) => handleWidgetPositionChange('traxplayer', x, y)}
                onSizeChange={(w, h) => handleWidgetSizeChange('traxplayer', w, h)}
              >
                <div className="w-full h-full flex flex-col bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 volter-font">🎵 Traxplayer</h3>
                  <div className="flex-1 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Player de música nostálgico</p>
                  </div>
                </div>
              </DraggableWidget>

              {/* Rating Widget */}
              <DraggableWidget
                id="rating"
                x={getWidgetPosition('rating').x}
                y={getWidgetPosition('rating').y}
                width={getWidgetPosition('rating').width}
                height={getWidgetPosition('rating').height}
                zIndex={getWidgetPosition('rating').z_index}
                isEditMode={isEditMode}
                onPositionChange={(x, y) => handleWidgetPositionChange('rating', x, y)}
                onSizeChange={(w, h) => handleWidgetSizeChange('rating', w, h)}
              >
                <div className="w-full h-full text-center bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 volter-font">⭐ Avaliação</h3>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-2xl text-yellow-400">⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">5.0 de 5 estrelas</p>
                </div>
              </DraggableWidget>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabboHome;
