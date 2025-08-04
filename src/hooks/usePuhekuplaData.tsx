import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PuhekuplaClothing {
  guid: string;
  name: string;
  code: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors?: string;
  image: string;
  status?: string;
}

export interface PuhekuplaBadge {
  guid: string;
  name: string;
  code: string;
  description?: string;
  image: string;
  status?: string;
}

export interface PuhekuplaFurni {
  guid: string;
  name: string;
  code: string;
  category: string;
  image: string;
  colors?: string;
  icon?: string;
  status?: string;
}

export interface PuhekuplaCategory {
  id: string;
  name: string;
  count: number;
  guid?: string;
  slug?: string;
}

export interface PuhekuplaClothingResponse {
  success: boolean;
  result?: {
    clothing: PuhekuplaClothing[];
    pagination: {
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

export interface PuhekuplaBadgeResponse {
  success: boolean;
  result?: {
    badges: PuhekuplaBadge[];
    pagination: {
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

export interface PuhekuplaFurniResponse {
  success: boolean;
  result?: {
    furni: PuhekuplaFurni[];
    pagination: {
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

// Função para gerar dados mock mais realistas de roupas
const generateMockClothingData = (): PuhekuplaClothing[] => {
  const clothing: PuhekuplaClothing[] = [];
  let id = 1;

  // Dados expandidos por categoria com mais variedade
  const categories = [
    { 
      code: 'hd', 
      name: 'head', 
      items: [
        { name: 'Rosto Padrão', code: 'hd-180' },
        { name: 'Rosto Sorridente', code: 'hd-181' },
        { name: 'Rosto Vintage', code: 'hd-185' },
        { name: 'Rosto Moderno', code: 'hd-190' },
        { name: 'Rosto Clássico', code: 'hd-195' }
      ]
    },
    { 
      code: 'hr', 
      name: 'hair', 
      items: [
        { name: 'Cabelo Curto Masculino', code: 'hr-828' },
        { name: 'Cabelo Longo Feminino', code: 'hr-595' },
        { name: 'Cabelo Ondulado', code: 'hr-905' },
        { name: 'Cabelo Cacheado', code: 'hr-875' },
        { name: 'Cabelo Punk', code: 'hr-890' },
        { name: 'Cabelo Liso', code: 'hr-810' },
        { name: 'Cabelo Afro', code: 'hr-915' },
        { name: 'Cabelo com Franja', code: 'hr-920' }
      ]
    },
    { 
      code: 'ch', 
      name: 'shirt', 
      items: [
        { name: 'Camiseta Básica', code: 'ch-665' },
        { name: 'Regata Esportiva', code: 'ch-667' },
        { name: 'Camisa Social', code: 'ch-870' },
        { name: 'Blusa Feminina', code: 'ch-875' },
        { name: 'Camiseta Estampada', code: 'ch-680' },
        { name: 'Polo Clássica', code: 'ch-690' },
        { name: 'Blusa de Frio', code: 'ch-695' },
        { name: 'Top Feminino', code: 'ch-700' },
        { name: 'Camiseta Vintage', code: 'ch-710' },
        { name: 'Regata Básica', code: 'ch-715' }
      ]
    },
    { 
      code: 'lg', 
      name: 'pants', 
      items: [
        { name: 'Calça Jeans', code: 'lg-270' },
        { name: 'Calça Social', code: 'lg-280' },
        { name: 'Bermuda Casual', code: 'lg-285' },
        { name: 'Saia Feminina', code: 'lg-290' },
        { name: 'Calça Esportiva', code: 'lg-295' },
        { name: 'Short Jeans', code: 'lg-300' },
        { name: 'Calça Cargo', code: 'lg-305' },
        { name: 'Legging Fitness', code: 'lg-310' }
      ]
    },
    { 
      code: 'sh', 
      name: 'shoes', 
      items: [
        { name: 'Tênis Casual', code: 'sh-305' },
        { name: 'Sapato Social', code: 'sh-310' },
        { name: 'Sandália', code: 'sh-315' },
        { name: 'Bota Militar', code: 'sh-320' },
        { name: 'Tênis Esportivo', code: 'sh-325' },
        { name: 'Sapato Feminino', code: 'sh-330' },
        { name: 'Chinelo', code: 'sh-335' }
      ]
    },
    { 
      code: 'ha', 
      name: 'hat', 
      items: [
        { name: 'Boné Clássico', code: 'ha-410' },
        { name: 'Chapéu Social', code: 'ha-415' },
        { name: 'Gorro de Inverno', code: 'ha-420' },
        { name: 'Viseira Esportiva', code: 'ha-425' },
        { name: 'Chapéu Feminino', code: 'ha-430' },
        { name: 'Boné Aba Reta', code: 'ha-435' }
      ]
    },
    { 
      code: 'ea', 
      name: 'glasses', 
      items: [
        { name: 'Óculos de Sol', code: 'ea-180' },
        { name: 'Óculos de Grau', code: 'ea-185' },
        { name: 'Óculos Vintage', code: 'ea-190' },
        { name: 'Óculos Esportivo', code: 'ea-195' }
      ]
    },
    { 
      code: 'cc', 
      name: 'jacket', 
      items: [
        { name: 'Jaqueta de Couro', code: 'cc-480' },
        { name: 'Blazer Social', code: 'cc-485' },
        { name: 'Casaco de Inverno', code: 'cc-490' },
        { name: 'Jaqueta Jeans', code: 'cc-495' }
      ]
    },
    { 
      code: 'ca', 
      name: 'chest_accessories', 
      items: [
        { name: 'Colar Dourado', code: 'ca-510' },
        { name: 'Gravata Clássica', code: 'ca-515' },
        { name: 'Pingente Coração', code: 'ca-520' }
      ]
    },
    { 
      code: 'wa', 
      name: 'waist', 
      items: [
        { name: 'Cinto de Couro', code: 'wa-540' },
        { name: 'Cinto Social', code: 'wa-545' },
        { name: 'Cinto Feminino', code: 'wa-550' }
      ]
    }
  ];

  const genders: Array<'M' | 'F' | 'U'> = ['M', 'F', 'U'];
  const colors = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '45', '46', '47', '48', '92'];

  categories.forEach(category => {
    category.items.forEach((item, itemIndex) => {
      genders.forEach(gender => {
        const itemId = `${id++}`;
        const randomColors = colors.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 3);
        
        // URL da imagem com orientação front_right padronizada
        const imageUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${item.code}-${randomColors[0]}&size=m&direction=2&head_direction=2&action=std&gesture=std`;
        
        clothing.push({
          guid: itemId,
          name: `${item.name} ${gender === 'M' ? 'Masculino' : gender === 'F' ? 'Feminino' : 'Unissex'}`,
          code: item.code,
          category: category.name,
          gender: gender,
          colors: randomColors.join(','),
          image: imageUrl
        });
      });
    });
  });

  return clothing;
};

// Função para gerar dados mock de badges
const generateMockBadgeData = (): PuhekuplaBadge[] => {
  const badges: PuhekuplaBadge[] = [];
  let id = 1;

  const badgeTypes = [
    'ACH_', 'ADM_', 'BAS_', 'BOT_', 'CAM_', 'CHR_', 'CLU_', 'COM_', 'EVE_', 'FAM_',
    'FSH_', 'FUR_', 'GAM_', 'GRP_', 'GUI_', 'HOL_', 'LAN_', 'LIF_', 'MSS_', 'NEW_',
    'PET_', 'RCH_', 'RG_', 'RUP_', 'SEA_', 'SHR_', 'SUM_', 'TRA_', 'WIN_', 'YEA_'
  ];

  badgeTypes.forEach(type => {
    for (let i = 1; i <= 15; i++) {
      const code = `${type}${i.toString().padStart(3, '0')}`;
      badges.push({
        guid: `${id++}`,
        name: `${type.replace('_', '')} Badge ${i}`,
        code: code,
        description: `Conquista especial do tipo ${type}`,
        image: `https://images.habbo.com/c_images/album1584/${code}.gif`
      });
    }
  });

  return badges;
};

// Função para gerar dados mock de furnis
const generateMockFurniData = (): PuhekuplaFurni[] => {
  const furni: PuhekuplaFurni[] = [];
  let id = 1;

  const categories = [
    { name: 'chair', items: ['Cadeira Clássica', 'Poltrona Moderna', 'Banqueta Alta'] },
    { name: 'table', items: ['Mesa de Centro', 'Mesa de Jantar', 'Mesa de Escritório'] },
    { name: 'bed', items: ['Cama Simples', 'Cama de Casal', 'Cama Temática'] },
    { name: 'decoration', items: ['Vaso de Flores', 'Quadro Artístico', 'Escultura'] }
  ];

  categories.forEach(category => {
    category.items.forEach((item, itemIndex) => {
      const code = `${category.name}_${itemIndex + 1}`;
      furni.push({
        guid: `${id++}`,
        name: item,
        code: code,
        category: category.name,
        colors: '1,2,3,4,5',
        image: `https://images.habbo.com/dcr/hof_furni/icons/icon_${code}.png`
      });
    });
  });

  return furni;
};

// Mock data
const mockClothingData = generateMockClothingData();
const mockBadgeData = generateMockBadgeData();
const mockFurniData = generateMockFurniData();

// Hook para buscar roupas Puhekupla
export const usePuhekuplaClothing = (page = 1, category?: string, search?: string) => {
  return useQuery<PuhekuplaClothingResponse>({
    queryKey: ['puhekupla-clothing', page, category, search],
    queryFn: async () => {
      console.log('🔍 [usePuhekuplaClothing] Buscando roupas:', { page, category, search });
      
      try {
        const { data, error } = await supabase.functions.invoke('puhekupla-proxy', {
          body: { 
            endpoint: 'clothing',
            page,
            category,
            search
          }
        });

        if (error) {
          console.warn('⚠️ [usePuhekuplaClothing] API error, usando dados mock:', error);
          return getMockClothingData(page, category, search);
        }

        if (data?.success && data?.result?.clothing) {
          console.log('✅ [usePuhekuplaClothing] API Success:', {
            count: data.result.clothing.length,
            category,
            search
          });
          return data;
        } else {
          console.warn('⚠️ [usePuhekuplaClothing] API retornou dados inválidos, usando mock');
          return getMockClothingData(page, category, search);
        }
      } catch (error) {
        console.error('❌ [usePuhekuplaClothing] Erro na API:', error);
        return getMockClothingData(page, category, search);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Função para filtrar dados mock de roupas
const getMockClothingData = (page = 1, category?: string, search?: string): PuhekuplaClothingResponse => {
  let filteredClothing = [...mockClothingData];

  // Melhor mapeamento de categorias
  const categoryMapping: Record<string, string[]> = {
    'hd': ['head', 'face'],
    'hr': ['hair'],
    'ha': ['hat', 'head_accessories'],
    'ea': ['glasses', 'eye_accessories'],
    'fa': ['face_accessories'],
    'ch': ['shirt', 'top', 'chest'],
    'cc': ['coat', 'jacket'],
    'ca': ['chest_accessories'],
    'cp': ['chest_print'],
    'lg': ['legs', 'pants', 'trousers'],
    'sh': ['shoes', 'footwear'],
    'wa': ['waist', 'belt']
  };

  // Filtro por categoria (mais permissivo)
  if (category) {
    const allowedCategories = categoryMapping[category] || [category];
    filteredClothing = filteredClothing.filter(item => {
      return allowedCategories.some(cat => 
        item.category.toLowerCase().includes(cat.toLowerCase()) ||
        cat.toLowerCase().includes(item.category.toLowerCase())
      );
    });
  }

  // Filtro por busca
  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    filteredClothing = filteredClothing.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.code.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower)
    );
  }

  console.log('📊 [getMockClothingData] Resultados:', {
    category,
    search,
    totalItems: mockClothingData.length,
    filteredItems: filteredClothing.length,
    page
  });

  // Paginação
  const itemsPerPage = 50;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredClothing.slice(startIndex, endIndex);

  const paginationData = {
    current_page: page,
    pages: Math.ceil(filteredClothing.length / itemsPerPage),
    total: filteredClothing.length
  };

  return {
    success: true,
    result: {
      clothing: paginatedItems,
      pagination: paginationData
    },
    pagination: paginationData
  };
};

export const usePuhekuplaBadges = (page = 1, search?: string) => {
  return useQuery<PuhekuplaBadgeResponse>({
    queryKey: ['puhekupla-badges', page, search],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('puhekupla-proxy', {
          body: { 
            endpoint: 'badges',
            page,
            search
          }
        });

        if (error) {
          console.warn('⚠️ [usePuhekuplaBadges] API error, usando dados mock:', error);
          return getMockBadgeData(page, search);
        }

        if (data?.success && data?.result?.badges) {
          return data;
        } else {
          return getMockBadgeData(page, search);
        }
      } catch (error) {
        console.error('❌ [usePuhekuplaBadges] Erro na API:', error);
        return getMockBadgeData(page, search);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

const getMockBadgeData = (page = 1, search?: string): PuhekuplaBadgeResponse => {
  let filteredBadges = [...mockBadgeData];

  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    filteredBadges = filteredBadges.filter(badge =>
      badge.name.toLowerCase().includes(searchLower) ||
      badge.code.toLowerCase().includes(searchLower)
    );
  }

  const itemsPerPage = 50;
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

export const usePuhekuplaFurni = (page = 1, category?: string, search?: string) => {
  return useQuery<PuhekuplaFurniResponse>({
    queryKey: ['puhekupla-furni', page, category, search],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('puhekupla-proxy', {
          body: { 
            endpoint: 'furni',
            page,
            category,
            search
          }
        });

        if (error) {
          console.warn('⚠️ [usePuhekuplaFurni] API error, usando dados mock:', error);
          return getMockFurniData(page, search);
        }

        if (data?.success && data?.result?.furni) {
          return data;
        } else {
          return getMockFurniData(page, search);
        }
      } catch (error) {
        console.error('❌ [usePuhekuplaFurni] Erro na API:', error);
        return getMockFurniData(page, search);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

const getMockFurniData = (page = 1, category?: string, search?: string): PuhekuplaFurniResponse => {
  let filteredFurni = [...mockFurniData];

  if (category) {
    filteredFurni = filteredFurni.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    filteredFurni = filteredFurni.filter(item =>
      item.name.toLowerCase().includes(searchLower) ||
      item.code.toLowerCase().includes(searchLower)
    );
  }

  const itemsPerPage = 50;
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

export const usePuhekuplaCategories = () => {
  return useQuery<{ result?: { categories: PuhekuplaCategory[] } }>({
    queryKey: ['puhekupla-categories'],
    queryFn: async () => {
      const categories: PuhekuplaCategory[] = [
        { id: 'hd', name: 'Rostos', count: 25, guid: 'hd', slug: 'hd' },
        { id: 'hr', name: 'Cabelos', count: 120, guid: 'hr', slug: 'hr' },
        { id: 'ch', name: 'Camisetas', count: 180, guid: 'ch', slug: 'ch' },
        { id: 'lg', name: 'Calças', count: 140, guid: 'lg', slug: 'lg' },
        { id: 'sh', name: 'Sapatos', count: 95, guid: 'sh', slug: 'sh' },
        { id: 'ha', name: 'Chapéus', count: 80, guid: 'ha', slug: 'ha' },
        { id: 'ea', name: 'Óculos', count: 45, guid: 'ea', slug: 'ea' },
        { id: 'cc', name: 'Casacos', count: 65, guid: 'cc', slug: 'cc' },
        { id: 'ca', name: 'Acessórios Peito', count: 35, guid: 'ca', slug: 'ca' },
        { id: 'wa', name: 'Cintura', count: 25, guid: 'wa', slug: 'wa' }
      ];
      return { result: { categories } };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
