
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User, LogIn } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { habboProxyService } from '@/services/habboProxyService';
import { Link } from 'react-router-dom';

export const MyAccountColumn: React.FC = () => {
  const { isLoggedIn, habboAccount, myProfile, photos, followers, following, isLoading, error } = useMyConsoleProfile();
  const [openProfileModal, setOpenProfileModal] = useState(false);

  if (!isLoggedIn) {
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
            <LogIn className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Conecte sua conta Habbo
            </h3>
            <p className="text-white/70 mb-4">
              Faça login para ver seu perfil e interagir com outros usuários
            </p>
            <Link to="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Conectar Conta Habbo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-[#5A6573] text-white border-0 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="w-20 h-20 bg-white/20 rounded-none mx-auto"></div>
              <div className="h-4 bg-white/20 rounded mx-auto w-3/4"></div>
              <div className="h-3 bg-white/20 rounded mx-auto w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !myProfile) {
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
            <div className="text-red-400 mb-4">
              <User className="w-16 h-16 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Erro ao carregar perfil
            </h3>
            <p className="text-white/70 mb-4">
              Não foi possível carregar os dados do perfil "{habboAccount?.habbo_name}"
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
            Perfil do Habbo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Top section with avatar and user info */}
          <div className="flex gap-4 mb-4">
            {/* Avatar on the left */}
            <Avatar 
              className="w-20 h-20 rounded-none border-0 bg-transparent cursor-pointer" 
              onClick={() => setOpenProfileModal(true)}
            >
              <AvatarImage 
                className="rounded-none"
                src={habboProxyService.getAvatarUrl(myProfile.figureString, 'l')} 
                alt={myProfile.name} 
              />
              <AvatarFallback className="text-lg font-bold rounded-none">
                {myProfile.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* User info on the right */}
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                {myProfile.name}
                <div className={`w-3 h-3 rounded-full ${myProfile.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </h3>
              
              {/* Counters line */}
              <div className="flex gap-4 text-sm mb-2">
                <button className="text-white/90 hover:text-white underline-offset-2 hover:underline cursor-pointer">
                  {photos.length} Fotos
                </button>
                <button className="text-white/90 hover:text-white underline-offset-2 hover:underline cursor-pointer">
                  {followers.length} Seguidores
                </button>
                <button className="text-white/90 hover:text-white underline-offset-2 hover:underline cursor-pointer">
                  {following.length} Seguindo
                </button>
              </div>
            </div>
          </div>

          {/* Motto */}
          <p className="text-white/90 italic mb-3">"{myProfile.motto}"</p>
          
          {/* Divider */}
          <div className="h-px bg-white/20 my-3" />

          {/* Photos grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-0">
              {photos.slice(0, 9).map((photo, index) => (
                <img 
                  key={index}
                  src={photo.url} 
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover rounded-none aspect-square"
                />
              ))}
            </div>
          )}

          {/* Selected Badges */}
          {myProfile.selectedBadges && myProfile.selectedBadges.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span>🏆</span>
                Emblemas Destacados
              </h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {myProfile.selectedBadges.slice(0, 6).map((badge, index) => (
                  <img 
                    key={index}
                    src={habboProxyService.getBadgeUrl(badge.code)} 
                    alt={badge.name}
                    className="w-8 h-8"
                    title={badge.name}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
