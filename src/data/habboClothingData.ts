
// Dados reais de roupas do Habbo baseados nos códigos fornecidos
export interface HabboClothingItem {
  id: string;
  swfCode: string;
  name: string;
  category: string;
  type: 'hat' | 'shirt' | 'trousers' | 'jacket' | 'acc_eye' | 'acc_head' | 'acc_chest' | 'acc_waist' | 'hair' | 'acc_print';
  gender: 'M' | 'F' | 'U';
  rarity: 'normal' | 'hc' | 'sellable' | 'nft' | 'ltd';
  colors: string[];
}

export const HABBO_CLOTHING_DATA: HabboClothingItem[] = [
  // NFT Items
  {
    id: '5250',
    swfCode: 'hat_U_nftwatermelonhelmet',
    name: 'Capacete Melancia NFT',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'nft',
    colors: ['1', '61', '92', '100']
  },
  {
    id: '5252',
    swfCode: 'acc_eye_U_nftbrokenglasses',
    name: 'Óculos Quebrados NFT',
    category: 'ea',
    type: 'acc_eye',
    gender: 'U',
    rarity: 'nft',
    colors: ['61', '92', '100']
  },
  {
    id: '5253',
    swfCode: 'acc_chest_U_nftcola',
    name: 'Cola NFT',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['104', '105', '61']
  },
  
  // Sellable Items
  {
    id: '5251',
    swfCode: 'jacket_U_patchlongscarf',
    name: 'Cachecol Longo com Patches',
    category: 'cc',
    type: 'jacket',
    gender: 'U',
    rarity: 'sellable',
    colors: ['61', '92', '100', '104']
  },
  {
    id: '5249',
    swfCode: 'acc_chest_U_iridescentstarbag',
    name: 'Bolsa Estrela Iridescente',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'sellable',
    colors: ['104', '105', '106', '61']
  },
  
  // Summer Collection
  {
    id: '5247',
    swfCode: 'shirt_M_frillybikinitop',
    name: 'Top de Biquíni com Babados M',
    category: 'ch',
    type: 'shirt',
    gender: 'M',
    rarity: 'sellable',
    colors: ['92', '104', '105', '61']
  },
  {
    id: '5248',
    swfCode: 'shirt_F_frillybikinitop',
    name: 'Top de Biquíni com Babados F',
    category: 'ch',
    type: 'shirt',
    gender: 'F',
    rarity: 'sellable',
    colors: ['92', '104', '105', '61']
  },
  {
    id: '5221',
    swfCode: 'trousers_U_frillybikinibottom',
    name: 'Biquíni Parte de Baixo',
    category: 'lg',
    type: 'trousers',
    gender: 'U',
    rarity: 'sellable',
    colors: ['92', '104', '105', '61']
  },
  {
    id: '5229',
    swfCode: 'trousers_U_ombreswimtrunks',
    name: 'Sunga Ombré',
    category: 'lg',
    type: 'trousers',
    gender: 'U',
    rarity: 'sellable',
    colors: ['100', '104', '105', '106']
  },
  
  // Pool Party Collection
  {
    id: '5217',
    swfCode: 'acc_head_U_poolpartyshades',
    name: 'Óculos Festa na Piscina',
    category: 'ha',
    type: 'acc_head',
    gender: 'U',
    rarity: 'sellable',
    colors: ['61', '92', '100', '104']
  },
  {
    id: '5218',
    swfCode: 'hair_U_poolpartybraids',
    name: 'Tranças Festa na Piscina',
    category: 'hr',
    type: 'hair',
    gender: 'U',
    rarity: 'sellable',
    colors: ['45', '61', '100', '102']
  },
  {
    id: '5219',
    swfCode: 'acc_head_U_sparklerheadband',
    name: 'Tiara com Estrelinhas',
    category: 'ha',
    type: 'acc_head',
    gender: 'U',
    rarity: 'sellable',
    colors: ['104', '105', '106', '92']
  },
  
  // Special Hats
  {
    id: '5246',
    swfCode: 'hat_U_cathat2',
    name: 'Chapéu de Gato 2',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'sellable',
    colors: ['61', '92', '100', '45']
  },
  {
    id: '5222',
    swfCode: 'hat_U_discohead',
    name: 'Cabeça Disco',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'hc',
    colors: ['104', '105', '106', '92']
  },
  {
    id: '5226',
    swfCode: 'hat_U_bedazzledhat',
    name: 'Chapéu Cravejado',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'hc',
    colors: ['104', '105', '106', '61']
  },
  
  // Hair Styles
  {
    id: '5228',
    swfCode: 'hair_U_duckafro',
    name: 'Afro Pato',
    category: 'hr',
    type: 'hair',
    gender: 'U',
    rarity: 'sellable',
    colors: ['45', '61', '100', '102']
  },
  {
    id: '5230',
    swfCode: 'hair_U_summermanbun',
    name: 'Coque Masculino de Verão',
    category: 'hr',
    type: 'hair',
    gender: 'U',
    rarity: 'normal',
    colors: ['45', '61', '100', '102']
  },
  
  // Accessories
  {
    id: '5224',
    swfCode: 'acc_waist_U_balloon',
    name: 'Balão na Cintura',
    category: 'wa',
    type: 'acc_waist',
    gender: 'U',
    rarity: 'sellable',
    colors: ['104', '105', '106', '92']
  },
  {
    id: '5225',
    swfCode: 'jacket_U_armfloats',
    name: 'Bóias de Braço',
    category: 'cc',
    type: 'jacket',
    gender: 'U',
    rarity: 'sellable',
    colors: ['104', '105', '106', '92']
  },
  {
    id: '5227',
    swfCode: 'acc_chest_U_catfloat',
    name: 'Bóia de Gato',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'sellable',
    colors: ['104', '105', '92', '61']
  },
  
  // Loyalty Crowns
  {
    id: '5233',
    swfCode: 'hat_U_loyaltycrown_15',
    name: 'Coroa de Lealdade 15',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'ltd',
    colors: ['104', '105', '106']
  },
  {
    id: '5234',
    swfCode: 'hat_U_loyaltycrown_20',
    name: 'Coroa de Lealdade 20',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'ltd',
    colors: ['104', '105', '106']
  },
  {
    id: '5235',
    swfCode: 'hat_U_loyaltycrown_25',
    name: 'Coroa de Lealdade 25',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'ltd',
    colors: ['104', '105', '106']
  },
  
  // NFT Special Items
  {
    id: '5231',
    swfCode: 'acc_chest_U_nftfrogfloat',
    name: 'Bóia de Sapo NFT',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['100', '104', '105']
  },
  {
    id: '5232',
    swfCode: 'acc_waist_U_nft25balloonred',
    name: 'Balão Vermelho NFT 25',
    category: 'wa',
    type: 'acc_waist',
    gender: 'U',
    rarity: 'nft',
    colors: ['106', '104', '105']
  },
  {
    id: '5242',
    swfCode: 'acc_waist_U_nft25balloonblue',
    name: 'Balão Azul NFT 25',
    category: 'wa',
    type: 'acc_waist',
    gender: 'U',
    rarity: 'nft',
    colors: ['143', '100', '104']
  },
  
  // Seashell Collection NFT
  {
    id: '5237',
    swfCode: 'acc_chest_U_nftseashellp1',
    name: 'Concha Marinha NFT P1',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['100', '104', '105']
  },
  {
    id: '5238',
    swfCode: 'acc_chest_U_nftseashellp2',
    name: 'Concha Marinha NFT P2',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['104', '105', '106']
  },
  {
    id: '5239',
    swfCode: 'acc_chest_U_nftseashellp3',
    name: 'Concha Marinha NFT P3',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['105', '106', '143']
  },
  {
    id: '5240',
    swfCode: 'acc_chest_U_nftseashellp4',
    name: 'Concha Marinha NFT P4',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['106', '143', '100']
  },
  {
    id: '5243',
    swfCode: 'acc_chest_U_nftseahorsefloat',
    name: 'Bóia Cavalo-Marinho NFT',
    category: 'ca',
    type: 'acc_chest',
    gender: 'U',
    rarity: 'nft',
    colors: ['100', '104', '143']
  },
  
  // Special NFT Items
  {
    id: '5241',
    swfCode: 'acc_head_U_nft25earrings3',
    name: 'Brincos NFT 25 Tipo 3',
    category: 'ha',
    type: 'acc_head',
    gender: 'U',
    rarity: 'nft',
    colors: ['104', '105', '106']
  },
  {
    id: '5244',
    swfCode: 'acc_print_U_nfthabbo25necklace3',
    name: 'Colar Habbo 25 NFT Tipo 3',
    category: 'cp',
    type: 'acc_print',
    gender: 'U',
    rarity: 'nft',
    colors: ['104', '105', '106']
  },
  {
    id: '5245',
    swfCode: 'hat_U_nfthabbo25crown',
    name: 'Coroa Habbo 25 NFT',
    category: 'ha',
    type: 'hat',
    gender: 'U',
    rarity: 'nft',
    colors: ['104', '105', '106']
  },
  
  // Special Glasses
  {
    id: '5215',
    swfCode: 'acc_eye_U_nfts25glasses1',
    name: 'Óculos NFT 25 Tipo 1',
    category: 'ea',
    type: 'acc_eye',
    gender: 'U',
    rarity: 'nft',
    colors: ['61', '92', '100']
  },
  {
    id: '5216',
    swfCode: 'acc_eye_U_nfts25glasses2',
    name: 'Óculos NFT 25 Tipo 2',
    category: 'ea',
    type: 'acc_eye',
    gender: 'U',
    rarity: 'nft',
    colors: ['61', '92', '100']
  }
];

