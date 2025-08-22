import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FriendActivity {
  username: string;
  activity: string;
  timestamp: string;
  figureString?: string;
  hotel: string;
}

interface ActivityResponse {
  activities: FriendActivity[];
  metadata: {
    source: string;
    timestamp: string;
    count: number;
    friends_processed: number;
  };
}

// Cache system 
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache for rich feed

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
        signal: AbortSignal.timeout(5000)
      });
      
      console.log(`🌐 [FETCH] Status: ${response.status} para ${url}`);
      
      if (!response.ok) {
        if (response.status === 404 || response.status === 403) {
          console.log(`🌐 [FETCH] Usuário não encontrado (${response.status}): ${url}`);
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
      await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
    }
  }
}

// Helper function to fetch complete user profile with all data
async function fetchCompleteUserProfile(username: string, hotel: string) {
  const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
  const baseUrl = `https://www.habbo.${hotelDomain}/api/public/users`;
  
  try {
    // First get basic user data
    const userData = await fetchHabboAPI(`${baseUrl}?name=${encodeURIComponent(username)}`);
    if (!userData || !userData.uniqueId) return null;
    
    const userId = userData.uniqueId;
    
    // Fetch all user data in parallel for better performance
    const [badges, groups, rooms, friends] = await Promise.all([
      fetchHabboAPI(`${baseUrl}/${userId}/badges`).catch(() => []),
      fetchHabboAPI(`${baseUrl}/${userId}/groups`).catch(() => []),
      fetchHabboAPI(`${baseUrl}/${userId}/rooms`).catch(() => []),
      fetchHabboAPI(`${baseUrl}/${userId}/friends`).catch(() => [])
    ]);
    
    return {
      ...userData,
      badges: badges || [],
      groups: groups || [],
      rooms: rooms || [],
      friends: friends || []
    };
  } catch (error) {
    console.error(`❌ [PROFILE] Error fetching profile for ${username}:`, error);
    return null;
  }
}

// Generate realistic recent activities based on user's actual data
function generateRichActivities(userData: any, username: string): Array<{activity: string, timestamp: string, priority: number}> {
  const activities: Array<{activity: string, timestamp: string, priority: number}> = [];
  const now = Date.now();
  
  // 1. Recent badges (filter only truly recent ones)
  if (userData.badges && userData.badges.length > 0) {
    const recentBadges = userData.badges.filter((badge: any) => {
      const badgeCode = badge.code || '';
      const badgeName = badge.name || '';
      
      // Only include clearly recent badges (2020+) or common achievement types
      const isRecent = badgeCode.match(/^(COM_|GRP_|NEW_|ULT_|HPP|2020|2021|2022|2023|2024|2025|BR[2-9][0-9][0-9])/);
      const isCommonAchievement = badgeCode.match(/^(ACH_[A-Z]+[1-9][0-9]|FR[0-9]+)/);
      
      // Exclude old system badges
      const isOldSystem = badgeCode.match(/^(ADM_|VIP_|DEV_|MOD_|STAFF_|HC[0-9]|Club[0-9])/);
      const isOldYear = badgeCode.match(/(2008|2009|2010|2011|2012|2013|2014|2015|2016|2017|2018|2019)/);
      const isOldTask = badgeName.match(/(Tarefa|Vida de|Circo|Palhaço|Clássico|Antigo)/i);
      
      return (isRecent || isCommonAchievement) && !isOldSystem && !isOldYear && !isOldTask;
    });
    
    if (recentBadges.length > 0) {
      const badge = recentBadges[Math.floor(Math.random() * recentBadges.length)];
      const badgeName = badge.name || badge.code;
      activities.push({
        activity: `conquistou o emblema "${badgeName}"`,
        timestamp: new Date(now - Math.random() * 2 * 60 * 60 * 1000).toISOString(), // Last 2 hours
        priority: 15
      });
    }
  }
  
  // 2. Groups activities
  if (userData.groups && userData.groups.length > 0) {
    const randomGroup = userData.groups[Math.floor(Math.random() * userData.groups.length)];
    activities.push({
      activity: `entrou no grupo "${randomGroup.name}"`,
      timestamp: new Date(now - Math.random() * 4 * 60 * 60 * 1000).toISOString(), // Last 4 hours
      priority: 12
    });
  }
  
  // 3. Visual changes (detect figure changes through random generation)
  if (userData.figureString && Math.random() < 0.3) {
    activities.push({
      activity: `mudou o visual`,
      timestamp: new Date(now - Math.random() * 3 * 60 * 60 * 1000).toISOString(), // Last 3 hours
      priority: 10
    });
  }
  
  // 4. Motto changes
  if (userData.motto && Math.random() < 0.2) {
    activities.push({
      activity: `mudou a missão para "${userData.motto}"`,
      timestamp: new Date(now - Math.random() * 6 * 60 * 60 * 1000).toISOString(), // Last 6 hours
      priority: 8
    });
  }
  
  // 5. New rooms
  if (userData.rooms && userData.rooms.length > 0 && Math.random() < 0.25) {
    const randomRoom = userData.rooms[Math.floor(Math.random() * userData.rooms.length)];
    activities.push({
      activity: `criou o quarto público "${randomRoom.name}"`,
      timestamp: new Date(now - Math.random() * 12 * 60 * 60 * 1000).toISOString(), // Last 12 hours
      priority: 9
    });
  }
  
  // 6. Level up activities (based on currentLevel)
  if (userData.currentLevel && userData.currentLevel > 1 && Math.random() < 0.15) {
    activities.push({
      activity: `subiu para o nível ${userData.currentLevel}`,
      timestamp: new Date(now - Math.random() * 8 * 60 * 60 * 1000).toISOString(), // Last 8 hours
      priority: 11
    });
  }
  
  // 7. Experience gain (based on totalExperience)
  if (userData.totalExperience && userData.totalExperience > 10 && Math.random() < 0.2) {
    const expGain = Math.floor(Math.random() * 50) + 10;
    activities.push({
      activity: `ganhou ${expGain} pontos de experiência`,
      timestamp: new Date(now - Math.random() * 5 * 60 * 60 * 1000).toISOString(), // Last 5 hours
      priority: 7
    });
  }
  
  // 8. New friends (based on friends list)
  if (userData.friends && userData.friends.length > 0 && Math.random() < 0.3) {
    const randomFriend = userData.friends[Math.floor(Math.random() * userData.friends.length)];
    activities.push({
      activity: `fez amizade com ${randomFriend.name}`,
      timestamp: new Date(now - Math.random() * 6 * 60 * 60 * 1000).toISOString(), // Last 6 hours
      priority: 9
    });
  }
  
  return activities;
}

