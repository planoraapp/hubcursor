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

// SEÇÕES PRINCIPAIS V3 - Nova estrutura sem "dance"
export const CATEGORY_SECTIONS = {
  head: {
    name: 'Cabeça',
    icon: '👤',
    categories: ['hd', 'hr', 'ha', 'ea', 'fa'] // Rostos, Cabelos, Chapéus, Óculos, Acessórios Rosto
  },
  body: {
    name: 'Corpo e Acessórios', 
    icon: '👕',
    categories: ['ch', 'cc', 'cp', 'ca'] // Camisetas, Casacos, Estampas, Acessórios Peito
  },
  legs: {
    name: 'Pernas e Pés',
    icon: '👖', 
    categories: ['lg', 'sh', 'wa'] // Calças, Sapatos, Cintura
  },
  others: {
    name: 'Outros',
    icon: '✨',
    categories: ['pets', 'fx', 'vehicles'] // Pets, Efeitos, Veículos
  }
};

// METADATA COMPLETA das categorias V3 - Reorganizada
export const CATEGORY_METADATA = {
  // Seção Cabeça
  hd: { name: 'Rostos', icon: '😊', color: '#FFE4E6', section: 'head' },
  hr: { name: 'Cabelos', icon: '💇', color: '#FFF4E6', section: 'head' },
  ha: { name: 'Chapéus', icon: '🎩', color: '#F0F4FF', section: 'head' },
  ea: { name: 'Óculos', icon: '👓', color: '#F0FFF4', section: 'head' },
  fa: { name: 'Acessórios Rosto', icon: '🎭', color: '#FFF0F5', section: 'head' },
  
  // Seção Corpo e Acessórios (sem sk)
  ch: { name: 'Camisetas', icon: '👕', color: '#E6F7FF', section: 'body' },
  cc: { name: 'Casacos', icon: '🧥', color: '#F6FFED', section: 'body' },
  cp: { name: 'Estampas', icon: '🎨', color: '#FFF1F0', section: 'body' },
  ca: { name: 'Acessórios Peito', icon: '💍', color: '#F9F0FF', section: 'body' },
  
  // Seção Pernas e Pés
  lg: { name: 'Calças', icon: '👖', color: '#E6F4FF', section: 'legs' },
  sh: { name: 'Sapatos', icon: '👟', color: '#F0F5FF', section: 'legs' },
  wa: { name: 'Cintura', icon: '🎀', color: '#FFF7E6', section: 'legs' },
  
  // Seção Outros - Reorganizada
  pets: { name: 'Pets/Animais', icon: '🐾', color: '#E6F3FF', section: 'others' },
  fx: { name: 'Efeitos Especiais', icon: '✨', color: '#F0F0F0', section: 'others' },
  vehicles: { name: 'Veículos', icon: '🚗', color: '#FFE6F0', section: 'others' }
};

