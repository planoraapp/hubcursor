
import { HabboEmotionClothing } from '@/hooks/useHabboEmotionAPI';

// Mapeamento de categorias da API para categorias do editor
const CATEGORY_MAPPING: Record<string, string> = {
  'hat': 'ha',
  'hair': 'hr', 
  'shirt': 'ch',
  'trousers': 'lg',
  'shoes': 'sh',
  'jacket': 'cc',
  'acc_eye': 'ea',
  'acc_head': 'ha',
  'acc_chest': 'ca',
  'acc_waist': 'wa',
  'acc_print': 'cp',
  'acc_face': 'fa'
};

// Mapear raridade para cores dos badges
export const getRarityColor = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'nft': return 'bg-blue-600';
    case 'hc': return 'bg-yellow-500';
    case 'ltd': return 'bg-purple-600';
    case 'sellable':
    case 'rare': return 'bg-green-600';
    default: return 'bg-gray-500';
  }
};

// Mapear raridade para texto
export const getRarityText = (rarity: string): string => {
  switch (rarity?.toLowerCase()) {
    case 'nft': return 'NFT';
    case 'hc': return 'HC';
    case 'ltd': return 'LTD';
    case 'sellable':
    case 'rare': return 'RARO';
    default: return 'COMUM';
  }
};

// Converter item da API para formato do editor
export const mapHabboEmotionItem = (item: HabboEmotionClothing) => {
  // Extrair categoria do nome do SWF
  const swfCategory = item.swf_name.split('_')[0];
  const editorCategory = CATEGORY_MAPPING[swfCategory] || 'ch';
  
  return {
    id: item.id.toString(),
    swfCode: item.swf_name,
    name: item.name,
    category: editorCategory,
    type: item.type,
    gender: item.gender,
    rarity: item.rarity?.toLowerCase() || 'normal',
    colors: item.colors?.map(c => c.toString()) || ['1'],
    thumbnail: item.thumbnail
  };
};

// Agrupar itens por categoria
export const groupItemsByCategory = (items: HabboEmotionClothing[]) => {
  return items.reduce((acc, item) => {
    const mappedItem = mapHabboEmotionItem(item);
    const category = mappedItem.category;
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(mappedItem);
    return acc;
  }, {} as Record<string, ReturnType<typeof mapHabboEmotionItem>[]>);
};

// Filtrar itens por busca
export const filterItems = (items: ReturnType<typeof mapHabboEmotionItem>[], searchTerm: string) => {
  if (!searchTerm) return items;
  
  return items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.swfCode.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Agrupar por raridade
export const groupByRarity = (items: ReturnType<typeof mapHabboEmotionItem>[]) => {
  return items.reduce((acc, item) => {
    if (!acc[item.rarity]) {
      acc[item.rarity] = [];
    }
    acc[item.rarity].push(item);
    return acc;
  }, {} as Record<string, typeof items>);
};
