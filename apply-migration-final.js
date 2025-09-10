const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

async function applyMigration() {
    console.log('🚀 Aplicando migração completa da tabela habbo_users...');
    
    try {
        // 1. Primeiro, vamos dropar a tabela existente se ela tiver estrutura incorreta
        console.log('📋 Verificando estrutura atual...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (checkResponse.ok) {
            const data = await checkResponse.json();
            console.log('✅ Tabela existe. Verificando estrutura...');
            
            // Se a tabela existe mas não tem as colunas corretas, vamos recriar
            if (data.length > 0 && !data[0].habbo_id) {
                console.log('⚠️ Estrutura incorreta detectada. Recriando tabela...');
                await recreateTable();
            } else {
                console.log('✅ Estrutura correta! Verificando contas de admin...');
                await checkAdminAccounts();
            }
        } else {
            console.log('📋 Tabela não existe. Criando nova estrutura...');
            await createNewTable();
        }

    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
}

async function recreateTable() {
    console.log('🔧 Recriando tabela habbo_users...');
    
    try {
        // Dropar tabela existente
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
            console.log('✅ Tabela antiga removida');
        }

        // Criar nova tabela
        await createNewTable();

    } catch (error) {
        console.error('❌ Erro ao recriar tabela:', error);
    }
}

async function createNewTable() {
    console.log('🏗️ Criando nova tabela habbo_users...');
    
    try {
        const createTableSQL = `
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

        CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel ON public.habbo_users (habbo_name, hotel);
        CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id ON public.habbo_users (habbo_id);
        CREATE INDEX IF NOT EXISTS idx_habbo_users_is_admin ON public.habbo_users (is_admin);
        CREATE INDEX IF NOT EXISTS idx_habbo_users_is_online ON public.habbo_users (is_online);

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

        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sql: createTableSQL
            })
        });

        if (createResponse.ok) {
            console.log('✅ Tabela habbo_users criada com sucesso!');
            await createAdminAccounts();
        } else {
            const error = await createResponse.text();
            console.log('❌ Erro ao criar tabela:', error);
        }

    } catch (error) {
        console.error('❌ Erro ao criar tabela:', error);
    }
}

async function createAdminAccounts() {
    console.log('👑 Criando contas de admin...');
    
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
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
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
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(beebopData)
        });

        if (beebopResponse.ok) {
            console.log('✅ Conta beebop criada!');
        } else {
            const error = await beebopResponse.text();
            console.log('⚠️ Erro ao criar beebop:', error);
        }

        // Verificar resultado final
        await checkAdminAccounts();

    } catch (error) {
        console.error('❌ Erro ao criar contas de admin:', error);
    }
}

async function checkAdminAccounts() {
    console.log('🔍 Verificando contas de admin...');
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=habbo_name,habbo_id,is_admin,password_hash`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const users = await response.json();
            console.log('📊 Usuários na tabela:');
            users.forEach(user => {
                console.log(`  👤 ${user.habbo_name} (${user.habbo_id}) - Admin: ${user.is_admin} - Senha: ${user.password_hash}`);
            });
            
            const adminUsers = users.filter(u => u.is_admin);
            if (adminUsers.length >= 2) {
                console.log('✅ Sistema pronto para teste!');
                console.log('🔐 Teste de login:');
                console.log('  - habbohub / 151092');
                console.log('  - beebop / 290684');
                console.log('🌐 Acesse: http://localhost:8081/');
            } else {
                console.log('⚠️ Contas de admin não encontradas. Criando...');
                await createAdminAccounts();
            }
        } else {
            const error = await response.text();
            console.log('❌ Erro ao verificar contas:', error);
        }

    } catch (error) {
        console.error('❌ Erro na verificação:', error);
    }
}

// Executar migração
applyMigration();
