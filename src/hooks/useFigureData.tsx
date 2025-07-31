
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
  console.log('🌐 [FigureData] Carregando figuredata.json...');
  
  try {
    const response = await fetch('/figuredata.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch figuredata: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ [FigureData] Dados carregados:', {
      tipos: Object.keys(data).length,
      totalItens: Object.values(data).reduce((acc: number, items: any) => acc + items.length, 0)
    });
    
    return data;
  } catch (error) {
    console.error('❌ [FigureData] Erro ao carregar figuredata:', error);
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
