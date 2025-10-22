
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Heart, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { PhotoModal } from './PhotoModal';
import { HabboPhotoEnhanced } from '@/hooks/useHabboPhotosEnhanced';
import { useI18n } from '@/contexts/I18nContext';

interface PhotoFeedProps {
  photos: HabboPhotoEnhanced[];
  userName: string;
  hotel?: string;
  className?: string;
}

export const PhotoFeed: React.FC<PhotoFeedProps> = ({ 
  photos, 
  userName, 
  hotel = 'br',
  className = '' 
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

  // Convert HabboPhotoEnhanced to PhotoModal format
  const modalPhotos = photos.map(photo => ({
    id: photo.photo_id,
    url: photo.s3_url,
    previewUrl: photo.preview_url || photo.s3_url,
    caption: photo.caption,
    timestamp: photo.taken_date,
    roomName: photo.room_name,
    likesCount: photo.likes_count,
    type: photo.photo_type
  }));

  if (!photos || photos.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotos de {userName} (0)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">{t('pages.console.noPhotos')}</p>
          <p className="text-sm text-muted-foreground mt-1">
            As fotos podem não estar disponíveis publicamente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Fotos de {userName} ({photos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="group relative bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer aspect-square"
                onClick={() => handlePhotoClick(index)}
              >
                {/* Imagem da foto */}
                <div className="w-full h-full overflow-hidden">
                  <img
                    src={photo.preview_url || photo.s3_url}
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
                      {photo.taken_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(photo.taken_date)}
                        </div>
                      )}
                    </div>
                    
                    {/* Botão para ver no Habbo */}
                    <a
                      href={`https://www.habbo.${hotel === 'br' ? 'com.br' : hotel}/profile/${userName}`}
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
                    {photo.room_name && (
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{photo.room_name}</span>
                      </div>
                    )}
                    
                    {/* Curtidas */}
                    {photo.likes_count > 0 && (
                      <div className="flex items-center gap-1 text-xs text-white/80">
                        <Heart className="w-3 h-3 fill-red-500 text-red-500 flex-shrink-0" />
                        <span>{photo.likes_count}</span>
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
        </CardContent>
      </Card>

      {/* Photo Modal */}
      {selectedPhotoIndex !== null && (
        <PhotoModal
          isOpen={selectedPhotoIndex !== null}
          onClose={handleModalClose}
          photos={modalPhotos}
          currentPhotoIndex={selectedPhotoIndex}
          userName={userName}
          hotel={hotel === 'br' ? 'com.br' : hotel}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      )}
    </>
  );
};
