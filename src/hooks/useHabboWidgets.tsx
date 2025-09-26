
import { useQuery } from '@tanstack/react-query';

interface HabboWidgetsItem {
  id: string;
  name: string;
  category: string;
  colors: string[];
  thumbnail?: string;
}

const fetchHabboWidgetsData = async (hotel: string = 'com.br'): Promise<HabboWidgetsItem[]> => {
    try {
    // Primeiro, vamos tentar acessar diretamente
    const response = await fetch(`https://www.habbowidgets.com/habbo/closet/${hotel}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'HabboHub-Console/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HabboWidgets responded with status ${response.status}`);
    }

    const html = await response.text();
    
    // Tentar extrair dados do HTML (será necessário parsing)
        // Por enquanto, retorna array vazio - precisaremos implementar o parser
    return [];
    
  } catch (error) {
        // Fallback: retorna dados mockados baseados na estrutura esperada
    return [];
  }
};

export const useHabboWidgets = (hotel: string = 'com.br') => {
  return useQuery({
    queryKey: ['habbo-widgets', hotel],
    queryFn: () => fetchHabboWidgetsData(hotel),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 dias
    retry: 2,
    enabled: false // Desabilitado por enquanto até testarmos
  });
};
