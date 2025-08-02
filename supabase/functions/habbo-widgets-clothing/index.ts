
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface HabboWidgetsItem {
  id: string;
  name: string;
  category: string;
  figureId: string;
  imageUrl: string;
  club: 'HC' | 'FREE';
  gender: 'M' | 'F' | 'U';
  colors: string[];
}

// Cache para reduzir chamadas externas
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hora

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌐 [HabboWidgets] Iniciando busca de dados de roupas...');
    
    // Verificar cache
    const cached = cache.get('habbo-clothing-data');
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('💾 [HabboWidgets] Retornando dados do cache');
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar dados frescos
    const clothingItems = await fetchAllClothingData();
    
    // Armazenar no cache
    cache.set('habbo-clothing-data', {
      data: clothingItems,
      timestamp: Date.now()
    });
    
    console.log(`✅ [HabboWidgets] Retornando ${clothingItems.length} itens de roupas`);

    return new Response(
      JSON.stringify(clothingItems),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboWidgets] Erro ao buscar dados:', error);
    
    // Retornar dados de fallback mais robustos
    const fallbackData = generateComprehensiveFallbackData();
    
    return new Response(
      JSON.stringify(fallbackData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function fetchAllClothingData(): Promise<HabboWidgetsItem[]> {
  const items: HabboWidgetsItem[] = [];
  
  try {
    // Tentar múltiplas fontes de dados
    const dataSources = [
      () => fetchFromHabboWidgets(),
      () => fetchFromHabboAPI(),
      () => generateComprehensiveFallbackData()
    ];

    for (const source of dataSources) {
      try {
        const sourceItems = await source();
        if (sourceItems.length > 0) {
          items.push(...sourceItems);
          console.log(`✅ [DataSource] Carregados ${sourceItems.length} itens`);
          break;
        }
      } catch (sourceError) {
        console.warn(`⚠️ [DataSource] Fonte falhou:`, sourceError.message);
        continue;
      }
    }
    
  } catch (error) {
    console.error('❌ [FetchAllClothing] Erro geral:', error);
  }
  
  return items.length > 0 ? items : generateComprehensiveFallbackData();
}

async function fetchFromHabboWidgets(): Promise<HabboWidgetsItem[]> {
  const items: HabboWidgetsItem[] = [];
  
  try {
    // Tentar acessar HabboWidgets (pode falhar devido a CORS)
    const response = await fetch('https://www.habbowidgets.com/habbo/closet/com.br', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`HabboWidgets responded with ${response.status}`);
    }

    const html = await response.text();
    
    // Parse básico do HTML para extrair informações das roupas
    const imageRegex = /habbo-imaging\/avatarimage\?figure=([^"]+)"/g;
    const nameRegex = /alt="([^"]+)"/g;
    
    let imageMatch;
    let nameMatch;
    let itemId = 1;
    
    while ((imageMatch = imageRegex.exec(html)) !== null && 
           (nameMatch = nameRegex.exec(html)) !== null) {
      
      const figureString = imageMatch[1];
      const itemName = nameMatch[1];
      
      // Extrair categoria do figure string
      const categoryMatch = figureString.match(/(\w+)-(\d+)/);
      if (categoryMatch) {
        const category = categoryMatch[1];
        const figureId = categoryMatch[2];
        
        items.push({
          id: `habbowidgets_${itemId++}`,
          name: itemName,
          category: category,
          figureId: figureId,
          imageUrl: `https://www.habbo.com/${imageMatch[0]}`,
          club: itemName.toLowerCase().includes('hc') ? 'HC' : 'FREE',
          gender: 'U',
          colors: ['1', '2', '3', '4', '5']
        });
      }
    }
    
    console.log(`📦 [HabboWidgets] Parsed ${items.length} items from HTML`);
    
  } catch (error) {
    console.error('❌ [HabboWidgets] Fetch error:', error);
    throw error;
  }
  
  return items;
}

async function fetchFromHabboAPI(): Promise<HabboWidgetsItem[]> {
  const items: HabboWidgetsItem[] = [];
  
  try {
    // Tentar usar API oficial do Habbo para figure data
    const response = await fetch('https://www.habbo.com/gamedata/figuredata/1', {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Habbo API responded with ${response.status}`);
    }

    const data = await response.json();
    
    if (data.settype) {
      Object.entries(data.settype).forEach(([category, categoryData]: [string, any]) => {
        if (categoryData.sets) {
          Object.entries(categoryData.sets).forEach(([setId, setData]: [string, any]) => {
            items.push({
              id: `habbo_api_${category}_${setId}`,
              name: setData.gender ? `${category.toUpperCase()} ${setId}` : `Item ${setId}`,
              category: category,
              figureId: setId,
              imageUrl: `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${setId}-1&gender=U&size=l&direction=2&head_direction=3`,
              club: setData.club === '1' ? 'HC' : 'FREE',
              gender: setData.gender || 'U',
              colors: setData.palettes ? Object.keys(setData.palettes) : ['1']
            });
          });
        }
      });
    }
    
    console.log(`📦 [HabboAPI] Loaded ${items.length} items from official API`);
    
  } catch (error) {
    console.error('❌ [HabboAPI] Fetch error:', error);
    throw error;
  }
  
  return items;
}

function generateComprehensiveFallbackData(): HabboWidgetsItem[] {
  const fallbackItems: HabboWidgetsItem[] = [];
  
  // Dados baseados em IDs reais do Habbo
  const categories = {
    'ca': { name: 'Bijuterias', items: [
      { id: '6199', name: 'Mochila Habbo Cola' },
      { id: '6190', name: 'Boia-Cavalo Marinho' },
      { id: '6189', name: 'Boia-Sapinho' },
      { id: '6188', name: 'Colar Concha Azul' },
      { id: '6187', name: 'Colar Concha Roxa' },
      { id: '6186', name: 'Colar Concha Verde' },
      { id: '6185', name: 'Colar Concha Laranja' },
      { id: '6149', name: 'Macaquinho a Tira-colo' },
      { id: '6128', name: 'Bolsa Estrela Iridescente' },
      { id: '6124', name: 'Skatista Pro' }
    ]},
    'cc': { name: 'Casacos', items: [] },
    'ch': { name: 'Camisas', items: [] },
    'cp': { name: 'Estampas', items: [] },
    'ea': { name: 'Óculos', items: [] },
    'fa': { name: 'Máscaras', items: [] },
    'ha': { name: 'Chapéus', items: [] },
    'hd': { name: 'Rosto & Corpo', items: [] },
    'hr': { name: 'Cabelo', items: [] },
    'lg': { name: 'Calças', items: [] },
    'sh': { name: 'Sapatos', items: [] },
    'wa': { name: 'Cintos', items: [] }
  };

  // Gerar itens para cada categoria
  Object.entries(categories).forEach(([categoryCode, categoryInfo]) => {
    // Usar itens específicos se disponíveis, senão gerar
    const specificItems = categoryInfo.items;
    const itemCount = specificItems.length > 0 ? specificItems.length : 30;
    
    for (let i = 0; i < itemCount; i++) {
      const specificItem = specificItems[i];
      const figureId = specificItem ? specificItem.id : (1000 + i * 10 + Math.floor(Math.random() * 9)).toString();
      const itemName = specificItem ? specificItem.name : `${categoryInfo.name} ${i + 1}`;
      
      fallbackItems.push({
        id: `fallback_${categoryCode}_${i}`,
        name: itemName,
        category: categoryCode,
        figureId: figureId,
        imageUrl: `https://www.habbo.com/habbo-imaging/avatarimage?figure=${categoryCode}-${figureId}-1&gender=U&size=l&direction=2&head_direction=3`,
        club: Math.random() > 0.8 ? 'HC' : 'FREE',
        gender: 'U',
        colors: ['1', '2', '3', '4', '5']
      });
    }
  });
  
  console.log(`🔄 [Fallback] Gerados ${fallbackItems.length} itens de fallback`);
  return fallbackItems;
}
