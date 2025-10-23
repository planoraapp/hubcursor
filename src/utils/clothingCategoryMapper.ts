// Mapeamento correto de tipos SWF para categorias do Habbo
// Baseado na documentação oficial do Habbo

export interface SWFTypeMapping {
  swfPrefix: string;
  habboCategory: string;
  description: string;
}

export const SWF_TO_HABBO_CATEGORY_MAP: SWFTypeMapping[] = [
  // Chapéus e Acessórios de Cabeça
  { swfPrefix: 'hat_', habboCategory: 'ha', description: 'Chapéus' },
  { swfPrefix: 'acc_head_', habboCategory: 'ha', description: 'Acessórios de Cabeça' },
  
  // Cabelos
  { swfPrefix: 'hair_', habboCategory: 'hr', description: 'Cabelos/Penteados' },
  
  // Roupas do Corpo
  { swfPrefix: 'shirt_', habboCategory: 'ch', description: 'Camisetas/Camisas' },
  { swfPrefix: 'jacket_', habboCategory: 'cc', description: 'Casacos/Vestidos' },
  
  // Calças/Saias - Expandido baseado na ViaJovem
  { swfPrefix: 'trousers_', habboCategory: 'lg', description: 'Calças' },
  { swfPrefix: 'pants_', habboCategory: 'lg', description: 'Calças' },
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
  
  // Acessórios
  { swfPrefix: 'acc_eye_', habboCategory: 'ea', description: 'Acessórios de Olhos' },
  { swfPrefix: 'acc_chest_', habboCategory: 'ca', description: 'Acessórios do Peito' },
  { swfPrefix: 'acc_waist_', habboCategory: 'wa', description: 'Acessórios de Cintura' },
  { swfPrefix: 'acc_print_', habboCategory: 'cp', description: 'Estampas' },
  
  // Rosto e Corpo (integrado)
  { swfPrefix: 'face_', habboCategory: 'hd', description: 'Rostos' },
  { swfPrefix: 'head_', habboCategory: 'hd', description: 'Rostos' },
  
  // Sapato (se existir)
  { swfPrefix: 'shoes_', habboCategory: 'sh', description: 'Sapatos' },
  { swfPrefix: 'footwear_', habboCategory: 'sh', description: 'Calçados' },
];

/**
 * Mapeia um código SWF para a categoria correta do Habbo
 */
export function mapSWFToHabboCategory(swfCode: string): string {
  // Remove espaços e converte para minúsculo
  const cleanCode = swfCode.toLowerCase().trim();
  
  // Procura pelo prefixo que corresponde
  for (const mapping of SWF_TO_HABBO_CATEGORY_MAP) {
    if (cleanCode.startsWith(mapping.swfPrefix)) {
      return mapping.habboCategory;
    }
  }
  
  // Se não encontrar, tenta extrair da estrutura padrão do Habbo
  // Formato: categoria-id-cor (ex: hd-180-1)
  const parts = cleanCode.split('-');
  if (parts.length >= 2) {
    const category = parts[0];
    // Valida se é uma categoria válida do Habbo
    const validCategories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'he', 'ca', 'wa', 'cp'];
    if (validCategories.includes(category)) {
      return category;
    }
  }
  
  // Fallback: retorna categoria padrão baseada no contexto
  console.warn(`Não foi possível mapear o código SWF: ${swfCode}`);
  return 'ch'; // Camiseta como fallback
}

/**
 * Valida se uma categoria é válida para o Habbo
 */
export function isValidHabboCategory(category: string): boolean {
  const validCategories = ['hd', 'hr', 'ch', 'cc', 'lg', 'sh', 'ha', 'ea', 'fa', 'he', 'ca', 'wa', 'cp'];
  return validCategories.includes(category.toLowerCase());
}

/**
 * Obtém a descrição de uma categoria do Habbo
 */
export function getCategoryDescription(category: string): string {
  const descriptions: { [key: string]: string } = {
    'hd': 'Rostos',
    'hr': 'Cabelos',
    'ch': 'Camisetas',
    'cc': 'Casacos',
    'lg': 'Calças',
    'sh': 'Sapatos',
    'ha': 'Acess. Cabelo',
    'ea': 'Acessórios',
    'fa': 'Rosto',
    'he': 'Acess. Cabelo',
    'ca': 'Acessórios',
    'wa': 'Cintura',
    'cp': 'Estampas'
  };
  
  return descriptions[category.toLowerCase()] || 'Desconhecido';
}
