import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Heart, MessageCircle, Users, Camera, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';
import { useHabboPhotos } from '@/hooks/useHabboPhotos';
import { habboProxyService } from '@/services/habboProxyService';
import { ProfileStatsGrid } from '@/components/profile/ProfileStatsGrid';
import { EnhancedPhotosGrid } from '@/components/profile/EnhancedPhotosGrid';

interface UserProfileDetailViewProps {
  user: any;
  onBack: () => void;
}

export const UserProfileDetailView: React.FC<UserProfileDetailViewProps> = ({ user, onBack }) => {
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
    habboPhotos, 
    isLoading: isLoadingPhotos 
  } = useHabboPhotos(user.habbo_name, hotel);

  const isLoading = isLoadingUser || isLoadingComplete || isLoadingPhotos;
  const profile = habboUser || completeProfile;
  
  // Handle different figure_string property names
  const figureString = (habboUser as any)?.figure_string || completeProfile?.figureString;
  const avatarUrl = figureString
    ? habboProxyService.getAvatarUrl(figureString, 'l')
    : `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${user.habbo_name}&size=l&direction=2&head_direction=3&action=std`;

  return (
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

        {/* Photos Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-white/80" />
            <h4 className="text-sm font-medium text-white/80">
              Fotos ({habboPhotos?.length || 0})
            </h4>
            {isLoadingPhotos && <Loader2 className="w-3 h-3 ml-2 animate-spin" />}
          </div>
          
          {habboPhotos && habboPhotos.length > 0 ? (
            <EnhancedPhotosGrid 
              photos={habboPhotos}
              userName={user.habbo_name}
              hotel={hotel}
            />
          ) : (
            <div className="text-center py-6">
              <Camera className="w-8 h-8 mx-auto mb-2 opacity-50 text-white/50" />
              <p className="text-white/60 text-sm">
                {isLoadingPhotos ? 'Descobrindo fotos...' : 'Nenhuma foto encontrada'}
              </p>
              {!isLoadingPhotos && (
                <p className="text-white/40 text-xs mt-1">
                  As fotos são descobertas automaticamente do sistema do Habbo
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};