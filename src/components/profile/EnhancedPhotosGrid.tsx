
import React from 'react';
import { Camera, ExternalLink, MapPin, Calendar, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HabboPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  takenOn?: string;
  likesCount?: number;
}

interface EnhancedPhotosGridProps {
  photos: HabboPhoto[];
  userName: string;
  hotel?: string;
  className?: string;
}

export const EnhancedPhotosGrid: React.FC<EnhancedPhotosGridProps> = ({ 
  photos, 
  userName, 
  hotel = 'com.br',
  className = '' 
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Nenhuma foto encontrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          As fotos podem não estar disponíveis publicamente
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`}>
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200"
        >
          {/* Imagem da foto */}
          <div className="aspect-square overflow-hidden">
            <img
              src={photo.url}
              alt={photo.caption || `Foto de ${userName}`}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/150x150/4B5563/FFFFFF?text=Foto+Não+Disponível`;
              }}
              loading="lazy"
            />
          </div>

          {/* Overlay com informações */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3">
            {/* Header com data e curtidas */}
            <div className="flex justify-between items-start">
              <div className="text-xs text-white/80">
                <div className="flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(photo.timestamp || photo.takenOn)}
                </div>
                {photo.likesCount !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                    <span>{photo.likesCount}</span>
                  </div>
                )}
              </div>
              
              {/* Botão para ver no Habbo */}
              <a
                href={`https://www.habbo.${hotel}/profile/${userName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 bg-blue-600/80 hover:bg-blue-600 rounded-full transition-colors"
                title="Ver perfil no Habbo"
              >
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </div>

            {/* Footer com informações da foto */}
            <div className="space-y-1">
              {/* Caption da foto */}
              {photo.caption && (
                <p className="text-xs text-white font-medium line-clamp-2">
                  {photo.caption}
                </p>
              )}
              
              {/* Nome do quarto */}
              {photo.roomName && (
                <div className="flex items-center gap-1 text-xs text-white/80">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{photo.roomName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
