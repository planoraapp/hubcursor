import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfileInColumnProps {
  username: string;
  onBack: () => void;
}

export const UserProfileInColumn: React.FC<UserProfileInColumnProps> = ({
  username,
  onBack
}) => {
  const { habboUser, photos, avatarUrl, stats, isLoading } = useUserProfile(username);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium">Carregando perfil...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        </div>
      </div>
    );
  }

  if (!habboUser) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Button
            size="sm"
            variant="ghost"
            onClick={onBack}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-white font-medium">Perfil</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-white/60 mb-2">Usuário não encontrado</p>
            <Button size="sm" onClick={onBack} variant="outline" className="text-white border-white/20">
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-white font-medium">{habboUser?.habbo_name || username}</span>
      </div>

      {/* Profile content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent'}}>
        {/* Avatar and basic info */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-3">
            <AvatarImage src={avatarUrl} alt={habboUser?.habbo_name || username} />
            <AvatarFallback className="bg-white/20 text-white text-lg">
              {(habboUser?.habbo_name || username || '??').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold text-white mb-1">{habboUser?.habbo_name || username}</h2>
          
          {habboUser?.motto && (
            <p className="text-white/70 text-sm mb-3 italic">"{habboUser.motto}"</p>
          )}

          <div className="flex justify-center">
            <Badge 
              variant={habboUser?.is_online ? "default" : "secondary"}
              className={`text-xs ${habboUser?.is_online 
                ? "bg-green-500/20 text-green-300 border-green-500/30" 
                : "bg-white/10 text-white/60 border-white/20"
              }`}
            >
              {habboUser?.is_online ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{stats.photosCount}</div>
            <div className="text-xs text-white/60">Fotos</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{stats.badgesCount}</div>
            <div className="text-xs text-white/60">Emblemas</div>
          </div>
        </div>

        {/* Account info */}
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          <h3 className="font-semibold text-white text-sm">Informações da Conta</h3>
          
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Hotel:</span>
              <span className="text-white">{habboUser?.hotel?.toUpperCase() || 'BR'}</span>
            </div>
            
            {habboUser?.created_at && (
              <div className="flex justify-between">
                <span className="text-white/60">Membro desde:</span>
                <span className="text-white">
                  {formatDistanceToNow(new Date(habboUser.created_at), { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Photos */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-white text-sm">Fotos Recentes</h3>
            <div className="grid grid-cols-2 gap-2">
              {photos.slice(0, 4).map((photo, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-white/5">
                  <img
                    src={photo.url}
                    alt={`Foto de ${habboUser?.habbo_name || username}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};