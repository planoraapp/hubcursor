
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Heart, MessageCircle, Camera } from 'lucide-react';
import { useFriendsPhotos } from '@/hooks/useFriendsPhotos';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { ConsoleProfileModal } from '@/components/console/ConsoleProfileModal';

export const HotelPhotoFeedColumn: React.FC = () => {
  const { habboAccount } = useUnifiedAuth();
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
      <Card className="bg-[#4A5568] text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
        <CardHeader className="pb-3 flex-shrink-0">
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
        
        <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-3 scrollbar-hide">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-white/60" />
            </div>
          ) : friendsPhotos.length > 0 ? (
            friendsPhotos.map((photo, index) => (
              <div key={photo.id || index} className="bg-white/10 rounded-lg p-3 space-y-3">
                {/* User Info - Avatar sem borda circular */}
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
