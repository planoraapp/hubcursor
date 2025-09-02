
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RealBadgeItem {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  source: 'real-validated';
  scrapedAt: string;
  verified: true;
}

interface UseRealBadgesProps {
  limit?: number;
  search?: string;
  category?: string;
  enabled?: boolean;
}

const fetchRealBadges = async ({
  limit = 1000,
  search = '',
  category = 'all'
}: UseRealBadgesProps): Promise<{
  badges: RealBadgeItem[];
  metadata: any;
}> => {
  console.log(`🎯 [RealBadges] Buscando badges reais: limit=${limit}, search="${search}", category=${category}`);
  
  try {
    const { data, error } = await supabase.functions.invoke('real-badges-system', {
      body: { limit, search, category }
    });

    if (error) {
      console.error('❌ [RealBadges] Erro na função:', error);
      throw new Error(`Sistema de badges reais: ${error.message}`);
    }

    if (!data || !data.badges || !Array.isArray(data.badges)) {
      console.error('❌ [RealBadges] Formato inválido:', data);
      throw new Error('Dados de badges reais inválidos');
    }

    console.log(`✅ [RealBadges] Recebidos ${data.badges.length} badges REAIS`);
    console.log(`📊 [RealBadges] Metadata:`, {
      total: data.metadata?.total,
      source: data.metadata?.source,
      validationRate: data.metadata?.validationRate
    });
    
    return {
      badges: data.badges,
      metadata: data.metadata || {}
    };
    
  } catch (error) {
    console.error('❌ [RealBadges] Erro:', error);
    throw error;
  }
};

export const useRealBadges = ({
  limit = 1000,
  search = '',
  category = 'all',
  enabled = true
}: UseRealBadgesProps = {}) => {
  console.log(`🔧 [useRealBadges] Hook: limit=${limit}, search="${search}", category=${category}, enabled=${enabled}`);
  
  return useQuery({
    queryKey: ['real-badges-system', limit, search, category],
    queryFn: () => fetchRealBadges({ limit, search, category }),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hora - badges reais mudam raramente
    gcTime: 1000 * 60 * 60 * 4, // 4 horas
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    refetchOnWindowFocus: false, // Badges reais não mudam frequentemente
    refetchOnReconnect: false,
  });
};
