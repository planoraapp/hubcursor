
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FigureMapItem {
  id: string;
  type: string;
  lib: string;
  revision: string;
}

interface FigureDataItem {
  id: string;
  gender: 'M' | 'F' | 'U';
  club: '0' | '1' | '2';
  colorable: '0' | '1';
  sellable: '0' | '1';
  preselectable: '0' | '1';
  selectable: '0' | '1';
}

interface ColorPalette {
  id: string;
  index: number;
  club: '0' | '1' | '2';
  hex: string;
}

interface ProcessedClothingItem {
  id: string;
  category: string;
  name: string;
  gender: 'M' | 'F' | 'U';
  club: 'normal' | 'hc';
  rarity: 'normal' | 'rare' | 'ltd' | 'nft';
  colorable: boolean;
  sellable: boolean;
  colors: string[];
  swfUrl: string;
  iconUrl: string;
  revision: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'com.br' } = await req.json().catch(() => ({}));
    
    console.log('🚀 [HabboRealAssets] Starting real asset extraction...');
    
    // Step 1: Get current build URL
    const buildUrl = await getCurrentBuildUrl(hotel);
    console.log('📦 [Build] Found build URL:', buildUrl);
    
    // Step 2: Fetch figuremap.xml for complete clothing data
    const figureMapData = await fetchFigureMap(buildUrl);
    console.log('🗺️ [FigureMap] Loaded', Object.keys(figureMapData).length, 'categories');
    
    // Step 3: Fetch figuredata for palettes and metadata
    const { figureData, colorPalettes } = await fetchFigureData(hotel);
    console.log('🎨 [FigureData] Loaded', Object.keys(figureData).length, 'categories and', colorPalettes.length, 'colors');
    
    // Step 4: Fetch furnidata for rarity classification
    const furnidataRarity = await fetchFurnidataRarity(hotel);
    console.log('💎 [Furnidata] Loaded', Object.keys(furnidataRarity).length, 'rarity items');
    
    // Step 5: Process and combine all data
    const processedItems = processAllClothingData({
      figureMapData,
      figureData,
      furnidataRarity,
      buildUrl,
      colorPalettes
    });
    
    console.log('✅ [Processing] Complete! Generated', Object.values(processedItems).flat().length, 'clothing items');
    
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          clothing: processedItems,
          palettes: {
            skin: colorPalettes.filter(c => c.index <= 92 && c.club === '0'), // Palette 1
            hair: colorPalettes.filter(c => c.index >= 93 && c.index <= 185), // Palette 2  
            clothes: colorPalettes.filter(c => c.index >= 186) // Palette 3
          },
          metadata: {
            buildUrl,
            hotel,
            fetchedAt: new Date().toISOString(),
            totalItems: Object.values(processedItems).flat().length
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ [HabboRealAssets] Fatal error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback: true
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function getCurrentBuildUrl(hotel: string): Promise<string> {
  const url = `https://www.habbo.${hotel}/gamedata/external_variables/1`;
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'HabboHub-RealAssets/1.0' },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) throw new Error(`External variables fetch failed: ${response.status}`);
    
    const text = await response.text();
    const flashClientMatch = text.match(/flash\.client\.url=(.+)/);
    
    if (!flashClientMatch) {
      throw new Error('Could not find flash.client.url in external_variables');
    }
    
    let buildUrl = flashClientMatch[1].trim();
    if (!buildUrl.endsWith('/')) buildUrl += '/';
    
    return buildUrl;
    
  } catch (error) {
    console.warn('⚠️ [Build] Failed to get build URL, using fallback');
    return 'https://images.habbo.com/gordon/PRODUCTION/';
  }
}

