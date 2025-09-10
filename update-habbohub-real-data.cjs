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

async function fetchRealHabboData() {
    console.log('🔍 BUSCANDO DADOS REAIS DO HABBOHUB');
    console.log('=' .repeat(50));
    
    try {
        // Buscar dados reais do habbo.com.br
        console.log('🌐 Buscando dados do habbo.com.br...');
        const response = await makeRequest(
            'https://www.habbo.com.br/api/public/users?name=habbohub',
            {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            }
        );

        if (response.status === 200) {
            const habboData = response.data;
            console.log('✅ Dados reais encontrados!');
            console.log('📊 Dados do habbohub:');
            console.log(`   👤 Nome: ${habboData.name}`);
            console.log(`   🆔 ID: ${habboData.uniqueId}`);
            console.log(`   💬 Motto: ${habboData.motto || 'N/A'}`);
            console.log(`   🖼️ Avatar: ${habboData.figureString || 'N/A'}`);
            console.log(`   🌐 Hotel: com.br`);
            
            return habboData;
        } else {
            console.log('❌ Erro ao buscar dados:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Erro na requisição:', error.message);
        return null;
    }
}

async function updateHabbohubData(realData) {
    console.log('\n🔄 ATUALIZANDO DADOS DO HABBOHUB');
    console.log('=' .repeat(50));
    
    try {
        // Atualizar dados na tabela habbo_auth
        const updateData = {
            habbo_motto: realData.motto || 'HUB-ADMIN',
            habbo_avatar: realData.figureString || '',
            last_login: new Date().toISOString()
        };

        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_auth?habbo_username=eq.habbohub`,
            {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            },
            updateData
        );

        if (response.status === 200 || response.status === 204) {
            console.log('✅ Dados atualizados com sucesso!');
            console.log('📊 Dados atualizados:');
            console.log(`   💬 Motto: ${updateData.habbo_motto}`);
            console.log(`   🖼️ Avatar: ${updateData.habbo_avatar}`);
            console.log(`   🕐 Último login: ${updateData.last_login}`);
        } else {
            console.log('❌ Erro ao atualizar dados:', response.status, response.data);
        }
    } catch (error) {
        console.error('❌ Erro na atualização:', error.message);
    }
}

async function verifyUpdate() {
    console.log('\n🧪 VERIFICANDO ATUALIZAÇÃO');
    console.log('=' .repeat(50));
    
    try {
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

        if (response.status === 200 && response.data.length > 0) {
            const habbohub = response.data[0];
            console.log('✅ Verificação concluída!');
            console.log('📊 Dados atuais do habbohub:');
            console.log(`   👤 Username: ${habbohub.habbo_username}`);
            console.log(`   💬 Motto: ${habbohub.habbo_motto}`);
            console.log(`   🖼️ Avatar: ${habbohub.habbo_avatar}`);
            console.log(`   🕐 Último login: ${habbohub.last_login}`);
        }
    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
    }
}

async function main() {
    console.log('🚀 ATUALIZANDO DADOS REAIS DO HABBOHUB');
    console.log('=' .repeat(60));
    
    // 1. Buscar dados reais
    const realData = await fetchRealHabboData();
    
    if (realData) {
        // 2. Atualizar dados
        await updateHabbohubData(realData);
        
        // 3. Verificar atualização
        await verifyUpdate();
        
        console.log('\n🎉 PROCESSO CONCLUÍDO!');
        console.log('Agora o habbohub deve mostrar seus dados reais do Habbo!');
    } else {
        console.log('\n❌ Não foi possível buscar dados reais do Habbo.');
        console.log('Isso pode ser devido à manutenção da API do Habbo.');
    }
}

// Executar
main().catch(console.error);
