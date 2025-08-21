import React from 'react';
import { OptimizedBadgeImage } from '@/components/OptimizedBadgeImage';
import { useBadgeLookup } from '@/hooks/useBadgeLookup';
import { extractBadgeFromActivity } from '@/utils/badgeExtractor';

interface BadgeActivityRendererProps {
  activityText: string;
  className?: string;
}

export const BadgeActivityRenderer: React.FC<BadgeActivityRendererProps> = ({
  activityText,
  className = ''
}) => {
  const { findBadge } = useBadgeLookup();
  const activityInfo = extractBadgeFromActivity(activityText);

  if (!activityInfo.isBadgeActivity || !activityInfo.badgeName) {
    // Não é uma atividade de badge, renderizar normalmente
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-xs">✨</span>
        <span>{activityText}</span>
      </div>
    );
  }

  const badgeInfo = findBadge(activityInfo.badgeName);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {badgeInfo ? (
        <OptimizedBadgeImage
          code={badgeInfo.code}
          name={badgeInfo.name}
          size="sm"
          className="flex-shrink-0 !border-0 !bg-transparent"
          showFallback={true}
          priority={false}
        />
      ) : (
        <div className="w-8 h-8 bg-transparent flex items-center justify-center flex-shrink-0">
          <span className="text-xs">🏆</span>
        </div>
      )}
      <span className="flex-1">{activityText}</span>
    </div>
  );
};