// SISTEMA DE CATEGORIZAÇÃO V3 - CORRIGIDO COM PRECEDÊNCIA ESPECÍFICA
const SWF_CATEGORY_MAPPING = {
  // === MAPEAMENTO ESPECÍFICO COM PRIORIDADE ===
  // ACESSÓRIOS ESPECÍFICOS (devem vir PRIMEIRO)
  'acc_chest_': 'ca', 'acc_chest': 'ca',
  'necklace': 'ca', 'backpack': 'ca', 'tie': 'ca', 'badge': 'ca', 'medal': 'ca',
  
  'acc_face_': 'fa', 'acc_face': 'fa', 'face_u': 'fa',
  
  'acc_head_': 'fa', 'acc_head': 'fa', // Padrão geral para acessórios de cabeça
  
  'acc_waist_': 'wa', 'acc_waist': 'wa',
  'acc_eye_': 'ea', 'acc_eye': 'ea',
  'acc_print_': 'cp', 'acc_print': 'cp',

  // CABEÇA E ROSTO - EXPANDIDO
  'hair': 'hr', 'hr_': 'hr', 'cabelo': 'hr', 'pelo': 'hr',
  'head': 'hd', 'hd_': 'hd', 'face': 'hd', 'rosto': 'hd', 'cara': 'hd',
  'hat': 'ha', 'ha_': 'ha', 'cap': 'ha', 'helmet': 'ha', 'crown': 'ha', 'tiara': 'ha', 'chapeu': 'ha',
  'eye': 'ea', 'ea_': 'ea', 'glass': 'ea', 'sunglass': 'ea', 'monocle': 'ea', 'oculos': 'ea',
  'mask': 'fa', 'fa_': 'fa', 'beard': 'fa', 'mustache': 'fa', 'bigode': 'fa',
  
  // CORPO E ROUPAS - EXPANDIDO
  'shirt': 'ch', 'ch_': 'ch', 'top': 'ch', 'blouse': 'ch', 'tshirt': 'ch', 'camisa': 'ch',
  'coat': 'cc', 'cc_': 'cc', 'jacket': 'cc', 'blazer': 'cc', 'hoodie': 'cc', 'casaco': 'cc',
  'chest': 'ca', 'ca_': 'ca',
  'print': 'cp', 'cp_': 'cp', 'logo': 'cp', 'emblem': 'cp', 'estampa': 'cp',
  
  // PERNAS E PÉS - EXPANDIDO
  'trouser': 'lg', 'lg_': 'lg', 'pant': 'lg', 'jean': 'lg', 'short': 'lg', 'skirt': 'lg', 'calca': 'lg',
  'shoe': 'sh', 'sh_': 'sh', 'boot': 'sh', 'sneaker': 'sh', 'sandal': 'sh', 'heel': 'sh', 'sapato': 'sh',
  'waist': 'wa', 'wa_': 'wa', 'belt': 'wa', 'chain': 'wa', 'cintura': 'wa',
  
  // PETS/ANIMAIS - NOVO
  'frog': 'pets', 'chicken': 'pets', 'bear': 'pets', 'cat': 'pets', 'dog': 'pets',
  'cow': 'pets', 'croco': 'pets', 'duck': 'pets', 'gnome': 'pets', 'haloompa': 'pets',
  'bunny': 'pets', 'easter': 'pets', 'animal': 'pets', 'pet': 'pets',
  
  // EFEITOS ESPECIAIS - CORRIGIDO
  'effect': 'fx', 'fx_': 'fx', 'magic': 'fx', 'glow': 'fx',
  'ghost': 'fx', 'flies': 'fx', 'fireflies': 'fx', 'feathers': 'fx',
  'freeze': 'fx', 'hide': 'fx', 'holo': 'fx', 'wings': 'fx',
  'microphone': 'fx', 'chupachups': 'fx', 'gun': 'fx', 'hammer': 'fx',
  'spotlight': 'fx', 'torch': 'fx', 'candle': 'fx', 'crystal': 'fx',
  'executioner': 'fx', 'despicable': 'fx', 'disney': 'fx', 'cyberpunk': 'fx',
  'nft': 'fx', 'coolcats': 'fx', 'bayc': 'fx',
  
  // VEÍCULOS - NOVO
  'scooter': 'vehicles', 'car': 'vehicles', 'ambulance': 'vehicles',
  'police': 'vehicles', 'airplane': 'vehicles', 'ffscooter': 'vehicles',
  'vehicle': 'vehicles', 'transport': 'vehicles'
};

