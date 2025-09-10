const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

async function createAccountsDirect() {
    console.log('🚀 Criando contas diretamente via API...');
    
    try {
        // 1. Verificar se a tabela existe e tem a estrutura correta
        console.log('📋 Verificando tabela...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            console.log('❌ Tabela habbo_users não existe ou não está acessível');
            console.log('📋 Execute o SQL no Supabase Dashboard:');
            console.log('🔗 https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy/sql');
            console.log('📄 Use o arquivo: apply-habbo-users-migration.sql');
            return;
        }

        const data = await checkResponse.json();
        console.log('✅ Tabela existe! Estrutura:', Object.keys(data[0] || {}));

        // 2. Tentar criar habbohub
        console.log('👑 Criando conta habbohub...');
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

        // 3. Tentar criar beebop
        console.log('👑 Criando conta beebop...');
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

        // 4. Verificar resultado
        console.log('🔍 Verificando resultado...');
        const finalResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=habbo_name,habbo_id,is_admin,password_hash`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (finalResponse.ok) {
            const users = await finalResponse.json();
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
                console.log('⚠️ Contas de admin não encontradas');
            }
        } else {
            const error = await finalResponse.text();
            console.log('❌ Erro ao verificar resultado:', error);
        }

    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

// Executar
createAccountsDirect();
