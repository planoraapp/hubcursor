
// src/lib/habboApi.js
const BASE_URL = 'https://www.habbo.com.br/api/public';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const cache = new Map();

export async function getUserByName(username) {
  const cacheKey = `user-${username.toLowerCase()}`;
  
  if (CACHE_DURATION > 0 && cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
    console.log('[habboApi Debug]: User data from cache:', username);
    return cache.get(cacheKey).data;
  }

  try {
    console.log(`[habboApi Debug]: Fetching user: ${username} from ${BASE_URL}/users?name=${username}`);
    const response = await fetch(`${BASE_URL}/users?name=${encodeURIComponent(username)}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HabboHub/1.0'
      }
    });

    if (!response.ok) {
      console.warn(`[habboApi Debug]: API responded with status ${response.status} for user ${username}`);
      
      if (response.status === 404) {
        console.warn(`[habboApi Debug]: User not found (404): ${username}`);
        return null;
      }
      
      if (response.status === 403) {
        console.warn(`[habboApi Debug]: Private profile (403): ${username}`);
        return null;
      }
      
      return null;
    }

    const data = await response.json();
    console.log('[habboApi Debug]: Raw API response data:', data);

    if (!data) {
      console.warn('[habboApi Debug]: No data returned from API');
      return null;
    }

    // Handle both array and object responses
    let user;
    if (Array.isArray(data)) {
      if (data.length === 0) {
        console.warn('[habboApi Debug]: Empty array returned - user not found:', username);
        return null;
      }
      user = data[0];
    } else {
      user = data;
    }

    if (!user || !user.name) {
      console.warn('[habboApi Debug]: Invalid user data structure:', user);
      return null;
    }

    // Check if profile is private
    if (user.profileVisible === false) {
      console.warn('[habboApi Debug]: User profile is private:', username);
      return null;
    }

    const motto = user.motto ? String(user.motto).trim() : '';
    const online = user.online === true;

    const userToCache = {
      id: user.uniqueId || user.id,
      name: user.name,
      motto: motto,
      online: online,
      memberSince: user.memberSince || new Date().toISOString(),
      selectedBadges: Array.isArray(user.selectedBadges) ? user.selectedBadges : [],
      badges: Array.isArray(user.badges) ? user.badges : [],
      figureString: user.figureString || '',
    };

    console.log('[habboApi Debug]: Processed user data:', userToCache);

    if (CACHE_DURATION > 0) {
      cache.set(cacheKey, { data: userToCache, timestamp: Date.now() });
    }
    
    return userToCache;
  } catch (error) {
    console.error(`[habboApi Debug]: Error fetching user '${username}':`, error);
    
    // Return basic fallback data
    return {
      id: `fallback-${Date.now()}`,
      name: username,
      motto: 'Perfil temporariamente indisponível',
      online: false,
      memberSince: new Date().toISOString(),
      selectedBadges: [],
      badges: [],
      figureString: ''
    };
  }
}

export function getAvatarUrl(username, figureString) {
  if (figureString) {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&gesture=sml&size=m&action=std`;
  }
  return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=2&head_direction=2&gesture=sml&size=m&action=std`;
}

// Função para gerar URL do emblema - FIXED
export function getBadgeUrl(badgeCode) {
  return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
}
