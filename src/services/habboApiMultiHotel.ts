import type { HabboUser } from '@/types/habbo';

>;
}

const HOTEL_DOMAINS = [
  'com.br', // Brazil
  'com',    // International/US
  'es',     // Spain
  'fr',     // France
  'de',     // Germany
  'it',     // Italy
  'nl',     // Netherlands
  'fi',     // Finland
  'tr'      // Turkey
];

export const getUserByName = async (username: string): Promise<HabboUser | null> => {
    for (const domain of HOTEL_DOMAINS) {
    try {
      const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`;
            const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
                    return {
            ...data,
            uniqueId: data.uniqueId || `hh${domain.replace('.', '')}-${data.name.toLowerCase()}`,
            // Garantir que memberSince está presente com dados reais da API
            memberSince: data.memberSince || data.registeredDate || '2006-01-01T00:00:00.000+0000'
          };
        }
      } else if (response.status === 404) {
              } else {
              }
    } catch (error) {
            continue;
    }
  }

    return null;
};

export const getUserById = async (userId: string): Promise<HabboUser | null> => {
    for (const domain of HOTEL_DOMAINS) {
    try {
      const url = `https://www.habbo.${domain}/api/public/users/${encodeURIComponent(userId)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HabboHub/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
                    return {
            ...data,
            uniqueId: data.uniqueId || userId
          };
        }
      }
    } catch (error) {
            continue;
    }
  }

    return null;
};

export const getAvatarUrl = (username: string, figureString?: string, hotel: string = 'com.br'): string => {
  // Normalize hotel domain
  let domain = hotel;
  if (hotel === 'br') domain = 'com.br';
  if (hotel === 'us') domain = 'com';
  
  const baseUrl = `https://www.habbo.${domain}`;
  
  if (figureString) {
    // Alterando para direção 3,3 (diagonal direita e frente)
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=3&head_direction=3&size=l`;
  }
  
  return `${baseUrl}/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=3&head_direction=3&size=l`;
};
