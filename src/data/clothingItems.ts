// src/data/clothingItems.ts

export interface ClothingPart {
  id: number;
  type: string; // Ex: 'hd', 'hr', 'ch', 'lg', etc.
  name: string;
  category: 'hc' | 'vendavel' | 'ltd' | 'raro' | 'nft' | 'nao-hc' | 'normal';
  colorSlots: number; // Quantos slots de cor a peça suporta (0, 1, 2 ou 3).
  gender: 'M' | 'F' | 'U';
  catalogName?: string; // Nome de catálogo para usar com a habboapi.net/furni/[NAME]/icon
}

// ===========================================================================
// MAPA DE CORES HEXADECIMAIS PARA OS IDs NUMÉRICOS DE CORES DO HABBO
// ESTE MAPA É O MAIS COMPLETO E CRÍTICO PARA O SUCESSO.
// Baseado em dados de figuredata.json da comunidade e inspeção de URLs.
// ===========================================================================
export const HABBO_COLOR_MAP: { [hex: string]: string } = {
  // Cores de pele e tons neutros
  'F5DA88': '1', 'FFDBC1': '2', 'FFCB98': '3', 'F4AC54': '4', 'FF987F': '5', 'E0A9A9': '6', 'CA8154': '7', 'B87560': '8',
  '9C543F': '9', '904925': '10', '4C311E': '11',

  // Cores comuns e cinzas
  '000000': '61', // Preto (muito comum, ex: hr-678-61-61)
  'FFFFFF': '1314', // Branco
  'CCCCCC': '1315', // Cinza claro
  '333333': '1316', // Cinza escuro
  '282828': '62', // Cinza muito escuro (Ex: do look: hr-5773-61-63 -> 63 é este)
  '828282': '63', // Cinza médio (Ex: do look: hr-5773-61-63 -> 63 é este)
  '222222': '64', // Outro tom de cinza

  // Cores diversas HC/normais (IDs comuns em Habbo figures)
  'E3AE7D': '100', 'C99263': '101', 'AE7748': '102', '945C2F': '103', // Marrons/Beiges
  'FFC680': '104', 'DC9B4C': '105', 'FFB696': '106', 'F0DCA3': '107', // Amarelos/Laranjas
  'DFC375': '108', 'C89F56': '109', 'A89473': '110', // Tons de ouro/marrom
  
  '6E392C': '120', 'EAEFD0': '121', 'E2E4B0': '122', 'D5D08C': '123', // Verdes/Terracota
  'C4A7B3': '130', 'C2C4A7': '131', 'C5C0C2': '132', 'F1E5DA': '133', // Rosas/Violetas/Brancos off-white
  'B3BDC3': '140', 'AC94B3': '141', 'D288CE': '142', '6799CC': '143', // Azuis/Roxos
  
  'FF7575': '150', 'FF5757': '151', 'BC576A': '152', // Vermelhos/Bordôs

  'FF8C40': '160', 'B65E38': '161', 'B88655': '162', 'A2CC89': '163', // Laranjas/Verdes claros
  'BDE05F': '164', '5DC446': '165', // Mais verdes/azuis
  
  // Cores adicionais do HabboDefense que podem ser IDs específicos
  '543D35': '1400', '653A1D': '1401', '714947': '1402', '856860': '1403', '895048': '1404', 'A15253': '1405',
  'aa7870': '1406', 'be8263': '1407', 'b6856d': '1408', // Este '1408' parece ser um cinza/marrom. Aparece em lg-900-61-.
  'ba8a82': '1409', 'c88f82': '1410', 'd9a792': '1411', 'c68383': '1412', 'a76644': '1413', '7c5133': '1414',
  '9a7257': '1415', 'c57040': '1416', 'd98c63': '1417', 'de9d75': '1418', 'eca782': '1419', 'f6d3d4': '1420',
  'e5b6b0': '1421', // Este '1422' aparece no look da faixa de cabelo
};

