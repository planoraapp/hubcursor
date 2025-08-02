
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

    let allItems: ClothingItem[] = [];

    // PRIORITY 1: Buscar dados oficiais do figuredata
    try {
      const { data: figureResponse, error: figureError } = await supabase.functions.invoke('get-habbo-figuredata');
      
      if (figureResponse?.figureParts && !figureError) {
        console.log(`📋 [UnifiedClothing] Dados oficiais carregados: ${Object.keys(figureResponse.figureParts).length} categorias`);
        
        // Processar dados oficiais
        Object.entries(figureResponse.figureParts).forEach(([cat, items]: [string, any]) => {
          if (Array.isArray(items) && isValidCategory(cat)) {
            items.forEach((item: any) => {
              allItems.push({
                id: `official_${cat}_${item.id}`,
                category: cat,
                figureId: item.id,
                name: `${getCategoryName(cat)} ${item.id}`,
                gender: item.gender || 'U',
                club: item.club === '1',
                colorable: item.colorable || false,
                colors: item.colors || ['1'],
                thumbnailUrl: generateOfficialThumbnail(cat, item.id, item.colors?.[0] || '1', item.gender || gender),
                source: 'official'
              });
            });
          }
        });
      }
    } catch (figureErr) {
      console.warn('⚠️ [UnifiedClothing] Erro ao buscar figuredata:', figureErr);
    }

    // PRIORITY 2: Buscar arquivos SWF do flash-assets
    try {
      const { data: swfFiles, error: swfError } = await supabase.storage
        .from('flash-assets')
        .list('', {
          limit: 3000,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (swfFiles && !swfError) {
        console.log(`💾 [UnifiedClothing] Encontrados ${swfFiles.length} arquivos SWF`);
        
        const flashItems = swfFiles
          .filter(file => file.name.endsWith('.swf'))
          .map(file => parseSwfFile(file.name))
          .filter((item): item is ClothingItem => item !== null);
        
        allItems.push(...flashItems);
        console.log(`✅ [UnifiedClothing] Processados ${flashItems.length} itens SWF válidos`);
      }
    } catch (swfErr) {
      console.warn('⚠️ [UnifiedClothing] Erro ao buscar SWF files:', swfErr);
    }

    // FALLBACK: Se não temos dados, gerar dados básicos para teste
    if (allItems.length === 0) {
      console.log('🔄 [UnifiedClothing] Gerando dados de fallback');
      allItems = generateFallbackClothing();
    }

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
      .sort((a, b) => {
        // Priorizar itens oficiais
        if (a.source !== b.source) {
          return a.source === 'official' ? -1 : 1;
        }
        return parseInt(a.figureId) - parseInt(b.figureId);
      })
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
    
    // Fallback final com dados básicos
    const fallbackItems = generateFallbackClothing();
    
    return new Response(
      JSON.stringify({
        items: fallbackItems,
        metadata: {
          source: 'fallback',
          error: error.message,
          totalCount: fallbackItems.length,
          fetchedAt: new Date().toISOString()
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function isValidCategory(category: string): boolean {
  const validCategories = ['hd', 'hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'fa', 'cc', 'ca', 'wa', 'cp'];
  return validCategories.includes(category);
}

function parseSwfFile(filename: string): ClothingItem | null {
  try {
    // Extrair informações do nome do arquivo SWF
    const baseName = filename.replace('.swf', '');
    const parts = baseName.split('_');
    
    if (parts.length < 3) return null;
    
    const [type, bodyPart, gender, ...idParts] = parts;
    const itemId = idParts.join('_') || Math.floor(Math.random() * 1000).toString();
    
    // Mapear categoria SWF para categoria do editor
    const categoryMap: Record<string, string> = {
      'acc_chest': 'ca',
      'acc_face': 'fa', 
      'acc_head': 'ha',
      'acc_waist': 'wa',
      'hair': 'hr',
      'hat': 'ha',
      'top': 'ch',
      'shirt': 'ch',
      'bottom': 'lg',
      'pants': 'lg',
      'shoes': 'sh',
      'dress': 'ch'
    };

    const category = categoryMap[`${type}_${bodyPart}`] || getDefaultCategory(type, bodyPart);
    const figureId = generateFigureId(itemId);

    return {
      id: `flash_${category}_${figureId}`,
      category,
      figureId,
      name: `${getCategoryName(category)} ${itemId}`,
      gender: (gender as 'M' | 'F' | 'U') || 'U',
      club: false,
      colorable: true,
      colors: ['1', '2', '3', '4', '5'],
      thumbnailUrl: generateFlashThumbnail(category, figureId, '1'),
      source: 'flash-assets'
    };
  } catch (error) {
    console.warn(`⚠️ [UnifiedClothing] Erro ao processar SWF: ${filename}`, error);
    return null;
  }
}

function getDefaultCategory(type: string, bodyPart: string): string {
  if (type === 'hair' || bodyPart === 'hair') return 'hr';
  if (type === 'hat' || bodyPart === 'hat') return 'ha';
  if (type === 'top' || type === 'shirt') return 'ch';
  if (type === 'bottom' || type === 'pants') return 'lg';
  if (type === 'shoes') return 'sh';
  if (type === 'acc') {
    if (bodyPart === 'chest') return 'ca';
    if (bodyPart === 'face') return 'fa';
    if (bodyPart === 'head') return 'ha';
    if (bodyPart === 'waist') return 'wa';
  }
  return 'ch'; // default to shirt
}

function generateFigureId(itemName: string): string {
  // Gerar ID numérico baseado no nome do item
  let hash = 0;
  for (let i = 0; i < itemName.length; i++) {
    const char = itemName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash % 9999).toString();
}

function generateOfficialThumbnail(category: string, itemId: string, colorId: string = '1', gender: string = 'U'): string {
  const headOnly = ['hd', 'hr', 'ha', 'ea', 'fa'].includes(category) ? '&headonly=1' : '';
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${itemId}-${colorId}&gender=${gender}&size=l&direction=2&head_direction=3${headOnly}`;
}

function generateFlashThumbnail(category: string, itemId: string, colorId: string = '1'): string {
  return `https://habboassets.com/c_images/clothing/${category}/${itemId}_${colorId}.png`;
}

function generateFallbackClothing(): ClothingItem[] {
  const categories = ['hd', 'hr', 'ch', 'lg', 'sh'];
  const fallbackItems: ClothingItem[] = [];
  
  categories.forEach(cat => {
    for (let i = 1; i <= 20; i++) {
      fallbackItems.push({
        id: `fallback_${cat}_${i}`,
        category: cat,
        figureId: i.toString(),
        name: `${getCategoryName(cat)} ${i}`,
        gender: 'U',
        club: false,
        colorable: true,
        colors: ['1', '2', '3', '4', '5'],
        thumbnailUrl: generateOfficialThumbnail(cat, i.toString(), '1', 'U'),
        source: 'official'
      });
    }
  });
  
  return fallbackItems;
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
