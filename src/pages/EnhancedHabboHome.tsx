
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useEnhancedHabboHome } from '@/hooks/useEnhancedHabboHome';
import { HomeCustomizer } from '@/components/HabboHome/HomeCustomizer';
import { EnhancedStickerInventory } from '@/components/HabboHome/EnhancedStickerInventory';
import { OptimizedDraggableWidget } from '@/components/HabboHome/OptimizedDraggableWidget';
import { OptimizedDroppedSticker } from '@/components/HabboHome/OptimizedDroppedSticker';
import { UserCardWidget } from '@/components/widgets/UserCardWidget';
import { GuestbookWidget } from '@/components/widgets/GuestbookWidget';
import { RatingWidget } from '@/components/widgets/RatingWidget';
import { InfoWidget } from '@/components/widgets/InfoWidget';
import { TraxPlayerWidget } from '@/components/widgets/TraxPlayerWidget';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const EnhancedHabboHome = () => {
  const { username } = useParams<{ username: string }>();
  const [stickerInventoryOpen, setStickerInventoryOpen] = useState(false);

  const {
    widgets,
    stickers,
    background,
    guestbook,
    habboData,
    loading,
    error,
    isEditMode,
    isOwner,
    setIsEditMode,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    updateWidgetSize,
    getWidgetSizeRestrictions,
    handleSaveLayout,
    addGuestbookEntry,
    handleStickerDrop,
    handleStickerPositionChange,
    handleBackgroundChange
  } = useEnhancedHabboHome(username || '');

  const getBackgroundStyle = () => {
    if (background.background_type === 'color') {
      return { backgroundColor: background.background_value };
    } else if (background.background_type === 'repeat') {
      return {
        backgroundImage: `url(${background.background_value})`,
        backgroundRepeat: 'repeat',
        imageRendering: 'pixelated' as const
      };
    } else if (background.background_type === 'cover') {
      return {
        backgroundImage: `url(${background.background_value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'pixelated' as const
      };
    }
    return { backgroundColor: '#c7d2dc' };
  };

  const renderWidget = (widget: any) => {
    let content;
    
    switch (widget.widget_id) {
      case 'usercard':
        content = <UserCardWidget habboData={habboData} />;
        break;
      case 'guestbook':
        content = (
          <GuestbookWidget
            entries={guestbook}
            onAddEntry={addGuestbookEntry}
            isOwner={isOwner}
          />
        );
        break;
      case 'rating':
        content = <RatingWidget />;
        break;
      case 'info':
        content = <InfoWidget habboData={habboData} />;
        break;
      case 'traxplayer':
        content = <TraxPlayerWidget />;
        break;
      default:
        content = (
          <div className="p-4 text-center text-gray-500 volter-font">
            Widget: {widget.widget_id}
          </div>
        );
    }

    return (
      <OptimizedDraggableWidget
        key={widget.id}
        id={widget.widget_id}
        x={widget.x}
        y={widget.y}
        width={widget.width}
        height={widget.height}
        zIndex={widget.z_index}
        isEditMode={isEditMode}
        onPositionChange={(x, y) => updateWidgetPosition(widget.id, x, y)}
        onSizeChange={(width, height) => updateWidgetSize(widget.id, width, height)}
        onZIndexChange={(zIndex) => {/* implement z-index change */}}
        onRemove={() => removeWidget(widget.id)}
        sizeRestrictions={getWidgetSizeRestrictions(widget.widget_id)}
      >
        {content}
      </OptimizedDraggableWidget>
    );
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <NewAppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 volter-font">Carregando home...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <NewAppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <h2 className="text-xl font-bold text-red-600 mb-4 volter-font">Erro</h2>
              <p className="text-gray-600 mb-4 volter-font">{error}</p>
              <Link to="/homes">
                <Button variant="outline" className="volter-font">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar às Homes
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main className="flex-1 relative">
          {/* Header */}
          <div className="bg-white border-b shadow-sm p-4 relative z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/homes">
                  <Button variant="outline" size="sm" className="volter-font">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 volter-font">
                    Home de {habboData?.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="volter-font">
                      <User className="w-3 h-3 mr-1" />
                      {habboData?.hotel?.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="volter-font">
                      <Globe className="w-3 h-3 mr-1" />
                      {habboData?.online ? 'Online' : 'Offline'}
                    </Badge>
                    {isOwner && (
                      <Badge className="bg-green-100 text-green-800 volter-font">
                        Sua Home
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Home Canvas */}
          <div
            className="relative min-h-[calc(100vh-80px)] overflow-hidden"
            style={getBackgroundStyle()}
          >
            {/* Widgets */}
            {widgets.map(renderWidget)}

            {/* Stickers */}
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
                onZIndexChange={(id, zIndex) => {/* implement sticker z-index change */}}
                onRemove={(id) => {/* implement sticker removal */}}
              />
            ))}

            {/* Empty state for edit mode */}
            {isEditMode && widgets.length === 0 && stickers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-blue-100/90 backdrop-blur-sm rounded-lg p-8 text-center">
                  <h3 className="text-lg font-bold text-blue-800 mb-2 volter-font">
                    🏠 Sua Home está vazia!
                  </h3>
                  <p className="text-blue-700 volter-font">
                    Use o painel de customização para adicionar widgets e stickers
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Customizer */}
          <HomeCustomizer
            isEditMode={isEditMode}
            isOwner={isOwner}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            onSaveLayout={handleSaveLayout}
            onBackgroundChange={handleBackgroundChange}
            onStickerInventoryOpen={() => setStickerInventoryOpen(true)}
            onWidgetAdd={addWidget}
          />

          {/* Sticker Inventory */}
          <EnhancedStickerInventory
            isOpen={stickerInventoryOpen}
            onClose={() => setStickerInventoryOpen(false)}
            onStickerDrop={handleStickerDrop}
          />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EnhancedHabboHome;
