const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

// Função para gerar UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function createAccountsUUID() {
    console.log('🚀 Criando contas com UUIDs válidos...');
    
    try {
        // 1. Verificar estrutura atual da tabela
        console.log('📋 Verificando estrutura da tabela...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=*&limit=1`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!checkResponse.ok) {
            console.log('❌ Tabela habbo_users não existe');
            return;
        }

        const data = await checkResponse.json();
        console.log('✅ Tabela existe! Campos disponíveis:', Object.keys(data[0] || {}));

        // 2. Criar habbohub com UUID válido
        const habbohubData = {
            habbo_name: 'habbohub',
            id: generateUUID(),
            habbo_hotel: 'br',
            last_synced_at: new Date().toISOString()
        };

        console.log('👑 Criando conta habbohub...');
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

        // 3. Criar beebop com UUID válido
        const beebopData = {
            habbo_name: 'beebop',
            id: generateUUID(),
            habbo_hotel: 'br',
            last_synced_at: new Date().toISOString()
        };

        console.log('👑 Criando conta beebop...');
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
        const finalResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_users?select=*`, {
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
                console.log(`  👤 ${user.habbo_name} (${user.id}) - Hotel: ${user.habbo_hotel}`);
            });
            
            if (users.length >= 2) {
                console.log('✅ Contas criadas com sucesso!');
                console.log('⚠️ NOTA: A tabela tem estrutura limitada. Para funcionalidade completa:');
                console.log('📋 Execute o SQL no Supabase Dashboard:');
                console.log('🔗 https://supabase.com/dashboard/project/wueccgeizznjmjgmuscy/sql');
                console.log('📄 Use o arquivo: apply-habbo-users-migration.sql');
                console.log('🌐 Acesse: http://localhost:8081/');
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
createAccountsUUID();
