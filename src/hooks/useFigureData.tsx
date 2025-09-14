
import { useQuery } from '@tanstack/react-query';

export interface FigureItem {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  colorable: boolean;
  colors: string[];
}

export interface FigureData {
  [type: string]: FigureItem[];
}

const fetchFigureData = async (): Promise<FigureData> => {
    try {
    const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/get-habbo-figures', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Edge Function: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ [FigureData] Dados carregados da Edge Function:', {
      cache: response.headers.get('X-Cache') || 'UNKNOWN',
      tipos: Object.keys(data.figureParts).length,
      totalItens: Object.values(data.figureParts).reduce((acc: number, items: any) => acc + items.length, 0),
      cores: data.colors.length
    });
    
    // Converter formato da Edge Function para o formato esperado
    return data.figureParts;
  } catch (error) {
        // Fallback para dados locais se a Edge Function falhar
        try {
      const fallbackResponse = await fetch('/figuredata.json');
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const { _metadata, ...figureData } = fallbackData;
                return figureData;
      }
    } catch (fallbackError) {
          }
    
    throw error;
  }
};

export const useFigureData = () => {
  return useQuery({
    queryKey: ['figuredata'],
    queryFn: fetchFigureData,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 3,
  });
};
