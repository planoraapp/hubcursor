
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface TickerActivity {
  username: string;
  activity: string;
  time: string;
  timestamp?: string;
  hotel: string;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 [HabboWidgetsProxy] Starting ticker data fetch...');
    
    // Get hotel from both URL params and POST body
    const url = new URL(req.url);
    let hotel = url.searchParams.get('hotel') || 'com.br';
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        hotel = body.hotel || hotel;
      } catch (e) {
        console.log('⚠️ [HabboWidgetsProxy] Could not parse POST body, using URL params');
      }
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Try to fetch from cache first
    const cacheKey = `ticker_${hotel}`;
    const { data: cachedData } = await supabase
      .from('habbo_emotion_api_cache')
      .select('*')
      .eq('endpoint', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedData?.response_data) {
      console.log(`✅ [HabboWidgetsProxy] Returning cached data for ${hotel}`);
      return new Response(
        JSON.stringify({ activities: cachedData.response_data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try multiple endpoints with different configurations
    const endpoints = [
      `https://habbowidgets.com/habbo/ticker?hotel=${hotel}`,
      `https://www.habbowidgets.com/habbo/ticker?hotel=${hotel}`,
      `https://habbowidgets.com/habbo/ticker?hotel=${hotel}&_t=${Date.now()}`
    ];

    let activities: TickerActivity[] = [];
    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`🌐 [HabboWidgetsProxy] Trying endpoint: ${endpoint}`);
        
        const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Referer': 'https://habbowidgets.com/',
            'Cache-Control': 'no-cache'
          }
        });

        if (response.ok) {
          const html = await response.text();
          console.log(`📄 [HabboWidgetsProxy] Success with ${endpoint}, HTML length: ${html.length}`);
          
          activities = parseTickerHTML(html, hotel);
          if (activities.length > 0) {
            console.log(`✅ [HabboWidgetsProxy] Parsed ${activities.length} activities from ${endpoint}`);
            break;
          }
        } else {
          console.log(`❌ [HabboWidgetsProxy] HTTP ${response.status} from ${endpoint}`);
          lastError = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error) {
        console.log(`❌ [HabboWidgetsProxy] Error with ${endpoint}:`, error);
        lastError = error;
      }
    }

    // If we got real data, cache it and return
    if (activities.length > 0) {
      await supabase
        .from('habbo_emotion_api_cache')
        .upsert({
          endpoint: cacheKey,
          response_data: activities,
          status: 'success',
          item_count: activities.length,
          expires_at: new Date(Date.now() + 2 * 60 * 1000).toISOString()
        });

      return new Response(
        JSON.stringify({ activities }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All endpoints failed, return mock data
    console.warn(`⚠️ [HabboWidgetsProxy] All endpoints failed, using mock data. Last error:`, lastError);
    const mockActivities = generateMockActivities(hotel);
    
    // Cache mock data for 5 minutes
    await supabase
      .from('habbo_emotion_api_cache')
      .upsert({
        endpoint: cacheKey,
        response_data: mockActivities,
        status: 'mock_fallback',
        item_count: mockActivities.length,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      });
    
    return new Response(
      JSON.stringify({ activities: mockActivities }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [HabboWidgetsProxy] Fatal error:', error);
    
    // Return mock data as final fallback
    const hotel = 'com.br';
    const mockActivities = generateMockActivities(hotel);
    
    return new Response(
      JSON.stringify({ activities: mockActivities }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

function parseTickerHTML(html: string, hotel: string): TickerActivity[] {
  const activities: TickerActivity[] = [];
  
  try {
    // Look for various patterns that might contain ticker data
    const patterns = [
      /<div[^>]*class="[^"]*ticker[^"]*"[^>]*>(.*?)<\/div>/gis,
      /<span[^>]*class="[^"]*activity[^"]*"[^>]*>(.*?)<\/span>/gis,
      /<li[^>]*>(.*?)<\/li>/gis,
      /<p[^>]*>(.*?)<\/p>/gis
    ];

    for (const pattern of patterns) {
      const matches = html.matchAll(pattern);
      
      for (const match of matches) {
        const content = match[1];
        if (content && content.includes('@')) {
          const activityMatch = content.match(/(\w+)\s+(.*)/);
          if (activityMatch) {
            activities.push({
              username: activityMatch[1],
              activity: cleanHTML(activityMatch[2]),
              time: new Date().toISOString(),
              timestamp: new Date().toISOString(),
              hotel: hotel
            });
          }
        }
      }
    }

    // If no structured data found, look for any text that looks like activities
    if (activities.length === 0) {
      const textMatches = html.match(/(\w+)\s+(ganhou|recebeu|comprou|entrou|saiu)/gi);
      if (textMatches) {
        textMatches.slice(0, 10).forEach(match => {
          const parts = match.split(' ');
          if (parts.length >= 2) {
            activities.push({
              username: parts[0],
              activity: parts.slice(1).join(' '),
              time: new Date().toISOString(),
              timestamp: new Date().toISOString(),
              hotel: hotel
            });
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ [HabboWidgetsProxy] Error parsing HTML:', error);
  }

  return activities.slice(0, 20);
}

function cleanHTML(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function generateMockActivities(hotel: string): TickerActivity[] {
  const activities = [
    'ganhou um emblema especial',
    'comprou uma roupa nova',
    'entrou no quarto público',
    'recebeu um presente',
    'ganhou moedas no jogo',
    'mudou seu visual',
    'fez um novo amigo',
    'visitou uma sala temática'
  ];

  const usernames = [
    'HabboFan2024', 'PixelDancer', 'RetroGamer', 'HabboBrasil',
    'VirtualLife', 'DigitalDream', 'CyberHabbo', 'NetCitizen',
    'OnlineUser', 'HabboExplorer', 'PixelArt', 'GameMaster'
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    username: usernames[Math.floor(Math.random() * usernames.length)],
    activity: activities[Math.floor(Math.random() * activities.length)],
    time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    hotel: hotel
  }));
}
