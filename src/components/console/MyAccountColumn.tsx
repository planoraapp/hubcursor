
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Heart, MessageCircle, Users, Camera, Loader2 } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useHabboPhotos } from '@/hooks/useHabboPhotos';
import { habboProxyService } from '@/services/habboProxyService';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { EnhancedPhotosGrid } from '@/components/profile/EnhancedPhotosGrid';

export const MyAccountColumn: React.FC = () => {
  const { 
    isLoggedIn, 
    habboAccount, 
    myProfile, 
    myLikes, 
    myComments, 
    followers, 
    following, 
    isLoading 
  } = useMyConsoleProfile();

  // Get complete profile data for stats grid
  const hotel = (habboAccount as any)?.hotel === 'br' ? 'com.br' : ((habboAccount as any)?.hotel || 'com.br');
  const { 
    data: completeProfile, 
    isLoading: isLoadingComplete 
  } = useCompleteProfile(habboAccount?.habbo_name || '', hotel as string);

  // Get photos using the updated S3 discovery system
  const { habboPhotos, isLoading: isLoadingPhotos } = useHabboPhotos(habboAccount?.habbo_name, hotel as string);

  console.log('[MyAccountColumn] Complete Profile data:', completeProfile);
  console.log('[MyAccountColumn] S3 Photos data:', habboPhotos);

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

            {/* Social Stats Section - Internal System Data */}
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Estatísticas Sociais
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-semibold">{myLikes.length}</span>
                  </div>
                  <p className="text-xs text-white/60">Curtidas</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-lg font-semibold">{myComments.length}</span>
                  </div>
                  <p className="text-xs text-white/60">Comentários</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-green-400" />
                    <span className="text-lg font-semibold">{followers.length}</span>
                  </div>
                  <p className="text-xs text-white/60">Seguidores</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-lg font-semibold">{following.length}</span>
                  </div>
                  <p className="text-xs text-white/60">Seguindo</p>
                </div>
              </div>
            </div>

            {/* Enhanced Photos Section with S3 Discovery */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4 text-white/80" />
                <h4 className="text-sm font-medium text-white/80">
                  Minhas Fotos ({habboPhotos?.length || 0})
                </h4>
                {isLoadingPhotos && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
              </div>
              
              {habboPhotos && habboPhotos.length > 0 ? (
                <EnhancedPhotosGrid 
                  photos={habboPhotos}
                  userName={habboAccount.habbo_name}
                  hotel={hotel as string}
                />
              ) : (
                <div className="text-center py-6">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50 text-white/50" />
                  <p className="text-white/60 text-sm">
                    {isLoadingPhotos ? 'Descobrindo suas fotos...' : 'Nenhuma foto encontrada'}
                  </p>
                  {!isLoadingPhotos && (
                    <p className="text-white/40 text-xs mt-1">
                      As fotos são descobertas automaticamente do sistema do Habbo
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
