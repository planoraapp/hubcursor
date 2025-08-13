
export interface HabboUser {
  uniqueId: string;
  name: string;
  figureString: string;
  motto: string;
  online: boolean;
  profileVisible?: boolean;
  memberSince?: string;
  lastAccessTime?: string;
  selectedBadges?: Array<{
    badgeIndex: number;
    code: string;
    name: string;
    description: string;
  }>;
}

export interface HabboBadge {
  code: string;
  name: string;
  description?: string;
}

const HABBO_API_BASE = 'https://www.habbo.com.br/api/public';

export const getUserByName = async (username: string): Promise<HabboUser | null> => {
  try {
    const response = await fetch(`${HABBO_API_BASE}/users?name=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user by name:', error);
    return null;
  }
};

export const getUserBadges = async (habboId: string): Promise<HabboBadge[]> => {
  try {
    const response = await fetch(`${HABBO_API_BASE}/users/${habboId}/badges`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
};

export const getAvatarUrl = (figureString: string, size: 's' | 'm' | 'l' = 'm'): string => {
  return `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=${figureString}&size=${size}&direction=2&head_direction=3&gesture=std`;
};

export const getBadgeUrl = (badgeCode: string): string => {
  return `https://images.habbo.com/c_images/album1584/${badgeCode}.png`;
};
