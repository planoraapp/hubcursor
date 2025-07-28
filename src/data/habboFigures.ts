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
  'F5DA88': '1', 'FFDBC1': '2', 'FFCB98': '3', 'F4AC54': '4', 'FF987F': '5', 'E0A9A9': '6', 'CA8154': '7', 'B87560': '8',
  '9C543F': '9', '904925': '10', '4C311E': '11',

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
  'B3BDC3': '140', 'AC94B3': '141', 'D288CE': '142', '6799CC': '143',
  
  'FF7575': '150', 'FF5757': '151', 'BC576A': '152',

  'FF8C40': '160', 'B65E38': '161', 'B88655': '162', 'A2CC89': '163',
  'BDE05F': '164', '5DC446': '165',
  
  // Cores adicionais do HabboDefense/Kihabbo que podem ser IDs específicos
  '543D35': '1400', '653A1D': '1401', '714947': '1402', '856860': '1403', '895048': '1404', 'A15253': '1405',
  'AA7870': '1406', 'BE8263': '1407', 'B6856D': '1408',
  'BA8A82': '1409', 'C88F82': '1410', 'D9A792': '1411', 'C68383': '1412', 'A76644': '1413', '7C5133': '1414',
  '9A7257': '1415', 'C57040': '1416', 'D98C63': '1417', 'DE9D75': '1418', 'ECA782': '1419', 'F6D3D4': '1420',
  'E5B6B0': '1421',
};

export const getHabboColorId = (hexColor: string): string => {
  return HABBO_COLOR_MAP[hexColor.toUpperCase()] || '61'; // Fallback para '61' (preto)
};

export const HABBO_FIGURE_PARTS: HabboFigurePart[] = [
  // Cabeças (hd)
  { id: 180, type: 'hd', name: 'Rosto Padrão Masculino', category: 'normal', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_basic' },
  { id: 600, type: 'hd', name: 'Rosto Padrão Feminino', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_face_femalebasic' },
  { id: 3537, type: 'hd', name: 'Olho do Ciclope', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_cyclops' },
  { id: 3704, type: 'hd', name: 'Máscara Robótica', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_robotmask' },
  { id: 5840, type: 'hd', name: 'Rosto Expressivo NFT', category: 'nft', gender: 'U', colorSlots: 3, catalogName: 'clothing_nftface_scare' },
  { id: 3101, type: 'hd', name: 'Rosto HC Clássico', category: 'hc', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_h_classic' },
  { id: 209, type: 'hd', name: 'Rosto Expressivo M', category: 'normal', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_basic8' },

  // Cabelos (hr)
  { id: 678, type: 'hr', name: 'Cabelo Ondulado Curto', category: 'hc', gender: 'U', colorSlots: 2, catalogName: 'clothing_messycurls' },
  { id: 5773, type: 'hr', name: 'Cabelo com Franja F', category: 'normal', gender: 'F', colorSlots: 2, catalogName: 'clothing_braidfringe' },
  { id: 828, type: 'hr', name: 'Cabelo Moderno', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_modernhair' },
  { id: 700, type: 'hr', name: 'Cabelo Longo Feminino', category: 'normal', gender: 'F', colorSlots: 2, catalogName: 'clothing_longf' },

  // Tops (ch)
  { id: 6147, type: 'ch', name: 'Camiseta Básica', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_basictshirt' },
  { id: 800, type: 'ch', name: 'Blusa Básica Feminina', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_basicblousef' },
  { id: 3006, type: 'ch', name: 'Camisa Polo', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_polo' },

  // Calças (lg)
  { id: 900, type: 'lg', name: 'Saia Básica', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_basiclongskirt' },
  { id: 275, type: 'lg', name: 'Calça Jeans', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_jeans' },

  // Sapatos (sh)
  { id: 100, type: 'sh', name: 'Sapato Feminino', category: 'normal', gender: 'F', colorSlots: 1, catalogName: 'clothing_femaleshoes' },
  { id: 3059, type: 'sh', name: 'Tênis Básico', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_sneakers' },

  // Acessórios de cabeça (ha)
  { id: 6198, type: 'ha', name: 'Faixa de Cabelo', category: 'sellable', gender: 'U', colorSlots: 2, catalogName: 'clothing_headband' },
  { id: 1002, type: 'ha', name: 'Óculos de Sol', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_sunglasses' },
  { id: 1008, type: 'ha', name: 'Boné Básico', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_baseballcap' },

  // Acessórios de rosto (fa)
  { id: 4043, type: 'fa', name: 'Máscara de Gás', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_gasmask' },
  { id: 4168, type: 'fa', name: 'Pintura Facial', category: 'normal', gender: 'U', colorSlots: 2, catalogName: 'clothing_facepaint' },

  // Outros
  { id: 1, type: 'cp', name: 'Estampa Coração', category: 'normal', gender: 'U', colorSlots: 1, catalogName: 'clothing_heartpattern' },
  { id: 301, type: 'ca', name: 'Capa Simples', category: 'sellable', gender: 'U', colorSlots: 1, catalogName: 'clothing_basiccape' },
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
  hd: 'Corpo/Rostos',
  hr: 'Cabelos',
  ch: 'Tops',
  lg: 'Calças/Saias',
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