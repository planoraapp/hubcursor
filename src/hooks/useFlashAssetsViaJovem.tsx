
import { useState, useEffect } from 'react';
import { useFlashAssetsClothing, FlashAssetItem } from './useFlashAssetsClothing';

export interface ViaJovemFlashItem {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  thumbnail: string;
  club: 'hc' | 'normal';
  swfName: string;
  source: 'flash-assets';
}

// Mapeamento de categorias Flash Assets para ViaJovem
const FLASH_TO_VIAJOVEM_MAPPING = {
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

const mapFlashToViaJovem = (flashItems: FlashAssetItem[]): ViaJovemFlashItem[] => {
  return flashItems
    .map(item => {
      // Extrair categoria base do swfName (ex: shirt_F_babydoll -> shirt)
      const categoryMatch = item.swfName.match(/^([a-z]+)_/);
      if (!categoryMatch) return null;
      
      const flashCategory = categoryMatch[1];
      const viaJovemCategory = FLASH_TO_VIAJOVEM_MAPPING[flashCategory as keyof typeof FLASH_TO_VIAJOVEM_MAPPING];
      
      if (!viaJovemCategory) return null;
      
      // Extrair gênero do nome do arquivo
      const genderMatch = item.swfName.match(/_([MFU])_/);
      const gender = genderMatch ? genderMatch[1] as 'M' | 'F' | 'U' : 'U';
      
      // Gerar ID único baseado no swfName
      const figureId = generateFigureId(item.swfName);
      
      return {
        id: `flash_${viaJovemCategory}_${figureId}`,
        name: formatItemName(item.swfName, viaJovemCategory),
        category: viaJovemCategory,
        gender,
        figureId,
        colors: ['1', '2', '3', '4', '5', '61', '92'], // Cores padrão ViaJovem
        thumbnail: generateViaJovemThumbnail(viaJovemCategory, figureId, '1', gender),
        club: item.club === 'HC' ? 'hc' : 'normal',
        swfName: item.swfName,
        source: 'flash-assets'
      };
    })
    .filter(Boolean) as ViaJovemFlashItem[];
};

const generateFigureId = (swfName: string): string => {
  // Extrair ID numérico ou criar um hash do nome
  const numericMatch = swfName.match(/(\d+)/);
  if (numericMatch) {
    return numericMatch[1];
  }
  
  // Criar ID baseado no hash do nome
  let hash = 0;
  for (let i = 0; i < swfName.length; i++) {
    const char = swfName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit integer
  }
  return Math.abs(hash % 9999).toString();
};

const formatItemName = (swfName: string, category: string): string => {
  const categoryNames = {
    'ch': 'Camiseta',
    'hr': 'Cabelo', 
    'ha': 'Chapéu',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ca': 'Acessório',
    'cc': 'Casaco',
    'hd': 'Rosto'
  };
  
  // Extrair nome limpo do arquivo
  const namePart = swfName.replace(/^[a-z]+_[MFU]?_?/, '').replace('.swf', '');
  const cleanName = namePart.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return `${categoryNames[category as keyof typeof categoryNames]} ${cleanName}`;
};

const generateViaJovemThumbnail = (category: string, figureId: string, color: string, gender: string): string => {
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${color}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};

export const useFlashAssetsViaJovem = () => {
  const { data: flashData, isLoading, error } = useFlashAssetsClothing({ limit: 3000 });
  const [viaJovemItems, setViaJovemItems] = useState<ViaJovemFlashItem[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (flashData && flashData.length > 0) {
      const mappedItems = mapFlashToViaJovem(flashData);
      setViaJovemItems(mappedItems);
      
      // Calcular estatísticas por categoria
      const stats = mappedItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setCategoryStats(stats);
      
      console.log('🎯 [Flash ViaJovem] Items mapeados:', {
        total: mappedItems.length,
        categorias: Object.keys(stats).length,
        stats
      });
    }
  }, [flashData]);
  
  return {
    items: viaJovemItems,
    categoryStats,
    isLoading,
    error,
    totalItems: viaJovemItems.length
  };
};

export const useFlashViaJovemCategory = (categoryId: string, gender: 'M' | 'F') => {
  const { items, isLoading, error } = useFlashAssetsViaJovem();
  const [filteredItems, setFilteredItems] = useState<ViaJovemFlashItem[]>([]);
  
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
