// Testar com usuário existente
const SUPABASE_URL = 'https://wueccgeizznjmjgmuscy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

async function testWithExistingUser() {
    console.log('🧪 [TESTE] Testando com usuário existente...');
    
    try {
        // Usar o UUID do usuário Beebop que já existe
        const existingUserId = '9f4ff5bd-f57f-4b52-93c8-3fc4e6382e28';
        
        // 1. Primeiro, deletar conta habbohub se existir
        console.log('\n1️⃣ [TESTE] Deletando conta habbohub existente...');
        
        const deleteResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts?habbo_name=eq.habbohub&hotel=eq.br`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });
        
        if (deleteResponse.ok) {
            console.log('✅ [TESTE] Conta habbohub deletada (se existia)');
        } else {
            console.log('⚠️ [TESTE] Nenhuma conta habbohub para deletar');
        }
        
        // 2. Criar conta habbohub com UUID existente
        console.log('\n2️⃣ [TESTE] Criando conta habbohub com UUID existente...');
        
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
                is_online: false,
                supabase_user_id: existingUserId
            })
        });
        
        if (createResponse.ok) {
            const createResult = await createResponse.json();
            console.log('✅ [TESTE] Conta habbohub criada com sucesso!');
            console.log('📊 [TESTE] Dados criados:', createResult);
        } else {
            const createError = await createResponse.text();
            console.error('❌ [TESTE] Erro ao criar conta:', createResponse.status, createError);
            return;
        }
        
        // 3. Buscar conta criada
        console.log('\n3️⃣ [TESTE] Buscando conta habbohub...');
        
        const searchResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts?habbo_name=eq.habbohub&hotel=eq.br&select=*`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            }
        });
        
        if (searchResponse.ok) {
            const searchResult = await searchResponse.json();
            if (searchResult.length > 0) {
                console.log('✅ [TESTE] Conta habbohub encontrada!');
                console.log('📊 [TESTE] Dados encontrados:', searchResult[0]);
            } else {
                console.error('❌ [TESTE] Conta habbohub não encontrada');
                return;
            }
        } else {
            const searchError = await searchResponse.text();
            console.error('❌ [TESTE] Erro ao buscar conta:', searchResponse.status, searchError);
            return;
        }
        
        // 4. Atualizar status online
        console.log('\n4️⃣ [TESTE] Atualizando status online...');
        
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/habbo_accounts?habbo_name=eq.habbohub&hotel=eq.br`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                is_online: true
            })
        });
        
        if (updateResponse.ok) {
            console.log('✅ [TESTE] Status online atualizado!');
        } else {
            const updateError = await updateResponse.text();
            console.error('❌ [TESTE] Erro ao atualizar status:', updateResponse.status, updateError);
        }
        
        console.log('\n🎉 [TESTE] SISTEMA FUNCIONANDO!');
        console.log('✅ Conta habbohub criada e funcionando:');
        console.log('  - Usuário: habbohub');
        console.log('  - Senha: 151092');
        console.log('  - Hotel: br');
        console.log('  - ID Habbo: hhbr-81b7220d11b7a21997226bf7cfcbad51');
        console.log('  - UUID Supabase: ' + existingUserId);
        
    } catch (error) {
        console.error('❌ [TESTE] Erro geral:', error);
    }
}

testWithExistingUser();
