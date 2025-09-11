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
    console.log('🔄 [Furnidata] Fetching official Habbo furnidata for rarity classification...');
    
    // URLs oficiais do Habbo baseadas no tutorial
    // Prioridade: Sandbox (mais atualizado) > Brasil > Internacional
    const furnidataUrls = [
      // Sandbox - mais atualizado com novidades
      'https://images.habbo.com/gordon/PRODUCTION-202211221644-994804644/furnidata.json',
      // Brasil - versão estável
      'https://www.habbo.com.br/gamedata/furnidata_json/1',
      // Internacional - fallback
      'https://www.habbo.com/gamedata/furnidata_json/1',
      'https://www.habbo.es/gamedata/furnidata_json/1'
    ];
    
    let jsonData: string | null = null;
    let usedUrl: string | null = null;
    
    for (const url of furnidataUrls) {
      try {
        console.log(`🌐 [Furnidata] Trying URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, */*',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (response.ok) {
          jsonData = await response.text();
          usedUrl = url;
          console.log(`✅ [Furnidata] Successfully fetched from: ${url}`);
          break;
        } else {
          console.warn(`⚠️ [Furnidata] Failed to fetch from ${url}: ${response.status}`);
        }
      } catch (error) {
        console.warn(`⚠️ [Furnidata] Error with ${url}:`, error.message);
      }
    }
    
    if (!jsonData) {
      throw new Error('Could not fetch furnidata from any source');
    }
    
    console.log(`📄 [Furnidata] Processing JSON data (${jsonData.length} characters)`);
    
    // Parse JSON and classify clothing items by rarity
    const { clothingRarity, nftCollections, rarityStats } = await parseFurnidataJSON(jsonData);
    
    const totalItems = Object.values(clothingRarity).reduce((sum, items) => sum + (items?.length || 0), 0);
    console.log(`✅ [Furnidata] Processed ${totalItems} clothing items with rarity classification`);
    
    if (totalItems === 0) {
      console.error('❌ [Furnidata] No clothing items found after parsing');
      throw new Error('No clothing items found in JSON data');
    }
    
    return new Response(
      JSON.stringify({ 
        clothingRarity: clothingRarity,
        nftCollections: nftCollections,
        rarityStats: rarityStats,
        metadata: {
          source: usedUrl,
          fetchedAt: new Date().toISOString(),
          totalItems: totalItems,
          nftCollections: Object.keys(nftCollections).length,
          rarityBreakdown: rarityStats
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
    console.error('💥 [Furnidata] Fatal Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch furnidata',
        success: false,
        clothingRarity: {},
        nftCollections: {},
        rarityStats: {}
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function parseFurnidataJSON(jsonString: string) {
  try {
    console.log('🔍 [Furnidata] Starting JSON parsing for rarity classification...');
    
    const furnidata = JSON.parse(jsonString);
    const clothingRarity: Record<string, any[]> = {};
    const nftCollections: Record<string, any[]> = {};
    const rarityStats = {
      normal: 0,
      rare: 0,
      ltd: 0,
      nft: 0,
      hc: 0
    };
    
    // Process furniture items to find clothing
    if (furnidata.roomitemtypes && furnidata.roomitemtypes.furnitype) {
      const furnitypes = Array.isArray(furnidata.roomitemtypes.furnitype) 
        ? furnidata.roomitemtypes.furnitype 
        : [furnidata.roomitemtypes.furnitype];
      
      for (const furnitype of furnitypes) {
        const className = furnitype.classname || '';
        const furniline = furnitype.furniline || '';
        
        // Check if it's a clothing item based on tutorial criteria
        if (isClothingItem(className, furnitype)) {
          const rarity = classifyRarity(className, furniline);
          const category = extractCategoryFromClassName(className);
          
          if (category) {
            // Initialize category if not exists
            if (!clothingRarity[category]) {
              clothingRarity[category] = [];
            }
            
            const clothingItem = {
              className: className,
              furniline: furniline,
              rarity: rarity,
              isRare: rarity === 'rare',
              isLTD: rarity === 'ltd',
              isNFT: rarity === 'nft',
              isHC: rarity === 'hc',
              category: category,
              // Extract item ID from className if possible
              itemId: extractItemIdFromClassName(className),
              // Generate icon URL based on revision
              iconUrl: generateClothingIconUrl(className, furnitype.revision || '1')
            };
            
            clothingRarity[category].push(clothingItem);
            
            // Update rarity stats
            rarityStats[rarity as keyof typeof rarityStats]++;
            
            // Track NFT collections
            if (rarity === 'nft' && furniline) {
              if (!nftCollections[furniline]) {
                nftCollections[furniline] = [];
              }
              nftCollections[furniline].push(clothingItem);
            }
          }
        }
      }
    }
    
    // Log final structure
    const totalItems = Object.values(clothingRarity).reduce((sum, items) => sum + items.length, 0);
    const finalCategories = Object.keys(clothingRarity);
    
    console.log(`📈 [Furnidata] JSON Parsing Complete:`);
    console.log(`   - Total clothing items: ${totalItems}`);
    console.log(`   - Categories: ${finalCategories.length}`);
    console.log(`   - NFT Collections: ${Object.keys(nftCollections).length}`);
    console.log(`   - Rarity breakdown:`, rarityStats);
    console.log(`   - Categories: ${finalCategories.join(', ')}`);
    
    return { clothingRarity, nftCollections, rarityStats };
    
  } catch (error) {
    console.error('❌ [Furnidata] JSON parsing error:', error);
    throw new Error('Failed to parse furnidata JSON: ' + error.message);
  }
}

// Função para verificar se é um item de roupa baseado no tutorial
function isClothingItem(className: string, furnitype: any): boolean {
  // Baseado no tutorial: roupas têm classname iniciado com "clothing_"
  return className.startsWith('clothing_');
}

// Função para classificar raridade baseada no tutorial
function classifyRarity(className: string, furniline: string): 'normal' | 'rare' | 'ltd' | 'nft' | 'hc' {
  // NFT: furniline contém "nft" (tutorial)
  if (furniline && furniline.includes('nft')) {
    return 'nft';
  }
  
  // Rare: classname inicia com "clothing_r" (tutorial)
  if (className.startsWith('clothing_r')) {
    return 'rare';
  }
  
  // LTD: classname inicia com "clothing_ltd" (tutorial)
  if (className.startsWith('clothing_ltd')) {
    return 'ltd';
  }
  
  // HC: verificar se tem propriedade club ou similar
  if (furniline && furniline.includes('hc')) {
    return 'hc';
  }
  
  // Default: normal
  return 'normal';
}

// Função para extrair categoria do className
function extractCategoryFromClassName(className: string): string | null {
  // Exemplos do tutorial:
  // "clothing_r19_rainbowhair" -> "hr" (cabelo)
  // "clothing_ltd23_solarpunkbunny" -> "hr" (cabelo)
  
  const categoryMapping: Record<string, string> = {
    'hair': 'hr',
    'hat': 'ha',
    'shirt': 'ch',
    'pants': 'lg',
    'shoes': 'sh',
    'glasses': 'ea',
    'mask': 'fa',
    'accessory': 'he',
    'jacket': 'cc',
    'necklace': 'ca',
    'belt': 'wa',
    'face': 'hd',
    'stamp': 'cp'
  };
  
  // Tentar extrair categoria do className
  for (const [key, category] of Object.entries(categoryMapping)) {
    if (className.toLowerCase().includes(key)) {
      return category;
    }
  }
  
  return null;
}

// Função para extrair ID do item do className
function extractItemIdFromClassName(className: string): string | null {
  // Exemplo: "clothing_r19_rainbowhair" -> "19"
  const match = className.match(/clothing_(?:r|ltd|nft)?(\d+)/);
  return match ? match[1] : null;
}

// Função para gerar URL do ícone baseada no tutorial
function generateClothingIconUrl(className: string, revision: string): string {
  // Base URL do tutorial: https://images.habbo.com/dcr/hof_furni/64917/
  const baseUrl = 'https://images.habbo.com/dcr/hof_furni';
  return `${baseUrl}/${revision}/clothing_${className}_icon.png`;
}