
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface ViaJovemItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  club: 'hc' | 'normal' | 'ltd' | 'nft';
  colors: string[];
  thumbnail: string;
}

export interface ViaJovemCategory {
  id: string;
  name: string;
  icon: string;
  items: ViaJovemItem[];
}

const CATEGORY_DATA = {
  hd: { name: 'Rostos', icon: '👤' },
  hr: { name: 'Cabelos', icon: '💇' },
  ch: { name: 'Camisetas', icon: '👕' },
  lg: { name: 'Calças/Saias', icon: '👖' },
  sh: { name: 'Sapatos', icon: '👟' },
  ha: { name: 'Chapéus', icon: '🎩' },
  ea: { name: 'Óculos', icon: '👓' },
  fa: { name: 'Acessórios Faciais', icon: '😷' },
  cc: { name: 'Casacos', icon: '🧥' },
  ca: { name: 'Acessórios Peito', icon: '🎖️' },
  wa: { name: 'Cintura', icon: '👔' },
  cp: { name: 'Estampas', icon: '🎨' }
};

const fetchViaJovemData = async (): Promise<{ [key: string]: ViaJovemCategory }> => {
  try {
    const response = await fetch('/figuredata.json');
    const data = await response.json();
    
    const processedData: { [key: string]: ViaJovemCategory } = {};
    
    Object.entries(data).forEach(([categoryId, items]: [string, any]) => {
      if (categoryId.startsWith('_') || !CATEGORY_DATA[categoryId as keyof typeof CATEGORY_DATA]) return;
      
      const categoryInfo = CATEGORY_DATA[categoryId as keyof typeof CATEGORY_DATA];
      
      const processedItems: ViaJovemItem[] = (items as any[]).map((item: any) => ({
        id: item.id,
        name: `${categoryInfo.name} ${item.id}`,
        category: categoryId,
        gender: item.gender,
        club: item.club === '1' ? 'hc' : 'normal',
        colors: item.colors || ['1'],
        thumbnail: `https://www.habbo.com/habbo-imaging/avatarimage?figure=${categoryId}-${item.id}-1&size=s&direction=2&head_direction=2&action=std&gesture=std`
      }));
      
      processedData[categoryId] = {
        id: categoryId,
        name: categoryInfo.name,
        icon: categoryInfo.icon,
        items: processedItems
      };
    });
    
    console.log('✅ ViaJovem data processed:', Object.keys(processedData).length, 'categories');
    return processedData;
  } catch (error) {
    console.error('❌ Error loading ViaJovem data:', error);
    throw error;
  }
};

export const useViaJovemData = () => {
  return useQuery({
    queryKey: ['viajovem-data'],
    queryFn: fetchViaJovemData,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useViaJovemCategory = (categoryId: string, gender: 'M' | 'F') => {
  const { data, isLoading, error } = useViaJovemData();
  
  const [filteredItems, setFilteredItems] = useState<ViaJovemItem[]>([]);
  
  useEffect(() => {
    if (data && categoryId && data[categoryId]) {
      const items = data[categoryId].items.filter(
        item => item.gender === gender || item.gender === 'U'
      );
      setFilteredItems(items);
    }
  }, [data, categoryId, gender]);
  
  return {
    items: filteredItems,
    category: data?.[categoryId],
    isLoading,
    error
  };
};
