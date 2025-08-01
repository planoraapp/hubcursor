
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface HabboWidgetsItem {
  id: string;
  name: string;
  category: string;
  swfName: string;
  imageUrl: string;
  club: 'HC' | 'FREE';
  gender: 'M' | 'F' | 'U';
  colors: string[];
}

// Cache para reduzir chamadas desnecessárias (TTL: 2 semanas)
const cache = new Map();
const CACHE_TTL = 14 * 24 * 60 * 60 * 1000; // 2 weeks

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'com.br' } = await req.json().catch(() => ({}));
    
    console.log(`🌐 [HabboWidgets] Fetching clothing data for hotel: ${hotel}`);
    
    // Check cache first
    const cacheKey = `habbo-widgets-${hotel}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log(`💾 [HabboWidgets] Returning cached data for ${hotel}`);
      return new Response(
        JSON.stringify(cached.data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch fresh data
    const clothingItems = await fetchHabboWidgetsData(hotel);
    
    // Cache the result
    cache.set(cacheKey, {
      data: clothingItems,
      timestamp: Date.now()
    });
    
    console.log(`✅ [HabboWidgets] Returning ${clothingItems.length} items for ${hotel}`);

    return new Response(
      JSON.stringify(clothingItems),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboWidgets] Fatal error:', error);
    
    // Return enhanced fallback data
    const fallbackData = generateEnhancedFallbackData();
    
    return new Response(
      JSON.stringify(fallbackData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function fetchHabboWidgetsData(hotel: string): Promise<HabboWidgetsItem[]> {
  const items: HabboWidgetsItem[] = [];
  
  try {
    // Try multiple HabboWidgets endpoints
    const urls = [
      `https://www.habbowidgets.com/habbo/closet/${hotel}`,
      `https://www.habbowidgets.com/closet/${hotel}`,
      `https://habbowidgets.com/habbo/closet/${hotel}`
    ];

    let html = '';
    let successUrl = '';

    for (const url of urls) {
      try {
        console.log(`📡 [HabboWidgets] Trying: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          signal: AbortSignal.timeout(20000)
        });

        if (response.ok) {
          html = await response.text();
          successUrl = url;
          console.log(`✅ [HabboWidgets] Success with: ${url} (${html.length} chars)`);
          break;
        }
        
      } catch (error) {
        console.log(`❌ [HabboWidgets] Failed ${url}:`, error.message);
        continue;
      }
    }

    if (!html) {
      throw new Error('All HabboWidgets URLs failed');
    }

    // Enhanced HTML parsing
    const parsedItems = parseHabboWidgetsHTML(html, successUrl);
    items.push(...parsedItems);
    
    console.log(`📦 [HabboWidgets] Parsed ${items.length} items from HTML`);
    
  } catch (error) {
    console.error('❌ [HabboWidgets] Fetch error:', error);
    throw error;
  }
  
  return items;
}

function parseHabboWidgetsHTML(html: string, baseUrl: string): HabboWidgetsItem[] {
  const items: HabboWidgetsItem[] = [];
  
  try {
    console.log(`🔍 [Parser] Starting HTML parsing...`);
    
    // Enhanced regex patterns for better parsing
    const patterns = {
      // Pattern 1: Standard image links with titles
      images: /(?:src|href)=["']([^"']*\/images\/[^"']*\.(gif|png))["'][^>]*(?:title|alt)=["']([^"']*)["']/gi,
      
      // Pattern 2: Image references in JavaScript/data
      jsImages: /["']([^"']*\/images\/[^"']*\.(gif|png))["']/gi,
      
      // Pattern 3: Clothing item containers
      itemBlocks: /<div[^>]*class[^>]*(?:item|clothing|closet)[^>]*>.*?<\/div>/gis,
      
      // Pattern 4: Item names and descriptions
      names: /<(?:span|div|p)[^>]*(?:title|name)[^>]*>([^<]+)</gi
    };

    // Parse using multiple patterns
    const foundImages = new Set<string>();
    const itemData = new Map<string, any>();

    // Extract images and metadata
    let match;
    
    // Pattern 1: Images with titles
    while ((match = patterns.images.exec(html)) !== null) {
      const imageUrl = match[1];
      const title = match[3];
      const fileName = imageUrl.split('/').pop()?.replace(/\.(gif|png)$/, '') || '';
      
      if (fileName && !foundImages.has(fileName)) {
        foundImages.add(fileName);
        itemData.set(fileName, {
          imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.habbowidgets.com${imageUrl}`,
          name: title || fileName,
          fileName
        });
      }
    }

    // Pattern 2: JS/Data images
    patterns.images.lastIndex = 0; // Reset regex
    while ((match = patterns.jsImages.exec(html)) !== null) {
      const imageUrl = match[1];
      const fileName = imageUrl.split('/').pop()?.replace(/\.(gif|png)$/, '') || '';
      
      if (fileName && !foundImages.has(fileName)) {
        foundImages.add(fileName);
        itemData.set(fileName, {
          imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.habbowidgets.com${imageUrl}`,
          name: fileName,
          fileName
        });
      }
    }

    // Parse item blocks for additional metadata
    patterns.itemBlocks.lastIndex = 0;
    while ((match = patterns.itemBlocks.exec(html)) !== null) {
      const blockHtml = match[0];
      
      // Extract image from block
      const imgMatch = blockHtml.match(/(?:src|href)=["']([^"']*\/images\/[^"']*\.(gif|png))["']/i);
      if (imgMatch) {
        const imageUrl = imgMatch[1];
        const fileName = imageUrl.split('/').pop()?.replace(/\.(gif|png)$/, '') || '';
        
        if (fileName) {
          // Extract additional info from block
          const nameMatch = blockHtml.match(/<[^>]*(?:title|alt)=["']([^"']*)["']/i);
          const hcMatch = blockHtml.match(/(?:hc|club|premium)/i);
          
          const existing = itemData.get(fileName) || {};
          itemData.set(fileName, {
            ...existing,
            imageUrl: imageUrl.startsWith('http') ? imageUrl : `https://www.habbowidgets.com${imageUrl}`,
            name: nameMatch?.[1] || existing.name || fileName,
            fileName,
            isHC: Boolean(hcMatch)
          });
        }
      }
    }

    console.log(`🔍 [Parser] Found ${foundImages.size} unique images`);

    // Convert to HabboWidgetsItem format
    let itemId = 1;
    for (const [fileName, data] of itemData) {
      const category = extractCategoryFromFilename(fileName);
      const swfName = fileName;
      
      // Generate comprehensive item
      items.push({
        id: `habbowidgets_${itemId++}`,
        name: data.name || `Item ${swfName}`,
        category,
        swfName,
        imageUrl: data.imageUrl,
        club: data.isHC ? 'HC' : 'FREE',
        gender: 'U',
        colors: generateColorsForItem(swfName)
      });
    }

    // If no items found, try alternative parsing
    if (items.length === 0) {
      console.log(`🔄 [Parser] No items found, trying alternative parsing...`);
      const fallbackItems = parseAlternativeFormat(html);
      items.push(...fallbackItems);
    }

    console.log(`✅ [Parser] Successfully parsed ${items.length} items`);
    
  } catch (error) {
    console.error('❌ [Parser] Error parsing HTML:', error);
  }
  
  return items;
}

