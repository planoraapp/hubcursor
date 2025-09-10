const https = require('https');

// Configuração do Supabase
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

function makeRequest(url, options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const jsonBody = body ? JSON.parse(body) : {};
                    resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function applyMigration() {
    console.log('🔥 APLICANDO MIGRAÇÃO - HABBO AUTH');
    console.log('=' .repeat(50));
    
    try {
        // 1. Criar tabela habbo_auth
        console.log('📊 Criando tabela habbo_auth...');
        
        const createTableSQL = `
-- Criar tabela principal de autenticação Habbo
CREATE TABLE IF NOT EXISTS public.habbo_auth (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    habbo_username VARCHAR(255) UNIQUE NOT NULL,
    habbo_motto TEXT,
    habbo_avatar TEXT,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_habbo_auth_username ON public.habbo_auth(habbo_username);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_admin ON public.habbo_auth(is_admin);
CREATE INDEX IF NOT EXISTS idx_habbo_auth_verified ON public.habbo_auth(is_verified);

-- Habilitar RLS
ALTER TABLE public.habbo_auth ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Public can view habbo users" 
    ON public.habbo_auth 
    FOR SELECT 
    USING (true);

CREATE POLICY "Service role can manage all habbo auth" 
    ON public.habbo_auth 
    FOR ALL 
    USING (current_setting('role', true) = 'service_role');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_habbo_auth_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_habbo_auth_updated_at
    BEFORE UPDATE ON public.habbo_auth
    FOR EACH ROW
    EXECUTE FUNCTION update_habbo_auth_updated_at();
        `;

        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/rpc/exec_sql`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            { sql: createTableSQL }
        );

        if (response.status === 200 || response.status === 201) {
            console.log('✅ Tabela habbo_auth criada com sucesso!');
        } else {
            console.log('❌ Erro ao criar tabela:', response.status, response.data);
            return;
        }

        // 2. Inserir contas administrativas
        console.log('👑 Criando contas administrativas...');
        
        const adminAccounts = [
            { habbo_username: 'habbohub', habbo_motto: 'HUB-ADMIN', password_hash: '151092', is_admin: true },
            { habbo_username: 'beebop', habbo_motto: 'BEEBOP-ADMIN', password_hash: '290684', is_admin: true }
        ];

        for (const account of adminAccounts) {
            const insertResponse = await makeRequest(
                `${SUPABASE_URL}/rest/v1/habbo_auth`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_SERVICE_KEY,
                        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    }
                },
                account
            );

            if (insertResponse.status === 201) {
                console.log(`✅ Conta ${account.habbo_username} criada!`);
            } else {
                console.log(`⚠️ Conta ${account.habbo_username} já existe ou erro:`, insertResponse.status);
            }
        }

        // 3. Testar consulta
        console.log('🧪 Testando consulta...');
        
        const testResponse = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_auth?select=*`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (testResponse.status === 200) {
            console.log('✅ Consulta funcionando! Contas encontradas:', testResponse.data.length);
            testResponse.data.forEach(user => {
                console.log(`   - ${user.habbo_username} (Admin: ${user.is_admin})`);
            });
        }

        console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
        console.log('📋 Sistema de autenticação Habbo implementado');
        console.log('🔑 Contas administrativas criadas');
        console.log('🚀 Pronto para uso!');

    } catch (error) {
        console.error('❌ Erro na migração:', error.message);
    }
}

// Executar migração
applyMigration().catch(console.error);
