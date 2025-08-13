
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Heart, Users, Camera, Loader2 } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { usePhotosScraped } from '@/hooks/usePhotosScraped';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { habboProxyService } from '@/services/habboProxyService';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { PhotosSection } from './PhotosSection';

export const MyAccountColumn: React.FC = () => {
  const { 
    isLoggedIn, 
    habboAccount, 
    myProfile, 
    isLoading 
  } = useMyConsoleProfile();

  // Get complete profile data for stats grid
  const hotel = (habboAccount as any)?.hotel === 'br' ? 'com.br' : ((habboAccount as any)?.hotel || 'com.br');
  const { 
    data: completeProfile, 
    isLoading: isLoadingComplete 
  } = useCompleteProfile(habboAccount?.habbo_name || '', hotel as string);

  // Get photos using the new scraping system
  const { scrapedPhotos, isLoading: isLoadingPhotos } = usePhotosScraped(habboAccount?.habbo_name);

  // Get follow system data
  const { followersCount, followingCount } = useFollowSystem((habboAccount as any)?.supabase_user_id);

  console.log('[MyAccountColumn] Scraped Photos data:', scrapedPhotos);

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
    <div className="space-y-4">
      <Card className="bg-[#5A6573] text-white border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Minha Conta
            {(isLoading || isLoadingComplete || isLoadingPhotos) && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                {((myProfile?.selectedBadges && myProfile.selectedBadges.length > 0) || 
                  (completeProfile?.data?.selectedBadges && completeProfile.data.selectedBadges.length > 0)) && (
                  <div className="flex flex-wrap gap-1">
                    {(myProfile?.selectedBadges || completeProfile?.data?.selectedBadges || []).slice(0, 3).map((badge, index) => (
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

            {/* Habbo Stats Section - Using ProfileStatsGrid */}
            {completeProfile && (
              <div>
                <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Estatísticas do Habbo
                </h4>
                <ProfileStatsGrid profile={completeProfile} />
              </div>
            )}

            {/* Simplified Social Stats Section */}
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
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Photos Section */}
      <PhotosSection 
        photos={scrapedPhotos?.map(photo => ({
          id: photo.id,
          imageUrl: photo.imageUrl,
          date: photo.date,
          likes: photo.likes
        })) || []}
        userName="Minhas Fotos"
        isLoading={isLoadingPhotos}
      />
    </div>
  );
};
