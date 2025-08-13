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

      // Strategy 2: Aggressive S3 discovery with known working patterns
      console.log(`[Test Photos] Strategy 2: Aggressive S3 Discovery`);
      
      const hotelCode = hotel === 'com.br' ? 'hhbr' : 'hhus';
      
      // Test with known working IDs from your examples
      const knownWorkingIds = ['464837', '91557551'];
      const knownWorkingTimestamps = [1753569292755, 1755042756833];
      
      // First test: Verify the known working examples still work
      console.log(`[Test Photos] Testing known working examples...`);
      for (const testId of knownWorkingIds) {
        for (const timestamp of knownWorkingTimestamps) {
          const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${testId}-${timestamp}.png`;
          
          try {
            const headResponse = await fetch(s3Url, { 
              method: 'HEAD',
              headers: {
                'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
              },
            });

            if (headResponse.ok) {
              console.log(`[Test Photos] ✅ Known working example confirmed: ${s3Url}`);
              results.photos.push({
                id: `known-${testId}-${timestamp}`,
                url: s3Url,
                previewUrl: s3Url,
                timestamp: new Date(timestamp).toISOString(),
                source: 'known_working_example',
                testId: testId,
                originalTimestamp: timestamp
              });
            } else {
              console.log(`[Test Photos] ❌ Known example failed (${headResponse.status}): ${s3Url}`);
            }
          } catch (error) {
            console.log(`[Test Photos] Error testing known example: ${error.message}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Generate timestamps based on the pattern from your examples
      const now = Date.now();
      const timestampPatterns = [];
      
      // Recent timestamps (last 30 days, daily)
      for (let days = 0; days < 30; days++) {
        timestampPatterns.push(now - (days * 24 * 60 * 60 * 1000));
      }
      
      // Use the exact timestamp patterns from your examples as reference
      const baseTimestamp1 = 1753569292755; // From your first example
      const baseTimestamp2 = 1755042756833; // From your second example
      
      // Generate variations around these known timestamps
      for (let i = -48; i <= 48; i++) { // ±48 hours around known working timestamps
        timestampPatterns.push(baseTimestamp1 + (i * 60 * 60 * 1000)); // hourly variations
        timestampPatterns.push(baseTimestamp2 + (i * 60 * 60 * 1000));
      }
      
      console.log(`[Test Photos] Generated ${timestampPatterns.length} timestamp patterns to test`);
      
      // Test with multiple potential internal IDs
      const potentialInternalIds = [
        ...knownWorkingIds, // Known working IDs
        // Try some common ID patterns for testing
        '100000', '200000', '300000', '400000', '500000',
        '1000000', '2000000', '3000000', '4000000', '5000000',
      ];
      
      let foundPhotos = 0;
      const maxPhotosToFind = 10;
      
      for (const internalId of potentialInternalIds) {
        if (foundPhotos >= maxPhotosToFind) break;
        
        console.log(`[Test Photos] Testing internal ID: ${internalId}`);
        
        // Test a subset of timestamps for each ID
        const timestampsToTest = timestampPatterns.slice(0, 20);
        
        for (const timestamp of timestampsToTest) {
          if (foundPhotos >= maxPhotosToFind) break;
          
          const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${internalId}-${timestamp}.png`;
          
          try {
            const headResponse = await fetch(s3Url, { 
              method: 'HEAD',
              headers: {
                'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
              },
            });

            if (headResponse.ok) {
              console.log(`[Test Photos] ✅ Found photo with ID ${internalId}: ${s3Url}`);
              results.photos.push({
                id: `discovered-${internalId}-${timestamp}`,
                url: s3Url,
                previewUrl: s3Url,
                timestamp: new Date(timestamp).toISOString(),
                source: 's3_pattern_discovery',
                internalId: internalId,
                testTimestamp: timestamp
              });
              foundPhotos++;
            }
          } catch (error) {
            console.log(`[Test Photos] Error testing ID ${internalId}: ${error.message}`);
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 50));
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
          
          // Enhanced patterns focused on finding internal user IDs
          const enhancedPatterns = [
            // Direct ID patterns
            /['":](\d{6,8})['":\s,]/gi,                    // 6-8 digit IDs
            /user[_-]?id['":\s]*['":]?(\d+)/gi,           // user_id, userId patterns
            /internal[_-]?id['":\s]*['":]?(\d+)/gi,       // internal_id patterns
            /habbo[_-]?id['":\s]*['":]?(\d+)/gi,          // habbo_id patterns
            
            // S3 URL patterns (most reliable)
            /servercamera\/purchased\/\w+\/p-(\d+)-/gi,   // From S3 URLs
            /habbo-stories-content\.s3\.amazonaws\.com\/servercamera\/purchased\/\w+\/p-(\d+)-/gi,
            
            // JavaScript variable patterns
            /var\s+userId\s*=\s*['"]*(\d+)/gi,
            /var\s+internalId\s*=\s*['"]*(\d+)/gi,
            /window\.userId\s*=\s*['"]*(\d+)/gi,
            /window\.internalId\s*=\s*['"]*(\d+)/gi,
            
            // JSON data patterns
            /"userId"\s*:\s*['"]*(\d+)/gi,
            /"internalId"\s*:\s*['"]*(\d+)/gi,
            /"id"\s*:\s*['"]*(\d+)/gi,
            
            // Data attribute patterns
            /data-user-id\s*=\s*['"]*(\d+)/gi,
            /data-internal-id\s*=\s*['"]*(\d+)/gi,
            
            // Configuration object patterns
            /config\s*:\s*{[^}]*user[_-]?id['":\s]*['":]?(\d+)/gi,
            /settings\s*:\s*{[^}]*user[_-]?id['":\s]*['":]?(\d+)/gi,
            
            // Angular/React state patterns
            /state\s*:\s*{[^}]*user[_-]?id['":\s]*['":]?(\d+)/gi,
            /props\s*:\s*{[^}]*user[_-]?id['":\s]*['":]?(\d+)/gi,
          ];

          const foundIds = new Set();
          
          for (const pattern of enhancedPatterns) {
            const matches = Array.from(html.matchAll(pattern));
            console.log(`[Test Photos] Pattern ${pattern} found ${matches.length} matches`);
            
            for (const match of matches) {
              if (match[1] && match[1].length >= 5 && match[1].length <= 10) {
                const id = match[1];
                const numericId = parseInt(id);
                
                // More restrictive filtering for realistic internal IDs
                if (numericId >= 100000 && numericId <= 99999999) {
                  foundIds.add(id);
                  console.log(`[Test Photos] Found candidate internal ID: ${id} (pattern: ${pattern.toString().slice(0, 50)})`);
                }
              }
            }
          }

          results.strategies.push({
            name: 'Enhanced Internal ID Extraction',
            success: true,
            data: {
              foundIds: Array.from(foundIds),
              htmlLength: html.length,
              patternsUsed: enhancedPatterns.length
            }
          });

          // Test found IDs with broader timestamp range
          const timestampsToTest = [
            ...knownWorkingTimestamps, // Your known working timestamps
            now, now - (24 * 60 * 60 * 1000), now - (48 * 60 * 60 * 1000), // Recent
            now - (7 * 24 * 60 * 60 * 1000), now - (30 * 24 * 60 * 60 * 1000), // Older
          ];
          
          for (const internalId of foundIds) {
            for (const timestamp of timestampsToTest) {
              const s3Url = `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/${hotelCode}/p-${internalId}-${timestamp}.png`;
              
              try {
                const headResponse = await fetch(s3Url, { 
                  method: 'HEAD',
                  headers: {
                    'User-Agent': 'HabboHub/1.0 (Mozilla/5.0 compatible)',
                  },
                });

                if (headResponse.ok) {
                  console.log(`[Test Photos] ✅ Found photo with extracted ID ${internalId}: ${s3Url}`);
                  results.photos.push({
                    id: `extracted-${internalId}-${timestamp}`,
                    url: s3Url,
                    previewUrl: s3Url,
                    timestamp: new Date(timestamp).toISOString(),
                    source: 'extracted_internal_id',
                    internalId: internalId,
                    extractedTimestamp: timestamp
                  });
                }
              } catch (error) {
                console.log(`[Test Photos] Error testing extracted ID ${internalId}: ${error.message}`);
              }
              
              await new Promise(resolve => setTimeout(resolve, 75));
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