import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PuhekuplaClothing {
  guid: string;
  code: string;
  name: string;
  description: string;
  image: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string;
  status: 'active' | 'inactive';
  release_date?: string;
}

export interface PuhekuplaClothingResponse {
  success: boolean;
  result?: {
    clothing: PuhekuplaClothing[];
    pagination?: {
      current_page: number;
      pages: number;
      total: number;
    };
  };
  pagination?: {
    current_page: number;
    pages: number;
    total: number;
  };
  error?: string;
}

export interface PuhekuplaBadge {
  guid: string;
  code: string;
  name: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
  release_date?: string;
}

export interface PuhekuplaBadgeResponse {
  success: boolean;
  result?: {
    badges: PuhekuplaBadge[];
    pagination?: {
      current_page: number;
      pages: number;
      total: number;
    };
  };
  pagination?: {
    current_page: number;
    pages: number;
    total: number;
  };
  error?: string;
}

export interface PuhekuplaFurni {
  guid: string;
  code: string;
  name: string;
  description: string;
  image: string;
  icon?: string;
  category: string;
  status: 'active' | 'inactive';
  release_date?: string;
}

export interface PuhekuplaFurniResponse {
  success: boolean;
  result?: {
    furni: PuhekuplaFurni[];
    pagination?: {
      current_page: number;
      pages: number;
      total: number;
    };
  };
  pagination?: {
    current_page: number;
    pages: number;
    total: number;
  };
  error?: string;
}

export interface PuhekuplaCategory {
  guid: string;
  name: string;
  slug: string;
}

export interface PuhekuplaCategoriesResponse {
  success: boolean;
  result?: {
    categories: PuhekuplaCategory[];
  };
  error?: string;
}

