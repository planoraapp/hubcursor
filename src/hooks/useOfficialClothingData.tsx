import { useState, useEffect } from 'react';

export interface ClothingItem {
  id: string;
  category: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC';
  imageUrl: string;
  figureId: string;
}

// Categorias oficiais do Habbo
export const CATEGORIES = {
  'hd': { name: 'Rostos', icon: '👤' },
  'hr': { name: 'Cabelos', icon: '💇' },
  'ha': { name: 'Chapéus', icon: '🎩' },
  'ea': { name: 'Óculos', icon: '👓' },
  'ch': { name: 'Camisetas', icon: '👕' },
  'cc': { name: 'Casacos', icon: '🧥' },
  'ca': { name: 'Acess. Peito', icon: '🎖️' },
  'cp': { name: 'Estampas', icon: '🎨' },
  'lg': { name: 'Calças', icon: '👖' },
  'sh': { name: 'Sapatos', icon: '👟' },
  'wa': { name: 'Cintura', icon: '🔗' }
};

// Função para gerar URL de imagem
export const generateImageUrl = (figureId: string, color: string, category: string, hotel: string = 'com.br') => {
  const figureString = `${category}-${figureId}-${color}`;
  return `https://www.habbo.${hotel}/habbo-imaging/avatarimage?figure=${figureString}&size=s&direction=2&head_direction=3&gesture=std&frame=0`;
};

// Função para parsear XML do figuredata
const parseFigureData = (xmlData: string, category: string, gender: 'M' | 'F'): ClothingItem[] => {
  const items: ClothingItem[] = [];
  
  try {
    // Parsear XML (simplificado - em produção usar DOMParser)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    
    // Buscar todos os itens da categoria
    const categoryElements = xmlDoc.querySelectorAll(`settype[type="${category}"]`);
    
    categoryElements.forEach(setType => {
      const setId = setType.getAttribute('id');
      const setGender = setType.getAttribute('gender');
      
      // Filtrar por gênero
      if (setGender && setGender !== gender && setGender !== 'U') return;
      
      // Buscar partes dentro do set
      const parts = setType.querySelectorAll('part');
      parts.forEach(part => {
        const partId = part.getAttribute('id');
        const partName = part.getAttribute('name') || `${category}-${partId}`;
        const colorable = part.getAttribute('colorable') === '1';
        const club = part.getAttribute('club') === '1' ? 'HC' : 'FREE';
        
        if (partId) {
          // Gerar cores disponíveis
          const colors = colorable ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'] : ['1'];
          
          items.push({
            id: `${category}-${partId}`,
            category,
            name: partName,
            gender: setGender as 'M' | 'F' | 'U' || 'U',
            colors,
            club,
            imageUrl: generateImageUrl(partId, colors[0], category),
            figureId: partId
          });
        }
      });
    });
  } catch (error) {
    console.error('Erro ao parsear XML:', error);
  }
  
  return items;
};

