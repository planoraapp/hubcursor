
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { hotel = 'com.br' } = await req.json();
    
    console.log(`🌐 [HabboWidgets] Fetching clothing data for hotel: ${hotel}`);
    
    const habboWidgetsUrl = `https://www.habbowidgets.com/habbo/closet/${hotel}`;
    
    const response = await fetch(habboWidgetsUrl, {
      headers: {
        'User-Agent': 'HabboHub-Console/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`HabboWidgets responded with status ${response.status}`);
    }

    const html = await response.text();
    console.log(`📄 [HabboWidgets] Received HTML data of ${html.length} characters`);
    
    // Parse HTML to extract clothing items
    const clothingItems = parseHabboWidgetsHTML(html);
    
    console.log(`✅ [HabboWidgets] Parsed ${clothingItems.length} clothing items`);

    return new Response(
      JSON.stringify(clothingItems),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [HabboWidgets] Error fetching clothing:', error);
    
    // Return fallback data
    const fallbackData = generateFallbackClothingData();
    
    return new Response(
      JSON.stringify(fallbackData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function parseHabboWidgetsHTML(html: string): HabboWidgetsItem[] {
  const items: HabboWidgetsItem[] = [];
  
  try {
    // Look for clothing item patterns in the HTML
    // This is a simplified parser - in reality, you'd need more sophisticated parsing
    const imageMatches = html.match(/\/images\/[^"']+\.(gif|png)/g) || [];
    const nameMatches = html.match(/title="([^"]+)"/g) || [];
    
    console.log(`🔍 [Parse] Found ${imageMatches.length} image matches, ${nameMatches.length} name matches`);
    
    for (let i = 0; i < Math.min(imageMatches.length, nameMatches.length); i++) {
      const imageUrl = `https://www.habbowidgets.com${imageMatches[i]}`;
      const name = nameMatches[i].match(/title="([^"]+)"/)?.[1] || `Item ${i + 1}`;
      
      // Extract category from filename or pattern
      const category = extractCategoryFromImage(imageMatches[i]);
      const swfName = extractSwfNameFromImage(imageMatches[i]);
      
      items.push({
        id: `habbowidgets_${i + 1}`,
        name,
        category,
        swfName,
        imageUrl,
        club: name.toLowerCase().includes('hc') || name.toLowerCase().includes('club') ? 'HC' : 'FREE',
        gender: 'U',
        colors: ['1', '2', '3', '4'] // Default colors
      });
    }
    
  } catch (error) {
    console.error('❌ [Parse] Error parsing HTML:', error);
  }
  
  return items;
}

function extractCategoryFromImage(imagePath: string): string {
  // Extract category from image path patterns
  if (imagePath.includes('hair') || imagePath.includes('hr')) return 'hr';
  if (imagePath.includes('shirt') || imagePath.includes('ch')) return 'ch';
  if (imagePath.includes('trouser') || imagePath.includes('lg')) return 'lg';
  if (imagePath.includes('shoe') || imagePath.includes('sh')) return 'sh';
  if (imagePath.includes('hat') || imagePath.includes('ha')) return 'ha';
  if (imagePath.includes('eye') || imagePath.includes('ea')) return 'ea';
  if (imagePath.includes('coat') || imagePath.includes('cc')) return 'cc';
  
  // Default to shirt category
  return 'ch';
}

function extractSwfNameFromImage(imagePath: string): string {
  const filename = imagePath.split('/').pop() || '';
  return filename.replace(/\.(gif|png)$/, '');
}

function generateFallbackClothingData(): HabboWidgetsItem[] {
  const fallbackItems: HabboWidgetsItem[] = [];
  const categories = ['hr', 'ch', 'lg', 'sh', 'ha', 'ea', 'cc'];
  const sampleNames = [
    'Uniforme H Dourado', 'Cabelo Moderno', 'Calça Social', 'Tênis Esportivo',
    'Chapéu Elegante', 'Óculos de Sol', 'Jaqueta Casual', 'Camiseta Básica'
  ];
  
  categories.forEach((category, categoryIndex) => {
    for (let i = 1; i <= 10; i++) {
      fallbackItems.push({
        id: `fallback_${category}_${i}`,
        name: `${sampleNames[categoryIndex]} ${i}`,
        category,
        swfName: `${category}_${i}`,
        imageUrl: `https://www.habbowidgets.com/images/${category}${i}.gif`,
        club: i % 3 === 0 ? 'HC' : 'FREE',
        gender: 'U',
        colors: ['1', '2', '3', '4']
      });
    }
  });
  
  return fallbackItems;
}
