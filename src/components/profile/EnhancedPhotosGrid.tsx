
import React, { useState } from 'react';
import { Camera, ExternalLink, MapPin, Calendar, Heart } from 'lucide-react';
import { PhotoModal } from './PhotoModal';
import { useI18n } from '@/contexts/I18nContext';

interface HabboPhoto {
  id: string;
  url: string;
  previewUrl?: string;
  caption?: string;
  timestamp?: string;
  roomId?: string;
  roomName?: string;
  likesCount?: number;
  type?: string;
}

interface EnhancedPhotosGridProps {
  photos: HabboPhoto[];
  userName: string;
  hotel?: string;
  className?: string;
  isProfilePrivate?: boolean;
}

export const EnhancedPhotosGrid: React.FC<EnhancedPhotosGridProps> = ({ 
  photos, 
  userName, 
  hotel = 'com.br',
  className = '',
  isProfilePrivate = false
}) => {
  const { t } = useI18n();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

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

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleModalClose = () => {
    setSelectedPhotoIndex(null);
  };

  const handlePrevious = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  if (!photos || photos.length === 0) {
    // Se for perfil privado, mostrar ícone de cadeado
    if (isProfilePrivate) {
      return (
        <div className={`text-center py-12 ${className}`}>
          <img 
            src="/assets/console/locked.png" 
            alt="Perfil privado"
            className="w-auto h-auto mx-auto mb-3"
            style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
          />
          <p className="text-muted-foreground font-medium">{t('pages.console.noPhotos')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Este usuário tem o perfil privado
          </p>
        </div>
      );
    }
    
    return (
      <div className={`text-center py-8 ${className}`}>
        <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">{t('pages.console.noPhotos')}</p>
        <p className="text-sm text-muted-foreground mt-1">
          As fotos podem não estar disponíveis publicamente
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-3 gap-3 ${className}`}>
        {photos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer aspect-square"
            onClick={() => handlePhotoClick(index)}
          >
            {/* Imagem da foto */}
            <div className="w-full h-full overflow-hidden">
              <img
                src={photo.previewUrl || photo.url}
                alt={photo.caption || `Foto de ${userName}`}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/150x150/4B5563/FFFFFF?text=Foto+Não+Disponível`;
                }}
                loading="lazy"
              />
            </div>

            {/* Overlay com informações */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
              {/* Header com data */}
              <div className="flex justify-between items-start">
                <div className="text-xs text-white/80">
                  {photo.timestamp && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(photo.timestamp)}
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3 text-white" />
                </a>
              </div>

              {/* Footer com informações da foto */}
              <div className="space-y-1">
                {/* Nome do quarto */}
                {photo.roomName && (
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{photo.roomName}</span>
                  </div>
                )}
                
                {/* Curtidas */}
                {photo.likesCount !== undefined && photo.likesCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-white/80">
                    <Heart className="w-3 h-3 fill-red-500 text-red-500 flex-shrink-0" />
                    <span>{photo.likesCount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Click indicator */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="bg-white/20 rounded-full p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <PhotoModal
          isOpen={selectedPhotoIndex !== null}
          onClose={handleModalClose}
          photos={photos}
          currentPhotoIndex={selectedPhotoIndex}
          userName={userName}
          hotel={hotel}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </>
  );
};
