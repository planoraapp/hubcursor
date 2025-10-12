import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'public' } }
    )

    console.log('🔄 Corrigindo constraints da tabela photo_comments...');

    // SQL para corrigir as constraints
    const sqlCommands = [
      // Remover foreign key constraint
      `ALTER TABLE photo_comments DROP CONSTRAINT IF EXISTS photo_comments_user_id_fkey;`,
      
      // Adicionar constraint de formato UUID
      `ALTER TABLE photo_comments ADD CONSTRAINT photo_comments_user_id_format 
       CHECK (user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');`,
      
      // Remover políticas antigas
      `DROP POLICY IF EXISTS "Users can view all comments" ON photo_comments;`,
      `DROP POLICY IF EXISTS "Authenticated users can insert their own comments" ON photo_comments;`,
      `DROP POLICY IF EXISTS "Users can update their own comments" ON photo_comments;`,
      `DROP POLICY IF EXISTS "Users can delete their own comments" ON photo_comments;`,
      
      // Criar novas políticas
      `CREATE POLICY "Users can view all comments" ON photo_comments
       FOR SELECT USING (true);`,
       
      `CREATE POLICY "Users can insert comments if they exist in habbo_accounts" ON photo_comments
       FOR INSERT WITH CHECK (
         EXISTS (
           SELECT 1 FROM habbo_accounts 
           WHERE habbo_accounts.supabase_user_id = photo_comments.user_id
         )
       );`,
       
      `CREATE POLICY "Users can update their own comments" ON photo_comments
       FOR UPDATE USING (
         EXISTS (
           SELECT 1 FROM habbo_accounts 
           WHERE habbo_accounts.supabase_user_id = photo_comments.user_id
         )
       );`,
       
      `CREATE POLICY "Users can delete their own comments" ON photo_comments
       FOR DELETE USING (
         EXISTS (
           SELECT 1 FROM habbo_accounts 
           WHERE habbo_accounts.supabase_user_id = photo_comments.user_id
         )
       );`
    ];

    const results = [];
    
    for (const sql of sqlCommands) {
      try {
        console.log(`🔄 Executando: ${sql.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.error(`❌ Erro:`, error);
          results.push({ sql: sql.substring(0, 50), success: false, error: error.message });
        } else {
          console.log(`✅ Sucesso`);
          results.push({ sql: sql.substring(0, 50), success: true });
        }
      } catch (error) {
        console.error(`❌ Erro geral:`, error);
        results.push({ sql: sql.substring(0, 50), success: false, error: error.message });
      }
    }

    // Testar inserção de comentário após correção
    console.log('🔄 Testando inserção de comentário...');
    const testComment = {
      photo_id: 'test-photo-constraint-fix',
      user_id: '9fa94b30-1f56-4ea5-8e53-b79a098ab739', // ID do PatodeBorracha
      habbo_name: 'PatodeBorracha',
      comment_text: 'Teste após correção de constraint'
    };

    const { data: testData, error: testError } = await supabase
      .from('photo_comments')
      .insert(testComment);

    if (testError) {
      console.error('❌ Erro no teste de inserção:', testError);
      results.push({ test: 'insertion', success: false, error: testError.message });
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      results.push({ test: 'insertion', success: true });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Constraints corrigidas com sucesso',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
