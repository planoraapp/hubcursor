const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função para extrair dados do usuário habbohub das APIs Habbo
async function extractHabboHubData() {
  console.log('🔍 Extraindo dados do usuário habbohub das APIs Habbo...');
  
  try {
    // Tentar diferentes hotéis para encontrar o usuário habbohub
    const hotels = ['com.br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr'];
    
    for (const hotel of hotels) {
      try {
        console.log(`🌐 Tentando hotel: habbo.${hotel}`);
        
        const url = `https://www.habbo.${hotel}/api/public/users?name=habbohub`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HabboHub/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.name) {
            console.log('✅ Usuário habbohub encontrado!');
            console.log('📊 Dados extraídos:', {
              name: data.name,
              uniqueId: data.uniqueId,
              motto: data.motto,
              figureString: data.figureString,
              memberSince: data.memberSince,
              hotel: hotel
            });
            
            return {
              habbo_name: data.name,
              habbo_id: data.uniqueId || `hhbr-${data.name.toLowerCase()}`,
              motto: data.motto || 'HUB-ADMIN',
              figure_string: data.figureString || 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
              hotel: hotel === 'com.br' ? 'br' : hotel,
              member_since: data.memberSince || new Date().toISOString()
            };
          }
        }
      } catch (error) {
        console.log(`❌ Erro no hotel ${hotel}:`, error.message);
        continue;
      }
    }
    
    // Se não encontrou nas APIs, usar dados padrão
    console.log('⚠️ Usuário habbohub não encontrado nas APIs, usando dados padrão');
    return {
      habbo_name: 'habbohub',
      habbo_id: 'hhbr-habbohub-system',
      motto: 'HUB-ADMIN',
      figure_string: 'hd-180-1.ch-255-66.lg-280-110.sh-290-62.ha-1012-110.hr-100-61',
      hotel: 'br',
      member_since: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Erro ao extrair dados:', error.message);
    return null;
  }
}

