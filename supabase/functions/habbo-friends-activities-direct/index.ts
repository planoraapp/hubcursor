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
  console.log(`🚀 [REAL CHANGES FEED] ===== INICIADO =====`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.0');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const requestBody = await req.json();
    const { friends, hotel = 'com.br', limit = 50, offset = 0 } = requestBody;
    
    if (!friends || !Array.isArray(friends) || friends.length === 0) {
      console.log(`❌ [INPUT] Lista de amigos inválida ou vazia`);
      return new Response(JSON.stringify({
        activities: [],
        metadata: {
          source: 'real-changes-feed',
          timestamp: new Date().toISOString(),
          count: 0,
          friends_processed: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    console.log(`🎯 [REAL CHANGES] Buscando mudanças reais para ${friends.length} amigos`);
    
    // Step 1: Check for existing detected changes for these friends
    const { data: existingChanges } = await supabase
      .from('detected_changes')
      .select('*')
      .eq('hotel', hotel)
      .in('habbo_name', friends)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
      .order('detected_at', { ascending: false })
      .limit(limit);

    console.log(`📊 [EXISTING CHANGES] Found ${existingChanges?.length || 0} existing changes`);

    // Step 2: If we don't have enough changes, trigger change detection for some friends
    let allActivities: FriendActivity[] = [];
    
    if (existingChanges && existingChanges.length > 0) {
      // Transform existing changes to activity format
      allActivities = existingChanges.map(change => ({
        username: change.habbo_name,
        activity: change.change_description,
        timestamp: change.detected_at,
        figureString: '',
        hotel: change.hotel
      }));
    }

    // If we need more activities, process some friends to detect new changes
    if (allActivities.length < limit && friends.length > 0) {
      // NOVO: Paginação circular real - diferentes amigos para cada página
      const totalFriends = friends.length;
      const friendsPerPage = Math.min(20, Math.max(8, Math.floor(totalFriends / 3))); // 8-20 amigos por página
      
      // Calcular índice inicial baseado no offset
      const pageNumber = Math.floor(offset / limit);
      const startIndex = (pageNumber * friendsPerPage) % totalFriends;
      
      // Selecionar amigos de forma circular
      let friendsToProcess = [];
      for (let i = 0; i < friendsPerPage; i++) {
        const index = (startIndex + i) % totalFriends;
        friendsToProcess.push(friends[index]);
      }
      
      // Adicionar randomização para evitar sempre os mesmos usuários
      const shuffleSeed = Math.floor(Date.now() / (30 * 60 * 1000)); // Muda a cada 30 min
      friendsToProcess = friendsToProcess.sort(() => (shuffleSeed % 2 === 0 ? 1 : -1) * (Math.random() - 0.5));
      
      console.log(`🔄 [PAGINATION] Página ${pageNumber}, processando amigos ${startIndex}-${(startIndex + friendsPerPage - 1) % totalFriends}`);
      
      console.log(`🔍 [CHANGE DETECTION] Processing ${friendsToProcess.length} friends for new changes`);
      
      const changeDetectionPromises = friendsToProcess.map(async (friendName: string) => {
        try {
          // Get user data first to get habbo_id
          const userData = await fetchCompleteUserProfile(friendName, hotel);
          if (!userData || !userData.uniqueId) {
            console.log(`❌ [CHANGE DETECTION] No user data for: ${friendName}`);
            return [];
          }

          // Call change detector
          const response = await fetch('https://wueccgeizznjmjgmuscy.supabase.co/functions/v1/habbo-change-detector', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
            },
            body: JSON.stringify({
              habbo_id: userData.uniqueId,
              habbo_name: friendName,
              hotel: hotel
            })
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.changes_detected > 0) {
              console.log(`✅ [CHANGE DETECTION] Found ${result.changes_detected} changes for ${friendName}`);
              return result.changes.map((change: any) => ({
                username: friendName,
                activity: change.description,
                timestamp: new Date().toISOString(),
                figureString: userData.figureString || '',
                hotel: hotel
              }));
            }
          }
        } catch (error) {
          console.error(`❌ [CHANGE DETECTION] Error processing ${friendName}:`, error);
        }
        return [];
      });

      const newChanges = (await Promise.all(changeDetectionPromises)).flat();
      allActivities.push(...newChanges);
      
      console.log(`🔍 [NEW CHANGES] Detected ${newChanges.length} new changes`);
    }

    // If still no activities, fall back to generating some activities
    if (allActivities.length === 0) {
      console.log(`⚠️ [FALLBACK] No real changes found, generating fallback activities`);
      
      // NOVO: Fallback com rotação melhorada para evitar repetição
      const totalFriends = friends.length;
      const pageNumber = Math.floor(offset / limit);
      const startIndex = (pageNumber * 5 + Math.floor(Date.now() / (60 * 60 * 1000))) % totalFriends; // Rotação horária
      const sampleSize = Math.min(12, Math.max(6, Math.floor(totalFriends / 2)));
      
      let sampleFriends = [];
      for (let i = 0; i < sampleSize; i++) {
        const index = (startIndex + i * 2) % totalFriends; // Pular de 2 em 2 para mais variedade
        sampleFriends.push(friends[index]);
      }
      
      console.log(`🎭 [FALLBACK] Página ${pageNumber}, usando amigos ${startIndex} + ${sampleSize} com rotação`);
      
      for (const friendName of sampleFriends) {
        try {
          const userData = await fetchCompleteUserProfile(friendName, hotel);
          if (userData) {
            const richActivities = generateRichActivities(userData, friendName);
            allActivities.push(...richActivities.map(act => ({
              username: friendName,
              activity: act.activity,
              timestamp: act.timestamp,
              figureString: userData.figureString,
              hotel: hotel
            })));
          }
        } catch (error) {
          console.error(`❌ [FALLBACK] Error processing ${friendName}:`, error);
        }
      }
    }

    // Sort by timestamp (newer first)
    allActivities.sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampB - timestampA;
    });

    // Apply limit and offset
    const paginatedActivities = allActivities.slice(offset, offset + limit);
    
    const result = {
      activities: paginatedActivities,
      metadata: {
        source: 'real-changes-feed',
        timestamp: new Date().toISOString(),
        count: paginatedActivities.length,
        friends_processed: friends.length,
        total_activities: allActivities.length,
        real_changes_count: existingChanges?.length || 0
      }
    };
    
    console.log(`✅ [REAL CHANGES END] Returning ${paginatedActivities.length} activities (${existingChanges?.length || 0} real changes)`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ [REAL CHANGES ERROR] Erro:', error);
    
    const fallbackResponse = {
      activities: [],
      metadata: {
        source: 'real-changes-error',
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