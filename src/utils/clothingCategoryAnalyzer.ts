// src/utils/clothingCategoryAnalyzer.ts
// Sistema melhorado para categorização de roupas do Habbo baseado na orientação fornecida

export interface ClothingCategoryInfo {
  type: 'NORMAL' | 'HC' | 'NFT' | 'RARE' | 'LTD' | 'SELLABLE';
  isSellable: boolean;
  isDuotone: boolean;
  primaryColors: string[];
  secondaryColors?: string[]; // Para roupas duotone
  furnidataClass?: string;
  nftCollection?: string;
}

export interface EnhancedClothingItem {
  id: string;
  figureId: string;
  category: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: string;
  sellable: boolean;
  colorable: boolean;
  selectable: boolean;
  colorindex: string[];
  colors: string[];
  secondaryColors?: string[];
  categoryInfo: ClothingCategoryInfo;
  swfUrl?: string;
  furnidataClass?: string;
  nftCollection?: string;
}

// Coleções NFT conhecidas
const NFT_COLLECTIONS = [
  'nft2025', 'nft2024', 'nft2023', 'nft', 'nftmint', 'testing'
];

/**
 * Analisa e categoriza uma roupa baseada nos dados do figuredata e furnidata
 */
export function analyzeClothingCategory(
  figureDataItem: any,
  furnidataItem?: any,
  figureMapItem?: any
): ClothingCategoryInfo {
  const club = figureDataItem.club || '0';
  const sellable = figureDataItem.sellable || '0';
  const colorindex = figureDataItem.colorindex || [];
  const colors = figureDataItem.colors || [];

  // 1. Verificar se é NFT (baseado no furnidata)
  if (furnidataItem?.furniline && NFT_COLLECTIONS.includes(furnidataItem.furniline)) {
    return {
      type: 'NFT',
      isSellable: true,
      isDuotone: checkIfDuotone(colorindex),
      primaryColors: colors,
      secondaryColors: getSecondaryColors(colors, colorindex),
      furnidataClass: furnidataItem.classname,
      nftCollection: furnidataItem.furniline
    };
  }

  // 2. Verificar se é RARE (classname começa com "clothing_r")
  if (furnidataItem?.classname?.startsWith('clothing_r')) {
    return {
      type: 'RARE',
      isSellable: sellable === '1',
      isDuotone: checkIfDuotone(colorindex),
      primaryColors: colors,
      secondaryColors: getSecondaryColors(colors, colorindex),
      furnidataClass: furnidataItem.classname
    };
  }

  // 3. Verificar se é LTD (classname começa com "clothing_ltd")
  if (furnidataItem?.classname?.startsWith('clothing_ltd')) {
    return {
      type: 'LTD',
      isSellable: sellable === '1',
      isDuotone: checkIfDuotone(colorindex),
      primaryColors: colors,
      secondaryColors: getSecondaryColors(colors, colorindex),
      furnidataClass: furnidataItem.classname
    };
  }

  // 4. Verificar se é HC (club="2" no figuredata) - CORRIGIDO
  if (club === '2') {
    return {
      type: 'HC',
      isSellable: sellable === '1',
      isDuotone: checkIfDuotone(colorindex),
      primaryColors: colors,
      secondaryColors: getSecondaryColors(colors, colorindex)
    };
  }

  // 5. Verificar se é SELLABLE (sellable="1" no figuredata)
  if (sellable === '1') {
    return {
      type: 'SELLABLE',
      isSellable: true,
      isDuotone: checkIfDuotone(colorindex),
      primaryColors: colors,
      secondaryColors: getSecondaryColors(colors, colorindex)
    };
  }

  // 6. Roupas normais/antigas (sem sellable="1")
  return {
    type: 'NORMAL',
    isSellable: false,
    isDuotone: checkIfDuotone(colorindex),
    primaryColors: colors,
    secondaryColors: getSecondaryColors(colors, colorindex)
  };
}

/**
 * Verifica se a roupa é duotone (tem colorindex 1 e 2)
 */
function checkIfDuotone(colorindex: string[]): boolean {
  if (!Array.isArray(colorindex)) return false;
  return colorindex.includes('1') && colorindex.includes('2');
}

/**
 * Extrai cores secundárias para roupas duotone
 */
function getSecondaryColors(colors: string[], colorindex: string[]): string[] | undefined {
  if (!checkIfDuotone(colorindex)) return undefined;
  
  // Para roupas duotone, assumimos que as cores estão divididas entre primárias e secundárias
  // Esta lógica pode ser refinada baseada nos dados reais
  const midPoint = Math.ceil(colors.length / 2);
  return colors.slice(midPoint);
}

/**
 * Processa dados do figuredata para criar itens de roupa categorizados
 */
