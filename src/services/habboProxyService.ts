
import { supabase } from '@/integrations/supabase/client';
import { HabboUser, HabboBadge, HabboPhoto, HabboFriend, TickerActivity, TickerResponse } from '@/types/habbo';

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

      let user: any = Array.isArray(data) ? data[0] : data;

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
        uniqueId: user.uniqueId || user.id || '',
        name: user.name || username,
        motto: user.motto || '',
        online: !!user.online,
        memberSince: user.memberSince || '',
        selectedBadges: user.selectedBadges || [],
        badges: user.badges || [],
        figureString: user.figureString || '',
        profileVisible: user.profileVisible ?? true,
        lastWebVisit: user.lastWebVisit,
        lastAccessTime: user.lastAccessTime,
        friendsCount: user.friendsCount || 0,
        roomsCount: user.roomsCount || 0,
        groupsCount: user.groupsCount || 0,
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
        }
      }

      return photosArray.map((photo: any) => ({
        id: photo.id || photo.photoId || String(Math.random()),
        url: photo.url || photo.photoUrl || photo.previewUrl || photo.imageUrl || photo.src || '',
        takenOn: photo.takenOn || photo.createdAt || photo.timestamp || new Date().toISOString(),
        likes_count: photo.likes_count || photo.likesCount || photo.likes || 0,
        room_name: photo.room_name || photo.roomName || photo.room || '',
        previewUrl: photo.previewUrl || photo.url,
        caption: photo.caption || `Foto de ${username}`,
        timestamp: photo.timestamp || photo.takenOn,
        roomId: photo.roomId,
        roomName: photo.room_name || photo.roomName,
        likesCount: photo.likes_count || photo.likesCount || 0,
        type: 'PHOTO'
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

      let friendsArray = [];
      if (Array.isArray(data)) {
        friendsArray = data;
      } else if (data && typeof data === 'object') {
        if (data.data && Array.isArray(data.data)) {
          friendsArray = data.data;
        } else if (data.friends && Array.isArray(data.friends)) {
          friendsArray = data.friends;
        }
      }

      return friendsArray.map((friend: any) => ({
        name: friend.name || friend.habboName || friend.username || '',
        figureString: friend.figureString || friend.figure || '',
        online: friend.online || false,
        uniqueId: friend.uniqueId || friend.id || friend.habboId || '',
        motto: friend.motto || '',
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
        return { activities: [], meta: { source: 'error', timestamp: new Date().toISOString(), count: 0, onlineCount: 0 } };
      }

      let activities: any[] = [];
      if (Array.isArray(data)) {
          activities = data;
      } else if (data && Array.isArray(data.activities)) {
          activities = data.activities;
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

      return data;
    } catch (error) {
      console.error(`Error ensuring tracking for ${payload.habbo_name}:`, error);
      return null;
    }
  }
}

export const habboProxyService = new HabboProxyService();
