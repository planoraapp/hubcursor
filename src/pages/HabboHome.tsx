import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MapPin, Users, Calendar, Star } from 'lucide-react';
import { HomeHeader } from '../components/HabboHome/HomeHeader';
// Removida a importação do SimpleLogin que foi deletado
import { AvatarWidget } from '../components/HabboHome/AvatarWidget';
import { GuestbookWidget } from '../components/HabboHome/GuestbookWidget';
import { EnhancedHomeToolbar } from '../components/HabboHome/EnhancedHomeToolbar';
import { DraggableWidget } from '../components/HabboHome/DraggableWidget';
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

  const {
    homeData,
    widgets,
    setWidgets,
    isLoading,
    error,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    handleSaveLayout
  } = useEnhancedHabboHome(username || '');

  useEffect(() => {
    if (error) {
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
        <div className="text-lg volter-font text-white">Carregando a Habbo Home...</div>
      </div>
    );
  }

  if (!homeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-lg volter-font text-white">Habbo Home não encontrada.</div>
      </div>
    );
  }

  const renderDesktop = () => (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex flex-col min-h-screen">
        <HomeHeader habboHomeData={homeData} />

        <EnhancedHomeToolbar
          widgets={widgets}
          setWidgets={setWidgets}
          addWidget={addWidget}
          handleSaveLayout={handleSaveLayout}
        />

        <div className="flex flex-1 p-4 gap-4">
          <div className="w-1/4 flex flex-col gap-4">
            <AvatarWidget habboHomeData={homeData} />
            <GuestbookWidget habboHomeData={homeData} />
          </div>

          <div className="w-3/4 grid gap-4 grid-cols-3 grid-rows-3">
            {widgets.map(widget => (
              <DraggableWidget
                key={widget.id}
                widget={widget}
                updateWidgetPosition={updateWidgetPosition}
                removeWidget={removeWidget}
              >
                <Card className="bg-white/80 backdrop-blur-sm shadow-md h-full">
                  <CardHeader>
                    <CardTitle>{widget.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {widget.content}
                  </CardContent>
                </Card>
              </DraggableWidget>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMobile = () => (
    <MobileLayout>
      <div className="flex flex-col min-h-screen p-4">
        <HomeHeader habboHomeData={homeData} />
        
        <EnhancedHomeToolbar
          widgets={widgets}
          setWidgets={setWidgets}
          addWidget={addWidget}
          handleSaveLayout={handleSaveLayout}
        />

        <div className="flex flex-col gap-4">
          <AvatarWidget habboHomeData={homeData} />
          <GuestbookWidget habboHomeData={homeData} />
        </div>

        <div className="flex flex-col gap-4">
          {widgets.map(widget => (
            <Card key={widget.id} className="bg-white/80 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle>{widget.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {widget.content}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MobileLayout>
  );

  return isMobile ? renderMobile() : renderDesktop();
};

export default HabboHome;
