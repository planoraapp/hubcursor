
interface HabboUser {
  name: string;
  motto: string;
  figureString: string;
  uniqueId: string;
  memberSince: string;
  profileVisible: boolean;
  lastWebAccess: string;
  selectedBadges: Array<{
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
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
  console.log(`🔍 [HabboAPI] Searching for user: ${username}`);
  
  for (const domain of HOTEL_DOMAINS) {
    try {
      const url = `https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`;
      console.log(`🌐 [HabboAPI] Trying ${domain}: ${url}`);
      
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
          console.log(`✅ [HabboAPI] Found ${username} on ${domain}`);
          return {
            ...data,
            uniqueId: data.uniqueId || `hh${domain.replace('.', '')}-${data.name.toLowerCase()}`
          };
        }
      } else if (response.status === 404) {
        console.log(`❌ [HabboAPI] User not found on ${domain}`);
      } else {
        console.log(`⚠️ [HabboAPI] HTTP ${response.status} on ${domain}`);
      }
    } catch (error) {
      console.log(`❌ [HabboAPI] Error on ${domain}:`, error);
      continue;
    }
  }

  console.log(`❌ [HabboAPI] User ${username} not found on any hotel`);
  return null;
};

export const getUserById = async (userId: string): Promise<HabboUser | null> => {
  console.log(`🔍 [HabboAPI] Searching for user by ID: ${userId}`);
  
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
          console.log(`✅ [HabboAPI] Found user by ID on ${domain}`);
          return {
            ...data,
            uniqueId: data.uniqueId || userId
          };
        }
      }
    } catch (error) {
      console.log(`❌ [HabboAPI] Error finding user by ID on ${domain}:`, error);
      continue;
    }
  }

  console.log(`❌ [HabboAPI] User with ID ${userId} not found on any hotel`);
  return null;
};

export const getAvatarUrl = (username: string, figureString?: string, hotel: string = 'com.br'): string => {
  // Normalize hotel domain
  let domain = hotel;
  if (hotel === 'br') domain = 'com.br';
  if (hotel === 'us') domain = 'com';
  
  const baseUrl = `https://www.habbo.${domain}`;
  
  if (figureString) {
    return `${baseUrl}/habbo-imaging/avatarimage?figure=${encodeURIComponent(figureString)}&direction=2&head_direction=2&size=l`;
  }
  
  return `${baseUrl}/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=2&head_direction=2&size=l`;
};