// Hook principal
export const useOfficialClothingData = (category: string, gender: 'M' | 'F', hotel: string = 'com.br') => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`🌐 Buscando dados oficiais: ${category} (${gender})`);
        
        // Buscar dados oficiais via Edge Function (resolve CORS)
        const response = await fetch(`https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-figuredata?hotel=${hotel}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const xmlData = await response.text();
        
        // Parsear XML e extrair itens da categoria
        const parsedItems = parseFigureData(xmlData, category, gender);
        
        // Gerar URLs de imagem para cada item
        const itemsWithImages = parsedItems.map(item => ({
          ...item,
          imageUrl: generateImageUrl(item.figureId, item.colors[0], item.category, hotel)
        }));
        
        console.log(`✅ ${itemsWithImages.length} itens carregados para ${category}`);
        setItems(itemsWithImages);
        
      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        
        // Fallback: dados básicos para demonstração
        setItems(generateFallbackData(category, gender));
      } finally {
        setLoading(false);
      }
    };

    if (category && gender) {
      fetchData();
    }
  }, [category, gender, hotel]);

  return { items, loading, error };
};

// Dados de fallback com mais itens para demonstração
const generateFallbackData = (category: string, gender: 'M' | 'F'): ClothingItem[] => {
  const fallbackItems: Record<string, ClothingItem[]> = {
    'hd': [
      { id: 'hd-180', category: 'hd', name: 'Rosto Padrão', gender, colors: ['1', '2', '3', '4', '5'], club: 'FREE', imageUrl: generateImageUrl('180', '1', 'hd'), figureId: '180' },
      { id: 'hd-181', category: 'hd', name: 'Rosto Sorridente', gender, colors: ['1', '2', '3', '4', '5'], club: 'FREE', imageUrl: generateImageUrl('181', '1', 'hd'), figureId: '181' },
      { id: 'hd-182', category: 'hd', name: 'Rosto Premium', gender, colors: ['1', '2', '3', '4', '5'], club: 'HC', imageUrl: generateImageUrl('182', '1', 'hd'), figureId: '182' }
    ],
    'hr': [
      { id: 'hr-115', category: 'hr', name: 'Cabelo Curto', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('115', '1', 'hr'), figureId: '115' },
      { id: 'hr-116', category: 'hr', name: 'Cabelo Médio', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('116', '1', 'hr'), figureId: '116' },
      { id: 'hr-117', category: 'hr', name: 'Cabelo Longo', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'HC', imageUrl: generateImageUrl('117', '1', 'hr'), figureId: '117' },
      { id: 'hr-118', category: 'hr', name: 'Cabelo Encaracolado', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('118', '1', 'hr'), figureId: '118' },
      { id: 'hr-119', category: 'hr', name: 'Cabelo Punk', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'HC', imageUrl: generateImageUrl('119', '1', 'hr'), figureId: '119' },
      { id: 'hr-120', category: 'hr', name: 'Cabelo Elegante', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('120', '1', 'hr'), figureId: '120' }
    ],
    'ch': [
      { id: 'ch-215', category: 'ch', name: 'Camiseta Básica', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('215', '1', 'ch'), figureId: '215' },
      { id: 'ch-216', category: 'ch', name: 'Camiseta Listrada', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('216', '1', 'ch'), figureId: '216' },
      { id: 'ch-217', category: 'ch', name: 'Blusa Premium', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'HC', imageUrl: generateImageUrl('217', '1', 'ch'), figureId: '217' },
      { id: 'ch-218', category: 'ch', name: 'Camiseta Polo', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('218', '1', 'ch'), figureId: '218' },
      { id: 'ch-219', category: 'ch', name: 'Blusa Social', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'HC', imageUrl: generateImageUrl('219', '1', 'ch'), figureId: '219' }
    ],
    'lg': [
      { id: 'lg-280', category: 'lg', name: 'Calça Jeans', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('280', '1', 'lg'), figureId: '280' },
      { id: 'lg-281', category: 'lg', name: 'Calça Social', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('281', '1', 'lg'), figureId: '281' },
      { id: 'lg-282', category: 'lg', name: 'Saia Elegante', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'HC', imageUrl: generateImageUrl('282', '1', 'lg'), figureId: '282' },
      { id: 'lg-283', category: 'lg', name: 'Shorts', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('283', '1', 'lg'), figureId: '283' },
      { id: 'lg-284', category: 'lg', name: 'Calça Esportiva', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('284', '1', 'lg'), figureId: '284' }
    ],
    'sh': [
      { id: 'sh-305', category: 'sh', name: 'Tênis', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('305', '1', 'sh'), figureId: '305' },
      { id: 'sh-306', category: 'sh', name: 'Sapato Social', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('306', '1', 'sh'), figureId: '306' },
      { id: 'sh-307', category: 'sh', name: 'Salto Alto', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'HC', imageUrl: generateImageUrl('307', '1', 'sh'), figureId: '307' },
      { id: 'sh-308', category: 'sh', name: 'Bota', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('308', '1', 'sh'), figureId: '308' },
      { id: 'sh-309', category: 'sh', name: 'Sandália', gender, colors: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], club: 'FREE', imageUrl: generateImageUrl('309', '1', 'sh'), figureId: '309' }
    ],
    'ha': [
      { id: 'ha-1001', category: 'ha', name: 'Chapéu de Palha', gender, colors: ['1', '2', '3', '4', '5'], club: 'FREE', imageUrl: generateImageUrl('1001', '1', 'ha'), figureId: '1001' },
      { id: 'ha-1002', category: 'ha', name: 'Boné', gender, colors: ['1', '2', '3', '4', '5'], club: 'FREE', imageUrl: generateImageUrl('1002', '1', 'ha'), figureId: '1002' },
      { id: 'ha-1003', category: 'ha', name: 'Chapéu de Inverno', gender, colors: ['1', '2', '3', '4', '5'], club: 'HC', imageUrl: generateImageUrl('1003', '1', 'ha'), figureId: '1003' }
    ],
    'ea': [
      { id: 'ea-2001', category: 'ea', name: 'Óculos de Sol', gender, colors: ['1', '2', '3', '4', '5'], club: 'FREE', imageUrl: generateImageUrl('2001', '1', 'ea'), figureId: '2001' },
      { id: 'ea-2002', category: 'ea', name: 'Óculos de Leitura', gender, colors: ['1', '2', '3', '4', '5'], club: 'FREE', imageUrl: generateImageUrl('2002', '1', 'ea'), figureId: '2002' },
      { id: 'ea-2003', category: 'ea', name: 'Óculos Premium', gender, colors: ['1', '2', '3', '4', '5'], club: 'HC', imageUrl: generateImageUrl('2003', '1', 'ea'), figureId: '2003' }
    ]
  };
  
  return fallbackItems[category] || [];
};
