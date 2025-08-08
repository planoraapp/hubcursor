
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface FlashAssetItem {
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
  source: 'flash-assets';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { limit = 300, category = 'all', search = '' } = await req.json().catch(() => ({}));
    
    console.log(`🎯 [FlashAssetsClothing] Fetching assets - limit: ${limit}, category: ${category}, search: "${search}"`);
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // List all SWF files from flash-assets bucket
    const { data: files, error } = await supabase.storage
      .from('flash-assets')
      .list('', {
        limit: 5000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ [FlashAssetsClothing] Storage error:', error);
      throw error;
    }

    if (!files || files.length === 0) {
      console.log('⚠️ [FlashAssetsClothing] No files found in flash-assets bucket');
      return new Response(
        JSON.stringify({ assets: [], metadata: { totalCount: 0, source: 'flash-assets' } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📁 [FlashAssetsClothing] Found ${files.length} files in bucket`);

    // Process SWF files into clothing items
    const assets: FlashAssetItem[] = [];
    
    for (const file of files) {
      if (!file.name.endsWith('.swf')) continue;
      
      const parsed = parseSWFFilename(file.name);
      if (!parsed) continue;

      // Apply category filter
      if (category !== 'all' && parsed.category !== category) continue;
      
      // Apply search filter
      if (search && !parsed.name.toLowerCase().includes(search.toLowerCase()) && 
          !parsed.figureId.includes(search)) continue;

      assets.push(parsed);
      
      if (assets.length >= limit) break;
    }

    const result = {
      assets,
      metadata: {
        totalCount: assets.length,
        totalFiles: files.length,
        source: 'flash-assets',
        fetchedAt: new Date().toISOString(),
        filters: { category, search, limit }
      }
    };

    console.log(`✅ [FlashAssetsClothing] Returning ${assets.length} processed assets`);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [FlashAssetsClothing] Fatal error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        assets: [],
        metadata: { source: 'error-fallback' }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function parseSWFFilename(filename: string): FlashAssetItem | null {
  try {
    const baseName = filename.replace('.swf', '');
    
    // Extract category from filename patterns
    const category = extractCategoryFromFilename(baseName);
    if (!category) return null;
    
    // Extract figure ID
    const figureId = extractFigureId(baseName);
    
    // Extract gender
    const gender = extractGender(baseName);
    
    // Generate colors based on category
    const colors = generateColorsForCategory(category);
    
    // Determine club status
    const club = baseName.toLowerCase().includes('hc') || 
                 baseName.toLowerCase().includes('club') ? 'HC' : 'FREE';
    
    return {
      id: `flash_${category}_${figureId}`,
      name: formatItemName(baseName, category),
      category,
      gender,
      type: 'clothing',
      imageUrl: generateThumbnailUrl(category, figureId, colors[0]),
      swfName: filename,
      figureId,
      club,
      colors,
      source: 'flash-assets'
    };
  } catch (error) {
    console.warn(`⚠️ [FlashAssetsClothing] Error parsing ${filename}:`, error);
    return null;
  }
}

function extractCategoryFromFilename(filename: string): string | null {
  const lowerName = filename.toLowerCase();
  
  // Category mapping based on common SWF naming patterns
  const categoryPatterns = {
    'hr': ['hair', 'hr_'],
    'hd': ['head', 'hd_', 'face'],
    'ch': ['shirt', 'top', 'ch_', 'chest'],
    'lg': ['pants', 'trousers', 'lg_', 'legs'],
    'sh': ['shoes', 'sh_', 'foot'],
    'ha': ['hat', 'ha_', 'head_acc'],
    'ea': ['glasses', 'ea_', 'eye'],
    'cc': ['coat', 'jacket', 'cc_'],
    'ca': ['chest_acc', 'ca_', 'accessory'],
    'wa': ['waist', 'belt', 'wa_'],
    'cp': ['print', 'cp_'],
    'fa': ['face_acc', 'fa_']
  };
  
  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => lowerName.includes(pattern))) {
      return category;
    }
  }
  
  // Default fallback based on position patterns
  if (lowerName.includes('_m_') || lowerName.includes('_f_')) {
    const parts = lowerName.split('_');
    if (parts.length >= 2) {
      const potentialCategory = parts[0];
      if (['hr', 'hd', 'ch', 'lg', 'sh', 'ha', 'ea', 'cc', 'ca', 'wa', 'cp', 'fa'].includes(potentialCategory)) {
        return potentialCategory;
      }
    }
  }
  
  return 'ch'; // Default to shirt
}

function extractFigureId(filename: string): string {
  // Try to extract numeric ID from filename
  const numbers = filename.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    // Return the largest number found (usually the item ID)
    return numbers.sort((a, b) => parseInt(b) - parseInt(a))[0];
  }
  
  // Generate hash-based ID if no numbers found
  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    const char = filename.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash % 9999).toString();
}

function extractGender(filename: string): 'M' | 'F' | 'U' {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('_m_') || lowerName.includes('male')) return 'M';
  if (lowerName.includes('_f_') || lowerName.includes('female')) return 'F';
  if (lowerName.includes('dress') || lowerName.includes('skirt')) return 'F';
  
  return 'U'; // Unisex by default
}

function generateColorsForCategory(category: string): string[] {
  const colorSets: Record<string, string[]> = {
    'hd': ['1', '2', '3', '4', '5', '6'], // Skin tones
    'hr': ['1', '2', '3', '4', '5', '45', '61', '92', '104'], // Hair colors
    'ch': ['1', '2', '3', '4', '5', '61', '92', '100', '101', '102'], // Varied clothing
    'cc': ['1', '2', '3', '4', '61', '92', '100'],
    'lg': ['1', '2', '3', '4', '5', '61', '92', '100'],
    'sh': ['1', '2', '3', '4', '61', '92'],
    'ha': ['1', '2', '3', '4', '61', '92'],
    'ea': ['1', '2', '3', '4'],
    'ca': ['1', '61', '92', '100'],
    'cp': ['1', '2', '3', '4', '5'],
    'wa': ['1', '61', '92'],
    'fa': ['1', '2', '3', '4']
  };
  
  return colorSets[category] || ['1', '2', '3', '4', '5'];
}

function formatItemName(filename: string, category: string): string {
  const categoryNames = {
    'hd': 'Rosto',
    'hr': 'Cabelo',
    'ch': 'Camiseta',
    'lg': 'Calça',
    'sh': 'Sapato',
    'ha': 'Chapéu',
    'ea': 'Óculos',
    'cc': 'Casaco',
    'ca': 'Acessório',
    'cp': 'Estampa',
    'wa': 'Cintura',
    'fa': 'Rosto Acessório'
  };
  
  const baseName = filename.replace(/\.swf$/, '').replace(/_/g, ' ');
  return `${categoryNames[category as keyof typeof categoryNames]} ${baseName.slice(-10)}`;
}

function generateThumbnailUrl(category: string, figureId: string, colorId: string): string {
  // Use Habbo's official imaging service for thumbnails
  const headOnly = ['hd', 'hr', 'ha', 'ea', 'fa'].includes(category) ? '&headonly=1' : '';
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${category}-${figureId}-${colorId}&gender=U&direction=2&head_direction=2&size=l${headOnly}`;
}
