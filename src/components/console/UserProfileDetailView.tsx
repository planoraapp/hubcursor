
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Camera, Loader2, Calendar, MapPin, Heart, RefreshCw } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { usePhotosScraped } from '@/hooks/usePhotosScraped';
import { habboProxyService } from '@/services/habboProxyService';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { PhotoModal } from '@/components/profile/PhotoModal';
import { convertScrapedPhotosToModalFormat } from '@/utils/photoHelpers';

interface UserProfileDetailViewProps {
  user: any;
  onBack: () => void;
}

export const UserProfileDetailView: React.FC<UserProfileDetailViewProps> = ({ user, onBack }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [forceRefresh, setForceRefresh] = useState(false);

  const { 
    habboUser,
    isLoading: isLoadingUser 
  } = useUserProfile(user.habbo_name);

  const hotel = user.hotel === 'br' ? 'com.br' : (user.hotel || 'com.br');
  
  const { 
    data: completeProfile, 
    isLoading: isLoadingComplete 
  } = useCompleteProfile(user.habbo_name, hotel);

  const { 
    scrapedPhotos, 
    isLoading: isLoadingPhotos,
    refreshPhotos,
    photoCount,
    error: photosError
  } = usePhotosScraped(user.habbo_name, hotel, forceRefresh);

  const isLoading = isLoadingUser || isLoadingComplete || isLoadingPhotos;
  const profile = habboUser || completeProfile;
  
  // Handle different figure_string property names
  const figureString = (habboUser as any)?.figure_string || completeProfile?.figureString;
  const avatarUrl = figureString
    ? habboProxyService.getAvatarUrl(figureString, 'l')
    : `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${user.habbo_name}&size=l&direction=2&head_direction=3&action=std`;

  // Convert scraped photos to modal format
  const modalPhotos = scrapedPhotos ? convertScrapedPhotosToModalFormat(scrapedPhotos, user.habbo_name) : [];

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleModalClose = () => {
    setSelectedPhotoIndex(null);
  };

  const handlePrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < modalPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handleRefreshPhotos = async () => {
    console.log('[UserProfileDetailView] Refreshing photos for:', user.habbo_name);
    setForceRefresh(true);
    try {
      await refreshPhotos();
    } finally {
      setForceRefresh(false);
    }
  };

  return (
    <>
      <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil do Usuário
              {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img 
                src={avatarUrl}
                alt={user.habbo_name}
                className="h-[130px] w-auto object-contain bg-transparent"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${user.habbo_name}&size=l`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-blue-200 text-lg mb-1">
                {user.habbo_name}
              </h3>
              {(profile?.motto || user.motto) && (
                <p className="text-white/80 text-sm italic mb-2">
                  "{profile?.motto || user.motto}"
                </p>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${
                  (profile?.online || user.online) ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-white/60">
                  {(profile?.online || user.online) ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="text-xs text-white/60 mb-2">
                Hotel: {user.hotel?.toUpperCase() || 'BR'}
              </div>
              {(((habboUser as any)?.selectedBadges && (habboUser as any).selectedBadges.length > 0) || 
                (completeProfile?.data?.selectedBadges && completeProfile.data.selectedBadges.length > 0)) && (
                <div className="flex flex-wrap gap-1">
                  {((habboUser as any)?.selectedBadges || completeProfile?.data?.selectedBadges || []).slice(0, 5).map((badge: any, index: number) => (
                    <img
                      key={index}
                      src={habboProxyService.getBadgeUrl(badge.code)}
                      alt={badge.name}
                      className="w-6 h-6 border border-white/20 bg-white/10 p-0.5"
                      title={badge.description || badge.name}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          {completeProfile && (
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Estatísticas do Habbo
              </h4>
              <ProfileStatsGrid profile={completeProfile} />
            </div>
          )}

          {/* Enhanced Photos Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-white/80" />
                <h4 className="text-sm font-medium text-white/80">
                  Fotos ({photoCount})
                </h4>
                {isLoadingPhotos && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshPhotos}
                disabled={isLoadingPhotos || forceRefresh}
                className="text-white/60 hover:text-white hover:bg-white/10 p-1 h-auto"
                title="Atualizar fotos"
              >
                <RefreshCw className={`w-3 h-3 ${(isLoadingPhotos || forceRefresh) ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Debug info */}
            {photosError && (
              <div className="mb-3 p-2 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-200">
                Erro ao carregar fotos: {photosError.message}
              </div>
            )}
            
            {scrapedPhotos && scrapedPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {scrapedPhotos.map((photo, index) => (
                  <div 
                    key={photo.id || index} 
                    className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer aspect-square"
                    onClick={() => handlePhotoClick(index)}
                  >
                    {/* Photo Image */}
                    <div className="w-full h-full overflow-hidden">
                      <img
                        src={photo.imageUrl}
                        alt={`Foto de ${user.habbo_name}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          console.log('[UserProfileDetailView] Image failed to load:', photo.imageUrl);
                          (e.target as HTMLImageElement).src = 'https://placehold.co/150x150/4B5563/FFFFFF?text=Erro';
                        }}
                      />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
                      {/* Header with date */}
                      <div className="text-xs text-white/80">
                        {photo.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {photo.date}
                          </div>
                        )}
                      </div>

                      {/* Footer with info */}
                      <div className="space-y-1">
                        {/* Room name */}
                        {photo.roomName && (
                          <div className="flex items-center gap-1 text-xs text-white/80">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{photo.roomName}</span>
                          </div>
                        )}
                        
                        {/* Likes */}
                        {photo.likes > 0 && (
                          <div className="flex items-center gap-1 text-xs text-white/80">
                            <Heart className="w-3 h-3 fill-red-500 text-red-500 flex-shrink-0" />
                            <span>{photo.likes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Click indicator */}
                    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="bg-white/20 rounded-full p-2">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-50 text-white/50" />
                <p className="text-white/60 text-sm">
                  {isLoadingPhotos ? 'Descobrindo fotos...' : 'Nenhuma foto encontrada'}
                </p>
                {!isLoadingPhotos && (
                  <div className="mt-2 space-y-1">
                    <p className="text-white/40 text-xs">
                      As fotos são descobertas automaticamente do sistema do Habbo
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefreshPhotos}
                      className="text-white/60 hover:text-white text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Tentar novamente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && modalPhotos.length > 0 && (
        <PhotoModal
          isOpen={selectedPhotoIndex !== null}
          onClose={handleModalClose}
          photos={modalPhotos}
          currentPhotoIndex={selectedPhotoIndex}
          userName={user.habbo_name}
          hotel={hotel}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </>
  );
};
