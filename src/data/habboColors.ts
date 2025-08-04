
export interface HabboColor {
  id: string;
  hex: string;
  name?: string;
  isHC: boolean;
}

// Cores extraídas do código oficial do Habbo
export const HABBO_COLORS: HabboColor[] = [
  // Cores básicas (sem HC)
  { id: '1', hex: 'DDDDDD', name: 'Cinza Claro', isHC: false },
  { id: '2', hex: '96743D', name: 'Marrom', isHC: false },
  { id: '3', hex: '6B573B', name: 'Marrom Escuro', isHC: false },
  { id: '4', hex: 'E7B027', name: 'Amarelo', isHC: false },
  { id: '5', hex: 'fff7b7', name: 'Amarelo Claro', isHC: false },
  { id: '6', hex: 'F8C790', name: 'Pele', isHC: false },
  { id: '7', hex: '9F2B31', name: 'Vermelho Escuro', isHC: false },
  { id: '8', hex: 'ED5C50', name: 'Vermelho', isHC: false },
  { id: '9', hex: 'FFBFC2', name: 'Rosa Claro', isHC: false },
  { id: '10', hex: 'E7D1EE', name: 'Roxo Claro', isHC: false },
  { id: '11', hex: 'AC94B3', name: 'Roxo', isHC: false },
  { id: '12', hex: '7E5B90', name: 'Roxo Escuro', isHC: false },
  { id: '13', hex: '4F7AA2', name: 'Azul', isHC: false },
  { id: '14', hex: '75B7C7', name: 'Azul Claro', isHC: false },
  { id: '15', hex: 'C5EDE6', name: 'Ciano Claro', isHC: false },
  { id: '16', hex: 'BBF3BD', name: 'Verde Claro', isHC: false },
  { id: '17', hex: '6BAE61', name: 'Verde', isHC: false },
  { id: '18', hex: '456F40', name: 'Verde Escuro', isHC: false },
  { id: '19', hex: '7A7D22', name: 'Verde Oliva', isHC: false },
  { id: '20', hex: '595959', name: 'Cinza', isHC: false },

  // Cores HC (com background pattern)
  { id: '21', hex: '1E1E1E', name: 'Preto HC', isHC: true },
  { id: '22', hex: '84573c', name: 'Marrom HC', isHC: true },
  { id: '23', hex: 'A86B19', name: 'Dourado HC', isHC: true },
  { id: '24', hex: 'c69f71', name: 'Bege HC', isHC: true },
  { id: '25', hex: 'F3E1AF', name: 'Creme HC', isHC: true },
  { id: '26', hex: 'FFFFFF', name: 'Branco HC', isHC: true },
  { id: '27', hex: 'FFF41D', name: 'Amarelo Neon HC', isHC: true },
  { id: '28', hex: 'ffe508', name: 'Amarelo HC', isHC: true },
  { id: '29', hex: 'ffcc00', name: 'Ouro HC', isHC: true },
  { id: '30', hex: 'ffa508', name: 'Laranja Claro HC', isHC: true },
  { id: '31', hex: 'FF9211', name: 'Laranja HC', isHC: true },
  { id: '32', hex: 'ff5b08', name: 'Laranja Escuro HC', isHC: true },
  { id: '33', hex: 'C74400', name: 'Vermelho Laranja HC', isHC: true },
  { id: '34', hex: 'da6a43', name: 'Terra Cotta HC', isHC: true },
  { id: '35', hex: 'b18276', name: 'Rosa Seco HC', isHC: true },
  { id: '36', hex: 'ae4747', name: 'Vermelho Rosado HC', isHC: true },
  { id: '37', hex: '813033', name: 'Bordô HC', isHC: true },
  { id: '38', hex: '5b2420', name: 'Marrom Avermelhado HC', isHC: true },
  { id: '39', hex: '9B001D', name: 'Vermelho Escuro HC', isHC: true },
  { id: '40', hex: 'd2183c', name: 'Vermelho Vivo HC', isHC: true },
  { id: '41', hex: 'e53624', name: 'Vermelho HC', isHC: true },
  { id: '42', hex: 'FF1300', name: 'Vermelho Neon HC', isHC: true },
  { id: '43', hex: 'ff638f', name: 'Rosa HC', isHC: true },
  { id: '44', hex: 'fe86b1', name: 'Rosa Claro HC', isHC: true },
  { id: '45', hex: 'FF6D8F', name: 'Rosa Médio HC', isHC: true },
  { id: '46', hex: 'ffc7e4', name: 'Rosa Pastel HC', isHC: true },
  { id: '47', hex: 'E993FF', name: 'Roxo Claro HC', isHC: true },
  { id: '48', hex: 'ff88f4', name: 'Magenta HC', isHC: true },
  { id: '49', hex: 'FF27A6', name: 'Pink HC', isHC: true },
  { id: '50', hex: 'C600AD', name: 'Roxo Pink HC', isHC: true },

  // Mais cores HC
  { id: '51', hex: 'a1295e', name: 'Roxo Escuro HC', isHC: true },
  { id: '52', hex: 'a723c9', name: 'Violeta HC', isHC: true },
  { id: '53', hex: '6a0481', name: 'Roxo Profundo HC', isHC: true },
  { id: '54', hex: '693959', name: 'Vinho HC', isHC: true },
  { id: '55', hex: '62368c', name: 'Azul Roxo HC', isHC: true },
  { id: '56', hex: '544A81', name: 'Azul Acinzentado HC', isHC: true },
  { id: '57', hex: '957caf', name: 'Lilás HC', isHC: true },
  { id: '58', hex: '6D80BB', name: 'Azul Aço HC', isHC: true },
  { id: '59', hex: '574bfb', name: 'Azul Elétrico HC', isHC: true },
  { id: '60', hex: '6b71ed', name: 'Azul Médio HC', isHC: true },
  { id: '61', hex: '8791f0', name: 'Azul Claro HC', isHC: true },
  { id: '62', hex: 'c1c6ef', name: 'Azul Pastel HC', isHC: true },
  { id: '63', hex: '94FFEC', name: 'Ciano HC', isHC: true },
  { id: '64', hex: '00B9A8', name: 'Turquesa HC', isHC: true },
  { id: '65', hex: '009db9', name: 'Azul Turquesa HC', isHC: true },
  { id: '66', hex: '1BD2FF', name: 'Azul Céu HC', isHC: true },
  { id: '67', hex: '2f8ce9', name: 'Azul Royal HC', isHC: true },
  { id: '68', hex: '1F55FF', name: 'Azul Intenso HC', isHC: true },
  { id: '69', hex: '1946c7', name: 'Azul Escuro HC', isHC: true },
  { id: '70', hex: '0219A5', name: 'Azul Marinho HC', isHC: true },

  // Cores básicas adicionais
  { id: '71', hex: '003F1D', name: 'Verde Floresta', isHC: false },
  { id: '72', hex: '096E16', name: 'Verde Escuro', isHC: false },
  { id: '73', hex: '105262', name: 'Azul Petróleo', isHC: false },
  { id: '74', hex: '106262', name: 'Verde Água', isHC: false },
  { id: '75', hex: '121D6D', name: 'Azul Noturno', isHC: false },
  { id: '76', hex: '1F1F1F', name: 'Cinza Escuro', isHC: false },
  { id: '77', hex: '20B4A4', name: 'Turquesa', isHC: false },
  { id: '78', hex: '20B913', name: 'Verde Brilhante', isHC: false },
  { id: '79', hex: '2828C8', name: 'Azul Cobalto', isHC: false },
  { id: '80', hex: '292929', name: 'Carvão', isHC: false },

  // Cores comuns de pele
  { id: '81', hex: 'F5DA88', name: 'Pele Clara', isHC: false },
  { id: '82', hex: 'FFDBC1', name: 'Pele Média', isHC: false },
  { id: '83', hex: 'FFCB98', name: 'Pele Morena', isHC: false },
  { id: '84', hex: 'F4AC54', name: 'Pele Escura', isHC: false },
  { id: '85', hex: 'FF987F', name: 'Pele Muito Escura', isHC: false },

  // Cores especiais e adicionais
  { id: '92', hex: '1', name: 'Branco Padrão', isHC: false },
  { id: '100', hex: '100', name: 'Cor 100', isHC: false },
  { id: '101', hex: '101', name: 'Cor 101', isHC: false },
  { id: '102', hex: '102', name: 'Cor 102', isHC: false },
  { id: '104', hex: '104', name: 'Cor 104', isHC: false },
  { id: '105', hex: '105', name: 'Cor 105', isHC: false },
  { id: '106', hex: '106', name: 'Cor 106', isHC: false },
  { id: '143', hex: '143', name: 'Cor 143', isHC: false },
];

