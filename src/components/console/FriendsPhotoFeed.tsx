import React, { useState } from "react";
import { useFriendsPhotos } from "@/hooks/useFriendsPhotos";
import { FriendsPhotoCard } from "./FriendsPhotoCard";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface FriendsPhotoFeedProps {
  currentUserName: string;
  hotel: string;
  onNavigateToProfile: (username: string) => void;
  onShowLikesModal?: (photo: any) => void;
  onShowCommentsModal?: (photo: any) => void;
}

export const FriendsPhotoFeed: React.FC<FriendsPhotoFeedProps> = ({
  currentUserName,
  hotel,
  onNavigateToProfile,
  onShowLikesModal,
  onShowCommentsModal
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
            <div className="text-sm text-white/60">
              {photos.length} fotos
            </div>
          </div>

          {/* Lista de fotos */}
          <div className="space-y-4">
            {photos.map((photo) => (
              <FriendsPhotoCard
                key={photo.id}
                photo={photo}
                currentUser={currentUserName}
                onNavigateToProfile={onNavigateToProfile}
                onLike={() => {}} // Não usado mais - curtidas são gerenciadas internamente
                onComment={() => {}} // Não usado mais - comentários são gerenciados internamente
                showLikesModal={false}
                setShowLikesModal={() => onShowLikesModal?.(photo)}
                showCommentsModal={false}
                setShowCommentsModal={() => onShowCommentsModal?.(photo)}
              />
            ))}
          </div>
        </div>
      );
};