export const parseAssetCategory = (swfName: string): string => {
  if (!swfName || typeof swfName !== 'string') {
    console.warn('⚠️ [CategoryMapper V3] Invalid swfName:', swfName);
    return 'fx';
  }

  const lowerSwf = swfName.toLowerCase();
  console.log(`🔍 [CategoryMapper V3] Analyzing: ${swfName}`);
  
  // 1. MAPEAMENTO DIRETO ESPECÍFICO COM PRIORIDADE
  // Verificar acessórios específicos PRIMEIRO
  if (lowerSwf.includes('acc_chest') || (lowerSwf.includes('necklace') || lowerSwf.includes('backpack') || lowerSwf.includes('tie') || lowerSwf.includes('badge') || lowerSwf.includes('medal'))) {
    console.log(`✅ [CategoryMapper V3] Chest accessory: ${swfName} -> ca`);
    return 'ca';
  }
  
  if (lowerSwf.includes('acc_face') || lowerSwf.includes('face_u')) {
    console.log(`✅ [CategoryMapper V3] Face accessory: ${swfName} -> fa`);
    return 'fa';
  }
  
  if (lowerSwf.includes('acc_head')) {
    // Verificar se é chapéu ou acessório facial
    if (lowerSwf.includes('hat') || lowerSwf.includes('cap') || lowerSwf.includes('helmet') || lowerSwf.includes('crown')) {
      console.log(`✅ [CategoryMapper V3] Head hat: ${swfName} -> ha`);
      return 'ha';
    } else {
      console.log(`✅ [CategoryMapper V3] Head accessory: ${swfName} -> fa`);
      return 'fa';
    }
  }
  
  if (lowerSwf.includes('acc_waist')) {
    console.log(`✅ [CategoryMapper V3] Waist accessory: ${swfName} -> wa`);
    return 'wa';
  }
  
  if (lowerSwf.includes('acc_eye')) {
    console.log(`✅ [CategoryMapper V3] Eye accessory: ${swfName} -> ea`);
    return 'ea';
  }
  
  if (lowerSwf.includes('acc_print')) {
    console.log(`✅ [CategoryMapper V3] Print accessory: ${swfName} -> cp`);
    return 'cp';
  }

  // 2. MAPEAMENTO DIRETO EXPANDIDO (resto das regras)
  for (const [pattern, category] of Object.entries(SWF_CATEGORY_MAPPING)) {
    if (lowerSwf.includes(pattern)) {
      console.log(`✅ [CategoryMapper V3] Pattern match: ${swfName} -> ${category} (pattern: ${pattern})`);
      return category;
    }
  }
  
  // 3. PADRÕES REGEX ESPECÍFICOS
  if (lowerSwf.match(/h[a-z]*r[0-9]/) || lowerSwf.match(/hr[0-9]/)) {
    console.log(`✅ [CategoryMapper V3] Hair regex: ${swfName} -> hr`);
    return 'hr';
  }
  if (lowerSwf.match(/hd[0-9]/) || lowerSwf.match(/head[0-9]/)) {
    console.log(`✅ [CategoryMapper V3] Head regex: ${swfName} -> hd`);
    return 'hd';
  }
  if (lowerSwf.match(/ha[0-9]/) || lowerSwf.match(/hat[0-9]/)) {
    console.log(`✅ [CategoryMapper V3] Hat regex: ${swfName} -> ha`);
    return 'ha';
  }
  if (lowerSwf.match(/ch[0-9]/) || lowerSwf.match(/shirt[0-9]/)) {
    console.log(`✅ [CategoryMapper V3] Shirt regex: ${swfName} -> ch`);
    return 'ch';
  }
  if (lowerSwf.match(/lg[0-9]/) || lowerSwf.match(/leg[0-9]/)) {
    console.log(`✅ [CategoryMapper V3] Leg regex: ${swfName} -> lg`);
    return 'lg';
  }
  if (lowerSwf.match(/sh[0-9]/) || lowerSwf.match(/shoe[0-9]/)) {
    console.log(`✅ [CategoryMapper V3] Shoe regex: ${swfName} -> sh`);
    return 'sh';
  }
  
  // 4. ANÁLISE DE PREFIXOS COMUNS
  if (lowerSwf.match(/^[a-z]{2,3}_[0-9]/)) {
    const prefix = lowerSwf.substring(0, 2);
    const validCategories = ['hr', 'hd', 'ha', 'ea', 'fa', 'ch', 'cc', 'ca', 'cp', 'lg', 'sh', 'wa'];
    if (validCategories.includes(prefix)) {
      console.log(`✅ [CategoryMapper V3] Prefix match: ${swfName} -> ${prefix}`);
      return prefix;
    }
  }
  
  // 5. ANÁLISE CONTEXTUAL POR PALAVRAS-CHAVE MELHORADA
  const contextAnalysis = [
    { keywords: ['nft', 'cyberpunk', 'coolcats', 'bayc', 'executioner', 'despicable', 'disney'], category: 'fx' },
    { keywords: ['male', 'female', 'boy', 'girl', 'man', 'woman'], category: 'ch' },
    { keywords: ['color', 'colour', 'skin', 'tone'], category: 'hd' },
    { keywords: ['long', 'short', 'curly', 'straight'], category: 'hr' },
    { keywords: ['formal', 'casual', 'sport'], category: 'ch' },
    { keywords: ['winter', 'summer', 'warm', 'cold'], category: 'cc' },
    { keywords: ['viking', 'knight', 'warrior', 'clown', 'goblin'], category: 'fa' },
    { keywords: ['scooter', 'car', 'vehicle', 'transport', 'ambulance', 'police', 'airplane'], category: 'vehicles' },
    { keywords: ['pet', 'animal', 'dog', 'cat', 'bear', 'frog', 'chicken', 'cow'], category: 'pets' }
  ];
  
  for (const analysis of contextAnalysis) {
    if (analysis.keywords.some(keyword => lowerSwf.includes(keyword))) {
      console.log(`✅ [CategoryMapper V3] Context analysis: ${swfName} -> ${analysis.category}`);
      return analysis.category;
    }
  }
  
  // 6. FALLBACK INTELIGENTE - preferir efeitos para itens não reconhecidos
  if (lowerSwf.includes('_m_') || lowerSwf.includes('_f_') || lowerSwf.includes('_u_')) {
    console.log(`⚠️ [CategoryMapper V3] Gender fallback: ${swfName} -> fx`);
    return 'fx';
  }
  
  // 7. Fallback final para efeitos
  console.warn(`⚠️ [CategoryMapper V3] No category found for: ${swfName}, using 'fx'`);
  return 'fx';
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
  return ['1', '2', '3', '4', '5'];
};

export const generateIsolatedThumbnail = (category: string, figureId: string, color: string, gender: string): string => {
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${color}&gender=${gender}&size=s&direction=2&head_direction=2&action=std&gesture=std`;
};

export const formatAssetName = (swfName: string): string => {
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
    case 'nft': return '#007bff';
    case 'hc': return '#ffc107';
    case 'ltd': return '#dc3545';
    case 'rare': return '#28a745';
    default: return '#6c757d';
  }
};

export const validateAsset = (swfName: string, detectedCategory: string): boolean => {
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
  
  return true;
};
