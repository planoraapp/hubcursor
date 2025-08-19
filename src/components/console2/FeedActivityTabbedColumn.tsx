import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Heart, MessageCircle, Camera, Activity, Clock, Users } from 'lucide-react';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useAuth } from '@/hooks/useAuth';
import { ConsoleProfileModal } from '@/components/console/ConsoleProfileModal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FeedActivityTabbedColumn: React.FC = () => {
  const { habboAccount } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  
  // Hooks para fotos dos amigos
  const { 
    data: friendsPhotos = [], 
    isLoading: photosLoading, 
    refetch: refetchPhotos 
  } = useFriendsPhotos(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  // Hooks para atividades dos amigos
  const { 
    friendsActivities, 
    isLoading: activitiesLoading, 
    tickerMetadata 
  } = useFriendsFeed();

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    if (activeTab === 'photos') {
      refetchPhotos();
    }
    // Para atividades, o hook já tem refetch automático via interval
  };

  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return 'há alguns momentos';
    }
  };

  return (
    <>
      <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5" />
              Feed dos Amigos
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={photosLoading || activitiesLoading}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {(photosLoading || activitiesLoading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-4">
              <TabsTrigger 
                value="photos" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Camera className="w-4 h-4 mr-2" />
                Fotos
              </TabsTrigger>
              <TabsTrigger 
                value="activities" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Activity className="w-4 h-4 mr-2" />
                Atividades
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="photos" className="flex-1 min-h-0 overflow-y-auto space-y-3 scrollbar-hide">
              {photosLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                </div>
              ) : friendsPhotos.length > 0 ? (
                friendsPhotos.map((photo, index) => (
                  <div key={photo.id || index} className="bg-white/10 rounded-lg p-3 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        <img
                          src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${photo.userName}&size=s&direction=2&head_direction=3&headonly=1`}
                          alt={`Avatar de ${photo.userName}`}
                          className="w-full h-full object-contain bg-transparent"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${photo.userName}&size=s&direction=2&head_direction=3&headonly=1`;
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleUserClick(photo.userName)}
                        className="text-white font-semibold hover:text-blue-300 transition-colors"
                      >
                        {photo.userName}
                      </button>
                      <span className="text-white/60 text-xs ml-auto">
                        {photo.date}
                      </span>
                    </div>

                    {/* Photo */}
                    <div className="relative">
                      <img
                        src={photo.imageUrl}
                        alt={`Foto de ${photo.userName}`}
                        className="w-full h-auto object-contain rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/80 hover:text-red-400 hover:bg-white/10 p-2"
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        {photo.likes}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10 p-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white/60">Nenhuma foto dos amigos encontrada</p>
                  <p className="text-white/40 text-sm mt-2">
                    As fotos dos seus amigos aparecerão aqui
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activities" className="flex-1 min-h-0 overflow-y-auto space-y-3 scrollbar-hide">
              {activitiesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/60"></div>
                </div>
              ) : friendsActivities.length > 0 ? (
                <>
                  {tickerMetadata && (
                    <div className="text-xs text-white/60 text-center py-2">
                      Fonte: {tickerMetadata.source} • {friendsActivities.length} atividades
                    </div>
                  )}
                  {friendsActivities.map((friendActivity) => (
                    <div key={friendActivity.friend.uniqueId} className="bg-white/10 rounded-lg p-3 space-y-2">
                      {/* Friend Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex-shrink-0">
                          <img
                            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${friendActivity.friend.name}&size=s&direction=2&head_direction=3&headonly=1`}
                            alt={`Avatar de ${friendActivity.friend.name}`}
                            className="w-full h-full object-contain bg-transparent"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friendActivity.friend.name}&size=s&direction=2&head_direction=3&headonly=1`;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <button
                            onClick={() => handleUserClick(friendActivity.friend.name)}
                            className="font-semibold text-white hover:text-blue-300 transition-colors"
                          >
                            {friendActivity.friend.name}
                          </button>
                          <div className="text-xs text-white/60 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatActivityTime(friendActivity.lastActivityTime)}
                          </div>
                        </div>
                        {friendActivity.friend.online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                        )}
                      </div>

                      {/* Activities */}
                      <div className="space-y-1">
                        {friendActivity.activities.length > 0 ? (
                          friendActivity.activities.slice(0, 3).map((activity, index) => (
                            <div key={index} className="text-sm text-white/80 pl-11">
                              {activity.activity || activity.description || 'fez uma atividade'}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-white/60 italic pl-11">
                            Nenhuma atividade recente
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 text-white/40" />
                  <p className="text-white/60">Nenhuma atividade de amigos encontrada</p>
                  <p className="text-white/40 text-sm mt-2">
                    Atividades dos seus amigos aparecerão aqui
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ConsoleProfileModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        habboName={selectedUser}
      />
    </>
  );
};