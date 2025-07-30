
import { serve } from 'https://deno.land/std@0.178.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const HABBO_ASSETS_API = 'https://www.habboassets.com/api';
const CACHE_DURATION_HOURS = 24;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

console.log('Function `get-habbo-figures` up and running with HabboAssets integration!');

// Mapping dos prefixos dos arquivos SWF para tipos do Habbo
const swfTypeMapping: { [key: string]: string } = {
  'hair_': 'hr',
  'hat_': 'he',
  'shirt_': 'ch',
  'jacket_': 'cc',
  'trousers_': 'lg',
  'shoes_': 'sh',
  'acc_head_': 'ha',
  'acc_eye_': 'ea',
  'acc_face_': 'fa',
  'acc_chest_': 'ca',
  'acc_waist_': 'wa',
  'dress_': 'cc',
  'skirt_': 'lg'
};

// Cores padrão do Habbo baseadas no sistema oficial
const defaultColors = [
  { id: '1', hex: '#F5DA88', name: 'Pele Clara' },
  { id: '2', hex: '#FFDBC1', name: 'Pele Rosa' },
  { id: '3', hex: '#FFCB98', name: 'Pele Bronzeada' },
  { id: '4', hex: '#F4AC54', name: 'Pele Dourada' },
  { id: '45', hex: '#CA8154', name: 'Pele Morena' },
  { id: '61', hex: '#000000', name: 'Preto' },
  { id: '62', hex: '#282828', name: 'Cinza Escuro' },
  { id: '63', hex: '#828282', name: 'Cinza' },
  { id: '92', hex: '#FFFFFF', name: 'Branco' },
  { id: '100', hex: '#E3AE7D', name: 'Bege' },
  { id: '101', hex: '#C99263', name: 'Marrom Claro' },
  { id: '102', hex: '#AE7748', name: 'Marrom' },
  { id: '103', hex: '#945C2F', name: 'Marrom Escuro' },
  { id: '104', hex: '#FFC680', name: 'Laranja Claro' },
  { id: '105', hex: '#DC9B4C', name: 'Laranja' },
  { id: '150', hex: '#FF7575', name: 'Vermelho Claro' },
  { id: '151', hex: '#FF5757', name: 'Vermelho' },
  { id: '152', hex: '#BC576A', name: 'Vermelho Escuro' }
];

function parseSwfFilename(filename: string) {
  // Remove extensão .swf
  const name = filename.replace('.swf', '');
  
  // Determinar tipo baseado no prefixo
  let type = 'ch'; // default para tops
  let gender = 'U'; // Universal por padrão
  let itemName = name;
  
  // Encontrar tipo baseado no prefixo
  for (const [prefix, habboType] of Object.entries(swfTypeMapping)) {
    if (name.startsWith(prefix)) {
      type = habboType;
      itemName = name.substring(prefix.length);
      break;
    }
  }
  
  // Detectar gênero baseado no padrão _M_ ou _F_
  if (name.includes('_M_') || name.endsWith('_M')) {
    gender = 'M';
  } else if (name.includes('_F_') || name.endsWith('_F')) {
    gender = 'F';
  }
  
  // Detectar categoria baseada em padrões no nome
  let category = 'NORMAL';
  if (name.includes('nft') || name.toLowerCase().includes('nft')) {
    category = 'NFT';
  } else if (name.includes('hc') || name.toLowerCase().includes('loyalty')) {
    category = 'HC';
  }
  
  // Gerar nome amigável
  const friendlyName = itemName
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
  
  return {
    type,
    gender,
    category,
    name: friendlyName || 'Item sem nome',
    originalName: name
  };
}

function generateItemId(filename: string): string {
  // Gerar um ID numérico baseado no hash do nome do arquivo
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking cache for recent data...');

    // Check cache first
    const { data: cacheData, error: cacheError } = await supabase
      .from('habbo_figures_cache')
      .select('data, created_at')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!cacheError && cacheData) {
      console.log('Cache hit! Returning cached data from:', cacheData.created_at);
      return new Response(JSON.stringify(cacheData.data), {
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-Cache': 'HIT'
        },
        status: 200,
      });
    }

    console.log('Cache miss or expired. Fetching fresh data from HabboAssets...');

    // Fetch data from HabboAssets API
    const response = await fetch(`${HABBO_ASSETS_API}/clothing`);
    if (!response.ok) {
      throw new Error(`Failed to fetch clothing data: ${response.status} ${response.statusText}`);
    }
    
    const clothingData = await response.json();
    console.log(`Fetched ${clothingData.length} clothing items from HabboAssets`);

    const figureParts: { [key: string]: any[] } = {};
    
    // Process each clothing item
    clothingData.forEach((item: any) => {
      const filename = item.name || item.filename;
      if (!filename) return;
      
      const parsedItem = parseSwfFilename(filename);
      const itemId = generateItemId(filename);
      
      // Initialize category if not exists
      if (!figureParts[parsedItem.type]) {
        figureParts[parsedItem.type] = [];
      }
      
      // Generate colors for this item (simulate Habbo's color system)
      const availableColors = defaultColors.slice(0, Math.floor(Math.random() * 8) + 3).map(color => color.id);
      
      // Generate preview URL using Habbo's imaging system
      const baseFigure = parsedItem.gender === 'F' 
        ? 'hd-180-1.hr-828-42.ch-665-92.lg-700-1.sh-705-1'
        : 'hd-180-1.hr-3791-45.ch-3030-61.lg-3138-61.sh-905-61';
      
      const figureString = `${baseFigure}.${parsedItem.type}-${itemId}-${availableColors[0]}`;
      const previewUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&gender=${parsedItem.gender}&direction=2&head_direction=3&action=std&gesture=std&size=s&img_format=png`;
      
      figureParts[parsedItem.type].push({
        id: itemId,
        type: parsedItem.category,
        name: parsedItem.name,
        gender: parsedItem.gender,
        club: parsedItem.category === 'HC',
        sellable: parsedItem.category !== 'NORMAL',
        colors: availableColors,
        previewUrl: previewUrl,
        originalFilename: filename
      });
    });

    console.log(`Processed figure parts for ${Object.keys(figureParts).length} categories`);

    const responseData = {
      figureParts: figureParts,
      colors: defaultColors
    };

    // Save to cache
    console.log('Saving fresh data to cache...');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    const { error: insertError } = await supabase
      .from('habbo_figures_cache')
      .insert({
        data: responseData,
        expires_at: expiresAt.toISOString()
      });

    if (insertError) {
      console.warn('Failed to save to cache:', insertError);
    } else {
      console.log('Data saved to cache successfully');
    }

    // Clean up old cache entries
    const { error: deleteError } = await supabase
      .from('habbo_figures_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (deleteError) {
      console.warn('Failed to clean old cache entries:', deleteError);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'MISS'
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error in get-habbo-figures function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal Server Error',
      details: 'Failed to fetch or parse HabboAssets clothing data'
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500,
    });
  }
});
