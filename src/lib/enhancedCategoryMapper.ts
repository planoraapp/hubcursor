
// Sistema de categorização inteligente para 2871+ flash assets
export const ENHANCED_CATEGORY_MAPPING = {
  // === ACESSÓRIOS ESPECÍFICOS (735+ assets reorganizados) ===
  'acc_chest': 'ca',     // ~200 acessórios de peito
  'acc_head': 'ha',      // ~150 acessórios de cabeça -> chapéus
  'acc_eye': 'ea',       // ~100 óculos e acessórios de olhos
  'acc_face': 'fa',      // ~80 máscaras e acessórios faciais
  'acc_waist': 'wa',     // ~50 acessórios de cintura
  'acc_print': 'cp',     // ~30 estampas e prints
  
  // === ROUPAS PRINCIPAIS ===
  'shirt': 'ch',         // 528+ camisetas
  'jacket': 'cc',        // 303+ casacos e jaquetas
  'trousers': 'lg',      // 134+ calças
  'shoes': 'sh',         // 82+ sapatos
  
  // === CABEÇA E ROSTO ===
  'hair': 'hr',          // 220+ cabelos
  'hat': 'ha',           // 461+ chapéus
  'face': 'hd',          // 83+ rostos
  
  // === NOVAS CATEGORIAS ===
  'effects': 'fx',       // ~200 efeitos especiais
  'pets': 'pets',        // ~50 pets e animais
  'dance': 'dance',      // ~15 danças
  
  // === MAPEAMENTOS ALTERNATIVOS ===
  'top': 'ch',           // Tops -> camisetas
  'bottom': 'lg',        // Bottoms -> calças
  'footwear': 'sh',      // Calçados -> sapatos
  'headwear': 'ha',      // Chapelaria -> chapéus
  'eyewear': 'ea',       // Óculos -> acessórios de olho
  'necklace': 'ca',      // Colares -> acessórios peito
  'belt': 'wa'           // Cintos -> cintura
} as const;

// Categorias expandidas com metadados
export const CATEGORY_METADATA = {
  'hd': { name: 'Rostos', icon: '👤', section: 'head', color: '#FF6B6B' },
  'hr': { name: 'Cabelos', icon: '💇', section: 'head', color: '#4ECDC4' },
  'ha': { name: 'Chapéus', icon: '🎩', section: 'head', color: '#45B7D1' },
  'ea': { name: 'Óculos', icon: '👓', section: 'head', color: '#96CEB4' },
  'fa': { name: 'Acessórios Rosto', icon: '😎', section: 'head', color: '#FFEAA7' },
  
  'ch': { name: 'Camisetas', icon: '👕', section: 'body', color: '#DDA0DD' },
  'cc': { name: 'Casacos', icon: '🧥', section: 'body', color: '#98D8C8' },
  'ca': { name: 'Acessórios Peito', icon: '🎖️', section: 'body', color: '#F7DC6F' },
  'cp': { name: 'Estampas', icon: '🎨', section: 'body', color: '#BB8FCE' },
  
  'lg': { name: 'Calças', icon: '👖', section: 'legs', color: '#85C1E9' },
  'sh': { name: 'Sapatos', icon: '👟', section: 'legs', color: '#F8C471' },
  'wa': { name: 'Cintura', icon: '👔', section: 'legs', color: '#82E0AA' },
  
  // NOVAS CATEGORIAS
  'fx': { name: 'Efeitos Especiais', icon: '✨', section: 'special', color: '#E74C3C' },
  'pets': { name: 'Pets', icon: '🐾', section: 'special', color: '#F39C12' },
  'dance': { name: 'Danças', icon: '💃', section: 'special', color: '#9B59B6' }
} as const;

