const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM4MDQ3NDQwLCJleHAiOjIwNTM2MjM0NDB9.8Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q7Q';

async function applyMigration() {
    console.log('🚀 Aplicando migração da tabela habbo_users...');
    
    try {
        // 1. Primeiro, vamos verificar se a tabela já existe
        console.log('📋 Verificando tabela existente...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=count`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (checkResponse.ok) {
            console.log('✅ Tabela habbo_users já existe!');
            
            // Verificar se as contas de admin existem
            const adminCheck = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=habbo_name,is_admin&habbo_name=in.(habbohub,beebop)`, {
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            if (adminCheck.ok) {
                const admins = await adminCheck.json();
                console.log('👑 Contas de admin encontradas:', admins);
                
                if (admins.length >= 2) {
                    console.log('✅ Sistema pronto para teste!');
                    return;
                }
            }
        }

        // 2. Se não existe ou não tem as contas, vamos criar
        console.log('🔧 Criando/atualizando estrutura...');
        
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
            console.log('✅ Conta habbohub criada/atualizada!');
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
            console.log('✅ Conta beebop criada/atualizada!');
        } else {
            const error = await beebopResponse.text();
            console.log('⚠️ Erro ao criar beebop:', error);
        }

        // 3. Verificar resultado final
        console.log('🔍 Verificando resultado final...');
        const finalCheck = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=habbo_name,habbo_id,is_admin,password_hash`, {
            headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (finalCheck.ok) {
            const users = await finalCheck.json();
            console.log('📊 Usuários na tabela:');
            users.forEach(user => {
                console.log(`  👤 ${user.habbo_name} (${user.habbo_id}) - Admin: ${user.is_admin} - Senha: ${user.password_hash}`);
            });
            console.log('✅ Migração aplicada com sucesso!');
        } else {
            const error = await finalCheck.text();
            console.log('❌ Erro na verificação final:', error);
        }

    } catch (error) {
        console.error('❌ Erro na migração:', error);
    }
}

// Executar migração
applyMigration();