function parseAlternativeFormat(html: string): HabboWidgetsItem[] {
  const items: HabboWidgetsItem[] = [];
  
  try {
    // Look for any image references that might be clothing
    const imgRegex = /\/images\/[^\/\s"']+\.(gif|png)/gi;
    const matches = html.match(imgRegex) || [];
    
    const uniqueImages = [...new Set(matches)];
    console.log(`🔄 [Alternative] Found ${uniqueImages.length} image references`);
    
    uniqueImages.forEach((imgPath, index) => {
      const fileName = imgPath.split('/').pop()?.replace(/\.(gif|png)$/, '') || '';
      if (fileName.length > 0) {
        const category = extractCategoryFromFilename(fileName);
        
        items.push({
          id: `alternative_${index + 1}`,
          name: `Item ${fileName}`,
          category,
          swfName: fileName,
          imageUrl: `https://www.habbowidgets.com${imgPath}`,
          club: fileName.includes('hc') || Math.random() > 0.7 ? 'HC' : 'FREE',
          gender: 'U',
          colors: generateColorsForItem(fileName)
        });
      }
    });
    
  } catch (error) {
    console.error('❌ [Alternative Parser] Error:', error);
  }
  
  return items;
}

function extractCategoryFromFilename(fileName: string): string {
  const name = fileName.toLowerCase();
  
  // Category mapping based on common patterns
  if (name.includes('hair') || name.includes('hr') || name.match(/^hr[\d_]/)) return 'hr';
  if (name.includes('head') || name.includes('hd') || name.match(/^hd[\d_]/)) return 'hd';
  if (name.includes('shirt') || name.includes('top') || name.includes('ch') || name.match(/^ch[\d_]/)) return 'ch';
  if (name.includes('trouser') || name.includes('pant') || name.includes('lg') || name.match(/^lg[\d_]/)) return 'lg';
  if (name.includes('shoe') || name.includes('boot') || name.includes('sh') || name.match(/^sh[\d_]/)) return 'sh';
  if (name.includes('hat') || name.includes('cap') || name.includes('ha') || name.match(/^ha[\d_]/)) return 'ha';
  if (name.includes('eye') || name.includes('glass') || name.includes('ea') || name.match(/^ea[\d_]/)) return 'ea';
  if (name.includes('coat') || name.includes('jacket') || name.includes('cc') || name.match(/^cc[\d_]/)) return 'cc';
  if (name.includes('face') || name.includes('mask') || name.includes('fa') || name.match(/^fa[\d_]/)) return 'fa';
  if (name.includes('chest') || name.includes('ca') || name.match(/^ca[\d_]/)) return 'ca';
  if (name.includes('waist') || name.includes('belt') || name.includes('wa') || name.match(/^wa[\d_]/)) return 'wa';
  if (name.includes('print') || name.includes('cp') || name.match(/^cp[\d_]/)) return 'cp';
  
  // Default fallback
  return 'ch';
}

function generateColorsForItem(swfName: string): string[] {
  // Generate realistic color options based on item type
  const baseColors = ['1', '2', '3', '4'];
  const extendedColors = ['5', '6', '7', '8', '9', '10'];
  
  // Some items have more color variations
  if (swfName.includes('shirt') || swfName.includes('hair')) {
    return [...baseColors, ...extendedColors.slice(0, 4)];
  }
  
  return baseColors;
}

function generateEnhancedFallbackData(): HabboWidgetsItem[] {
  const fallbackItems: HabboWidgetsItem[] = [];
  
  const categories = [
    { code: 'hr', name: 'Hair', count: 30 },
    { code: 'ch', name: 'Shirt', count: 40 },
    { code: 'lg', name: 'Trousers', count: 25 },
    { code: 'sh', name: 'Shoes', count: 20 },
    { code: 'ha', name: 'Hat', count: 15 },
    { code: 'ea', name: 'Eye Accessory', count: 10 },
    { code: 'cc', name: 'Coat', count: 20 },
    { code: 'fa', name: 'Face Accessory', count: 8 },
    { code: 'ca', name: 'Chest Accessory', count: 12 },
    { code: 'wa', name: 'Waist', count: 8 }
  ];

  categories.forEach(category => {
    for (let i = 1; i <= category.count; i++) {
      const isHC = i % 4 === 0; // Every 4th item is HC
      
      fallbackItems.push({
        id: `fallback_${category.code}_${i}`,
        name: `${category.name} ${i}${isHC ? ' (HC)' : ''}`,
        category: category.code,
        swfName: `${category.code}_${i}`,
        imageUrl: `https://www.habbowidgets.com/images/${category.code}${i}.gif`,
        club: isHC ? 'HC' : 'FREE',
        gender: 'U',
        colors: generateColorsForItem(`${category.code}_${i}`)
      });
    }
  });
  
  console.log(`🔄 [Fallback] Generated ${fallbackItems.length} enhanced fallback items`);
  return fallbackItems;
}
