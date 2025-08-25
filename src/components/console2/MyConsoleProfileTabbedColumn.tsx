
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Loader2, User, Settings, Trophy, Users, Home, Crown } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { CountryFlag } from '@/components/shared/CountryFlag';

export const MyConsoleProfileTabbedColumn: React.FC = () => {
  const { habboAccount } = useUnifiedAuth();
  const [isLoading] = React.useState(false);

  const handleRefresh = () => {
    console.log('[👤 PROFILE] Atualizando meu perfil...');
  };

  const getAvatarUrl = (habboName: string, hotel: string = 'br') => {
    const domain = hotel === 'br' ? 'com.br' : hotel;
    return `https://www.habbo.${domain}/habbo-imaging/avatarimage?user=${habboName}&size=l&direction=2&head_direction=3&action=std`;
  };

  if (!habboAccount) {
    return (
      <Card className="bg-black/40 text-white border-white/20 shadow-none h-full flex flex-col backdrop-blur-sm">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Faça login para ver seu perfil</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 text-white border-white/20 shadow-none h-full flex flex-col backdrop-blur-sm">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white volter-font">Meu Perfil</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto space-y-4" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        {/* Avatar and Basic Info */}
        <div className="flex items-start space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={getAvatarUrl(habboAccount.habbo_name, habboAccount.hotel)}
              alt={`Avatar de ${habboAccount.habbo_name}`}
              className="w-24 h-32 object-contain"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black/40 rounded-full"></div>
            <div className="absolute bottom-1 right-1">
              <CountryFlag hotel={habboAccount.hotel} />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 pt-2">
            <h3 className="text-xl font-bold text-white truncate volter-font">{habboAccount.habbo_name}</h3>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mt-2">
              Online
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-black/40 border border-white/20">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">--</div>
              <div className="text-xs text-white/60">Emblemas</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-black/40 border border-white/20">
            <Home className="h-5 w-5 text-green-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">--</div>
              <div className="text-xs text-white/60">Quartos</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-black/40 border border-white/20">
            <Users className="h-5 w-5 text-pink-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">--</div>
              <div className="text-xs text-white/60">Amigos</div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-black/40 border border-white/20">
            <Crown className="h-5 w-5 text-purple-400" />
            <div className="text-center">
              <div className="text-sm font-medium text-white">--</div>
              <div className="text-xs text-white/60">Grupos</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full bg-black/40 border border-white/20 text-white hover:bg-white/10 hover:text-white"
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurações do Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
