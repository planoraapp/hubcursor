
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface OfficialTickerEntry {
  habboName: string;
  figureString: string;
  motto: string;
  buildersClubMember: boolean;
  habboClubMember: boolean;
  lastWebAccess: string;
  habbosMissionChanged: boolean;
  newFriends: Array<{
    habboName: string;
    figureString: string;
  }>;
  totalFriends: number;
  newGroups: Array<{
    groupName: string;
    badgeCode: string;
  }>;
  totalGroups: number;
  newBadges: Array<{
    badgeCode: string;
    badgeName: string;
  }>;
  totalBadges: number;
  newRooms: Array<{
    roomName: string;
    roomId: string;
  }>;
  totalRooms: number;
  profileVisible: boolean;
}

interface EnrichedTickerActivity {
  username: string;
  lastUpdate: string;
  counts: {
    groups: number;
    friends: number;
    badges: number;
    avatarChanged: boolean;
    mottoChanged: boolean;
  };
  groups: Array<{ name: string; badgeCode: string }>;
  friends: Array<{ name: string; figureString?: string }>;
  badges: Array<{ code: string; name?: string }>;
  photos: Array<{ url: string; caption?: string; id?: string }>;
  description: string;
  profile: {
    figureString: string;
    motto: string;
    isOnline: boolean;
    memberSince?: string;
    lastWebVisit: string;
    groupsCount: number;
    friendsCount: number;
    badgesCount: number;
    photosCount: number;
    uniqueId?: string;
  };
}

async function fetchHabboAPI(url: string, retries = 3): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`🌐 [ticker] API Request attempt ${i + 1}: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`📡 [ticker] API Response status ${response.status} for ${url}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📊 [ticker] API Data received: ${Array.isArray(data) ? data.length + ' items' : 'object'}`);
        return data;
      }
      
      if (response.status === 404) {
        console.log(`⚠️ [ticker] API returned 404 for ${url}`);
        return null;
      }
      
      if (response.status === 403) {
        console.log(`⚠️ [ticker] API returned 403 for ${url}`);
        return null;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.warn(`⚠️ [ticker] API attempt ${i + 1} failed for ${url}:`, error);
      
      if (i === retries) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

async function getOfficialCommunityTicker(hotel: string): Promise<OfficialTickerEntry[]> {
  console.log(`🎯 [ticker] Fetching official community ticker for ${hotel}`);
  
  // Tentar diferentes variações do endpoint oficial
  const endpoints = [
    `https://www.habbo.${hotel}/api/public/community/ticker`,
    `https://www.habbo.com/api/public/community/ticker`
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 [ticker] Trying endpoint: ${endpoint}`);
      const tickerData = await fetchHabboAPI(endpoint);
      
      if (tickerData && Array.isArray(tickerData) && tickerData.length > 0) {
        console.log(`✅ [ticker] Retrieved ${tickerData.length} entries from ${endpoint}`);
        return tickerData;
      }
    } catch (error) {
      console.warn(`⚠️ [ticker] Failed to fetch from ${endpoint}:`, error);
      continue;
    }
  }
  
  console.log(`❌ [ticker] No data available from any official endpoint for ${hotel}`);
  return [];
}

async function enrichUserProfile(habboName: string, hotel: string): Promise<any> {
  const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
  
  try {
    console.log(`👤 [ticker] Enriching profile for ${habboName}`);
    const profileData = await fetchHabboAPI(`${baseUrl}/api/public/users?name=${encodeURIComponent(habboName)}`);
    
    if (profileData && profileData.uniqueId) {
      // Buscar fotos do usuário
      let photos = [];
      try {
        const photosData = await fetchHabboAPI(`${baseUrl}/api/public/users/${profileData.uniqueId}/photos`);
        if (photosData && Array.isArray(photosData)) {
          photos = photosData.slice(0, 6).map(photo => ({
            url: photo.url || `https://www.habbo.${hotel}/habbo-imaging/badge/${photo.id}.gif`,
            caption: photo.caption || '',
            id: photo.id
          }));
        }
      } catch (error) {
        console.warn(`⚠️ [ticker] Failed to fetch photos for ${habboName}:`, error);
      }
      
      return {
        profile: profileData,
        photos: photos
      };
    }
  } catch (error) {
    console.warn(`⚠️ [ticker] Failed to enrich profile for ${habboName}:`, error);
  }
  
  return { profile: null, photos: [] };
}