// Função para obter cor por ID
export const getColorById = (id: string): HabboColor | undefined => {
  return HABBO_COLORS.find(color => color.id === id);
};

// Função para obter cores básicas (não HC)
export const getBasicColors = (): HabboColor[] => {
  return HABBO_COLORS.filter(color => !color.isHC);
};

// Função para obter cores HC
export const getHCColors = (): HabboColor[] => {
  return HABBO_COLORS.filter(color => color.isHC);
};

// Cores mais comuns para quick access
export const POPULAR_COLORS = ['1', '2', '4', '6', '8', '11', '13', '17', '20', '26', '31', '42', '49', '68'];

// Mapeamento de cores por categoria (cores mais usadas para cada tipo de peça)
export const COLORS_BY_CATEGORY = {
  hr: ['45', '61', '1', '92', '104', '21', '26', '31', '42', '49'], // Hair
  hd: ['1', '2', '6', '81', '82', '83', '84', '85'], // Head/skin
  ch: ['1', '92', '61', '106', '143', '21', '26', '31', '42', '8', '13', '17'], // Shirts
  lg: ['61', '92', '1', '102', '21', '2', '13', '20'], // Pants
  sh: ['61', '102', '92', '1', '21', '2', '20'], // Shoes
  ha: ['1', '61', '92', '21', '26', '31', '2', '20'], // Hats
  ea: ['1', '21', '61', '92', '2', '20'], // Eye accessories
  fa: ['1', '21', '61', '92', '26'], // Face accessories
  cc: ['1', '61', '92', '21', '2', '13', '17', '8'], // Coats
  ca: ['1', '61', '92', '21', '26', '31'], // Chest accessories
  wa: ['1', '61', '92', '21', '2', '20'], // Waist
  cp: ['1', '61', '92', '21', '26', '31', '42', '8', '13', '17'] // Prints
} as const;
