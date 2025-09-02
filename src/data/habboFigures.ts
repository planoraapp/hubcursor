// src/data/habboFigures.ts

export interface HabboFigurePart {
  id: number;
  type: string; // Ex: 'hd', 'hr', 'ch', 'lg', etc.
  name: string;
  category: 'hc' | 'normal' | 'sellable' | 'nft' | 'ltd' | 'rare';
  gender: 'M' | 'F' | 'U';
  colorSlots: number;
  catalogName?: string;
}

// ===========================================================================
// MAPA DE CORES HEXADECIMAIS PARA OS IDs NUMÉRICOS DE CORES DO HABBO
// Este mapa é fundamental para que as cores funcionem corretamente no Habbo Imaging.
// ===========================================================================
export const HABBO_COLOR_MAP: { [hex: string]: string } = {
  // Cores de pele e tons neutros (IDs comuns Habbo)
  'F5DA88': '1', 'FFDBC1': '2', 'FFCB98': '3', 'F4AC54': '4', 'FF987F': '5', 'e0a9a9': '6', 'ca8154': '7', 'B87560': '8',
  '9C543F': '9', '904925': '10', '4C311E': '11',

  // Cores Kihabbo (IDs extraídos do HTML Kihabbo)
  'DDDDDD': '1000', // Cinza claro Kihabbo
  '96743D': '1001', // Marrom Kihabbo
  '6B573B': '1002', // Marrom escuro Kihabbo
  'E7B027': '1003', // Amarelo Kihabbo
  'FFF7B7': '1004', // Creme Kihabbo
  'F8C790': '1005', // Pêssego Kihabbo
  '9F2B31': '1006', // Vermelho escuro Kihabbo
  'ED5C50': '1007', // Vermelho Kihabbo
  'FFBFC2': '1008', // Rosa claro Kihabbo
  'E7D1EE': '1009', // Lilás Kihabbo
  'AC94B3': '1010', // Roxo Kihabbo
  '7E5B90': '1011', // Roxo escuro Kihabbo
  '4F7AA2': '1012', // Azul Kihabbo
  '75B7C7': '1013', // Azul claro Kihabbo
  'C5EDE6': '1014', // Turquesa Kihabbo
  'BBF3BD': '1015', // Verde claro Kihabbo
  '6BAE61': '1016', // Verde Kihabbo
  '456F40': '1017', // Verde escuro Kihabbo
  '7A7D22': '1018', // Verde-oliva Kihabbo
  '595959': '1019', // Cinza médio Kihabbo

  // Cores comuns e cinzas
  '000000': '61', // Preto
  'FFFFFF': '1314', // Branco
  'CCCCCC': '1315', // Cinza claro
  '333333': '1316', // Cinza escuro
  '282828': '62', // Cinza muito escuro
  '828282': '63', // Cinza médio
  '222222': '64', // Outro tom de cinza
  '999999': '65', // Mais um cinza

  // Cores HC e outras diversas (IDs comuns em Habbo figures)
  'E3AE7D': '100', 'C99263': '101', 'AE7748': '102', '945C2F': '103',
  'FFC680': '104', 'DC9B4C': '105', 'FFB696': '106', 'F0DCA3': '107',
  'DFC375': '108', 'C89F56': '109', 'A89473': '110',
  
  '6E392C': '120', 'EAEFD0': '121', 'E2E4B0': '122', 'D5D08C': '123',
  'C4A7B3': '130', 'C2C4A7': '131', 'C5C0C2': '132', 'F1E5DA': '133',
  'B3BDC3': '140', 'D288CE': '142', '6799CC': '143',
  
  'FF7575': '150', 'FF5757': '151', 'BC576A': '152',

  'FF8C40': '160', 'B65E38': '161', 'B88655': '162', 'A2CC89': '163',
  'BDE05F': '164', '5DC446': '165',
  
  // Cores adicionais do HabboDefense que podem ser IDs específicos
  '543D35': '1400', '653A1D': '1401', '714947': '1402', '856860': '1403', '895048': '1404', 'A15253': '1405',
  'aa7870': '1406', 'be8263': '1407', 'b6856d': '1408',
  'ba8a82': '1409', 'c88f82': '1410', 'd9a792': '1411', 'c68383': '1412', 'a76644': '1413', '7c5133': '1414',
  '9a7257': '1415', 'c57040': '1416', 'd98c63': '1417', 'de9d75': '1418', 'eca782': '1419', 'f6d3d4': '1420',
  'e5b6b0': '1421', 'CA8154': '1422',
  '45': '45', // ID direto para cor 45
  '0': '0', // ID 0 para cor transparente/ausente
};

