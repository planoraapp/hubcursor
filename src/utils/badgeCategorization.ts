
// Sistema de categorização automática de emblemas por prefixos e padrões
export interface BadgeCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'official',
    name: 'Oficiais',
    icon: '🛡️',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    description: 'Emblemas de staff, moderadores e administração'
  },
  {
    id: 'achievements', 
    name: 'Conquistas',
    icon: '🏆',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    description: 'Emblemas de jogos, achievements e vitórias'
  },
  {
    id: 'fansites',
    name: 'Fã-sites',
    icon: '🌟',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    description: 'Emblemas de sites parceiros e eventos especiais'
  },
  {
    id: 'others',
    name: 'Outros',
    icon: '🎨',
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    description: 'Emblemas diversos e sazonais'
  }
];

// Prefixos e padrões para categorização automática
const CATEGORIZATION_RULES = {
  official: [
    'ADM', 'MOD', 'STAFF', 'VIP', 'SUP', 'GUIDE', 'HELPER', 
    'ADMIN', 'MODERATOR', 'SUPERVISOR', 'AMBASSADOR'
  ],
  achievements: [
    'ACH', 'GAME', 'WIN', 'VICTORY', 'CHAMPION', 'WINNER',
    'QUEST', 'MISSION', 'COMPLETE', 'FINISH', 'SUCCESS'
  ],
  fansites: [
    'FANSITE', 'PARTNER', 'EVENT', 'SPECIAL', 'EXCLUSIVE',
    'LIMITED', 'PROMO', 'COLLAB', 'COLLABORATION'
  ]
};

export const categorizeBadge = (code: string, name: string): string => {
  const upperCode = code.toUpperCase();
  const upperName = name.toUpperCase();
  
  // Verificar emblemas oficiais
  for (const prefix of CATEGORIZATION_RULES.official) {
    if (upperCode.includes(prefix) || upperName.includes(prefix)) {
      return 'official';
    }
  }
  
  // Verificar conquistas
  for (const prefix of CATEGORIZATION_RULES.achievements) {
    if (upperCode.includes(prefix) || upperName.includes(prefix)) {
      return 'achievements';
    }
  }
  
  // Verificar fã-sites
  for (const prefix of CATEGORIZATION_RULES.fansites) {
    if (upperCode.includes(prefix) || upperName.includes(prefix)) {
      return 'fansites';
    }
  }
  
  // Padrões adicionais baseados em características
  
  // Emblemas com números sequenciais são geralmente achievements
  if (/^[A-Z]{2,5}\d{2,4}$/.test(upperCode)) {
    return 'achievements';
  }
  
  // Emblemas com anos são frequentemente eventos ou fansites
  if (/20\d{2}/.test(upperCode) || /20\d{2}/.test(upperName)) {
    return 'fansites';
  }
  
  // Caso contrário, categorizar como "outros"
  return 'others';
};

export const groupBadgesByCategory = (badges: any[]) => {
  const grouped = {
    official: [] as any[],
    achievements: [] as any[],
    fansites: [] as any[],
    others: [] as any[]
  };
  
  badges.forEach(badge => {
    const category = categorizeBadge(badge.code, badge.name);
    grouped[category as keyof typeof grouped].push(badge);
  });
  
  return grouped;
};
