
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
  description: string;
  action: string;
  time: string;
  timestamp: string;
  hotel: string;
}

interface TickerResponse {
  activities: TickerActivity[];
  meta: {
    source: 'live' | 'cache' | 'mock';
    timestamp: string;
    hotel: string;
    count: number;
  };
}

const REALISTIC_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15'
];

const ACCEPT_LANGUAGES = ['pt-BR,pt;q=0.9,en;q=0.8', 'en-US,en;q=0.9', 'pt-PT,pt;q=0.9,en;q=0.8'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 [HabboWidgetsProxy] Starting enhanced ticker fetch...');
    
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

    // Try to fetch from server cache first (2 minutes for live data)
    const cacheKey = `ticker_${hotel}`;
    const { data: cachedData } = await supabase
      .from('habbo_emotion_api_cache')
      .select('*')
      .eq('endpoint', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedData?.response_data && cachedData.status === 'success') {
      console.log(`✅ [HabboWidgetsProxy] Returning cached LIVE data for ${hotel}`);
      return new Response(
        JSON.stringify({
          activities: cachedData.response_data,
          meta: {
            source: 'cache',
            timestamp: cachedData.created_at,
            hotel: hotel,
            count: cachedData.item_count || cachedData.response_data.length
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to fetch live data with enhanced headers and retries
    const endpoints = [
      `https://habbowidgets.com/habbo/ticker?hotel=${hotel}`,
      `https://www.habbowidgets.com/habbo/ticker?hotel=${hotel}`,
      `https://habbowidgets.com/habbo/ticker?hotel=${hotel}&_t=${Date.now()}`
    ];

    let activities: TickerActivity[] = [];
    let lastError = null;
    let retryCount = 0;
    const maxRetries = 3;

    for (const endpoint of endpoints) {
      for (let attempt = 0; attempt < maxRetries && activities.length === 0; attempt++) {
        try {
          const delay = attempt > 0 ? Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 5000) : 0;
          if (delay > 0) {
            console.log(`⏳ [HabboWidgetsProxy] Retry ${attempt + 1} for ${endpoint} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          console.log(`🌐 [HabboWidgetsProxy] Trying ${endpoint} (attempt ${attempt + 1})`);
          
          const userAgent = REALISTIC_USER_AGENTS[Math.floor(Math.random() * REALISTIC_USER_AGENTS.length)];
          const acceptLang = ACCEPT_LANGUAGES[Math.floor(Math.random() * ACCEPT_LANGUAGES.length)];
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'User-Agent': userAgent,
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
              'Accept-Language': acceptLang,
              'Accept-Encoding': 'gzip, deflate, br',
              'DNT': '1',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Sec-Fetch-Dest': 'document',
              'Sec-Fetch-Mode': 'navigate',
              'Sec-Fetch-Site': 'none',
              'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
              'Sec-Ch-Ua-Mobile': '?0',
              'Sec-Ch-Ua-Platform': '"Windows"',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Referer': 'https://habbowidgets.com/'
            }
          });

          if (response.ok) {
            const html = await response.text();
            console.log(`📄 [HabboWidgetsProxy] Got ${html.length} chars from ${endpoint}`);
            
            activities = parseTickerHTML(html, hotel);
            if (activities.length > 0) {
              console.log(`✅ [HabboWidgetsProxy] Parsed ${activities.length} activities from ${endpoint}`);
              break;
            }
          } else {
            console.log(`❌ [HabboWidgetsProxy] HTTP ${response.status} from ${endpoint}`);
            lastError = `HTTP ${response.status}: ${response.statusText}`;
          }
          retryCount++;
        } catch (error) {
          console.log(`❌ [HabboWidgetsProxy] Error with ${endpoint} (attempt ${attempt + 1}):`, error);
          lastError = error;
          retryCount++;
        }
      }
      
      if (activities.length > 0) break;
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

      const response: TickerResponse = {
        activities,
        meta: {
          source: 'live',
          timestamp: new Date().toISOString(),
          hotel: hotel,
          count: activities.length
        }
      };

      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No live data - try to get any cached data (even expired)
    console.warn(`⚠️ [HabboWidgetsProxy] No live data after ${retryCount} attempts. Trying any cached data...`);
    
    const { data: anyCachedData } = await supabase
      .from('habbo_emotion_api_cache')
      .select('*')
      .eq('endpoint', cacheKey)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (anyCachedData?.response_data) {
      console.log(`📋 [HabboWidgetsProxy] Using stale cached data for ${hotel} (age: ${Math.round((Date.now() - new Date(anyCachedData.created_at).getTime()) / 60000)} minutes)`);
      
      const response: TickerResponse = {
        activities: anyCachedData.response_data,
        meta: {
          source: 'cache',
          timestamp: anyCachedData.created_at,
          hotel: hotel,
          count: anyCachedData.item_count || anyCachedData.response_data.length
        }
      };
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Final fallback to mock data
    console.warn(`⚠️ [HabboWidgetsProxy] All sources failed, using mock data. Last error:`, lastError);
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
    
    const response: TickerResponse = {
      activities: mockActivities,
      meta: {
        source: 'mock',
        timestamp: new Date().toISOString(),
        hotel: hotel,
        count: mockActivities.length
      }
    };
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ [HabboWidgetsProxy] Fatal error:', error);
    
    const hotel = 'com.br';
    const mockActivities = generateMockActivities(hotel);
    
    const response: TickerResponse = {
      activities: mockActivities,
      meta: {
        source: 'mock',
        timestamp: new Date().toISOString(),
        hotel: hotel,
        count: mockActivities.length
      }
    };
    
    return new Response(
      JSON.stringify(response),
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
    // Enhanced parsing patterns
    const patterns = [
      // Look for ticker entries
      /<div[^>]*class="[^"]*ticker[^"]*"[^>]*>(.*?)<\/div>/gis,
      /<li[^>]*class="[^"]*ticker[^"]*"[^>]*>(.*?)<\/li>/gis,
      // Look for activity entries
      /<div[^>]*class="[^"]*activity[^"]*"[^>]*>(.*?)<\/div>/gis,
      /<span[^>]*class="[^"]*activity[^"]*"[^>]*>(.*?)<\/span>/gis,
      // Generic patterns
      /<li[^>]*>(.*?)<\/li>/gis,
      /<p[^>]*>(.*?)<\/p>/gis,
      // JSON data in script tags
      /<script[^>]*>.*?ticker.*?(\[.*?\]).*?<\/script>/gis
    ];

    for (const pattern of patterns) {
      const matches = html.matchAll(pattern);
      
      for (const match of matches) {
        const content = match[1];
        if (content && (content.includes('@') || content.includes('ganhou') || content.includes('recebeu'))) {
          // Try to extract username and activity
          const cleanContent = cleanHTML(content);
          const activityMatch = cleanContent.match(/(\w+)\s+(.*)/);
          if (activityMatch && activityMatch[1].length > 0) {
            const timestamp = new Date().toISOString();
            activities.push({
              username: activityMatch[1],
              activity: activityMatch[2] || 'fez uma atividade',
              description: activityMatch[2] || 'fez uma atividade',
              action: 'activity',
              time: timestamp,
              timestamp: timestamp,
              hotel: hotel
            });
          }
        }
      }
    }

    // If no structured data found, look for common Portuguese activity patterns
    if (activities.length === 0) {
      const textMatches = html.match(/(\w+)\s+(ganhou|recebeu|comprou|entrou|saiu|visitou|fez)/gi);
      if (textMatches) {
        textMatches.slice(0, 15).forEach((match, index) => {
          const parts = match.split(' ');
          if (parts.length >= 2 && parts[0].length > 0) {
            const timestamp = new Date(Date.now() - index * 60000).toISOString(); // Spread activities over time
            activities.push({
              username: parts[0],
              activity: parts.slice(1).join(' '),
              description: parts.slice(1).join(' '),
              action: 'activity',
              time: timestamp,
              timestamp: timestamp,
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
    .replace(/\s+/g, ' ')
    .trim();
}

function generateMockActivities(hotel: string): TickerActivity[] {
  const activities = [
    'ganhou um emblema especial',
    'comprou uma roupa nova no catálogo',
    'entrou no quarto público Piscina',
    'recebeu um presente de amigo',
    'ganhou moedas no jogo',
    'mudou seu visual no salão',
    'fez um novo amigo',
    'visitou uma sala temática',
    'ganhou um troféu na competição',
    'comprou um móvel raro',
    'entrou no quarto Lobby Principal',
    'recebeu uma medalha de honra',
    'participou de um evento especial',
    'mudou sua missão pessoal',
    'visitou o quarto de um amigo'
  ];

  const usernames = [
    'HabboFan2024', 'PixelDancer', 'RetroGamer', 'HabboBrasil',
    'VirtualLife', 'DigitalDream', 'CyberHabbo', 'NetCitizen',
    'OnlineUser', 'HabboExplorer', 'PixelArt', 'GameMaster',
    'HabboStar', 'DigitalNinja', 'VirtualHero', 'HabboPro'
  ];

  return Array.from({ length: 18 }, (_, i) => {
    const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    return {
      username: usernames[Math.floor(Math.random() * usernames.length)],
      activity,
      description: activity,
      action: 'activity',
      time: timestamp,
      timestamp,
      hotel: hotel
    };
  });
}
