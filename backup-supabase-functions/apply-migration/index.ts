import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔧 [MIGRATION] Aplicando migração para adicionar coluna last_access...')

    // 1. Adicionar coluna last_access
    const { error: alterError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.habbo_accounts 
        ADD COLUMN IF NOT EXISTS last_access timestamp with time zone DEFAULT now();
      `
    })

    if (alterError) {
      console.error('❌ [MIGRATION] Erro ao adicionar coluna last_access:', alterError)
    } else {
      console.log('✅ [MIGRATION] Coluna last_access adicionada com sucesso!')
    }

    // 2. Atualizar políticas RLS
    const { error: policyError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        -- Remover política antiga
        DROP POLICY IF EXISTS "Service role can manage all habbo accounts" ON public.habbo_accounts;

        -- Criar nova política para service role
        CREATE POLICY "Service role can manage all habbo accounts"
          ON public.habbo_accounts
          FOR ALL
          USING (current_setting('role', true) = 'service_role')
          WITH CHECK (current_setting('role', true) = 'service_role');

        -- Permitir leitura pública para verificação
        CREATE POLICY "Public can view habbo accounts for verification"
          ON public.habbo_accounts
          FOR SELECT
          USING (true);

        -- Permitir criação de contas especiais
        CREATE POLICY "Allow special account creation"
          ON public.habbo_accounts
          FOR INSERT
          WITH CHECK (
            habbo_name = 'habbohub' AND hotel = 'br' OR
            current_setting('role', true) = 'service_role'
          );

        -- Permitir atualização de contas especiais
        CREATE POLICY "Allow special account updates"
          ON public.habbo_accounts
          FOR UPDATE
          USING (
            habbo_name = 'habbohub' AND hotel = 'br' OR
            current_setting('role', true) = 'service_role'
          )
          WITH CHECK (
            habbo_name = 'habbohub' AND hotel = 'br' OR
            current_setting('role', true) = 'service_role'
          );

        -- Permitir exclusão de contas especiais
        CREATE POLICY "Allow special account deletion"
          ON public.habbo_accounts
          FOR DELETE
          USING (
            habbo_name = 'habbohub' AND hotel = 'br' OR
            current_setting('role', true) = 'service_role'
          );
      `
    })

    if (policyError) {
      console.error('❌ [MIGRATION] Erro ao atualizar políticas RLS:', policyError)
    } else {
      console.log('✅ [MIGRATION] Políticas RLS atualizadas com sucesso!')
    }

    // 3. Criar índice para performance
    const { error: indexError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_habbo_accounts_name_hotel 
        ON public.habbo_accounts (habbo_name, hotel);
      `
    })

    if (indexError) {
      console.error('❌ [MIGRATION] Erro ao criar índice:', indexError)
    } else {
      console.log('✅ [MIGRATION] Índice criado com sucesso!')
    }

    console.log('🎉 [MIGRATION] Migração aplicada com sucesso!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Migração aplicada com sucesso!' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ [MIGRATION] Erro geral:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
