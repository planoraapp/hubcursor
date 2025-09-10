const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

async function forceRecreateTable() {
    console.log('🔥 Forçando recriação da tabela habbo_users...');
    
    try {
        // 1. Dropar tabela existente
        console.log('🗑️ Removendo tabela existente...');
        const dropResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: 'DROP TABLE IF EXISTS public.habbo_users CASCADE;'
            })
        });

        if (dropResponse.ok) {
            console.log('✅ Tabela removida');
        } else {
            const error = await dropResponse.text();
            console.log('⚠️ Erro ao remover tabela:', error);
        }

        // 2. Criar nova tabela com estrutura completa
        console.log('🏗️ Criando nova tabela...');
        const createSQL = `
        CREATE TABLE public.habbo_users (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          habbo_name text NOT NULL,
          habbo_id text NOT NULL,
          hotel text NOT NULL DEFAULT 'br',
          figure_string text,
          motto text,
          is_online boolean DEFAULT false,
          is_admin boolean DEFAULT false,
          password_hash text,
          profile_visible boolean DEFAULT true,
          member_since timestamp with time zone,
          last_access timestamp with time zone DEFAULT now(),
          current_level integer DEFAULT 1,
          total_experience integer DEFAULT 0,
          star_gem_count integer DEFAULT 0,
          selected_badges jsonb DEFAULT '[]'::jsonb,
          badges_data jsonb DEFAULT '{}'::jsonb,
          groups_data jsonb DEFAULT '{}'::jsonb,
          friends_data jsonb DEFAULT '{}'::jsonb,
          rooms_data jsonb DEFAULT '{}'::jsonb,
          achievements_data jsonb DEFAULT '{}'::jsonb,
          full_api_data jsonb DEFAULT '{}'::jsonb,
          data_collected_at timestamp with time zone DEFAULT now(),
          data_source text DEFAULT 'habbo.com.br',
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          
          CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
          CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
        );
        `;

        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: createSQL
            })
        });

        if (createResponse.ok) {
            console.log('✅ Tabela criada!');
        } else {
            const error = await createResponse.text();
            console.log('❌ Erro ao criar tabela:', error);
            return;
        }

        // 3. Habilitar RLS
        console.log('🔒 Configurando RLS...');
        const rlsSQL = `
        ALTER TABLE public.habbo_users ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Public can view habbo users"
          ON public.habbo_users
          FOR SELECT
          TO PUBLIC
          USING (true);

        CREATE POLICY "Users can insert their own data"
          ON public.habbo_users
          FOR INSERT
          TO PUBLIC
          WITH CHECK (true);

        CREATE POLICY "Users can update their own data"
          ON public.habbo_users
          FOR UPDATE
          TO PUBLIC
          USING (true)
          WITH CHECK (true);
        `;

        const rlsResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: rlsSQL
            })
        });

        if (rlsResponse.ok) {
            console.log('✅ RLS configurado!');
        } else {
            const error = await rlsResponse.text();
            console.log('⚠️ Erro ao configurar RLS:', error);
        }

        // 4. Criar índices
        console.log('📊 Criando índices...');
        const indexSQL = `
        CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel ON public.habbo_users (habbo_name, hotel);
        CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id ON public.habbo_users (habbo_id);
        CREATE INDEX IF NOT EXISTS idx_habbo_users_is_admin ON public.habbo_users (is_admin);
        CREATE INDEX IF NOT EXISTS idx_habbo_users_is_online ON public.habbo_users (is_online);
        `;

        const indexResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: indexSQL
            })
        });

        if (indexResponse.ok) {
            console.log('✅ Índices criados!');
        } else {
            const error = await indexResponse.text();
            console.log('⚠️ Erro ao criar índices:', error);
        }

        // 5. Criar trigger
        console.log('⚡ Criando trigger...');
        const triggerSQL = `
        CREATE OR REPLACE FUNCTION update_habbo_users_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_habbo_users_updated_at
          BEFORE UPDATE ON public.habbo_users
          FOR EACH ROW
          EXECUTE FUNCTION update_habbo_users_updated_at();
        `;

        const triggerResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: triggerSQL
            })
        });

        if (triggerResponse.ok) {
            console.log('✅ Trigger criado!');
        } else {
            const error = await triggerResponse.text();
            console.log('⚠️ Erro ao criar trigger:', error);
        }

        // 6. Criar contas de admin
        console.log('👑 Criando contas de admin...');
        await createAdminAccounts();

    } catch (error) {
        console.error('❌ Erro na recriação:', error);
    }
}

async function createAdminAccounts() {
    try {
        // Criar habbohub
        const habbohubData = {
            habbo_name: 'habbohub',
            habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
            hotel: 'br',
            figure_string: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
            motto: 'HUB-QQ797',
            is_admin: true,
            is_online: false,
            password_hash: '151092',
            profile_visible: false
        };

        const habbohubResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(habbohubData)
        });

        if (habbohubResponse.ok) {
            console.log('✅ Conta habbohub criada!');
        } else {
            const error = await habbohubResponse.text();
            console.log('⚠️ Erro ao criar habbohub:', error);
        }

        // Criar beebop
        const beebopData = {
            habbo_name: 'beebop',
            habbo_id: 'hhbr-beebop-id',
            hotel: 'br',
            figure_string: 'hr-100-0.hd-180-1',
            motto: 'BEEBOP-MOTTO',
            is_admin: true,
            is_online: false,
            password_hash: '290684',
            profile_visible: true
        };

        const beebopResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(beebopData)
        });

        if (beebopResponse.ok) {
            console.log('✅ Conta beebop criada!');
        } else {
            const error = await beebopResponse.text();
            console.log('⚠️ Erro ao criar beebop:', error);
        }

        // Verificar resultado
        console.log('🔍 Verificando resultado...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=habbo_name,habbo_id,is_admin,password_hash`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (checkResponse.ok) {
            const users = await checkResponse.json();
            console.log('📊 Usuários na tabela:');
            users.forEach(user => {
                console.log(`  👤 ${user.habbo_name} (${user.habbo_id}) - Admin: ${user.is_admin} - Senha: ${user.password_hash}`);
            });
            
            console.log('✅ Sistema pronto para teste!');
            console.log('🔐 Teste de login:');
            console.log('  - habbohub / 151092');
            console.log('  - beebop / 290684');
            console.log('🌐 Acesse: http://localhost:8081/');
        } else {
            const error = await checkResponse.text();
            console.log('❌ Erro ao verificar resultado:', error);
        }

    } catch (error) {
        console.error('❌ Erro ao criar contas:', error);
    }
}

// Executar recriação
forceRecreateTable();
