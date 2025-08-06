
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, MapPin, Users, Calendar, Star } from 'lucide-react';
import { HomeHeader } from '../components/HabboHome/HomeHeader';
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
    habboData,
    widgets,
    loading: isLoading,
    error,
    addWidget,
    removeWidget,
    updateWidgetPosition,
    handleSaveLayout,
    isEditMode,
    setIsEditMode,
    isOwner
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

  if (!habboData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-lg volter-font text-white">Habbo Home não encontrada.</div>
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
      <div className="flex flex-col min-h-screen">
        <HomeHeader username={habboData.name} />

        <EnhancedHomeToolbar
          isEditMode={isEditMode}
          isOwner={isOwner}
          onEditModeChange={setIsEditMode}
        />

        <div className="flex flex-1 p-4 gap-4">
          <div className="w-1/4 flex flex-col gap-4">
            <AvatarWidget habboData={enhancedHabboData} />
            <GuestbookWidget habboData={enhancedHabboData} />
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
                    <CardTitle>{widget.title || 'Widget'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {widget.content || 'Widget content'}
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
        <HomeHeader username={habboData.name} />
        
        <EnhancedHomeToolbar
          isEditMode={isEditMode}
          isOwner={isOwner}
          onEditModeChange={setIsEditMode}
        />

        <div className="flex flex-col gap-4">
          <AvatarWidget habboData={enhancedHabboData} />
          <GuestbookWidget habboData={enhancedHabboData} />
        </div>

        <div className="flex flex-col gap-4">
          {widgets.map(widget => (
            <Card key={widget.id} className="bg-white/80 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle>{widget.title || 'Widget'}</CardTitle>
              </CardHeader>
              <CardContent>
                {widget.content || 'Widget content'}
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
