// src/data/clothingItems.ts

// Define a estrutura de um item de roupa ou acessório
export interface ClothingPart {
  id: number; // O ID numérico da peça de roupa (ex: 3091)
  type: string; // O tipo da parte do look (ex: 'hd' para cabeça/rosto, 'hr' para cabelo, 'ch' para tops, etc.)
  name: string; // Nome descritivo da peça
  category: 'hc' | 'vendavel' | 'ltd' | 'raro' | 'nft' | 'nao-hc'; // Categoria de preço/raridade
  gender: 'M' | 'F' | 'U'; // Gênero aplicável: Masculino, Feminino, Unissex
}

// Lista de todas as peças de roupa e acessórios disponíveis
// ATENÇÃO: Esta é uma LISTA DE EXEMPLO, baseada no HTML do ViaJovem.
// Um editor completo precisaria de uma base de dados MUITO maior.
// Você pode expandir esta lista conforme encontra mais IDs de itens do Habbo.
export const clothingParts: ClothingPart[] = [
  // --- Corpo / Rostos (type: 'hd') ---
  // Categoria HC
  { id: 3091, type: 'hd', name: 'Rosto HC 1', category: 'hc', gender: 'M' },
  { id: 3092, type: 'hd', name: 'Rosto HC 2', category: 'hc', gender: 'M' },
  { id: 3093, type: 'hd', name: 'Rosto HC 3', category: 'hc', gender: 'M' },
  // Categoria Vendável
  { id: 3600, type: 'hd', name: 'Olhos Mil e Uma Noites', category: 'vendavel', gender: 'U' },
  { id: 3704, type: 'hd', name: 'Máscara Robótica', category: 'vendavel', gender: 'U' },
  // Categoria Raro
  { id: 3536, type: 'hd', name: 'Cara de Gato Demoníaco', category: 'raro', gender: 'U' },
  // Categoria NFT
  { id: 4202, type: 'hd', name: 'Rosto NFT 1', category: 'nft', gender: 'U' },
  { id: 5041, type: 'hd', name: 'Rosto de Boneca', category: 'nft', gender: 'U' },
  // Categoria Não-HC
  { id: 180, type: 'hd', name: 'Rosto Padrão 1', category: 'nao-hc', gender: 'U' },
  { id: 190, type: 'hd', name: 'Rosto Padrão 2', category: 'nao-hc', gender: 'U' },

  // --- Cabelos / Penteados (type: 'hr') ---
  { id: 828, type: 'hr', name: 'Cabelo Moderno', category: 'nao-hc', gender: 'U' },
  { id: 115, type: 'hr', name: 'Cabelo Curto HC', category: 'hc', gender: 'M' },
  { id: 500, type: 'hr', name: 'Cabelo Longo', category: 'nao-hc', gender: 'F' },

  // --- Camisetas / Tops (type: 'ch') ---
  { id: 3006, type: 'ch', name: 'Camisa Polo', category: 'vendavel', gender: 'U' },
  { id: 210, type: 'ch', name: 'Blusa de Frio', category: 'nao-hc', gender: 'F' },

  // --- Calças / Saias (type: 'lg') ---
  { id: 275, type: 'lg', name: 'Calça Jeans', category: 'nao-hc', gender: 'U' },
  { id: 300, type: 'lg', name: 'Saia Xadrez', category: 'vendavel', gender: 'F' },

  // --- Sapatos (type: 'sh') ---
  { id: 3059, type: 'sh', name: 'Tênis Básico', category: 'nao-hc', gender: 'U' },
  { id: 600, type: 'sh', name: 'Botas de Couro', category: 'hc', gender: 'M' },

  // --- Chapéus (type: 'ha') ---
  { id: 1002, type: 'ha', name: 'Óculos de Sol', category: 'vendavel', gender: 'U' }, // Note: óculos aqui por serem acessório de cabeça
  { id: 5000, type: 'ha', name: 'Boné Azul', category: 'nao-hc', gender: 'U' }, // Exemplo de chapéu

  // --- Acessórios de Cabelo (type: 'he') ---
  { id: 100, type: 'he', name: 'Tiara Básica', category: 'nao-hc', gender: 'F' },

  // --- Óculos (type: 'ea') ---
  { id: 200, type: 'ea', name: 'Óculos Redondos', category: 'nao-hc', gender: 'U' }, // óculos aqui para categoria separada, se quiser
  
  // --- Máscaras / Rosto (type: 'fa') ---
  { id: 110, type: 'fa', name: 'Máscara Cirúrgica', category: 'nao-hc', gender: 'U' },
  { id: 220, type: 'fa', name: 'Barba Cheia', category: 'hc', gender: 'M' },

  // --- Estampas (type: 'cp') - Chest Pattern ---
  { id: 1, type: 'cp', name: 'Estampa Coração', category: 'nao-hc', gender: 'U' },

  // --- Casacos / Vestidos (type: 'cc') - Chest Combined ---
  { id: 2, type: 'cc', name: 'Vestido Longo', category: 'nao-hc', gender: 'F' },

  // --- Cintos (type: 'wa') - Waist ---
  { id: 3, type: 'wa', name: 'Cinto Simples', category: 'nao-hc', gender: 'U' },

  // --- Outros (type: 'ct') - Chest Top (para tops mais curtos) ---
  { id: 4, type: 'ct', name: 'Top Curto', category: 'nao-hc', gender: 'F' },

  // --- Capas (type: 'ca') ---
  { id: 10, type: 'ca', name: 'Capa da Sombra', category: 'ltd', gender: 'U' },
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