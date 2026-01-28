import React from 'react';
import { MessageCircle } from 'lucide-react';
import { usePhotoComments } from '@/hooks/usePhotoComments';

interface PhotoCommentsCounterProps {
  photoId: string;
  className?: string;
  showIcon?: boolean;
  iconClassName?: string;
  textClassName?: string;
}

/**
 * Componente reutilizável para exibir a contagem de comentários de uma foto.
 * Busca os comentários diretamente do banco de dados usando o photo_id.
 * 
 * Pode ser usado em:
 * - Grid de fotos (hover)
 * - Feed de amigos
 * - Página individual da foto
 * - Qualquer outro lugar onde fotos são exibidas
 */
export const PhotoCommentsCounter: React.FC<PhotoCommentsCounterProps> = ({
  photoId,
  className = '',
  showIcon = true,
  iconClassName = 'w-3 h-3',
  textClassName = 'text-xs'
}) => {
  const { comments, commentsLoading } = usePhotoComments(photoId);

  if (commentsLoading) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && <MessageCircle className={iconClassName} />}
        <span className={textClassName}>...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <MessageCircle className={iconClassName} />}
      <span className={textClassName}>{comments.length}</span>
    </div>
  );
};

