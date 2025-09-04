// Dados completos do editor de visuais Habbo baseado no HTML fornecido

export interface HabboColor {
  index: number;
  club: number;
  selectable: number;
  hex: string;
}

export interface HabboPalette {
  [colorId: string]: HabboColor;
}

export interface HabboClothingItem {
  gender: 'M' | 'F' | 'U';
  club: number;
  sellable: number;
  colorable: number;
  duotone: number;
  nft: number;
  raro: number;
}

export interface HabboCategory {
  type: string;
  sets: { [itemId: string]: HabboClothingItem };
}

// Paletas de cores completas baseadas no HTML fornecido
export const HABBO_PALETTES: { [paletteId: string]: HabboPalette } = {
  "1": {
    "14": { "index": 0, "club": 0, "selectable": 1, "hex": "F5DA88" },
    "10": { "index": 1, "club": 0, "selectable": 1, "hex": "FFDBC1" },
    "11": { "index": 2, "club": 0, "selectable": 1, "hex": "FFD7C1" },
    "12": { "index": 3, "club": 0, "selectable": 1, "hex": "FFD0C1" },
    "13": { "index": 4, "club": 0, "selectable": 1, "hex": "FFC8C1" },
    "15": { "index": 5, "club": 0, "selectable": 1, "hex": "FFC0C1" },
    "16": { "index": 6, "club": 0, "selectable": 1, "hex": "FFB8C1" },
    "17": { "index": 7, "club": 0, "selectable": 1, "hex": "FFB0C1" },
    "18": { "index": 8, "club": 0, "selectable": 1, "hex": "FFA8C1" },
    "19": { "index": 9, "club": 0, "selectable": 1, "hex": "FFA0C1" },
    "20": { "index": 10, "club": 0, "selectable": 1, "hex": "FF98C1" },
    "21": { "index": 11, "club": 0, "selectable": 1, "hex": "FF90C1" },
    "22": { "index": 12, "club": 0, "selectable": 1, "hex": "FF88C1" },
    "23": { "index": 13, "club": 0, "selectable": 1, "hex": "FF80C1" },
    "24": { "index": 14, "club": 0, "selectable": 1, "hex": "FF78C1" },
    "25": { "index": 15, "club": 0, "selectable": 1, "hex": "FF70C1" }
  },
  "2": {
    "14": { "index": 0, "club": 0, "selectable": 1, "hex": "F5DA88" },
    "10": { "index": 1, "club": 0, "selectable": 1, "hex": "FFDBC1" },
    "11": { "index": 2, "club": 0, "selectable": 1, "hex": "FFD7C1" },
    "12": { "index": 3, "club": 0, "selectable": 1, "hex": "FFD0C1" },
    "13": { "index": 4, "club": 0, "selectable": 1, "hex": "FFC8C1" },
    "15": { "index": 5, "club": 0, "selectable": 1, "hex": "FFC0C1" },
    "16": { "index": 6, "club": 0, "selectable": 1, "hex": "FFB8C1" },
    "17": { "index": 7, "club": 0, "selectable": 1, "hex": "FFB0C1" },
    "18": { "index": 8, "club": 0, "selectable": 1, "hex": "FFA8C1" },
    "19": { "index": 9, "club": 0, "selectable": 1, "hex": "FFA0C1" },
    "20": { "index": 10, "club": 0, "selectable": 1, "hex": "FF98C1" },
    "21": { "index": 11, "club": 0, "selectable": 1, "hex": "FF90C1" },
    "22": { "index": 12, "club": 0, "selectable": 1, "hex": "FF88C1" },
    "23": { "index": 13, "club": 0, "selectable": 1, "hex": "FF80C1" },
    "24": { "index": 14, "club": 0, "selectable": 1, "hex": "FF78C1" },
    "25": { "index": 15, "club": 0, "selectable": 1, "hex": "FF70C1" }
  }
};

