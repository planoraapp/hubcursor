
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface Photo {
  id: string;
  url: string;
  takenOn?: string;
}

interface ProfilePhotosProps {
  photos: Photo[];
  habboName: string;
}

export const ProfilePhotos: React.FC<ProfilePhotosProps> = ({ photos, habboName }) => {
  const { t } = useI18n();
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Fotos de {habboName} ({photos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {photos.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {photos.map((photo) => (
              <a 
                key={photo.id} 
                href={photo.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block group"
              >
                <img
                  src={photo.url}
                  alt={`Foto de ${habboName}`}
                  className="aspect-square object-cover w-full h-full bg-gray-100 group-hover:opacity-90 transition-opacity rounded"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t('pages.console.noPhotos')}</p>
            <p className="text-sm mt-2">Fotos não disponíveis publicamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
