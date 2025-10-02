
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Camera } from 'lucide-react';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
import { useAuth } from '@/hooks/useAuth';
import { ProfileModal } from '@/components/ProfileModal';
import { EnhancedPhotoCard } from './EnhancedPhotoCard';
import { EnhancedPhoto } from '@/types/habbo';

export const HotelPhotoFeedColumn: React.FC = () => {
  const { habboAccount } = useAuth();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { 
    data: friendsPhotos = [], 
    isLoading, 
    refetch 
  } = useFriendsPhotos(
    habboAccount?.habbo_name || '',
    (habboAccount as any)?.hotel || 'br'
  );

  const handleUserClick = (userName: string) => {
    setSelectedUser(userName);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <Card className="bg-[#4A5568] text-white border-0 h-full flex flex-col overflow-hidden backdrop-blur-sm">
        <CardHeader className="border-b border-dashed border-white/20 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Feed dos Amigos
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              disabled={isLoading}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4 scrollbar-hide p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            </div>
          ) : friendsPhotos.length > 0 ? (
            friendsPhotos.map((photo, index) => {
              // Convert to EnhancedPhoto format
              const enhancedPhoto: EnhancedPhoto = {
                id: photo.id || `photo-${index}`,
                photo_id: photo.id || `photo-${index}`,
                userName: photo.userName,
                imageUrl: photo.imageUrl,
                date: photo.date,
                likes: [],
                likesCount: photo.likes || 0,
                userLiked: false,
                type: 'PHOTO', // Default type, could be enhanced based on photo data
                caption: photo.caption,
                roomName: photo.roomName
              };

              return (
                <div key={photo.id || index} className="bg-white/5 p-4 border border-dashed border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-200">
                  <EnhancedPhotoCard
                    photo={enhancedPhoto}
                    onUserClick={handleUserClick}
                    onLikesClick={(photoId) => {
                      // Handle likes click - could open likes modal
                      console.log('Likes clicked for photo:', photoId);
                    }}
                    onCommentsClick={(photoId) => {
                      // Handle comments click - could open comments modal
                      console.log('Comments clicked for photo:', photoId);
                    }}
                    showDivider={index < friendsPhotos.length - 1}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <p className="text-white/60">Nenhuma foto dos amigos encontrada</p>
              <p className="text-white/40 text-sm mt-2">
                As fotos dos seus amigos aparecerão aqui
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ProfileModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        habboName={selectedUser}
      />
    </>
  );
};
