
export interface StickerAsset {
  id: string;
  name: string;
  src: string;
  category: 'emoticons' | 'decorative' | 'text';
  width: number;
  height: number;
}

// Stickers baseados nos assets disponíveis no projeto
export const STICKER_ASSETS: StickerAsset[] = [
  // Emoticons
  {
    id: 'frank',
    name: 'Frank (Mascote)',
    src: '/assets/frank.png',
    category: 'emoticons',
    width: 60,
    height: 60
  },
  {
    id: 'hc_icon',
    name: 'HC Premium',
    src: '/assets/HC.png',
    category: 'emoticons',
    width: 40,
    height: 40
  },
  {
    id: 'diamond',
    name: 'Diamante',
    src: '/assets/Diamante.png',
    category: 'emoticons',
    width: 35,
    height: 35
  },
  {
    id: 'credits',
    name: 'Créditos',
    src: '/assets/credits_icon.gif',
    category: 'emoticons',
    width: 30,
    height: 30
  },
  
  // Decorativos
  {
    id: 'habbo_logo',
    name: 'Logo Habbo',
    src: '/assets/LogoHabbo.png',
    category: 'decorative',
    width: 80,
    height: 40
  },
  {
    id: 'sulake_logo',
    name: 'Logo Sulake',
    src: '/assets/LogoSulake1.png',
    category: 'decorative',
    width: 60,
    height: 30
  },
  {
    id: 'elevator',
    name: 'Elevador',
    src: '/assets/Elevador.png',
    category: 'decorative',
    width: 50,
    height: 50
  },
  {
    id: 'home_icon',
    name: 'Casa',
    src: '/assets/home.png',
    category: 'decorative',
    width: 40,
    height: 40
  },
  
  // Texto/Badges
  {
    id: 'promo_star',
    name: 'Estrela Promo',
    src: '/assets/promo_star.gif',
    category: 'text',
    width: 45,
    height: 45
  },
  {
    id: 'check',
    name: 'Check Verde',
    src: '/assets/Check2.png',
    category: 'text',
    width: 25,
    height: 25
  },
  {
    id: 'console_on',
    name: 'Console Ligado',
    src: '/assets/consoleon1.gif',
    category: 'decorative',
    width: 50,
    height: 30
  }
];

export const getStickersByCategory = (category: StickerAsset['category']) => {
  return STICKER_ASSETS.filter(sticker => sticker.category === category);
};

export const getStickerById = (id: string) => {
  return STICKER_ASSETS.find(sticker => sticker.id === id);
};