// Função para criar conta habbohub
async function createHabboHubAccount() {
  console.log('🚀 Criando conta habbohub...');
  
  try {
    // 1. Extrair dados das APIs
    const habboData = await extractHabboHubData();
    if (!habboData) {
      console.error('❌ Não foi possível extrair dados do habbohub');
      return;
    }
    
    console.log('📋 Dados que serão usados:', habboData);
    
    // 2. Verificar se a conta já existe
    console.log('🔍 Verificando se a conta já existe...');
    const { data: existingAccount, error: checkError } = await supabase
      .from('habbo_accounts')
      .select('*')
      .eq('habbo_name', 'habbohub')
      .single();
    
    if (existingAccount && !checkError) {
      console.log('⚠️ Conta habbohub já existe!');
      console.log('📊 Dados existentes:', {
        id: existingAccount.id,
        habbo_name: existingAccount.habbo_name,
        habbo_id: existingAccount.habbo_id,
        motto: existingAccount.motto,
        is_admin: existingAccount.is_admin
      });
      
      // Atualizar dados existentes
      console.log('🔄 Atualizando dados existentes...');
      const { data: updatedAccount, error: updateError } = await supabase
        .from('habbo_accounts')
        .update({
          habbo_id: habboData.habbo_id,
          motto: habboData.motto,
          figure_string: habboData.figure_string,
          hotel: habboData.hotel,
          is_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('habbo_name', 'habbohub')
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar conta:', updateError.message);
        return;
      }
      
      console.log('✅ Conta habbohub atualizada com sucesso!');
      console.log('📊 Dados atualizados:', updatedAccount);
      return updatedAccount;
    }
    
    // 3. Verificar se usuário auth já existe ou criar novo
    console.log('👤 Verificando/criando usuário auth para habbohub...');
    const authEmail = `${habboData.habbo_id}@habbohub.com`;
    
    // Tentar buscar usuário existente primeiro
    let authUser = null;
    try {
      const { data: existingAuthUser, error: searchError } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      });
      
      if (!searchError && existingAuthUser.users) {
        authUser = existingAuthUser.users.find(user => user.email === authEmail);
        if (authUser) {
          console.log('✅ Usuário auth já existe:', authUser.id);
          // Converter para o formato esperado
          authUser = { user: authUser };
        }
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar usuário existente:', error.message);
    }
    
    // Se não encontrou, criar novo usuário
    if (!authUser) {
      console.log('🆕 Criando novo usuário auth...');
      const { data: newAuthUser, error: authError } = await supabase.auth.admin.createUser({
        email: authEmail,
        password: '151092',
        email_confirm: true,
        user_metadata: {
          habbo_name: habboData.habbo_name,
          hotel: habboData.hotel
        }
      });
      
      if (authError) {
        console.error('❌ Erro ao criar usuário auth:', authError.message);
        // Tentar usar um email diferente
        const altAuthEmail = `habbohub-${Date.now()}@habbohub.com`;
        console.log(`🔄 Tentando com email alternativo: ${altAuthEmail}`);
        
        const { data: altAuthUser, error: altAuthError } = await supabase.auth.admin.createUser({
          email: altAuthEmail,
          password: '151092',
          email_confirm: true,
          user_metadata: {
            habbo_name: habboData.habbo_name,
            hotel: habboData.hotel
          }
        });
        
        if (altAuthError) {
          console.error('❌ Erro ao criar usuário auth alternativo:', altAuthError.message);
          return;
        }
        
        authUser = altAuthUser;
        console.log('✅ Usuário auth alternativo criado:', authUser.user.id);
      } else {
        authUser = newAuthUser;
        console.log('✅ Usuário auth criado:', authUser.user.id);
      }
    }
    
    // 4. Criar conta na tabela habbo_accounts
    console.log('📝 Criando conta na tabela habbo_accounts...');
    const { data: newAccount, error: accountError } = await supabase
      .from('habbo_accounts')
      .insert({
        supabase_user_id: authUser.user.id,
        habbo_name: habboData.habbo_name,
        habbo_id: habboData.habbo_id,
        hotel: habboData.hotel,
        figure_string: habboData.figure_string,
        motto: habboData.motto,
        is_admin: true,
        is_online: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (accountError) {
      console.error('❌ Erro ao criar conta habbo_accounts:', accountError.message);
      return;
    }
    
    console.log('✅ Conta habbohub criada com sucesso!');
    console.log('📊 Dados da conta criada:', {
      id: newAccount.id,
      habbo_name: newAccount.habbo_name,
      habbo_id: newAccount.habbo_id,
      motto: newAccount.motto,
      hotel: newAccount.hotel,
      is_admin: newAccount.is_admin,
      auth_user_id: authUser.user.id,
      auth_email: authEmail
    });
    
    // 5. Criar também na tabela habbo_auth (se existir)
    console.log('🔐 Criando conta na tabela habbo_auth...');
    const { data: authAccount, error: authAccountError } = await supabase
      .from('habbo_auth')
      .insert({
        habbo_username: habboData.habbo_name,
        habbo_motto: habboData.motto,
        password_hash: '151092',
        is_admin: true,
        is_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (authAccountError) {
      console.log('⚠️ Tabela habbo_auth não existe ou erro:', authAccountError.message);
    } else {
      console.log('✅ Conta criada na tabela habbo_auth:', authAccount);
    }
    
    // 6. Resumo final
    console.log('\n🎉 CONTA HABBOHUB CRIADA COM SUCESSO!');
    console.log('📋 Credenciais de login:');
    console.log(`   👤 Usuário: ${habboData.habbo_name}`);
    console.log(`   🔑 Senha: 151092`);
    console.log(`   🌐 Hotel: Brasil (${habboData.hotel})`);
    console.log(`   👑 Admin: Sim`);
    console.log(`   📧 Email Auth: ${authEmail}`);
    
    return newAccount;
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar criação da conta
createHabboHubAccount();
