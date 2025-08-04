
import { useState, useEffect } from 'react';
import { useFlashAssetsClothing, FlashAssetItem } from './useFlashAssetsClothing';
import { HABBO_CLOTHING_DATA } from '@/data/habboClothingData';

export interface LocalHabboClothingItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  thumbnail: string;
  club: 'hc' | 'normal' | 'rare' | 'ltd' | 'nft';
  swfName: string;
  source: 'flash-assets' | 'local-data';
}

// Mapeamento de categorias Flash Assets para categorias do editor
const FLASH_TO_EDITOR_MAPPING = {
  'shirt': 'ch',    // Camisetas
  'hair': 'hr',     // Cabelos  
  'hat': 'ha',      // Chapéus
  'trousers': 'lg', // Calças
  'shoes': 'sh',    // Sapatos
  'acc': 'ca',      // Acessórios Peito
  'jacket': 'cc',   // Casacos
  'face': 'hd',     // Rostos
  'pants': 'lg',    // Calças alternativo
  'top': 'ch',      // Tops/Camisetas
} as const;

const mapFlashToLocal = (flashItems: FlashAssetItem[]): LocalHabboClothingItem[] => {
  return flashItems
    .map(item => {
      // Extrair categoria base do swfName
      const categoryMatch = item.swfName.match(/^([a-z]+)_/);
      if (!categoryMatch) return null;
      
      const flashCategory = categoryMatch[1];
      const editorCategory = FLASH_TO_EDITOR_MAPPING[flashCategory as keyof typeof FLASH_TO_EDITOR_MAPPING];
      
      if (!editorCategory) return null;
      
      return {
        id: `flash_${editorCategory}_${item.figureId}`,
        name: item.name,
        category: editorCategory,
        gender: item.gender,
        figureId: item.figureId,
        colors: item.colors,
        thumbnail: generateViaJovemThumbnail(editorCategory, item.figureId, '1', item.gender),
        club: item.club === 'HC' ? 'hc' : 'normal',
        swfName: item.swfName,
        source: 'flash-assets'
      };
    })
    .filter(Boolean) as LocalHabboClothingItem[];
};

const mapLocalDataToItems = (): LocalHabboClothingItem[] => {
  const items: LocalHabboClothingItem[] = [];
  
  HABBO_CLOTHING_DATA.forEach((item) => {
    items.push({
      id: `local_${item.category}_${item.id}`,
      name: item.name,
      category: item.category,
      gender: item.gender,
      figureId: item.id,
      colors: item.colors,
      thumbnail: generateViaJovemThumbnail(item.category, item.id, '1', item.gender),
      club: item.rarity === 'hc' ? 'hc' : item.rarity === 'nft' ? 'nft' : item.rarity === 'ltd' ? 'ltd' : 'normal',
      swfName: item.swfCode,
      source: 'local-data'
    });
  });
  
  return items;
};

const getCategoryName = (categoryId: string): string => {
  const categoryNames: Record<string, string> = {
    'ch': 'Camiseta',
    'hr': 'Cabelo', 
    'ha': 'Chapéu',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ca': 'Acessório',
    'cc': 'Casaco',
    'hd': 'Rosto',
    'ea': 'Óculos',
    'fa': 'Máscara',
    'wa': 'Cinto',
    'cp': 'Estampa'
  };
  
  return categoryNames[categoryId] || categoryId.toUpperCase();
};

const generateViaJovemThumbnail = (category: string, figureId: string, color: string, gender: string): string => {
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${color}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};

export const useLocalHabboClothing = () => {
  const { data: flashData, isLoading: flashLoading, error: flashError } = useFlashAssetsClothing({ 
    limit: 3000, 
    enabled: true 
  });
  
  const [allItems, setAllItems] = useState<LocalHabboClothingItem[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  
  useEffect(() => {
    let items: LocalHabboClothingItem[] = [];
    
    // Primeiro tenta usar dados do flash-assets
    if (flashData && flashData.length > 0) {
      console.log('🎯 [LocalHabboClothing] Usando dados flash-assets:', flashData.length);
      items = mapFlashToLocal(flashData);
    } 
    // Se não tem dados flash, usa dados locais
    else {
      console.log('🎯 [LocalHabboClothing] Usando dados locais como fallback');
      items = mapLocalDataToItems();
    }
    
    setAllItems(items);
    
    // Calcular estatísticas por categoria
    const stats = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setCategoryStats(stats);
    
    console.log('✅ [LocalHabboClothing] Items processados:', {
      total: items.length,
      categorias: Object.keys(stats).length,
      fonte: items[0]?.source || 'nenhum',
      stats
    });
  }, [flashData]);
  
  return {
    items: allItems,
    categoryStats,
    isLoading: flashLoading,
    error: flashError,
    totalItems: allItems.length,
    source: flashData?.length ? 'flash-assets' : 'local-data'
  };
};

export const useLocalHabboCategory = (categoryId: string, gender: 'M' | 'F') => {
  const { items, isLoading, error } = useLocalHabboClothing();
  const [filteredItems, setFilteredItems] = useState<LocalHabboClothingItem[]>([]);
  
  useEffect(() => {
    if (items.length > 0 && categoryId) {
      const filtered = items.filter(
        item => item.category === categoryId && (item.gender === gender || item.gender === 'U')
      );
      setFilteredItems(filtered);
    }
  }, [items, categoryId, gender]);
  
  return {
    items: filteredItems,
    isLoading,
    error
  };
};