// Função para obter itens por categoria
export const getClothingByCategory = (category: string): HabboClothingItem[] => {
  return HABBO_CLOTHING_DATA.filter(item => item.category === category);
};

// Função para obter URL da miniatura
export const getClothingThumbnailUrl = (item: HabboClothingItem, colorId: string = '1', hotel: string = 'com.br'): string => {
  // Construir figure string apenas com a peça específica
  const figureString = `${item.category}-${item.id}-${colorId}`;
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&size=s&img_format=png&gesture=std&action=std`;
};

// Função para obter URL da miniatura isolada (apenas a peça)
export const getIsolatedClothingUrl = (item: HabboClothingItem, colorId: string = '1'): string => {
  // Para miniaturas isoladas, usamos um sistema diferente se disponível
  return `https://www.habboassets.com/clothing/${item.id}/thumbnail_${colorId}.png`;
};

// Mapear raridade para cor do badge
export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'nft': return 'bg-blue-600';
    case 'hc': return 'bg-yellow-500';
    case 'ltd': return 'bg-purple-600';
    case 'sellable': return 'bg-green-600';
    default: return 'bg-gray-500';
  }
};

// Mapear raridade para texto
export const getRarityText = (rarity: string): string => {
  switch (rarity) {
    case 'nft': return 'NFT';
    case 'hc': return 'HC';
    case 'ltd': return 'LTD';
    case 'sellable': return 'RARO';
    default: return 'COMUM';
  }
};
