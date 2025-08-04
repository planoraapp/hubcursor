export interface EnhancedFlashAssetV2 {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  figureId: string;
  colors: string[];
  thumbnailUrl: string;
  club: 'hc' | 'normal';
  rarity: 'nft' | 'hc' | 'ltd' | 'rare' | 'common';
  swfName: string;
  source: 'flash-assets-enhanced-v2';
}

// Cores oficiais Habbo
export const OFFICIAL_HABBO_COLORS = {
  skin: [
    { id: '1', hex: '#F5DA88', name: 'Pele Clara' },
    { id: '2', hex: '#FFDBC1', name: 'Pele Média' },
    { id: '3', hex: '#FFCB98', name: 'Pele Morena' },
    { id: '4', hex: '#F4AC54', name: 'Pele Escura' },
    { id: '5', hex: '#FF987F', name: 'Pele Muito Escura' },
    { id: '6', hex: '#E0BA6A', name: 'Bronzeada' },
    { id: '7', hex: '#C68642', name: 'Chocolate' }
  ],
  hair: [
    { id: '45', hex: '#4A2F22', name: 'Castanho Escuro' },
    { id: '44', hex: '#774F32', name: 'Castanho' },
    { id: '43', hex: '#A3794F', name: 'Loiro Escuro' },
    { id: '42', hex: '#D6B48B', name: 'Loiro Claro' },
    { id: '41', hex: '#F2E2CE', name: 'Loiro Muito Claro' },
    { id: '61', hex: '#FFB366', name: 'Laranja' },
    { id: '92', hex: '#FF6B6B', name: 'Coral' },
    { id: '100', hex: '#4ECDC4', name: 'Turquesa' },
    { id: '101', hex: '#45B7D1', name: 'Azul Céu' },
    { id: '102', hex: '#96CEB4', name: 'Verde Menta' },
    { id: '104', hex: '#FFEAA7', name: 'Amarelo Suave' },
    { id: '105', hex: '#DDA0DD', name: 'Lilás' },
    { id: '143', hex: '#A8E6CF', name: 'Verde Pastel' }
  ],
  clothing: [
    { id: '1', hex: '#FFFFFF', name: 'Branco' },
    { id: '2', hex: '#000000', name: 'Preto' },
    { id: '3', hex: '#808080', name: 'Cinza' },
    { id: '4', hex: '#A9A9A9', name: 'Cinza Escuro' },
    { id: '5', hex: '#D3D3D3', name: 'Cinza Claro' },
    { id: '61', hex: '#FFB366', name: 'Laranja' },
    { id: '92', hex: '#FF6B6B', name: 'Coral' },
    { id: '100', hex: '#4ECDC4', name: 'Turquesa' },
    { id: '101', hex: '#45B7D1', name: 'Azul Céu' },
    { id: '102', hex: '#96CEB4', name: 'Verde Menta' },
    { id: '104', hex: '#FFEAA7', name: 'Amarelo Suave' },
    { id: '105', hex: '#DDA0DD', name: 'Lilás' },
    { id: '143', hex: '#A8E6CF', name: 'Verde Pastel' }
  ]
};

export const OFFICIAL_HABBO_PALETTES = {
  skin: {
    name: 'Tons de Pele',
    colors: OFFICIAL_HABBO_COLORS.skin
  },
  hair: {
    name: 'Cores de Cabelo',
    colors: OFFICIAL_HABBO_COLORS.hair
  },
  clothing: {
    name: 'Cores de Roupas',
    colors: OFFICIAL_HABBO_COLORS.clothing
  }
};

export const getCategoryPalette = (category: string) => {
  switch (category) {
    case 'hd':
    case 'sk':
      return OFFICIAL_HABBO_PALETTES.skin;
    case 'hr':
      return OFFICIAL_HABBO_PALETTES.hair;
    default:
      return OFFICIAL_HABBO_PALETTES.clothing;
  }
};

