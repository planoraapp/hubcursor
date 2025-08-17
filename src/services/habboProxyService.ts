import { getAvatarUrl, getBadgeUrl, getUserByName } from '@/lib/habboApi';
import { supabase } from '@/integrations/supabase/client';

export interface HabboUser {
  id: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  selectedBadges: HabboBadge[];
  badges: HabboBadge[];
  figureString: string;
  profileVisible?: boolean;
  lastWebVisit?: string;
  uniqueId?: string;
}

export interface HabboBadge {
  code: string;
  name: string;
  description: string;
}

export interface HabboFriend {
  name: string;
  figureString: string;
  online: boolean;
  uniqueId: string;
}

export interface HabboPhoto {
  id: string;
  url: string;
  takenOn?: string;
}

export interface TickerActivity {
  username: string;
  activity: string;
  timestamp: string;
  time: string;
  description?: string;
}

export interface TickerResponse {
  activities: TickerActivity[];
  meta: {
    source: string;
    timestamp: string;
    count: number;
    onlineCount: number;
  };
}

class HabboProxyService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = '';
  }

  private getHotelDomain(hotel: string): string {
    if (hotel === 'com.br' || hotel === 'br') {
      return 'com.br';
    }
    return hotel;
  }

  async getUserProfile(username: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    try {
      const domain = this.getHotelDomain(hotel);
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: {
          endpoint: `users?name=${encodeURIComponent(username)}`,
          hotel: domain,
        },
      });

      if (error || !data) {
        console.warn(`Failed to fetch profile for ${username}:`, error?.message || 'no data');
        return null;
      }

      console.log(`[HabboProxyService] Raw profile response for ${username}:`, data);

      // Normalize candidate from proxy
      let user: any = Array.isArray(data) ? data[0] : data;

      // If proxy returned an unexpected shape (e.g., ticker), try official API fallback
      if (!user || typeof user?.name !== 'string' || !(user?.uniqueId || user?.id)) {
        try {
          const resp = await fetch(`https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`, {
            headers: { 'Accept': 'application/json' },
          });
          if (resp.ok) {
            const ud = await resp.json();
            if (ud && typeof ud.name === 'string') {
              user = ud;
            }
          }
        } catch (fallbackErr) {
          console.warn('[HabboProxyService] Official users fallback failed:', fallbackErr);
        }
      }

      if (!user || typeof user?.name !== 'string') {
        console.warn(`[HabboProxyService] Unexpected profile shape for ${username}:`, data);
        return null;
      }

      return {
        id: user.uniqueId || user.id || '',
        name: user.name || username,
        motto: user.motto || '',
        online: !!user.online,
        memberSince: user.memberSince || '',
        selectedBadges: user.selectedBadges || [],
        badges: user.badges || [],
        figureString: user.figureString || '',
        profileVisible: user.profileVisible ?? true,
        lastWebVisit: user.lastWebVisit,
        uniqueId: user.uniqueId || user.id || '',
      };
    } catch (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      return null;
    }
  }

  async getUserByName(username: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    return this.getUserProfile(username, hotel);
  }

  async getUserBadges(username: string, hotel: string = 'com.br'): Promise<HabboBadge[]> {
    try {
      const domain = this.getHotelDomain(hotel);
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: {
          endpoint: `users/${encodeURIComponent(username)}/badges`,
          hotel: domain,
        },
      });

      if (error || !data) {
        console.warn(`Failed to fetch badges for ${username}:`, error?.message || 'no data');
        return [];
      }
      console.log(`[HabboProxyService] Raw badges response for ${username}:`, data);


      return (data as any[]).map(badge => ({
        code: badge.code,
        name: badge.name,
        description: badge.description,
      }));
    } catch (error) {
      console.error(`Error fetching badges for ${username}:`, error);
      return [];
    }
  }

  async getUserPhotos(username: string, hotel: string = 'com.br'): Promise<HabboPhoto[]> {
    try {
      const domain = this.getHotelDomain(hotel);
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: {
          endpoint: `users/${encodeURIComponent(username)}/photos`,
          hotel: domain,
        },
      });

      if (error || !data) {
        console.warn(`Failed to fetch photos for ${username}:`, error?.message || 'no data');
        return [];
      }
      console.log(`[HabboProxyService] Raw photos response for ${username}:`, data);


      // Handle different response formats including photos array
      let photosArray = [];
      if (Array.isArray(data)) {
        photosArray = data;
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          photosArray = data.data;
        } else if (data.photos && Array.isArray(data.photos)) {
          photosArray = data.photos;
        } else if (data.results && Array.isArray(data.results)) {
          photosArray = data.results;
        } else {
          // Check if data itself has photo properties
          const keys = Object.keys(data);
          for (const key of keys) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
              // Check if the array contains photo-like objects
              const firstItem = data[key][0];
              if (firstItem && (firstItem.url || firstItem.photoUrl || firstItem.src || firstItem.id)) {
                photosArray = data[key];
                break;
              }
            }
          }
        }
      }

      if (photosArray.length === 0) {
        console.warn(`[HabboProxyService] No photos found in response:`, data);
        return [];
      }

        return photosArray.map((photo: any) => ({
          id: photo.id || photo.photoId || String(Math.random()),
          url: photo.url || photo.photoUrl || photo.previewUrl || photo.thumbnailUrl || photo.imageUrl || photo.src || '',
          takenOn: photo.takenOn || photo.createdAt || photo.timestamp || new Date().toISOString(),
        })).filter(photo => photo.url);

    } catch (error) {
      console.error(`Error fetching photos for ${username}:`, error);
      return [];
    }
  }

  async getUserFriends(username: string, hotel: string = 'com.br'): Promise<HabboFriend[]> {
    try {
      const domain = this.getHotelDomain(hotel);
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: {
          endpoint: `users/${encodeURIComponent(username)}/friends`,
          hotel: domain,
        },
      });

      if (error || !data) {
        console.warn(`Failed to fetch friends for ${username}:`, error?.message || 'no data');
        return [];
      }

      console.log(`[HabboProxyService] Raw friends response for ${username}:`, data);


      // Handle different response formats including friends array
      let friendsArray = [];
      if (Array.isArray(data)) {
        friendsArray = data;
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          friendsArray = data.data;
        } else if (data.friends && Array.isArray(data.friends)) {
          friendsArray = data.friends;
        } else if (data.results && Array.isArray(data.results)) {
          friendsArray = data.results;
        } else {
          // Check if data itself has friend properties
          const keys = Object.keys(data);
          for (const key of keys) {
            if (Array.isArray(data[key]) && data[key].length > 0) {
              // Check if the array contains friend-like objects
              const firstItem = data[key][0];
              if (firstItem && (firstItem.name || firstItem.habboName || firstItem.username)) {
                friendsArray = data[key];
                break;
              }
            }
          }
        }
      }

      if (friendsArray.length === 0) {
        console.warn(`[HabboProxyService] No friends found in response:`, data);
        return [];
      }

      return friendsArray.map((friend: any) => ({
        name: friend.name || friend.habboName || friend.username || '',
        figureString: friend.figureString || friend.figure || '',
        online: friend.online || false,
        uniqueId: friend.uniqueId || friend.id || friend.habboId || '',
      })).filter(friend => friend.name);

    } catch (error) {
      console.error(`Error fetching friends for ${username}:`, error);
      return [];
    }
  }

  async getTicker(hotel: string = 'com.br'): Promise<TickerActivity[]> {
    const response = await this.getHotelTicker(hotel);
    return response.activities;
  }

  async getHotelTicker(hotel: string = 'com.br'): Promise<TickerResponse> {
    try {
      const domain = this.getHotelDomain(hotel);
      const { data, error } = await supabase.functions.invoke('habbo-widgets-proxy', {
        body: {
          endpoint: `community/ticker`,
          hotel: domain,
        },
      });

      if (error || !data) {
        console.warn(`Failed to fetch hotel ticker for ${hotel}:`, error?.message || 'no data');
        return { activities: [], meta: { source: 'error', timestamp: new Date().toISOString(), count: 0, onlineCount: 0 } };
      }

      console.log(`[HabboProxyService] Raw ticker response for ${hotel}:`, data);


      // Normalize activities array
      let activities: any[] = [];
      if (Array.isArray(data)) {
          activities = data;
      } else if (data && Array.isArray(data.activities)) {
          activities = data.activities;
      } else {
          console.warn(`[HabboProxyService] Unexpected ticker response format:`, data);
          return { activities: [], meta: { source: 'error', timestamp: new Date().toISOString(), count: 0, onlineCount: 0 } };
      }

      const tickerActivities = activities.map(item => ({
        username: item.habboName || item.username || 'Unknown',
        activity: item.activity || item.description || 'fez uma atividade',
        timestamp: item.timestamp || new Date().toISOString(),
        time: item.time || new Date().toISOString(),
        description: item.description || item.activity || 'fez uma atividade',
      }));

      return {
        activities: tickerActivities,
        meta: {
          source: 'proxy',
          timestamp: new Date().toISOString(),
          count: tickerActivities.length,
          onlineCount: 0,
        }
      };
    } catch (error) {
      console.error(`Error fetching hotel ticker for ${hotel}:`, error);
      return { activities: [], meta: { source: 'error', timestamp: new Date().toISOString(), count: 0, onlineCount: 0 } };
    }
  }

  getAvatarUrl(figureString: string, size: 'xs' | 's' | 'm' | 'l' = 'm', headOnly: boolean = false): string {
    const baseUrl = 'https://www.habbo.com.br/habbo-imaging/avatarimage';
    const params = new URLSearchParams({
      figure: figureString,
      size: size,
      direction: '2',
      head_direction: '3',
      gesture: 'sml',
    });

    if (headOnly) {
      params.append('headonly', '1');
    }

    return `${baseUrl}?${params.toString()}`;
  }

  getBadgeUrl(badgeCode: string): string {
    return `https://images.habbo.com/c_images/album1584/${badgeCode}.gif`;
  }

  async ensureTrackedAndSynced(payload: { habbo_name: string; habbo_id: string; hotel: string }): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('habbo-ensure-tracked', {
        body: payload,
      });

      if (error) {
        console.warn(`Failed to ensure tracking for ${payload.habbo_name}:`, error.message);
        return null;
      }

      console.log(`[HabboProxyService] Ensure tracked response for ${payload.habbo_name}:`, data);
      return data;
    } catch (error) {
      console.error(`Error ensuring tracking for ${payload.habbo_name}:`, error);
      return null;
    }
  }
}

export const habboProxyService = new HabboProxyService();
