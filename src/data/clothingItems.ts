// src/data/clothingItems.ts

export interface ClothingPart {
  id: number;
  type: string; // Ex: 'hd', 'hr', 'ch', 'lg', etc.
  name: string;
  category: 'hc' | 'vendavel' | 'ltd' | 'raro' | 'nft' | 'nao-hc' | 'normal';
  colorSlots: number; // Quantos slots de cor a peça suporta (0, 1, 2 ou 3).
  gender: 'M' | 'F' | 'U';
  catalogName: string; // Nome de catálogo para usar com a habboapi.net/furni/[NAME]/icon
}

// MAPA DE CORES HEXADECIMAIS PARA OS IDs NUMÉRICOS DE CORES DO HABBO
// Este é o mapa mais completo que conseguimos extrair dos seus exemplos.
export const HABBO_COLOR_MAP: { [hex: string]: string } = {
  'F5DA88': '1', 'FFDBC1': '2', 'FFCB98': '3', 'F4AC54': '4', 'FF987F': '5', 'E0A9A9': '6', 'CA8154': '7', 'B87560': '8',
  '9C543F': '9', '904925': '10', '4C311E': '11', // Cores de pele/básicas

  '000000': '61', // Preto
  'FFFFFF': '1314', // Branco
  'CCCCCC': '1315', // Cinza claro
  '333333': '1316', // Cinza escuro
  '282828': '62', // Cinza muito escuro
  '828282': '63', // Cinza médio
  
  // Cores HC e outras diversas (baseado em HabboDefense)
  'E3AE7D': '2', 'C99263': '3', 'AE7748': '4', '945C2F': '5', 'FFC680': '7', 'DC9B4C': '9', 'FFB696': '11', 'F0DCA3': '13',
  'DFC375': '15', 'C89F56': '17', 'A89473': '18', '6E392C': '21', 'EAEFD0': '22', 'E2E4B0': '23', 'D5D08C': '24', 'C4A7B3': '25',
  'C2C4A7': '26', 'C5C0C2': '27', 'F1E5DA': '28', 'B3BDC3': '29', 'FF8C40': '1357', 'B65E38': '1358', 'B88655': '1359',
  'A2CC89': '1360', 'BDE05F': '1361', '5DC446': '1362', 'AC94B3': '1363', 'D288CE': '1364', '6799CC': '1365', 'FF7575': '1366',
  'FF5757': '1367', 'BC576A': '1368', '543d35': '1372', '653a1d': '1373', '714947': '1374', '856860': '1375', '895048': '1376',
  'a15253': '1377', 'aa7870': '1378', 'be8263': '1379', 'b6856d': '1380', 'ba8a82': '1381', 'c88f82': '1382', 'd9a792': '1383',
  'c68383': '1384', 'a76644': '1385', '7c5133': '1386', '9a7257': '1387', 'c57040': '1388', 'd98c63': '1389', 'de9d75': '1390',
  'eca782': '1391', 'f6d3d4': '1392', 'e5b6b0': '1393',
};


export const getHabboColorId = (hexColor: string): string => {
  return HABBO_COLOR_MAP[hexColor.toUpperCase()] || '1';
};


