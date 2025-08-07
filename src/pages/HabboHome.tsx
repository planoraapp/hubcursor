
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MapPin, Users, Calendar, Star, AlertTriangle } from 'lucide-react';
import { HomeHeader } from '../components/HabboHome/HomeHeader';
import { AvatarWidget } from '../components/HabboHome/AvatarWidget';
import { GuestbookWidget } from '../components/HabboHome/GuestbookWidget';
import { EnhancedHomeToolbar } from '../components/HabboHome/EnhancedHomeToolbar';
import { DraggableWidget } from '../components/HabboHome/DraggableWidget';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { useEnhancedHabboHome } from '../hooks/useEnhancedHabboHome';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

const HabboHome = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, habboAccount, loading, logout } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('homes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const {
    habboData,
    widgets,
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
    addGuestbookEntry
  } = useEnhancedHabboHome(username || '');

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
      console.error('Erro na Habbo Home:', error);
      toast({
        title: "Erro",
        description: `Erro ao carregar a Habbo Home de ${username}: ${error}`,
        variant: "destructive"
      });
    }
  }, [error, username, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg volter-font text-white">Carregando a Habbo Home de {username}...</div>
          <div className="text-sm text-white/80 mt-2">Buscando dados do usuário e inicializando home...</div>
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
            <h2 className="text-xl volter-font mb-2">Habbo Home não encontrada</h2>
            <p className="text-gray-600 mb-4">
              O usuário "{username}" não foi encontrado ou não possui uma Habbo Home.
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

  // Create the expected format for widgets
  const enhancedHabboData = {
    name: habboData.name,
    figureString: habboData.figureString || '',
    motto: habboData.motto || '',
    online: habboData.online || false,
    memberSince: habboData.memberSince || '',
    selectedBadges: habboData.selectedBadges || []
  };

  const renderDesktop = () => (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="flex flex-col min-h-full">
            <HomeHeader username={habboData.name} />

            <EnhancedHomeToolbar
              isEditMode={isEditMode}
              isOwner={isOwner}
              onEditModeChange={setIsEditMode}
            />

            <div className="flex flex-1 p-4 gap-4">
              <div className="w-1/4 flex flex-col gap-4">
                <AvatarWidget habboData={enhancedHabboData} />
                <GuestbookWidget 
                  habboData={enhancedHabboData}
                  guestbook={guestbook}
                  onAddEntry={addGuestbookEntry}
                  isOwner={isOwner}
                />
              </div>

              <div className="w-3/4 grid gap-4 grid-cols-3 grid-rows-3">
                {widgets.map(widget => (
                  <DraggableWidget
                    key={widget.id}
                    id={widget.id}
                    x={widget.x}
                    y={widget.y}
                    isEditMode={isEditMode}
                    onPositionChange={(x, y) => updateWidgetPosition(widget.id, x, y)}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-md h-full">
                      <CardHeader>
                        <CardTitle className="volter-font">{widget.title || 'Widget'}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{widget.content || 'Widget content'}</p>
                      </CardContent>
                    </Card>
                  </DraggableWidget>
                ))}
                
                {widgets.length === 0 && (
                  <div className="col-span-3 row-span-3 flex items-center justify-center">
                    <Card className="bg-white/80 backdrop-blur-sm shadow-md p-8 text-center">
                      <CardContent>
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg volter-font mb-2">Home Vazia</h3>
                        <p className="text-gray-600 mb-4">Esta home ainda não foi personalizada.</p>
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
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  const renderMobile = () => (
    <MobileLayout>
      <div className="flex flex-col min-h-screen p-4">
        <HomeHeader username={habboData.name} />
        
        <EnhancedHomeToolbar
          isEditMode={isEditMode}
          isOwner={isOwner}
          onEditModeChange={setIsEditMode}
        />

        <div className="flex flex-col gap-4">
          <AvatarWidget habboData={enhancedHabboData} />
          <GuestbookWidget 
            habboData={enhancedHabboData}
            guestbook={guestbook}
            onAddEntry={addGuestbookEntry}
            isOwner={isOwner}
          />
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {widgets.map(widget => (
            <Card key={widget.id} className="bg-white/80 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="volter-font">{widget.title || 'Widget'}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{widget.content || 'Widget content'}</p>
              </CardContent>
            </Card>
          ))}
          
          {widgets.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-md p-6 text-center">
              <CardContent>
                <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Esta home ainda não foi personalizada.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MobileLayout>
  );

  return isMobile ? renderMobile() : renderDesktop();
};

export default HabboHome;
