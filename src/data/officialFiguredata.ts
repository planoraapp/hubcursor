// Dados oficiais do Habbo baseados no figuredata.xml
export interface OfficialClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  name: string;
  source: 'official-figuredata';
}

export const OFFICIAL_HABBO_FIGUREDATA: Record<string, OfficialClothingItem[]> = {
  'hd': [
    { id: 'official_hd_180', figureId: '180', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Rosto Clássico', source: 'official-figuredata' },
    { id: 'official_hd_181', figureId: '181', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Rosto Moderno', source: 'official-figuredata' },
    { id: 'official_hd_182', figureId: '182', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Rosto Elegante', source: 'official-figuredata' },
    { id: 'official_hd_183', figureId: '183', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Rosto Casual', source: 'official-figuredata' },
    { id: 'official_hd_185', figureId: '185', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Premium', source: 'official-figuredata' },
    { id: 'official_hd_186', figureId: '186', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto VIP', source: 'official-figuredata' },
    { id: 'official_hd_188', figureId: '188', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Exclusivo', source: 'official-figuredata' },
    { id: 'official_hd_189', figureId: '189', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Raro', source: 'official-figuredata' },
    { id: 'official_hd_190', figureId: '190', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Épico', source: 'official-figuredata' },
    { id: 'official_hd_195', figureId: '195', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Lendário', source: 'official-figuredata' },
    { id: 'official_hd_200', figureId: '200', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Mítico', source: 'official-figuredata' },
    { id: 'official_hd_205', figureId: '205', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Divino', source: 'official-figuredata' },
    { id: 'official_hd_206', figureId: '206', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Celestial', source: 'official-figuredata' },
    { id: 'official_hd_225', figureId: '225', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Estelar', source: 'official-figuredata' },
    { id: 'official_hd_230', figureId: '230', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Cósmico', source: 'official-figuredata' },
    { id: 'official_hd_235', figureId: '235', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Galáctico', source: 'official-figuredata' },
    { id: 'official_hd_240', figureId: '240', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Universal', source: 'official-figuredata' },
    { id: 'official_hd_245', figureId: '245', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Infinito', source: 'official-figuredata' },
    { id: 'official_hd_250', figureId: '250', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Eterno', source: 'official-figuredata' },
    { id: 'official_hd_255', figureId: '255', category: 'hd', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Rosto Supremo', source: 'official-figuredata' }
  ],
  'hr': [
    { id: 'official_hr_1', figureId: '1', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Clássico', source: 'official-figuredata' },
    { id: 'official_hr_3', figureId: '3', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Moderno', source: 'official-figuredata' },
    { id: 'official_hr_4', figureId: '4', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Elegante', source: 'official-figuredata' },
    { id: 'official_hr_5', figureId: '5', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Casual', source: 'official-figuredata' },
    { id: 'official_hr_6', figureId: '6', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Despojado', source: 'official-figuredata' },
    { id: 'official_hr_9', figureId: '9', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Estilo', source: 'official-figuredata' },
    { id: 'official_hr_10', figureId: '10', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'FREE', name: 'Cabelo Trendy', source: 'official-figuredata' },
    { id: 'official_hr_16', figureId: '16', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Premium', source: 'official-figuredata' },
    { id: 'official_hr_19', figureId: '19', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo VIP', source: 'official-figuredata' },
    { id: 'official_hr_20', figureId: '20', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Exclusivo', source: 'official-figuredata' },
    { id: 'official_hr_23', figureId: '23', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Raro', source: 'official-figuredata' },
    { id: 'official_hr_25', figureId: '25', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Épico', source: 'official-figuredata' },
    { id: 'official_hr_26', figureId: '26', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Lendário', source: 'official-figuredata' },
    { id: 'official_hr_27', figureId: '27', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Mítico', source: 'official-figuredata' },
    { id: 'official_hr_30', figureId: '30', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Divino', source: 'official-figuredata' },
    { id: 'official_hr_31', figureId: '31', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Celestial', source: 'official-figuredata' },
    { id: 'official_hr_32', figureId: '32', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Estelar', source: 'official-figuredata' },
    { id: 'official_hr_33', figureId: '33', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Cósmico', source: 'official-figuredata' },
    { id: 'official_hr_34', figureId: '34', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Galáctico', source: 'official-figuredata' },
    { id: 'official_hr_35', figureId: '35', category: 'hr', gender: 'U', colors: ['1', '21', '45', '61', '92', '104', '26', '31'], club: 'HC', name: 'Cabelo Universal', source: 'official-figuredata' }
  ],
  'ch': [
    { id: 'official_ch_1', figureId: '1', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'FREE', name: 'Camiseta Básica', source: 'official-figuredata' },
    { id: 'official_ch_2', figureId: '2', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'FREE', name: 'Camiseta Casual', source: 'official-figuredata' },
    { id: 'official_ch_3', figureId: '3', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'FREE', name: 'Camiseta Estilo', source: 'official-figuredata' },
    { id: 'official_ch_4', figureId: '4', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'FREE', name: 'Camiseta Moderna', source: 'official-figuredata' },
    { id: 'official_ch_5', figureId: '5', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'FREE', name: 'Camiseta Trendy', source: 'official-figuredata' },
    { id: 'official_ch_6', figureId: '6', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'FREE', name: 'Camiseta Elegante', source: 'official-figuredata' },
    { id: 'official_ch_7', figureId: '7', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Premium', source: 'official-figuredata' },
    { id: 'official_ch_8', figureId: '8', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta VIP', source: 'official-figuredata' },
    { id: 'official_ch_9', figureId: '9', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Exclusiva', source: 'official-figuredata' },
    { id: 'official_ch_10', figureId: '10', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Rara', source: 'official-figuredata' },
    { id: 'official_ch_11', figureId: '11', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Épica', source: 'official-figuredata' },
    { id: 'official_ch_12', figureId: '12', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Lendária', source: 'official-figuredata' },
    { id: 'official_ch_13', figureId: '13', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Mítica', source: 'official-figuredata' },
    { id: 'official_ch_14', figureId: '14', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Divina', source: 'official-figuredata' },
    { id: 'official_ch_15', figureId: '15', category: 'ch', gender: 'U', colors: ['1', '61', '92', '100', '106', '143'], club: 'HC', name: 'Camiseta Celestial', source: 'official-figuredata' }
  ],
  'cc': [
    { id: 'official_cc_1', figureId: '1', category: 'cc', gender: 'U', colors: ['1', '61', '92', '100'], club: 'FREE', name: 'Casaco Básico', source: 'official-figuredata' },
    { id: 'official_cc_2', figureId: '2', category: 'cc', gender: 'U', colors: ['1', '61', '92', '100'], club: 'FREE', name: 'Casaco Casual', source: 'official-figuredata' },
    { id: 'official_cc_3', figureId: '3', category: 'cc', gender: 'U', colors: ['1', '61', '92', '100'], club: 'FREE', name: 'Casaco Elegante', source: 'official-figuredata' },
    { id: 'official_cc_4', figureId: '4', category: 'cc', gender: 'U', colors: ['1', '61', '92', '100'], club: 'HC', name: 'Casaco Premium', source: 'official-figuredata' },
    { id: 'official_cc_5', figureId: '5', category: 'cc', gender: 'U', colors: ['1', '61', '92', '100'], club: 'HC', name: 'Casaco VIP', source: 'official-figuredata' },
    { id: 'official_cc_6', figureId: '6', category: 'cc', gender: 'U', colors: ['1', '61', '92', '100'], club: 'HC', name: 'Casaco Exclusivo', source: 'official-figuredata' }
  ],
  'lg': [
    { id: 'official_lg_100', figureId: '100', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'FREE', name: 'Calça Básica', source: 'official-figuredata' },
    { id: 'official_lg_101', figureId: '101', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'FREE', name: 'Calça Casual', source: 'official-figuredata' },
    { id: 'official_lg_102', figureId: '102', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'FREE', name: 'Calça Elegante', source: 'official-figuredata' },
    { id: 'official_lg_103', figureId: '103', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'FREE', name: 'Calça Moderna', source: 'official-figuredata' },
    { id: 'official_lg_104', figureId: '104', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'HC', name: 'Calça Premium', source: 'official-figuredata' },
    { id: 'official_lg_105', figureId: '105', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'HC', name: 'Calça VIP', source: 'official-figuredata' },
    { id: 'official_lg_106', figureId: '106', category: 'lg', gender: 'U', colors: ['1', '61', '92', '82', '100'], club: 'HC', name: 'Calça Exclusiva', source: 'official-figuredata' }
  ],
  'sh': [
    { id: 'official_sh_1', figureId: '1', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'FREE', name: 'Sapato Básico', source: 'official-figuredata' },
    { id: 'official_sh_2', figureId: '2', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'FREE', name: 'Sapato Casual', source: 'official-figuredata' },
    { id: 'official_sh_3', figureId: '3', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'FREE', name: 'Sapato Elegante', source: 'official-figuredata' },
    { id: 'official_sh_4', figureId: '4', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'FREE', name: 'Sapato Moderno', source: 'official-figuredata' },
    { id: 'official_sh_5', figureId: '5', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'HC', name: 'Sapato Premium', source: 'official-figuredata' },
    { id: 'official_sh_6', figureId: '6', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'HC', name: 'Sapato VIP', source: 'official-figuredata' },
    { id: 'official_sh_7', figureId: '7', category: 'sh', gender: 'U', colors: ['1', '61', '92', '80'], club: 'HC', name: 'Sapato Exclusivo', source: 'official-figuredata' }
  ],
  'ha': [
    { id: 'official_ha_1', figureId: '1', category: 'ha', gender: 'U', colors: ['1', '61', '92', '21'], club: 'FREE', name: 'Chapéu Básico', source: 'official-figuredata' },
    { id: 'official_ha_2', figureId: '2', category: 'ha', gender: 'U', colors: ['1', '61', '92', '21'], club: 'FREE', name: 'Chapéu Casual', source: 'official-figuredata' },
    { id: 'official_ha_3', figureId: '3', category: 'ha', gender: 'U', colors: ['1', '61', '92', '21'], club: 'FREE', name: 'Chapéu Elegante', source: 'official-figuredata' },
    { id: 'official_ha_4', figureId: '4', category: 'ha', gender: 'U', colors: ['1', '61', '92', '21'], club: 'HC', name: 'Chapéu Premium', source: 'official-figuredata' },
    { id: 'official_ha_5', figureId: '5', category: 'ha', gender: 'U', colors: ['1', '61', '92', '21'], club: 'HC', name: 'Chapéu VIP', source: 'official-figuredata' },
    { id: 'official_ha_6', figureId: '6', category: 'ha', gender: 'U', colors: ['1', '61', '92', '21'], club: 'HC', name: 'Chapéu Exclusivo', source: 'official-figuredata' }
  ],
  'ea': [
    { id: 'official_ea_1', figureId: '1', category: 'ea', gender: 'U', colors: ['1', '2', '3', '4'], club: 'FREE', name: 'Óculos Básico', source: 'official-figuredata' },
    { id: 'official_ea_2', figureId: '2', category: 'ea', gender: 'U', colors: ['1', '2', '3', '4'], club: 'FREE', name: 'Óculos Casual', source: 'official-figuredata' },
    { id: 'official_ea_3', figureId: '3', category: 'ea', gender: 'U', colors: ['1', '2', '3', '4'], club: 'FREE', name: 'Óculos Elegante', source: 'official-figuredata' },
    { id: 'official_ea_4', figureId: '4', category: 'ea', gender: 'U', colors: ['1', '2', '3', '4'], club: 'HC', name: 'Óculos Premium', source: 'official-figuredata' },
    { id: 'official_ea_5', figureId: '5', category: 'ea', gender: 'U', colors: ['1', '2', '3', '4'], club: 'HC', name: 'Óculos VIP', source: 'official-figuredata' },
    { id: 'official_ea_6', figureId: '6', category: 'ea', gender: 'U', colors: ['1', '2', '3', '4'], club: 'HC', name: 'Óculos Exclusivo', source: 'official-figuredata' }
  ],
  'ca': [
    { id: 'official_ca_1', figureId: '1', category: 'ca', gender: 'U', colors: ['1', '61', '92'], club: 'FREE', name: 'Acessório Básico', source: 'official-figuredata' },
    { id: 'official_ca_2', figureId: '2', category: 'ca', gender: 'U', colors: ['1', '61', '92'], club: 'FREE', name: 'Acessório Casual', source: 'official-figuredata' },
    { id: 'official_ca_3', figureId: '3', category: 'ca', gender: 'U', colors: ['1', '61', '92'], club: 'FREE', name: 'Acessório Elegante', source: 'official-figuredata' },
    { id: 'official_ca_4', figureId: '4', category: 'ca', gender: 'U', colors: ['1', '61', '92'], club: 'HC', name: 'Acessório Premium', source: 'official-figuredata' },
    { id: 'official_ca_5', figureId: '5', category: 'ca', gender: 'U', colors: ['1', '61', '92'], club: 'HC', name: 'Acessório VIP', source: 'official-figuredata' },
    { id: 'official_ca_6', figureId: '6', category: 'ca', gender: 'U', colors: ['1', '61', '92'], club: 'HC', name: 'Acessório Exclusivo', source: 'official-figuredata' }
  ],
  'cp': [
    { id: 'official_cp_1', figureId: '1', category: 'cp', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Estampa Básica', source: 'official-figuredata' },
    { id: 'official_cp_2', figureId: '2', category: 'cp', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Estampa Casual', source: 'official-figuredata' },
    { id: 'official_cp_3', figureId: '3', category: 'cp', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'FREE', name: 'Estampa Elegante', source: 'official-figuredata' },
    { id: 'official_cp_4', figureId: '4', category: 'cp', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Estampa Premium', source: 'official-figuredata' },
    { id: 'official_cp_5', figureId: '5', category: 'cp', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Estampa VIP', source: 'official-figuredata' },
    { id: 'official_cp_6', figureId: '6', category: 'cp', gender: 'U', colors: ['1', '2', '3', '4', '5'], club: 'HC', name: 'Estampa Exclusiva', source: 'official-figuredata' }
  ],
  'wa': [
    { id: 'official_wa_1', figureId: '1', category: 'wa', gender: 'U', colors: ['1', '61', '92'], club: 'FREE', name: 'Cintura Básica', source: 'official-figuredata' },
    { id: 'official_wa_2', figureId: '2', category: 'wa', gender: 'U', colors: ['1', '61', '92'], club: 'FREE', name: 'Cintura Casual', source: 'official-figuredata' },
    { id: 'official_wa_3', figureId: '3', category: 'wa', gender: 'U', colors: ['1', '61', '92'], club: 'FREE', name: 'Cintura Elegante', source: 'official-figuredata' },
    { id: 'official_wa_4', figureId: '4', category: 'wa', gender: 'U', colors: ['1', '61', '92'], club: 'HC', name: 'Cintura Premium', source: 'official-figuredata' },
    { id: 'official_wa_5', figureId: '5', category: 'wa', gender: 'U', colors: ['1', '61', '92'], club: 'HC', name: 'Cintura VIP', source: 'official-figuredata' },
    { id: 'official_wa_6', figureId: '6', category: 'wa', gender: 'U', colors: ['1', '61', '92'], club: 'HC', name: 'Cintura Exclusiva', source: 'official-figuredata' }
  ]
};

// Função para obter itens de uma categoria específica
export const getOfficialClothingByCategory = (category: string, gender: 'M' | 'F' = 'M'): OfficialClothingItem[] => {
  const items = OFFICIAL_HABBO_FIGUREDATA[category] || [];
  return items.filter(item => item.gender === gender || item.gender === 'U');
};

// Função para obter todos os dados
export const getAllOfficialClothing = (): Record<string, OfficialClothingItem[]> => {
  return OFFICIAL_HABBO_FIGUREDATA;
};
