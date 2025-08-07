
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Categories mapping
const CATEGORIES = {
  'backgroundshome': 'Papel de Parede',
  'animated': 'Animados',
  'icons': 'Ícones',
  'mockups': 'Mockups',
  'mountable': 'Montáveis',
  'stickers': 'Stickers'
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Only POST method allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  // Create Supabase clients
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔄 Starting asset sync process...');

    // Sync assets from storage to database
    const syncResults = await Promise.all(
      Object.entries(CATEGORIES).map(async ([folder, category]) => {
        console.log(`📂 Processing folder: ${folder} (${category})`);
        
        // List files in the bucket folder
        const { data: files, error: listError } = await supabase.storage
          .from('home-assets')
          .list(folder);

        if (listError) {
          console.error(`❌ Error listing files in ${folder}:`, listError);
          return { folder, error: listError.message, synced: 0 };
        }

        if (!files || files.length === 0) {
          console.log(`📭 No files found in ${folder}`);
          return { folder, synced: 0 };
        }

        console.log(`📋 Found ${files.length} files in ${folder}`);

        // Process each file
        let syncedCount = 0;
        for (const file of files) {
          if (file.name === '.emptyFolderPlaceholder') continue;
          
          const filePath = `${folder}/${file.name}`;
          
          try {
            // Check if asset already exists
            const { data: existingAsset, error: findError } = await supabase
              .from('home_assets')
              .select('id')
              .eq('file_path', filePath)
              .single();

            if (findError && findError.code !== 'PGRST116') {
              console.error(`⚠️ Error finding asset ${filePath}:`, findError);
              continue;
            }

            if (existingAsset) {
              // Update existing asset
              const { error: updateError } = await supabase
                .from('home_assets')
                .update({ 
                  name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                  category: category,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingAsset.id);

              if (updateError) {
                console.error(`❌ Error updating asset ${filePath}:`, updateError);
                continue;
              }
              
              console.log(`✅ Updated: ${filePath}`);
            } else {
              // Insert new asset
              const { error: insertError } = await supabase
                .from('home_assets')
                .insert({
                  name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                  category: category,
                  file_path: filePath,
                  bucket_name: 'home-assets',
                  is_active: true
                });

              if (insertError) {
                console.error(`❌ Error inserting asset ${filePath}:`, insertError);
                continue;
              }
              
              console.log(`➕ Inserted: ${filePath}`);
            }
            
            syncedCount++;
          } catch (error) {
            console.error(`💥 Error processing ${filePath}:`, error);
          }
        }

        return { folder, category, synced: syncedCount };
      })
    );

    const totalSynced = syncResults.reduce((total, result) => total + (result.synced || 0), 0);

    console.log('🎉 Asset sync completed successfully');
    console.log('📊 Sync Results:', syncResults);

    return new Response(JSON.stringify({
      success: true,
      message: 'Assets synced successfully',
      totalSynced,
      results: syncResults
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('💥 Asset sync failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});
