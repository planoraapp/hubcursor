const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mzc0NzM4NiwiZXhwIjoyMDY5MzIzMzg2fQ.sPN0I7iJLh4UeG6K9NrcoDKx72ZAFgOfNyLXXDm9KVk';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPassword() {
  try {
    console.log('🔧 Corrigindo senha do usuário habbohub...');

    // Atualizar senha do usuário habbohub
    const { data: updateResult, error: updateError } = await supabase
      .from('habbo_auth')
      .update({ 
        password_hash: '151092',
        habbo_motto: 'HUB-ADMIN',
        habbo_avatar: 'https://www.habbo.com/habbo-imaging/avatarimage?size=l&figure=hd-190-7.ch-3030-66.lg-275-82.sh-290-80.hr-3811-61&direction=2&head_direction=2&img_format=png',
        is_admin: true,
        is_verified: true,
        hotel: 'br'
      })
      .eq('habbo_username', 'habbohub')
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar senha:', updateError);
    } else {
      console.log('✅ Senha atualizada com sucesso!');
      console.log('📊 Dados atualizados:', updateResult[0]);
    }

    // Verificar se a atualização funcionou
    console.log('🔍 Verificando atualização...');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('habbo_auth')
      .select('*')
      .eq('habbo_username', 'habbohub')
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar:', verifyError);
    } else {
      console.log('✅ Verificação concluída:', {
        username: verifyResult.habbo_username,
        motto: verifyResult.habbo_motto,
        is_admin: verifyResult.is_admin,
        hotel: verifyResult.hotel,
        password_hash: verifyResult.password_hash
      });
    }

    console.log('🎉 Correção concluída!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar correção
fixPassword();
