import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEnhancedHabboHome } from '@/hooks/useEnhancedHabboHome';
import { DraggableWidget } from '@/components/HabboHome/DraggableWidget';
import { GuestbookWidget } from '@/components/HabboHome/GuestbookWidget';
import { EnhancedHomeToolbar } from '@/components/HabboHome/EnhancedHomeToolbar';
import { HomeHeader } from '@/components/HabboHome/HomeHeader';
import { UserCard } from '@/components/HabboHome/UserCard';
import { SimpleLogin } from '@/components/HabboHome/SimpleLogin';
import { DroppedSticker } from '@/components/stickers/DroppedSticker';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { getStickerById } from '@/data/stickerAssets';

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
    addSticker,
    updateStickerPosition,
    removeSticker,
    addGuestbookEntry
  } = useEnhancedHabboHome(username || '');

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

  // Handle drop events para adicionar stickers
  useEffect(() => {
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      
      if (!isEditMode || !isOwner) return;

      try {
        const data = e.dataTransfer?.getData('application/json');
        if (!data) return;

        const stickerData = JSON.parse(data);
        if (stickerData.type !== 'sticker') return;

        // Calcular posição relativa à área da home
        const homeArea = document.querySelector('.home-area') as HTMLElement;
        if (!homeArea) return;

        const rect = homeArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Verificar se já existem 10 stickers do mesmo tipo
        const existingStickers = stickers.filter(s => s.sticker_id.startsWith(stickerData.id));
        if (existingStickers.length >= 10) {
          console.log(`Limite de 10 stickers atingido para ${stickerData.id}`);
          return;
        }

        await addSticker(stickerData, Math.max(0, x), Math.max(0, y));
      } catch (error) {
        console.error('Erro ao processar drop:', error);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    if (isEditMode) {
      document.addEventListener('drop', handleDrop);
      document.addEventListener('dragover', handleDragOver);
    }

    return () => {
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('dragover', handleDragOver);
    };
  }, [isEditMode, isOwner, stickers, addSticker]);

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
            <p className="text-gray-600 mb-4 volter-font">
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
          backgroundImage: `url(/assets/home/backgrounds/patterns/${background_value})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto'
        };
      case 'cover':
        return {
          backgroundImage: `url(/assets/home/backgrounds/images/${background_value})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: '#c7d2dc' }; // Cor padrão correta do Habbo
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
      usercard: { x: 20, y: 20, width: 520, height: 180 },
      guestbook: { x: 50, y: 220, width: 420, height: 380 },
      traxplayer: { x: 50, y: 620, width: 380, height: 220 },
      rating: { x: 500, y: 220, width: 320, height: 160 },
      info: { x: 500, y: 400, width: 320, height: 200 }
    };
    return defaults[widgetId] || { x: 50, y: 50, width: 280, height: 180 };
  };

  const getWidgetSizeRestrictions = (widgetId: string) => {
    const restrictions: Record<string, any> = {
      usercard: { minWidth: 520, maxWidth: 520, minHeight: 180, maxHeight: 180, resizable: false },
      guestbook: { minWidth: 350, maxWidth: 600, minHeight: 300, maxHeight: 500, resizable: true },
      traxplayer: { minWidth: 300, maxWidth: 500, minHeight: 180, maxHeight: 300, resizable: true },
      rating: { minWidth: 200, maxWidth: 400, minHeight: 120, maxHeight: 200, resizable: true },
      info: { minWidth: 250, maxWidth: 450, minHeight: 150, maxHeight: 300, resizable: true }
    };
    return restrictions[widgetId] || { minWidth: 200, maxWidth: 600, minHeight: 150, maxHeight: 400, resizable: true };
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <SimpleLogin />
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2 volter-font">Habbo Home</h2>
          <p className="text-gray-600 mb-4 volter-font">
            A Habbo Home está disponível apenas na versão desktop para uma melhor experiência de personalização.
          </p>
          <p className="text-sm text-gray-500 volter-font">
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
      {/* Sidebar fixo */}
      <div className={`fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <CollapsibleSidebar activeSection="homes" setActiveSection={() => {}} />
      </div>
      
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="p-6">
          {/* Cabeçalho da página */}
          <HomeHeader username={habboData.name} />

          {/* Barra de ferramentas melhorada */}
          <EnhancedHomeToolbar
            isEditMode={isEditMode}
            isOwner={isOwner || false}
            onEditModeChange={setIsEditMode}
          />

          {/* Área principal da home com suporte a stickers */}
          <div className="habbo-panel p-4" style={{ minHeight: '1800px' }}>
            <div 
              className="home-area relative w-full border-2 border-black rounded-lg"
              style={{...getBackgroundStyle(), minHeight: '1750px'}}
            >
              {/* UserCard Widget - não redimensionável */}
              <DraggableWidget
                id="usercard"
                x={getWidgetPosition('usercard').x}
                y={getWidgetPosition('usercard').y}
                width={getWidgetPosition('usercard').width}
                height={getWidgetPosition('usercard').height}
                zIndex={getWidgetPosition('usercard').z_index}
                isEditMode={isEditMode}
                sizeRestrictions={getWidgetSizeRestrictions('usercard')}
                onPositionChange={() => {}} // UserCard não se move
              >
                <UserCard habboData={habboData} isOwner={isOwner} />
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
                sizeRestrictions={getWidgetSizeRestrictions('guestbook')}
                onPositionChange={(x, y) => {}}
                onSizeChange={(w, h) => {}}
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
                sizeRestrictions={getWidgetSizeRestrictions('traxplayer')}
                onPositionChange={(x, y) => {}}
                onSizeChange={(w, h) => {}}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                  <h3 className="font-bold text-purple-800 mb-3 volter-font flex items-center gap-2">
                    🎵 Traxplayer
                    <span className="text-xs bg-purple-200 px-2 py-1 rounded">Premium</span>
                  </h3>
                  <div className="flex-1 bg-gradient-to-br from-purple-100 to-blue-100 rounded border-2 border-dashed border-purple-300 flex items-center justify-center p-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-white text-xl">♪</span>
                      </div>
                      <p className="text-purple-700 volter-font text-sm">Player de música</p>
                      <p className="text-purple-600 volter-font text-xs">nostálgico do Habbo</p>
                    </div>
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
                sizeRestrictions={getWidgetSizeRestrictions('rating')}
                onPositionChange={(x, y) => {}}
                onSizeChange={(w, h) => {}}
              >
                <div className="w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200">
                  <h3 className="font-bold text-yellow-800 mb-3 volter-font">⭐ Avaliação da Home</h3>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-2xl text-yellow-400 cursor-pointer hover:text-yellow-500 transition-colors">⭐</span>
                    ))}
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-800 volter-font">5.0 de 5</p>
                    <p className="text-sm text-yellow-600 volter-font">127 avaliações</p>
                  </div>
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
                sizeRestrictions={getWidgetSizeRestrictions('info')}
                onPositionChange={(x, y) => {}}
                onSizeChange={(w, h) => {}}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3 volter-font flex items-center gap-2">
                    ℹ️ Sobre esta Home
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <p className="text-sm text-blue-700 volter-font">Última atualização: Hoje</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <p className="text-sm text-blue-700 volter-font">Visitas hoje: 23</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <p className="text-sm text-blue-700 volter-font">Total de visitas: 1.245</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <p className="text-sm text-blue-700 volter-font">Criada em: Jan 2024</p>
                    </div>
                  </div>
                </div>
              </DraggableWidget>

              {/* Stickers renderizados */}
              {stickers.map(sticker => {
                const stickerAsset = getStickerById(sticker.sticker_id.split('_')[0]);
                return (
                  <DroppedSticker
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
                    onPositionChange={updateStickerPosition}
                    onRemove={removeSticker}
                  />
                );
              })}
              
              {/* Indicador de drop zone no modo de edição */}
              {isEditMode && (
                <div className="absolute inset-4 border-2 border-dashed border-blue-300 rounded-lg pointer-events-none opacity-30">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 volter-font text-sm">
                    Arraste stickers aqui
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HabboHome;