// Seções organizadas
export const CATEGORY_SECTIONS = {
  head: {
    id: 'head',
    name: 'Cabeça e Acessórios',
    icon: '👤',
    categories: ['hd', 'hr', 'ha', 'ea', 'fa']
  },
  body: {
    id: 'body',
    name: 'Corpo e Roupas',
    icon: '👕',
    categories: ['ch', 'cc', 'ca', 'cp']
  },
  legs: {
    id: 'legs',
    name: 'Pernas e Pés',
    icon: '👖',
    categories: ['lg', 'sh', 'wa']
  },
  special: {
    id: 'special',
    name: 'Efeitos Especiais',
    icon: '✨',
    categories: ['fx', 'pets', 'dance']
  }
} as const;

// Parser inteligente de categoria
export const parseAssetCategory = (filename: string): string => {
  if (!filename) return 'ch';
  
  const cleanName = filename.toLowerCase().replace('.swf', '');
  
  // 1. Verificar prefixos específicos primeiro
  for (const [pattern, category] of Object.entries(ENHANCED_CATEGORY_MAPPING)) {
    if (cleanName.startsWith(pattern)) {
      return category;
    }
  }
  
  // 2. Verificar padrões nos nomes
  if (cleanName.includes('hair') || cleanName.includes('hr_')) return 'hr';
  if (cleanName.includes('hat') || cleanName.includes('cap') || cleanName.includes('helmet')) return 'ha';
  if (cleanName.includes('shirt') || cleanName.includes('top') || cleanName.includes('ch_')) return 'ch';
  if (cleanName.includes('jacket') || cleanName.includes('coat') || cleanName.includes('cc_')) return 'cc';
  if (cleanName.includes('trouser') || cleanName.includes('pant') || cleanName.includes('lg_')) return 'lg';
  if (cleanName.includes('shoe') || cleanName.includes('boot') || cleanName.includes('sh_')) return 'sh';
  if (cleanName.includes('glass') || cleanName.includes('sunglass')) return 'ea';
  if (cleanName.includes('mask') || cleanName.includes('beard')) return 'fa';
  if (cleanName.includes('belt') || cleanName.includes('waist')) return 'wa';
  if (cleanName.includes('necklace') || cleanName.includes('badge')) return 'ca';
  
  // 3. Detectar efeitos especiais
  if (cleanName.includes('effect') || cleanName.includes('ghost') || cleanName.includes('freeze') || 
      cleanName.includes('butterfly') || cleanName.includes('fire') || cleanName.includes('ice') ||
      cleanName.includes('spark') || cleanName.includes('glow') || cleanName.includes('aura')) return 'fx';
  
  // 4. Detectar pets
  if (cleanName.includes('dog') || cleanName.includes('cat') || cleanName.includes('horse') ||
      cleanName.includes('pig') || cleanName.includes('bear') || cleanName.includes('pet')) return 'pets';
  
  // 5. Detectar danças
  if (cleanName.includes('dance') || cleanName.includes('dancing')) return 'dance';
  
  return 'ch'; // Default fallback
};

// Parser de gênero inteligente
export const parseAssetGender = (filename: string): 'M' | 'F' | 'U' => {
  if (!filename) return 'U';
  
  const lowerName = filename.toLowerCase();
  
  // Padrões específicos
  if (lowerName.includes('_f_') || lowerName.includes('female')) return 'F';
  if (lowerName.includes('_m_') || lowerName.includes('male')) return 'M';
  
  // Lógica contextual
  if (lowerName.includes('dress') || lowerName.includes('skirt') || lowerName.includes('heels')) return 'F';
  if (lowerName.includes('beard') || lowerName.includes('moustache')) return 'M';
  
  return 'U'; // Unissex por padrão
};

// Extrair figura ID inteligente
export const parseAssetFigureId = (filename: string): string => {
  if (!filename) return '1';
  
  // Extrair números do nome
  const numbers = filename.match(/(\d+)/g);
  if (numbers && numbers.length > 0) {
    // Pegar o maior número (geralmente é o ID)
    return numbers.sort((a, b) => parseInt(b) - parseInt(a))[0];
  }
  
  // Gerar hash determinístico se não houver ID
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 9999).toString();
};

