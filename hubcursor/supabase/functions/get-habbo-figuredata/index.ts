
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [FigureData] Fetching official Habbo figuredata with colors...');
    
    // Try multiple Habbo hotels for figuredata
    const figuredataUrls = [
      'https://www.habbo.com.br/gamedata/figuredata/1',
      'https://www.habbo.com/gamedata/figuredata/1',
      'https://www.habbo.es/gamedata/figuredata/1'
    ];
    
    let xmlData = null;
    let usedUrl = null;
    
    for (const url of figuredataUrls) {
      try {
        console.log(`🌐 [FigureData] Trying URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/xml, application/xml, */*',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (response.ok) {
          xmlData = await response.text();
          usedUrl = url;
          console.log(`✅ [FigureData] Successfully fetched from: ${url}`);
          break;
        } else {
          console.warn(`⚠️ [FigureData] Failed to fetch from ${url}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ [FigureData] Error with ${url}:`, error.message);
      }
    }
    
    if (!xmlData) {
      throw new Error('Could not fetch figuredata from any source');
    }
    
    console.log(`📄 [FigureData] Processing XML data (${xmlData.length} characters)`);
    
    // Parse XML and convert to structured JSON with colors
    const { figureData, colorPalettes } = await parseXMLToJSONWithColors(xmlData);
    
    const categoryCount = Object.keys(figureData).length;
    const colorCount = Object.keys(colorPalettes).length;
    console.log(`✅ [FigureData] Processed ${categoryCount} categories and ${colorCount} color palettes`);
    
    if (categoryCount === 0) {
      console.error('❌ [FigureData] No valid categories found after parsing');
      throw new Error('No valid categories found in XML data');
    }
    
    return new Response(
      JSON.stringify({ 
        figureParts: figureData,
        colorPalettes: colorPalettes,
        metadata: {
          source: usedUrl,
          fetchedAt: new Date().toISOString(),
          totalCategories: categoryCount,
          totalColors: colorCount,
          categories: Object.keys(figureData)
        }
      }), 
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      }
    );

  } catch (error) {
    console.error('💥 [FigureData] Fatal Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch figuredata',
        success: false,
        figureParts: {},
        colorPalettes: {}
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseXMLToJSONWithColors(xmlString: string) {
  try {
    console.log('🔍 [FigureData] Starting enhanced XML parsing with colors...');
    
    const figureData: Record<string, any[]> = {};
    const colorPalettes: Record<string, any[]> = {};
    
    // Valid clothing categories
    const VALID_CATEGORIES = new Set([
      'hd', 'hr', 'ha', 'he', 'ea', 'fa', 
      'ch', 'cc', 'cp', 'ca', 'lg', 'sh', 'wa'
    ]);
    
    console.log('📋 [FigureData] Valid categories:', Array.from(VALID_CATEGORIES));
    
    // First, parse color palettes
    const paletteRegex = /<palette[^>]+id="([^"]+)"[^>]*>(.*?)<\/palette>/gs;
    let paletteMatch;
    let totalPalettes = 0;
    
    while ((paletteMatch = paletteRegex.exec(xmlString)) !== null) {
      const paletteId = paletteMatch[1];
      const paletteContent = paletteMatch[2];
      
      colorPalettes[paletteId] = [];
      
      // Find all color elements within this palette
      const colorRegex = /<color[^>]+id="([^"]+)"[^>]*(?:value="([^"]*)")?[^>]*\/?>/g;
      let colorMatch;
      
      while ((colorMatch = colorRegex.exec(paletteContent)) !== null) {
        const colorId = colorMatch[1];
        const colorValue = colorMatch[2] || '#FFFFFF';
        
        colorPalettes[paletteId].push({
          id: colorId,
          hex: colorValue.startsWith('#') ? colorValue : `#${colorValue}`
        });
      }
      
      totalPalettes++;
    }
    
    console.log(`🎨 [FigureData] Parsed ${totalPalettes} color palettes`);
    
    // Parse figure sets with enhanced part information
    const setRegex = /<set[^>]+id="([^"]+)"[^>]*>(.*?)<\/set>/gs;
    let setMatch;
    let totalSetsFound = 0;
    let validSetsProcessed = 0;
    
    while ((setMatch = setRegex.exec(xmlString)) !== null) {
      totalSetsFound++;
      const setId = setMatch[1];
      const setContent = setMatch[2];
      
      // Only process valid clothing categories
      if (!VALID_CATEGORIES.has(setId)) {
        continue;
      }
      
      validSetsProcessed++;
      console.log(`✅ [FigureData] Processing valid category: ${setId}`);
      
      figureData[setId] = [];
      
      // Enhanced part parsing with palette information
      const partRegex = /<part[^>]+id="([^"]+)"[^>]*(?:gender="([^"]*)")?[^>]*(?:club="([^"]*)")?[^>]*(?:colorable="([^"]*)")?[^>]*(?:palette="([^"]*)")?[^>]*\/?>/g;
      let partMatch;
      let partsInCategory = 0;
      
      while ((partMatch = partRegex.exec(setContent)) !== null) {
        const partId = partMatch[1];
        const gender = partMatch[2] || 'U';
        const club = partMatch[3] || '0';
        const colorable = partMatch[4] === '1';
        const paletteId = partMatch[5];
        
        // Validate numeric ID
        if (!/^\d+$/.test(partId)) {
          continue;
        }
        
        // Get available colors for this part
        let availableColors = ['1', '2', '3', '4', '5']; // Default colors
        
        if (colorable && paletteId && colorPalettes[paletteId]) {
          availableColors = colorPalettes[paletteId].map(color => color.id);
        }
        
        const partData = {
          id: partId,
          gender: gender as 'M' | 'F' | 'U',
          club: club,
          colorable: colorable,
          colors: availableColors,
          paletteId: paletteId || null
        };
        
        figureData[setId].push(partData);
        partsInCategory++;
      }
      
      console.log(`📊 [FigureData] Category ${setId}: ${partsInCategory} items added`);
    }
    
    // Log final structure
    const totalItems = Object.values(figureData).reduce((sum, items) => sum + items.length, 0);
    const finalCategories = Object.keys(figureData);
    
    console.log(`📈 [FigureData] Enhanced XML Parsing Complete:`);
    console.log(`   - Total sets found: ${totalSetsFound}`);
    console.log(`   - Valid sets processed: ${validSetsProcessed}`);
    console.log(`   - Final categories: ${finalCategories.length}`);
    console.log(`   - Total items: ${totalItems}`);
    console.log(`   - Color palettes: ${totalPalettes}`);
    console.log(`   - Categories: ${finalCategories.join(', ')}`);
    
    return { figureData, colorPalettes };
    
  } catch (error) {
    console.error('❌ [FigureData] XML parsing error:', error);
    throw new Error('Failed to parse figuredata XML: ' + error.message);
  }
}
