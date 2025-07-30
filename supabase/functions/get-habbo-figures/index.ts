
import { serve } from 'https://deno.land/std@0.178.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts';

const FIGURE_DATA_URL = 'https://www.habbo.com/gamedata/figuredata/1';
const CACHE_DURATION_HOURS = 24;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

console.log('Function `get-habbo-figures` up and running with cache!');

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

    console.log('Cache miss or expired. Fetching fresh data from Habbo...');

    // Fetch fresh data from Habbo
    const response = await fetch(FIGURE_DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch figure data: ${response.status} ${response.statusText}`);
    }
    const xmlText = await response.text();
    console.log('Figure data fetched successfully, parsing XML...');

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'text/xml');

    if (!doc) {
      throw new Error('Failed to parse XML from figuredata.');
    }

    const figureParts: { [key: string]: any[] } = {};
    const colorsData: { id: string; hex: string; name: string }[] = [];
    const paletteMap: { [id: string]: { value: string; name: string } } = {};

    // Parse colors first
    doc.querySelectorAll('palette').forEach(palette => {
      palette.querySelectorAll('color').forEach(color => {
        const colorId = color.getAttribute('id') || '';
        const colorValue = color.getAttribute('value') || '';
        const colorName = color.getAttribute('name') || '';
        
        if (colorId && colorValue) {
          colorsData.push({ id: colorId, hex: colorValue, name: colorName });
          paletteMap[colorId] = { value: colorValue, name: colorName };
        }
      });
    });

    console.log(`Parsed ${colorsData.length} colors`);

    // Parse figure parts
    doc.querySelectorAll('settype').forEach(setType => {
      const type = setType.getAttribute('type') || '';
      if (!figureParts[type]) {
        figureParts[type] = [];
      }

      setType.querySelectorAll('set').forEach(set => {
        const id = set.getAttribute('id') || '';
        const gender = set.getAttribute('gender') || 'U';
        const club = set.getAttribute('club') === '1';
        const sellable = set.getAttribute('sellable') === '1';
        const asset = set.getAttribute('asset') || '';

        let name = `${type}-${id}`;
        if (asset) {
          name = asset.replace(/_/g, ' ').replace(/-/g, ' ').trim();
          name = name.charAt(0).toUpperCase() + name.slice(1);
        }

        // Get compatible colors
        const compatibleColorIds: string[] = [];
        set.querySelectorAll('part').forEach(part => {
          part.querySelectorAll('colorable > colorindex').forEach(colorIndex => {
            const indexId = colorIndex.getAttribute('id');
            if (indexId && paletteMap[indexId]) {
              if (!compatibleColorIds.includes(indexId)) {
                compatibleColorIds.push(indexId);
              }
            }
          });
        });

        // Add default colors if none found
        if (compatibleColorIds.length === 0) {
          compatibleColorIds.push('1', '61', '45', '42', '95', '100');
        }

        // Generate preview URL
        const baseFigureM = 'hd-180-1.ch-3030-1.lg-3138-1.sh-905-1';
        const baseFigureF = 'hd-180-1.ch-665-1.lg-700-1.sh-705-1';
        const baseFigureForPreview = gender === 'M' ? baseFigureM : baseFigureF;

        const defaultPreviewColor = compatibleColorIds.length > 0 ? compatibleColorIds[0] : '1';
        const figurePartWithDefaultColor = `${type}-${id}-${defaultPreviewColor}`;

        let tempFigure = baseFigureForPreview;
        const partPrefixRegex = new RegExp(`(^|\\.)(${type}-\\d+(?:-\\d+)?)(?=\\.|$)`);
        if (tempFigure.match(partPrefixRegex)) {
          tempFigure = tempFigure.replace(partPrefixRegex, `$1${figurePartWithDefaultColor}`);
        } else {
          tempFigure += (tempFigure.length > 0 ? '.' : '') + figurePartWithDefaultColor;
        }

        const previewUrl = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${tempFigure}&gender=${gender}&direction=2&head_direction=3&action=std&gesture=std&size=s&img_format=png`;

        // Determine item type for categorization
        let itemType = 'NORMAL';
        if (club) itemType = 'HC';
        else if (sellable) itemType = 'SELLABLE';

        figureParts[type].push({
          id: id,
          type: itemType,
          name: name,
          gender: gender,
          club: club,
          sellable: sellable,
          colors: compatibleColorIds,
          previewUrl: previewUrl
        });
      });
    });

    console.log(`Parsed figure parts for ${Object.keys(figureParts).length} categories`);

    const responseData = {
      figureParts: figureParts,
      colors: colorsData
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
      details: 'Failed to fetch or parse Habbo figure data'
    }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 500,
    });
  }
});
