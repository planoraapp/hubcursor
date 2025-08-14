import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Heart, Users, Camera, Loader2, Calendar, MapPin } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { usePhotosScraped } from '@/hooks/usePhotosScraped';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { habboProxyService } from '@/services/habboProxyService';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { PhotoModal } from '@/components/profile/PhotoModal';
import { convertScrapedPhotosToModalFormat } from '@/utils/photoHelpers';

export const MyAccountColumn: React.FC = () => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const { 
    isLoggedIn, 
    habboAccount, 
    myProfile, 
    isLoading 
  } = useMyConsoleProfile();

  // Get complete profile data for stats grid
  const hotel = (habboAccount as any)?.hotel === 'br' ? 'br' : ((habboAccount as any)?.hotel || 'br');
  const { 
    data: completeProfile, 
    isLoading: isLoadingComplete 
  } = useCompleteProfile(habboAccount?.habbo_name || '', hotel as string);

  // Get photos using the scraping system
  const { scrapedPhotos, isLoading: isLoadingPhotos } = usePhotosScraped(habboAccount?.habbo_name, hotel);

  // Get follow system data
  const { followersCount, followingCount } = useFollowSystem((habboAccount as any)?.supabase_user_id);

  // Convert scraped photos to modal format
  const modalPhotos = scrapedPhotos ? convertScrapedPhotosToModalFormat(scrapedPhotos, habboAccount?.habbo_name || '') : [];

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

  if (!isLoggedIn || !habboAccount) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#5A6573] text-white border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <User className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Login necessário
            </h3>
            <p className="text-white/70">
              Conecte sua conta Habbo para ver seu perfil
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card className="bg-[#5A6573] text-white border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Conta
              {(isLoading || isLoadingComplete || isLoadingPhotos) && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto custom-scrollbar">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {myProfile?.figureString || completeProfile?.figureString ? (
                  <img 
                    src={habboProxyService.getAvatarUrl(myProfile?.figureString || completeProfile?.figureString || '', 'l')} 
                    alt={habboAccount.habbo_name}
                    className="h-[130px] w-auto object-contain bg-transparent"
                  />
                ) : (
                  <div className="h-[130px] w-16 bg-white/10 flex items-center justify-center">
                    <span className="text-2xl font-bold">
                      {habboAccount.habbo_name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-blue-200 text-lg mb-1">
                  {habboAccount.habbo_name}
                </h3>
                {(myProfile?.motto || completeProfile?.motto) && (
                  <p className="text-white/80 text-sm italic mb-2">
                    "{myProfile?.motto || completeProfile?.motto}"
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    (myProfile?.online || completeProfile?.online) ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-white/60">
                    {(myProfile?.online || completeProfile?.online) ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-xs text-white/60 mb-2">
                  Hotel: {(habboAccount as any)?.hotel?.toUpperCase() || 'BR'}
                </div>
                {((myProfile?.selectedBadges && myProfile.selectedBadges.length > 0) || 
                  (completeProfile?.data?.selectedBadges && completeProfile.data.selectedBadges.length > 0)) && (
                  <div className="flex flex-wrap gap-1">
                    {(myProfile?.selectedBadges || completeProfile?.data?.selectedBadges || []).slice(0, 5).map((badge, index) => (
                      <img
                        key={index}
                        src={habboProxyService.getBadgeUrl(badge.code)}
                        alt={badge.name}
                        className="w-6 h-6 border border-white/20 bg-white/10 p-0.5"
                        title={badge.description}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Habbo Stats Section */}
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
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-white/80" />
                <h4 className="text-sm font-medium text-white/80">
                  Minhas Fotos ({scrapedPhotos?.length || 0})
                </h4>
                {isLoadingPhotos && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
              </div>
              
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
                          alt={`Minha foto`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                          loading="lazy"
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
                    {isLoadingPhotos ? 'Descobrindo minhas fotos...' : 'Nenhuma foto encontrada'}
                  </p>
                  {!isLoadingPhotos && (
                    <p className="text-white/40 text-xs mt-1">
                      As fotos são descobertas automaticamente do sistema do Habbo
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Social Stats Section */}
            <div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Camera className="w-4 h-4 text-white/60" />
                    <span className="text-lg font-semibold">{scrapedPhotos?.length || 0}</span>
                  </div>
                  <p className="text-xs text-white/60">Fotos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-white/60" />
                    <span className="text-lg font-semibold">{followersCount}</span>
                  </div>
                  <p className="text-xs text-white/60">Seguidores</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-white/60" />
                    <span className="text-lg font-semibold">{followingCount}</span>
                  </div>
                  <p className="text-xs text-white/60">Seguindo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && modalPhotos.length > 0 && (
        <PhotoModal
          isOpen={selectedPhotoIndex !== null}
          onClose={handleModalClose}
          photos={modalPhotos}
          currentPhotoIndex={selectedPhotoIndex}
          userName={habboAccount?.habbo_name || ''}
          hotel={hotel === 'br' ? 'com.br' : hotel}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </>
  );
};
