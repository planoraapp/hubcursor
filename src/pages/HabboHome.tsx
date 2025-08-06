
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useHabboHome } from '@/hooks/useHabboHome';
import { DraggableWidget } from '@/components/HabboHome/DraggableWidget';
import { GuestbookWidget } from '@/components/HabboHome/GuestbookWidget';
import { HomeToolbar } from '@/components/HabboHome/HomeToolbar';
import { HomeHeader } from '@/components/HabboHome/HomeHeader';
import { UserCard } from '@/components/HabboHome/UserCard';
import { SimpleLogin } from '@/components/HabboHome/SimpleLogin';
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
  const [showInventoryModal, setShowInventoryModal] = useState(false);
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
        <SimpleLogin />
        <CollapsibleSidebar activeSection="homes" setActiveSection={() => {}} />
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} flex items-center justify-center`}>
          <Card className="p-8 text-center max-w-md bg-white/95 backdrop-blur-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-800 volter-font">
              Carregando Habbo Home...
            </p>
            <p className="text-sm text-gray-600 volter-font">
              de {username}
            </p>
          </Card>
        </main>
      </div>
    );
  }

  if (!habboData) {
    return (
      <div className="min-h-screen bg-repeat bg-cover flex" 
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <SimpleLogin />
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
        return { backgroundColor: '#f5f5f5' }; // Cinza claro padrão
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
      guestbook: { x: 50, y: 50, width: 400, height: 350 },
      traxplayer: { x: 50, y: 420, width: 350, height: 200 },
      rating: { x: 480, y: 50, width: 300, height: 150 },
      info: { x: 480, y: 220, width: 300, height: 180 }
    };
    return defaults[widgetId] || { x: 50, y: 50, width: 250, height: 150 };
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
        <SimpleLogin />
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2 volter-font">Habbo Home</h2>
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
      <SimpleLogin />
      <CollapsibleSidebar activeSection="homes" setActiveSection={() => {}} />
      
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          {/* Cabeçalho da página */}
          <HomeHeader username={habboData.name} />

          {/* Card do usuário horizontal */}
          <div className="mb-6">
            <UserCard habboData={habboData} isOwner={isOwner} />
          </div>

          {/* Barra de ferramentas */}
          <HomeToolbar
            isEditMode={isEditMode}
            isOwner={isOwner || false}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            onOpenBackgroundModal={() => setShowBackgroundModal(true)}
            onOpenInventoryModal={() => setShowInventoryModal(true)}
          />

          {/* Área principal da home com fundo cinza claro */}
          <Card className="relative min-h-[600px] p-4 bg-gray-50/95 backdrop-blur-sm">
            <div 
              className="relative min-h-full rounded-lg"
              style={{...getBackgroundStyle(), minHeight: '550px'}}
            >
              {/* Widgets da home */}
              
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

              {/* TraxPlayer Widget */}
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
                  <div className="flex-1 bg-gradient-to-br from-purple-100 to-blue-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <p className="text-gray-600 text-center volter-font">Player de música<br />nostálgico do Habbo</p>
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
                  <h3 className="font-bold text-gray-800 mb-4 volter-font">⭐ Avaliação da Home</h3>
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-2xl text-yellow-400 cursor-pointer hover:text-yellow-500">⭐</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 volter-font">5.0 de 5 estrelas</p>
                  <p className="text-xs text-gray-500 mt-2">127 avaliações</p>
                </div>
              </DraggableWidget>

              {/* Info Widget */}
              <DraggableWidget
                id="info"
                x={getWidgetPosition('info').x}
                y={getWidgetPosition('info').y}
                width={getWidgetPosition('info').width}
                height={getWidgetPosition('info').height}
                zIndex={getWidgetPosition('info').z_index}
                isEditMode={isEditMode}
                onPositionChange={(x, y) => handleWidgetPositionChange('info', x, y)}
                onSizeChange={(w, h) => handleWidgetSizeChange('info', w, h)}
              >
                <div className="w-full h-full bg-white/90 backdrop-blur-sm rounded-lg p-4 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3 volter-font">ℹ️ Sobre esta Home</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="volter-font">Última atualização: Hoje</p>
                    <p className="volter-font">Visitas hoje: 23</p>
                    <p className="volter-font">Total de visitas: 1.245</p>
                    <p className="volter-font">Criada em: Jan 2024</p>
                  </div>
                </div>
              </DraggableWidget>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default HabboHome;
