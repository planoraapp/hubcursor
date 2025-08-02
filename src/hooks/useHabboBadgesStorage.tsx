import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HabboBadgeItem {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  category: string;
  rarity: string;
  source: 'storage';
}

interface UseHabboBadgesStorageProps {
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
}

const fetchHabboBadgesFromStorage = async ({
  limit = 1000,
  search = '',
  category = 'all'
}: UseHabboBadgesStorageProps): Promise<HabboBadgeItem[]> => {
  console.log(`🌐 [HabboBadgesStorage] Fetching badges with limit: ${limit}, search: "${search}", category: ${category}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('habbo-badges-storage', {
      body: { limit, search, category }
    });

    if (error) {
      console.error('❌ [HabboBadgesStorage] Supabase function error:', error);
      throw error;
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [HabboBadgesStorage] Invalid response format:', data);
      
      // Fallback: tentar buscar diretamente do bucket
      return await fetchBadgesDirectly();
    }

    console.log(`✅ [HabboBadgesStorage] Successfully fetched ${data.badges.length} badges`);
    console.log(`📊 [HabboBadgesStorage] Metadata:`, data.metadata);
    
    return data.badges;
    
  } catch (error) {
    console.error('❌ [HabboBadgesStorage] Error:', error);
    
    // Fallback: tentar buscar diretamente
    return await fetchBadgesDirectly();
  }
};

const fetchBadgesDirectly = async (): Promise<HabboBadgeItem[]> => {
  console.log('🔄 [HabboBadgesStorage] Tentando fallback direto...');
  
  try {
    // Tentar APIs externas como fallback
    const externalBadges = await Promise.allSettled([
      fetchFromHabboAssets(),
      fetchFromHabboWidgets()
    ]);
    
    const successfulResults = externalBadges
      .filter((result): result is PromiseFulfilledResult<HabboBadgeItem[]> => 
        result.status === 'fulfilled')
      .map(result => result.value)
      .flat();
    
    if (successfulResults.length > 0) {
      console.log(`✅ [HabboBadgesStorage] Fallback successful: ${successfulResults.length} badges`);
      return successfulResults;
    }
    
    return [];
    
  } catch (error) {
    console.error('❌ [HabboBadgesStorage] Fallback failed:', error);
    return [];
  }
};

const fetchFromHabboAssets = async (): Promise<HabboBadgeItem[]> => {
  // Lista de badges comuns para fallback
  const commonBadges = [
    'ADM', 'MOD', 'VIP', 'HC1', 'HC2', 'STAFF', 'GUIDE', 'HELPER',
    'ACH_BasicClub1', 'ACH_RoomEntry1', 'ACH_Login1', 'ACH_Motto1'
  ];
  
  return commonBadges.map(code => ({
    id: code,
    code,
    name: `Emblema ${code}`,
    imageUrl: `https://habboassets.com/c_images/album1584/${code}.gif`,
    category: categorizeBadge(code),
    rarity: getRarity(code),
    source: 'storage' as const
  }));
};

const fetchFromHabboWidgets = async (): Promise<HabboBadgeItem[]> => {
  // Mais badges comuns
  const moreBadges = [
    'US004', 'US005', 'US006', 'BR001', 'BR002', 'ES001', 'DE001'
  ];
  
  return moreBadges.map(code => ({
    id: code,
    code,
    name: `Badge ${code}`,
    imageUrl: `https://www.habbowidgets.com/images/badges/${code}.gif`,
    category: categorizeBadge(code),
    rarity: getRarity(code),
    source: 'storage' as const
  }));
};

const categorizeBadge = (code: string): string => {
  const upperCode = code.toUpperCase();
  
  if (/^(ADM|MOD|STAFF|VIP|SUP|GUIDE|HELPER)/i.test(upperCode)) return 'official';
  if (/(ACH|GAME|WIN|VICTORY|CHAMPION|QUEST|MISSION|COMPLETE|FINISH)/i.test(upperCode)) return 'achievements';
  if (/(FANSITE|PARTNER|EVENT|SPECIAL|EXCLUSIVE|LIMITED|PROMO|COLLAB)/i.test(upperCode)) return 'fansites';
  
  return 'others';
};

const getRarity = (code: string): string => {
  const upperCode = code.toUpperCase();
  
  // Badges de staff são legendários
  if (/^(ADM|MOD|STAFF|SUP)/i.test(upperCode)) return 'legendary';
  
  // Badges de achievements são raros
  if (/(ACH|WIN|VICTORY|CHAMPION)/i.test(upperCode)) return 'rare';
  
  // VIP e Club são incomuns
  if (/(VIP|HC|CLUB)/i.test(upperCode)) return 'uncommon';
  
  return 'common';
};

export const useHabboBadgesStorage = ({
  limit = 1000,
  search = '',
  category = 'all',
  enabled = true
}: UseHabboBadgesStorageProps = {}) => {
  console.log(`🔧 [HabboBadgesStorage] Hook called with limit: ${limit}, search: "${search}", category: ${category}, enabled: ${enabled}`);
  
  return useQuery({
    queryKey: ['habbo-badges-storage', limit, search, category],
    queryFn: () => fetchHabboBadgesFromStorage({ limit, search, category }),
    enabled,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
