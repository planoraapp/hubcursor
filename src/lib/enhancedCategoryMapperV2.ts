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

// Interface para cores oficiais Habbo
export interface OfficialHabboColor {
  id: string;
  hex: string;
  name: string;
  isHC?: boolean;
}

// Cores oficiais Habbo
export const OFFICIAL_HABBO_COLORS = {
  skin: [
    { id: '1', hex: '#F5DA88', name: 'Pele Clara', isHC: false },
    { id: '2', hex: '#FFDBC1', name: 'Pele Média', isHC: false },
    { id: '3', hex: '#FFCB98', name: 'Pele Morena', isHC: false },
    { id: '4', hex: '#F4AC54', name: 'Pele Escura', isHC: false },
    { id: '5', hex: '#FF987F', name: 'Pele Muito Escura', isHC: false },
    { id: '6', hex: '#E0BA6A', name: 'Bronzeada', isHC: false },
    { id: '7', hex: '#C68642', name: 'Chocolate', isHC: false }
  ],
  hair: [
    { id: '45', hex: '#4A2F22', name: 'Castanho Escuro', isHC: false },
    { id: '44', hex: '#774F32', name: 'Castanho', isHC: false },
    { id: '43', hex: '#A3794F', name: 'Loiro Escuro', isHC: false },
    { id: '42', hex: '#D6B48B', name: 'Loiro Claro', isHC: false },
    { id: '41', hex: '#F2E2CE', name: 'Loiro Muito Claro', isHC: false },
    { id: '61', hex: '#FFB366', name: 'Laranja', isHC: true },
    { id: '92', hex: '#FF6B6B', name: 'Coral', isHC: true },
    { id: '100', hex: '#4ECDC4', name: 'Turquesa', isHC: true },
    { id: '101', hex: '#45B7D1', name: 'Azul Céu', isHC: true },
    { id: '102', hex: '#96CEB4', name: 'Verde Menta', isHC: true },
    { id: '104', hex: '#FFEAA7', name: 'Amarelo Suave', isHC: true },
    { id: '105', hex: '#DDA0DD', name: 'Lilás', isHC: true },
    { id: '143', hex: '#A8E6CF', name: 'Verde Pastel', isHC: true }
  ],
  clothing: [
    { id: '1', hex: '#FFFFFF', name: 'Branco', isHC: false },
    { id: '2', hex: '#000000', name: 'Preto', isHC: false },
    { id: '3', hex: '#808080', name: 'Cinza', isHC: false },
    { id: '4', hex: '#A9A9A9', name: 'Cinza Escuro', isHC: false },
    { id: '5', hex: '#D3D3D3', name: 'Cinza Claro', isHC: false },
    { id: '61', hex: '#FFB366', name: 'Laranja', isHC: true },
    { id: '92', hex: '#FF6B6B', name: 'Coral', isHC: true },
    { id: '100', hex: '#4ECDC4', name: 'Turquesa', isHC: true },
    { id: '101', hex: '#45B7D1', name: 'Azul Céu', isHC: true },
    { id: '102', hex: '#96CEB4', name: 'Verde Menta', isHC: true },
    { id: '104', hex: '#FFEAA7', name: 'Amarelo Suave', isHC: true },
    { id: '105', hex: '#DDA0DD', name: 'Lilás', isHC: true },
    { id: '143', hex: '#A8E6CF', name: 'Verde Pastel', isHC: true }
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

// Função para validar se uma cor é válida para uma categoria específica
export const isValidColorForCategory = (colorId: string, category: string): boolean => {
  const palette = getCategoryPalette(category);
  return palette.colors.some(color => color.id === colorId);
};

// Função para obter a primeira cor válida para uma categoria
export const getDefaultColorForCategory = (category: string): string => {
  const palette = getCategoryPalette(category);
  return palette.colors[0]?.id || '1';
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

// SISTEMA DE CATEGORIZAÇÃO V3 - EXPANDIDO E INTELIGENTE
const SWF_CATEGORY_MAPPING = {
  // CABEÇA E ROSTO - EXPANDIDO
  'hair': 'hr', 'hr_': 'hr', 'cabelo': 'hr', 'pelo': 'hr',
  'head': 'hd', 'hd_': 'hd', 'face': 'hd', 'rosto': 'hd', 'cara': 'hd',
  'hat': 'ha', 'ha_': 'ha', 'cap': 'ha', 'helmet': 'ha', 'crown': 'ha', 'tiara': 'ha', 'chapeu': 'ha',
  'eye': 'ea', 'ea_': 'ea', 'glass': 'ea', 'sunglass': 'ea', 'monocle': 'ea', 'oculos': 'ea',
  'mask': 'fa', 'fa_': 'fa', 'beard': 'fa', 'mustache': 'fa', 'bigode': 'fa',
  
  // CORPO E ROUPAS - EXPANDIDO
  'shirt': 'ch', 'ch_': 'ch', 'top': 'ch', 'blouse': 'ch', 'tshirt': 'ch', 'camisa': 'ch',
  'coat': 'cc', 'cc_': 'cc', 'jacket': 'cc', 'blazer': 'cc', 'hoodie': 'cc', 'casaco': 'cc',
  'chest': 'ca', 'ca_': 'ca', 'tie': 'ca', 'necklace': 'ca', 'badge': 'ca', 'medal': 'ca',
  'print': 'cp', 'cp_': 'cp', 'logo': 'cp', 'emblem': 'cp', 'estampa': 'cp',
  
  // PERNAS E PÉS - EXPANDIDO
  'trouser': 'lg', 'lg_': 'lg', 'pant': 'lg', 'jean': 'lg', 'short': 'lg', 'skirt': 'lg', 'calca': 'lg',
  'shoe': 'sh', 'sh_': 'sh', 'boot': 'sh', 'sneaker': 'sh', 'sandal': 'sh', 'heel': 'sh', 'sapato': 'sh',
  'waist': 'wa', 'wa_': 'wa', 'belt': 'wa', 'chain': 'wa', 'cintura': 'wa',
  
  // ESPECIAIS
  'effect': 'fx', 'fx_': 'fx', 'magic': 'fx', 'glow': 'fx', 'efeito': 'fx',
  'pet': 'pets', 'animal': 'pets', 'bicho': 'pets',
  'dance': 'dance', 'emote': 'dance', 'danca': 'dance'
};

export const parseAssetCategory = (swfName: string): string => {
  if (!swfName || typeof swfName !== 'string') {
    console.warn('⚠️ [CategoryMapper V3] Invalid swfName:', swfName);
    return 'misc';
  }

  const lowerSwf = swfName.toLowerCase();
  
  // 1. MAPEAMENTO DIRETO EXPANDIDO
  for (const [pattern, category] of Object.entries(SWF_CATEGORY_MAPPING)) {
    if (lowerSwf.includes(pattern)) {
      console.log(`✅ [CategoryMapper V3] Mapeamento direto: ${swfName} -> ${category} (padrão: ${pattern})`);
      return category;
    }
  }
  
  // 2. PADRÕES REGEX ESPECÍFICOS
  if (lowerSwf.match(/h[a-z]*r[0-9]/) || lowerSwf.match(/hr[0-9]/)) return 'hr';
  if (lowerSwf.match(/hd[0-9]/) || lowerSwf.match(/head[0-9]/)) return 'hd';
  if (lowerSwf.match(/ha[0-9]/) || lowerSwf.match(/hat[0-9]/)) return 'ha';
  if (lowerSwf.match(/ch[0-9]/) || lowerSwf.match(/shirt[0-9]/)) return 'ch';
  if (lowerSwf.match(/lg[0-9]/) || lowerSwf.match(/leg[0-9]/)) return 'lg';
  if (lowerSwf.match(/sh[0-9]/) || lowerSwf.match(/shoe[0-9]/)) return 'sh';
  
  // 3. ANÁLISE DE PREFIXOS COMUNS
  if (lowerSwf.match(/^[a-z]{2,3}_[0-9]/)) {
    const prefix = lowerSwf.substring(0, 2);
    const validCategories = ['hr', 'hd', 'ha', 'ea', 'fa', 'ch', 'cc', 'ca', 'cp', 'lg', 'sh', 'wa', 'fx'];
    if (validCategories.includes(prefix)) {
      console.log(`✅ [CategoryMapper V3] Prefixo identificado: ${swfName} -> ${prefix}`);
      return prefix;
    }
  }
  
  // 4. ANÁLISE CONTEXTUAL POR PALAVRAS-CHAVE
  const contextAnalysis = [
    { keywords: ['male', 'female', 'boy', 'girl', 'man', 'woman'], category: 'ch' },
    { keywords: ['color', 'colour', 'skin', 'tone'], category: 'hd' },
    { keywords: ['long', 'short', 'curly', 'straight'], category: 'hr' },
    { keywords: ['formal', 'casual', 'sport'], category: 'ch' },
    { keywords: ['winter', 'summer', 'warm', 'cold'], category: 'cc' }
  ];
  
  for (const analysis of contextAnalysis) {
    if (analysis.keywords.some(keyword => lowerSwf.includes(keyword))) {
      console.log(`✅ [CategoryMapper V3] Análise contextual: ${swfName} -> ${analysis.category}`);
      return analysis.category;
    }
  }
  
  // 5. FALLBACK INTELIGENTE - preferir roupas comuns
  if (lowerSwf.includes('_m_') || lowerSwf.includes('_f_') || lowerSwf.includes('_u_')) {
    console.log(`⚠️ [CategoryMapper V3] Fallback por gênero: ${swfName} -> ch`);
    return 'ch';
  }
  
  // 6. Fallback final
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

// NOVO: Sistema de validação de assets
export const validateAsset = (swfName: string, detectedCategory: string): boolean => {
  // Verificar se a categorização faz sentido
  const validationRules = {
    'hr': ['hair', 'hr_', 'cabelo'],
    'hd': ['head', 'hd_', 'face', 'rosto'],
    'ha': ['hat', 'ha_', 'cap', 'helmet'],
    'ch': ['shirt', 'ch_', 'top', 'blouse'],
    'lg': ['trouser', 'lg_', 'pant', 'jean'],
    'sh': ['shoe', 'sh_', 'boot', 'sneaker']
  };
  
  const rules = validationRules[detectedCategory as keyof typeof validationRules];
  if (rules) {
    return rules.some(rule => swfName.toLowerCase().includes(rule));
  }
  
  return true; // Para categorias sem regras específicas
};
