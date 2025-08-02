
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface ClothingAsset {
  id: string;
  name: string;
  category: string;
  gender: 'M' | 'F' | 'U';
  type: string;
  imageUrl: string;
  swfName: string;
  figureId: string;
  club: 'HC' | 'FREE';
  colors: string[];
  source: 'official-assets';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 300, category = 'all', search = '' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [FlashAssets] Fetching clothing assets - limit: ${limit}, category: ${category}, search: "${search}"`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // List all files from flash-assets bucket
    const { data: files, error } = await supabase.storage
      .from('flash-assets')
      .list('', {
        limit: 3000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      throw new Error(`Storage error: ${error.message}`);
    }

    console.log(`📁 [FlashAssets] Found ${files?.length || 0} asset files in storage`);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({
          assets: [],
          metadata: { 
            source: 'storage-empty', 
            count: 0,
            fetchedAt: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter and parse clothing assets
    let clothingAssets: ClothingAsset[] = files
      .filter(file => file.name.endsWith('.swf') && (
        file.name.startsWith('acc_') || 
        file.name.startsWith('hair_') || 
        file.name.startsWith('hat_') ||
        file.name.startsWith('face_')
      ))
      .map(file => {
        const parsed = parseAssetFilename(file.name);
        
        return {
          id: `fa_${parsed.category}_${parsed.figureId}`,
          name: generateAssetName(parsed),
          category: parsed.category,
          gender: parsed.gender,
          type: parsed.type,
          imageUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/flash-assets/${file.name}`,
          swfName: file.name.replace('.swf', ''),
          figureId: parsed.figureId,
          club: parsed.club,
          colors: generateDefaultColors(parsed.category),
          source: 'official-assets' as const
        };
      });

    // Apply category filter
    if (category !== 'all') {
      clothingAssets = clothingAssets.filter(asset => asset.category === category);
    }

    // Apply search filter
    if (search) {
      clothingAssets = clothingAssets.filter(asset => 
        asset.name.toLowerCase().includes(search.toLowerCase()) ||
        asset.swfName.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply limit
    clothingAssets = clothingAssets.slice(0, limit);

    const result = {
      assets: clothingAssets,
      metadata: {
        source: 'flash-assets-storage',
        totalFiles: files.length,
        clothingFiles: files.filter(f => f.name.startsWith('acc_') || f.name.startsWith('hair_') || f.name.startsWith('hat_') || f.name.startsWith('face_')).length,
        filteredCount: clothingAssets.length,
        categories: getUniqueCategories(clothingAssets),
        fetchedAt: new Date().toISOString()
      }
    };

    console.log(`✅ [FlashAssets] Returning ${clothingAssets.length} clothing assets from storage`);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [FlashAssets] Error:', error);
    
    return new Response(
      JSON.stringify({
        assets: [],
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

function parseAssetFilename(filename: string): {
  category: string;
  gender: 'M' | 'F' | 'U';
  type: string;
  figureId: string;
  club: 'HC' | 'FREE';
} {
  // Parse filenames like: acc_chest_U_backpack.swf, hair_F_curls.swf, etc.
  const parts = filename.replace('.swf', '').split('_');
  
  if (parts.length < 3) {
    return {
      category: 'ch',
      gender: 'U',
      type: 'clothing',
      figureId: '1',
      club: 'FREE'
    };
  }

  const [prefix, bodyPart, gender, ...nameParts] = parts;
  const itemName = nameParts.join('_');
  
  // Map body parts to standard categories
  const categoryMap: Record<string, string> = {
    'chest': 'ch',
    'head': 'hd', 
    'eye': 'ea',
    'face': 'fa',
    'waist': 'wa',
    'print': 'cp'
  };

  let category = categoryMap[bodyPart] || bodyPart;
  
  // Special handling for hair and hats
  if (prefix === 'hair') category = 'hr';
  if (prefix === 'hat') category = 'ha';
  if (prefix === 'face') category = 'hd';

  // Determine club status based on item name
  const isHC = itemName.toLowerCase().includes('hc') || 
              itemName.toLowerCase().includes('gold') ||
              itemName.toLowerCase().includes('nft');

  return {
    category,
    gender: (gender as 'M' | 'F' | 'U') || 'U',
    type: prefix,
    figureId: extractFigureId(itemName),
    club: isHC ? 'HC' : 'FREE'
  };
}

function extractFigureId(itemName: string): string {
  // Extract numeric ID from item name
  const match = itemName.match(/(\d+)/);
  return match ? match[1] : Math.floor(Math.random() * 100).toString();
}

function generateAssetName(parsed: any): string {
  const typeNames: Record<string, string> = {
    'acc': 'Acessório',
    'hair': 'Cabelo',
    'hat': 'Chapéu', 
    'face': 'Rosto'
  };

  const categoryNames: Record<string, string> = {
    'ch': 'Peito',
    'hd': 'Cabeça',
    'ea': 'Olhos',
    'fa': 'Rosto',
    'wa': 'Cintura',
    'cp': 'Estampa',
    'hr': 'Cabelo',
    'ha': 'Chapéu'
  };

  const typeName = typeNames[parsed.type] || 'Item';
  const categoryName = categoryNames[parsed.category] || parsed.category;
  const genderSuffix = parsed.gender === 'M' ? ' (M)' : parsed.gender === 'F' ? ' (F)' : '';
  const clubSuffix = parsed.club === 'HC' ? ' (HC)' : '';

  return `${typeName} ${categoryName} ${parsed.figureId}${genderSuffix}${clubSuffix}`;
}

function generateDefaultColors(category: string): string[] {
  // Generate realistic color arrays based on category
  const colorSets: Record<string, string[]> = {
    'hr': ['45', '61', '1', '92', '104'], // Hair colors
    'hd': ['1', '2', '3', '4', '5'], // Skin tones
    'ch': ['1', '92', '61', '106', '143'], // Clothing colors
    'ha': ['61', '92', '1', '102'], // Hat colors
    'ea': ['1', '2', '3'], // Eye accessory colors
    'fa': ['1', '2', '3'], // Face colors
    'wa': ['61', '92', '1'], // Waist colors
    'cp': ['1', '92', '61'] // Print colors
  };
  
  return colorSets[category] || ['1', '2', '3', '4'];
}

function getUniqueCategories(assets: ClothingAsset[]): string[] {
  return [...new Set(assets.map(asset => asset.category))];
}
