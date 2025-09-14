import { getAvatarUrl, getBadgeUrl, getUserByName } from '@/lib/habboApi';
import { supabase } from '@/integrations/supabase/client';

import type { HabboUser } from '@/types/habbo';
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
      
      // Primeiro, buscar dados básicos por nome
      let basicData = null;
      try {
        const resp = await fetch(`https://www.habbo.${domain}/api/public/users?name=${encodeURIComponent(username)}`, {
          headers: { 'Accept': 'application/json' },
        });
        if (resp.ok) {
          basicData = await resp.json();
                  }
      } catch (err) {
              }

      // Se temos dados básicos com ID, buscar dados detalhados
      if (basicData && basicData.uniqueId) {
        try {
          const detailedProfile = await this.getUserDetailedProfile(basicData.uniqueId, hotel);
          if (detailedProfile) {
            return detailedProfile;
          }
        } catch (err) {
                  }
      }

      // Fallback para dados básicos se detalhados falharem
      if (basicData) {
        return {
          id: basicData.uniqueId || basicData.id || '',
          name: basicData.name || username,
          motto: basicData.motto || '',
          online: !!basicData.online,
          memberSince: basicData.memberSince || '',
          selectedBadges: basicData.selectedBadges || [],
          badges: basicData.badges || [],
          figureString: basicData.figureString || '',
          profileVisible: basicData.profileVisible ?? true,
          lastWebVisit: basicData.lastAccessTime,
          uniqueId: basicData.uniqueId || basicData.id || '',
        };
      }

      return null;
    } catch (error) {
            return null;
    }
  }

  async getUserByName(username: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    return this.getUserProfile(username, hotel);
  }

  async getUserDetailedProfile(userId: string, hotel: string = 'com.br'): Promise<HabboUser | null> {
    try {
      const domain = this.getHotelDomain(hotel);
      
      // Buscar dados detalhados via API oficial
      const resp = await fetch(`https://www.habbo.${domain}/api/public/users/${encodeURIComponent(userId)}/profile`, {
        headers: { 'Accept': 'application/json' },
      });
      
      if (resp.ok) {
        const profileData = await resp.json();
                if (profileData && profileData.uniqueId) {
          return {
            id: profileData.uniqueId,
            name: profileData.name,
            motto: profileData.motto || '',
            online: !!profileData.online,
            memberSince: profileData.memberSince || '',
            selectedBadges: profileData.selectedBadges || [],
            badges: profileData.badges || [],
            figureString: profileData.figureString || '',
            profileVisible: profileData.profileVisible ?? true,
            lastWebVisit: profileData.lastAccessTime,
            uniqueId: profileData.uniqueId,
          };
        }
      }
      
      return null;
    } catch (error) {
            return null;
    }
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
                return [];
      }
            // Verificar se data é um array antes de fazer map - FIXED
      if (!Array.isArray(data)) {
                return [];
      }

      return data.map(badge => ({
        code: badge.code,
        name: badge.name,
        description: badge.description,
      }));
    } catch (error) {
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
                return [];
      }
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
                return [];
      }

        return photosArray.map((photo: any) => ({
          id: photo.id || photo.photoId || String(Math.random()),
          url: photo.url || photo.photoUrl || photo.previewUrl || photo.thumbnailUrl || photo.imageUrl || photo.src || '',
          takenOn: photo.takenOn || photo.createdAt || photo.timestamp || new Date().toISOString(),
        })).filter(photo => photo.url);

    } catch (error) {
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
                return [];
      }

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
                return [];
      }

      return friendsArray.map((friend: any) => ({
        name: friend.name || friend.habboName || friend.username || '',
        figureString: friend.figureString || friend.figure || '',
        online: friend.online || false,
        uniqueId: friend.uniqueId || friend.id || friend.habboId || '',
      })).filter(friend => friend.name);

    } catch (error) {
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

            // Normalize activities array
      let activities: any[] = [];
      if (Array.isArray(data)) {
          activities = data;
      } else if (data && Array.isArray(data.activities)) {
          activities = data.activities;
      } else {
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
                return null;
      }

            return data;
    } catch (error) {
            return null;
    }
  }
}

export const habboProxyService = new HabboProxyService();
