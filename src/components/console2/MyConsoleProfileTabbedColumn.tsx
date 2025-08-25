import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, User, Star, Users, Trophy, Home } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const MyConsoleProfileTabbedColumn: React.FC = () => {
  const { habboAccount } = useUnifiedAuth();

  const getAvatarUrl = (habboName: string, hotel: string = 'br') => {
    const domain = hotel === 'br' ? 'com.br' : hotel;
    return `https://www.habbo.${domain}/habbo-imaging/avatarimage?user=${habboName}&size=l&direction=2&head_direction=3&action=std`;
  };

  const mockStats = [
    { label: 'Emblemas', value: '24', icon: Trophy },
    { label: 'Amigos', value: '156', icon: Users },
    { label: 'Fotos', value: '8', icon: Star },
    { label: 'Quartos', value: '3', icon: Home }
  ];

  if (!habboAccount) {
    return (
      <Card className="bg-black/40 text-white border-white/20 shadow-none h-full flex flex-col backdrop-blur-sm">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">Faça login para ver seu perfil</p>
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
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 overflow-y-auto" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <img
              src={getAvatarUrl(habboAccount.habbo_name, habboAccount.hotel)}
              alt={`Avatar de ${habboAccount.habbo_name}`}
              className="w-20 h-20 mx-auto mb-3 bg-white/10 rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/habbo-avatar-placeholder.png';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-black/40"></div>
          </div>
          
          <h3 className="text-xl font-bold text-white mb-1 volter-font">
            {habboAccount.habbo_name}
          </h3>
          
          {habboAccount.motto && (
            <p className="text-sm text-white/70 italic mb-3">
              "{habboAccount.motto}"
            </p>
          )}
          
          <div className="inline-flex items-center space-x-1 bg-white/10 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-white/80">Online</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {mockStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/5 rounded-lg p-3 border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <IconComponent className="w-5 h-5 text-white/60 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/60">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white/80 mb-3">Ações Rápidas</h4>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-3" />
            Configurações do Perfil
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
          >
            <Star className="w-4 h-4 mr-3" />
            Minhas Fotos
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
          >
            <Users className="w-4 h-4 mr-3" />
            Gerenciar Amigos
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
          >
            <Home className="w-4 h-4 mr-3" />
            Minha Habbo Home
          </Button>
        </div>

        <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
          <h4 className="text-sm font-semibold text-white/80 mb-2">Status do Console</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Hotel:</span>
              <span className="text-white/80">{habboAccount.hotel.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">ID:</span>
              <span className="text-white/80 font-mono">{habboAccount.habbo_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Sistema:</span>
              <span className="text-green-400">Ativo</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};