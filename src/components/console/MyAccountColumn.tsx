
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, Heart, MessageCircle, Users, Camera, Loader2 } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { habboProxyService } from '@/services/habboProxyService';

export const MyAccountColumn: React.FC = () => {
  const { 
    isLoggedIn, 
    habboAccount, 
    myProfile, 
    photos, 
    myLikes, 
    myComments, 
    followers, 
    following, 
    isLoading 
  } = useMyConsoleProfile();

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
            {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-auto" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {myProfile?.figureString ? (
                  <img 
                    src={habboProxyService.getAvatarUrl(myProfile.figureString, 'l')} 
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
                {myProfile?.motto && (
                  <p className="text-white/80 text-sm italic mb-2">
                    "{myProfile.motto}"
                  </p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${
                    myProfile?.online ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-white/60">
                    {myProfile?.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                {myProfile?.selectedBadges && myProfile.selectedBadges.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {myProfile.selectedBadges.slice(0, 3).map((badge, index) => (
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

            {/* Stats Section */}
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

            {/* Photos Section */}
            {photos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="w-4 h-4 text-white/80" />
                  <h4 className="text-sm font-medium text-white/80">
                    Minhas Fotos ({photos.length})
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {photos.slice(0, 6).map((photo, index) => (
                    <div key={photo.id || index} className="aspect-square relative">
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
                    </div>
                  ))}
                </div>
                {photos.length > 6 && (
                  <p className="text-xs text-white/60 mt-2 text-center">
                    +{photos.length - 6} fotos
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
