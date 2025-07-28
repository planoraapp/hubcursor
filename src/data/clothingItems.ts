// src/data/clothingItems.ts

export interface ClothingPart {
  id: number;
  type: string;
  name: string;
  category: 'hc' | 'vendavel' | 'ltd' | 'raro' | 'nft' | 'nao-hc';
  gender: 'M' | 'F' | 'U';
  colorSlots?: number; // Number of color slots the item has (0, 1, 2, 3)
}

export const clothingParts: ClothingPart[] = [
  // --- Corpo / Rostos (type: 'hd') ---
  { id: 600, type: 'hd', name: 'Rosto Feminino Padrão', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 180, type: 'hd', name: 'Rosto Masculino Padrão', category: 'nao-hc', gender: 'M', colorSlots: 1 },
  { id: 3600, type: 'hd', name: 'Olhos Mil e Uma Noites', category: 'vendavel', gender: 'U', colorSlots: 2 },
  { id: 3704, type: 'hd', name: 'Máscara Robótica', category: 'vendavel', gender: 'U', colorSlots: 1 },
  { id: 5041, type: 'hd', name: 'Rosto de Boneca', category: 'nft', gender: 'F', colorSlots: 1 },
  { id: 5840, type: 'hd', name: 'Rosto Sardento', category: 'nft', gender: 'U', colorSlots: 2 },

  // --- Cabelos / Penteados (type: 'hr') ---
  { id: 700, type: 'hr', name: 'Cabelo Longo Feminino', category: 'nao-hc', gender: 'F', colorSlots: 2 },
  { id: 828, type: 'hr', name: 'Cabelo Moderno', category: 'nao-hc', gender: 'U', colorSlots: 2 },
  { id: 115, type: 'hr', name: 'Cabelo Curto HC', category: 'hc', gender: 'M', colorSlots: 2 },
  { id: 678, type: 'hr', name: 'Cabelo Estiloso', category: 'hc', gender: 'U', colorSlots: 2 },
  { id: 5773, type: 'hr', name: 'Cabelo Moderno F', category: 'nao-hc', gender: 'F', colorSlots: 2 },

  // --- Camisetas / Tops (type: 'ch') ---
  { id: 800, type: 'ch', name: 'Blusa Básica Feminina', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 3006, type: 'ch', name: 'Camisa Polo', category: 'vendavel', gender: 'U', colorSlots: 2 },
  { id: 210, type: 'ch', name: 'Blusa de Frio', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 6147, type: 'ch', name: 'Top Habbonews', category: 'vendavel', gender: 'U', colorSlots: 1 },

  // --- Calças / Saias (type: 'lg') ---
  { id: 900, type: 'lg', name: 'Saia Básica', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 275, type: 'lg', name: 'Calça Jeans', category: 'nao-hc', gender: 'U', colorSlots: 2 },
  { id: 3088, type: 'lg', name: 'Calça Habbonews', category: 'vendavel', gender: 'U', colorSlots: 2 },

  // --- Sapatos (type: 'sh') ---
  { id: 100, type: 'sh', name: 'Sapato Feminino', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 3059, type: 'sh', name: 'Tênis Básico', category: 'nao-hc', gender: 'U', colorSlots: 2 },
  { id: 906, type: 'sh', name: 'Sapato Habbonews', category: 'vendavel', gender: 'U', colorSlots: 1 },

  // --- Acessórios (exemplos para testar diferentes tipos de peças) ---
  { id: 101, type: 'ha', name: 'Tiara de Flores', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 6198, type: 'ha', name: 'Acessório Habbonews', category: 'vendavel', gender: 'U', colorSlots: 2 },
  { id: 201, type: 'fa', name: 'Maquiagem Leve', category: 'nao-hc', gender: 'F', colorSlots: 1 },
  { id: 301, type: 'ca', name: 'Capa Simples', category: 'vendavel', gender: 'U', colorSlots: 1 },
  { id: 401, type: 'wa', name: 'Cinto Elegante', category: 'hc', gender: 'F', colorSlots: 1 },
  { id: 501, type: 'cc', name: 'Vestido Longo Floral', category: 'vendavel', gender: 'F', colorSlots: 2 },
  { id: 601, type: 'cp', name: 'Estampa de Estrelas', category: 'nao-hc', gender: 'U', colorSlots: 1 },
  { id: 701, type: 'ct', name: 'Cropped Top', category: 'nao-hc', gender: 'F', colorSlots: 1 },
];

// Paletas de cores (em HEX, como no Habbo Imaging)
export const colorPalettes = {
  nonHc: [
    'F5DA88', 'FFDBC1', 'FFCB98', 'F4AC54', 'FF987F', 'E0A9A9', 'CA8154', 'B87560',
    '9C543F', '904925', '4C311E', // Exemplo do ViaJovem
    'FFFFFF', 'CCCCCC', '999999', '666666', '333333', '000000', // Tons de cinza básicos
  ],
  hc: [
    '543D35', '653A1D', '6E392C', '714947', '856860', '895048', 'A15253', 'AA7870',
    'BE8263', 'B6856D', 'BA8A82', 'C88F82', 'D9A792', 'C68383', 'BC576A', 'FF5757',
    'FF7575', 'B65E38', 'A76644', '7C5133', '9A7257', '945C2F', 'D98C63', 'AE7748',
    'C57040', 'B88655', 'C99263', 'A89473', 'C89F56', 'DC9B4C', 'FF8C40', 'DE9D75',
    'ECA782', 'FFB696', 'E3AE7D', 'FFC680', 'DFC375', 'F0DCA3', 'EAEFD0', 'E2E4B0',
    'D5D08C', 'BDE05F', '5DC446', 'A2CC89', 'C2C4A7', 'F1E5DA', 'F6D3D4', 'E5B6B0',
    'C4A7B3', 'AC94B3', 'D288CE', '6799CC', 'B3BDC3', 'C5C0C2', // Mais cores HC
  ],
};

// Mapeamento de tipos de peças para nomes de categorias exibidas no menu principal
// Isso reflete a organização do ViaJovem
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
  // Se você tiver dados para pets ou outros, pode adicionar aqui:
  // pt: 'Pets',
  // mc: 'Diversos',
};