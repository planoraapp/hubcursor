
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
  console.log('🌐 [FigureData] Carregando dados oficiais do Habbo...');
  
  try {
    const response = await fetch('/figuredata.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch figuredata: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Remover metadados para retornar apenas os dados de figura
    const { _metadata, ...figureData } = data;
    
    console.log('✅ [FigureData] Dados oficiais carregados:', {
      fonte: _metadata?.source || 'Desconhecida',
      tipos: Object.keys(figureData).length,
      totalItens: Object.values(figureData).reduce((acc: number, items: any) => acc + items.length, 0),
      ultimaAtualizacao: _metadata?.fetchedAt || 'Desconhecida'
    });
    
    // Validar dados carregados
    const requiredTypes = ['hd', 'hr', 'ch', 'lg', 'sh'];
    const missingTypes = requiredTypes.filter(type => !figureData[type] || figureData[type].length === 0);
    
    if (missingTypes.length > 0) {
      console.warn('⚠️ [FigureData] Tipos obrigatórios ausentes:', missingTypes);
    }
    
    return figureData;
  } catch (error) {
    console.error('❌ [FigureData] Erro ao carregar dados oficiais:', error);
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
