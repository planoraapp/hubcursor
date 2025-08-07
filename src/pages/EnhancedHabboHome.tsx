
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { AvatarWidget } from '../components/HabboHome/AvatarWidget';
import { GuestbookWidget } from '../components/HabboHome/GuestbookWidget';
import { OptimizedDraggableWidget } from '../components/HabboHome/OptimizedDraggableWidget';
import { OptimizedDroppedSticker } from '../components/HabboHome/OptimizedDroppedSticker';
import { EnhancedHomeHeader } from '../components/HabboHome/EnhancedHomeHeader';
import { BackgroundSelector } from '../components/HabboHome/BackgroundSelector';
import { EnhancedStickerInventory } from '../components/HabboHome/EnhancedStickerInventory';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useEnhancedHabboHome } from '../hooks/useEnhancedHabboHome';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const EnhancedHabboHome = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, habboAccount, loading } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('homes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal states
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showWidgets, setShowWidgets] = useState(false);

  // Undo/Redo system
  const [actionHistory, setActionHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const normalizedUsername = username?.trim() || '';

  const {
    habboData,
    widgets,
    stickers,
    background,
    guestbook,
    loading: isLoading,
    error,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    handleSaveLayout,
    isEditMode,
    setIsEditMode,
    isOwner,
    addGuestbookEntry,
    setStickers
  } = useEnhancedHabboHome(normalizedUsername);

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Error in Enhanced Habbo Home:', error);
      toast({
        title: "Erro",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Background management
  const handleBackgroundChange = useCallback(async (newBackground: { type: 'color' | 'repeat' | 'cover'; value: string }) => {
    if (!isOwner || !habboData) return;

    try {
      const { error } = await supabase
        .from('user_home_backgrounds')
        .upsert({
          user_id: habboData.id,
          background_type: newBackground.type,
          background_value: newBackground.value
        });

      if (error) {
        console.error('Error updating background:', error);
        toast({
          title: "Erro",
          description: "Erro ao alterar background",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Background Alterado",
          description: "O fundo da sua home foi alterado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error in handleBackgroundChange:', error);
    }
  }, [isOwner, habboData, toast]);

  // Sticker management
  const handleStickerDrop = useCallback(async (stickerData: any) => {
    if (!isOwner || !habboData) return;

    try {
      const { data, error } = await supabase
        .from('user_stickers')
        .insert({
          user_id: habboData.id,
          sticker_id: stickerData.sticker_id,
          sticker_src: stickerData.sticker_src,
          category: stickerData.category,
          x: stickerData.x,
          y: stickerData.y,
          z_index: stickerData.z_index,
          rotation: stickerData.rotation || 0,
          scale: stickerData.scale || 1
        })
        .select()
        .single();

      if (!error && data) {
        setStickers(prev => [...prev, data]);
        
        toast({
          title: "Sticker Adicionado",
          description: "Sticker adicionado à sua home!",
        });
      } else {
        console.error('Error adding sticker:', error);
      }
    } catch (error) {
      console.error('Error in handleStickerDrop:', error);
    }
  }, [isOwner, habboData, setStickers, toast]);

  const handleStickerPositionChange = useCallback(async (stickerId: string, x: number, y: number) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .update({ x, y })
        .eq('id', stickerId);

      if (!error) {
        setStickers(prev => 
          prev.map(sticker => 
            sticker.id === stickerId 
              ? { ...sticker, x, y }
              : sticker
          )
        );
      }
    } catch (error) {
      console.error('Error updating sticker position:', error);
    }
  }, [isOwner, setStickers]);

  const handleStickerZIndexChange = useCallback(async (stickerId: string, zIndex: number) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .update({ z_index: zIndex })
        .eq('id', stickerId);

      if (!error) {
        setStickers(prev => 
          prev.map(sticker => 
            sticker.id === stickerId 
              ? { ...sticker, z_index: zIndex }
              : sticker
          )
        );
      }
    } catch (error) {
      console.error('Error updating sticker z-index:', error);
    }
  }, [isOwner, setStickers]);

  const handleStickerRemove = useCallback(async (stickerId: string) => {
    if (!isOwner) return;

    try {
      const { error } = await supabase
        .from('user_stickers')
        .delete()
        .eq('id', stickerId);

      if (!error) {
        setStickers(prev => prev.filter(sticker => sticker.id !== stickerId));
        
        toast({
          title: "Sticker Removido",
          description: "Sticker removido da sua home!",
        });
      }
    } catch (error) {
      console.error('Error removing sticker:', error);
    }
  }, [isOwner, setStickers, toast]);

  // Calculate background style
  const backgroundStyle = {
    backgroundColor: background.background_type === 'color' ? background.background_value : '#c7d2dc',
    backgroundImage: background.background_type !== 'color' ? `url(${background.background_value})` : undefined,
    backgroundSize: background.background_type === 'repeat' ? 'auto' : 'cover',
    backgroundRepeat: background.background_type === 'repeat' ? 'repeat' : 'no-repeat',
    backgroundPosition: 'center'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg volter-font text-white" style={{
            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
          }}>
            Carregando Enhanced Habbo Home de {normalizedUsername}...
          </div>
        </div>
      </div>
    );
  }

  if (!habboData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg p-6 text-center max-w-md">
          <CardContent className="pt-6">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl volter-font mb-2">Enhanced Habbo Home não encontrada</h2>
            <p className="text-gray-600 mb-4">
              O usuário "{normalizedUsername}" não foi encontrado ou não possui uma Habbo Home.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full volter-font">
                Voltar ao Início
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()} 
                className="w-full volter-font"
              >
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enhancedHabboData = {
    name: habboData.name,
    figureString: habboData.figureString || '',
    motto: habboData.motto || '',
    online: habboData.online || false,
    memberSince: habboData.memberSince || '',
    selectedBadges: habboData.selectedBadges || [],
    hotel: habboData.hotel
  };

  const renderDesktop = () => (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="max-w-[1400px] mx-auto">
            {/* Enhanced Header */}
            <EnhancedHomeHeader
              username={habboData.name}
              isOwner={isOwner}
              hotel={habboData.hotel}
              onEditModeToggle={() => setIsEditMode(!isEditMode)}
              onOpenStickers={() => setShowStickers(true)}
              onOpenBackgrounds={() => setShowBackgrounds(true)}
              onOpenWidgets={() => setShowWidgets(true)}
              isEditMode={isEditMode}
            />

            {/* Home Container with Dynamic Background */}
            <div className="relative">
              <div 
                className="min-h-[800px] border-4 border-black rounded-lg relative overflow-hidden"
                style={backgroundStyle}
              >
                {/* Fixed Sidebar Widgets */}
                <div className="absolute left-4 top-4 w-80 flex flex-col gap-4 z-10">
                  <div style={{ transform: 'scale(1.2)' }}>
                    <AvatarWidget habboData={enhancedHabboData} />
                  </div>
                  <GuestbookWidget 
                    habboData={enhancedHabboData}
                    guestbook={guestbook}
                    onAddEntry={addGuestbookEntry}
                    isOwner={isOwner}
                  />
                </div>

                {/* Dynamic Widgets Area */}
                <div className="absolute left-96 top-4 right-4 bottom-4">
                  {widgets.map(widget => (
                    <OptimizedDraggableWidget
                      key={widget.id}
                      id={widget.id}
                      x={widget.x}
                      y={widget.y}
                      width={widget.width}
                      height={widget.height}
                      zIndex={widget.z_index}
                      isEditMode={isEditMode}
                      onPositionChange={(x, y) => updateWidgetPosition(widget.id, x, y)}
                      onRemove={() => removeWidget(widget.id)}
                      sizeRestrictions={{
                        minWidth: 200,
                        maxWidth: 600,
                        minHeight: 150,
                        maxHeight: 400,
                        resizable: true
                      }}
                    >
                      <Card className="bg-white/90 backdrop-blur-sm shadow-md h-full">
                        <CardHeader>
                          <CardTitle className="volter-font">{widget.title || 'Widget'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{widget.content || 'Widget content'}</p>
                        </CardContent>
                      </Card>
                    </OptimizedDraggableWidget>
                  ))}
                  
                  {/* Stickers */}
                  {stickers.map(sticker => (
                    <OptimizedDroppedSticker
                      key={sticker.id}
                      id={sticker.id}
                      stickerId={sticker.sticker_id}
                      src={sticker.sticker_src}
                      category={sticker.category}
                      x={sticker.x}
                      y={sticker.y}
                      zIndex={sticker.z_index}
                      scale={sticker.scale || 1}
                      rotation={sticker.rotation || 0}
                      isEditMode={isEditMode}
                      onPositionChange={handleStickerPositionChange}
                      onZIndexChange={handleStickerZIndexChange}
                      onRemove={handleStickerRemove}
                    />
                  ))}

                  {/* Empty state */}
                  {widgets.length === 0 && stickers.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Card className="bg-white/90 backdrop-blur-sm shadow-lg p-8 text-center max-w-md">
                        <CardContent>
                          <div className="w-16 h-16 bg-gray-400 rounded-lg mx-auto mb-4 flex items-center justify-center text-4xl">
                            🏠
                          </div>
                          <h3 className="text-xl volter-font mb-2">Área Livre para Personalização</h3>
                          <p className="text-gray-600 mb-4">
                            Esta área está pronta para seus widgets e stickers!
                          </p>
                          {isOwner && (
                            <Button onClick={() => setIsEditMode(true)} className="volter-font">
                              Começar a Personalizar
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Edit mode overlay */}
                {isEditMode && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-4 border-2 border-dashed border-yellow-400 rounded-lg bg-yellow-400/5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <BackgroundSelector
        isOpen={showBackgrounds}
        onClose={() => setShowBackgrounds(false)}
        onSelectBackground={handleBackgroundChange}
        currentBackground={background}
      />

      <EnhancedStickerInventory
        isOpen={showStickers}
        onClose={() => setShowStickers(false)}
        onStickerDrop={handleStickerDrop}
      />
    </div>
  );

  const renderMobile = () => (
    <MobileLayout>
      <div className="p-4">
        <EnhancedHomeHeader
          username={habboData.name}
          isOwner={isOwner}
          hotel={habboData.hotel}
          onEditModeToggle={() => setIsEditMode(!isEditMode)}
          onOpenStickers={() => setShowStickers(true)}
          onOpenBackgrounds={() => setShowBackgrounds(true)}
          onOpenWidgets={() => setShowWidgets(true)}
          isEditMode={isEditMode}
        />
        
        <div 
          className="min-h-[600px] border-4 border-black rounded-lg p-4 relative"
          style={backgroundStyle}
        >
          <AvatarWidget habboData={enhancedHabboData} />
          <div className="mt-4">
            <GuestbookWidget 
              habboData={enhancedHabboData}
              guestbook={guestbook}
              onAddEntry={addGuestbookEntry}
              isOwner={isOwner}
            />
          </div>
        </div>

        {/* Mobile Modals */}
        <BackgroundSelector
          isOpen={showBackgrounds}
          onClose={() => setShowBackgrounds(false)}
          onSelectBackground={handleBackgroundChange}
          currentBackground={background}
        />

        <EnhancedStickerInventory
          isOpen={showStickers}
          onClose={() => setShowStickers(false)}
          onStickerDrop={handleStickerDrop}
        />
      </div>
    </MobileLayout>
  );

  return isMobile ? renderMobile() : renderDesktop();
};

export default EnhancedHabboHome;
