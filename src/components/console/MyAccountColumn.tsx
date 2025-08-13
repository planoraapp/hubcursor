
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Heart, Users, Camera, Loader2 } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { usePhotosScraped } from '@/hooks/usePhotosScraped';
import { useFollowSystem } from '@/hooks/useFollowSystem';
import { habboProxyService } from '@/services/habboProxyService';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';

export const MyAccountColumn: React.FC = () => {
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

  // Get photos using the corrected scraping system - same format as UserProfileDetailView
  const { scrapedPhotos, isLoading: isLoadingPhotos } = usePhotosScraped(habboAccount?.habbo_name, hotel);

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

          {/* Photos Section - Same as UserProfileDetailView */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-white/80" />
              <h4 className="text-sm font-medium text-white/80">
                Minhas Fotos ({scrapedPhotos?.length || 0})
              </h4>
              {isLoadingPhotos && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
            </div>
            
            {scrapedPhotos && scrapedPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {scrapedPhotos.map((photo, index) => (
                  <div key={photo.id || index} className="relative group">
                    <img
                      src={photo.imageUrl}
                      alt={`Minha foto`}
                      className="w-full h-20 object-cover rounded border border-white/20 group-hover:border-white/40 transition-colors"
                      loading="lazy"
                    />
                    {photo.likes > 0 && (
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1 rounded">
                        ♥ {photo.likes}
                      </div>
                    )}
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
        </CardContent>
      </Card>
    </div>
  );
};
