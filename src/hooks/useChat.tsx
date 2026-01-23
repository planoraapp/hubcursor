import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useChatNotifications } from '@/contexts/ChatNotificationContext';
import { rateLimiter, RATE_LIMITS } from '@/utils/rateLimiter';
import { getUserByName } from '@/services/habboApiMultiHotel';
import { checkMessageSpam } from '@/utils/spamFilter';
import { messageNotificationSound } from '@/utils/messageNotificationSound';

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  deleted_by_sender: boolean;
  deleted_by_receiver: boolean;
  is_reported: boolean;
}

export interface Conversation {
  userId: string;
  username: string;
  figureString?: string;
  hotel?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

export const useChat = () => {
  const { habboAccount } = useAuth();
  const userId = habboAccount?.supabase_user_id;
  const { refreshUnreadCount } = useChatNotifications();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Buscar conversas do usuário - MEMOIZADO
  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Usar Edge Function para buscar conversas (bypass de RLS)
      const { data, error: functionError } = await supabase.functions.invoke('chat-messages', {
        body: {
          action: 'conversations',
          user_id: userId,
        }
      });

      if (functionError || !data?.success) {
        throw new Error(data?.error || functionError?.message || 'Erro ao buscar conversas');
      }

      const messagesData = data.messages || [];

      // Agrupar por conversas
      const conversationsMap = new Map<string, Conversation>();
      
      messagesData?.forEach((msg) => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            username: otherUserId, // Temporário - será atualizado com dados do Habbo
            lastMessage: msg.message,
            lastMessageTime: msg.created_at,
            unreadCount: 0,
          });
        }
      });

      // Contar mensagens não lidas
      messagesData?.forEach((msg) => {
        if (msg.receiver_id === userId && !msg.read_at) {
          const conv = conversationsMap.get(msg.sender_id);
          if (conv) {
            conv.unreadCount++;
          }
        }
      });

      // Buscar dados dos usuários (nomes do Habbo)
      const userIds = Array.from(conversationsMap.keys());
      
       if (userIds.length > 0) {
         try {
          const { data: habboData, error: habboError } = await supabase
            .from('habbo_accounts')
            .select('id, supabase_user_id, habbo_name, figure_string, hotel, is_online, updated_at, created_at')
            .in('supabase_user_id', userIds);
 
           if (!habboError && habboData) {
             // Criar Set de IDs válidos
             const validUserIds = new Set(habboData.map((habbo) => habbo.supabase_user_id));
             
             // Atualizar dados dos usuários válidos
             habboData.forEach((habbo: any) => {
               const conv = conversationsMap.get(habbo.supabase_user_id);
               if (conv) {
                 conv.username = habbo.habbo_name;
                 conv.figureString = habbo.figure_string;
                 conv.hotel = habbo.hotel;
                 
                 // Verificar se está realmente online baseado em updated_at (5 minutos de tolerância)
                 const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
                 const lastUpdate = habbo.updated_at || habbo.created_at;
                 const isActuallyOnline = habbo.is_online && lastUpdate && lastUpdate >= fiveMinutesAgo;
                 
                 conv.isOnline = isActuallyOnline;
               }
             });
             
             // Remover conversas de usuários que não existem mais
             userIds.forEach((userId) => {
               if (!validUserIds.has(userId)) {
                 conversationsMap.delete(userId);
               }
             });
           }
         } catch (error) {
           console.error('Error fetching Habbo data:', error);
         }
       }

       setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Buscar mensagens de uma conversa específica
  const fetchMessages = async (otherUserId: string) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setCurrentChat(otherUserId);

      // Usar Edge Function para buscar mensagens (bypass de RLS)
      const { data, error: functionError } = await supabase.functions.invoke('chat-messages', {
        body: {
          action: 'fetch',
          user_id: userId,
          receiver_id: otherUserId,
        }
      });

      if (functionError || !data?.success) {
        throw new Error(data?.error || functionError?.message || 'Erro ao buscar mensagens');
      }

      setMessages(data.messages || []);

      // Mensagens já foram marcadas como lidas pela Edge Function
      // Atualizar contador de notificações imediatamente
      await refreshUnreadCount();

      // Buscar dados do usuário do banco (para hotel e nome)
      const { data: userData } = await supabase
        .from('habbo_accounts')
        .select('habbo_name, figure_string, hotel, is_online, updated_at, created_at')
        .eq('supabase_user_id', otherUserId)
        .single();
      
      if (userData) {
        // Buscar figurestring atualizada da API do Habbo
        let updatedFigureString = userData.figure_string;
        const hotelDomain = userData.hotel === 'br' ? 'com.br' : userData.hotel === 'tr' ? 'com.tr' : userData.hotel;
        
        try {
          const habboApiUser = await getUserByName(userData.habbo_name, hotelDomain);
          if (habboApiUser?.figureString) {
            updatedFigureString = habboApiUser.figureString;
            console.log('[CHAT] Updated figureString from Habbo API for', userData.habbo_name, ':', updatedFigureString);
          }
        } catch (error) {
          console.error('[CHAT] Error fetching updated figureString from Habbo API:', error);
          // Se falhar, usar a do banco mesmo
        }
        
        // Verificar se está realmente online baseado em updated_at (5 minutos de tolerância)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        const lastUpdate = (userData as any).updated_at || (userData as any).created_at;
        const isActuallyOnline = userData.is_online && lastUpdate && lastUpdate >= fiveMinutesAgo;
        
        setConversations(prev => prev.map(conv => 
          conv.userId === otherUserId 
            ? { 
                ...conv, 
                username: userData.habbo_name,
                figureString: updatedFigureString, // Usar figurestring atualizada da API
                hotel: userData.hotel,
                isOnline: isActuallyOnline,
                unreadCount: 0 
              } 
            : conv
        ));
      } else {
        // Se não encontrar dados do usuário, apenas atualizar contador de não lidas
        setConversations(prev => prev.map(conv => 
          conv.userId === otherUserId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        ));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar ID de usuário por nome do Habbo
  const findUserByName = async (habboName: string): Promise<{ id: string; habbo_name: string; figure_string?: string; is_online?: boolean } | null> => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('id, supabase_user_id, habbo_name, figure_string, is_online')
        .eq('habbo_name', habboName)
        .single();

      if (error) {
        console.error('Error finding user by name:', error);
        return null;
      }
      // Retornar o supabase_user_id como 'id' para compatibilidade
      return data ? { ...data, id: data.supabase_user_id } : null;
    } catch (error) {
      console.error('Exception finding user:', error);
      return null;
    }
  };

  // Enviar mensagem com rate limiting e filtros anti-spam
  const sendMessage = async (receiverId: string, message: string) => {
    if (!userId || !message.trim()) return;

    // 1. Verificar filtros anti-spam
    const spamCheck = checkMessageSpam(userId, message);
    if (!spamCheck.isValid) {
      alert(spamCheck.reason || 'Mensagem bloqueada por filtro anti-spam.');
      return;
    }

    // 2. Verificar rate limit (5 mensagens a cada 8 segundos)
    const limitKey = `chat_message_${userId}`;
    const limitCheck = rateLimiter.checkLimit(limitKey, RATE_LIMITS.CHAT_MESSAGE);
    
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      return;
    }

    try {
      // Usar Edge Function para enviar mensagem (bypass de RLS com service_role)
      const { data, error: functionError } = await supabase.functions.invoke('chat-messages', {
        body: {
          sender_id: userId,
          receiver_id: receiverId,
          message: message.trim(),
        }
      });

      if (functionError) {
        console.error('Function error:', functionError);
        // Tentar obter mais detalhes do erro
        const errorDetails = functionError.context || functionError.message || 'Erro desconhecido';
        throw new Error(`Erro ao enviar mensagem: ${errorDetails}`);
      }

      if (!data) {
        throw new Error('Resposta vazia da Edge Function');
      }

      if (!data.success) {
        console.error('Function returned error:', data);
        const errorMessage = data?.error || data?.details || 'Erro ao enviar mensagem';
        throw new Error(errorMessage);
      }

      // Adicionar mensagem ao estado local imediatamente (otimista)
      if (data.message) {
        const newMessage: ChatMessage = {
          id: data.message.id,
          sender_id: data.message.sender_id,
          receiver_id: data.message.receiver_id,
          message: data.message.message,
          created_at: data.message.created_at,
          read_at: data.message.read_at,
          deleted_by_sender: data.message.deleted_by_sender || false,
          deleted_by_receiver: data.message.deleted_by_receiver || false,
          is_reported: data.message.is_reported || false,
        };

        // Se estiver na conversa atual, adicionar mensagem diretamente
        if (currentChat === receiverId) {
          setMessages(prev => [...prev, newMessage]);
        }
      } else {
        // Fallback: recarregar mensagens se não recebeu a mensagem na resposta
        await fetchMessages(receiverId);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error?.message || 'Erro ao enviar mensagem. Tente novamente.');
    }
  };

  // Bloquear usuário - OTIMIZADO com lazy loading e rate limiting
  const blockUser = async (blockedId: string) => {
    if (!userId) return;

    // Verificar rate limit
    const limitKey = `user_block_${userId}`;
    const limitCheck = rateLimiter.checkLimit(limitKey, RATE_LIMITS.USER_BLOCK);
    
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      return;
    }

    try {
      // Buscar bloqueados se ainda não foi carregado
      if (blockedUsers.length === 0) {
        await fetchBlockedUsers();
      }

      const { error } = await supabase
        .from('user_blocks')
        .insert({
          blocker_id: userId,
          blocked_id: blockedId,
        });

      if (error) throw error;

      setBlockedUsers([...blockedUsers, blockedId]);
      setCurrentChat(null);
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  // Desbloquear usuário
  const unblockUser = async (blockedId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_blocks')
        .delete()
        .eq('blocker_id', userId)
        .eq('blocked_id', blockedId);

      if (error) throw error;

      setBlockedUsers(blockedUsers.filter(id => id !== blockedId));
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  // Denunciar mensagem com rate limiting
  const reportMessage = async (messageId: string, reason: string) => {
    if (!userId) return;

    // Verificar rate limit
    const limitKey = `report_message_${userId}`;
    const limitCheck = rateLimiter.checkLimit(limitKey, RATE_LIMITS.REPORT_MESSAGE);
    
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      return;
    }

    try {
      const { error } = await supabase
        .from('message_reports')
        .insert({
          message_id: messageId,
          reporter_id: userId,
          reason,
        });

      if (error) throw error;

      alert('✅ Mensagem denunciada com sucesso. Nossa equipe irá revisar.');
    } catch (error) {
      console.error('Error reporting message:', error);
    }
  };

  // Apagar mensagem (soft delete)
  const deleteMessage = async (messageId: string, isSender: boolean) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update(isSender ? { deleted_by_sender: true } : { deleted_by_receiver: true })
        .eq('id', messageId);

      if (error) throw error;

      if (currentChat) {
        await fetchMessages(currentChat);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Deletar conversa inteira (hard delete - apenas para admin/alpha)
  const deleteConversation = async (otherUserId: string) => {
    if (!userId) return;

    try {
      // Buscar todas as mensagens da conversa
      const { data: messagesToDelete, error: fetchError } = await supabase
        .from('chat_messages')
        .select('id')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`);

      if (fetchError) {
        console.error('❌ Erro ao buscar mensagens:', fetchError);
        throw fetchError;
      }

      // Deletar todas as mensagens encontradas
      if (messagesToDelete && messagesToDelete.length > 0) {
        for (const msg of messagesToDelete) {
          const { error: deleteError } = await supabase
            .from('chat_messages')
            .delete()
            .eq('id', msg.id);

          if (deleteError) {
            console.error('❌ Erro ao deletar mensagem:', msg.id, deleteError);
          }
        }
      }

      // Remover conversa da lista local e fechar chat
      setConversations(prev => prev.filter(conv => conv.userId !== otherUserId));
      setCurrentChat(null);
      setMessages([]);
      
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
    }
  };

  // Buscar usuários bloqueados
  const fetchBlockedUsers = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', userId);

      if (error) throw error;

      setBlockedUsers(data?.map(b => b.blocked_id) || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  // Carregar dados iniciais - OTIMIZADO
  useEffect(() => {
    if (userId) {
      // Apenas carregar conversas inicialmente
      fetchConversations();
      // Buscar bloqueados será lazy (apenas quando necessário)
    }
  }, [userId]);

  // Subscription para novas mensagens em tempo real - OTIMIZADO
  useEffect(() => {
    if (!userId) return;


    const channel = supabase
      .channel(`chat-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // NÃO tocar som aqui - o contexto global de notificações cuida disso
          // O som só toca quando NÃO está visualizando a conversa ativa
          
          // Se estiver na conversa atual, adicionar mensagem diretamente
          if (currentChat && newMessage.sender_id === currentChat) {
            setMessages(prev => {
              // Evitar duplicatas
              if (prev.some(m => m.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
            
            // Marcar como lida automaticamente (será feito quando buscar mensagens)
            // Não precisa marcar imediatamente via Edge Function
          } else {
            // Atualizar contador de não lidas da conversa
            setConversations(prev => {
              const exists = prev.find(c => c.userId === newMessage.sender_id);
              
              if (exists) {
                const updated = prev.map(conv => 
                  conv.userId === newMessage.sender_id
                    ? { 
                        ...conv, 
                        lastMessage: newMessage.message,
                        lastMessageTime: newMessage.created_at,
                        unreadCount: conv.unreadCount + 1 
                      }
                    : conv
                );
                return updated;
              } else {
                // Nova conversa - buscar dados do usuário e adicionar à lista temporariamente
                fetchConversations();
                // Enquanto busca, adicionar conversa temporária com unreadCount = 1
                return [
                  ...prev,
                  {
                    userId: newMessage.sender_id,
                    username: newMessage.sender_id, // Temporário - será atualizado após fetchConversations
                    lastMessage: newMessage.message,
                    lastMessageTime: newMessage.created_at,
                    unreadCount: 1,
                  }
                ];
              }
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const updatedMessage = payload.new as ChatMessage;
          const oldMessage = payload.old as ChatMessage;
          
          // Se uma mensagem foi marcada como lida, atualizar contador da conversa
          if (updatedMessage.read_at && !oldMessage?.read_at && updatedMessage.receiver_id === userId) {
            // Atualizar contador da conversa para 0 (recarregar conversas para garantir precisão)
            setConversations(prev => prev.map(conv => 
              conv.userId === updatedMessage.sender_id
                ? { ...conv, unreadCount: 0 }
                : conv
            ));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('[CHAT] Channel subscription error');
        }
      });

    return () => {
      console.log('[CHAT] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, currentChat, fetchConversations]);

  // Polling para atualizar lista de conversas quando não estiver em uma conversa ativa (fallback para subscription)
  useEffect(() => {
    if (!userId || currentChat) return; // Só fazer polling quando NÃO estiver em uma conversa ativa

    const intervalId = setInterval(async () => {
      try {
        console.log('[CHAT] Polling conversations list (not in active chat)');
        fetchConversations();
      } catch (error) {
        console.warn('[CHAT] Polling conversations error (non-critical):', error);
      }
    }, 5000); // A cada 5 segundos quando não estiver em uma conversa

    return () => clearInterval(intervalId);
  }, [userId, currentChat, fetchConversations]);

  // Polling como fallback caso a subscription não funcione (atualizar mensagens quando estiver em uma conversa)
  useEffect(() => {
    if (!userId || !currentChat) return;

    const intervalId = setInterval(async () => {
      try {
        // Buscar mensagens mais recentes apenas se estiver em uma conversa
        const { data: latestMessages, error } = await supabase.functions.invoke('chat-messages', {
          body: {
            action: 'fetch',
            user_id: userId,
            receiver_id: currentChat,
          }
        });

        if (!error && latestMessages?.success && latestMessages.messages) {
          const messagesArray = latestMessages.messages as ChatMessage[];
          
            // Verificar se há novas mensagens
            setMessages(prev => {
              const prevIds = new Set(prev.map(m => m.id));
              const newMessages = messagesArray.filter(m => !prevIds.has(m.id));
              
              // NÃO tocar som aqui - o contexto global de notificações cuida disso
              // O som só toca quando NÃO está visualizando a conversa ativa
            
            // Atualizar lista de mensagens (manter ordem por created_at)
            const allMessages = [...prev, ...newMessages].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            // Remover duplicatas
            const uniqueMessages = Array.from(
              new Map(allMessages.map(m => [m.id, m])).values()
            );
            
            return uniqueMessages;
          });
        }
      } catch (error) {
        console.warn('[CHAT] Polling error (non-critical):', error);
      }
    }, 3000); // Poll a cada 3 segundos

    return () => clearInterval(intervalId);
  }, [userId, currentChat]);

  // Subscription para atualizar estado online dos usuários em tempo real
  useEffect(() => {
    if (!userId || conversations.length === 0) return;

    const channel = supabase
      .channel('habbo-accounts-online-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'habbo_accounts',
        },
        (payload) => {
          const updatedUser = payload.new as { supabase_user_id: string; is_online: boolean; updated_at?: string };
          const oldUser = payload.old as { supabase_user_id: string; is_online: boolean; updated_at?: string };
          
          // Verificar se o estado online mudou e se o usuário está em uma das conversas
          if (updatedUser.supabase_user_id && conversations.some(conv => conv.userId === updatedUser.supabase_user_id)) {
            // Verificar se está realmente online baseado em updated_at (5 minutos de tolerância)
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            const lastUpdate = updatedUser.updated_at || '';
            const isActuallyOnline = updatedUser.is_online && lastUpdate && lastUpdate >= fiveMinutesAgo;
            
            setConversations(prev => prev.map(conv => 
              conv.userId === updatedUser.supabase_user_id
                ? { ...conv, isOnline: isActuallyOnline }
                : conv
            ));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, conversations]);

  // Verificar periodicamente se os usuários ainda estão online (polling de fallback)
  useEffect(() => {
    if (!userId || conversations.length === 0) return;

    const interval = setInterval(async () => {
      // Buscar estado atualizado dos usuários nas conversas
      const userIds = conversations.map(conv => conv.userId);
      if (userIds.length === 0) return;

      try {
        const { data: habboData } = await supabase
          .from('habbo_accounts')
          .select('supabase_user_id, is_online, updated_at')
          .in('supabase_user_id', userIds);

        if (habboData) {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
          
          setConversations(prev => prev.map(conv => {
            const userData = habboData.find((u: any) => u.supabase_user_id === conv.userId);
            if (userData) {
              const lastUpdate = userData.updated_at || '';
              const isActuallyOnline = userData.is_online && lastUpdate && lastUpdate >= fiveMinutesAgo;
              // Só atualizar se mudou para evitar re-renders desnecessários
              if (conv.isOnline !== isActuallyOnline) {
                console.log('[CHAT] Online status updated for', conv.username, ':', isActuallyOnline);
                return { ...conv, isOnline: isActuallyOnline };
              }
            }
            return conv;
          }));
        }
      } catch (error) {
        console.error('Erro ao verificar estado online:', error);
      }
    }, 5000); // Verificar a cada 5 segundos para melhor responsividade

    return () => clearInterval(interval);
  }, [userId, conversations]);

  return {
    conversations,
    currentChat,
    messages,
    isLoading,
    blockedUsers,
    fetchConversations,
    fetchMessages,
    findUserByName,
    sendMessage,
    blockUser,
    unblockUser,
    reportMessage,
    deleteMessage,
    deleteConversation,
    setCurrentChat,
    setConversations,
  };
};