// SEÇÕES PRINCIPAIS V3 - Reorganizadas conforme solicitado
export const CATEGORY_SECTIONS = {
  head: {
    name: 'Cabeça',
    icon: '👤',
    categories: ['hd', 'hr', 'ha', 'ea', 'fa'] // Rostos, Cabelos, Chapéus, Óculos, Acessórios Rosto
  },
  body: {
    name: 'Corpo e Acessórios', 
    icon: '👕',
    categories: ['sk', 'ch', 'cc', 'cp', 'ca'] // Cor Pele, Camisetas, Casacos, Estampas, Acessórios Peito
  },
  legs: {
    name: 'Pernas e Pés',
    icon: '👖', 
    categories: ['lg', 'sh', 'wa'] // Calças, Sapatos, Cintura
  },
  special: {
    name: 'Outros',
    icon: '✨',
    categories: ['fx', 'pets', 'dance', 'misc'] // Efeitos, Pets, Dança, Diversos
  }
};

// METADATA COMPLETA das categorias V3
export const CATEGORY_METADATA = {
  // Seção Cabeça
  hd: { name: 'Rostos', icon: '😊', color: '#FFE4E6', section: 'head' },
  hr: { name: 'Cabelos', icon: '💇', color: '#FFF4E6', section: 'head' },
  ha: { name: 'Chapéus', icon: '🎩', color: '#F0F4FF', section: 'head' },
  ea: { name: 'Óculos', icon: '👓', color: '#F0FFF4', section: 'head' },
  fa: { name: 'Acessórios Rosto', icon: '🎭', color: '#FFF0F5', section: 'head' },
  
  // Seção Corpo e Acessórios
  sk: { name: 'Cor de Pele', icon: '🤏', color: '#FDF2E9', section: 'body' },
  ch: { name: 'Camisetas', icon: '👕', color: '#E6F7FF', section: 'body' },
  cc: { name: 'Casacos', icon: '🧥', color: '#F6FFED', section: 'body' },
  cp: { name: 'Estampas', icon: '🎨', color: '#FFF1F0', section: 'body' },
  ca: { name: 'Acessórios Peito', icon: '💍', color: '#F9F0FF', section: 'body' },
  
  // Seção Pernas e Pés
  lg: { name: 'Calças', icon: '👖', color: '#E6F4FF', section: 'legs' },
  sh: { name: 'Sapatos', icon: '👟', color: '#F0F5FF', section: 'legs' },
  wa: { name: 'Cintura', icon: '🎀', color: '#FFF7E6', section: 'legs' },
  
  // Seção Outros
  fx: { name: 'Efeitos', icon: '✨', color: '#F0F0F0', section: 'special' },
  pets: { name: 'Pets', icon: '🐾', color: '#E6F3FF', section: 'special' },
  dance: { name: 'Dança', icon: '💃', color: '#FFE6F0', section: 'special' },
  misc: { name: 'Diversos', icon: '📦', color: '#F5F5F5', section: 'special' }
};

// MAPEAMENTO INTELIGENTE SWF -> CATEGORIA V3
const SWF_CATEGORY_MAPPING = {
  // Cabeça
  'acc_head': 'ha', 'hat': 'ha', 'mask': 'fa', 'hair': 'hr', 'head': 'hd',
  'acc_eye': 'ea', 'eyepatch': 'fa', 'glasses': 'ea',
  
  // Corpo
  'shirt': 'ch', 'top': 'ch', 'chest': 'ch', 'coat': 'cc', 'jacket': 'cc',
  'acc_chest': 'ca', 'tie': 'ca', 'necklace': 'ca', 'bag': 'ca',
  'print': 'cp', 'logo': 'cp',
  
  // Pernas e Pés
  'trousers': 'lg', 'pants': 'lg', 'legs': 'lg', 'skirt': 'lg',
  'shoes': 'sh', 'boots': 'sh', 'footwear': 'sh',
  'acc_waist': 'wa', 'belt': 'wa', 'waist': 'wa',
  
  // Outros
  'fx': 'fx', 'effect': 'fx', 'magic': 'fx',
  'pet': 'pets', 'animal': 'pets',
  'dance': 'dance', 'emote': 'dance',
  'misc': 'misc', 'other': 'misc'
};

