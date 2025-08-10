
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Heart, MessageCircle, Users, LogIn } from 'lucide-react';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { habboProxyService } from '@/services/habboProxyService';
import { Link } from 'react-router-dom';

export const MyAccountColumn: React.FC = () => {
  const { isLoggedIn, habboAccount, myProfile, myLikes, myComments, myFollows, isLoading, error } = useMyConsoleProfile();

  if (!isLoggedIn) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <LogIn className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Conecte sua conta Habbo
            </h3>
            <p className="text-gray-500 mb-4">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mx-auto w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !myProfile) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Minha Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <User className="w-16 h-16 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Erro ao carregar perfil
            </h3>
            <p className="text-gray-500 mb-4">
              Não foi possível carregar os dados do perfil "{habboAccount?.habbo_name}"
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Minha Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-gray-200">
              <AvatarImage 
                src={habboProxyService.getAvatarUrl(myProfile.figureString, 'l')} 
                alt={myProfile.name} 
              />
              <AvatarFallback className="text-lg font-bold">
                {myProfile.name[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-bold flex items-center justify-center gap-2 mb-2">
              {myProfile.name}
              <div className={`w-3 h-3 rounded-full ${myProfile.online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            </h3>
            
            <p className="text-gray-600 italic mb-4">"{myProfile.motto}"</p>
            
            <div className="flex justify-center items-center gap-4 text-sm text-gray-500 mb-4">
              <span>Desde {myProfile.memberSince}</span>
              <span>•</span>
              <span>{myProfile.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-500 mb-1">
                <Heart className="w-4 h-4" />
                <span className="font-semibold">{myLikes.length}</span>
              </div>
              <p className="text-xs text-gray-600">Curtidas</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">{myComments.length}</span>
              </div>
              <p className="text-xs text-gray-600">Comentários</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <Users className="w-4 h-4" />
                <span className="font-semibold">{myFollows.length}</span>
              </div>
              <p className="text-xs text-gray-600">Seguidores</p>
            </div>
          </div>

          {/* Selected Badges */}
          {myProfile.selectedBadges && myProfile.selectedBadges.length > 0 && (
            <div>
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
