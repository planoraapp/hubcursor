
/**
 * Gera URL para preview de uma peça individual isolada
 * Usa Habbo Imaging oficial para garantir compatibilidade
 */
export const getSinglePartPreviewUrl = (
  category: string,
  figureId: string,
  colorId: string = '1',
  gender: 'M' | 'F' = 'M',
  hotel: string = 'com'
): string => {
  const baseUrl = hotel.includes('.') 
    ? `https://www.habbo.${hotel}`
    : `https://www.habbo.com`;
  
  const figureString = `${category}-${figureId}-${colorId}`;
  
  // URL oficial do Habbo Imaging para peças individuais
  return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`;
};

/**
 * Gera URL para avatar completo (usado no preview principal)
 */
export const getFullAvatarUrl = (
  figureString: string,
  gender: 'M' | 'F' = 'M',
  hotel: string = 'com',
  size: string = 'l',
  direction: string = '2',
  headDirection: string = '3'
): string => {
  const baseUrl = hotel.includes('.') 
    ? `https://www.habbo.${hotel}`
    : `https://www.habbo.com`;
  
  return `${baseUrl}/habbo-imaging/avatarimage?figure=${figureString}&gender=${gender}&direction=${direction}&head_direction=${headDirection}&size=${size}&img_format=png&gesture=std&action=std`;
};

/**
 * Cores oficiais organizadas por categoria
 */
export const getOfficialColorPalette = (category: string) => {
  // Paletas baseadas nos dados oficiais do Habbo
  const palettes = {
    'hd': [
      { id: '1', hex: '#F5DA88', name: 'Pele Clara' },
      { id: '2', hex: '#FFDBC1', name: 'Pele Muito Clara' },
      { id: '3', hex: '#FFCB98', name: 'Pele Rosada' },
      { id: '4', hex: '#F4AC54', name: 'Pele Média' },
      { id: '7', hex: '#ca8154', name: 'Pele Morena' },
      { id: '8', hex: '#B87560', name: 'Pele Escura' }
    ],
    'default': [
      { id: '1', hex: '#FFFFFF', name: 'Branco' },
      { id: '2', hex: '#000000', name: 'Preto' },
      { id: '61', hex: '#4169E1', name: 'Azul' },
      { id: '66', hex: '#32CD32', name: 'Verde' },
      { id: '80', hex: '#DC143C', name: 'Vermelho' },
      { id: '82', hex: '#FFD700', name: 'Dourado' },
      { id: '45', hex: '#8B4513', name: 'Marrom' }
    ]
  };
  
  return palettes[category as keyof typeof palettes] || palettes.default;
};