// Biblioteca expandida de roupas mock com orientação front_right consistente
const generateExpandedMockClothing = (): PuhekuplaClothing[] => {
  const mockClothing: PuhekuplaClothing[] = [];
  
  // CABEÇA - Rostos (hd)
  const faces = [
    { id: '180', name: 'Rosto Clássico', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '185', name: 'Rosto Jovem', colors: '1,2,3,4,5,6,7,8,9,10,11,12' },
    { id: '190', name: 'Rosto Maduro', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '200', name: 'Rosto Elegante', colors: '1,2,3,4,5,6,7,8,9,10,11' },
    { id: '205', name: 'Rosto Moderno', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '300', name: 'Rosto Asiático', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '310', name: 'Rosto Africano', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '320', name: 'Rosto Latino', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '330', name: 'Rosto Europeu', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '340', name: 'Rosto Nórdico', colors: '1,2,3,4,5,6,7,8,9,10' }
  ];

  faces.forEach(face => {
    mockClothing.push({
      guid: `hd-${face.id}`,
      code: `hd-${face.id}`,
      name: face.name,
      description: `Rosto único para seu avatar - ${face.name}`,
      image: `https://content.puhekupla.com/img/clothes/hd_${face.id}_front_right.png`,
      category: 'head',
      gender: 'U',
      colors: face.colors,
      status: 'active'
    });
  });

  // CABEÇA - Cabelos (hr) 
  const hairStyles = [
    { id: '828', name: 'Cabelo Clássico Masculino', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30,45,46,47,48' },
    { id: '595', name: 'Cabelo Longo Feminino', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30,45,46,47,48' },
    { id: '906', name: 'Cabelo Punk', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30' },
    { id: '110', name: 'Cabelo Curto Ondulado', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30,45,46,47,48' },
    { id: '125', name: 'Cabelo Liso Comprido', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30,45,46,47,48' },
    { id: '515', name: 'Cabelo Afro', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30' },
    { id: '605', name: 'Cabelo Gamer', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30' },
    { id: '800', name: 'Cabelo Trendy', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30,45,46,47,48' },
    { id: '850', name: 'Cabelo Militar', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30' },
    { id: '900', name: 'Cabelo Emo', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,23,24,25,26,27,28,29,30' }
  ];

  hairStyles.forEach(hair => {
    mockClothing.push({
      guid: `hr-${hair.id}`,
      code: `hr-${hair.id}`,
      name: hair.name,
      description: `Estilo de cabelo único - ${hair.name}`,
      image: `https://content.puhekupla.com/img/clothes/hr_${hair.id}_front_right.png`,
      category: 'hair',
      gender: hair.gender as 'M' | 'F' | 'U',
      colors: hair.colors,
      status: 'active'
    });
  });

  // CABEÇA - Chapéus (ha)
  const hats = [
    { id: '1001', name: 'Boné Baseball', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '1002', name: 'Chapéu Cowboy', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '1003', name: 'Gorro Inverno', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '1004', name: 'Tiara Princesa', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '1005', name: 'Capacete Gamer', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '1006', name: 'Chapéu Chef', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '1007', name: 'Boina Artista', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '1008', name: 'Capacete Motoqueiro', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' }
  ];

  hats.forEach(hat => {
    mockClothing.push({
      guid: `ha-${hat.id}`,
      code: `ha-${hat.id}`,
      name: hat.name,
      description: `Acessório de cabeça estiloso - ${hat.name}`,
      image: `https://content.puhekupla.com/img/clothes/ha_${hat.id}_front_right.png`,
      category: 'hat',
      gender: hat.gender as 'M' | 'F' | 'U',
      colors: hat.colors,
      status: 'active'
    });
  });

  // CABEÇA - Óculos (ea)
  const eyewear = [
    { id: '2001', name: 'Óculos de Sol', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '2002', name: 'Óculos Grau', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '2003', name: 'Óculos Gamer', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '2004', name: 'Óculos Vintage', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '2005', name: 'Óculos Esportivo', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '2006', name: 'Monóculo Elegante', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10' }
  ];

  eyewear.forEach(eye => {
    mockClothing.push({
      guid: `ea-${eye.id}`,
      code: `ea-${eye.id}`,
      name: eye.name,
      description: `Acessório ocular moderno - ${eye.name}`,
      image: `https://content.puhekupla.com/img/clothes/ea_${eye.id}_front_right.png`,
      category: 'eye_accessories',
      gender: eye.gender as 'M' | 'F' | 'U',
      colors: eye.colors,
      status: 'active'
    });
  });

  // CORPO - Camisetas (ch)
  const shirts = [
    { id: '665', name: 'Camisa Básica Masculina', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '667', name: 'Blusa Básica Feminina', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '3100', name: 'Camiseta Gamer', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '215', name: 'Camiseta Esportiva', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '220', name: 'Blusa Social', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '225', name: 'Camiseta Banda', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '230', name: 'Regata Fitness', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '235', name: 'Camiseta Vintage', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '240', name: 'Blusa Cropped', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '245', name: 'Camiseta Oversized', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '250', name: 'Polo Clássica', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '255', name: 'Blusa Decote V', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' }
  ];

  shirts.forEach(shirt => {
    mockClothing.push({
      guid: `ch-${shirt.id}`,
      code: `ch-${shirt.id}`,
      name: shirt.name,
      description: `Camiseta estilosa para seu look - ${shirt.name}`,
      image: `https://content.puhekupla.com/img/clothes/ch_${shirt.id}_front_right.png`,
      category: 'chest',
      gender: shirt.gender as 'M' | 'F' | 'U',
      colors: shirt.colors,
      status: 'active'
    });
  });

  // CORPO - Casacos (cc)
  const jackets = [
    { id: '3001', name: 'Jaqueta Jeans', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '3002', name: 'Blazer Executivo', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '3003', name: 'Moletom Capuz', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '3004', name: 'Casaco Inverno', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '3005', name: 'Jaqueta Couro', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '3006', name: 'Cardigan Elegante', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '3007', name: 'Colete Social', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '3008', name: 'Kimono Moderno', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' }
  ];

  jackets.forEach(jacket => {
    mockClothing.push({
      guid: `cc-${jacket.id}`,
      code: `cc-${jacket.id}`,
      name: jacket.name,
      description: `Peça externa elegante - ${jacket.name}`,
      image: `https://content.puhekupla.com/img/clothes/cc_${jacket.id}_front_right.png`,
      category: 'coat',
      gender: jacket.gender as 'M' | 'F' | 'U',
      colors: jacket.colors,
      status: 'active'
    });
  });

  // PERNAS - Calças (lg)
  const pants = [
    { id: '700', name: 'Calça Jeans Masculina', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '701', name: 'Calça Jeans Feminina', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '270', name: 'Calça Social', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '280', name: 'Shorts Jeans', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '285', name: 'Legging Esportiva', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '290', name: 'Calça Cargo', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '295', name: 'Saia Longa', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '100', name: 'Bermuda Casual', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '105', name: 'Calça Skinny', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '110', name: 'Calça Wide Leg', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '115', name: 'Shorts Esportivo', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '120', name: 'Mini Saia', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' }
  ];

  pants.forEach(pant => {
    mockClothing.push({
      guid: `lg-${pant.id}`,
      code: `lg-${pant.id}`,
      name: pant.name,
      description: `Peça para as pernas com estilo - ${pant.name}`,
      image: `https://content.puhekupla.com/img/clothes/lg_${pant.id}_front_right.png`,
      category: 'legs',
      gender: pant.gender as 'M' | 'F' | 'U',
      colors: pant.colors,
      status: 'active'
    });
  });

  // PERNAS - Sapatos (sh)
  const shoes = [
    { id: '705', name: 'Tênis Básico', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '915', name: 'Sapato Social', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '305', name: 'Bota Couro', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '310', name: 'Sandália Rasteira', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '315', name: 'Salto Alto', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' },
    { id: '320', name: 'Tênis Esportivo', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '325', name: 'Bota Militar', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '330', name: 'Chinelo Slide', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '335', name: 'Sapato Oxford', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '340', name: 'Tênis Cano Alto', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '345', name: 'Mocassim', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '350', name: 'Bota Cowboy', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' }
  ];

  shoes.forEach(shoe => {
    mockClothing.push({
      guid: `sh-${shoe.id}`,
      code: `sh-${shoe.id}`,
      name: shoe.name,
      description: `Calçado estiloso para completar o look - ${shoe.name}`,
      image: `https://content.puhekupla.com/img/clothes/sh_${shoe.id}_front_right.png`,
      category: 'shoes',
      gender: shoe.gender as 'M' | 'F' | 'U',
      colors: shoe.colors,
      status: 'active'
    });
  });

  // CORPO - Acessórios Peito (ca)
  const chestAccessories = [
    { id: '4001', name: 'Colar Dourado', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '4002', name: 'Gravata Social', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '4003', name: 'Cordão Hip Hop', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '4004', name: 'Suspensório', gender: 'M', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '4005', name: 'Colar Pérolas', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '4006', name: 'Pin Metaleiro', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' }
  ];

  chestAccessories.forEach(acc => {
    mockClothing.push({
      guid: `ca-${acc.id}`,
      code: `ca-${acc.id}`,
      name: acc.name,
      description: `Acessório para o peito - ${acc.name}`,
      image: `https://content.puhekupla.com/img/clothes/ca_${acc.id}_front_right.png`,
      category: 'chest_accessories',
      gender: acc.gender as 'M' | 'F' | 'U',
      colors: acc.colors,
      status: 'active'
    });
  });

  // PERNAS - Cintura (wa)
  const waistAccessories = [
    { id: '5001', name: 'Cinto Couro', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '5002', name: 'Cinto Chain', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10' },
    { id: '5003', name: 'Faixa Tecido', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20,25,26,27,28,29,30' },
    { id: '5004', name: 'Cinto Militar', gender: 'U', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18' },
    { id: '5005', name: 'Cinto Estiloso', gender: 'F', colors: '1,2,3,4,5,6,7,8,9,10,15,16,17,18,19,20' }
  ];

  waistAccessories.forEach(waist => {
    mockClothing.push({
      guid: `wa-${waist.id}`,
      code: `wa-${waist.id}`,
      name: waist.name,
      description: `Acessório para a cintura - ${waist.name}`,
      image: `https://content.puhekupla.com/img/clothes/wa_${waist.id}_front_right.png`,
      category: 'waist',
      gender: waist.gender as 'M' | 'F' | 'U',
      colors: waist.colors,
      status: 'active'
    });
  });

  return mockClothing;
};

// Mock data generators for other types
const generateMockBadges = (): PuhekuplaBadge[] => {
  const badges: PuhekuplaBadge[] = [];
  
  for (let i = 1; i <= 50; i++) {
    badges.push({
      guid: `badge-${i}`,
      code: `BADGE${i.toString().padStart(3, '0')}`,
      name: `Badge ${i}`,
      description: `Badge de exemplo ${i}`,
      image: `https://content.puhekupla.com/img/badges/BADGE${i.toString().padStart(3, '0')}.png`,
      status: 'active'
    });
  }
  
  return badges;
};

const generateMockFurni = (): PuhekuplaFurni[] => {
  const furni: PuhekuplaFurni[] = [];
  
  for (let i = 1; i <= 100; i++) {
    furni.push({
      guid: `furni-${i}`,
      code: `furniture_${i}`,
      name: `Móvel ${i}`,
      description: `Móvel de exemplo ${i}`,
      image: `https://content.puhekupla.com/img/furniture/furniture_${i}.png`,
      icon: `https://content.puhekupla.com/img/furniture/furniture_${i}_icon.png`,
      category: 'furniture',
      status: 'active'
    });
  }
  
  return furni;
};

const generateMockCategories = (): PuhekuplaCategory[] => {
  return [
    { guid: 'furniture', name: 'Móveis', slug: 'furniture' },
    { guid: 'decoration', name: 'Decoração', slug: 'decoration' },
    { guid: 'floor', name: 'Pisos', slug: 'floor' },
    { guid: 'wall', name: 'Paredes', slug: 'wall' },
    { guid: 'lighting', name: 'Iluminação', slug: 'lighting' }
  ];
};

const fetchPuhekuplaClothing = async (
  page: number = 1,
  category: string = '',
  search: string = ''
): Promise<PuhekuplaClothingResponse> => {
  console.log(`🌐 [PuhekuplaClothingHook] Fetching clothing - page: ${page}, category: ${category}, search: "${search}"`);
  
  try {
    const { data, error } = await supabase.functions.invoke('puhekupla-proxy', {
      body: { 
        endpoint: 'clothing',
        params: { page, category, search }
      }
    });

    if (error) {
      console.error('❌ [PuhekuplaClothingHook] Supabase function error:', error);
      throw error;
    }

    console.log('📊 [PuhekuplaClothingHook] Response received:', {
      success: data?.success,
      hasData: !!data?.data,
      source: data?.source
    });

    // Se a API real falhar, usar dados mock expandidos
    if (!data?.success || data?.source === 'mock_data') {
      console.log('🔄 [PuhekuplaClothingHook] Using expanded mock data');
      const mockClothing = generateExpandedMockClothing();
      
      // Filtrar por categoria se especificada
      let filteredMockClothing = mockClothing;
      if (category && category !== 'all') {
        filteredMockClothing = mockClothing.filter(item => 
          item.category.toLowerCase() === category.toLowerCase() ||
          item.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Filtrar por busca se especificada
      if (search) {
        filteredMockClothing = filteredMockClothing.filter(item =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.code.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Paginação
      const itemsPerPage = 24;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedItems = filteredMockClothing.slice(startIndex, endIndex);

      return {
        success: true,
        result: {
          clothing: paginatedItems,
          pagination: {
            current_page: page,
            pages: Math.ceil(filteredMockClothing.length / itemsPerPage),
            total: filteredMockClothing.length
          }
        },
        pagination: {
          current_page: page,
          pages: Math.ceil(filteredMockClothing.length / itemsPerPage),
          total: filteredMockClothing.length
        }
      };
    }

    // Usar dados da API se disponível
    if (data?.data?.result?.clothing) {
      return {
        success: true,
        result: {
          clothing: data.data.result.clothing,
          pagination: data.data.result.pagination
        },
        pagination: data.data.result.pagination
      };
    }

    throw new Error('Invalid API response format');
    
  } catch (error) {
    console.error('❌ [PuhekuplaClothingHook] Error:', error);
    
    // Fallback para dados mock expandidos em caso de erro
    console.log('🔄 [PuhekuplaClothingHook] Fallback to expanded mock data');
    const mockClothing = generateExpandedMockClothing();
    
    return {
      success: true,
      result: {
        clothing: mockClothing.slice(0, 24), // Primeira página
        pagination: {
          current_page: 1,
          pages: Math.ceil(mockClothing.length / 24),
          total: mockClothing.length
        }
      },
      pagination: {
        current_page: 1,
        pages: Math.ceil(mockClothing.length / 24),
        total: mockClothing.length
      }
    };
  }
};

const fetchPuhekuplaBadges = async (
  page: number = 1,
  search: string = ''
): Promise<PuhekuplaBadgeResponse> => {
  console.log(`🌐 [PuhekuplaBadgesHook] Fetching badges - page: ${page}, search: "${search}"`);
  
  const mockBadges = generateMockBadges();
  
  // Filtrar por busca se especificada
  let filteredBadges = mockBadges;
  if (search) {
    filteredBadges = mockBadges.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Paginação
  const itemsPerPage = 24;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredBadges.slice(startIndex, endIndex);

  const paginationData = {
    current_page: page,
    pages: Math.ceil(filteredBadges.length / itemsPerPage),
    total: filteredBadges.length
  };

  return {
    success: true,
    result: {
      badges: paginatedItems,
      pagination: paginationData
    },
    pagination: paginationData
  };
};

const fetchPuhekuplaFurni = async (
  page: number = 1,
  category: string = '',
  search: string = ''
): Promise<PuhekuplaFurniResponse> => {
  console.log(`🌐 [PuhekuplaFurniHook] Fetching furni - page: ${page}, category: ${category}, search: "${search}"`);
  
  const mockFurni = generateMockFurni();
  
  // Filtrar por categoria se especificada
  let filteredFurni = mockFurni;
  if (category && category !== 'all') {
    filteredFurni = mockFurni.filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Filtrar por busca se especificada
  if (search) {
    filteredFurni = filteredFurni.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Paginação
  const itemsPerPage = 24;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredFurni.slice(startIndex, endIndex);

  const paginationData = {
    current_page: page,
    pages: Math.ceil(filteredFurni.length / itemsPerPage),
    total: filteredFurni.length
  };

  return {
    success: true,
    result: {
      furni: paginatedItems,
      pagination: paginationData
    },
    pagination: paginationData
  };
};

const fetchPuhekuplaCategories = async (): Promise<PuhekuplaCategoriesResponse> => {
  const mockCategories = generateMockCategories();
  
  return {
    success: true,
    result: {
      categories: mockCategories
    }
  };
};

export const usePuhekuplaClothing = (
  page: number = 1,
  category: string = '',
  search: string = ''
) => {
  console.log(`🔧 [PuhekuplaClothingHook] Hook called with page: ${page}, category: ${category}, search: "${search}"`);
  
  return useQuery({
    queryKey: ['puhekupla-clothing', page, category, search],
    queryFn: () => fetchPuhekuplaClothing(page, category, search),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

export const usePuhekuplaBadges = (
  page: number = 1,
  search: string = ''
) => {
  return useQuery({
    queryKey: ['puhekupla-badges', page, search],
    queryFn: () => fetchPuhekuplaBadges(page, search),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 2,
  });
};

export const usePuhekuplaFurni = (
  page: number = 1,
  category: string = '',
  search: string = ''
) => {
  return useQuery({
    queryKey: ['puhekupla-furni', page, category, search],
    queryFn: () => fetchPuhekuplaFurni(page, category, search),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 2,
  });
};

export const usePuhekuplaCategories = () => {
  return useQuery({
    queryKey: ['puhekupla-categories'],
    queryFn: fetchPuhekuplaCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });
};
