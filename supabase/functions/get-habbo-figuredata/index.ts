
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
    
    // URLs oficiais do Habbo baseadas no tutorial
    // Prioridade: Sandbox (mais atualizado) > Brasil > Internacional
    const figuredataUrls = [
      // Sandbox - mais atualizado com novidades
      'https://images.habbo.com/gordon/PRODUCTION-202211221644-994804644/figuredata.xml',
      // Brasil - versão estável
      'https://www.habbo.com.br/gamedata/figuredata/1',
      // Internacional - fallback
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
    
    // 13 categorias oficiais do Habbo baseadas no tutorial
    const VALID_CATEGORIES = new Set([
      'hd', // Rosto e Corpo (paleta 1)
      'hr', // Cabelo/Penteados (paleta 2)
      'ch', // Camisas (paleta 3)
      'cc', // Casacos/Vestidos/Jaquetas (paleta 3)
      'cp', // Estampas/Impressões (paleta 3)
      'ca', // Bijuteria/Jóias (acessórios de topo) (paleta 3)
      'ea', // Óculos (paleta 3)
      'fa', // Máscaras (acessórios faciais) (paleta 3)
      'ha', // Chapéus (paleta 3)
      'he', // Acessórios (paleta 3)
      'lg', // Calça (paleta 3)
      'sh', // Sapato (paleta 3)
      'wa'  // Cintos (acessórios para a parte inferior) (paleta 3)
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
      
      // Enhanced part parsing com informações completas do tutorial
      const partRegex = /<part[^>]+id="([^"]+)"[^>]*(?:gender="([^"]*)")?[^>]*(?:club="([^"]*)")?[^>]*(?:colorable="([^"]*)")?[^>]*(?:selectable="([^"]*)")?[^>]*(?:preselectable="([^"]*)")?[^>]*(?:sellable="([^"]*)")?[^>]*(?:palette="([^"]*)")?[^>]*(?:colorindex="([^"]*)")?[^>]*\/?>/g;
      let partMatch;
      let partsInCategory = 0;
      
      while ((partMatch = partRegex.exec(setContent)) !== null) {
        const partId = partMatch[1];
        const gender = partMatch[2] || 'U';
        const club = partMatch[3] || '0';
        const colorable = partMatch[4] === '1';
        const selectable = partMatch[5] || '1';
        const preselectable = partMatch[6] || '0';
        const sellable = partMatch[7] || '0';
        const paletteId = partMatch[8];
        const colorIndex = partMatch[9] || '1'; // Para sistema duotone do tutorial
        
        // Validate numeric ID
        if (!/^\d+$/.test(partId)) {
          continue;
        }
        
        // Determinar paleta correta baseada na categoria (tutorial)
        const correctPaletteId = paletteId || getCorrectPaletteId(setId);
        
        // Get available colors for this part
        let availableColors = ['1', '2', '3', '4', '5']; // Default colors
        
        if (colorable && correctPaletteId && colorPalettes[correctPaletteId]) {
          availableColors = colorPalettes[correctPaletteId].map(color => color.id);
        }
        
        // Detectar duotone baseado no tutorial (colorindex="1" e colorindex="2")
        const isDuotone = colorIndex === '2' || colorIndex === '1';
        
        // Gerar URL de thumbnail usando habbo-imaging
        const thumbnailUrl = generateThumbnailUrl(setId, partId, availableColors[0], gender);
        
        const partData = {
          id: partId,
          figureId: partId, // Para compatibilidade
          category: setId,
          gender: gender as 'M' | 'F' | 'U',
          club: club,
          colorable: colorable,
          selectable: selectable,
          preselectable: preselectable,
          sellable: sellable,
          colors: availableColors,
          paletteId: correctPaletteId,
          thumbnailUrl: thumbnailUrl,
          // Sistema duotone do tutorial
          colorIndex: colorIndex,
          isDuotone: isDuotone,
          // Informações adicionais do tutorial
          isHC: club === '2',
          isRare: false, // Será determinado pelo furnidata
          isLTD: false,  // Será determinado pelo furnidata
          isNFT: false   // Será determinado pelo furnidata
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

// Função auxiliar para determinar paleta correta baseada no tutorial
function getCorrectPaletteId(category: string): string {
  const paletteMapping = {
    'hd': '1', // Rosto e Corpo - Paleta 1
    'hr': '2', // Cabelo/Penteados - Paleta 2
    'ch': '3', // Camisas - Paleta 3
    'cc': '3', // Casacos/Vestidos/Jaquetas - Paleta 3
    'cp': '3', // Estampas/Impressões - Paleta 3
    'ca': '3', // Bijuteria/Jóias - Paleta 3
    'ea': '3', // Óculos - Paleta 3
    'fa': '3', // Máscaras - Paleta 3
    'ha': '3', // Chapéus - Paleta 3
    'he': '3', // Acessórios - Paleta 3
    'lg': '3', // Calça - Paleta 3
    'sh': '3', // Sapato - Paleta 3
    'wa': '3'  // Cintos - Paleta 3
  };
  
  return paletteMapping[category as keyof typeof paletteMapping] || '3';
}

// Função para gerar URL de thumbnail usando habbo-imaging
function generateThumbnailUrl(category: string, figureId: string, colorId: string, gender: 'M' | 'F' | 'U'): string {
  // Avatar base focado na categoria específica
  const baseAvatar = getBaseAvatarForCategory(category);
  const fullFigure = `${baseAvatar}.${category}-${figureId}-${colorId}`;
  
  return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${fullFigure}&gender=${gender}&direction=2&head_direction=2&size=s&img_format=png&gesture=std&action=std`;
}

// Função para gerar avatar base focado na categoria específica
function getBaseAvatarForCategory(category: string): string {
  const baseAvatars = {
    'hd': 'hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'hr': 'hd-180-1.ch-3216-92.lg-3116-92.sh-3297-92',
    'ch': 'hd-180-1.hr-828-45.lg-3116-92.sh-3297-92',
    'cc': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'lg': 'hd-180-1.hr-828-45.ch-3216-92.sh-3297-92',
    'sh': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92',
    'ha': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'ea': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'fa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'he': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'ca': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'cp': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92',
    'wa': 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92'
  };
  
  return baseAvatars[category as keyof typeof baseAvatars] || 'hd-180-1.hr-828-45.ch-3216-92.lg-3116-92.sh-3297-92';
}