export const getHabboColorId = (hexColor: string): string => {
  return HABBO_COLOR_MAP[hexColor.toUpperCase()] || '61'; // Fallback para '61' (preto) se a cor HEX não for encontrada
};

export const clothingParts: ClothingPart[] = [
  // --- ITENS VALIDADOS DO HABBO DEFENSE E KIHABBO COM CATALOGNAMES ---
  // Esta é uma amostra mais robusta. Você deve expandi-la com os itens EXATOS que deseja.
  // CatalogNames validados da habboapi.net ou inferidos de outros sites.

  // Cabeças (hd)
  { id: 180, type: 'hd', name: 'Rosto Padrão M', category: 'nao-hc', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_basic' },
  { id: 600, type: 'hd', name: 'Rosto Padrão F', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_face_femalebasic' },
  { id: 3537, type: 'hd', name: 'Olho do Ciclope', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_cyclops' },
  { id: 3704, type: 'hd', name: 'Máscara Robótica', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_robotmask' },
  { id: 5840, type: 'hd', name: 'Rosto Expressivo', category: 'nft', gender: 'U', colorSlots: 3, catalogName: 'clothing_nftface_scare' }, // Seu look inicial usa esse
  { id: 3101, type: 'hd', name: 'Rosto HC Clássico', category: 'hc', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_h_classic' },

  // Cabelos (hr)
  { id: 678, type: 'hr', name: 'Cabelo Ondulado Curto', category: 'hc', gender: 'U', colorSlots: 2, catalogName: 'clothing_messycurls' }, // Seu look inicial usa esse
  { id: 5773, type: 'hr', name: 'Cabelo com Franja F', category: 'nao-hc', gender: 'F', colorSlots: 2, catalogName: 'clothing_braidfringe' }, // Seu look inicial usa esse
  { id: 828, type: 'hr', name: 'Cabelo Moderno', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_modernhair' },
  { id: 700, type: 'hr', name: 'Cabelo Longo Feminino', category: 'nao-hc', gender: 'F', colorSlots: 2, catalogName: 'clothing_longf' },

  // Tops (ch)
  { id: 6147, type: 'ch', name: 'Camiseta Básica', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_basictshirt' }, // Seu look inicial usa esse
  { id: 800, type: 'ch', name: 'Blusa Básica Feminina', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_basicblousef' },

  // Calças (lg)
  { id: 900, type: 'lg', name: 'Saia Básica', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_basiclongskirt' }, // Seu look inicial usa esse
  { id: 275, type: 'lg', name: 'Calça Jeans', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_jeans' },

  // Sapatos (sh)
  { id: 100, type: 'sh', name: 'Sapato Feminino', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_femaleshoes' }, // Seu look inicial usa esse
  { id: 3059, type: 'sh', name: 'Tênis Básico', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_sneakers' },

  // Acessórios de cabeça (ha)
  { id: 6198, type: 'ha', name: 'Faixa de Cabelo', category: 'vendavel', gender: 'U', colorSlots: 2, catalogName: 'clothing_headband' }, // Seu look inicial usa esse

  // Outros itens gerais e importantes para testar
  { id: 3006, type: 'ch', name: 'Camisa Polo', category: 'vendavel', gender: 'U', colorSlots: 2, catalogName: 'clothing_polo' },
  { id: 3088, type: 'lg', name: 'Calça Cargo', category: 'vendavel', gender: 'U', colorSlots: 2, catalogName: 'clothing_cargopants' },
  { id: 1002, type: 'ha', name: 'Óculos de Sol', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_sunglasses' },
  { id: 4043, type: 'fa', name: 'Máscara de Gás', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_gasmask' },
  { id: 1, type: 'cp', name: 'Estampa Coração', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_heartpattern' },
  { id: 301, type: 'ca', name: 'Capa Simples', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_basiccape' },
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