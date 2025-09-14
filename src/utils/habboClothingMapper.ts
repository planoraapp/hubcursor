import { HabboEmotionClothing } from '@/hooks/useHabboEmotionAPI';

// Mapeamento de categorias da API para categorias do editor CORRIGIDO
const CATEGORY_MAPPING: Record<string, string> = {
  // PRIORIDADE 1: Acessórios específicos
  'acc_chest': 'ca',
  'acc_face': 'fa', 
  'acc_head': 'fa', // Padrão, mas pode ser 'ha' se for chapéu
  'acc_waist': 'wa',
  'acc_eye': 'ea',
  'acc_print': 'cp',
  
  // PRIORIDADE 2: Palavras-chave específicas
  'necklace': 'ca',
  'backpack': 'ca', 
  'tie': 'ca',
  'badge': 'ca',
  'medal': 'ca',
  'face_u': 'fa',
  
  // PRIORIDADE 3: Categorias gerais
  'hat': 'ha',
  'hair': 'hr', 
  'shirt': 'ch',
  'trousers': 'lg',
  'shoes': 'sh',
  'jacket': 'cc',
  'acc': 'ca', // Acessórios genéricos vão para peito
} as const;

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

// Sistema de categorização AVANÇADO sincronizado com backend
const parseItemCategory = (swfName: string): string => {
  if (!swfName || typeof swfName !== 'string') {
        return 'ch';
  }

  const lowerSwf = swfName.toLowerCase();
    // === FASE 1: REGRAS ESPECÍFICAS COM PRIORIDADE MÁXIMA ===
  
  // 1. ACESSÓRIOS DE PEITO - PRIORIDADE TOTAL
  if (lowerSwf.includes('acc_chest') || 
      lowerSwf.includes('necklace') || 
      lowerSwf.includes('backpack') || 
      lowerSwf.includes('tie') || 
      lowerSwf.includes('badge') || 
      lowerSwf.includes('medal')) {
        return 'ca';
  }
  
  // 2. ACESSÓRIOS DE ROSTO - PRIORIDADE TOTAL
  if (lowerSwf.includes('acc_face') || lowerSwf.includes('face_u')) {
        return 'fa';
  }
  
  // 3. ACESSÓRIOS DE CABEÇA - LÓGICA DIFERENCIADA
  if (lowerSwf.includes('acc_head')) {
    // Sub-regra: chapéus vão para 'ha', outros acessórios para 'fa'
    if (lowerSwf.includes('hat') || 
        lowerSwf.includes('cap') || 
        lowerSwf.includes('helmet') || 
        lowerSwf.includes('crown') || 
        lowerSwf.includes('tiara')) {
            return 'ha';
    } else {
            return 'fa';
    }
  }
  
  // 4. OUTROS ACESSÓRIOS ESPECÍFICOS
  if (lowerSwf.includes('acc_waist')) {
        return 'wa';
  }
  
  if (lowerSwf.includes('acc_eye')) {
        return 'ea';
  }
  
  if (lowerSwf.includes('acc_print')) {
        return 'cp';
  }
  
  // === FASE 2: MAPEAMENTO GERAL ===
  for (const [pattern, category] of Object.entries(CATEGORY_MAPPING)) {
    if (lowerSwf.includes(pattern)) {
      console.log(`✅ [HabboMapper] Padrão geral: ${swfName} -> ${category} (padrão: ${pattern})`);
      return category;
    }
  }
  
  // === FALLBACK ===
    return 'ch';
};

// Converter item da API para formato do editor COM NOVA LÓGICA
export const mapHabboEmotionItem = (item: HabboEmotionClothing) => {
  if (!item || typeof item !== 'object') {
        return null;
  }

  try {
    // USAR NOVA LÓGICA DE CATEGORIZAÇÃO
    const detectedCategory = parseItemCategory(item.swf_name || item.name || '');
    
    const mappedItem = {
      id: item.id?.toString() || Math.random().toString(),
      swfCode: item.swf_name || 'unknown',
      name: item.name || 'Item Desconhecido',
      category: detectedCategory,
      type: item.type || 'clothing',
      gender: item.gender || 'U',
      rarity: item.rarity?.toLowerCase() || 'normal',
      colors: item.colors?.map(c => c.toString()) || ['1'],
      thumbnail: item.thumbnail || ''
    };

    console.log(`✅ [HabboMapper] Item mapeado: ${mappedItem.name} (${mappedItem.category})`);
    return mappedItem;
  } catch (error) {
        return null;
  }
};

// Agrupar itens por categoria
export const groupItemsByCategory = (items: HabboEmotionClothing[] | undefined) => {
    // Verificar se items é um array válido
  if (!items || !Array.isArray(items)) {
        return {};
  }

  try {
    const grouped = items.reduce((acc, item) => {
      const mappedItem = mapHabboEmotionItem(item);
      
      if (!mappedItem) {
                return acc;
      }
      
      const category = mappedItem.category;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push(mappedItem);
      return acc;
    }, {} as Record<string, ReturnType<typeof mapHabboEmotionItem>[]>);

    console.log('✅ Items grouped successfully:', Object.keys(grouped).map(k => `${k}: ${grouped[k].length}`));
    return grouped;
  } catch (error) {
        return {};
  }
};

// Filtrar itens por busca
export const filterItems = (items: ReturnType<typeof mapHabboEmotionItem>[], searchTerm: string) => {
  if (!searchTerm) return items;
  
  return items.filter(item => {
    if (!item) return false;
    return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.swfCode.toLowerCase().includes(searchTerm.toLowerCase());
  });
};

// Agrupar por raridade
export const groupByRarity = (items: ReturnType<typeof mapHabboEmotionItem>[]) => {
  return items.filter(Boolean).reduce((acc, item) => {
    if (!acc[item.rarity]) {
      acc[item.rarity] = [];
    }
    acc[item.rarity].push(item);
    return acc;
  }, {} as Record<string, typeof items>);
};
