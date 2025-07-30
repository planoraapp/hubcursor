
import { serve } from 'https://deno.land/std@0.178.0/http/server.ts';
import { DOMParser } from 'https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts';

const FIGURE_DATA_URL = 'https://www.habbo.com/gamedata/figuredata/1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

console.log('Function `get-habbo-figures` up and running!');

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching figure data from Habbo...');
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

    return new Response(JSON.stringify(responseData), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 200,
    });

  } catch (error) {
    console.error('Error fetching or parsing Habbo figure data:', error);
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
