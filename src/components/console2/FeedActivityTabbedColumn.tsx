import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Heart, MessageCircle, Camera, Activity, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
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
    activities, 
    isLoading: activitiesLoading, 
    fetchNextPage,
    hasNextPage
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
              disabled={photosLoading || activitiesLoading}
              className="text-white/80 hover:text-white p-1 transition-colors"
            >
              {(photosLoading || activitiesLoading) ? (
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
              photosLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-white/60" />
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
                <div className="text-center py-6">
                  <Camera className="w-8 h-8 mx-auto mb-3 text-white/40" />
                  <p className="text-white/60 text-xs">Nenhuma foto dos amigos encontrada</p>
                  <p className="text-white/40 text-[10px] mt-1">
                    As fotos dos seus amigos aparecerão aqui
                  </p>
                </div>
              )
            ) : (
              activitiesLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60"></div>
                </div>
              ) : activities.length > 0 ? (
                <>
                  <div className="text-[10px] text-white/60 text-center py-1">
                    Atividades recentes • {activities.length} encontradas
                  </div>
                  {activities.map((activity, index) => (
                    <div key={`${activity.username}-${activity.timestamp}-${index}`}>
                      <EnhancedActivityRenderer 
                        activity={activity}
                        className="bg-transparent border border-black hover:bg-white/10 transition-colors p-2"
                        onUserClick={handleUserClick}
                      />
                      {index < activities.length - 1 && (
                        <div className="w-full h-px bg-white/20 my-1" />
                      )}
                    </div>
                  ))}
                  {hasNextPage && (
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
                  <p className="text-white/60 text-xs">Nenhuma atividade de amigos encontrada</p>
                  <p className="text-white/40 text-[10px] mt-1">
                    Atividades dos seus amigos aparecerão aqui
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