async function fetchFigureMap(buildUrl: string): Promise<Record<string, FigureMapItem[]>> {
  const figuremapUrl = `${buildUrl}figuremap.xml`;
  
  try {
    const response = await fetch(figuremapUrl, {
      headers: { 'User-Agent': 'HabboHub-RealAssets/1.0' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) throw new Error(`Figuremap fetch failed: ${response.status}`);
    
    const xmlText = await response.text();
    return parseFigureMapXML(xmlText);
    
  } catch (error) {
    console.error('❌ [FigureMap] Error fetching figuremap:', error);
    return {};
  }
}

function parseFigureMapXML(xmlText: string): Record<string, FigureMapItem[]> {
  const figureMap: Record<string, FigureMapItem[]> = {};
  
  try {
    // Extract all <lib> elements
    const libMatches = xmlText.match(/<lib[^>]*id="([^"]*)"[^>]*revision="([^"]*)"[^>]*>(.*?)<\/lib>/gs);
    
    if (!libMatches) return figureMap;
    
    for (const libMatch of libMatches) {
      const libIdMatch = libMatch.match(/id="([^"]*)"/);
      const revisionMatch = libMatch.match(/revision="([^"]*)"/);
      
      if (!libIdMatch || !revisionMatch) continue;
      
      const libId = libIdMatch[1];
      const revision = revisionMatch[1];
      
      // Extract parts within this lib
      const partMatches = libMatch.match(/<part[^>]*id="([^"]*)"[^>]*type="([^"]*)"[^>]*\/>/g);
      
      if (partMatches) {
        for (const partMatch of partMatches) {
          const partIdMatch = partMatch.match(/id="([^"]*)"/);
          const typeMatch = partMatch.match(/type="([^"]*)"/);
          
          if (partIdMatch && typeMatch) {
            const partId = partIdMatch[1];
            const type = typeMatch[1];
            
            if (!figureMap[type]) {
              figureMap[type] = [];
            }
            
            figureMap[type].push({
              id: partId,
              type,
              lib: libId,
              revision
            });
          }
        }
      }
    }
    
    return figureMap;
    
  } catch (error) {
    console.error('❌ [Parser] Error parsing figuremap XML:', error);
    return {};
  }
}

