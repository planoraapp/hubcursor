
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
const CACHE_TTL = 1 * 60 * 1000; // Reduzido para 1 minuto

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

// ETAPA 3: Fetch com retry mais agressivo
async function fetchHabboAPI(url: string, retries = 2): Promise<any> {
  console.log(`🌐 [FETCH] Tentando buscar: ${url}`);
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
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

serve(async (req) => {
  console.log(`🚀 [EDGE START] ===== EDGE FUNCTION INICIADA =====`);
  console.log(`🚀 [EDGE START] Método: ${req.method}`);
  console.log(`🚀 [EDGE START] URL: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`🔄 [CORS] Respondendo preflight request`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log(`📥 [INPUT] Body recebido:`, requestBody);
    
    const { friends, hotel = 'com.br', limit = 50, offset = 0 } = requestBody;
    
    console.log(`📊 [PARAMS] Processando ${friends?.length || 0} amigos para hotel ${hotel}`);
    console.log(`📊 [PARAMS] Limit: ${limit}, Offset: ${offset}`);
    
    if (!friends || friends.length === 0) {
      console.log(`⚠️ [EARLY EXIT] Nenhum amigo fornecido`);
      return new Response(JSON.stringify({ 
        activities: [], 
        metadata: { 
          source: 'direct_api_no_friends',
          timestamp: new Date().toISOString(),
          count: 0,
          friends_processed: 0 
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    const cacheKey = `friends_activities_${hotel}_${offset}_${friends.slice(0, 5).join(',')}`;
    const cachedData = getCached(cacheKey);
    
    if (cachedData) {
      console.log(`⚡ [CACHE HIT] Retornando dados em cache para ${friends.length} amigos`);
      return new Response(JSON.stringify(cachedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔄 [CACHE MISS] Cache não encontrado, processando...`);

    // FASE 1: Buscar atividades reais do banco de dados
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`🗄️ [DB] Buscando atividades reais dos amigos...`);
    
    const { data: dbActivities, error: dbError } = await supabase
      .from('habbo_activities')
      .select('*')
      .in('habbo_name', friends)
      .eq('hotel', hotel === 'com.br' ? 'br' : hotel)
      .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()) // Últimas 12h (mais recente)
      .order('created_at', { ascending: false })
      .limit(150);
    
    if (dbError) {
      console.error(`❌ [DB ERROR] Erro ao buscar atividades:`, dbError);
    } else {
      console.log(`✅ [DB] Encontradas ${dbActivities?.length || 0} atividades reais no banco`);
    }

    const activities: FriendActivity[] = [];
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    // FASE 1: Converter atividades reais do banco para o formato esperado
    if (dbActivities && dbActivities.length > 0) {
      console.log(`🔄 [DB CONVERSION] Convertendo atividades reais...`);
      
      for (const dbActivity of dbActivities) {
        // Buscar informações atuais do usuário para figureString
        let userData = null;
        try {
          const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(dbActivity.habbo_name)}`;
          userData = await fetchHabboAPI(url, 1);
        } catch (error) {
          console.warn(`⚠️ [USER API] Erro ao buscar ${dbActivity.habbo_name}:`, error);
        }
        
        let activityDescription = dbActivity.description || dbActivity.activity_description || 'realizou uma atividade';
        
        // Melhorar descrições baseadas no tipo de atividade
        switch (dbActivity.activity_type) {
          case 'badge':
            const badgeDetails = dbActivity.details?.new_badges || dbActivity.new_data?.selectedBadges;
            if (badgeDetails && badgeDetails.length > 0) {
              const badge = badgeDetails[0];
              activityDescription = `conquistou o emblema ${badge.name || badge.code}`;
            }
            break;
          case 'motto_change':
            const newMotto = dbActivity.details?.new_motto || dbActivity.new_data?.motto;
            if (newMotto) {
              activityDescription = `mudou a missão: "${newMotto}"`;
            }
            break;
          case 'look_change':
            activityDescription = `mudou o visual`;
            break;
          case 'status_change':
            const isOnline = dbActivity.details?.online || dbActivity.new_data?.online;
            activityDescription = isOnline ? 'ficou online' : 'saiu do hotel';
            break;
        }
        
        activities.push({
          username: dbActivity.habbo_name,
          activity: activityDescription,
          timestamp: dbActivity.created_at || dbActivity.detected_at,
          figureString: userData?.figureString || 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
          hotel: hotel
        });
      }
      
      console.log(`✅ [DB CONVERSION] Convertidas ${activities.length} atividades reais`);
    }
    
    // ETAPA 3: Processamento de amigos para atividades sintéticas complementares
    const batchSize = 5;
    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, friends.length);
    const friendsToProcess = friends.slice(startIndex, endIndex);
    
    console.log(`🔍 [PROCESSING] Processando ${friendsToProcess.length} amigos para atividades sintéticas...`);

    let processedCount = 0;
    
    for (let i = 0; i < friendsToProcess.length; i += batchSize) {
      const batch = friendsToProcess.slice(i, i + batchSize);
      console.log(`📦 [BATCH ${Math.floor(i/batchSize) + 1}] Processando ${batch.length} amigos:`, batch);
      
      const batchPromises = batch.map(async (friendName: string) => {
        try {
          // Clean friend name
          let cleanName = friendName.trim();
          if (cleanName.startsWith(',')) {
            cleanName = cleanName.substring(1).trim();
          }
          if (!cleanName || cleanName.length === 0) {
            console.log(`⚠️ [FRIEND] Nome inválido: "${friendName}"`);
            return null;
          }
          
          console.log(`👤 [FRIEND] Processando: ${cleanName}`);
          
          // Check individual cache
          const userCacheKey = `user_${hotel}_${cleanName}`;
          let userData = getCached(userCacheKey);
          
          if (!userData) {
            const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(cleanName)}`;
            userData = await fetchHabboAPI(url);
            
            if (userData) {
              setCached(userCacheKey, userData);
              console.log(`💾 [CACHE] Dados salvos no cache para: ${cleanName}`);
            }
          } else {
            console.log(`⚡ [CACHE] Dados do cache para: ${cleanName}`);
          }
          
          if (!userData) {
            console.log(`❌ [FRIEND] Sem dados para: ${cleanName} - Usuário privado/não encontrado`);
            // FILTRO: Não retornar atividades para usuários privados
            return null;
          }
          
          console.log(`✅ [FRIEND] Dados obtidos para: ${cleanName}`, {
            online: userData.online,
            lastAccess: userData.lastAccessTime,
            badges: userData.selectedBadges?.length || 0
          });
          
          // Generate realistic activities using new function
          const userActivities = generateRealisticActivitiesForUser(userData, hotel);
          
          console.log(`📝 [ACTIVITIES] Geradas ${userActivities.length} atividades para: ${cleanName}`);
          return userActivities;
          
        } catch (error) {
          console.error(`❌ [FRIEND ERROR] Erro processando ${friendName}:`, error);
          // ETAPA 4: Fallback mesmo com erro
          return [{
            username: friendName,
            activity: `erro ao carregar dados do usuário`,
            timestamp: new Date().toISOString(),
            figureString: 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
            hotel
          }];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      processedCount += batch.length;
      
      // Flatten and add to activities
      batchResults.forEach(result => {
        if (result && result.length > 0) {
          activities.push(...result);
        }
      });
      
      console.log(`📦 [BATCH COMPLETE] Batch ${Math.floor(i/batchSize) + 1} processada. Total atividades: ${activities.length}`);
      
      // Small delay between batches
      if (i + batchSize < friendsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // FASE 1: Ordenar por timestamp real (atividades mais recentes primeiro) com precisão otimizada
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeB !== timeA) return timeB - timeA; // Mais recente primeiro
      // Em caso de empate, ordenar por username alfabeticamente para consistência
      return a.username.localeCompare(b.username);
    });
    
    console.log(`🎯 [FINAL] Total de ${activities.length} atividades (${dbActivities?.length || 0} reais + ${activities.length - (dbActivities?.length || 0)} sintéticas)`);
    
    const response: ActivityResponse = {
      activities: activities.slice(0, 50),
      metadata: {
        source: dbActivities && dbActivities.length > 0 ? 'mixed_real_synthetic' : 'synthetic_only',
        timestamp: new Date().toISOString(),
        count: activities.length,
        friends_processed: friends.length,
        real_activities: dbActivities?.length || 0,
        synthetic_activities: activities.length - (dbActivities?.length || 0)
      }
    };

    // Cache the response
    setCached(cacheKey, response);
    console.log(`💾 [CACHE] Resposta salva no cache`);
    
    console.log(`✅ [EDGE END] ===== EDGE FUNCTION CONCLUÍDA =====`);
    console.log(`✅ [EDGE END] Retornando ${response.activities.length} atividades`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [EDGE ERROR] ===== ERRO CRÍTICO =====');
    console.error('❌ [EDGE ERROR] Erro:', error);
    console.error('❌ [EDGE ERROR] Stack:', error.stack);
    
    // ETAPA 4: Fallback robusto mesmo com erro crítico
    const fallbackResponse = {
      activities: [
        {
          username: 'Sistema',
          activity: 'erro interno do servidor - usando dados de teste',
          timestamp: new Date().toISOString(),
          figureString: 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
          hotel: 'com.br'
        }
      ],
      metadata: {
        source: 'error_fallback',
        timestamp: new Date().toISOString(),
        count: 1,
        friends_processed: 0
      }
    };
    
    return new Response(JSON.stringify(fallbackResponse), {
      status: 200, // Retornar 200 mesmo com erro para não quebrar o frontend
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function generateRealisticActivitiesForUser(userData: any, hotel: string): FriendActivity[] {
  const activities: FriendActivity[] = [];
  const now = new Date();
  
  // Gerar timestamp realista baseado no último acesso
  const getRealisticTimestamp = (maxHoursAgo: number = 2) => {
    const hoursAgo = Math.random() * maxHoursAgo;
    const timestamp = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    return timestamp.toISOString();
  };

  // Priorizar atividades mais recentes e realistas
  const activityTypes = [];

  // Status online (prioritário se online ou recentemente online)
  if (userData.online) {
    activityTypes.push({
      activity: "está online agora",
      timestamp: getRealisticTimestamp(0.1), // Últimos 6 minutos
      priority: 10
    });
  } else if (userData.lastAccessTime && isRecentlyOnline(userData.lastAccessTime)) {
    activityTypes.push({
      activity: "esteve online recentemente",
      timestamp: getRealisticTimestamp(1), // Última hora
      priority: 8
    });
  }

  // Badges (filtrar emblemas muito antigos)
  if (userData.selectedBadges && userData.selectedBadges.length > 0) {
    // Filtrar emblemas muito antigos ou de conquista básica
    const recentBadges = userData.selectedBadges.filter((badge: any) => {
      const badgeCode = badge.code || '';
      // Evitar emblemas muito antigos ou de conquistas básicas dos anos 2000
      const isOldAchievement = badgeCode.match(/^(ACH_[A-Z]+[0-9]+|ADM_|VIP_|DEV_|MOD_)/);
      const isBasicClub = badgeCode.match(/^(HC[0-9]|Club[0-9])/);
      return !isOldAchievement && !isBasicClub;
    });
    
    if (recentBadges.length > 0) {
      const randomBadge = recentBadges[Math.floor(Math.random() * recentBadges.length)];
      const badgeName = randomBadge.name || randomBadge.code || 'Emblema Especial';
      activityTypes.push({
        activity: `conquistou o emblema ${badgeName}`,
        timestamp: getRealisticTimestamp(1.5),
        priority: isRecentlyOnline(userData.lastAccessTime) ? 11 : 7
      });
    }
  }

  // Mudança de visual (média prioridade)
  if (userData.figureString) {
    activityTypes.push({
      activity: "mudou o visual",
      timestamp: getRealisticTimestamp(2),
      priority: 6
    });
  }

  // Mudança de lema (média prioridade)
  if (userData.motto) {
    activityTypes.push({
      activity: `mudou o lema para "${userData.motto}"`,
      timestamp: getRealisticTimestamp(3),
      priority: 5
    });
  }

  // Selecionar apenas as atividades mais relevantes (1-2 por usuário)
  const selectedActivities = activityTypes
    .sort((a, b) => b.priority - a.priority)
    .slice(0, Math.random() < 0.7 ? 1 : 2); // 70% chance de 1 atividade, 30% de 2

  selectedActivities.forEach(activityData => {
    activities.push({
      username: userData.name,
      activity: activityData.activity,
      timestamp: activityData.timestamp,
      figureString: userData.figureString,
      hotel: hotel
    });
  });

  return activities;
}

function isRecentlyOnline(lastAccessTime: string): boolean {
  if (!lastAccessTime) return false;
  try {
    const lastAccess = new Date(lastAccessTime);
    const now = new Date();
    const hoursAgo = Math.floor((now.getTime() - lastAccess.getTime()) / (60 * 60 * 1000));
    return hoursAgo <= 2; // Mudado de 30 minutos para 2 horas
  } catch (error) {
    return false;
  }
}

function getRecentTimestamp(maxHoursAgo: number): string {
  const now = new Date();
  const randomHours = Math.random() * maxHoursAgo;
  const timestamp = new Date(now.getTime() - (randomHours * 60 * 60 * 1000));
  return timestamp.toISOString();
}
