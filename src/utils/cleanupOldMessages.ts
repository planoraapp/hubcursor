import { supabase } from '@/integrations/supabase/client';

export async function cleanupOldChatMessages() {
  try {
    console.log('🔍 Buscando IDs corretos...');
    
    // 1. Buscar os supabase_user_id corretos
    const { data: accounts, error: accountsError } = await supabase
      .from('habbo_accounts')
      .select('id, supabase_user_id, habbo_name')
      .in('habbo_name', ['Beebop', 'habbohub']);
    
    if (accountsError) {
      console.error('❌ Erro ao buscar contas:', accountsError);
      return;
    }
    
    console.log('✅ Contas encontradas:', accounts);
    
    const validIds = accounts.map(acc => acc.supabase_user_id);
    
    // 2. Buscar todas as mensagens
    const { data: allMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*');
    
    if (messagesError) {
      console.error('❌ Erro ao buscar mensagens:', messagesError);
      return;
    }
    
    // 3. Filtrar mensagens inválidas
    const invalidMessages = allMessages?.filter(msg => 
      !validIds.includes(msg.sender_id) || !validIds.includes(msg.receiver_id)
    ) || [];
    
    console.log(`📊 Total de mensagens: ${allMessages?.length || 0}`);
    console.log(`🗑️  Mensagens inválidas: ${invalidMessages.length}`);
    
    if (invalidMessages.length === 0) {
      console.log('✅ Nenhuma mensagem inválida encontrada!');
      return;
    }
    
    // 4. Deletar mensagens inválidas uma por uma
    console.log('🗑️  Deletando mensagens inválidas...');
    
    let deletedCount = 0;
    for (const msg of invalidMessages) {
      const { error: deleteError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', msg.id);
      
      if (deleteError) {
        console.error(`❌ Erro ao deletar ${msg.id}:`, deleteError);
      } else {
        deletedCount++;
        console.log(`✅ Deletada mensagem ${msg.id} (sender: ${msg.sender_id}, receiver: ${msg.receiver_id})`);
      }
    }
    
    console.log(`\n✅ Limpeza concluída! ${deletedCount} mensagens deletadas.`);
    console.log('🔄 Recarregue a página para ver as mudanças.');
    
    return { success: true, deletedCount };
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return { success: false, error };
  }
}

// Expor globalmente para uso no console do navegador
if (typeof window !== 'undefined') {
  (window as any).cleanupOldChatMessages = cleanupOldChatMessages;
  
  // Executar automaticamente apenas uma vez na primeira carga
  const hasCleanedUp = localStorage.getItem('chat_cleanup_done');
  if (!hasCleanedUp) {
    console.log('🔄 Executando limpeza automática de mensagens antigas...');
    cleanupOldChatMessages().then((result) => {
      if (result?.success) {
        localStorage.setItem('chat_cleanup_done', 'true');
        console.log('✅ Limpeza automática concluída! Recarregue a página.');
      }
    });
  }
}

