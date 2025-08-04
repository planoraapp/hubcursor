import { useState, useEffect } from 'react';
import { useFlashAssetsClothing, FlashAssetItem } from './useFlashAssetsClothing';
import { getCategoryFromSwfName, generateIsolatedThumbnail } from '@/lib/improvedCategoryMapper';

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
  console.log('🔄 [FlashToViaJovem] Iniciando mapeamento melhorado de', flashItems.length, 'itens');
  
  const mapped = flashItems
    .map((item, index) => {
      // Usar o novo sistema de categorização melhorado
      const detectedCategory = getCategoryFromSwfName(item.swfName);
      
      console.log(`📝 [FlashToViaJovem] Item ${index}: ${item.swfName} -> categoria: ${detectedCategory}`);
      
      // Extrair figureId de forma mais inteligente
      const figureId = extractFigureId(item.swfName, item.figureId);
      
      // Determinar gênero de forma mais precisa
      const gender = determineGender(item.swfName, item.gender);
      
      return {
        id: `flash_${detectedCategory}_${figureId}_${gender}`,
        name: formatItemName(item.swfName, detectedCategory, item.name),
        category: detectedCategory,
        gender,
        figureId,
        colors: generateCategoryColors(detectedCategory),
        thumbnail: generateIsolatedThumbnail(detectedCategory, figureId, '1', gender),
        club: item.club === 'HC' ? 'hc' : 'normal',
        swfName: item.swfName,
        source: 'flash-assets'
      };
    })
    .filter(Boolean) as ViaJovemFlashItem[];

  // Log estatísticas melhoradas
  const categoryStats = mapped.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('📊 [FlashToViaJovem] Estatísticas por categoria:', categoryStats);
  console.log('✅ [FlashToViaJovem] Mapeamento melhorado concluído:', mapped.length, 'itens válidos');
  
  return mapped;
};

const extractFigureId = (swfName: string, originalFigureId?: string): string => {
  if (originalFigureId) return originalFigureId;
  
  // Extrair ID numérico do nome do arquivo
  const numericMatches = swfName.match(/(\d+)/g);
  if (numericMatches && numericMatches.length > 0) {
    // Pegar o maior número encontrado (geralmente é o ID)
    return numericMatches.sort((a, b) => parseInt(b) - parseInt(a))[0];
  }
  
  // Criar hash determinístico se não houver ID
  let hash = 0;
  for (let i = 0; i < swfName.length; i++) {
    const char = swfName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 9999).toString();
};

const determineGender = (swfName: string, originalGender?: 'M' | 'F' | 'U'): 'M' | 'F' | 'U' => {
  if (originalGender && originalGender !== 'U') return originalGender;
  
  const lowerName = swfName.toLowerCase();
  
  // Padrões específicos para gênero
  if (lowerName.includes('_f_') || lowerName.includes('female')) return 'F';
  if (lowerName.includes('_m_') || lowerName.includes('male')) return 'M';
  if (lowerName.includes('dress') || lowerName.includes('skirt')) return 'F';
  
  return 'U'; // Unissex por padrão
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