// Gerar cores por categoria
export const generateCategoryColors = (category: string): string[] => {
  const colorSets: Record<string, string[]> = {
    'hd': ['1', '2', '3', '4', '5'], // Tons de pele
    'hr': ['1', '2', '45', '61', '92', '104', '100'], // Cores de cabelo
    'ha': ['1', '61', '92', '100', '102', '143'], // Chapéus
    'ea': ['1', '2', '3', '4', '61'], // Óculos
    'fa': ['1', '2', '3', '61', '92'], // Acessórios faciais
    'ch': ['1', '61', '92', '100', '101', '102', '143'], // Camisetas
    'cc': ['1', '2', '61', '92', '100', '102'], // Casacos
    'ca': ['1', '61', '92', '100'], // Acessórios peito
    'cp': ['1', '2', '3', '4', '5'], // Estampas
    'lg': ['1', '2', '61', '92', '100', '101'], // Calças
    'sh': ['1', '2', '61', '92', '100'], // Sapatos
    'wa': ['1', '61', '92'], // Cintura
    'fx': ['1', '61', '92', '100'], // Efeitos
    'pets': ['1', '45', '61'], // Pets
    'dance': ['1'] // Danças
  };
  
  return colorSets[category] || ['1', '2', '3', '4', '5'];
};

// Gerar thumbnail isolada focada na peça
export const generateIsolatedThumbnail = (
  category: string, 
  figureId: string, 
  colorId: string = '1', 
  gender: string = 'M'
): string => {
  // Configurações base minimalistas para destacar a peça
  const baseConfigurations: Record<string, string> = {
    'hd': `hd-180-1`, // Apenas cabeça
    'hr': `hd-180-1`, // Cabeça + cabelo destacado
    'ha': `hd-180-1.hr-828-45`, // Base + cabelo neutro
    'ea': `hd-180-1.hr-828-45`, // Base para óculos
    'fa': `hd-180-1.hr-828-45`, // Base para acessórios faciais
    'ch': `hd-180-1.hr-828-45`, // Base minimalista
    'cc': `hd-180-1.hr-828-45.ch-665-92`, // Base + camisa básica
    'ca': `hd-180-1.hr-828-45.ch-665-92`, // Base para acessórios peito
    'cp': `hd-180-1.hr-828-45.ch-665-92`, // Base para estampas
    'lg': `hd-180-1.hr-828-45.ch-665-92`, // Base sem calça
    'sh': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`, // Base completa
    'wa': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`, // Base para cintura
    'fx': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`, // Base completa para efeitos
    'pets': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`, // Base completa
    'dance': `hd-180-1.hr-828-45.ch-665-92.lg-700-1` // Base completa
  };
  
  const baseAvatar = baseConfigurations[category] || baseConfigurations['ch'];
  const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
};

// Detectar raridade do asset
export const parseAssetRarity = (filename: string): 'nft' | 'hc' | 'ltd' | 'rare' | 'common' => {
  if (!filename) return 'common';
  
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('nft')) return 'nft';
  if (lowerName.includes('ltd') || lowerName.includes('limited')) return 'ltd';
  if (lowerName.includes('hc') || lowerName.includes('club')) return 'hc';
  if (lowerName.includes('rare') || lowerName.includes('special')) return 'rare';
  
  return 'common';
};

// Formatador de nome inteligente
export const formatAssetName = (filename: string, category: string): string => {
  if (!filename) return 'Asset Desconhecido';
  
  const categoryNames = CATEGORY_METADATA;
  const categoryName = categoryNames[category as keyof typeof categoryNames]?.name || 'Item';
  
  // Extrair nome limpo
  const namePart = filename
    .replace(/^[a-z_]+_[MFU]?_?/, '')
    .replace('.swf', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  const figureId = parseAssetFigureId(filename);
  const rarity = parseAssetRarity(filename);
  const rarityTag = rarity !== 'common' ? ` (${rarity.toUpperCase()})` : '';
  
  return `${categoryName} ${namePart || figureId}${rarityTag}`.trim();
};
