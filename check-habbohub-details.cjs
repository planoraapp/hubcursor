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

async function checkHabbohubDetails() {
    console.log('🔍 VERIFICANDO DETALHES DO HABBOHUB');
    console.log('=' .repeat(50));
    
    try {
        // Consultar conta habbohub especificamente
        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_auth?select=*&habbo_username=eq.habbohub`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200) {
            const accounts = response.data;
            console.log(`✅ Consulta realizada com sucesso!`);
            console.log(`📊 Contas habbohub encontradas: ${accounts.length}`);
            console.log('');

            if (accounts.length > 0) {
                const habbohub = accounts[0];
                console.log('👤 DETALHES DO HABBOHUB:');
                console.log('=' .repeat(50));
                console.log(`🆔 ID: ${habbohub.id}`);
                console.log(`👤 Username: ${habbohub.habbo_username}`);
                console.log(`💬 Motto: ${habbohub.habbo_motto || 'N/A'}`);
                console.log(`🖼️ Avatar: ${habbohub.habbo_avatar || 'N/A'}`);
                console.log(`🔐 Senha: ${habbohub.password_hash}`);
                console.log(`👑 Admin: ${habbohub.is_admin ? 'Sim' : 'Não'}`);
                console.log(`✅ Verificado: ${habbohub.is_verified ? 'Sim' : 'Não'}`);
                console.log(`🕐 Criado em: ${habbohub.created_at}`);
                console.log(`🔄 Atualizado em: ${habbohub.updated_at}`);
                console.log(`🚪 Último login: ${habbohub.last_login || 'Nunca'}`);
                
                // Verificar se há campo hotel (pode não existir na tabela atual)
                if (habbohub.hotel) {
                    console.log(`🌍 Hotel: ${habbohub.hotel}`);
                } else {
                    console.log(`🌍 Hotel: N/A (campo não existe na tabela)`);
                }

                // Verificar se é do Brasil baseado no ID ou outros campos
                console.log('\n🔍 ANÁLISE DE ORIGEM:');
                console.log('=' .repeat(50));
                
                if (habbohub.habbo_username === 'habbohub') {
                    console.log('✅ Username: habbohub (padrão)');
                }
                
                if (habbohub.habbo_motto === 'HUB-ADMIN') {
                    console.log('✅ Motto: HUB-ADMIN (padrão administrativo)');
                }
                
                if (habbohub.is_admin === true) {
                    console.log('✅ Admin: Sim (conta administrativa)');
                }
                
                console.log('\n📋 CONCLUSÃO:');
                console.log('=' .repeat(50));
                console.log('Esta é uma conta administrativa criada no sistema HabboHub.');
                console.log('Não há informação específica de hotel (BR/ES/etc) na tabela atual.');
                console.log('A conta foi criada para uso interno do sistema.');

            } else {
                console.log('❌ Nenhuma conta habbohub encontrada');
            }

        } else {
            console.log('❌ Erro ao consultar conta habbohub:', response.status, response.data);
        }

    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
    }
}

// Executar verificação
checkHabbohubDetails().catch(console.error);
