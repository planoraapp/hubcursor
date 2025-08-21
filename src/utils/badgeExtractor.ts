interface BadgeActivityInfo {
  isBadgeActivity: boolean;
  badgeName?: string;
  activityType: string;
  originalText: string;
}

export const extractBadgeFromActivity = (activityText: string): BadgeActivityInfo => {
  const text = activityText.toLowerCase().trim();
  
  // Regex patterns expandidos para detectar atividades de badge
  const badgePatterns = [
    /conquistou o emblema (.+)/i,
    /ganhou o badge (.+)/i,
    /recebeu o emblema (.+)/i,
    /obteve o badge (.+)/i,
    /earned badge (.+)/i,
    /received badge (.+)/i,
    /won badge (.+)/i,
    /got badge (.+)/i,
    /achieved badge (.+)/i,
    /unlocked badge (.+)/i,
    /earned (.+) badge/i,
    /got (.+) badge/i
  ];

  for (const pattern of badgePatterns) {
    const match = activityText.match(pattern);
    if (match && match[1]) {
      return {
        isBadgeActivity: true,
        badgeName: match[1].trim(),
        activityType: 'badge',
        originalText: activityText
      };
    }
  }

  // Se não encontrou padrão de badge, categorizar outros tipos
  let activityType = 'general';
  
  if (text.includes('mudou o lema') || text.includes('motto')) {
    activityType = 'motto_change';
  } else if (text.includes('mudou o visual') || text.includes('look')) {
    activityType = 'look_change';
  } else if (text.includes('adicionou') && text.includes('amigo')) {
    activityType = 'friend_added';
  } else if (text.includes('entrou') || text.includes('visitou')) {
    activityType = 'room_visited';
  } else if (text.includes('foto') || text.includes('photo')) {
    activityType = 'photo_uploaded';
  }

  return {
    isBadgeActivity: false,
    activityType,
    originalText: activityText
  };
};