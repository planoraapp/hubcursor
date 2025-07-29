
// src/lib/habboApi.js
const BASE_URL = 'https://www.habbo.com.br/api/public';
const CACHE_DURATION = 0; // Disabled for testing. Set to 5 * 60 * 1000 for production
const cache = new Map();

export async function getUserByName(username) {
  const cacheKey = `user-${username.toLowerCase()}`;
  
  if (CACHE_DURATION > 0 && cache.has(cacheKey) && (Date.now() - cache.get(cacheKey).timestamp < CACHE_DURATION)) {
    console.log('[habboApi Debug]: User data from cache:', username);
    return cache.get(cacheKey).data;
  }

  try {
    console.log(`[habboApi Debug]: Fetching user: ${username} from ${BASE_URL}/users?name=${username}`);
    const response = await fetch(`${BASE_URL}/users?name=${username}`);

    if (!response.ok) {
      console.warn(`[habboApi Debug]: API responded with status ${response.status} for user ${username}`);
      return null;
    }

    const data = await response.json();
    console.log('[habboApi Debug]: Raw API response data:', data);

    if (Array.isArray(data) && data.length > 0) {
      const user = data[0];
      const motto = user.motto ? String(user.motto).trim() : '';
      const online = user.online === true;

      const userToCache = {
        id: user.uniqueId || user.id,
        name: user.name,
        motto: motto,
        online: online,
        memberSince: user.memberSince,
        selectedBadges: Array.isArray(user.selectedBadges) ? user.selectedBadges : [],
        badges: Array.isArray(user.badges) ? user.badges : [],
        figureString: user.figureString || '',
      };

      console.log('[habboApi Debug]: Processed user data:', userToCache);

      if (CACHE_DURATION > 0) {
        cache.set(cacheKey, { data: userToCache, timestamp: Date.now() });
      }
      
      return userToCache;
    } else if (data && data.error) {
      console.warn('[habboApi Debug]: API returned a specific error object:', data.error);
      return null;
    } else {
      console.warn('[habboApi Debug]: API returned unexpected empty or non-array data for user:', username, data);
      return null;
    }
  } catch (error) {
    console.error(`[habboApi Debug]: Error fetching user '${username}':`, error);
    return null;
  }
}

export function getAvatarUrl(username) {
  return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&direction=2&head_direction=2&gesture=sml&size=m&action=std`;
}

export function getBadgeUrl(badgeCode) {
  return `https://www.habbo.com.br/habbo-imaging/badge/b_${badgeCode}.gif`;
}
