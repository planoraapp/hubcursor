
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

            {/* Enhanced Photos Section with Scraping */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-white/80" />
                <h4 className="text-sm font-medium text-white/80">
                  Minhas Fotos ({scrapedPhotos?.length || 0})
                </h4>
                {isLoadingPhotos && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
              </div>
              
              {isLoadingPhotos ? (
                <div className="text-center py-6 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-sm">Carregando fotos...</p>
                </div>
              ) : scrapedPhotos && scrapedPhotos.length > 0 ? (
                <div className="bg-white/10 p-3 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {scrapedPhotos.map((photo) => (
                      <div key={photo.id} className="relative overflow-hidden rounded-lg group aspect-square">
                        <img
                          src={photo.imageUrl}
                          alt="Foto Habbo"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/150x150/4B5563/FFFFFF?text=Foto+Não+Disponível`;
                          }}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                          <span className="text-xs text-white/80">{photo.date}</span>
                          <div className="flex items-center gap-1 text-white/80 text-xs">
                            <Heart className="w-3 h-3 text-red-400" />
                            <span>{photo.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-white/5 rounded-lg">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50 text-white/50" />
                  <p className="text-white/60 text-sm">Nenhuma foto encontrada</p>
                  <p className="text-white/40 text-xs mt-1">
                    As fotos são obtidas diretamente do seu perfil público do Habbo
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