async function fetchFigureData(hotel: string): Promise<{
  figureData: Record<string, FigureDataItem[]>;
  colorPalettes: ColorPalette[];
}> {
  const figuredataUrl = `https://www.habbo.${hotel}/gamedata/figuredata/1`;
  
  try {
    const response = await fetch(figuredataUrl, {
      headers: { 'User-Agent': 'HabboHub-RealAssets/1.0' },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) throw new Error(`Figuredata fetch failed: ${response.status}`);
    
    const xmlText = await response.text();
    return parseFigureDataXML(xmlText);
    
  } catch (error) {
    console.error('❌ [FigureData] Error fetching figuredata:', error);
    return { figureData: {}, colorPalettes: [] };
  }
}

function parseFigureDataXML(xmlText: string): {
  figureData: Record<string, FigureDataItem[]>;
  colorPalettes: ColorPalette[];
} {
  const figureData: Record<string, FigureDataItem[]> = {};
  const colorPalettes: ColorPalette[] = [];
  
  try {
    // Parse sets (clothing categories)
    const setMatches = xmlText.match(/<set[^>]*type="([^"]*)"[^>]*>(.*?)<\/set>/gs);
    
    if (setMatches) {
      for (const setMatch of setMatches) {
        const typeMatch = setMatch.match(/type="([^"]*)"/);
        if (!typeMatch) continue;
        
        const setType = typeMatch[1];
        figureData[setType] = [];
        
        const partMatches = setMatch.match(/<part[^>]*id="([^"]*)"[^>]*>/g);
        
        if (partMatches) {
          for (const partMatch of partMatches) {
            const idMatch = partMatch.match(/id="([^"]*)"/);
            const genderMatch = partMatch.match(/gender="([^"]*)"/);
            const clubMatch = partMatch.match(/club="([^"]*)"/);
            const colorableMatch = partMatch.match(/colorable="([^"]*)"/);
            const sellableMatch = partMatch.match(/sellable="([^"]*)"/);
            const preselectableMatch = partMatch.match(/preselectable="([^"]*)"/);
            const selectableMatch = partMatch.match(/selectable="([^"]*)"/);
            
            if (idMatch) {
              figureData[setType].push({
                id: idMatch[1],
                gender: (genderMatch?.[1] as 'M' | 'F' | 'U') || 'U',
                club: (clubMatch?.[1] as '0' | '1' | '2') || '0',
                colorable: (colorableMatch?.[1] as '0' | '1') || '0',
                sellable: (sellableMatch?.[1] as '0' | '1') || '0',
                preselectable: (preselectableMatch?.[1] as '0' | '1') || '0',
                selectable: (selectableMatch?.[1] as '0' | '1') || '0'
              });
            }
          }
        }
      }
    }
    
    // Parse color palettes
    const paletteMatches = xmlText.match(/<palette[^>]*id="([^"]*)"[^>]*>(.*?)<\/palette>/gs);
    
    if (paletteMatches) {
      for (const paletteMatch of paletteMatches) {
        const colorMatches = paletteMatch.match(/<color[^>]*id="([^"]*)"[^>]*>/g);
        
        if (colorMatches) {
          for (let i = 0; i < colorMatches.length; i++) {
            const colorMatch = colorMatches[i];
            const idMatch = colorMatch.match(/id="([^"]*)"/);
            const clubMatch = colorMatch.match(/club="([^"]*)"/);
            
            if (idMatch) {
              colorPalettes.push({
                id: idMatch[1],
                index: i,
                club: (clubMatch?.[1] as '0' | '1' | '2') || '0',
                hex: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` // Placeholder
              });
            }
          }
        }
      }
    }
    
    return { figureData, colorPalettes };
    
  } catch (error) {
    console.error('❌ [Parser] Error parsing figuredata XML:', error);
    return { figureData: {}, colorPalettes: [] };
  }
}

async function fetchFurnidataRarity(hotel: string): Promise<Record<string, string>> {
  const furnidataUrl = `https://www.habbo.${hotel}/gamedata/furnidata_json/1`;
  
  try {
    const response = await fetch(furnidataUrl, {
      headers: { 'User-Agent': 'HabboHub-RealAssets/1.0' },
      signal: AbortSignal.timeout(15000)
    });
    
    if (!response.ok) throw new Error(`Furnidata fetch failed: ${response.status}`);
    
    const data = await response.json();
    const rarityMap: Record<string, string> = {};
    
    // Process roomitemtypes for clothing items
    if (data.roomitemtypes?.furnitype) {
      for (const item of data.roomitemtypes.furnitype) {
        if (item.classname?.startsWith('clothing_')) {
          const classname = item.classname;
          
          // Determine rarity based on classname pattern
          if (classname.includes('_ltd')) {
            rarityMap[classname] = 'ltd';
          } else if (classname.includes('_r')) {
            rarityMap[classname] = 'rare';
          } else if (item.furniline?.includes('nft')) {
            rarityMap[classname] = 'nft';
          } else {
            rarityMap[classname] = 'normal';
          }
        }
      }
    }
    
    return rarityMap;
    
  } catch (error) {
    console.error('❌ [Furnidata] Error fetching furnidata:', error);
    return {};
  }
}

function processAllClothingData({
  figureMapData,
  figureData,
  furnidataRarity,
  buildUrl,
  colorPalettes
}: {
  figureMapData: Record<string, FigureMapItem[]>;
  figureData: Record<string, FigureDataItem[]>;
  furnidataRarity: Record<string, string>;
  buildUrl: string;
  colorPalettes: ColorPalette[];
}): Record<string, ProcessedClothingItem[]> {
  const processedItems: Record<string, ProcessedClothingItem[]> = {};
  
  // Process each category
  for (const [category, mapItems] of Object.entries(figureMapData)) {
    if (!mapItems || mapItems.length === 0) continue;
    
    processedItems[category] = [];
    const figureDataForCategory = figureData[category] || [];
    
    for (const mapItem of mapItems) {
      // Find corresponding figuredata
      const figureDataItem = figureDataForCategory.find(fd => fd.id === mapItem.id);
      
      if (!figureDataItem) continue;
      
      // Determine rarity from furnidata
      const libName = mapItem.lib.toLowerCase();
      let rarity = 'normal';
      
      for (const [classname, rarityType] of Object.entries(furnidataRarity)) {
        if (classname.includes(libName) || libName.includes(classname.replace('clothing_', ''))) {
          rarity = rarityType;
          break;
        }
      }
      
      // Determine available colors based on category
      const availableColors = getColorsForCategory(category, colorPalettes);
      
      const processedItem: ProcessedClothingItem = {
        id: mapItem.id,
        category,
        name: `${category.toUpperCase()}-${mapItem.id}`,
        gender: figureDataItem.gender,
        club: figureDataItem.club === '2' ? 'hc' : 'normal',
        rarity: rarity as 'normal' | 'rare' | 'ltd' | 'nft',
        colorable: figureDataItem.colorable === '1',
        sellable: figureDataItem.sellable === '1',
        colors: availableColors,
        swfUrl: `${buildUrl}${mapItem.lib}.swf`,
        iconUrl: generateIconUrl(buildUrl, mapItem.lib, mapItem.revision),
        revision: mapItem.revision
      };
      
      processedItems[category].push(processedItem);
    }
  }
  
  return processedItems;
}

function getColorsForCategory(category: string, colorPalettes: ColorPalette[]): string[] {
  // Based on official Habbo palette system
  if (category === 'hd') {
    // Skin colors (palette 1)
    return colorPalettes.filter(c => c.index <= 92).map(c => c.id);
  } else if (category === 'hr') {
    // Hair colors (palette 2)  
    return colorPalettes.filter(c => c.index >= 93 && c.index <= 185).map(c => c.id);
  } else {
    // Clothing colors (palette 3)
    return colorPalettes.filter(c => c.index >= 186).map(c => c.id);
  }
}

function generateIconUrl(buildUrl: string, lib: string, revision: string): string {
  // Try to generate icon URL based on lib name and revision
  return `https://images.habbo.com/dcr/hof_furni/${revision}/${lib}_icon.png`;
}
