const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

async function testMigration() {
    console.log('🧪 Testando migração da tabela habbo_users...');
    
    try {
        // 1. Verificar se a tabela existe
        console.log('📋 Verificando tabela habbo_users...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=count`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (checkResponse.ok) {
            console.log('✅ Tabela habbo_users existe e está acessível!');
            
            // 2. Verificar contas de admin
            console.log('👑 Verificando contas de admin...');
            const adminResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=habbo_name,habbo_id,is_admin,password_hash&habbo_name=in.(habbohub,beebop)`, {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (adminResponse.ok) {
                const admins = await adminResponse.json();
                console.log('📊 Contas de admin encontradas:');
                admins.forEach(user => {
                    console.log(`  👤 ${user.habbo_name} (${user.habbo_id}) - Admin: ${user.is_admin} - Senha: ${user.password_hash}`);
                });
                
                if (admins.length >= 2) {
                    console.log('✅ Sistema pronto para teste!');
                    console.log('🔐 Teste de login:');
                    console.log('  - habbohub / 151092');
                    console.log('  - beebop / 290684');
                } else {
                    console.log('⚠️ Contas de admin não encontradas. Aplicando migração...');
                    await createAdminAccounts();
                }
            } else {
                const error = await adminResponse.text();
                console.log('❌ Erro ao verificar contas de admin:', error);
            }
        } else {
            const error = await checkResponse.text();
            console.log('❌ Tabela habbo_users não existe ou não está acessível:', error);
            console.log('📋 Aplicando migração via Supabase Dashboard...');
            console.log('🔗 Acesse: https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy/sql');
            console.log('📄 Execute o SQL do arquivo: apply-habbo-users-migration.sql');
        }

    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

async function createAdminAccounts() {
    console.log('🔧 Criando contas de admin...');
    
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
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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

    } catch (error) {
        console.error('❌ Erro ao criar contas:', error);
    }
}

// Executar teste
testMigration();
