
// Mapeamento melhorado para categorização correta dos assets
export const IMPROVED_CATEGORY_MAPPING = {
  // Cabeça e rostos
  'hd': 'hd',
  'head': 'hd',
  'face': 'hd',
  
  // Cabelos
  'hr': 'hr',
  'hair': 'hr',
  'hairstyle': 'hr',
  
  // Camisetas e tops
  'ch': 'ch',
  'shirt': 'ch',
  'top': 'ch',
  'tshirt': 'ch',
  'blouse': 'ch',
  
  // Casacos e jaquetas
  'cc': 'cc',
  'jacket': 'cc',
  'coat': 'cc',
  'blazer': 'cc',
  'hoodie': 'cc',
  
  // Calças e saias
  'lg': 'lg',
  'trousers': 'lg',
  'pants': 'lg',
  'jeans': 'lg',
  'skirt': 'lg',
  'shorts': 'lg',
  
  // Sapatos
  'sh': 'sh',
  'shoes': 'sh',
  'boots': 'sh',
  'sneakers': 'sh',
  'sandals': 'sh',
  
  // Chapéus
  'ha': 'ha',
  'hat': 'ha',
  'cap': 'ha',
  'beanie': 'ha',
  'helmet': 'ha',
  
  // Óculos
  'ea': 'ea',
  'glasses': 'ea',
  'sunglasses': 'ea',
  'eyewear': 'ea',
  'acc_eye': 'ea',
  
  // Acessórios faciais
  'fa': 'fa',
  'mask': 'fa',
  'acc_face': 'fa',
  'facial': 'fa',
  
  // Acessórios de peito
  'ca': 'ca',
  'acc_chest': 'ca',
  'necklace': 'ca',
  'badge': 'ca',
  
  // Cintura
  'wa': 'wa',
  'belt': 'wa',
  'acc_waist': 'wa',
  
  // Estampas
  'cp': 'cp',
  'print': 'cp',
  'acc_print': 'cp'
} as const;

export const getCategoryFromSwfName = (swfName: string): string => {
  if (!swfName) return 'ch';
  
  const lowerName = swfName.toLowerCase();
  
  // Análise detalhada do nome do arquivo
  for (const [pattern, category] of Object.entries(IMPROVED_CATEGORY_MAPPING)) {
    if (lowerName.includes(pattern)) {
      return category;
    }
  }
  
  // Padrões específicos para casos especiais
  if (lowerName.includes('hair') || lowerName.includes('hr_')) return 'hr';
  if (lowerName.includes('shirt') || lowerName.includes('ch_')) return 'ch';
  if (lowerName.includes('trouser') || lowerName.includes('lg_')) return 'lg';
  if (lowerName.includes('shoe') || lowerName.includes('sh_')) return 'sh';
  if (lowerName.includes('hat') || lowerName.includes('ha_')) return 'ha';
  if (lowerName.includes('glass') || lowerName.includes('ea_')) return 'ea';
  if (lowerName.includes('jacket') || lowerName.includes('cc_')) return 'cc';
  if (lowerName.includes('acc_')) {
    if (lowerName.includes('chest')) return 'ca';
    if (lowerName.includes('waist')) return 'wa';
    if (lowerName.includes('eye')) return 'ea';
    if (lowerName.includes('face')) return 'fa';
  }
  
  return 'ch'; // Default fallback
};

export const generateIsolatedThumbnail = (category: string, figureId: string, colorId: string = '1', gender: string = 'M'): string => {
  // Criar figura base minimalista para destacar apenas a peça específica
  const baseComponents: Record<string, string> = {
    'hd': `hd-180-1`, // Apenas cabeça básica
    'hr': `hd-180-1`, // Cabeça + cabelo
    'ch': `hd-180-1.hr-828-45`, // Cabeça + cabelo básico
    'cc': `hd-180-1.hr-828-45.ch-665-92`, // Base + camisa básica
    'lg': `hd-180-1.hr-828-45.ch-665-92`, // Base sem calça
    'sh': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`, // Base completa
    'ha': `hd-180-1.hr-828-45`, // Base para destacar chapéu
    'ea': `hd-180-1.hr-828-45`, // Base para destacar óculos
    'fa': `hd-180-1.hr-828-45`, // Base para acessórios faciais
    'ca': `hd-180-1.hr-828-45.ch-665-92`, // Base para acessórios de peito
    'wa': `hd-180-1.hr-828-45.ch-665-92.lg-700-1`, // Base para cintura
    'cp': `hd-180-1.hr-828-45.ch-665-92` // Base para estampas
  };
  
  const baseAvatar = baseComponents[category] || baseComponents['ch'];
  const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&size=l&direction=2&head_direction=3&action=std&gesture=std`;
};
