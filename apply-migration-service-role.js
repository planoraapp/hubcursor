const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const migrationSQL = `
-- ========================================
-- MIGRAÇÃO PARA CRIAR TABELA HABBO_USERS COMPLETA
-- ========================================

-- 1. Dropar tabela existente se existir (cuidado!)
DROP TABLE IF EXISTS public.habbo_users CASCADE;

-- 2. Criar nova tabela habbo_users com estrutura completa
CREATE TABLE IF NOT EXISTS public.habbo_users (
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
  
  -- Índices únicos
  CONSTRAINT unique_habbo_name_hotel UNIQUE (habbo_name, hotel),
  CONSTRAINT unique_habbo_id_hotel UNIQUE (habbo_id, hotel)
);

-- 3. Habilitar RLS
ALTER TABLE public.habbo_users ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS
CREATE POLICY IF NOT EXISTS "Public can view habbo users"
  ON public.habbo_users
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own data"
  ON public.habbo_users
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Users can update their own data"
  ON public.habbo_users
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_users_name_hotel ON public.habbo_users (habbo_name, hotel);
CREATE INDEX IF NOT EXISTS idx_habbo_users_habbo_id ON public.habbo_users (habbo_id);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_admin ON public.habbo_users (is_admin);
CREATE INDEX IF NOT EXISTS idx_habbo_users_is_online ON public.habbo_users (is_online);

-- 6. Trigger para updated_at
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

-- 7. Inserir contas de admin
INSERT INTO public.habbo_users (
  habbo_name,
  habbo_id,
  hotel,
  figure_string,
  motto,
  is_admin,
  is_online,
  password_hash,
  profile_visible
) VALUES 
(
  'habbohub',
  'hhbr-81b7220d11b7a21997226bf7cfcbad51',
  'br',
  'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
  'HUB-QQ797',
  true,
  false,
  '151092',
  false
),
(
  'beebop',
  'hhbr-beebop-id',
  'br',
  'hr-100-0.hd-180-1',
  'BEEBOP-MOTTO',
  true,
  false,
  '290684',
  true
)
ON CONFLICT (habbo_name, hotel) DO UPDATE SET
  habbo_id = EXCLUDED.habbo_id,
  figure_string = EXCLUDED.figure_string,
  motto = EXCLUDED.motto,
  is_admin = EXCLUDED.is_admin,
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- 8. Verificar se foi criado corretamente
SELECT 'Tabela habbo_users criada com sucesso!' as status;
SELECT habbo_name, habbo_id, is_admin, password_hash FROM public.habbo_users;
`;

async function applyMigration() {
    console.log('🚀 Aplicando migração completa via service_role...');
    
    try {
        // Aplicar migração via rpc
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sql: migrationSQL })
        });

        if (response.ok) {
            const result = await response.text();
            console.log('✅ Migração aplicada com sucesso!');
            console.log('📊 Resultado:', result);
        } else {
            const error = await response.text();
            console.log('❌ Erro ao aplicar migração:', error);
            
            // Tentar método alternativo - aplicar via SQL direto
            console.log('🔄 Tentando método alternativo...');
            await applyMigrationAlternative();
        }

    } catch (error) {
        console.error('❌ Erro:', error);
        console.log('🔄 Tentando método alternativo...');
        await applyMigrationAlternative();
    }
}

async function applyMigrationAlternative() {
    console.log('🔄 Aplicando migração via método alternativo...');
    
    try {
        // 1. Dropar tabela existente
        console.log('🗑️ Removendo tabela existente...');
        const dropResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // 2. Criar nova tabela via DDL
        console.log('🏗️ Criando nova tabela...');
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                sql: `CREATE TABLE IF NOT EXISTS public.habbo_users (
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
                );`
            })
        });

        if (createResponse.ok) {
            console.log('✅ Tabela criada!');
            
            // 3. Inserir contas de admin
            console.log('👑 Criando contas de admin...');
            await createAdminAccounts();
        } else {
            const error = await createResponse.text();
            console.log('❌ Erro ao criar tabela:', error);
        }

    } catch (error) {
        console.error('❌ Erro no método alternativo:', error);
    }
}

async function createAdminAccounts() {
    try {
        // HabboHub
        const habbohubResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                habbo_name: 'habbohub',
                habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
                hotel: 'br',
                figure_string: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
                motto: 'HUB-QQ797',
                is_admin: true,
                is_online: false,
                password_hash: '151092',
                profile_visible: false
            })
        });

        if (habbohubResponse.ok) {
            console.log('✅ Conta habbohub criada!');
        } else {
            const error = await habbohubResponse.text();
            console.log('⚠️ Erro ao criar habbohub:', error);
        }

        // Beebop
        const beebopResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                habbo_name: 'beebop',
                habbo_id: 'hhbr-beebop-id',
                hotel: 'br',
                figure_string: 'hr-100-0.hd-180-1',
                motto: 'BEEBOP-MOTTO',
                is_admin: true,
                is_online: false,
                password_hash: '290684',
                profile_visible: true
            })
        });

        if (beebopResponse.ok) {
            console.log('✅ Conta beebop criada!');
        } else {
            const error = await beebopResponse.text();
            console.log('⚠️ Erro ao criar beebop:', error);
        }

        // Verificar resultado
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
            
            if (users.length >= 2) {
                console.log('✅ Sistema pronto para teste!');
                console.log('🔐 Teste de login:');
                console.log('  - habbohub / 151092');
                console.log('  - beebop / 290684');
                console.log('🌐 Acesse: http://localhost:8081/');
            }
        }

    } catch (error) {
        console.error('❌ Erro ao criar contas:', error);
    }
}

// Executar
applyMigration();
