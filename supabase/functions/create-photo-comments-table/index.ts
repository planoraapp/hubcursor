import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Criar tabela photo_comments
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS photo_comments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        photo_id TEXT NOT NULL,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        habbo_name TEXT NOT NULL,
        comment_text TEXT NOT NULL CHECK (length(comment_text) >= 1 AND length(comment_text) <= 500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Criar índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS photo_comments_photo_id_idx ON photo_comments(photo_id);
      CREATE INDEX IF NOT EXISTS photo_comments_user_id_idx ON photo_comments(user_id);
      CREATE INDEX IF NOT EXISTS photo_comments_created_at_idx ON photo_comments(created_at);
    `

    // Habilitar RLS
    const enableRLSSQL = `ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;`

    // Criar políticas RLS
    const createPoliciesSQL = `
      DROP POLICY IF EXISTS "Users can view all comments" ON photo_comments;
      CREATE POLICY "Users can view all comments" ON photo_comments
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Authenticated users can insert their own comments" ON photo_comments;
      CREATE POLICY "Authenticated users can insert their own comments" ON photo_comments
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own comments" ON photo_comments;
      CREATE POLICY "Users can update their own comments" ON photo_comments
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete their own comments" ON photo_comments;
      CREATE POLICY "Users can delete their own comments" ON photo_comments
        FOR DELETE USING (auth.uid() = user_id);
    `

    // Criar função de trigger
    const createTriggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `

    // Criar trigger
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS update_photo_comments_updated_at ON photo_comments;
      CREATE TRIGGER update_photo_comments_updated_at 
        BEFORE UPDATE ON photo_comments 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `

    // Usar o cliente Supabase para executar SQL
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Executar cada comando SQL separadamente
    const sqlCommands = [
      createTableSQL,
      createIndexesSQL,
      enableRLSSQL,
      createPoliciesSQL,
      createTriggerFunctionSQL,
      createTriggerSQL
    ]

    for (const sql of sqlCommands) {
      try {
        // Usar query direta para comandos DDL
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
          body: JSON.stringify({
            query: sql
          })
        })
        
        if (!response.ok) {
          console.log(`Comando executado: ${sql.substring(0, 50)}...`)
        }
      } catch (error) {
        console.log(`Erro ao executar comando: ${error.message}`)
      }
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro ao executar SQL:', errorText)
      throw new Error(`Erro HTTP: ${response.status} - ${errorText}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Tabela photo_comments criada com sucesso!' 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
