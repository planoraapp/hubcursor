const { createClient } = require('@supabase/supabase-js');

// Usar a chave que está funcionando no navegador
const supabaseUrl = 'https://wueccgeizznjmjgmuscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1ZWNjZ2Vpenpuam1qZ211c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDczODYsImV4cCI6MjA2OTMyMzM4Nn0.anj1HLW-eXLyZd0SQmB6Rmkf00-wndFKqtOW4PV5bmc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUUIDMessages() {
  try {
    console.log('🧹 Deletando mensagens com UUID antigo...');
    
    // IDs das mensagens específicas que precisam ser deletadas
    const messageIds = [
      'fb240f51-7767-44cb-b033-b6c3dd3e06db',
      'aed06109-38b2-450d-a7e1-158d3b685f26', 
      '5e2a0dcd-f460-4abb-9ec4-361ac0c3a125'
    ];
    
    console.log('🎯 Mensagens a deletar:', messageIds.length);
    
    for (const messageId of messageIds) {
      console.log('🗑️  Deletando mensagem:', messageId);
      
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('❌ Erro ao deletar', messageId, ':', error);
      } else {
        console.log('✅ Deletada:', messageId);
      }
    }
    
    console.log('🎉 Limpeza concluída!');
    
    // Verificar se restaram mensagens com UUID antigo
    const { data: remaining, error: checkError } = await supabase
      .from('chat_messages')
      .select('id, sender_id, receiver_id')
      .or('sender_id.eq.d76a5564-7693-4203-b964-5bdabb3afae3,receiver_id.eq.d76a5564-7693-4203-b964-5bdabb3afae3');
    
    if (checkError) {
      console.error('❌ Erro ao verificar:', checkError);
    } else {
      console.log('📊 Mensagens restantes com UUID antigo:', remaining?.length || 0);
      if (remaining && remaining.length > 0) {
        console.log('⚠️  Ainda existem mensagens:', remaining.map(m => m.id));
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

deleteUUIDMessages();
