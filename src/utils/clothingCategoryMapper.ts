// Mapeamento correto de tipos SWF para categorias do Habbo
// Baseado na documentação oficial do Habbo

export interface SWFTypeMapping {
  swfPrefix: string;
  habboCategory: string;
  description: string;
}

export const SWF_TO_HABBO_CATEGORY_MAP: SWFTypeMapping[] = [
  // CORPO E ROSTO
  { swfPrefix: 'face_', habboCategory: 'hd', description: 'Cabeças/Rostos' },
  { swfPrefix: 'head_', habboCategory: 'hd', description: 'Cabeças/Rostos' },

  // Roupas do Corpo - Base
  { swfPrefix: 'shirt_', habboCategory: 'ch', description: 'Camisetas/Shirts' },
  { swfPrefix: 'jacket_', habboCategory: 'cc', description: 'Casacos/Coats' },

  // Calças/Saias - Expandido
  { swfPrefix: 'trousers_', habboCategory: 'lg', description: 'Calças/Legs' },
  { swfPrefix: 'pants_', habboCategory: 'lg', description: 'Calças/Legs' },
  { swfPrefix: 'bottoms_', habboCategory: 'lg', description: 'Calças/Saias' },
  { swfPrefix: 'skirt_', habboCategory: 'lg', description: 'Saias' },
  { swfPrefix: 'shorts_', habboCategory: 'lg', description: 'Shorts' },
  { swfPrefix: 'leggings_', habboCategory: 'lg', description: 'Leggings' },
  { swfPrefix: 'jeans_', habboCategory: 'lg', description: 'Jeans' },
  { swfPrefix: 'cargo_', habboCategory: 'lg', description: 'Calças Cargo' },
  { swfPrefix: 'sweatpants_', habboCategory: 'lg', description: 'Calças de Moletom' },
  { swfPrefix: 'uniform_', habboCategory: 'lg', description: 'Uniforme (calças)' },
  { swfPrefix: 'costume_', habboCategory: 'lg', description: 'Fantasia (calças)' },
  { swfPrefix: 'armor_', habboCategory: 'lg', description: 'Armadura (pernas)' },
  { swfPrefix: 'kimono_', habboCategory: 'lg', description: 'Kimono (pernas)' },
  { swfPrefix: 'bikini_', habboCategory: 'lg', description: 'Biquíni (parte inferior)' },
  { swfPrefix: 'swimsuit_', habboCategory: 'lg', description: 'Maiô (parte inferior)' },

  // Acessórios de Cabeça
  { swfPrefix: 'hat_', habboCategory: 'ha', description: 'Chapéus/Hats' },
  { swfPrefix: 'acc_head_', habboCategory: 'he', description: 'Acessórios de Cabeça' },
  { swfPrefix: 'hair_', habboCategory: 'hr', description: 'Cabelos/Hair' },

  // Acessórios Oculares e Faciais
  { swfPrefix: 'acc_eye_', habboCategory: 'ea', description: 'Óculos/Eye Accessories' },
  { swfPrefix: 'acc_face_', habboCategory: 'fa', description: 'Acessórios Faciais/Face Accessories' },

  // Acessórios de Corpo
  { swfPrefix: 'acc_chest_', habboCategory: 'ca', description: 'Acessórios de Peito/Chest Accessories' },
  { swfPrefix: 'acc_waist_', habboCategory: 'wa', description: 'Cintos/Waist Accessories' },
  { swfPrefix: 'acc_print_', habboCategory: 'cp', description: 'Estampas/Prints' },

  // Sapatos
  { swfPrefix: 'shoes_', habboCategory: 'sh', description: 'Sapatos/Shoes' },
  { swfPrefix: 'footwear_', habboCategory: 'sh', description: 'Calçados' },

  // Efeitos Especiais (FX)
  { swfPrefix: 'fx', habboCategory: 'fx', description: 'Efeitos/Effects' },

  // Items Especiais
  { swfPrefix: 'hh_human_item', habboCategory: 'ri', description: 'Item Direito/Right Item' },
  { swfPrefix: 'hh_pets', habboCategory: 'psd', description: 'Pets/Pet Shadow' },
  { swfPrefix: 'hh_people_pool', habboCategory: 'ss', description: 'Piscina/Pool Shadow' },
];

/**
 * Mapeia um código SWF para a categoria correta do Habbo
 */
