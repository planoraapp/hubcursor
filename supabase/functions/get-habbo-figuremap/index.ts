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
    console.log('🔄 [FigureMap] Fetching official Habbo figuremap with scientific codes...');
    
    // URLs oficiais do Habbo baseadas no tutorial
    // Prioridade: Sandbox (mais atualizado) > Brasil > Internacional
    const figuremapUrls = [
      // Sandbox - mais atualizado com novidades
      'https://images.habbo.com/gordon/PRODUCTION-202211221644-994804644/figuremap.xml',
      // Brasil - versão estável
      'https://www.habbo.com.br/gamedata/figuremap/1',
      // Internacional - fallback
      'https://www.habbo.com/gamedata/figuremap/1',
      'https://www.habbo.es/gamedata/figuremap/1'
    ];
    
    let xmlData: string | null = null;
    let usedUrl: string | null = null;
    
    for (const url of figuremapUrls) {
      try {
        console.log(`🌐 [FigureMap] Trying URL: ${url}`);
        
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
          console.log(`✅ [FigureMap] Successfully fetched from: ${url}`);
          break;
        } else {
          console.warn(`⚠️ [FigureMap] Failed to fetch from ${url}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ [FigureMap] Error with ${url}:`, error.message);
      }
    }
    
    if (!xmlData) {
      throw new Error('Could not fetch figuremap from any source');
    }
    
    console.log(`📄 [FigureMap] Processing XML data (${xmlData.length} characters)`);
    
    // Parse XML and extract scientific codes and SWF URLs
    const { figureMapData, swfUrls, iconUrls } = await parseFigureMapXML(xmlData);
    
    const categoryCount = Object.keys(figureMapData).length;
    const totalItems = Object.values(figureMapData).reduce((sum, items) => sum + (items?.length || 0), 0);
    console.log(`✅ [FigureMap] Processed ${categoryCount} categories with ${totalItems} items`);
    
    if (categoryCount === 0) {
      console.error('❌ [FigureMap] No valid categories found after parsing');
      throw new Error('No valid categories found in XML data');
    }
    
    return new Response(
      JSON.stringify({ 
        figureMapData: figureMapData,
        swfUrls: swfUrls,
        iconUrls: iconUrls,
        metadata: {
          source: usedUrl,
          fetchedAt: new Date().toISOString(),
          totalCategories: categoryCount,
          totalItems: totalItems,
          categories: Object.keys(figureMapData)
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
    console.error('💥 [FigureMap] Fatal Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch figuremap',
        success: false,
        figureMapData: {},
        swfUrls: {},
        iconUrls: {}
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseFigureMapXML(xmlString: string) {
  try {
    console.log('🔍 [FigureMap] Starting XML parsing for scientific codes and SWF URLs...');
    
    const figureMapData: Record<string, any[]> = {};
    const swfUrls: Record<string, string> = {};
    const iconUrls: Record<string, string> = {};
    
    // 13 categorias oficiais do Habbo baseadas no tutorial
    const VALID_CATEGORIES = new Set([
      'hd', // Rosto e Corpo
      'hr', // Cabelo/Penteados
      'ch', // Camisas
      'cc', // Casacos/Vestidos/Jaquetas
      'cp', // Estampas/Impressões
      'ca', // Bijuteria/Jóias
      'ea', // Óculos
      'fa', // Máscaras
      'ha', // Chapéus
      'he', // Acessórios
      'lg', // Calça
      'sh', // Sapato
      'wa'  // Cintos
    ]);
    
    console.log('📋 [FigureMap] Valid categories:', Array.from(VALID_CATEGORIES));
    
    // Parse libraries (lib elements) - contém códigos científicos
    const libRegex = /<lib[^>]+id="([^"]+)"[^>]*(?:revision="([^"]*)")?[^>]*>(.*?)<\/lib>/gs;
    let libMatch;
    let totalLibraries = 0;
    
    while ((libMatch = libRegex.exec(xmlString)) !== null) {
      const scientificCode = libMatch[1]; // Ex: "hair_U_rainbowhair"
      const revision = libMatch[2] || '1';
      const libContent = libMatch[3];
      
      totalLibraries++;
      
      // Parse parts within this library
      const partRegex = /<part[^>]+id="([^"]+)"[^>]*(?:type="([^"]*)")?[^>]*\/?>/g;
      let partMatch;
      
      while ((partMatch = partRegex.exec(libContent)) !== null) {
        const partId = partMatch[1];
        const partType = partMatch[2] || 'unknown';
        
        // Only process valid clothing categories
        if (!VALID_CATEGORIES.has(partType)) {
          continue;
        }
        
        // Initialize category if not exists
        if (!figureMapData[partType]) {
          figureMapData[partType] = [];
        }
        
        // Generate SWF URL baseado no tutorial
        const swfUrl = generateSwfUrl(scientificCode, revision);
        const iconUrl = generateIconUrl(scientificCode, revision);
        
        // Store SWF and icon URLs
        swfUrls[`${partType}-${partId}`] = swfUrl;
        iconUrls[`${partType}-${partId}`] = iconUrl;
        
        const partData = {
          id: partId,
          scientificCode: scientificCode,
          type: partType,
          revision: revision,
          swfUrl: swfUrl,
          iconUrl: iconUrl,
          // Extract category from scientific code (ex: "hair_U_rainbowhair" -> "hair")
          categoryPrefix: scientificCode.split('_')[0] || 'unknown'
        };
        
        figureMapData[partType].push(partData);
      }
    }
    
    // Log final structure
    const totalItems = Object.values(figureMapData).reduce((sum, items) => sum + items.length, 0);
    const finalCategories = Object.keys(figureMapData);
    
    console.log(`📈 [FigureMap] XML Parsing Complete:`);
    console.log(`   - Total libraries found: ${totalLibraries}`);
    console.log(`   - Final categories: ${finalCategories.length}`);
    console.log(`   - Total items: ${totalItems}`);
    console.log(`   - SWF URLs generated: ${Object.keys(swfUrls).length}`);
    console.log(`   - Icon URLs generated: ${Object.keys(iconUrls).length}`);
    console.log(`   - Categories: ${finalCategories.join(', ')}`);
    
    return { figureMapData, swfUrls, iconUrls };
    
  } catch (error) {
    console.error('❌ [FigureMap] XML parsing error:', error);
    throw new Error('Failed to parse figuremap XML: ' + error.message);
  }
}

// Função para gerar URL SWF baseada no tutorial
function generateSwfUrl(scientificCode: string, revision: string): string {
  // Base URL do tutorial: https://images.habbo.com/gordon/flash-assets-PRODUCTION-202504241358-338970472/
  const baseUrl = 'https://images.habbo.com/gordon/flash-assets-PRODUCTION-202504241358-338970472';
  return `${baseUrl}/${scientificCode}.swf`;
}

// Função para gerar URL do ícone baseada no tutorial
function generateIconUrl(scientificCode: string, revision: string): string {
  // Base URL do tutorial: https://images.habbo.com/dcr/hof_furni/64917/
  const baseUrl = 'https://images.habbo.com/dcr/hof_furni';
  return `${baseUrl}/${revision}/clothing_${scientificCode}_icon.png`;
}