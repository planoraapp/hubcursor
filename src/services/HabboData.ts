// src/services/HabboData.ts
// Dataset oficial e validado do Habbo Avatar Editor
// Baseado no figuremap.xml oficial do Habbo Flash/HTML5
// https://images.habbo.com/gordon/flash-assets-PRODUCTION-202601121522-867048149/figuremap.xml

export interface HabboClothingSet {
  id: number;
  gender: 'M' | 'F' | 'U';
  club?: boolean;
}

export interface HabboClothingCategory {
  type: string;
  label: string;
  sets: HabboClothingSet[];
}

export const HABBO_CLOTHING_SETS: HabboClothingCategory[] = [
  {
    "type": "hd", // Rosto (Head)
    "label": "Rosto",
    "sets": [
      { id: 180, gender: "M" }, { id: 190, gender: "M" }, { id: 200, gender: "M" },
      { id: 600, gender: "F" }, { id: 610, gender: "F" }, { id: 620, gender: "F" }
      // ... Adicione lógica para carregar mais se necessário
    ]
  },
  {
    "type": "hr", // Cabelo
    "label": "Cabelo",
    "sets": [
      { id: 100, gender: "M" }, { id: 110, gender: "M" }, { id: 120, gender: "M" }, { id: 130, gender: "M" },
      { id: 140, gender: "M" }, { id: 150, gender: "M" }, { id: 165, gender: "M" }, { id: 170, gender: "M" },
      { id: 500, gender: "F" }, { id: 510, gender: "F" }, { id: 515, gender: "F" }, { id: 520, gender: "F" },
      { id: 3020, gender: "M", club: true }, { id: 3162, gender: "M", club: true }
    ]
  },
  {
    "type": "ha", // Chapéus
    "label": "Chapéus",
    "sets": [
      { id: 1010, gender: "U" }, { id: 1027, gender: "U", club: true }, { id: 3026, gender: "U", club: true },
      { id: 3117, gender: "U" }, { id: 3118, gender: "U", club: true }, { id: 3139, gender: "U", club: true }
    ]
  },
  {
    "type": "he", // Acessórios de Cabeça
    "label": "Acess. Cabeça",
    "sets": [
      { id: 1601, gender: "U" }, { id: 1602, gender: "U" }, { id: 1605, gender: "U" },
      { id: 3069, gender: "U", club: true }, { id: 3070, gender: "U", club: true }
    ]
  },
  {
    "type": "ea", // Óculos
    "label": "Óculos",
    "sets": [
      { id: 1401, gender: "U" }, { id: 1402, gender: "U", club: true }, { id: 1403, gender: "U" },
      { id: 1404, gender: "U" }, { id: 1405, gender: "U", club: true }, { id: 1406, gender: "U" },
      { id: 3083, gender: "U", club: true }, { id: 3107, gender: "U", club: true }
    ]
  },
  {
    "type": "fa", // Acessórios de Rosto / Barba
    "label": "Rosto/Barba",
    "sets": [
      { id: 1201, gender: "U" }, { id: 1202, gender: "U" }, { id: 1203, gender: "U", club: true },
      { id: 1204, gender: "U" }, { id: 1205, gender: "U" }, { id: 1206, gender: "U" },
      { id: 3344, gender: "U" }, { id: 3345, gender: "U" }
    ]
  },
  {
    "type": "ch", // Camisas (Chest)
    "label": "Camisas",
    "sets": [
      { id: 210, gender: "M" }, { id: 215, gender: "M" }, { id: 220, gender: "M" }, { id: 225, gender: "M" },
      { id: 230, gender: "M" }, { id: 635, gender: "F" }, { id: 640, gender: "F" }, { id: 650, gender: "F" },
      { id: 804, gender: "M" }, { id: 3030, gender: "M" }, { id: 3032, gender: "M", club: true }
    ]
  },
  {
    "type": "cc", // Jaquetas (Jackets)
    "label": "Jaquetas",
    "sets": [
      { id: 3002, gender: "M", club: true }, { id: 3003, gender: "F", club: true }, { id: 3039, gender: "M", club: true },
      { id: 3186, gender: "M", club: true }, { id: 3232, gender: "U", club: true }, { id: 3246, gender: "U", club: true },
      { id: 3326, gender: "U" }, { id: 3327, gender: "U" }, { id: 3360, gender: "U" }
    ]
  },
  {
    "type": "cp", // Estampas (Chest Prints)
    "label": "Estampas",
    "sets": [
      // Itens não-HC (do HTML oficial)
      { id: 3119, gender: "U" },
      { id: 3120, gender: "U" },
      { id: 3121, gender: "U" },
      { id: 3122, gender: "U" },
      { id: 3123, gender: "U" },
      { id: 3124, gender: "U" },
      { id: 3125, gender: "U" },
      { id: 3126, gender: "U" },
      { id: 3127, gender: "U" },
      { id: 3128, gender: "U" },
      { id: 3284, gender: "U" },
      { id: 3286, gender: "U" },
      { id: 3288, gender: "U" },
      // Itens HC (do HTML oficial)
      { id: 3204, gender: "M", club: true },
      { id: 3205, gender: "M", club: true },
      { id: 3307, gender: "U", club: true },
      { id: 3308, gender: "U", club: true },
      { id: 3309, gender: "U", club: true },
      { id: 3310, gender: "U", club: true },
      { id: 3311, gender: "U", club: true },
      { id: 3312, gender: "U", club: true },
      { id: 3313, gender: "U", club: true },
      { id: 3314, gender: "U", club: true },
      { id: 3315, gender: "U", club: true },
      { id: 3316, gender: "U", club: true },
      { id: 3317, gender: "U", club: true },
      // Itens vendáveis (do HTML oficial)
      { id: 3402, gender: "U" },
      { id: 3403, gender: "U" }
    ]
  },
  {
    "type": "ca", // Acessórios de Pescoço (Chest Accessories)
    "label": "Acess. Pescoço",
    "sets": [
      { id: 1801, gender: "U" }, { id: 1805, gender: "U" }, { id: 1812, gender: "U" },
      { id: 3084, gender: "U", club: true }, { id: 3131, gender: "U", club: true }, { id: 3410, gender: "U" }
    ]
  },
  {
    "type": "lg", // Calças (Legs)
    "label": "Calças",
    "sets": [
      { id: 270, gender: "M" }, { id: 275, gender: "M" }, { id: 280, gender: "M" }, { id: 285, gender: "M" },
      { id: 695, gender: "F" }, { id: 700, gender: "F" }, { id: 715, gender: "F" },
      { id: 3006, gender: "F", club: true }, { id: 3078, gender: "U" }
    ]
  },
  {
    "type": "sh", // Sapatos (Shoes)
    "label": "Sapatos",
    "sets": [
      { id: 290, gender: "M" }, { id: 300, gender: "M" }, { id: 725, gender: "F" }, { id: 730, gender: "F" },
      { id: 905, gender: "U" }, { id: 906, gender: "U" }, { id: 3419, gender: "U" }
    ]
  },
  {
    "type": "wa", // Cintos (Waist)
    "label": "Cintos",
    "sets": [
      { id: 2001, gender: "U" }, { id: 2004, gender: "U" }, { id: 2012, gender: "U" },
      { id: 3072, gender: "U", club: true }, { id: 3074, gender: "U" }
    ]
  }
];

