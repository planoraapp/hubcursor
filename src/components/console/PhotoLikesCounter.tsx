import React from 'react';
import { Heart } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';

interface PhotoLikesCounterProps {
  photoId: string;
  className?: string;
  showIcon?: boolean;
}

/**
 * Componente reutilizável para exibir a contagem de likes de uma foto.
 * Busca os likes diretamente do banco de dados usando o photo_id.
 * 
 * Pode ser usado em:
 * - Grid de fotos (hover)
 * - Feed de amigos
 * - Página individual da foto
 * - Qualquer outro lugar onde fotos são exibidas
 */
export const PhotoLikesCounter: React.FC<PhotoLikesCounterProps> = ({
  photoId,
  className = '',
  showIcon = true
}) => {
  const { likesCount, likesLoading } = usePhotoLikes(photoId);

  if (likesLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <Heart className="w-3 h-3" />}
        <span className="text-xs">...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <Heart className="w-3 h-3" />}
      <span className="text-xs">{likesCount}</span>
    </div>
  );
};