export const getHabboColorId = (color: string): string => {
  // Trata 'undefined' como '0' ou um ID de cor padrão
  if (color === 'undefined') return '0';
  
  const hex = color.startsWith('#') ? color.substring(1) : color;
  return HABBO_COLOR_MAP[hex.toUpperCase()] || color; // Tenta mapear, senão retorna o próprio valor (se já for um ID numérico)
};

export const HABBO_FIGURE_PARTS: HabboFigurePart[] = [
  // --- CABEÇAS/ROSTOS (hd) ---
  { id: 180, type: 'hd', name: 'Rosto Padrão Masculino', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic' },
  { id: 185, type: 'hd', name: 'Rosto Padrão 2', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic2' },
  { id: 190, type: 'hd', name: 'Rosto Padrão 3', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic3' },
  { id: 195, type: 'hd', name: 'Rosto Padrão 4', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic4' },
  { id: 200, type: 'hd', name: 'Rosto Padrão 5', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic5' },
  { id: 205, type: 'hd', name: 'Rosto Padrão 6', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic6' },
  { id: 208, type: 'hd', name: 'Rosto Padrão 7', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic7' },
  { id: 209, type: 'hd', name: 'Rosto Padrão 8', category: 'normal', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_basic8' },
  { id: 600, type: 'hd', name: 'Rosto Padrão Feminino', category: 'normal', gender: 'F', colorSlots: 2, catalogName: 'clothing_face_femalebasic' },
  
  // HC
  { id: 3091, type: 'hd', name: 'Rosto HC 1', category: 'hc', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_hc_1' },
  { id: 3092, type: 'hd', name: 'Rosto HC 2', category: 'hc', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_hc_2' },
  { id: 3093, type: 'hd', name: 'Rosto HC 3', category: 'hc', gender: 'M', colorSlots: 2, catalogName: 'clothing_face_hc_3' },
  { id: 3101, type: 'hd', name: 'Rosto HC Clássico', category: 'hc', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_h_classic' },
  
  // Sellable
  { id: 3536, type: 'hd', name: 'Cara de Gato Demoníaco', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_face_demoniccat' },
  { id: 3537, type: 'hd', name: 'Olho do Ciclope', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_cyclops' },
  { id: 3600, type: 'hd', name: 'Olhos Mil e Uma Noites', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_eyes_aladdinnights' },
  { id: 3603, type: 'hd', name: 'Olhos Zumbi', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_eyes_zombie' },
  { id: 3704, type: 'hd', name: 'Máscara Robótica', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_robotmask' },
  { id: 3721, type: 'hd', name: 'Look Vampiresco', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_face_vampire' },
  { id: 3813, type: 'hd', name: 'Decoração Facial Cristais', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_face_crystal' },
  { id: 3814, type: 'hd', name: 'Pintura Facial BoHo', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_face_boho' },
  { id: 3845, type: 'hd', name: 'Olhos Possuídos', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_eyes_possessed' },
  { id: 3956, type: 'hd', name: 'Maquiagem Bollywood', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_face_bollywood' },
  { id: 3997, type: 'hd', name: 'Rosto Marcado', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_face_marked' },
  { id: 4015, type: 'hd', name: 'Emoções Cibernéticas', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_face_cyber' },
  { id: 4023, type: 'hd', name: 'Mil Olhos', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_milleyes' },
  { id: 4163, type: 'hd', name: 'Maquiagem 80s', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_face_80s' },
  { id: 4174, type: 'hd', name: 'Maquiagem Gângster', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_face_gangster' },
  { id: 4383, type: 'hd', name: 'Makeup Idolo Pop', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_makeup_idol' },
  { id: 5522, type: 'hd', name: 'Maquiagem Cômica', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_makeup_comic' },
  { id: 5682, type: 'hd', name: 'Maquiagem Bratz Cloe', category: 'sellable', gender: 'F', colorSlots: 1, catalogName: 'clothing_bratz_face_chloe' },
  { id: 5696, type: 'hd', name: 'Maquiagem Coração', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_makeup_heart' },
  { id: 5913, type: 'hd', name: 'Rosto Coelhinho', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_bunnyface' },
  { id: 6021, type: 'hd', name: 'Rosto Queimado de Sol', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_sunburntface' },
  { id: 6072, type: 'hd', name: 'Rosto Bratz Koby', category: 'sellable', gender: 'M', colorSlots: 1, catalogName: 'clothing_bratz_face_koby' },
  
  // NFT
  { id: 4202, type: 'hd', name: 'Rosto NFT 1', category: 'nft', gender: 'U', colorSlots: 1, catalogName: 'clothing_nft_face1' },
  { id: 5316, type: 'hd', name: 'Olhar Brilhante NFT', category: 'nft', gender: 'U', colorSlots: 2, catalogName: 'clothing_nft_brighteyes' },
  { id: 5840, type: 'hd', name: 'Rosto NFT Sardento B', category: 'nft', gender: 'U', colorSlots: 1, catalogName: 'clothing_nft_freckledface_b' },
  { id: 6001, type: 'hd', name: 'Pele Bronze NFT', category: 'nft', gender: 'U', colorSlots: 0, catalogName: 'clothing_skin_bronze' },

  // --- CABELOS (hr) ---
  { id: 678, type: 'hr', name: 'Cabelo Ondulado Curto', category: 'hc', gender: 'U', colorSlots: 2, catalogName: 'clothing_messycurls' },
  { id: 3791, type: 'hr', name: 'Cabelo Comprido Roqueiro', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_messycurls' },
  { id: 5773, type: 'hr', name: 'Cabelo com Franja F', category: 'normal', gender: 'F', colorSlots: 2, catalogName: 'clothing_braidfringe' },
  { id: 828, type: 'hr', name: 'Cabelo Moderno', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_modernhair' },
  { id: 700, type: 'hr', name: 'Cabelo Longo Feminino', category: 'normal', gender: 'F', colorSlots: 2, catalogName: 'clothing_longf' },
  { id: 831, type: 'hr', name: 'Cabelo Simples M', category: 'normal', gender: 'M', colorSlots: 1, catalogName: 'clothing_basic_hair' },

  // --- TOPS (ch) ---
  { id: 6147, type: 'ch', name: 'Camiseta Básica', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_basictshirt' },
  { id: 800, type: 'ch', name: 'Blusa Básica Feminina', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_basicblousef' },
  { id: 3006, type: 'ch', name: 'Camisa Polo', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_polo' },
  { id: 3030, type: 'ch', name: 'Camiseta Clássica', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_tshirt_classic' },

  // --- CALÇAS/SAIAS (lg) ---
  { id: 900, type: 'lg', name: 'Saia Básica', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_basiclongskirt' },
  { id: 275, type: 'lg', name: 'Calça Jeans', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_jeans' },
  { id: 3138, type: 'lg', name: 'Calça Cargo', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_cargopants' },

  // --- SAPATOS (sh) ---
  { id: 100, type: 'sh', name: 'Sapato Feminino', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_femaleshoes' },
  { id: 3059, type: 'sh', name: 'Tênis Básico', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_sneakers' },
  { id: 905, type: 'sh', name: 'Tênis Esportivo', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_sneakers_sport' },

  // --- ACESSÓRIOS DE CABEÇA (ha) ---
  { id: 6198, type: 'ha', name: 'Faixa de Cabelo', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_headband' },
  { id: 1002, type: 'ha', name: 'Óculos de Sol', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_sunglasses' },
  { id: 1008, type: 'ha', name: 'Boné Básico', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_baseballcap' },

  // --- ACESSÓRIOS DE OLHOS (ea) ---
  { id: 1405, type: 'ea', name: 'Óculos de Sol Retrô', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_sunglasses_retro' },

  // --- ACESSÓRIOS DE ROSTO (fa) ---
  { id: 4043, type: 'fa', name: 'Máscara de Gás', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_gasmask' },
  { id: 4168, type: 'fa', name: 'Pintura Facial', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_facepaint' },

  // --- CAPAS (ca) ---
  { id: 301, type: 'ca', name: 'Capa Simples', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_basiccape' },
  { id: 4173, type: 'ca', name: 'Capa da Noite', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_nightcape' },

  // --- OUTROS ---
  { id: 1, type: 'cp', name: 'Estampa Coração', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_heartpattern' },

  // --- PEÇAS PARA REMOVER SLOTS ---
  { id: 0, type: 'cp', name: 'Remover Estampa', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'wa', name: 'Remover Cinto', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'he', name: 'Remover Acessório Cabelo', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'ea', name: 'Remover Óculos', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'fa', name: 'Remover Máscara/Rosto', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'cc', name: 'Remover Casaco/Vestido', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'ca', name: 'Remover Capa', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
  { id: 0, type: 'ct', name: 'Remover Top Curto', category: 'normal', gender: 'U', colorSlots: 0, catalogName: 'clothing_none' },
];

export const colorPalettes = {
  nonHc: [
    'F5DA88', 'FFDBC1', 'FFCB98', 'F4AC54', 'FF987F', 'E0A9A9', 'CA8154', 'B87560',
    '9C543F', '904925', '4C311E',
    'FFFFFF', 'CCCCCC', '999999', '666666', '333333', '000000',
  ],
  hc: [
    '543D35', '653A1D', '6E392C', '714947', '856860', '895048', 'A15253', 'AA7870',
    'BE8263', 'B6856D', 'BA8A82', 'C88F82', 'D9A792', 'C68383', 'BC576A', 'FF5757',
    'FF7575', 'B65E38', 'A76644', '7C5133', '9A7257', '945C2F', 'D98C63', 'AE7748',
    'C57040', 'B88655', 'C99263', 'A89473', 'C89F56', 'DC9B4C', 'FF8C40', 'DE9D75',
    'ECA782', 'FFB696', 'E3AE7D', 'FFC680', 'DFC375', 'F0DCA3', 'EAEFD0', 'E2E4B0',
    'D5D08C', 'BDE05F', '5DC446', 'A2CC89', 'C2C4A7', 'F1E5DA', 'F6D3D4', 'E5B6B0',
    'C4A7B3', 'AC94B3', 'D288CE', '6799CC', 'B3BDC3', 'C5C0C2',
  ],
};

export const subNavCategories: { [key: string]: string } = {
  hd: 'Rosto & Corpo',
  hr: 'Cabelos',
  ch: 'Parte de cima',
  lg: 'Parte de baixo',
  sh: 'Sapatos',
  ha: 'Chapéus',
  he: 'Acessórios Cabelo',
  ea: 'Óculos',
  fa: 'Máscaras/Rosto',
  cp: 'Estampas',
  cc: 'Casacos/Vestidos',
  wa: 'Cintos',
  ca: 'Capas',
  ct: 'Tops Curtos',
};