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

async function checkAccounts() {
    console.log('🔍 VERIFICANDO CONTAS NA TABELA HABBO_AUTH');
    console.log('=' .repeat(50));
    
    try {
        // Consultar todas as contas
        const response = await makeRequest(
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

        if (response.status === 200) {
            const accounts = response.data;
            console.log(`✅ Consulta realizada com sucesso!`);
            console.log(`📊 Total de contas encontradas: ${accounts.length}`);
            console.log('');

            if (accounts.length > 0) {
                console.log('👥 CONTAS CADASTRADAS:');
                console.log('=' .repeat(50));
                
                accounts.forEach((account, index) => {
                    console.log(`\n${index + 1}. 👤 ${account.habbo_username}`);
                    console.log(`   🆔 ID: ${account.id}`);
                    console.log(`   💬 Motto: ${account.habbo_motto || 'N/A'}`);
                    console.log(`   🖼️ Avatar: ${account.habbo_avatar || 'N/A'}`);
                    console.log(`   🔐 Senha: ${account.password_hash}`);
                    console.log(`   👑 Admin: ${account.is_admin ? 'Sim' : 'Não'}`);
                    console.log(`   ✅ Verificado: ${account.is_verified ? 'Sim' : 'Não'}`);
                    console.log(`   🕐 Criado em: ${account.created_at}`);
                    console.log(`   🔄 Atualizado em: ${account.updated_at}`);
                    console.log(`   🚪 Último login: ${account.last_login || 'Nunca'}`);
                });

                // Verificar contas específicas
                console.log('\n🎯 VERIFICAÇÃO ESPECÍFICA:');
                console.log('=' .repeat(50));
                
                const habbohub = accounts.find(acc => acc.habbo_username === 'habbohub');
                const beebop = accounts.find(acc => acc.habbo_username === 'beebop');
                
                console.log(`habbohub: ${habbohub ? '✅ Encontrado' : '❌ Não encontrado'}`);
                if (habbohub) {
                    console.log(`   - Senha: ${habbohub.password_hash}`);
                    console.log(`   - Admin: ${habbohub.is_admin}`);
                }
                
                console.log(`beebop: ${beebop ? '✅ Encontrado' : '❌ Não encontrado'}`);
                if (beebop) {
                    console.log(`   - Senha: ${beebop.password_hash}`);
                    console.log(`   - Admin: ${beebop.is_admin}`);
                }

            } else {
                console.log('❌ Nenhuma conta encontrada na tabela habbo_auth');
            }

        } else {
            console.log('❌ Erro ao consultar contas:', response.status, response.data);
        }

        // Testar estrutura da tabela
        console.log('\n🔧 TESTANDO ESTRUTURA DA TABELA:');
        console.log('=' .repeat(50));
        
        const structureResponse = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_auth?select=id&limit=1`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (structureResponse.status === 200) {
            console.log('✅ Tabela habbo_auth está acessível');
            console.log('✅ Estrutura da tabela está correta');
        } else {
            console.log('❌ Erro ao acessar tabela:', structureResponse.status);
        }

    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
    }
}

// Executar verificação
checkAccounts().catch(console.error);
