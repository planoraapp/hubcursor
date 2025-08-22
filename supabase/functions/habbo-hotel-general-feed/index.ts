import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotelFeedActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
  type: 'look_change' | 'motto_change' | 'badge' | 'friends' | 'photos' | 'groups' | 'online';
  details?: {
    newFriends?: Array<{ name: string; avatar?: string }>;
    newBadges?: Array<{ code: string; name?: string }>;
    newGroups?: Array<{ name: string; badge?: string }>;
    newPhotos?: Array<{ url: string; roomName?: string }>;
    newMotto?: string;
    previousMotto?: string;
  };
}

interface HotelFeedResponse {
  activities: HotelFeedActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    hotel: string;
  };
}

// Cache system
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any): void {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

// Fetch with retry
async function fetchHabboAPI(url: string, retries = 2): Promise<any> {
  console.log(`🌐 [FETCH] Tentando buscar: ${url}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(8000) // 8 segundos timeout
      });
      
      console.log(`🌐 [FETCH] Status: ${response.status} para ${url}`);
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          console.log(`🌐 [FETCH] Não encontrado (${response.status}): ${url}`);
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`✅ [FETCH] Dados recebidos para: ${url}`);
      return data;
    } catch (error) {
      console.warn(`⚠️ [FETCH] Tentativa ${i + 1} falhou para ${url}:`, error);
      if (i === retries - 1) {
        console.error(`❌ [FETCH] Todas as tentativas falharam para: ${url}`);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

serve(async (req) => {
  console.log(`🏨 [HOTEL FEED START] ===== EDGE FUNCTION INICIADA =====`);
  console.log(`🏨 [HOTEL FEED START] Método: ${req.method}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log(`📥 [INPUT] Body recebido:`, requestBody);
    
    const { hotel = 'com.br', limit = 20 } = requestBody;
    
    console.log(`📊 [PARAMS] Hotel: ${hotel}, Limit: ${limit}`);
    
    // Check cache first
    const cacheKey = `hotel_feed_${hotel}_${limit}`;
    const cachedData = getCached(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Retornando dados em cache para hotel ${hotel}`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔄 [CACHE MISS] Cache não encontrado, buscando dados...`);

    // Connect to Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const activities: HotelFeedActivity[] = [];
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    console.log(`🗄️ [DB] Buscando atividades recentes do banco de dados...`);
    
    // Get recent activities from database
    const { data: dbActivities, error: dbError } = await supabase
      .from('habbo_activities')
      .select('*')
      .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
      .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()) // Últimas 6 horas
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (dbError) {
      console.error(`❌ [DB ERROR] Erro ao buscar atividades:`, dbError);
    } else {
      console.log(`✅ [DB] Encontradas ${dbActivities?.length || 0} atividades no banco`);
    }

    // Process database activities
    if (dbActivities && dbActivities.length > 0) {
      console.log(`🔄 [DB PROCESSING] Processando atividades do banco...`);
      
      for (const dbActivity of dbActivities.slice(0, limit)) {
        // Fetch current user data for figure
        let userData = null;
        try {
          const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(dbActivity.habbo_name)}`;
          userData = await fetchHabboAPI(url, 1);
        } catch (error) {
          console.warn(`⚠️ [USER API] Erro ao buscar ${dbActivity.habbo_name}:`, error);
        }
        
        let activityDescription = dbActivity.description || 'realizou uma atividade';
        let activityType: HotelFeedActivity['type'] = 'online';
        const details: HotelFeedActivity['details'] = {};
        
        // Enhanced activity processing based on type
        switch (dbActivity.activity_type) {
          case 'badge':
            activityType = 'badge';
            const badgeDetails = dbActivity.details?.new_badges || dbActivity.new_data?.selectedBadges;
            if (badgeDetails && badgeDetails.length > 0) {
              const newBadges = badgeDetails.slice(0, 3).map((badge: any) => ({
                code: badge.code,
                name: badge.name || badge.code
              }));
              details.newBadges = newBadges;
              activityDescription = `conquistou ${newBadges.length} novo${newBadges.length > 1 ? 's' : ''} emblema${newBadges.length > 1 ? 's' : ''}`;
            }
            break;
          
          case 'motto_change':
            activityType = 'motto_change';
            const newMotto = dbActivity.details?.new_motto || dbActivity.new_data?.motto;
            const oldMotto = dbActivity.details?.old_motto || dbActivity.old_data?.motto;
            if (newMotto) {
              details.newMotto = newMotto;
              details.previousMotto = oldMotto;
              activityDescription = `mudou a missão`;
            }
            break;
          
          case 'look_change':
            activityType = 'look_change';
            activityDescription = `mudou o visual`;
            break;
          
          case 'friends_update':
            activityType = 'friends';
            const friendsAdded = dbActivity.details?.friends_added || dbActivity.details?.new_friends;
            if (friendsAdded && friendsAdded.length > 0) {
              const newFriends = friendsAdded.slice(0, 5).map((friend: any) => ({
                name: friend.name || friend,
                avatar: friend.avatar
              }));
              details.newFriends = newFriends;
              activityDescription = `fez ${newFriends.length} novo${newFriends.length > 1 ? 's' : ''} amigo${newFriends.length > 1 ? 's' : ''}`;
            }
            break;
          
          case 'status_change':
            activityType = 'online';
            const isOnline = dbActivity.details?.online || dbActivity.new_data?.online;
            activityDescription = isOnline ? 'ficou online' : 'saiu do hotel';
            break;
        }
        
        activities.push({
          username: dbActivity.habbo_name,
          activity: activityDescription,
          timestamp: dbActivity.created_at || dbActivity.detected_at,
          figureString: userData?.figureString || 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
          hotel: hotel,
          type: activityType,
          details: Object.keys(details).length > 0 ? details : undefined
        });
      }
      
      console.log(`✅ [DB PROCESSING] Processadas ${activities.length} atividades do banco`);
    }

    // If we don't have enough activities, get random users from the database
    if (activities.length < limit) {
      console.log(`🎲 [RANDOM USERS] Buscando usuários aleatórios para completar feed...`);
      
      // Get random users from our database (using created_at since last_seen doesn't exist)
      const { data: randomUsers } = await supabase
        .from('habbo_accounts')
        .select('habbo_name, figure_string, motto')
        .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 7 dias
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (randomUsers && randomUsers.length > 0) {
        console.log(`📋 [DB USERS] Encontrados ${randomUsers.length} usuários do banco de dados`);
        
        // Use database users for synthetic activities
        for (const dbUser of randomUsers.slice(0, Math.min(15, limit - activities.length))) {
          try {
            const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(dbUser.habbo_name)}`;
            const userData = await fetchHabboAPI(url, 1);
            
            if (userData) {
              const syntheticActivities = generateSyntheticActivities(userData, hotel);
              activities.push(...syntheticActivities.slice(0, 1));
            } else {
              // Create minimal activity from database data
              activities.push({
                username: dbUser.habbo_name,
                activity: 'fez login no hotel',
                timestamp: new Date(Date.now() - Math.random() * 3 * 60 * 60 * 1000).toISOString(),
                figureString: dbUser.figure_string || 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
                hotel: hotel,
                type: 'online'
              });
            }
          } catch (error) {
            console.warn(`⚠️ [RANDOM USER] Erro ao processar ${dbUser.habbo_name}:`, error);
          }
          
          if (activities.length >= limit) break;
        }
      } else {
        console.log(`⚠️ [FALLBACK] Nenhum usuário encontrado no banco, usando dados de fallback mínimos`);
        
        // Minimal fallback if no users found
        const fallbackUsers = ['CoolPlayer', 'PixelArt', 'RoomMaster'];
        for (const username of fallbackUsers.slice(0, Math.min(3, limit - activities.length))) {
          const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(username)}`;
          const userData = await fetchHabboAPI(url, 1);
          
          if (userData) {
            const syntheticActivities = generateSyntheticActivities(userData, hotel);
            activities.push(...syntheticActivities.slice(0, 1));
          }
        }
      }
    }
    
    // Sort by timestamp
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    console.log(`🎯 [FINAL] Total de ${activities.length} atividades processadas`);
    
    const response: HotelFeedResponse = {
      activities: activities.slice(0, limit),
      metadata: {
        source: dbActivities && dbActivities.length > 0 ? 'database_mixed' : 'synthetic',
        timestamp: new Date().toISOString(),
        count: activities.length,
        hotel: hotel
      }
    };

    // Cache the response
    setCached(cacheKey, response);
    console.log(`💾 [CACHE] Resposta salva no cache`);
    
    console.log(`✅ [HOTEL FEED END] Retornando ${response.activities.length} atividades`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [HOTEL FEED ERROR] Erro crítico:', error);
    
    // Fallback response
    const fallbackResponse: HotelFeedResponse = {
      activities: [
        {
          username: 'HabboSystem',
          activity: 'sistema em manutenção',
          timestamp: new Date().toISOString(),
          figureString: 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
          hotel: 'com.br',
          type: 'online'
        }
      ],
      metadata: {
        source: 'error_fallback',
        timestamp: new Date().toISOString(),
        count: 1,
        hotel: 'com.br'
      }
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to generate synthetic activities
function generateSyntheticActivities(userData: any, hotel: string): HotelFeedActivity[] {
  const activities: HotelFeedActivity[] = [];
  const now = new Date();
  
  const getRecentTimestamp = (maxHoursAgo: number = 1.5) => {
    const hoursAgo = Math.random() * maxHoursAgo;
    const timestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    return timestamp.toISOString();
  };

  // Check if user is recently active
  const isRecentlyActive = userData.online || (userData.lastAccessTime && 
    new Date(userData.lastAccessTime).getTime() > (now.getTime() - 2 * 60 * 60 * 1000));

  const possibleActivities = [];

  // Online status - higher priority for recently active users
  if (userData.online) {
    possibleActivities.push({
      type: 'online' as const,
      activity: "está online agora",
      timestamp: getRecentTimestamp(0.05), // Últimos 3 minutos
      priority: 15
    });
  } else if (isRecentlyActive) {
    possibleActivities.push({
      type: 'online' as const,
      activity: "esteve online recentemente",
      timestamp: getRecentTimestamp(0.5),
      priority: 12
    });
  }

  // Badges - filtrar emblemas antigos mais rigorosamente
  if (userData.selectedBadges && userData.selectedBadges.length > 0 && isRecentlyActive) {
    // Filtrar emblemas antigos de forma muito mais rigorosa
    const recentBadges = userData.selectedBadges.filter((badge: any) => {
      const badgeCode = badge.code || '';
      // Lista expandida de códigos antigos para filtrar
      const isOldBadge = badgeCode.match(/^(ACH_|ADM_|VIP_|DEV_|MOD_|HC[0-9]|Club[0-9]|DE[0-9]|HABBO[0-9]|2009|2008|2007|2010|2006|2005|oldschool|vintage|classic|retro)/i);
      const isSystemBadge = badgeCode.match(/^(SYS_|TEMP_|TEST_|BOT_)/i);
      return !isOldBadge && !isSystemBadge;
    });
    
    if (recentBadges.length > 0 && Math.random() < 0.15) { // Reduzir chance para 15%
      const badge = recentBadges[Math.floor(Math.random() * recentBadges.length)];
      possibleActivities.push({
        type: 'badge' as const,
        activity: `conquistou o emblema ${badge.name || badge.code}`,
        timestamp: getRecentTimestamp(0.3), // Muito mais recente - 18 minutos
        priority: 8,
        details: {
          newBadges: [{ code: badge.code, name: badge.name || badge.code }]
        }
      });
    }
  }

  // Visual change - only for recently active users
  if (userData.figureString && isRecentlyActive) {
    possibleActivities.push({
      type: 'look_change' as const,
      activity: "mudou o visual",
      timestamp: getRecentTimestamp(1),
      priority: 8
    });
  }

  // Motto change - only if motto exists and user is active
  if (userData.motto && userData.motto.length > 0 && isRecentlyActive) {
    possibleActivities.push({
      type: 'motto_change' as const,
      activity: `mudou a missão: "${userData.motto}"`,
      timestamp: getRecentTimestamp(1.2),
      priority: 7,
      details: {
        newMotto: userData.motto
      }
    });
  }

  // Select the most relevant activity based on user activity level
  const selectedActivity = possibleActivities
    .sort((a, b) => b.priority - a.priority)[0];

  if (selectedActivity) {
    activities.push({
      username: userData.name,
      activity: selectedActivity.activity,
      timestamp: selectedActivity.timestamp,
      figureString: userData.figureString,
      hotel: hotel,
      type: selectedActivity.type,
      details: selectedActivity.details
    });
  }

  return activities;
}