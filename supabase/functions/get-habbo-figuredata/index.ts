
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
    console.log('🔄 [FigureData] Fetching official Habbo figuredata...');
    
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
          signal: AbortSignal.timeout(10000) // 10 second timeout
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
    
    // Parse XML and convert to structured JSON
    const figureData = await parseXMLToJSON(xmlData);
    
    const categoryCount = Object.keys(figureData).length;
    console.log(`✅ [FigureData] Processed ${categoryCount} categories:`, Object.keys(figureData));
    
    if (categoryCount === 0) {
      console.error('❌ [FigureData] No valid categories found after parsing');
      throw new Error('No valid categories found in XML data');
    }
    
    return new Response(
      JSON.stringify({ 
        figureParts: figureData,
        metadata: {
          source: usedUrl,
          fetchedAt: new Date().toISOString(),
          totalCategories: categoryCount,
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
        figureParts: {} // Retornar objeto vazio para forçar fallback no frontend
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseXMLToJSON(xmlString: string) {
  try {
    console.log('🔍 [FigureData] Starting XML parsing...');
    
    // Enhanced XML parsing for better structure
    const figureData: Record<string, any[]> = {};
    
    // Valid clothing categories only - expanded list
    const VALID_CATEGORIES = new Set([
      'hd', // Head/Face
      'hr', // Hair
      'ha', // Hat/Head accessories
      'he', // Head extras
      'ea', // Eye accessories
      'fa', // Face accessories
      'ch', // Chest/Shirt
      'cc', // Coat/Jacket
      'cp', // Chest print
      'ca', // Chest accessories
      'lg', // Legs/Pants
      'sh', // Shoes
      'wa'  // Waist/Belt
    ]);
    
    console.log('📋 [FigureData] Valid categories:', Array.from(VALID_CATEGORIES));
    
    // Find all <set> elements using more robust regex
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
        console.log(`🚫 [FigureData] Skipping non-clothing category: ${setId}`);
        continue;
      }
      
      validSetsProcessed++;
      console.log(`✅ [FigureData] Processing valid category: ${setId}`);
      
      figureData[setId] = [];
      
      // Find all <part> elements within this set using more specific regex
      const partRegex = /<part[^>]+id="([^"]+)"[^>]*(?:gender="([^"]*)")?[^>]*(?:club="([^"]*)")?[^>]*(?:colorable="([^"]*)")?[^>]*\/?>/g;
      let partMatch;
      let partsInCategory = 0;
      
      while ((partMatch = partRegex.exec(setContent)) !== null) {
        const partId = partMatch[1];
        const gender = partMatch[2] || 'U';
        const club = partMatch[3] || '0';
        const colorable = partMatch[4] === '1';
        
        // Validate numeric ID
        if (!/^\d+$/.test(partId)) {
          console.warn(`⚠️ [FigureData] Invalid part ID: ${partId} in category ${setId}`);
          continue;
        }
        
        const partData = {
          id: partId,
          gender: gender as 'M' | 'F' | 'U',
          club: club,
          colorable: colorable,
          colors: ['1', '2', '3', '4', '5'] // Default colors
        };
        
        figureData[setId].push(partData);
        partsInCategory++;
      }
      
      console.log(`📊 [FigureData] Category ${setId}: ${partsInCategory} items added`);
    }
    
    // Log final structure
    const totalItems = Object.values(figureData).reduce((sum, items) => sum + items.length, 0);
    const finalCategories = Object.keys(figureData);
    
    console.log(`📈 [FigureData] XML Parsing Complete:`);
    console.log(`   - Total sets found: ${totalSetsFound}`);
    console.log(`   - Valid sets processed: ${validSetsProcessed}`);
    console.log(`   - Final categories: ${finalCategories.length}`);
    console.log(`   - Total items: ${totalItems}`);
    console.log(`   - Categories: ${finalCategories.join(', ')}`);
    
    if (finalCategories.length === 0) {
      console.error('❌ [FigureData] No valid categories found after parsing');
      console.log('🔍 [FigureData] Sample XML content:', xmlString.substring(0, 1000));
    }
    
    return figureData;
    
  } catch (error) {
    console.error('❌ [FigureData] XML parsing error:', error);
    console.log('🔍 [FigureData] XML length:', xmlString?.length || 'undefined');
    console.log('🔍 [FigureData] XML sample:', xmlString?.substring(0, 500) || 'no data');
    throw new Error('Failed to parse figuredata XML: ' + error.message);
  }
}
