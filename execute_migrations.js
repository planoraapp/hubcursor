const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigrations() {
  console.log('🚀 Executando migrações...');

  try {
    // 1. Executar migração de dados reais
    console.log('📊 Atualizando dados reais dos usuários...');
    const { error: realDataError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Atualizar dados do habbohub
        UPDATE public.habbo_accounts 
        SET 
          habbo_id = 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
          figure_string = 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
          motto = 'HUB-QQ797',
          member_since = '2025-07-28T22:19:21.000+0000'::timestamp with time zone,
          current_level = 9,
          total_experience = 147,
          star_gem_count = 0,
          last_access_time = '2025-09-10T13:19:32.000+0000'::timestamp with time zone,
          updated_at = now()
        WHERE habbo_name = 'habbohub' AND hotel = 'br';

        -- Atualizar dados do Beebop
        UPDATE public.habbo_accounts 
        SET 
          habbo_id = 'hhbr-00e6988dddeb5a1838658c854d62fe49',
          figure_string = 'hr-155-45.hd-208-10.ch-4165-91-1408.lg-4167-91.sh-3068-1408-90.ea-3169-92.fa-1206-90.ca-1804-1326',
          motto = 'HUB-ACTI1',
          member_since = '2006-06-20T16:57:34.000+0000'::timestamp with time zone,
          current_level = 28,
          total_experience = 2750,
          star_gem_count = 894,
          last_access_time = '2025-09-14T11:31:57.000+0000'::timestamp with time zone,
          updated_at = now()
        WHERE habbo_name = 'Beebop' AND hotel = 'br';
      `
    });

    if (realDataError) {
      console.error('❌ Erro ao atualizar dados reais:', realDataError);
    } else {
      console.log('✅ Dados reais atualizados com sucesso!');
    }

    // 2. Criar homes de exemplo
    console.log('🏠 Criando homes de exemplo...');
    const { error: homesError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Criar home layout para Beebop
        INSERT INTO public.user_home_layouts (
          id,
          user_id,
          widgets,
          stickers,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
          '[]'::jsonb,
          '[]'::jsonb,
          now(),
          now()
        ) ON CONFLICT (user_id) DO UPDATE SET
          updated_at = now();

        -- Criar home background para Beebop
        INSERT INTO public.user_home_backgrounds (
          id,
          user_id,
          background_type,
          background_value,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          (SELECT id FROM auth.users WHERE email = 'hhbr-beebop@habbohub.com' LIMIT 1),
          'image',
          'bghabbohub.png',
          now(),
          now()
        ) ON CONFLICT (user_id) DO UPDATE SET
          updated_at = now();

        -- Criar home layout para habbohub
        INSERT INTO public.user_home_layouts (
          id,
          user_id,
          widgets,
          stickers,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
          '[]'::jsonb,
          '[]'::jsonb,
          now(),
          now()
        ) ON CONFLICT (user_id) DO UPDATE SET
          updated_at = now();

        -- Criar home background para habbohub
        INSERT INTO public.user_home_backgrounds (
          id,
          user_id,
          background_type,
          background_value,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          (SELECT id FROM auth.users WHERE email = 'habbohub@habbohub.com' LIMIT 1),
          'image',
          'bghabbohub.png',
          now(),
          now()
        ) ON CONFLICT (user_id) DO UPDATE SET
          updated_at = now();
      `
    });

    if (homesError) {
      console.error('❌ Erro ao criar homes:', homesError);
    } else {
      console.log('✅ Homes criadas com sucesso!');
    }

    console.log('🎉 Migrações executadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

executeMigrations();
