import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username = 'Beebop', hotel = 'com.br' } = await req.json();
    
    console.log(`[Habbo Photo Discovery] Starting advanced discovery for ${username} on ${hotel}`);
    
    const results = {
      username,
      hotel,
      strategies: [],
      photos: [],
      discoveryMethods: []
    };

    // Strategy 1: GameData Analysis (inspired by habbo-downloader)
    console.log(`[Photo Discovery] Strategy 1: GameData Analysis`);
    
    try {
      // Get gamedata.xml to understand Habbo's internal structure
      const gameDataUrl = `https://www.habbo.${hotel}/gamedata/gamedata`;
      const gameDataResponse = await fetch(gameDataUrl, {
        headers: {
          'User-Agent': 'HabboHub/1.0 (habbo-downloader inspired)',
          'Accept': '*/*',
        },
      });

      if (gameDataResponse.ok) {
        const gameDataText = await gameDataResponse.text();
        console.log(`[Photo Discovery] GameData retrieved (${gameDataText.length} chars)`);
        
        // Look for photo-related configurations in gamedata
        const photoPatterns = [
          /camera\.url[^\w]*([^"'\s]+)/gi,
          /photo\.url[^\w]*([^"'\s]+)/gi,
          /servercamera[^\w]*([^"'\s]+)/gi,
          /stories[-_]content[^\w]*([^"'\s]+)/gi,
          /purchased[^\w]*([^"'\s]+)/gi,
        ];

        for (const pattern of photoPatterns) {
          const matches = Array.from(gameDataText.matchAll(pattern));
          if (matches.length > 0) {
            console.log(`[Photo Discovery] Found ${matches.length} photo-related URLs in gamedata`);
            for (const match of matches) {
              console.log(`[Photo Discovery] Pattern: ${match[0]}`);
            }
          }
        }

        results.strategies.push({
          name: 'GameData Analysis',
          success: true,
          data: {
            foundPatterns: photoPatterns.map(p => p.toString()),
            gameDataLength: gameDataText.length
          }
        });
      }
    } catch (error) {
      results.strategies.push({
        name: 'GameData Analysis',
        success: false,
        error: error.message
      });
    }

    // Strategy 2: S3 Bucket Systematic Discovery
    console.log(`[Photo Discovery] Strategy 2: S3 Bucket Systematic Discovery`);
    
    const hotelCode = hotel === 'com.br' ? 'hhbr' : 
                      hotel === 'com' ? 'hhus' :
                      hotel === 'es' ? 'hhes' :
                      hotel === 'de' ? 'hhde' :
                      hotel === 'fr' ? 'hhfr' :
                      hotel === 'it' ? 'hhit' : 'hhbr';

    // Use your exact working examples as seeds
    const knownWorkingExamples = [
      { id: '464837', timestamp: 1753569292755 },
      { id: '91557551', timestamp: 1755042756833 }
    ];

    // First, verify known working examples
    for (const example of knownWorkingExamples) {
      const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${example.id}-${example.timestamp}.png`;
      
      try {
        const headResponse = await fetch(s3Url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'HabboHub/1.0 (discovery mode)',
          },
        });

        if (headResponse.ok) {
          console.log(`[Photo Discovery] ✅ Verified working example: ${s3Url}`);
          results.photos.push({
            id: `verified-${example.id}-${example.timestamp}`,
            url: s3Url,
            previewUrl: s3Url,
            timestamp: new Date(example.timestamp).toISOString(),
            source: 'verified_example',
            internalId: example.id,
            method: 'known_working_pattern'
          });
        }
      } catch (error) {
        console.log(`[Photo Discovery] Error verifying example: ${error.message}`);
      }
    }

    // Strategy 3: Intelligent Timestamp Generation
    console.log(`[Photo Discovery] Strategy 3: Intelligent Timestamp Generation`);
    
    const now = Date.now();
    const intelligentTimestamps = [];
    
    // Use the exact patterns from your working examples
    const baseTimestamps = [1753569292755, 1755042756833];
    
    // Generate timestamps with realistic intervals
    for (const baseTs of baseTimestamps) {
      // ±72 hours around known working timestamps (every 4 hours)
      for (let hours = -72; hours <= 72; hours += 4) {
        intelligentTimestamps.push(baseTs + (hours * 60 * 60 * 1000));
      }
    }
    
    // Recent timestamps (last 30 days, daily intervals)
    for (let days = 0; days < 30; days++) {
      intelligentTimestamps.push(now - (days * 24 * 60 * 60 * 1000));
    }

    console.log(`[Photo Discovery] Generated ${intelligentTimestamps.length} intelligent timestamps`);

    // Strategy 4: ID Range Discovery
    console.log(`[Photo Discovery] Strategy 4: ID Range Discovery`);
    
    // Test ID ranges around your known working IDs
    const idRanges = [
      // Around 464837
      { start: 464800, end: 464900 },
      { start: 91557500, end: 91557600 },
      // Common ranges
      { start: 100000, end: 100100, step: 10 },
      { start: 500000, end: 500100, step: 10 },
      { start: 1000000, end: 1000100, step: 10 },
    ];

    let discoveredPhotos = 0;
    const maxPhotosToDiscover = 15;

    for (const range of idRanges) {
      if (discoveredPhotos >= maxPhotosToDiscover) break;
      
      const step = range.step || 1;
      
      for (let id = range.start; id <= range.end && discoveredPhotos < maxPhotosToDiscover; id += step) {
        // Test this ID with a few strategic timestamps
        const testTimestamps = intelligentTimestamps.slice(0, 5);
        
        for (const timestamp of testTimestamps) {
          if (discoveredPhotos >= maxPhotosToDiscover) break;
          
          const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${id}-${timestamp}.png`;
          
          try {
            const headResponse = await fetch(s3Url, { 
              method: 'HEAD',
              headers: {
                'User-Agent': 'HabboHub/1.0 (systematic discovery)',
              },
            });

            if (headResponse.ok) {
              console.log(`[Photo Discovery] 🎯 DISCOVERED: ${s3Url}`);
              results.photos.push({
                id: `discovered-${id}-${timestamp}`,
                url: s3Url,
                previewUrl: s3Url,
                timestamp: new Date(timestamp).toISOString(),
                source: 'systematic_discovery',
                internalId: id.toString(),
                method: 'id_range_discovery',
                range: `${range.start}-${range.end}`
              });
              discoveredPhotos++;
            }
          } catch (error) {
            console.log(`[Photo Discovery] Error testing ID ${id}: ${error.message}`);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
    }

    // Strategy 5: Pattern-based ID Discovery (from user profile)
    console.log(`[Photo Discovery] Strategy 5: Profile-based ID Discovery`);
    
    try {
      // Get user basic info first
      const userUrl = `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(username)}`;
      const userResponse = await fetch(userUrl, {
        headers: {
          'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
          'Accept': 'application/json',
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const uniqueId = userData.uniqueId;
        
        // Try to extract numeric parts from uniqueId
        const numericMatches = uniqueId.match(/\d+/g);
        if (numericMatches) {
          for (const numericPart of numericMatches) {
            if (numericPart.length >= 5) {
              console.log(`[Photo Discovery] Testing numeric part from uniqueId: ${numericPart}`);
              
              // Test this potential ID
              const testTimestamp = intelligentTimestamps[0];
              const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${numericPart}-${testTimestamp}.png`;
              
              try {
                const headResponse = await fetch(s3Url, { 
                  method: 'HEAD',
                  headers: {
                    'User-Agent': 'HabboHub/1.0 (profile-based discovery)',
                  },
                });

                if (headResponse.ok) {
                  console.log(`[Photo Discovery] 🎯 FOUND VIA PROFILE: ${s3Url}`);
                  results.photos.push({
                    id: `profile-${numericPart}-${testTimestamp}`,
                    url: s3Url,
                    previewUrl: s3Url,
                    timestamp: new Date(testTimestamp).toISOString(),
                    source: 'profile_extraction',
                    internalId: numericPart,
                    method: 'uniqueId_numeric_extraction'
                  });
                }
              } catch (error) {
                console.log(`[Photo Discovery] Error testing profile-based ID: ${error.message}`);
              }
            }
          }
        }

        results.strategies.push({
          name: 'Profile-based ID Discovery',
          success: true,
          data: {
            uniqueId: userData.uniqueId,
            numericParts: numericMatches
          }
        });
      }
    } catch (error) {
      results.strategies.push({
        name: 'Profile-based ID Discovery',
        success: false,
        error: error.message
      });
    }

    // Summary
    results.discoveryMethods = [
      'GameData structure analysis',
      'Known working pattern verification', 
      'Intelligent timestamp generation',
      'Systematic ID range discovery',
      'Profile-based ID extraction'
    ];

    console.log(`[Photo Discovery] Discovery complete! Found ${results.photos.length} photos using ${results.strategies.length} strategies`);
    
    // Group photos by discovery method
    const photosByMethod = results.photos.reduce((acc, photo) => {
      acc[photo.method] = (acc[photo.method] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`[Photo Discovery] Photos by method:`, photosByMethod);
    
    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[Photo Discovery] Error:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});