export function mapSWFToHabboCategory(swfCode: string): string {
  if (!swfCode) return 'ch';
  
  // Remove espaços e converte para minúsculo
  const cleanCode = swfCode.toLowerCase().trim();
  
  // 1. Verificar se já é uma categoria válida do Habbo (conforme análise completa do figuremap.xml)
  const validCategories = ['hd', 'bd', 'fc', 'ey', 'lh', 'rh', 'ch', 'ls', 'rs', 'cc', 'lc', 'rc', 'lg', 'sh', 'hr', 'hrb', 'ha', 'he', 'ea', 'fa', 'ca', 'wa', 'cp', 'ri', 'li', 'fx', 'sd', 'psd', 'pbd', 'phd', 'ptl', 'ss', 'bds', 'rhs', 'lhs'];
  if (validCategories.includes(cleanCode)) {
    return cleanCode;
  }
  
  // 2. Procura pelo prefixo que corresponde
  for (const mapping of SWF_TO_HABBO_CATEGORY_MAP) {
    if (cleanCode.startsWith(mapping.swfPrefix)) {
      return mapping.habboCategory;
    }
  }
  
  // 3. Se não encontrar, tenta extrair da estrutura padrão do Habbo
  // Formato: categoria-id-cor (ex: hd-180-1)
  const parts = cleanCode.split('-');
  if (parts.length >= 2) {
    const category = parts[0];
    // Valida se é uma categoria válida do Habbo
    if (validCategories.includes(category)) {
      return category;
    }
  }
  
  // 4. Fallback: retorna categoria padrão baseada no contexto
  console.warn(`Não foi possível mapear o código SWF: ${swfCode}`);
  return 'ch'; // Camiseta como fallback
}

/**
 * Valida se uma categoria é válida para o Habbo
 */
export function isValidHabboCategory(category: string): boolean {
  const validCategories = ['hd', 'bd', 'fc', 'ey', 'lh', 'rh', 'ch', 'ls', 'rs', 'cc', 'lc', 'rc', 'lg', 'sh', 'hr', 'hrb', 'ha', 'he', 'ea', 'fa', 'ca', 'wa', 'cp', 'ri', 'li', 'fx', 'sd', 'psd', 'pbd', 'phd', 'ptl', 'ss', 'bds', 'rhs', 'lhs'];
  return validCategories.includes(category.toLowerCase());
}

/**
 * Obtém a descrição de uma categoria do Habbo
 */
export function getCategoryDescription(category: string): string {
  const descriptions: { [key: string]: string } = {
    // CORPO E ROSTO
    'hd': 'Cabeças/Rostos',
    'bd': 'Corpo/Base',
    'fc': 'Rosto/Bochechas',
    'ey': 'Olhos',
    'lh': 'Mão Esquerda',
    'rh': 'Mão Direita',

    // ROUPAS SUPERIORES
    'ch': 'Camisetas/Shirts',
    'ls': 'Manga Esquerda',
    'rs': 'Manga Direita',
    'cc': 'Casacos/Coats',
    'lc': 'Manga Esquerda Casaco',
    'rc': 'Manga Direita Casaco',

    // ROUPAS INFERIORES
    'lg': 'Calças/Legs',
    'sh': 'Sapatos/Shoes',

    // ACESSÓRIOS DE CABEÇA
    'hr': 'Cabelos/Hair',
    'hrb': 'Cabelo Traseiro',
    'ha': 'Chapéus/Hats',
    'he': 'Acessórios de Cabeça',

    // ACESSÓRIOS FACIAIS E OCULARES
    'ea': 'Óculos/Eye Accessories',
    'fa': 'Acessórios Faciais',

    // ACESSÓRIOS DE CORPO
    'ca': 'Acessórios de Peito',
    'wa': 'Cintos/Waist Accessories',
    'cp': 'Estampas/Prints',

    // ITENS E EFEITOS ESPECIAIS
    'ri': 'Item Direito',
    'li': 'Item Esquerdo',
    'fx': 'Efeitos/Effects',
    'sd': 'Sombra/Shadow',

    // PETS (ANIMAIS DE ESTIMAÇÃO)
    'psd': 'Sombra do Pet',
    'pbd': 'Corpo do Pet',
    'phd': 'Cabeça do Pet',
    'ptl': 'Cauda do Pet',

    // ITENS DE PISCINA
    'ss': 'Sombra da Piscina',
    'bds': 'Sombra do Corpo',
    'rhs': 'Sombra Mão Direita',
    'lhs': 'Sombra Mão Esquerda'
  };

  return descriptions[category.toLowerCase()] || 'Desconhecido';
}
