
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface HabboClothingItem {
  id: string;
  figureId: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  colors: string[];
  club: 'FREE' | 'HC' | 'LTD';
  name: string;
  type: string;
  selectable: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [RealHabboData] Fetching real Habbo figuredata...');
    
    // Buscar dados reais do figuredata oficial
    const figureDataResponse = await fetch('https://www.habbo.com/gamedata/figuredata/1', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HabboHub/1.0)',
        'Accept': 'application/json',
      }
    });

    if (!figureDataResponse.ok) {
      throw new Error(`Failed to fetch figuredata: ${figureDataResponse.status}`);
    }

    const figureData = await figureDataResponse.json();
    console.log('✅ [RealHabboData] Figuredata loaded successfully');

    // Processar dados para formato ViaJovem
    const processedData = await processFigureData(figureData);
    
    console.log(`📦 [RealHabboData] Processed ${Object.keys(processedData).length} categories`);
    
    return new Response(
      JSON.stringify({
        success: true,
        data: processedData,
        metadata: {
          source: 'habbo-official-figuredata',
          fetchedAt: new Date().toISOString(),
          totalCategories: Object.keys(processedData).length,
          totalItems: Object.values(processedData).reduce((sum, items) => sum + items.length, 0)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [RealHabboData] Error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: {}
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processFigureData(figureData: any): Promise<Record<string, HabboClothingItem[]>> {
  const processedItems: Record<string, HabboClothingItem[]> = {};

  if (!figureData.settype) {
    console.warn('⚠️ No settype found in figuredata');
    return processedItems;
  }

  // Processar cada categoria (settype)
  for (const [categoryId, categoryData] of Object.entries(figureData.settype)) {
    if (typeof categoryData !== 'object' || !categoryData) continue;
    
    const category = categoryId as string;
    processedItems[category] = [];
    
    const sets = (categoryData as any).sets || {};
    
    // Processar cada set (item de roupa)
    for (const [setId, setData] of Object.entries(sets)) {
      if (typeof setData !== 'object' || !setData) continue;
      
      const set = setData as any;
      
      // Determinar raridade baseada no club level
      let club: 'FREE' | 'HC' | 'LTD' = 'FREE';
      if (set.club === 1) club = 'HC';
      if (set.club === 2) club = 'LTD';
      
      // Extrair cores disponíveis
      const colors = extractColorsFromSet(set, figureData.palettes || {});
      
      // Criar item no formato ViaJovem
      const item: HabboClothingItem = {
        id: `${category}_${setId}`,
        figureId: setId,
        category,
        gender: set.gender || 'U',
        colors,
        club,
        name: `${getCategoryName(category)} ${setId}`,
        type: set.type || 'clothing',
        selectable: set.selectable !== false
      };
      
      // Só adicionar se for selecionável
      if (item.selectable) {
        processedItems[category].push(item);
      }
    }
    
    // Ordenar por figureId
    processedItems[category].sort((a, b) => parseInt(a.figureId) - parseInt(b.figureId));
    
    console.log(`📦 [${category}] Processed ${processedItems[category].length} items`);
  }
  
  return processedItems;
}

function extractColorsFromSet(set: any, palettes: any): string[] {
  const colors: string[] = [];
  
  if (!set.parts || !Array.isArray(set.parts)) {
    return ['1']; // Default color
  }
  
  for (const part of set.parts) {
    if (part.colorindex !== undefined && palettes[part.colorindex]) {
      const palette = palettes[part.colorindex];
      if (palette.colors) {
        for (const colorId of Object.keys(palette.colors)) {
          if (!colors.includes(colorId)) {
            colors.push(colorId);
          }
        }
      }
    }
  }
  
  return colors.length > 0 ? colors : ['1'];
}

function getCategoryName(category: string): string {
  const names = {
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'ch': 'Camiseta',
    'cc': 'Casaco',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'fa': 'Acessório Facial',
    'ca': 'Acessório Peito',
    'wa': 'Cintura',
    'cp': 'Estampa'
  };
  
  return names[category as keyof typeof names] || category.toUpperCase();
}
