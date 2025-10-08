import { supabase } from '@/integrations/supabase/client';

export async function forceCleanupOldMessages() {
  try {
    console.log('🧹 Iniciando limpeza forçada de mensagens antigas...');
    
    // Buscar todas as mensagens
    const { data: allMessages, error: fetchError } = await supabase
      .from('chat_messages')
      .select('*');

    if (fetchError) {
      console.error('❌ Erro ao buscar mensagens:', fetchError);
      return;
    }

    console.log('📊 Total de mensagens no banco:', allMessages?.length);

    // Buscar IDs válidos (Beebop e Habbohub)
    const { data: validAccounts, error: accountsError } = await supabase
      .from('habbo_accounts')
      .select('supabase_user_id, habbo_name');

    if (accountsError) {
      console.error('❌ Erro ao buscar contas:', accountsError);
      return;
    }

    const validIds = validAccounts?.map(acc => acc.supabase_user_id) || [];
    console.log('✅ IDs válidos:', validIds);

    // Filtrar mensagens inválidas
    const invalidMessages = allMessages?.filter(msg => 
      !validIds.includes(msg.sender_id) || !validIds.includes(msg.receiver_id)
    ) || [];

    console.log('🗑️  Mensagens inválidas encontradas:', invalidMessages.length);

    if (invalidMessages.length === 0) {
      console.log('✅ Nenhuma mensagem inválida encontrada!');
      return;
    }

    // Deletar todas as mensagens inválidas
    for (const msg of invalidMessages) {
      console.log('🗑️  Deletando mensagem inválida:', msg.id, 'sender:', msg.sender_id, 'receiver:', msg.receiver_id);
      
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', msg.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar:', msg.id, deleteError);
      } else {
        console.log('✅ Deletada:', msg.id);
      }
    }

    console.log('🎉 Limpeza forçada concluída!');
    return { success: true, deletedCount: invalidMessages.length };

  } catch (error) {
    console.error('❌ Erro na limpeza forçada:', error);
    return { success: false, error };
  }
}

// Expor globalmente
if (typeof window !== 'undefined') {
  (window as any).forceCleanupOldMessages = forceCleanupOldMessages;
}