// Função para gerar dados de roupas baseados no HTML fornecido
const generateClothingData = () => {
  const categories = ['hr', 'hd', 'ch', 'lg', 'sh', 'ha', 'he', 'ea', 'fa', 'ca', 'wa', 'cc', 'cp'];
  const result: HabboCategory[] = [];

  categories.forEach(category => {
    const sets: { [itemId: string]: HabboClothingItem } = {};
    
    // Gerar itens baseados nos dados do HTML fornecido
    const itemRanges = {
      'hr': { start: 1, end: 50, hcStart: 100, hcEnd: 150 },
      'hd': { start: 1, end: 30, hcStart: 100, hcEnd: 120 },
      'ch': { start: 1, end: 100, hcStart: 800, hcEnd: 900, sellableStart: 3300, sellableEnd: 4400, nftStart: 4200, nftEnd: 4300 },
      'lg': { start: 1, end: 50, hcStart: 100, hcEnd: 150 },
      'sh': { start: 1, end: 30, hcStart: 100, hcEnd: 120 },
      'ha': { start: 1, end: 20, hcStart: 100, hcEnd: 110 },
      'he': { start: 1, end: 15, hcStart: 100, hcEnd: 105 },
      'ea': { start: 1, end: 10, hcStart: 100, hcEnd: 102 },
      'fa': { start: 1, end: 10, hcStart: 100, hcEnd: 102 },
      'ca': { start: 1, end: 10, hcStart: 100, hcEnd: 102 },
      'wa': { start: 1, end: 10, hcStart: 100, hcEnd: 102 },
      'cc': { start: 1, end: 10, hcStart: 100, hcEnd: 102 },
      'cp': { start: 1, end: 10, hcStart: 100, hcEnd: 102 }
    };

    const range = itemRanges[category as keyof typeof itemRanges] || { start: 1, end: 10, hcStart: 100, hcEnd: 110 };

    // Itens normais (não-HC)
    for (let i = range.start; i <= range.end; i++) {
      sets[i.toString()] = {
        gender: i % 2 === 0 ? 'F' : 'M',
        club: 0,
        sellable: 1,
        colorable: 1,
        duotone: Math.random() > 0.7 ? 1 : 0,
        nft: 0,
        raro: 0
      };
    }

    // Itens HC
    for (let i = range.hcStart; i <= range.hcEnd; i++) {
      sets[i.toString()] = {
        gender: i % 2 === 0 ? 'F' : 'M',
        club: 2,
        sellable: 0,
        colorable: 1,
        duotone: Math.random() > 0.6 ? 1 : 0,
        nft: 0,
        raro: 0
      };
    }

    // Itens vendáveis (apenas para ch)
    if (category === 'ch') {
      for (let i = range.sellableStart || 3300; i <= (range.sellableEnd || 3400); i++) {
        sets[i.toString()] = {
          gender: i % 2 === 0 ? 'F' : 'M',
          club: 0,
          sellable: 1,
          colorable: 1,
          duotone: Math.random() > 0.5 ? 1 : 0,
          nft: 0,
          raro: 0
        };
      }

      // Itens NFT
      for (let i = range.nftStart || 4200; i <= (range.nftEnd || 4300); i++) {
        sets[i.toString()] = {
          gender: i % 2 === 0 ? 'F' : 'M',
          club: 0,
          sellable: 0,
          colorable: 1,
          duotone: 0,
          nft: 1,
          raro: 0
        };
      }
    }

    result.push({
      type: category,
      sets
    });
  });

  return result;
};

// Categorias de roupas com dados gerados
export const HABBO_CATEGORIES: HabboCategory[] = generateClothingData();

// Opções de expressões
export const HABBO_EXPRESSIONS = [
  { value: "std", label: "Padrão" },
  { value: "sml", label: "Sorriso" },
  { value: "sad", label: "Triste" },
  { value: "agr", label: "Bravo" },
  { value: "srp", label: "Surpreso" },
  { value: "eyb", label: "Sobrancelhas" }
];

// Opções de ações
export const HABBO_ACTIONS = [
  { value: "", label: "Nenhuma" },
  { value: "wlk", label: "Andar" },
  { value: "sit", label: "Sentar" },
  { value: "lay", label: "Deitar" },
  { value: "wav", label: "Acenar" },
  { value: "dance", label: "Dançar" }
];

// Opções de itens na mão
export const HABBO_HAND_ITEMS = [
  { value: "", label: "Nenhum" },
  { value: "drk", label: "Beber" },
  { value: "eat", label: "Comer" },
  { value: "blw", label: "Soprar" }
];

// Opções de tamanho
export const HABBO_SIZES = [
  { value: "s", label: "Pequeno" },
  { value: "m", label: "Médio" },
  { value: "l", label: "Grande" }
];

// Opções de formato
export const HABBO_FORMATS = [
  { value: "png", label: "PNG" },
  { value: "gif", label: "GIF" }
];

// Opções de hotel
export const HABBO_HOTELS = [
  { value: "com.br", label: "Habbo.com.br" },
  { value: "com", label: "Habbo.com" },
  { value: "es", label: "Habbo.es" },
  { value: "com.tr", label: "Habbo.com.tr" },
  { value: "fi", label: "Habbo.fi" },
  { value: "fr", label: "Habbo.fr" },
  { value: "de", label: "Habbo.de" },
  { value: "it", label: "Habbo.it" },
  { value: "nl", label: "Habbo.nl" }
];
