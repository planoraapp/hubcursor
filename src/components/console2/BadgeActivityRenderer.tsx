import React from 'react';
import { OptimizedBadgeImage } from '@/components/OptimizedBadgeImage';
import { useBadgeLookup } from '@/hooks/useBadgeLookup';
import { extractBadgeFromActivity } from '@/utils/badgeExtractor';
import { FullAvatarRenderer } from './FullAvatarRenderer';

interface BadgeActivityRendererProps {
  activityText: string;
  className?: string;
  username?: string;
  figureString?: string;
  hotel?: string;
}

export const BadgeActivityRenderer: React.FC<BadgeActivityRendererProps> = ({
  activityText,
  className = '',
  username,
  figureString,
  hotel
}) => {
  const { findBadge } = useBadgeLookup();
  const activityInfo = extractBadgeFromActivity(activityText);

  // Detectar tipo de atividade
  const isVisualChange = activityText.toLowerCase().includes('mudou o visual');
  const isMottoChange = activityText.toLowerCase().includes('mudou o lema') || activityText.toLowerCase().includes('mudou a missão');

  // Renderizar mudança visual com avatar completo
  if (isVisualChange && username) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <FullAvatarRenderer 
          username={username}
          figureString={figureString}
          hotel={hotel}
          size="sm"
        />
        <span className="flex-1">{activityText}</span>
      </div>
    );
  }

  // Renderizar mudança de motto destacada
  if (isMottoChange) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm">💬</span>
        <span className="flex-1">{activityText}</span>
      </div>
    );
  }

  // Renderizar atividade de badge
  if (activityInfo.isBadgeActivity && activityInfo.badgeName) {
    const badgeInfo = findBadge(activityInfo.badgeName);

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {badgeInfo ? (
          <OptimizedBadgeImage
            code={badgeInfo.code}
            name={badgeInfo.name}
            size="sm"
            className="flex-shrink-0 !border-0 !bg-transparent !shadow-none !ring-0 !outline-0 !rounded-none opacity-100"
            showFallback={true}
            priority={false}
          />
        ) : (
          <div className="w-6 h-6 bg-transparent border-0 shadow-none flex items-center justify-center flex-shrink-0">
            <span className="text-sm opacity-80">🏆</span>
          </div>
        )}
        <span className="flex-1">{activityText}</span>
      </div>
    );
  }

  // Atividade genérica
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm">✨</span>
      <span className="flex-1">{activityText}</span>
    </div>
  );
};