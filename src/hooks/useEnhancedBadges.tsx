
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedBadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: string;
  scrapedAt?: string;
}

interface UseEnhancedBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  forceRefresh?: boolean;
  enabled?: boolean;
}

const fetchEnhancedBadges = async ({
  limit = 1000,
  search = '',
  category = 'all',
  forceRefresh = false
}: UseEnhancedBadgesProps): Promise<{
  badges: EnhancedBadgeItem[];
  metadata: any;
}> => {
  console.log(`🚀 [EnhancedBadges] Fetching with limit: ${limit}, search: "${search}", category: ${category}`);
  
  try {
    // Timeout para evitar requests longos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const { data, error } = await supabase.functions.invoke('habbo-badges-scraper', {
      body: { limit, search, category, forceRefresh },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (error) {
      console.error('❌ [EnhancedBadges] Supabase function error:', error);
      
      // Fallback para badges estáticos em caso de erro
      return {
        badges: generateFallbackBadges(category, search),
        metadata: { hasMore: false, error: true }
      };
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [EnhancedBadges] Invalid response format:', data);
      return {
        badges: generateFallbackBadges(category, search),
        metadata: { hasMore: false, error: true }
      };
    }

    console.log(`✅ [EnhancedBadges] Successfully fetched ${data.badges.length} badges`);
    
    return {
      badges: data.badges,
      metadata: data.metadata || { hasMore: false }
    };
    
  } catch (error) {
    console.error('❌ [EnhancedBadges] Network error:', error);
    return {
      badges: generateFallbackBadges(category, search),
      metadata: { hasMore: false, error: true }
    };
  }
};

// Fallback badges para casos de erro
const generateFallbackBadges = (category: string, search: string): EnhancedBadgeItem[] => {
  const commonBadges = [
    { code: 'ADM', name: 'Administrador', category: 'official', rarity: 'legendary' },
    { code: 'MOD', name: 'Moderador', category: 'official', rarity: 'rare' },
    { code: 'VIP', name: 'VIP', category: 'official', rarity: 'uncommon' },
    { code: 'HC1', name: 'Habbo Club', category: 'achievements', rarity: 'common' },
    { code: 'STAFF', name: 'Staff', category: 'official', rarity: 'legendary' },
    { code: 'GUIDE', name: 'Guia', category: 'official', rarity: 'rare' },
    { code: 'ACH_RoomEntry1', name: 'Primeira Visita', category: 'achievements', rarity: 'common' },
    { code: 'ACH_Login1', name: 'Primeiro Login', category: 'achievements', rarity: 'common' }
  ];

  return commonBadges
    .filter(badge => category === 'all' || badge.category === category)
    .filter(badge => !search || 
      badge.code.toLowerCase().includes(search.toLowerCase()) ||
      badge.name.toLowerCase().includes(search.toLowerCase())
    )
    .map(badge => ({
      id: badge.code,
      code: badge.code,
      name: badge.name,
      description: `Emblema ${badge.name}`,
      imageUrl: `https://habboassets.com/c_images/album1584/${badge.code}.gif`,
      category: badge.category,
      rarity: badge.rarity,
      source: 'fallback'
    }));
};

export const useEnhancedBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  forceRefresh = false,
  enabled = true
}: UseEnhancedBadgesProps = {}) => {
  console.log(`🔧 [useEnhancedBadges] Hook called with limit: ${limit}, search: "${search}", category: ${category}`);
  
  return useQuery({
    queryKey: ['enhanced-badges', limit, search, category, forceRefresh],
    queryFn: () => fetchEnhancedBadges({ limit, search, category, forceRefresh }),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutos
    gcTime: 1000 * 60 * 30, // 30 minutos
    retry: (failureCount, error) => {
      // Retry apenas até 2 vezes e não em caso de abort
      return failureCount < 2 && error?.name !== 'AbortError';
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
