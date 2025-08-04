
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

// Mapeamento COMPLETO de categorias Flash Assets para ViaJovem
const FLASH_TO_VIAJOVEM_MAPPING = {
  // Cabeça e acessórios
  'face': 'hd',        // Rostos
  'hair': 'hr',        // Cabelos  
  'hat': 'ha',         // Chapéus
  'acc_head': 'ha',    // Acessórios de cabeça -> chapéus
  'acc_eye': 'ea',     // Óculos
  
  // Corpo e roupas
  'shirt': 'ch',       // Camisetas
  'top': 'ch',         // Tops -> camisetas
  'jacket': 'cc',      // Casacos
  'acc_chest': 'ca',   // Acessórios peito
  'acc_print': 'cp',   // Estampas
  
  // Pernas e pés
  'trousers': 'lg',    // Calças
  'pants': 'lg',       // Calças alternativo
  'shoes': 'sh',       // Sapatos
  'acc_waist': 'wa',   // Cintura
  
  // Outros acessórios
  'acc': 'ca',         // Acessórios genéricos -> peito
} as const;

const mapFlashToViaJovem = (flashItems: FlashAssetItem[]): ViaJovemFlashItem[] => {
  console.log('🔄 [FlashToViaJovem] Iniciando mapeamento de', flashItems.length, 'itens');
  
  const mapped = flashItems
    .map((item, index) => {
      // Extrair categoria base do swfName ou type
      let flashCategory = '';
      
      // Tentar extrair do swfName primeiro
      const swfMatch = item.swfName.match(/^([a-z_]+)_/);
      if (swfMatch) {
        flashCategory = swfMatch[1];
      } else {
        // Usar type como fallback
        flashCategory = item.type || item.category;
      }
      
      console.log(`📝 [FlashToViaJovem] Item ${index}: ${item.swfName} -> categoria flash: ${flashCategory}`);
      
      const viaJovemCategory = FLASH_TO_VIAJOVEM_MAPPING[flashCategory as keyof typeof FLASH_TO_VIAJOVEM_MAPPING];
      
      if (!viaJovemCategory) {
        console.warn(`⚠️ [FlashToViaJovem] Categoria não mapeada: ${flashCategory} para item: ${item.swfName}`);
        return null;
      }
      
      // Extrair gênero do nome do arquivo ou usar default
      const genderMatch = item.swfName.match(/_([MFU])_/);
      const gender = genderMatch ? genderMatch[1] as 'M' | 'F' | 'U' : item.gender || 'U';
      
      // Gerar figureId único e determinístico
      const figureId = generateUniqueFigureId(item.swfName, viaJovemCategory);
      
      return {
        id: `flash_${viaJovemCategory}_${figureId}_${gender}`, // ID único por categoria/figura/gênero
        name: formatItemName(item.swfName, viaJovemCategory, item.name),
        category: viaJovemCategory,
        gender,
        figureId,
        colors: generateCategoryColors(viaJovemCategory),
        thumbnail: generateSimpleThumbnail(viaJovemCategory, figureId, '1', gender),
        club: item.club === 'HC' ? 'hc' : 'normal',
        swfName: item.swfName,
        source: 'flash-assets'
      };
    })
    .filter(Boolean) as ViaJovemFlashItem[];

  // Log estatísticas por categoria
  const categoryStats = mapped.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 [FlashToViaJovem] Estatísticas por categoria:', categoryStats);
  console.log('✅ [FlashToViaJovem] Mapeamento concluído:', mapped.length, 'itens válidos');
  
  return mapped;
};

const generateUniqueFigureId = (swfName: string, category: string): string => {
  // Extrair ID numérico se existir
  const numericMatch = swfName.match(/(\d+)/);
  if (numericMatch) {
    return numericMatch[1];
  }
  
  // Criar hash único baseado no nome + categoria
  const combined = `${category}_${swfName}`;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 9999).toString();
};

const formatItemName = (swfName: string, category: string, originalName?: string): string => {
  if (originalName && originalName !== swfName) {
    return originalName;
  }
  
  const categoryNames = {
    'hd': 'Rosto',
    'hr': 'Cabelo', 
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'ch': 'Camiseta',
    'cc': 'Casaco',
    'ca': 'Acessório',
    'cp': 'Estampa',
    'lg': 'Calça',
    'sh': 'Sapato',
    'wa': 'Cintura'
  };
  
  // Extrair nome limpo do arquivo
  const namePart = swfName
    .replace(/^[a-z_]+_[MFU]?_?/, '')
    .replace('.swf', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return `${categoryNames[category as keyof typeof categoryNames]} ${namePart}`;
};

const generateCategoryColors = (category: string): string[] => {
  // Cores específicas por categoria baseadas no ViaJovem
  const categoryColorSets: Record<string, string[]> = {
    'hd': ['1', '2', '3', '4', '5'], // Tons de pele
    'hr': ['1', '2', '3', '4', '5', '6', '45', '61', '92', '104'], // Cores de cabelo
    'ch': ['1', '2', '3', '4', '5', '61', '92', '100', '101', '102'], // Roupas variadas
    'cc': ['1', '2', '3', '4', '61', '92', '100'],
    'lg': ['1', '2', '3', '4', '5', '61', '92', '100'],
    'sh': ['1', '2', '3', '4', '61', '92'],
    'ha': ['1', '2', '3', '4', '61', '92'],
    'ea': ['1', '2', '3', '4'],
    'ca': ['1', '61', '92', '100'],
    'cp': ['1', '2', '3', '4', '5'],
    'wa': ['1', '61', '92']
  };
  
  return categoryColorSets[category] || ['1', '2', '3', '4', '5'];
};

const generateSimpleThumbnail = (category: string, figureId: string, color: string, gender: string): string => {
  // Usar URLs simples como no ViaJovem original - SEM crop
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${color}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};

export const useFlashAssetsViaJovem = () => {
  const { data: flashData, isLoading, error } = useFlashAssetsClothing({ limit: 3000 });
  const [viaJovemItems, setViaJovemItems] = useState<ViaJovemFlashItem[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (flashData && flashData.length > 0) {
      console.log('🎯 [FlashAssetsViaJovem] Dados recebidos:', flashData.length, 'itens');
      
      const mappedItems = mapFlashToViaJovem(flashData);
      setViaJovemItems(mappedItems);
      
      // Calcular estatísticas por categoria
      const stats = mappedItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      setCategoryStats(stats);
      
      console.log('🎯 [FlashAssetsViaJovem] Mapeamento final:', {
        totalOriginal: flashData.length,
        totalMapeado: mappedItems.length,
        categorias: Object.keys(stats).length,
        estatisticas: stats
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
      
      console.log(`🔍 [FlashViaJovemCategory] Filtro aplicado:`, {
        categoria: categoryId,
        genero: gender,
        totalItens: items.length,
        itensFiltrados: filtered.length
      });
    }
  }, [items, categoryId, gender]);
  
  return {
    items: filteredItems,
    isLoading,
    error
  };
};
