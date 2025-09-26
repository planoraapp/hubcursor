
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
    try {
    // Timeout de 15 segundos para evitar travamentos
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout na busca de badges')), 15000);
    });

    const fetchPromise = supabase.functions.invoke('habbo-badges-scraper', {
      body: { limit, search, category, forceRefresh }
    });

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
            return {
        badges: generateLocalFallbackBadges(category, search),
        metadata: { hasMore: false, error: true, source: 'local-fallback' }
      };
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
            return {
        badges: generateLocalFallbackBadges(category, search),
        metadata: { hasMore: false, error: true, source: 'local-fallback' }
      };
    }

        return {
      badges: data.badges,
      metadata: data.metadata || { hasMore: false, source: 'verified' }
    };
    
  } catch (error) {
        return {
      badges: generateLocalFallbackBadges(category, search),
      metadata: { hasMore: false, error: true, source: 'network-error' }
    };
  }
};

// Fallback local com badges essenciais que SABEMOS que existem
const generateLocalFallbackBadges = (category: string, search: string): EnhancedBadgeItem[] => {
  const essentialBadges = [
    { code: 'ADM', name: 'Administrador', category: 'official', rarity: 'legendary' },
    { code: 'MOD', name: 'Moderador', category: 'official', rarity: 'rare' },
    { code: 'STAFF', name: 'Equipe Habbo', category: 'official', rarity: 'rare' },
    { code: 'GUIDE', name: 'Guia do Hotel', category: 'official', rarity: 'rare' },
    { code: 'HELPER', name: 'Ajudante', category: 'official', rarity: 'uncommon' },
    { code: 'VIP', name: 'VIP Badge', category: 'official', rarity: 'uncommon' },
    { code: 'HC1', name: 'Habbo Club 1', category: 'achievements', rarity: 'uncommon' },
    { code: 'HC2', name: 'Habbo Club 2', category: 'achievements', rarity: 'uncommon' },
    { code: 'HC3', name: 'Habbo Club 3', category: 'achievements', rarity: 'uncommon' },
    { code: 'US001', name: 'Badge USA 001', category: 'fansites', rarity: 'common' },
    { code: 'US002', name: 'Badge USA 002', category: 'fansites', rarity: 'common' },
    { code: 'BR001', name: 'Badge Brasil 001', category: 'fansites', rarity: 'common' },
    { code: 'BR002', name: 'Badge Brasil 002', category: 'fansites', rarity: 'common' },
    { code: 'ACH_BasicClub1', name: 'Conquista: BasicClub1', category: 'achievements', rarity: 'uncommon' },
    { code: 'ACH_RoomEntry1', name: 'Conquista: RoomEntry1', category: 'achievements', rarity: 'common' },
    { code: 'ACH_Login1', name: 'Conquista: Login1', category: 'achievements', rarity: 'common' },
    { code: 'XMAS07', name: 'Badge Sazonal: XMAS07', category: 'others', rarity: 'rare' },
    { code: 'EASTER08', name: 'Badge Sazonal: EASTER08', category: 'others', rarity: 'rare' },
    { code: 'Y2005', name: 'Badge Anual Y2005', category: 'others', rarity: 'rare' }
  ];

  return essentialBadges
    .filter(badge => category === 'all' || badge.category === category)
    .filter(badge => !search || 
      badge.code.toLowerCase().includes(search.toLowerCase()) ||
      badge.name.toLowerCase().includes(search.toLowerCase())
    )
    .map(badge => ({
      id: `essential_${badge.code}`,
      code: badge.code,
      name: badge.name,
      description: `Emblema essencial ${badge.name}`,
      imageUrl: `https://habboassets.com/c_images/album1584/${badge.code}.gif`,
      category: badge.category,
      rarity: badge.rarity,
      source: 'essential'
    }));
};

export const useEnhancedBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  forceRefresh = false,
  enabled = true
}: UseEnhancedBadgesProps = {}) => {
    return useQuery({
    queryKey: ['enhanced-badges-verified', limit, search, category, forceRefresh],
    queryFn: () => fetchEnhancedBadges({ limit, search, category, forceRefresh }),
    enabled,
    staleTime: 1000 * 60 * 15, // 15 minutos
    gcTime: 1000 * 60 * 60, // 1 hora
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
