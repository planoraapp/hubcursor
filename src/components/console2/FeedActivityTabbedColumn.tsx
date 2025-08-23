import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Heart, MessageCircle, Camera, Activity, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOptimizedFriendsPhotos } from '@/hooks/useOptimizedFriendsPhotos';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
import { useOptimizedHotelFeed } from '@/hooks/useOptimizedHotelFeed';
import { useChronologicalFeedPhotos } from '@/hooks/useChronologicalFeedPhotos';
import { useChronologicalFeedActivities } from '@/hooks/useChronologicalFeedActivities';
import { useFriendsActivitiesDirect } from '@/hooks/useFriendsActivitiesDirect';
import { useAuth } from '@/hooks/useAuth';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { PhotoLikesModal } from '@/components/shared/PhotoLikesModal';
import { PhotoCommentsModal } from '@/components/shared/PhotoCommentsModal';
import { PhotoCard } from './PhotoCard';
import { UserProfileInColumn } from './UserProfileInColumn';
import { EnhancedActivityRenderer } from './EnhancedActivityRenderer';
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
  
  // Hooks para fotos dos amigos - usando feeds cronológicos
  const { 
    photos: chronoPhotos, 
    isLoading: chronoPhotosLoading, 
    refetch: refetchChronoPhotos 
  } = useChronologicalFeedPhotos(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  // Backup - fotos otimizadas dos amigos
  const { 
    data: friendsPhotos = [], 
    isLoading: photosLoading, 
    refetch: refetchPhotos,
    forceRefresh: forceRefreshPhotos
  } = useOptimizedFriendsPhotos(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  // Hooks para atividades dos amigos - usando feeds cronológicos
  const { 
    activities: chronoActivities, 
    isLoading: chronoActivitiesLoading, 
    refetch: refetchChronoActivities 
  } = useChronologicalFeedActivities(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  // Backup - atividades diretas dos amigos
  const { 
    activities, 
    isLoading: activitiesLoading, 
    fetchNextPage,
    hasNextPage,
    refetch: refetchActivities
  } = useFriendsActivitiesDirect();

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

  const handleRefresh = async () => {
    if (activeTab === 'photos') {
      console.log('[📸 PHOTOS] Forcing refresh with chronological feed');
      await refetchChronoPhotos();
      await forceRefreshPhotos(); // Backup
    } else if (activeTab === 'activities') {
      console.log('[⚡ ACTIVITIES] Forcing refresh with chronological feed');
      await refetchChronoActivities();
      await refetchActivities(); // Backup
    }
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
      <Card className="bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
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
      <div className="h-full flex flex-col bg-transparent">
        <div className="flex-shrink-0 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white habbo-text-shadow" />
              <span className="text-sm font-bold text-white habbo-text-shadow">
                Feed dos Amigos
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={chronoPhotosLoading || photosLoading || chronoActivitiesLoading || activitiesLoading}
              className="text-white/80 hover:text-white p-1 transition-colors"
            >
              {(chronoPhotosLoading || photosLoading || chronoActivitiesLoading || activitiesLoading) ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col">
          {/* Tabs */}
          <div className="flex-shrink-0 mb-3">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setActiveTab('photos')}
                className={cn(
                  "pixel-nav-button text-[10px] p-2 h-8",
                  activeTab === 'photos' ? "active" : ""
                )}
                style={{
                  backgroundColor: activeTab === 'photos' ? '#FDCC00' : '#666666',
                  color: activeTab === 'photos' ? '#2B2300' : '#FFFFFF'
                }}
              >
                <Camera className="w-3 h-3 mr-1" />
                Fotos
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={cn(
                  "pixel-nav-button text-[10px] p-2 h-8",
                  activeTab === 'activities' ? "active" : ""
                )}
                style={{
                  backgroundColor: activeTab === 'activities' ? '#FDCC00' : '#666666',
                  color: activeTab === 'activities' ? '#2B2300' : '#FFFFFF'
                }}
              >
                <Activity className="w-3 h-3 mr-1" />
                Atividades
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
            {activeTab === 'photos' ? (
              chronoPhotosLoading || photosLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                </div>
              ) : (chronoPhotos.length > 0 ? chronoPhotos : friendsPhotos).length > 0 ? (
                (chronoPhotos.length > 0 ? chronoPhotos : friendsPhotos).map((photo, index) => (
                  <PhotoCard
                    key={photo.id || index}
                    photo={photo}
                    onUserClick={handleUserClick}
                    onLikesClick={handleLikesClick}
                    onCommentsClick={handleCommentsClick}
                    showDivider={index < (chronoPhotos.length > 0 ? chronoPhotos : friendsPhotos).length - 1}
                  />
                ))
              ) : (
                <div className="text-center py-6">
                  <Camera className="w-8 h-8 mx-auto mb-3 text-white/40" />
                  <p className="text-white/60 text-xs">
                    {chronoPhotos.length > 0 ? 'Feed cronológico ativo' : 'Nenhuma foto dos amigos encontrada'}
                  </p>
                  <p className="text-white/40 text-[10px] mt-1">
                    {chronoPhotos.length > 0 ? 'Fotos organizadas por data' : 'As fotos dos seus amigos aparecerão aqui'}
                  </p>
                </div>
              )
            ) : (
              chronoActivitiesLoading || activitiesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                </div>
              ) : (chronoActivities.length > 0 ? chronoActivities : activities).length > 0 ? (
                <>
                  <div className="text-[10px] text-white/60 text-center py-1">
                    {chronoActivities.length > 0 ? 'Feed cronológico ativo • ' : 'Atividades recentes • '}
                    {(chronoActivities.length > 0 ? chronoActivities : activities).length} encontradas
                  </div>
                  {(chronoActivities.length > 0 ? chronoActivities : activities).map((activity, index) => (
                    <div key={`${activity.user_habbo_name || activity.username}-${activity.last_updated || activity.timestamp}-${index}`}>
                      <div className="bg-transparent border border-black hover:bg-white/10 transition-colors p-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Activity className="w-3 h-3 text-blue-300" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleUserClick(activity.user_habbo_name || activity.username || '')}
                              className="text-white/90 text-xs font-medium hover:text-white transition-colors volter-font"
                            >
                              {activity.user_habbo_name || activity.username || 'Usuário'}
                            </button>
                            <p className="text-white/70 text-[10px] leading-relaxed mt-1">
                              {chronoActivities.length > 0 && activity.summary 
                                ? activity.summary 
                                : (activity.activity_description || activity.description || 'Atividade realizada')
                              }
                            </p>
                            <p className="text-white/50 text-[9px] mt-1">
                              {chronoActivities.length > 0 && activity.timeAgo 
                                ? `Última atualização ${activity.timeAgo}`
                                : (activity.timestamp ? formatActivityTime(activity.timestamp) : 'há alguns momentos')
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < (chronoActivities.length > 0 ? chronoActivities : activities).length - 1 && (
                        <div className="w-full h-px bg-white/20 my-1" />
                      )}
                    </div>
                  ))}
                  {!chronoActivities.length && hasNextPage && (
                    <div className="flex justify-center py-2">
                      <button
                        onClick={() => fetchNextPage()}
                        className="text-white/70 hover:text-white text-xs border border-black px-2 py-1 hover:bg-white/10 transition-colors"
                      >
                        Carregar mais atividades
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-8 h-8 mx-auto mb-3 text-white/40" />
                  <p className="text-white/60 text-xs">
                    {chronoActivities.length > 0 ? 'Feed cronológico ativo' : 'Nenhuma atividade de amigos encontrada'}
                  </p>
                  <p className="text-white/40 text-[10px] mt-1">
                    {chronoActivities.length > 0 ? 'Atividades organizadas por data' : 'Atividades dos seus amigos aparecerão aqui'}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

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