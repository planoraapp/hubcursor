
import { useQuery } from '@tanstack/react-query';
import { useOfficialFigureData } from './useFigureDataOfficial';

export interface OfficialClothingItem {
  id: string;
  category: string;
  figureId: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: boolean;
  colorable: boolean;
  colors: string[];
  thumbnailUrl: string;
}

// Gerar URL de thumbnail no estilo KiHabbo
const generateOfficialThumbnail = (
  category: string, 
  figureId: string, 
  colorId: string = '1',
  gender: string = 'U',
  hotel: string = 'com'
): string => {
  const headOnlyCategories = ['hd', 'hr', 'ha', 'ea', 'fa'];
  const headOnly = headOnlyCategories.includes(category) ? '&headonly=1' : '';
  
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&gender=${gender}&size=l&direction=2&head_direction=3${headOnly}`;
};

// Mapear dados oficiais para formato do editor
const mapOfficialData = (figureData: any) => {
  const mappedItems: OfficialClothingItem[] = [];
  
  Object.entries(figureData).forEach(([category, items]: [string, any]) => {
    if (Array.isArray(items)) {
      items.forEach(item => {
        const officialItem: OfficialClothingItem = {
          id: `official_${category}_${item.id}`,
          category,
          figureId: item.id,
          name: `${getCategoryName(category)} ${item.id}`,
          gender: item.gender || 'U',
          club: item.club === '1',
          colorable: item.colorable || false,
          colors: item.colors || ['1'],
          thumbnailUrl: generateOfficialThumbnail(category, item.id, item.colors?.[0] || '1', item.gender || 'U')
        };
        
        mappedItems.push(officialItem);
      });
    }
  });
  
  return mappedItems;
};

const getCategoryName = (category: string): string => {
  const names = {
    'hd': 'Rosto',
    'hr': 'Cabelo', 
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'fa': 'Acessório Facial',
    'cc': 'Casaco',
    'ca': 'Acessório Peito',
    'wa': 'Cintura',
    'cp': 'Estampa'
  };
  return names[category as keyof typeof names] || 'Item';
};

export const useOfficialHabboClothing = (category?: string, gender?: string) => {
  const { data: figureData, isLoading, error } = useOfficialFigureData();
  
  return useQuery({
    queryKey: ['official-habbo-clothing', category, gender, figureData],
    queryFn: () => {
      if (!figureData) return [];
      
      let items = mapOfficialData(figureData);
      
      // Filtrar por categoria se especificada
      if (category && category !== 'all') {
        items = items.filter(item => item.category === category);
      }
      
      // Filtrar por gênero se especificado
      if (gender && gender !== 'U') {
        items = items.filter(item => item.gender === gender || item.gender === 'U');
      }
      
      return items.sort((a, b) => parseInt(a.figureId) - parseInt(b.figureId));
    },
    enabled: !!figureData,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
};
