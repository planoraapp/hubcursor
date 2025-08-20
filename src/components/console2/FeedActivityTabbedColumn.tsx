import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Heart, MessageCircle, Camera, Activity, Clock, Users } from 'lucide-react';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
import { useFriendsFeed } from '@/hooks/useFriendsFeed';
import { useAuth } from '@/hooks/useAuth';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { PhotoLikesModal } from '@/components/shared/PhotoLikesModal';
import { PhotoCommentsModal } from '@/components/shared/PhotoCommentsModal';
import { PhotoCard } from './PhotoCard';
import { UserProfileInColumn } from './UserProfileInColumn';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FeedActivityTabbedColumn: React.FC = () => {
  const { habboAccount } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  const [selectedPhotoForLikes, setSelectedPhotoForLikes] = useState<string>('');
  const [selectedPhotoForComments, setSelectedPhotoForComments] = useState<string>('');
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  
  // Ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollDirection = useScrollDirection(scrollContainerRef.current);

  // Always call hooks at the top level to prevent violations
  const { 
    likes: photoLikes, 
    likesLoading, 
    toggleLike 
  } = usePhotoLikes(selectedPhotoForLikes || '');
  
  const { 
    comments: photoComments, 
    commentsLoading, 
    addComment,
    isAddingComment 
  } = usePhotoComments(selectedPhotoForComments || '');
  
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
    setShowProfile(true);
  };

  const handleLikesClick = (photoId: string) => {
    setSelectedPhotoForLikes(photoId);
    setShowLikesModal(true);
  };

  const handleCommentsClick = (photoId: string) => {
    setSelectedPhotoForComments(photoId);
    setShowCommentsModal(true);
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

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'badge':
        return '🏆';
      case 'motto_change':
        return '💬';
      case 'look_change':
        return '👕';
      case 'friend_added':
        return '👥';
      case 'status_change':
        return '🟢';
      case 'photo_uploaded':
        return '📸';
      case 'room_visited':
        return '🏠';
      default:
        return '✨';
    }
  };

  // Show profile if selected
  if (showProfile && selectedUser) {
    return (
      <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <UserProfileInColumn 
          username={selectedUser} 
          onBack={() => {
            setShowProfile(false);
            setSelectedUser('');
          }} 
        />
      </Card>
    );
  }

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
        
        <CardContent className="flex-1 min-h-0 flex flex-col p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
            <TabsList 
              className={`grid w-full grid-cols-2 bg-white/10 mb-4 transition-all duration-300 ${
                scrollDirection === 'down' ? '-translate-y-2 opacity-75 scale-95' : 'translate-y-0 opacity-100 scale-100'
              }`}
            >
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
            
            <TabsContent 
              value="photos" 
              className="flex-1 min-h-0 space-y-3 pr-2 max-h-[calc(100vh-20rem)]"
            >
              <div 
                ref={activeTab === 'photos' ? scrollContainerRef : undefined}
                className="overflow-y-auto h-full space-y-3"
                style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}
              >
                {photosLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                  </div>
                ) : friendsPhotos.length > 0 ? (
                  friendsPhotos.map((photo, index) => (
                    <PhotoCard
                      key={photo.id || index}
                      photo={photo}
                      onUserClick={handleUserClick}
                      onLikesClick={handleLikesClick}
                      onCommentsClick={handleCommentsClick}
                      showDivider={index < friendsPhotos.length - 1}
                    />
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
              </div>
            </TabsContent>
            
            <TabsContent 
              value="activities" 
              ref={activeTab === 'activities' ? scrollContainerRef : undefined}
              className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2 max-h-[calc(100vh-20rem)]" 
              style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}
            >
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
                  {friendsActivities.map((friendActivity, index) => (
                    <div key={friendActivity.friend.uniqueId} className="space-y-3">
                      {/* Friend Header */}
                      <div className="flex items-center gap-3 px-1">
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
                      <div className="space-y-1 px-1">
                        {friendActivity.activities.length > 0 ? (
                          friendActivity.activities.slice(0, 3).map((activity, actIndex) => {
                            // Handle real activities vs ticker activities
                            const isRealActivity = 'activity_type' in activity;
                            const activityText = isRealActivity 
                              ? (activity as any).activity_description
                              : (activity as any).activity || (activity as any).description || 'fez uma atividade';
                            
                            const activityIcon = isRealActivity ? getActivityIcon((activity as any).activity_type) : '📍';
                            
                            return (
                              <div key={actIndex} className="text-sm text-white/80 pl-11 flex items-center gap-2">
                                <span className="text-xs">{activityIcon}</span>
                                <div className="flex items-center gap-2 flex-1">
                                  <span>{activityText}</span>
                                  {/* Show badge image for badge activities */}
                                  {isRealActivity && (activity as any).badgeImageUrl && (
                                    <img 
                                      src={(activity as any).badgeImageUrl} 
                                      alt="Badge" 
                                      className="w-4 h-4 object-contain"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                  {/* Show avatar preview for look changes */}
                                  {isRealActivity && (activity as any).avatarPreviewUrl && (
                                    <img 
                                      src={(activity as any).avatarPreviewUrl} 
                                      alt="Novo visual" 
                                      className="w-6 h-6 object-contain border border-white/20 rounded"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-white/60 italic pl-11">
                            Sem atividades recentes
                          </div>
                        )}
                      </div>

                      {/* Subtle divider between activities */}
                      {index < friendsActivities.length - 1 && (
                        <div className="w-full h-px bg-white/10 my-4" />
                      )}
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

      {/* Photo Modals */}
      <PhotoLikesModal
        open={showLikesModal}
        onOpenChange={setShowLikesModal}
        likes={selectedPhotoForLikes ? photoLikes : []}
        isLoading={selectedPhotoForLikes ? likesLoading : false}
      />

      <PhotoCommentsModal
        open={showCommentsModal}
        onOpenChange={setShowCommentsModal}
        comments={selectedPhotoForComments ? photoComments : []}
        isLoading={selectedPhotoForComments ? commentsLoading : false}
        onAddComment={addComment}
        isAddingComment={isAddingComment}
      />
    </>
  );
};