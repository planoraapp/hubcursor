
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { getAvatarUrl } from '@/services/habboApiMultiHotel';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InlineProfileViewProps {
  user: any;
  onBack: () => void;
}

export const InlineProfileView: React.FC<InlineProfileViewProps> = ({ user, onBack }) => {
  const avatarUrl = getAvatarUrl(user.name || user.habbo_name, user.figureString, user.hotel || 'br');
  
  const memberSince = user.memberSince || user.created_at;
  const formattedDate = memberSince ? 
    formatDistanceToNow(new Date(memberSince), { addSuffix: true, locale: ptBR }) : 
    'Data não disponível';

  return (
    <Card className="bg-[#5A6573] text-white border-0 shadow-none h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/10 p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <CardTitle className="text-lg">Perfil Detalhado</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Avatar e informações básicas */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-3">
            <img
              src={avatarUrl}
              alt={`Avatar de ${user.name || user.habbo_name}`}
              className="w-full h-full object-contain bg-transparent"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/habbo-avatar-placeholder.png';
              }}
            />
          </div>
          
          <h3 className="font-bold text-xl mb-1">{user.name || user.habbo_name}</h3>
          <p className="text-white/70 text-sm mb-2">{user.motto || 'Sem missão definida'}</p>
          
          <div className="flex justify-center gap-2 mb-3">
            <Badge variant={user.online ? "default" : "secondary"} className="text-xs">
              {user.online ? '🟢 Online' : '🔴 Offline'}
            </Badge>
            <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
              {(user.hotel || 'br').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <Calendar className="w-4 h-4 mx-auto mb-1 text-white/70" />
            <p className="text-xs text-white/70">Membro desde</p>
            <p className="text-sm font-semibold">{formattedDate}</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <Trophy className="w-4 h-4 mx-auto mb-1 text-white/70" />
            <p className="text-xs text-white/70">Emblemas</p>
            <p className="text-sm font-semibold">{user.totalBadges || user.selectedBadges?.length || 0}</p>
          </div>
        </div>

        {/* Emblemas selecionados */}
        {user.selectedBadges && user.selectedBadges.length > 0 && (
          <div className="bg-white/10 rounded-lg p-3">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Emblemas Favoritos
            </h4>
            <div className="flex flex-wrap gap-1 justify-center">
              {user.selectedBadges.slice(0, 8).map((badge: any, index: number) => (
                <img
                  key={index}
                  src={`https://images.habbo.com/c_images/album1584/${badge.code}.gif`}
                  alt={badge.name}
                  className="w-6 h-6"
                  title={badge.name || badge.code}
                  style={{ imageRendering: 'pixelated' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="space-y-2 text-sm">
          {user.currentRoom && (
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="w-3 h-3" />
              <span>No quarto: {user.currentRoom}</span>
            </div>
          )}
          
          {user.friendsCount && (
            <div className="flex items-center gap-2 text-white/70">
              <Users className="w-3 h-3" />
              <span>{user.friendsCount} amigos</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
