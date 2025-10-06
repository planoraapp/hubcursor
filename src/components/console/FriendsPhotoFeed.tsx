import React, { useState } from "react";
import { useFriendsPhotos } from "@/hooks/useFriendsPhotos";
import { EnhancedPhotoCard } from "@/components/console2/EnhancedPhotoCard";
import { EnhancedPhoto } from "@/types/habbo";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface FriendsPhotoFeedProps {
  currentUserName: string;
  hotel: string;
  onNavigateToProfile: (username: string) => void;
}

export const FriendsPhotoFeed: React.FC<FriendsPhotoFeedProps> = ({
  currentUserName,
  hotel,
  onNavigateToProfile
}) => {
  const {
    data: photos,
    isLoading,
    error,
    refetch
  } = useFriendsPhotos(currentUserName, hotel);

  const handleRetry = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/60 mx-auto mb-4" />
          <p className="text-white/60">Carregando fotos dos amigos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Erro ao carregar fotos dos amigos</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">📷</div>
          <p className="text-white/60 mb-2">Nenhuma foto encontrada</p>
          <p className="text-white/40 text-sm">Seus amigos ainda não postaram fotos</p>
        </div>
      </div>
    );
  }

      return (
        <div className="space-y-4 relative">
          {/* Header do feed */}
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-bold text-white">
              📸 Feed de Fotos dos Amigos
            </h3>
          </div>

          {/* Lista de fotos */}
          <div className="space-y-4">
            {photos.map((photo, index) => (
              <EnhancedPhotoCard
                key={photo.id}
                photo={{
                  id: photo.id,
                  photo_id: photo.id,
                  userName: photo.userName,
                  imageUrl: photo.imageUrl,
                  date: photo.date,
                  likes: [],
                  likesCount: photo.likes,
                  userLiked: false,
                  type: 'PHOTO' as const,
                  caption: '',
                  roomName: ''
                } as EnhancedPhoto}
                onUserClick={onNavigateToProfile}
                onLikesClick={() => {}}
                onCommentsClick={() => {}}
                showDivider={index < photos.length - 1}
              />
            ))}
          </div>
        </div>
      );
};