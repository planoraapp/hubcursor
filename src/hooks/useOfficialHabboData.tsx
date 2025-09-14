
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OfficialFigureItem {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: boolean;
  colors: string[];
}

export interface OfficialBadgeItem {
  id: string;
  code: string;
  name: string;
  imageUrl: string;
  category: 'official' | 'achievements' | 'fansites' | 'others';
}

export interface OfficialHabboData {
  figureData: Record<string, OfficialFigureItem[]>;
  badges: OfficialBadgeItem[];
}

const fetchOfficialData = async (): Promise<OfficialHabboData> => {
    try {
    // Fetch figure data
        const figureResponse = await supabase.functions.invoke('get-habbo-figuredata');
    
    let figureData: Record<string, OfficialFigureItem[]> = {};
    
    if (figureResponse.data?.figureParts) {
      figureData = figureResponse.data.figureParts;
      console.log('✅ [OfficialHabboData] Figuredata carregado:', {
        categories: Object.keys(figureData).length,
        totalItems: Object.values(figureData).reduce((acc, items) => acc + items.length, 0)
      });
    } else {
            figureData = generateFallbackFigureData();
    }

    // Fetch badges
        const badgeResponse = await supabase.functions.invoke('habbo-badges-storage', {
      body: { limit: 1000, search: '', category: 'all' }
    });
    
    let badges: OfficialBadgeItem[] = [];
    
    if (badgeResponse.data?.badges && Array.isArray(badgeResponse.data.badges)) {
      badges = badgeResponse.data.badges.map((badge: any) => ({
        id: badge.code || badge.id,
        code: badge.code || badge.id,
        name: badge.name || `Badge ${badge.code}`,
        imageUrl: badge.imageUrl || '',
        category: badge.category || 'others'
      }));
          } else {
          }

    const result = { figureData, badges };
    
    // Cache no localStorage
    try {
      localStorage.setItem('habbo_official_data', JSON.stringify({
        ...result,
        cachedAt: Date.now()
      }));
          } catch (e) {
          }

    return result;
    
  } catch (error) {
        // Tentar cache local
    try {
      const cached = localStorage.getItem('habbo_official_data');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        const cacheAge = Date.now() - (parsedCache.cachedAt || 0);
        
        // Usar cache se for menos de 24 horas
        if (cacheAge < 24 * 60 * 60 * 1000) {
                    return {
            figureData: parsedCache.figureData || generateFallbackFigureData(),
            badges: parsedCache.badges || []
          };
        }
      }
    } catch (cacheError) {
          }

    // Fallback final
    return {
      figureData: generateFallbackFigureData(),
      badges: []
    };
  }
};

const generateFallbackFigureData = (): Record<string, OfficialFigureItem[]> => {
  const categories = ['hd', 'hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'fa', 'cc', 'ca', 'wa', 'cp'];
  const fallbackData: Record<string, OfficialFigureItem[]> = {};
  
  categories.forEach(category => {
    fallbackData[category] = Array.from({ length: 10 }, (_, i) => ({
      id: (i + 1).toString(),
      gender: 'U' as const,
      club: '0',
      colorable: true,
      colors: ['1', '2', '3', '4', '5']
    }));
  });
  
  return fallbackData;
};

export const useOfficialHabboData = () => {
  return useQuery({
    queryKey: ['official-habbo-data'],
    queryFn: fetchOfficialData,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas
    retry: 2,
    refetchOnWindowFocus: false
  });
};
