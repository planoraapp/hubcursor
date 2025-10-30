import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { useHabboHome } from '@/hooks/useHabboHome';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { HomeCanvas } from '@/components/HabboHome/HomeCanvas';
import { HubHomeAssets } from '@/components/HabboHome/HubHomeAssets';
import { MobileLayout } from '@/components/ui/mobile-layout';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { HotelTag } from '@/components/HotelTag';
import { extractOriginalUsername, extractHotelFromUsername, getHotelConfig } from '@/utils/usernameUtils';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import { CanonicalUrlRedirect } from '@/components/CanonicalUrlRedirect';

const HabboHome: React.FC = () => {
  const { username: urlUsername } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { habboAccount } = useAuth();

  // Extrair nome original e hotel do username da URL
  const originalUsername = urlUsername ? extractOriginalUsername(urlUsername) : 'habbohub';
  const hotelFromUsername = urlUsername ? extractHotelFromUsername(urlUsername) : 'br';
  
  const hotel = searchParams.get('hotel') || hotelFromUsername || 'br';
  const hotelConfig = getHotelConfig(hotel);

  // Redirecionar se não houver username válido na URL
  React.useEffect(() => {
    if (!urlUsername) {
      navigate('/home/ptbr-habbohub', { replace: true });
    }
  }, [urlUsername, navigate]);

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
    isSaving,
    lastSaved,
    currentUser,
    setIsEditMode,
    updateWidgetPosition,
    updateStickerPosition,
    addSticker,
    removeSticker,
    bringToFront,
    sendToBack,
    updateBackground,
    addWidget,
    removeWidget,
    onGuestbookSubmit,
    onGuestbookDelete,
    clearAllGuestbookEntries,
    reloadData,
    saveChanges
  } = useHabboHome(originalUsername, hotel);

    const handleStickerAdd = async (stickerId: string, stickerSrc: string, category: string) => {
        // O hook useHabboHome já define a posição no canto superior esquerdo (20, 20)
    // Então não precisamos passar x e y aqui
    await addSticker(stickerId, 0, 0, stickerSrc, category);
  };

  const handleBackgroundChange = async (type: 'color' | 'cover' | 'repeat', value: string) => {
        await updateBackground(type, value);
  };

  const handleSave = async () => {
        try {
      // Forçar salvamento imediato das mudanças pendentes
      await saveChanges();
      
      // Fechar o modo de edição após salvar
      setIsEditMode(false);
      
          } catch (error) {
          }
  };

  // Funções para controlar os modais de edição
  const handleOpenAssetsModal = (type: 'stickers' | 'widgets' | 'backgrounds') => {
    setCurrentAssetType(type);
    setShowAssetsModal(true);
  };

  const handleAssetSelect = (asset: any) => {
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

  // Função para limpar guestbook (temporária para teste)
  const handleClearGuestbook = async () => {
    if (window.confirm('Tem certeza que deseja limpar todos os comentários do guestbook?')) {
      await clearAllGuestbookEntries();
    }
  };

  // Mobile dock items
  const mobileMenuItems = [
    { id: 'home', label: 'Início', icon: '/assets/home.png', order: 1 },
    { id: 'homes', label: 'Home', icon: 'https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/home.gif', order: 2 },
    { id: 'console', label: 'Console', icon: '/assets/consoleon3.gif', order: 3 },
    { id: 'journal', label: 'Jornal', icon: '/assets/journal/news.png', order: 4 },
    { id: 'tools', label: 'Ferramentas', icon: '/assets/Tools/ferramentas.png', order: 5 }
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
            }
  };

  if (loading) {
    const loadingContent = (
      <div className="flex-1 flex items-center justify-center" style={{ 
        backgroundImage: 'url(/assets/site/bghabbohub.png)',
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
        currentPath={`/home/${urlUsername || 'habbohub'}`}
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
        backgroundImage: 'url(/assets/site/bghabbohub.png)',
        backgroundRepeat: 'repeat'
      }}>
        <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-xl border-2 border-black">
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardTitle className="text-center volter-font">Usuário não encontrado</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-gray-700 mb-4 volter-font">
              O usuário "{urlUsername || 'habbohub'}" não foi encontrado ou não possui uma Habbo Home.
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
        currentPath={`/home/${urlUsername || 'habbohub'}`}
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
      backgroundImage: 'url(/assets/site/bghabbohub.png)',
      backgroundRepeat: 'repeat'
    }}>

      <div className={`p-4 ${isMobile ? 'pb-24' : ''}`}>
        {/* Banner com mesmo tamanho do canvas */}
        <div 
          className="mb-6 mx-auto bg-white border-2 border-black shadow-lg rounded-lg overflow-hidden"
          style={{
            width: isMobile ? '768px' : '1080px',
            height: '80px'
          }}
        >
          <div 
            className="w-full h-full flex items-center justify-start pl-6 border-b-2 border-black relative"
            style={{
              backgroundImage: habboData?.hotel === 'br' || habboData?.habbo_name === 'habbohub' 
                ? 'url(https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/habbo-hub-images/country-related/web_view_bg_br.gif)'
                : 'linear-gradient(to right, #2563eb, #9333ea)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Overlay para melhor legibilidade do texto */}
            <div className="absolute inset-0 bg-black/15"></div>
            <div className="relative z-10 flex items-center gap-4 text-white">
              {/* Avatar do usuário (tamanho real, sobrepondo a borda) - sempre busca pela API */}
              <div className="flex-shrink-0 relative" style={{ marginLeft: '-6px', marginTop: '20px' }}>
                <img
                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboData?.habbo_name || originalUsername}&size=m&direction=2&head_direction=2&gesture=sml`}
                  alt={`Avatar de ${habboData?.habbo_name || originalUsername}`}
                  className="object-contain"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboData?.habbo_name || originalUsername}&size=m&direction=2&head_direction=2&gesture=sml`;
                  }}
                />
              </div>
              
              {/* Texto do título */}
              <div className="flex items-center gap-3">
                <span 
                  className={`sidebar-font-option-4 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                  style={{
                    fontSize: isMobile ? '20px' : '28px',
                    fontWeight: 'bold',
                    letterSpacing: '0.3px',
                    textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px'
                  }}
                >
                  {originalUsername}'s Habbo Home
                </span>
                <HotelTag hotelId={hotel} size="md" />
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de Status de Salvamento */}
        {isOwner && isEditMode && (
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-white/80 bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : lastSaved ? (
                <>
                  <img 
                    src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/progress_bubbles.gif"
                    alt="Progress"
                  />
                  <span className="text-white font-bold" style={{ 
                    fontFamily: 'Volter, sans-serif',
                    textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000'
                  }}>Editando Home</span>
                </>
              ) : (
                <>
                  <img 
                    src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/progress_bubbles.gif"
                    alt="Progress"
                  />
                  <span>Alterações pendentes</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="relative">
          <HomeCanvas
            widgets={widgets}
            stickers={stickers}
            background={background}
            habboData={habboData}
            guestbook={guestbook}
            isEditMode={isEditMode}
            isOwner={isOwner}
            currentUser={habboAccount ? { id: habboAccount.id, habbo_name: habboAccount.habbo_name } : null}
            onWidgetPositionChange={updateWidgetPosition}
            onStickerPositionChange={updateStickerPosition}
            onStickerRemove={removeSticker}
            onStickerBringToFront={bringToFront}
            onStickerSendToBack={sendToBack}
            onWidgetRemove={removeWidget}
            onOpenAssetsModal={handleOpenAssetsModal}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            onSave={handleSave}
            onBackgroundChange={handleBackgroundChange}
            onStickerAdd={handleStickerAdd}
            onWidgetAdd={addWidget}
            onGuestbookSubmit={onGuestbookSubmit}
            onGuestbookDelete={onGuestbookDelete}
          />
          
          {/* Loading Overlay para operações do Canvas */}
          {(isSaving || loading) && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
              <div className="flex flex-col items-center gap-4">
                <img 
                  src="https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/progress_habbos.gif"
                  alt="Loading"
                  className="w-16 h-16"
                />
                <span className="text-white text-sm font-medium">
                  {isSaving ? 'Salvando alterações...' : 'Carregando...'}
                </span>
              </div>
            </div>
          )}
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

  return (
    <EnhancedErrorBoundary
      resetOnPropsChange={true}
      onError={(error, errorInfo) => {
              }}
    >
      <CanonicalUrlRedirect>
        {isMobile ? (
        <MobileLayout
          menuItems={mobileMenuItems}
          onItemClick={handleMobileItemClick}
          currentPath={`/homes/${urlUsername || 'habbohub'}`}
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
      )}
      </CanonicalUrlRedirect>
    </EnhancedErrorBoundary>
  );
};

export default HabboHome;

