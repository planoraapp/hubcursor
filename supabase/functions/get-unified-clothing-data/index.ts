
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ClothingItem {
  id: string;
  category: string;
  figureId: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: boolean;
  colorable: boolean;
  colors: string[];
  thumbnailUrl: string;
  source: 'flash-assets' | 'official';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { category = 'all', gender = 'U', limit = 500 } = await req.json().catch(() => ({}));
    
    console.log(`👔 [UnifiedClothing] Buscando category: ${category}, gender: ${gender}, limit: ${limit}`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar dados oficiais do figuredata
    const { data: figureResponse, error: figureError } = await supabase.functions.invoke('get-habbo-figuredata');
    
    let officialData: Record<string, any[]> = {};
    if (figureResponse?.figureParts && !figureError) {
      officialData = figureResponse.figureParts;
      console.log(`📋 [UnifiedClothing] Dados oficiais carregados: ${Object.keys(officialData).length} categorias`);
    }

    // Buscar arquivos SWF do flash-assets
    const { data: swfFiles, error: swfError } = await supabase.storage
      .from('flash-assets')
      .list('', {
        limit: 3000,
        sortBy: { column: 'name', order: 'asc' }
      });

    let flashItems: ClothingItem[] = [];
    if (swfFiles && !swfError) {
      console.log(`💾 [UnifiedClothing] Encontrados ${swfFiles.length} arquivos SWF`);
      
      flashItems = swfFiles
        .filter(file => file.name.endsWith('.swf'))
        .map(file => parseSwfFile(file.name))
        .filter((item): item is ClothingItem => item !== null);
      
      console.log(`✅ [UnifiedClothing] Processados ${flashItems.length} itens SWF válidos`);
    }

    // Combinar dados oficiais com flash assets
    const allItems: ClothingItem[] = [];

    // Adicionar itens oficiais
    Object.entries(officialData).forEach(([cat, items]) => {
      if (Array.isArray(items)) {
        items.forEach(item => {
          allItems.push({
            id: `official_${cat}_${item.id}`,
            category: cat,
            figureId: item.id,
            name: `${getCategoryName(cat)} ${item.id}`,
            gender: item.gender || 'U',
            club: item.club === '1',
            colorable: item.colorable || false,
            colors: item.colors || ['1'],
            thumbnailUrl: generateOfficialThumbnail(cat, item.id, item.colors?.[0] || '1', item.gender || 'U'),
            source: 'official'
          });
        });
      }
    });

    // Adicionar itens flash assets
    allItems.push(...flashItems);

    // Aplicar filtros
    let filteredItems = allItems;

    if (category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    if (gender !== 'U') {
      filteredItems = filteredItems.filter(item => item.gender === gender || item.gender === 'U');
    }

    // Aplicar limite e ordenar
    filteredItems = filteredItems
      .sort((a, b) => parseInt(a.figureId) - parseInt(b.figureId))
      .slice(0, limit);

    const result = {
      items: filteredItems,
      metadata: {
        source: 'unified',
        officialCount: allItems.filter(i => i.source === 'official').length,
        flashCount: allItems.filter(i => i.source === 'flash-assets').length,
        totalCount: allItems.length,
        filteredCount: filteredItems.length,
        categories: getUniqueCategories(allItems),
        fetchedAt: new Date().toISOString()
      }
    };

    console.log(`🎯 [UnifiedClothing] Retornando ${filteredItems.length} itens unificados`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [UnifiedClothing] Erro fatal:', error);
    
    return new Response(
      JSON.stringify({
        items: [],
        metadata: {
          source: 'error',
          error: error.message,
          fetchedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseSwfFile(filename: string): ClothingItem | null {
  try {
    // Extrair informações do nome do arquivo SWF
    // Exemplo: acc_chest_U_backpack.swf -> categoria: ca, id: backpack, gender: U
    const baseName = filename.replace('.swf', '');
    const parts = baseName.split('_');
    
    if (parts.length < 3) return null;
    
    const [type, bodyPart, gender, ...idParts] = parts;
    const itemId = idParts.join('_');
    
    // Mapear categoria SWF para categoria do editor
    const categoryMap: Record<string, string> = {
      'acc_chest': 'ca',
      'acc_face': 'fa', 
      'acc_head': 'ha',
      'acc_waist': 'wa',
      'hair': 'hr',
      'hat': 'ha',
      'top': 'ch',
      'bottom': 'lg',
      'shoes': 'sh',
      'dress': 'ch'
    };

    const category = categoryMap[`${type}_${bodyPart}`] || 'ca';
    const figureId = generateFigureId(itemId);

    return {
      id: `flash_${category}_${figureId}`,
      category,
      figureId,
      name: `${getCategoryName(category)} ${itemId}`,
      gender: gender as 'M' | 'F' | 'U',
      club: false, // Flash assets são geralmente gratuitos
      colorable: true,
      colors: ['1', '2', '3', '4', '5'], // Cores padrão
      thumbnailUrl: generateFlashThumbnail(category, figureId, '1'),
      source: 'flash-assets'
    };
  } catch (error) {
    console.warn(`⚠️ [UnifiedClothing] Erro ao processar SWF: ${filename}`, error);
    return null;
  }
}

function generateFigureId(itemName: string): string {
  // Gerar ID numérico baseado no nome do item
  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    const char = itemName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash % 9999).toString().padStart(4, '0');
}

function generateOfficialThumbnail(category: string, itemId: string, colorId: string = '1', gender: string = 'U'): string {
  const headOnly = ['hd', 'hr', 'ha', 'ea', 'fa'].includes(category) ? '&headonly=1' : '';
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${colorId}&gender=${gender}&size=l&direction=2&head_direction=3${headOnly}`;
}

function generateFlashThumbnail(category: string, itemId: string, colorId: string = '1'): string {
  // Usar HabboAssets como fallback para flash items
  return `https://habboassets.com/c_images/clothing/${category}/${itemId}_${colorId}.png`;
}

function getCategoryName(category: string): string {
  const names = {
    'hd': 'Rosto',
    'hr': 'Cabelo', 
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'fa': 'Acessório Facial',
    'cc': 'Casaco',
    'ca': 'Acessório Peito',
    'wa': 'Cintura',
    'cp': 'Estampa'
  };
  return names[category as keyof typeof names] || 'Item';
}

function getUniqueCategories(items: ClothingItem[]): string[] {
  return [...new Set(items.map(item => item.category))];
}
