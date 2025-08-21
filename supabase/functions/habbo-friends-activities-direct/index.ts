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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { friends, hotel = 'com.br', limit = 50, offset = 0 } = await req.json();
    
    console.log(`[🚀 FRIENDS ACTIVITIES] Processing ${friends?.length || 0} friends for hotel ${hotel}`);
    
    if (!friends || friends.length === 0) {
      return new Response(JSON.stringify({ 
        activities: [], 
        metadata: { 
          source: 'direct_api',
          timestamp: new Date().toISOString(),
          count: 0,
          friends_processed: 0 
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const activities: FriendActivity[] = [];
    const baseUrl = hotel === 'com.br' ? 'https://www.habbo.com.br' : `https://www.habbo.${hotel}`;
    
    // Process friends in smaller batches to avoid rate limits
    const batchSize = 10;
    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, friends.length);
    const friendsToProcess = friends.slice(startIndex, endIndex);
    
    console.log(`[📊 FRIENDS ACTIVITIES] Processing friends ${startIndex}-${endIndex} of ${friends.length}`);

    for (let i = 0; i < friendsToProcess.length; i += batchSize) {
      const batch = friendsToProcess.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (friendName: string) => {
        try {
          // Clean friend name
          let cleanName = friendName.trim();
          if (cleanName.startsWith(',')) {
            cleanName = cleanName.substring(1).trim();
          }
          
          const url = `${baseUrl}/api/public/users?name=${encodeURIComponent(cleanName)}`;
          console.log(`[🔍 FRIENDS ACTIVITIES] Fetching user data: ${url}`);
          
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          if (!response.ok) {
            console.warn(`[⚠️ FRIENDS ACTIVITIES] Failed to fetch ${cleanName}: ${response.status}`);
            return null;
          }
          
          const userData = await response.json();
          
          // Generate synthetic activities based on user data
          const userActivities: FriendActivity[] = [];
          const now = new Date();
          
          // Check if user is online (last access within 15 minutes)
          if (userData.lastAccessTime) {
            const lastAccess = new Date(userData.lastAccessTime);
            const minutesAgo = Math.floor((now.getTime() - lastAccess.getTime()) / 60000);
            
            if (minutesAgo <= 15) {
              userActivities.push({
                username: userData.name,
                activity: `está online no hotel`,
                timestamp: userData.lastAccessTime,
                figureString: userData.figureString,
                hotel
              });
            } else if (minutesAgo <= 60) {
              userActivities.push({
                username: userData.name,
                activity: `esteve online há ${minutesAgo} minutos`,
                timestamp: userData.lastAccessTime,
                figureString: userData.figureString,
                hotel
              });
            }
          }
          
          // Add profile update activity if recent
          if (userData.profileVisible && userData.memberSince) {
            const profileTime = new Date(userData.memberSince);
            const hoursAgo = Math.floor((now.getTime() - profileTime.getTime()) / 3600000);
            
            if (hoursAgo <= 24) {
              userActivities.push({
                username: userData.name,
                activity: `atualizou o perfil`,
                timestamp: userData.memberSince,
                figureString: userData.figureString,
                hotel
              });
            }
          }
          
          return userActivities;
          
        } catch (error) {
          console.error(`[❌ FRIENDS ACTIVITIES] Error processing ${friendName}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      
      // Flatten and add to activities
      batchResults.forEach(result => {
        if (result) {
          activities.push(...result);
        }
      });
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < friendsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Sort activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    console.log(`[✅ FRIENDS ACTIVITIES] Generated ${activities.length} activities from ${friendsToProcess.length} friends`);
    
    const response: ActivityResponse = {
      activities: activities.slice(0, 50), // Limit to 50 activities per response
      metadata: {
        source: 'direct_api',
        timestamp: new Date().toISOString(),
        count: activities.length,
        friends_processed: friendsToProcess.length
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[❌ FRIENDS ACTIVITIES] Unexpected error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      activities: [],
      metadata: {
        source: 'error',
        timestamp: new Date().toISOString(),
        count: 0,
        friends_processed: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});