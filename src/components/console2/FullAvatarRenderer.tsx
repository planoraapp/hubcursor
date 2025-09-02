import React from 'react';

interface FullAvatarRendererProps {
  username: string;
  figureString?: string;
  hotel?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FullAvatarRenderer: React.FC<FullAvatarRendererProps> = ({
  username,
  figureString,
  hotel = 'com.br',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    sm: { size: 's', width: 'w-16', height: 'h-20' },
    md: { size: 'm', width: 'w-20', height: 'h-24' },
    lg: { size: 'l', width: 'w-24', height: 'h-28' }
  };

  const { size: imageSize, width, height } = sizeMap[size];
  const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
  
  // Construir URL do avatar completo
  const avatarUrl = figureString 
    ? `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&size=${imageSize}&direction=2&head_direction=3`
    : `${baseUrl}/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&size=${imageSize}&direction=2&head_direction=3`;

  return (
    <div className={`${width} ${height} flex-shrink-0 ${className}`}>
      <img
        src={avatarUrl}
        alt={`Avatar completo de ${username}`}
        className="w-full h-full object-contain bg-transparent border-0"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Fallback para serviço alternativo
          target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${encodeURIComponent(username)}&size=${imageSize}&direction=2&head_direction=3`;
        }}
      />
    </div>
  );
};