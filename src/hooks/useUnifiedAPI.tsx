import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  source?: string;
}

interface UseUnifiedAPIOptions {
  endpoint: 'badges' | 'clothing' | 'users' | 'photos' | 'furni' | 'feed';
  action: string;
  params?: Record<string, any>;
  enabled?: boolean;
  cacheTime?: number; // in minutes
}

export const useUnifiedAPI = <T = any>({
  endpoint,
  action,
  params = {},
  enabled = true,
  cacheTime = 5
}: UseUnifiedAPIOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const fetchData = useCallback(async (customParams?: Record<string, any>) => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
            const { data: response, error: apiError } = await supabase.functions.invoke('habbo-unified-api', {
        body: {
          endpoint,
          action,
          params: { ...params, ...customParams }
        }
      });

      if (apiError) {
        throw new Error(apiError.message || 'API call failed');
      }

      if (response.success) {
        setData(response.data);
        setSource(response.source);
              } else {
        throw new Error(response.error || 'Unknown error');
      }

    } catch (err: any) {
            setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, action, params, enabled]);

  return {
    data,
    loading,
    error,
    source,
    fetchData,
    refetch: () => fetchData()
  };
};

// Specialized hooks for common use cases

export const useUnifiedBadges = (params: {
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'badges',
    action: 'search',
    params: {
      limit: 1000,
      search: '',
      category: 'all',
      ...params
    },
    enabled: params.enabled !== false,
    cacheTime: 24 * 60 // 24 hours
  });
};

export const useUnifiedClothing = (params: {
  limit?: number;
  category?: string;
  search?: string;
  gender?: 'M' | 'F' | 'U';
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'clothing',
    action: 'search',
    params: {
      limit: 500,
      category: 'all',
      search: '',
      gender: 'U',
      ...params
    },
    enabled: params.enabled !== false,
    cacheTime: 60 // 1 hour
  });
};

export const useUnifiedUserSearch = (params: {
  query: string;
  hotel?: string;
  limit?: number;
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'users',
    action: 'search',
    params: {
      hotel: 'br',
      limit: 20,
      ...params
    },
    enabled: params.enabled !== false && !!params.query,
    cacheTime: 30 // 30 minutes
  });
};

export const useUnifiedPhotos = (params: {
  username: string;
  hotel?: string;
  action?: 'discover' | 'scrape';
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'photos',
    action: params.action || 'discover',
    params: {
      hotel: 'br',
      ...params
    },
    enabled: params.enabled !== false && !!params.username,
    cacheTime: 5 // 5 minutes
  });
};

export const useUnifiedFurni = (params: {
  searchTerm?: string;
  className?: string;
  limit?: number;
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'furni',
    action: 'search',
    params: {
      searchTerm: '',
      className: '',
      limit: 500,
      ...params
    },
    enabled: params.enabled !== false,
    cacheTime: 60 // 1 hour
  });
};

export const useUnifiedFeed = (params: {
  action: 'general' | 'friends' | 'activities';
  usernames?: string[];
  username?: string;
  hotel?: string;
  limit?: number;
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'feed',
    action: params.action,
    params: {
      limit: 20,
      hotel: 'br',
      ...params
    },
    enabled: params.enabled !== false,
    cacheTime: 2 // 2 minutes
  });
};

// Utility function to get badge by code
export const useBadgeLookup = (badgeCode: string, enabled: boolean = true) => {
  return useUnifiedAPI({
    endpoint: 'badges',
    action: 'get',
    params: { badgeCode },
    enabled: enabled && !!badgeCode,
    cacheTime: 24 * 60 // 24 hours
  });
};

// Utility function to get clothing categories
export const useClothingCategories = (enabled: boolean = true) => {
  return useUnifiedAPI({
    endpoint: 'clothing',
    action: 'categories',
    params: {},
    enabled,
    cacheTime: 24 * 60 // 24 hours
  });
};

// Utility function to get user profile
export const useUserProfile = (username: string, hotel: string = 'br', enabled: boolean = true) => {
  return useUnifiedAPI({
    endpoint: 'users',
    action: 'profile',
    params: { username, hotel },
    enabled: enabled && !!username,
    cacheTime: 30 // 30 minutes
  });
};

// Utility function to discover users by badge
export const useBadgeDiscovery = (params: {
  hotel?: string;
  badge?: string;
  limit?: number;
  enabled?: boolean;
} = {}) => {
  return useUnifiedAPI({
    endpoint: 'badges',
    action: 'discover',
    params: {
      hotel: 'br',
      badge: 'ACH_Tutorial1',
      limit: 100,
      ...params
    },
    enabled: params.enabled !== false,
    cacheTime: 60 // 1 hour
  });
};