async function enrichTickerEntry(entry: OfficialTickerEntry, hotel: string): Promise<EnrichedTickerActivity> {
  // Enriquecer com dados do perfil e fotos
  const enrichment = await enrichUserProfile(entry.habboName, hotel);
  const profile = enrichment.profile;
  const photos = enrichment.photos;
  
  // Contar atividades reais
  const counts = {
    groups: entry.newGroups?.length || 0,
    friends: entry.newFriends?.length || 0,
    badges: entry.newBadges?.length || 0,
    avatarChanged: false, // Ticker não fornece essa informação diretamente
    mottoChanged: entry.habbosMissionChanged || false
  };
  
  // Construir descrição no estilo HabboWidgets
  const activityParts = [];
  if (counts.groups > 0) activityParts.push(`${counts.groups} novo(s) grupo(s)`);
  if (counts.friends > 0) activityParts.push(`${counts.friends} novo(s) amigo(s)`);
  if (counts.badges > 0) activityParts.push(`${counts.badges} novo(s) emblema(s)`);
  if (counts.mottoChanged) activityParts.push('mudou sua missão');
  if (entry.newRooms?.length > 0) activityParts.push(`${entry.newRooms.length} novo(s) quarto(s)`);
  
  let description = 'atividade recente no hotel';
  if (activityParts.length > 0) {
    description = `adicionou ${activityParts.join(', ')}.`;
  } else {
    // Mostrar estatísticas do perfil quando não há atividades novas
    const profileParts = [];
    if (entry.totalGroups > 0) profileParts.push(`${entry.totalGroups} grupos`);
    if (entry.totalFriends > 0) profileParts.push(`${entry.totalFriends} amigos`);
    if (entry.totalBadges > 0) profileParts.push(`${entry.totalBadges} emblemas`);
    
    if (profileParts.length > 0) {
      description = `possui ${profileParts.join(', ')}.`;
    }
  }
  
  return {
    username: entry.habboName,
    lastUpdate: entry.lastWebAccess,
    counts,
    groups: (entry.newGroups || []).map(g => ({
      name: g.groupName,
      badgeCode: g.badgeCode
    })),
    friends: (entry.newFriends || []).map(f => ({
      name: f.habboName,
      figureString: f.figureString
    })),
    badges: (entry.newBadges || []).map(b => ({
      code: b.badgeCode,
      name: b.badgeName
    })),
    photos,
    description,
    profile: {
      figureString: entry.figureString || profile?.figureString || '',
      motto: entry.motto || '',
      isOnline: profile?.online || false,
      memberSince: profile?.memberSince,
      lastWebVisit: entry.lastWebAccess,
      groupsCount: entry.totalGroups || 0,
      friendsCount: entry.totalFriends || 0,
      badgesCount: entry.totalBadges || 0,
      photosCount: photos.length,
      uniqueId: profile?.uniqueId
    }
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const hotel = url.searchParams.get('hotel') || 'com.br';
    const limit = parseInt(url.searchParams.get('limit') || '50');

    console.log(`🎯 [ticker] Official ticker request for hotel: ${hotel}, limit: ${limit}`);

    // Buscar dados do ticker oficial
    const tickerEntries = await getOfficialCommunityTicker(hotel);
    
    if (tickerEntries.length === 0) {
      console.log(`❌ [ticker] No official ticker data available for ${hotel}`);
      return new Response(
        JSON.stringify({
          success: true,
          hotel,
          activities: [],
          meta: {
            source: 'official',
            timestamp: new Date().toISOString(),
            count: 0,
            onlineCount: 0,
            message: 'Nenhum dado disponível no ticker oficial'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Aplicar limite
    const limitedEntries = tickerEntries.slice(0, limit);
    console.log(`📊 [ticker] Processing ${limitedEntries.length} entries (limited from ${tickerEntries.length})`);

    // Enriquecer atividades em lotes para evitar sobrecarga
    const enrichedActivities: EnrichedTickerActivity[] = [];
    const batchSize = 5;
    
    for (let i = 0; i < limitedEntries.length; i += batchSize) {
      const batch = limitedEntries.slice(i, i + batchSize);
      const batchPromises = batch.map(entry => enrichTickerEntry(entry, hotel));
      
      try {
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, idx) => {
          if (result.status === 'fulfilled') {
            enrichedActivities.push(result.value);
          } else {
            console.warn(`⚠️ [ticker] Failed to enrich ${batch[idx].habboName}:`, result.reason);
          }
        });
      } catch (error) {
        console.warn(`⚠️ [ticker] Batch processing error:`, error);
      }
      
      // Pequena pausa entre lotes
      if (i + batchSize < limitedEntries.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    // Ordenar por lastUpdate decrescente (mais recente primeiro)
    enrichedActivities.sort((a, b) => {
      // Usuários online primeiro
      if (a.profile.isOnline && !b.profile.isOnline) return -1;
      if (!a.profile.isOnline && b.profile.isOnline) return 1;
      
      // Depois por data de atualização
      return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
    });

    const onlineCount = enrichedActivities.filter(a => a.profile.isOnline).length;

    console.log(`✅ [ticker] Returning ${enrichedActivities.length} enriched activities, ${onlineCount} online`);

    return new Response(
      JSON.stringify({
        success: true,
        hotel,
        activities: enrichedActivities,
        meta: {
          source: 'official',
          timestamp: new Date().toISOString(),
          count: enrichedActivities.length,
          onlineCount,
          totalAvailable: tickerEntries.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ [ticker] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        hotel: new URL(req.url).searchParams.get('hotel') || 'com.br',
        activities: [],
        meta: {
          source: 'official',
          timestamp: new Date().toISOString(),
          count: 0,
          onlineCount: 0,
          message: 'Erro ao buscar dados do ticker oficial'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