export const parseAssetCategory = (swfName: string): string => {
  if (!swfName || typeof swfName !== 'string') {
    console.warn('⚠️ [CategoryMapper V3] Invalid swfName:', swfName);
    return 'misc';
  }

  const lowerSwf = swfName.toLowerCase();
  
  // 1. Verificar mapeamento direto
  for (const [pattern, category] of Object.entries(SWF_CATEGORY_MAPPING)) {
    if (lowerSwf.includes(pattern)) {
      console.log(`✅ [CategoryMapper V3] Mapeamento direto: ${swfName} -> ${category} (padrão: ${pattern})`);
      return category;
    }
  }
  
  // 2. Análise por padrões específicos
  if (lowerSwf.includes('hair') || lowerSwf.includes('hr_')) return 'hr';
  if (lowerSwf.includes('hat') || lowerSwf.includes('ha_')) return 'ha';
  if (lowerSwf.includes('shirt') || lowerSwf.includes('ch_')) return 'ch';
  if (lowerSwf.includes('pants') || lowerSwf.includes('lg_')) return 'lg';
  if (lowerSwf.includes('shoe') || lowerSwf.includes('sh_')) return 'sh';
  if (lowerSwf.includes('coat') || lowerSwf.includes('cc_')) return 'cc';
  if (lowerSwf.includes('eye') || lowerSwf.includes('ea_')) return 'ea';
  if (lowerSwf.includes('face') || lowerSwf.includes('fa_')) return 'fa';
  if (lowerSwf.includes('chest') || lowerSwf.includes('ca_')) return 'ca';
  if (lowerSwf.includes('waist') || lowerSwf.includes('wa_')) return 'wa';
  if (lowerSwf.includes('print') || lowerSwf.includes('cp_')) return 'cp';
  if (lowerSwf.includes('effect') || lowerSwf.includes('fx_')) return 'fx';
  
  // 3. Fallback para categoria genérica
  console.warn(`⚠️ [CategoryMapper V3] Categoria não identificada para: ${swfName}, usando 'misc'`);
  return 'misc';
};

export const parseAssetGender = (swfName: string): 'M' | 'F' | 'U' => {
  const lowerSwf = swfName.toLowerCase();
  if (lowerSwf.includes('_f_') || lowerSwf.includes('female')) return 'F';
  if (lowerSwf.includes('_m_') || lowerSwf.includes('male')) return 'M';
  return 'U';
};

export const parseAssetFigureId = (swfName: string): string => {
  const match = swfName.match(/(\d+)/);
  return match ? match[1] : '0';
};

export const generateCategoryColors = (category: string): string[] => {
  // Cores específicas por categoria
  return ['1', '2', '3', '4', '5'];
};

export const generateIsolatedThumbnail = (category: string, figureId: string, color: string, gender: string): string => {
  // Usar URLs simples como no ViaJovem original - SEM crop
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${color}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};

export const formatAssetName = (swfName: string): string => {
  // Formatar nome do asset
  return swfName;
};

export const parseAssetRarity = (swfName: string): 'nft' | 'hc' | 'ltd' | 'rare' | 'common' => {
  const lowerSwf = swfName.toLowerCase();
  if (lowerSwf.includes('nft')) return 'nft';
  if (lowerSwf.includes('hc')) return 'hc';
  if (lowerSwf.includes('ltd')) return 'ltd';
  if (lowerSwf.includes('rare')) return 'rare';
  return 'common';
};

export const getRarityStats = (assets: EnhancedFlashAssetV2[]): Record<string, number> => {
  return assets.reduce((acc, asset) => {
    acc[asset.rarity] = (acc[asset.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'nft': return '#007bff'; // Azul
    case 'hc': return '#ffc107'; // Amarelo
    case 'ltd': return '#dc3545'; // Vermelho
    case 'rare': return '#28a745'; // Verde
    default: return '#6c757d'; // Cinza
  }
};
