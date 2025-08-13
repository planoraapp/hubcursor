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
    
    console.log(`[Test Photos] Testing multiple strategies for ${username} on ${hotel}`);
    
    const results = {
      username,
      hotel,
      strategies: [],
      photos: []
    };

    // Strategy 1: Test official Habbo API endpoints
    console.log(`[Test Photos] Strategy 1: Official Habbo API`);
    
    // Get user basic info
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
      
      results.strategies.push({
        name: 'Basic User API',
        success: true,
        data: {
          uniqueId: userData.uniqueId,
          name: userData.name,
          figureString: userData.figureString,
          motto: userData.motto,
          memberSince: userData.memberSince
        }
      });

      // Test various API endpoints for photos
      const photoEndpoints = [
        `/api/public/users/${uniqueId}/profile`,
        `/api/public/users/${uniqueId}/photos`,
        `/api/public/users/${uniqueId}/timeline`,
        `/api/public/users/${uniqueId}/feed`,
        `/api/public/users/${uniqueId}/activity`,
        `/api/public/users/${uniqueId}/social`
      ];

      for (const endpoint of photoEndpoints) {
        try {
          const testUrl = `https://www.habbo.${hotel}${endpoint}`;
          console.log(`[Test Photos] Testing endpoint: ${testUrl}`);
          
          const response = await fetch(testUrl, {
            headers: {
              'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
              'Accept': 'application/json',
            },
          });

          const strategy = {
            name: `API ${endpoint}`,
            url: testUrl,
            success: response.ok,
            status: response.status,
            data: null
          };

          if (response.ok) {
            try {
              const data = await response.json();
              strategy.data = data;
              
              // Look for photos in response
              if (data.photos) {
                results.photos.push(...data.photos.map((photo: any) => ({
                  ...photo,
                  source: endpoint
                })));
              }
              
              console.log(`[Test Photos] ✅ ${endpoint} - Found data:`, Object.keys(data));
            } catch (e) {
              strategy.data = await response.text();
            }
          } else {
            console.log(`[Test Photos] ❌ ${endpoint} - Status: ${response.status}`);
          }

          results.strategies.push(strategy);
          
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          results.strategies.push({
            name: `API ${endpoint}`,
            success: false,
            error: error.message
          });
        }
      }

      // Strategy 2: Test known S3 patterns with current timestamps
      console.log(`[Test Photos] Strategy 2: Testing S3 patterns`);
      
      const hotelCode = hotel === 'com.br' ? 'hhbr' : 'hhus';
      const knownIds = ['464837', '91557551']; // Known working IDs from your examples
      const now = Date.now();
      
      // Test recent timestamps (last 7 days)
      for (let days = 0; days < 7; days++) {
        const timestamp = now - (days * 24 * 60 * 60 * 1000);
        
        for (const testId of knownIds) {
          const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${testId}-${timestamp}.png`;
          
          try {
            const headResponse = await fetch(s3Url, { 
              method: 'HEAD',
              headers: {
                'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
              },
            });

            if (headResponse.ok) {
              console.log(`[Test Photos] ✅ Found S3 photo: ${s3Url}`);
              results.photos.push({
                id: `s3-${testId}-${timestamp}`,
                url: s3Url,
                previewUrl: s3Url,
                timestamp: new Date(timestamp).toISOString(),
                source: 's3_test',
                testId: testId
              });
            }
          } catch (error) {
            console.log(`[Test Photos] S3 test error: ${error.message}`);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Strategy 3: Try to extract internal ID and test with known working timestamps
      console.log(`[Test Photos] Strategy 3: Internal ID extraction`);
      
      try {
        const profilePageUrl = `https://www.habbo.${hotel}/profile/${encodeURIComponent(username)}`;
        const profileResponse = await fetch(profilePageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });

        if (profileResponse.ok) {
          const html = await profileResponse.text();
          
          // Enhanced patterns to find internal ID
          const patterns = [
            /user['":\s]*['":]?(\d+)/gi,
            /userId['":\s]*['":]?(\d+)/gi,
            /user_id['":\s]*['":]?(\d+)/gi,
            /id['":\s]*['":]?(\d+)/gi,
            /"user"\s*:\s*['"]*(\d+)/gi,
            /"userId"\s*:\s*['"]*(\d+)/gi,
            /data-user-id[='"]*(\d+)/gi,
            /var\s+user\s*=\s*['"]*(\d+)/gi,
            /window\.user\s*=\s*['"]*(\d+)/gi,
          ];

          const foundIds = new Set();
          
          for (const pattern of patterns) {
            const matches = Array.from(html.matchAll(pattern));
            for (const match of matches) {
              if (match[1] && match[1].length >= 5 && match[1].length <= 10) {
                const id = match[1];
                if (parseInt(id) > 10000) {
                  foundIds.add(id);
                }
              }
            }
          }

          results.strategies.push({
            name: 'Internal ID Extraction',
            success: true,
            data: {
              foundIds: Array.from(foundIds),
              htmlLength: html.length
            }
          });

          // Test found IDs with known working timestamps
          const knownTimestamps = [1753569292755, 1755042756833]; // From your examples
          
          for (const internalId of foundIds) {
            for (const timestamp of knownTimestamps) {
              const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${internalId}-${timestamp}.png`;
              
              try {
                const headResponse = await fetch(s3Url, { 
                  method: 'HEAD',
                  headers: {
                    'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
                  },
                });

                if (headResponse.ok) {
                  console.log(`[Test Photos] ✅ Found photo with extracted ID: ${s3Url}`);
                  results.photos.push({
                    id: `extracted-${internalId}-${timestamp}`,
                    url: s3Url,
                    previewUrl: s3Url,
                    timestamp: new Date(timestamp).toISOString(),
                    source: 'extracted_id',
                    internalId: internalId
                  });
                }
              } catch (error) {
                console.log(`[Test Photos] Error testing extracted ID: ${error.message}`);
              }
              
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
      } catch (error) {
        results.strategies.push({
          name: 'Internal ID Extraction',
          success: false,
          error: error.message
        });
      }
      
    } else {
      results.strategies.push({
        name: 'Basic User API',
        success: false,
        status: userResponse.status
      });
    }

    console.log(`[Test Photos] Test complete. Found ${results.photos.length} photos using ${results.strategies.length} strategies`);
    
    return new Response(JSON.stringify(results, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`[Test Photos] Error:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});