export const clothingParts: ClothingPart[] = [
  // --- ITENS VALIDADOS DO HABBO DEFENSE E KIHABBO (EXEMPLOS COM CATALOGNAME) ---
  // Lembre-se de que esta é uma lista de exemplo. Você precisará expandi-la
  // com TODOS os IDs, tipos, colorSlots e catalogNames das roupas que deseja exibir.
  // O catalogName é essencial para as miniaturas da habboapi.net.

  // Cabeças (hd) - Note: headonly=1 no preview do Habbo Imaging para hd
  { id: 180, type: 'hd', name: 'Rosto Padrão M', category: 'nao-hc', gender: 'M', colorSlots: 1, catalogName: 'clothing_face_basic' },
  { id: 600, type: 'hd', name: 'Rosto Padrão F', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_face_femalebasic' },
  { id: 3704, type: 'hd', name: 'Máscara Robótica', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_robotmask' },
  { id: 5840, type: 'hd', name: 'Rosto Expressivo', category: 'nft', gender: 'U', colorSlots: 3, catalogName: 'clothing_nftface_scare' }, // Exemplo de 3 slots
  { id: 3537, type: 'hd', name: 'Olho do Ciclope', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_cyclops' },
  { id: 3600, type: 'hd', name: 'Olhos Mil e Uma Noites', category: 'vendavel', gender: 'U', colorSlots: 2, catalogName: 'clothing_eyes_aladdinnights' },
  { id: 5430, type: 'hd', name: 'Pedregulho', category: 'nft', gender: 'U', colorSlots: 0, catalogName: 'clothing_skin_stone' }, // 0 slots de cor
  { id: 6001, type: 'hd', name: 'Pele Bronze', category: 'nft', gender: 'U', colorSlots: 0, catalogName: 'clothing_skin_bronze' },

  // Cabelos (hr)
  { id: 678, type: 'hr', name: 'Cabelo Ondulado Curto', category: 'hc', gender: 'U', colorSlots: 2, catalogName: 'clothing_messycurls' }, // hr-678-61-61
  { id: 5773, type: 'hr', name: 'Cabelo com Franja F', category: 'nao-hc', gender: 'F', colorSlots: 2, catalogName: 'clothing_braidfringe' }, // hr-5773-34-55
  { id: 828, type: 'hr', name: 'Cabelo Moderno', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_modernhair' }, // hr-828-61
  { id: 700, type: 'hr', name: 'Cabelo Longo Feminino', category: 'nao-hc', gender: 'F', colorSlots: 2, catalogName: 'clothing_longf' },

  // Tops (ch)
  { id: 6147, type: 'ch', name: 'Camiseta Básica', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_basictshirt' }, // ch-6147-61
  { id: 800, type: 'ch', name: 'Blusa Básica Feminina', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_basicblousef' },

  // Calças (lg)
  { id: 3088, type: 'lg', name: 'Calça Cargo', category: 'vendavel', gender: 'U', colorSlots: 2, catalogName: 'clothing_cargopants' }, // lg-3088-1422-110
  { id: 275, type: 'lg', name: 'Calça Jeans', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_jeans' },

  // Sapatos (sh)
  { id: 906, type: 'sh', name: 'Tênis Moderno', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_sneakers' }, // sh-906-1412
  { id: 100, type: 'sh', name: 'Sapato Feminino', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_femaleshoes' },

  // Acessórios de cabeça (ha)
  { id: 6198, type: 'ha', name: 'Faixa de Cabelo', category: 'vendavel', gender: 'U', colorSlots: 2, catalogName: 'clothing_headband' }, // ha-6198-61-1422
  { id: 101, type: 'ha', name: 'Tiara de Flores', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_flowerheadband' },

  // Acessórios de rosto (fa)
  { id: 4043, type: 'fa', name: 'Máscara de Gás', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_gasmask' },

  // Capas (ca)
  { id: 301, type: 'ca', name: 'Capa Simples', category: 'vendavel', gender: 'U', colorSlots: 1, catalogName: 'clothing_basiccape' },

  // Outros (exemplo: cp para chest pattern)
  { id: 1, type: 'cp', name: 'Estampa Coração', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_heartpattern' },
  { id: 2, type: 'cc', name: 'Vestido Longo', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_longdress' },
  { id: 3, type: 'wa', name: 'Cinto de Couro', category: 'nao-hc', gender: 'U', colorSlots: 1, catalogName: 'clothing_leatherbelt' },
  { id: 4, type: 'ct', name: 'Top Curto', category: 'nao-hc', gender: 'F', colorSlots: 1, catalogName: 'clothing_croppedtop' },
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