/**
 * Gera URL da imagem do Habbo para um item específico
 * @param categoryType - Tipo da categoria (hr, ha, ch, etc.)
 * @param itemId - ID do item
 * @param color - Cor opcional (padrão: "7")
 * @param gender - Gênero (M, F, U)
 * @param size - Tamanho da imagem (s, m, l)
 * @returns URL da imagem
 */
export function generateHabboImageUrl(
  categoryType: string,
  itemId: number,
  color: string = "7",
  gender: 'M' | 'F' | 'U' = 'M',
  size: 's' | 'm' | 'l' = 's'
): string {
  let figureString: string;

  // Para estampas (cp), usar formato especial: cp-{ID}-- (dois hífens, sem cor)
  if (categoryType === 'cp') {
    figureString = `${categoryType}-${itemId}--`;
  }
  // Para camisetas (ch), usar duotone padrão
  else if (categoryType === 'ch') {
    figureString = `${categoryType}-${itemId}-66-61`;
  }
  // Para outras categorias, usar cor especificada
  else {
    figureString = `${categoryType}-${itemId}-${color}`;
  }

  const headOnly = ['hr', 'hd', 'fa'].includes(categoryType) ? '&headonly=1' : '';

  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=${size}${headOnly}&img_format=png`;
}

/**
 * Encontra uma categoria pelo tipo
 */
export function getCategoryByType(type: string): HabboClothingCategory | undefined {
  return HABBO_CLOTHING_SETS.find(category => category.type === type);
}

/**
 * Filtra itens por gênero
 */
export function filterSetsByGender(sets: HabboClothingSet[], gender: 'M' | 'F' | 'U' | 'all'): HabboClothingSet[] {
  if (gender === 'all') return sets;
  return sets.filter(set => set.gender === 'U' || set.gender === gender);
}

/**
 * Filtra itens por status HC (Habbo Club)
 */
export function filterSetsByClub(sets: HabboClothingSet[], showClubOnly: boolean = false): HabboClothingSet[] {
  if (!showClubOnly) return sets;
  return sets.filter(set => set.club === true);
}

/**
 * Obtém o nome do visual de um item baseado no tipo e ID
 * @param itemType - Tipo da categoria (hr, ha, ch, etc.)
 * @param itemId - ID do item
 * @returns Nome do visual ou null se não encontrado
 */
export function getItemVisualName(itemType: string, itemId: number): string | null {
  // Importar dinamicamente o mapa de nomes (lazy loading para performance)
  try {
    const HABBO_ITEM_NAMES = require('../habbo_item_names.json');
    const key = `${itemType}-${itemId}`;
    return HABBO_ITEM_NAMES[key] || null;
  } catch (error) {
    console.warn('Mapa de nomes dos itens não encontrado');
    return null;
  }
}