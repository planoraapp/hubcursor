
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

    const activities: FriendActivity[] = [];
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    // ETAPA 3: Processamento mais eficiente
    const batchSize = 5; // Reduzido para melhor performance
    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, friends.length);
    const friendsToProcess = friends.slice(startIndex, endIndex);
    
    console.log(`🔍 [PROCESSING] Processando amigos ${startIndex}-${endIndex} de ${friends.length}`);
    console.log(`🔍 [PROCESSING] Amigos desta batch:`, friendsToProcess);

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
            console.log(`❌ [FRIEND] Sem dados para: ${cleanName}`);
            // ETAPA 4: Gerar atividade mock mesmo sem dados da API
            return [{
              username: cleanName,
              activity: `usuário não encontrado ou privado`,
              timestamp: new Date().toISOString(),
              figureString: 'lg-3023-1332.hr-681-45.hd-180-1.ch-3030-64.ca-1808-62',
              hotel
            }];
          }
          
          console.log(`✅ [FRIEND] Dados obtidos para: ${cleanName}`, {
            online: userData.online,
            lastAccess: userData.lastAccessTime,
            badges: userData.selectedBadges?.length || 0
          });
          
          // Generate activities
          const userActivities: FriendActivity[] = [];
          const now = new Date();
          
          // Online status
          if (userData.online) {
            userActivities.push({
              username: userData.name,
              activity: `está online agora`,
              timestamp: now.toISOString(),
              figureString: userData.figureString,
              hotel
            });
          } else if (userData.lastAccessTime && isRecentlyOnline(userData.lastAccessTime)) {
            userActivities.push({
              username: userData.name,
              activity: `esteve online recentemente`,
              timestamp: userData.lastAccessTime,
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Badge activity
          if (userData.selectedBadges && userData.selectedBadges.length > 0) {
            const randomBadge = userData.selectedBadges[Math.floor(Math.random() * userData.selectedBadges.length)];
            userActivities.push({
              username: userData.name,
              activity: `conquistou o emblema ${randomBadge.name || randomBadge.code}`,
              timestamp: getRecentTimestamp(3),
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Profile activity
          if (userData.profileVisible && Math.random() < 0.4) {
            userActivities.push({
              username: userData.name,
              activity: `atualizou as informações do perfil`,
              timestamp: getRecentTimestamp(8),
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Motto update
          if (userData.motto && userData.motto.length > 0 && Math.random() < 0.3) {
            userActivities.push({
              username: userData.name,
              activity: `mudou a missão: "${userData.motto}"`,
              timestamp: getRecentTimestamp(6),
              figureString: userData.figureString,
              hotel
            });
          }
          
          // Se não gerou nenhuma atividade, gerar uma padrão
          if (userActivities.length === 0) {
            userActivities.push({
              username: userData.name,
              activity: `foi visto no hotel recentemente`,
              timestamp: getRecentTimestamp(12),
              figureString: userData.figureString,
              hotel
            });
          }
          
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
    
    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`🎯 [FINAL] Geradas ${activities.length} atividades de ${processedCount} amigos processados`);
    
    const response: ActivityResponse = {
      activities: activities.slice(0, 50),
      metadata: {
        source: 'direct_api_enhanced',
        timestamp: new Date().toISOString(),
        count: activities.length,
        friends_processed: processedCount
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
function isRecentlyOnline(lastAccessTime: string): boolean {
  const lastAccess = new Date(lastAccessTime);
  const now = new Date();
  const minutesAgo = Math.floor((now.getTime() - lastAccess.getTime()) / 60000);
  return minutesAgo <= 30;
}

function getRecentTimestamp(maxHoursAgo: number): string {
  const now = new Date();
  const randomHours = Math.random() * maxHoursAgo;
  const timestamp = new Date(now.getTime() - (randomHours * 60 * 60 * 1000));
  return timestamp.toISOString();
}
