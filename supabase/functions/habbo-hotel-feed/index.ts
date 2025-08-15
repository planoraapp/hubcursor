
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotelPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
}

// Cache for hotel feed
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes for faster refresh

function getCached(key: string) {
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCached(key: string, data: any) {
  cache.set(key, {
    data,
    expires: Date.now() + CACHE_TTL
  });
}

// Popular users for fallback content
const popularUsers = ['Beebop', 'Alice', 'Bob', 'Carol', 'Diana', 'Edward', 'Fiona', 'George'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username, hotel = 'br' } = await req.json();
    
    console.log(`[habbo-hotel-feed] ====== FETCHING HOTEL FEED ======`);
    console.log(`[habbo-hotel-feed] Username: ${username}`);
    console.log(`[habbo-hotel-feed] Hotel: ${hotel}`);
    
    if (!username) {
      return new Response(JSON.stringify({ error: 'Username is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check cache first
    const cacheKey = `hotel-feed-${username}-${hotel}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`[habbo-hotel-feed] Returning cached data`);
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const hotelDomain = hotel === 'br' ? 'com.br' : hotel;
    const feedPhotos: HotelPhoto[] = [];

    // First, try to get user's friends photos
    try {
      const userResponse = await fetch(`https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(username)}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const uniqueId = userData.uniqueId;

        // Get friends
        const friendsResponse = await fetch(`https://www.habbo.${hotelDomain}/extradata/public/users/${uniqueId}/friends`);
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          
          // Get photos from first 5 friends
          const friendPromises = friendsData.slice(0, 5).map(async (friend: any) => {
            try {
              const friendUserResponse = await fetch(`https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(friend.name)}`);
              if (friendUserResponse.ok) {
                const friendUserData = await friendUserResponse.json();
                const friendPhotosResponse = await fetch(`https://www.habbo.${hotelDomain}/extradata/public/users/${friendUserData.uniqueId}/photos`);
                
                if (friendPhotosResponse.ok) {
                  const friendPhotos = await friendPhotosResponse.json();
                  return friendPhotos.slice(0, 2).map((photo: any) => ({
                    id: `friend-${friend.name}-${photo.id}`,
                    imageUrl: photo.url,
                    date: new Date(photo.creationTime).toLocaleDateString('pt-BR'),
                    likes: photo.likesCount || Math.floor(Math.random() * 50),
                    userName: friend.name,
                    userAvatar: `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${friend.name}&direction=2&head_direction=3&size=m`
                  }));
                }
              }
            } catch (e) {
              console.log(`[habbo-hotel-feed] Failed to fetch friend ${friend.name}:`, e);
            }
            return [];
          });

          const friendsPhotos = await Promise.all(friendPromises);
          friendsPhotos.forEach(photos => feedPhotos.push(...photos));
        }
      }
    } catch (e) {
      console.log(`[habbo-hotel-feed] Failed to fetch friends photos:`, e);
    }

    // Add photos from popular users to fill the feed
    const remainingSlots = Math.max(0, 10 - feedPhotos.length);
    const randomUsers = popularUsers.sort(() => 0.5 - Math.random()).slice(0, remainingSlots);

    const popularPromises = randomUsers.map(async (userName) => {
      try {
        const userResponse = await fetch(`https://www.habbo.${hotelDomain}/api/public/users?name=${encodeURIComponent(userName)}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const photosResponse = await fetch(`https://www.habbo.${hotelDomain}/extradata/public/users/${userData.uniqueId}/photos`);
          
          if (photosResponse.ok) {
            const photos = await photosResponse.json();
            return photos.slice(0, 1).map((photo: any) => ({
              id: `popular-${userName}-${photo.id}`,
              imageUrl: photo.url,
              date: new Date(photo.creationTime).toLocaleDateString('pt-BR'),
              likes: photo.likesCount || Math.floor(Math.random() * 100),
              userName: userName,
              userAvatar: `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${userName}&direction=2&head_direction=3&size=m`
            }));
          }
        }
      } catch (e) {
        console.log(`[habbo-hotel-feed] Failed to fetch popular user ${userName}:`, e);
      }
      return [];
    });

    const popularPhotos = await Promise.all(popularPromises);
    popularPhotos.forEach(photos => feedPhotos.push(...photos));

    // Sort chronologically (by creation time, most recent first)
    feedPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Cache the result
    setCached(cacheKey, feedPhotos);

    console.log(`[habbo-hotel-feed] ====== SUCCESS ======`);
    console.log(`[habbo-hotel-feed] Built hotel feed with ${feedPhotos.length} photos`);

    return new Response(JSON.stringify(feedPhotos), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[habbo-hotel-feed] Fatal error:`, error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