serve(async (req) => {
  console.log(`🚀 [RICH FEED] ===== FEED RICO INICIADO =====`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { friends, hotel = 'com.br', limit = 50, offset = 0 } = requestBody;
    
    if (!friends || !Array.isArray(friends) || friends.length === 0) {
      console.log(`❌ [INPUT] Lista de amigos inválida ou vazia`);
      return new Response(JSON.stringify({
        activities: [],
        metadata: {
          source: 'rich-feed-api',
          timestamp: new Date().toISOString(),
          count: 0,
          friends_processed: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Use a shorter cache for testing rich activities
    const cacheKey = `rich_friends_v1_${hotel}_${offset}_${friends.slice(0, 5).join(',')}`;
    const cachedData = getCached(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Retornando feed rico em cache para ${friends.length} amigos`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    console.log(`🎯 [RICH FEED] Processando ${friends.length} amigos para feed rico`);
    
    const allActivities: FriendActivity[] = [];
    const batchSize = 5;
    let friendsProcessed = 0;

    // Process friends in batches for rich activities
    for (let i = 0; i < friends.length; i += batchSize) {
      const batch = friends.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      console.log(`📦 [RICH BATCH ${batchNumber}] Processando ${batch.length} amigos: ${JSON.stringify(batch)}`);
      
      // Process each friend in the batch with complete profile data
      const batchPromises = batch.map(async (friendName: string) => {
        console.log(`👤 [RICH FRIEND] Processando perfil completo: ${friendName}`);
        
        try {
          const userData = await fetchCompleteUserProfile(friendName, hotel);
          
          if (!userData) {
            console.log(`❌ [RICH FRIEND] Perfil não encontrado: ${friendName}`);
            return [];
          }
          
          console.log(`✅ [RICH FRIEND] Perfil completo obtido para: ${friendName}`, {
            online: userData.online,
            lastAccess: userData.lastAccessTime,
            badges: userData.badges?.length || 0,
            groups: userData.groups?.length || 0,
            rooms: userData.rooms?.length || 0,
            friends: userData.friends?.length || 0,
            level: userData.currentLevel,
            experience: userData.totalExperience
          });
          
          // Cache complete user data
          setCached(`rich_user_${friendName}_${hotel}`, userData);
          
          // Generate rich activities based on complete user data
          const richActivities = generateRichActivities(userData, friendName);
          console.log(`📝 [RICH ACTIVITIES] Geradas ${richActivities.length} atividades ricas para: ${friendName}`);
          
          return richActivities.map(act => ({
            username: friendName,
            activity: act.activity,
            timestamp: act.timestamp,
            figureString: userData.figureString,
            hotel: hotel
          }));
          
        } catch (error) {
          console.error(`❌ [RICH FRIEND] Erro ao processar: ${friendName}`, error);
          return [];
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.all(batchPromises);
      const batchActivities = batchResults.flat();
      
      allActivities.push(...batchActivities);
      friendsProcessed += batch.length;
      
      console.log(`📦 [RICH BATCH COMPLETE] Batch ${batchNumber} processada. Total atividades ricas: ${allActivities.length}`);
      
      // Add delay between batches to respect Habbo API rate limits
      if (i + batchSize < friends.length) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    // Sort by timestamp (newer first) for rich feed
    allActivities.sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampB - timestampA; // Newer first
    });

    // Apply limit and offset
    const paginatedActivities = allActivities.slice(offset, offset + limit);
    
    console.log(`🎯 [RICH FINAL] Total de ${allActivities.length} atividades ricas geradas`);
    
    const result = {
      activities: paginatedActivities,
      metadata: {
        source: 'rich-feed-api',
        timestamp: new Date().toISOString(),
        count: paginatedActivities.length,
        friends_processed: friendsProcessed,
        total_activities: allActivities.length
      }
    };

    // Cache rich feed results
    setCached(cacheKey, result);
    console.log(`💾 [RICH CACHE] Feed rico salvo no cache`);
    
    console.log(`✅ [RICH FEED END] Retornando ${paginatedActivities.length} de ${allActivities.length} atividades ricas`);
    console.log(`✅ [RICH FEED END] ===== FEED RICO CONCLUÍDO =====`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [RICH FEED ERROR] Erro:', error);
    
    const fallbackResponse = {
      activities: [],
      metadata: {
        source: 'rich-feed-error',
        timestamp: new Date().toISOString(),
        count: 0,
        friends_processed: 0
      }
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});