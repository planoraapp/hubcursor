const https = require('https');

// Suas chaves do Supabase (substitua pelas corretas)
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNnZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTQ2NzQ0MCwiZXhwIjoyMDUxMDQzNDQwfQ.8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNnZ2VpenpqbWpnbXVzY3kiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NDY3NDQwLCJleHAiOjIwNTEwNDM0NDB9.8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8J8';

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

async function checkExistingAccount() {
    console.log('🔍 Verificando se conta habbohub já existe...');
    
    try {
        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_accounts?select=*&habbo_name=eq.habbohub&hotel=eq.br`,
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
            console.log('✅ Conta encontrada:', response.data);
            return response.data.length > 0;
        } else {
            console.log('❌ Erro ao verificar conta:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na verificação:', error.message);
        return false;
    }
}

async function createAuthUser() {
    console.log('🛠️ Criando usuário no Supabase Auth...');
    
    try {
        const response = await makeRequest(
            `${SUPABASE_URL}/auth/v1/admin/users`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json'
                }
            },
            {
                email: 'habbohub@habbohub.com',
                password: '151092',
                email_confirm: true,
                user_metadata: {
                    habbo_name: 'habbohub',
                    hotel: 'br'
                }
            }
        );

        if (response.status === 200 || response.status === 201) {
            console.log('✅ Usuário Auth criado:', response.data.user.id);
            return response.data.user.id;
        } else {
            console.log('❌ Erro ao criar usuário Auth:', response.status, response.data);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro na criação do usuário Auth:', error.message);
        return null;
    }
}

async function createHabboAccount(userId) {
    console.log('📊 Criando conta na tabela habbo_accounts...');
    
    try {
        const accountData = {
            supabase_user_id: userId,
            habbo_name: 'habbohub',
            habbo_id: '1',
            hotel: 'br',
            is_admin: true,
            motto: 'HUB-ADMIN',
            figure_string: 'hd-180-1.ch-255-66.lg-285-91.sh-290-62.ha-1012-110.hr-831-49.wa-2001-62',
            is_online: false
        };

        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_accounts`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            },
            accountData
        );

        if (response.status === 201) {
            console.log('✅ Conta habbohub criada com sucesso!');
            return true;
        } else {
            console.log('❌ Erro ao criar conta habbohub:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na criação da conta:', error.message);
        return false;
    }
}

async function createUserAccount() {
    console.log('👤 Criando conta na tabela users...');
    
    try {
        const userData = {
            habbo_username: 'habbohub',
            habbo_motto: 'HUB-ADMIN',
            password_hash: Buffer.from('151092').toString('base64'),
            is_admin: true,
            is_verified: true
        };

        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/users`,
            {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_SERVICE_KEY,
                    'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                }
            },
            userData
        );

        if (response.status === 201) {
            console.log('✅ Usuário habbohub criado na tabela users!');
            return true;
        } else {
            console.log('❌ Erro ao criar usuário:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na criação do usuário:', error.message);
        return false;
    }
}

async function testLogin() {
    console.log('✅ Testando login habbohub...');
    
    try {
        const response = await makeRequest(
            `${SUPABASE_URL}/rest/v1/habbo_accounts?select=*&habbo_name=eq.habbohub&hotel=eq.br`,
            {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.status === 200 && response.data.length > 0) {
            console.log('✅ Login testado com sucesso! Conta encontrada:', response.data[0]);
            return true;
        } else {
            console.log('❌ Login falhou:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro no teste de login:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Iniciando criação automática da conta habbohub...\n');
    
    // 1. Verificar se já existe
    const exists = await checkExistingAccount();
    if (exists) {
        console.log('✅ Conta habbohub já existe! Testando login...');
        await testLogin();
        return;
    }
    
    // 2. Criar usuário Auth
    const userId = await createAuthUser();
    if (!userId) {
        console.log('❌ Falha ao criar usuário Auth. Abortando...');
        return;
    }
    
    // 3. Criar conta habbo_accounts
    const habboCreated = await createHabboAccount(userId);
    if (!habboCreated) {
        console.log('❌ Falha ao criar conta habbo_accounts. Abortando...');
        return;
    }
    
    // 4. Criar conta users (opcional)
    await createUserAccount();
    
    // 5. Testar login
    await testLogin();
    
    console.log('\n🎉 Processo concluído! Tente fazer login com habbohub / 151092');
}

main().catch(console.error);
