// Criar usuário Supabase para habbohub
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

async function createHabbohubUser() {
    console.log('🔧 [CRIAÇÃO] Criando usuário Supabase para habbohub...');
    
    try {
        // 1. Tentar criar usuário Supabase
        console.log('\n1️⃣ [CRIAÇÃO] Criando usuário Supabase...');
        
        const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                email: 'habbohub@habbohub.com',
                password: '151092',
                email_confirm: true,
                user_metadata: {
                    habbo_name: 'habbohub',
                    hotel: 'br'
                }
            })
        });
        
        if (createUserResponse.ok) {
            const userResult = await createUserResponse.json();
            console.log('✅ [CRIAÇÃO] Usuário Supabase criado!');
            console.log('📊 [CRIAÇÃO] Dados do usuário:', userResult);
            
            const userId = userResult.user.id;
            
            // 2. Criar conta habbohub
            console.log('\n2️⃣ [CRIAÇÃO] Criando conta habbohub...');
            
            const createAccountResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    habbo_name: 'habbohub',
                    hotel: 'br',
                    habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
                    figure_string: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
                    motto: 'HUB-QQ797',
                    is_admin: true,
                    is_online: false,
                    supabase_user_id: userId
                })
            });
            
            if (createAccountResponse.ok) {
                const accountResult = await createAccountResponse.json();
                console.log('✅ [CRIAÇÃO] Conta habbohub criada!');
                console.log('📊 [CRIAÇÃO] Dados da conta:', accountResult);
                
                console.log('\n🎉 [CRIAÇÃO] SISTEMA CONFIGURADO COM SUCESSO!');
                console.log('✅ Credenciais de login:');
                console.log('  - Email: habbohub@habbohub.com');
                console.log('  - Senha: 151092');
                console.log('  - Usuário Habbo: habbohub');
                console.log('  - Hotel: br');
                
            } else {
                const accountError = await createAccountResponse.text();
                console.error('❌ [CRIAÇÃO] Erro ao criar conta habbohub:', createAccountResponse.status, accountError);
            }
            
        } else {
            const userError = await createUserResponse.text();
            console.error('❌ [CRIAÇÃO] Erro ao criar usuário Supabase:', createUserResponse.status, userError);
            
            // Tentar abordagem alternativa - usar UUID fixo
            console.log('\n🔄 [ALTERNATIVA] Tentando abordagem alternativa...');
            
            const alternativeResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({
                    habbo_name: 'habbohub',
                    hotel: 'br',
                    habbo_id: 'hhbr-81b7220d11b7a21997226bf7cfcbad51',
                    figure_string: 'hr-829-45.hd-208-1.ch-3022-90-91.lg-275-82.sh-3524-66-1408.wa-3661-66-1408',
                    motto: 'HUB-QQ797',
                    is_admin: true,
                    is_online: false,
                    supabase_user_id: '00000000-0000-0000-0000-000000000000'
                })
            });
            
            if (alternativeResponse.ok) {
                const altResult = await alternativeResponse.json();
                console.log('✅ [ALTERNATIVA] Conta habbohub criada com UUID fixo!');
                console.log('📊 [ALTERNATIVA] Dados:', altResult);
            } else {
                const altError = await alternativeResponse.text();
                console.error('❌ [ALTERNATIVA] Erro:', alternativeResponse.status, altError);
            }
        }
        
    } catch (error) {
        console.error('❌ [CRIAÇÃO] Erro geral:', error);
    }
}

createHabbohubUser();