export function processFigureDataWithCategories(
  figureData: any,
  furnidataMap?: Map<string, any>,
  figureMapData?: any
): EnhancedClothingItem[] {
  const items: EnhancedClothingItem[] = [];

  if (!figureData.settype) {
    console.warn('⚠️ No settype found in figuredata');
    return items;
  }

  // Processar cada categoria (settype)
  for (const [categoryId, categoryData] of Object.entries(figureData.settype)) {
    if (typeof categoryData !== 'object' || !categoryData) continue;
    
    const sets = (categoryData as any).sets || {};
    
    // Processar cada set (item de roupa)
    for (const [setId, setData] of Object.entries(sets)) {
      if (typeof setData !== 'object' || !setData) continue;
      
      const set = setData as any;
      
      // Buscar dados do furnidata se disponível
      const furnidataItem = furnidataMap?.get(`${categoryId}_${setId}`);
      const figureMapItem = figureMapData?.[categoryId]?.find((item: any) => item.id === setId);
      
      // Analisar categoria da roupa
      const categoryInfo = analyzeClothingCategory(set, furnidataItem, figureMapItem);
      
      // Extrair cores disponíveis
      const colors = extractColorsFromSet(set, figureData.palettes || {});
      const secondaryColors = categoryInfo.secondaryColors;
      
      // Criar item categorizado
      const item: EnhancedClothingItem = {
        id: `${categoryId}_${setId}`,
        figureId: setId,
        category: categoryId,
        name: `${getCategoryName(categoryId)} ${setId}`,
        gender: set.gender || 'U',
        club: set.club || '0',
        sellable: set.sellable === '1',
        colorable: set.colorable === '1',
        selectable: set.selectable !== '0',
        colorindex: set.colorindex || [],
        colors,
        secondaryColors,
        categoryInfo,
        swfUrl: figureMapItem?.swfUrl,
        furnidataClass: furnidataItem?.classname,
        nftCollection: furnidataItem?.furniline
      };
      
      // Só adicionar se for selecionável
      if (item.selectable) {
        items.push(item);
      }
    }
  }
  
  return items;
}

/**
 * Extrai cores disponíveis de um set baseado nas paletas
 */
function extractColorsFromSet(set: any, palettes: any): string[] {
  const colors: string[] = [];
  
  if (set.color) {
    const colorArray = Array.isArray(set.color) ? set.color : [set.color];
    colors.push(...colorArray.map((c: any) => c.id));
  }
  
  // Se não tem cores específicas, usar paleta padrão da categoria
  if (colors.length === 0) {
    const palette = palettes[set.type];
    if (palette && palette.colors) {
      colors.push(...palette.colors.map((c: any) => c.id));
    }
  }
  
  return colors.length > 0 ? colors : ['1'];
}

/**
 * Obtém nome da categoria
 */
function getCategoryName(categoryId: string): string {
  const categoryNames: Record<string, string> = {
    'hd': 'Rostos',
    'hr': 'Cabelos',
    'ha': 'Chapéus',
    'he': 'Acessórios da Cabeça',
    'ea': 'Óculos',
    'fa': 'Máscaras',
    'ch': 'Camisas',
    'cc': 'Jaquetas',
    'cp': 'Capes',
    'lg': 'Calças',
    'sh': 'Sapatos',
    'wa': 'Acessórios da Cintura',
    'ca': 'Acessórios do Peito',
    'dr': 'Vestidos',
    'sk': 'Saias',
    'su': 'Trajes',
    'bd': 'Corpos',
    'rh': 'Mão Direita',
    'lh': 'Mão Esquerda'
  };
  
  return categoryNames[categoryId] || categoryId;
}

/**
 * Gera URL de imagem para roupas duotone
 */
export function generateDuotoneImageUrl(
  category: string,
  figureId: string,
  primaryColor: string,
  secondaryColor: string,
  gender: string = 'U'
): string {
  // Para roupas duotone, usar a paleta 3 e especificar ambas as cores
  const figure = `${category}-${figureId}-${primaryColor}-${secondaryColor}`;
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
}

/**
 * Gera URL de imagem padrão
 */
export function generateStandardImageUrl(
  category: string,
  figureId: string,
  color: string,
  gender: string = 'U'
): string {
  const figure = `${category}-${figureId}-${color}`;
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
}

/**
 * Obtém estatísticas de categorização
 */
export function getCategorizationStats(items: EnhancedClothingItem[]) {
  const stats = {
    total: items.length,
    normal: 0,
    hc: 0,
    nft: 0,
    rare: 0,
    ltd: 0,
    sellable: 0,
    duotone: 0
  };
  
  items.forEach(item => {
    stats[item.categoryInfo.type.toLowerCase() as keyof typeof stats]++;
    if (item.categoryInfo.isDuotone) stats.duotone++;
  });
  
  return stats;
}
