
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OfficialFigureItem {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: boolean;
  colors: string[];
}

export interface OfficialFigureData {
  [type: string]: OfficialFigureItem[];
}

const fetchOfficialFigureData = async (): Promise<OfficialFigureData> => {
  console.log('🌐 [OfficialFigureData] Fetching from official Habbo sources...');
  
  try {
    const response = await supabase.functions.invoke('get-habbo-figuredata');
    
    if (response.error) {
      throw new Error(`Edge Function error: ${response.error.message}`);
    }
    
    if (!response.data?.figureParts) {
      throw new Error('No figure parts data received');
    }
    
    // Verificar se há categorias válidas
    const categoryCount = Object.keys(response.data.figureParts).length;
    if (categoryCount === 0) {
      console.warn('⚠️ [OfficialFigureData] Edge Function returned 0 categories, forcing fallback');
      throw new Error('Empty figureParts data, falling back to local data');
    }
    
    console.log('✅ [OfficialFigureData] Data loaded from official source:', {
      categories: categoryCount,
      source: response.data.metadata?.source,
      fetchedAt: response.data.metadata?.fetchedAt
    });
    
    return response.data.figureParts;
    
  } catch (error) {
    console.error('❌ [OfficialFigureData] Error loading official data:', error);
    
    // Fallback to local figuredata.json if available
    console.log('🔄 [OfficialFigureData] Trying local fallback...');
    try {
      const fallbackResponse = await fetch('/figuredata.json');
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const { _metadata, ...figureData } = fallbackData;
        
        const fallbackCategoryCount = Object.keys(figureData).length;
        console.log('✅ [OfficialFigureData] Fallback data loaded:', {
          categories: fallbackCategoryCount,
          source: 'local fallback',
          availableCategories: Object.keys(figureData)
        });
        
        return figureData;
      }
    } catch (fallbackError) {
      console.error('❌ [OfficialFigureData] Fallback also failed:', fallbackError);
    }
    
    throw error;
  }
};

export const useOfficialFigureData = () => {
  return useQuery({
    queryKey: ['official-figuredata'],
    queryFn: fetchOfficialFigureData,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 2,
  });
};
