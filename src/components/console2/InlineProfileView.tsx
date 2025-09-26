
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Users, Trophy } from 'lucide-react';
import { getAvatarUrl } from '@/services/habboApiMultiHotel';


interface InlineProfileViewProps {
  user: any;
  onBack: () => void;
}

export const InlineProfileView: React.FC<InlineProfileViewProps> = ({ user, onBack }) => {
  const avatarUrl = getAvatarUrl(user.name || user.habbo_name, user.figureString, user.hotel || 'br');
  
  // Função para formatar data no formato DD/MM/YYYY
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const memberSince = user.memberSince || user.created_at;
  const formattedDate = formatDate(memberSince);

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
        <div className="flex items-start gap-6">
          {/* Avatar à esquerda */}
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={`Avatar de ${user.name || user.habbo_name}`}
              className="h-32 w-auto object-contain bg-transparent"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/habbo-avatar-placeholder.png';
              }}
            />
            
            {/* Indicador de status online/offline - bolinha pixel art */}
            <div className="absolute bottom-2 right-2">
              <div 
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  user.online ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.8)'
                }}
              />
            </div>
          </div>
          
          {/* Nome e lema à direita do avatar */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl mb-1 truncate">{user.name || user.habbo_name}</h3>
            <p className="text-white/70 text-sm mb-2 truncate">{user.motto || 'Sem missão definida'}</p>
            
            <div className="flex gap-2 mb-3 flex-wrap">
              <Badge variant={user.online ? "default" : "secondary"} className="text-xs">
                {user.online ? '🟢 Online' : '🔴 Offline'}
              </Badge>
              <Badge variant="outline" className="text-xs bg-white/10 border-white/20 text-white">
                {(user.hotel || 'br').toUpperCase()}
              </Badge>
            </div>
            
            {/* Data de membro desde */}
            {memberSince && (
              <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                <Calendar className="w-3 h-3" />
                <span>Membro desde: {formattedDate}</span>
              </div>
            )}
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
