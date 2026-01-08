import { supabase } from '@/integrations/supabase/client';

export async function cleanupOldChatMessages() {
  try {
    // 1. Buscar os supabase_user_id corretos
    const { data: accounts, error: accountsError } = await supabase
      .from('habbo_accounts')
      .select('id, supabase_user_id, habbo_name')
      .in('habbo_name', ['Beebop', 'habbohub']);
    
    if (accountsError) {
      console.error('❌ Erro ao buscar contas:', accountsError);
      return;
    }
    
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
    
    if (invalidMessages.length === 0) {
      return;
    }
    
    // 4. Deletar mensagens inválidas uma por uma
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
      }
    }
    
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
    cleanupOldChatMessages().then((result) => {
      if (result?.success) {
        localStorage.setItem('chat_cleanup_done', 'true');
      }
    });
  }
}

