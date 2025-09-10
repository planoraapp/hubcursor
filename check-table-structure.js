// Verificar estrutura da tabela habbo_accounts
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

async function checkTableStructure() {
    console.log('🔍 [VERIFICAÇÃO] Verificando estrutura da tabela habbo_accounts...');
    
    try {
        // Buscar informações da tabela
        const response = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts?select=*&limit=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ [VERIFICAÇÃO] Tabela habbo_accounts acessível');
            console.log('📊 [VERIFICAÇÃO] Estrutura da tabela:', data);
        } else {
            const error = await response.text();
            console.error('❌ [VERIFICAÇÃO] Erro ao acessar tabela:', response.status, error);
        }
        
        // Tentar criar conta sem supabase_user_id
        console.log('\n🧪 [TESTE] Tentando criar conta sem supabase_user_id...');
        
        const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts`, {
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
                is_online: false
            })
        });
        
        if (createResponse.ok) {
            const createResult = await createResponse.json();
            console.log('✅ [TESTE] Conta criada sem supabase_user_id!');
            console.log('📊 [TESTE] Dados criados:', createResult);
        } else {
            const createError = await createResponse.text();
            console.error('❌ [TESTE] Erro ao criar conta sem supabase_user_id:', createResponse.status, createError);
        }
        
    } catch (error) {
        console.error('❌ [VERIFICAÇÃO] Erro geral:', error);
    }
}

checkTableStructure();
