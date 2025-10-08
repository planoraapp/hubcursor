import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

export const useChat = () => {
  const { habboAccount } = useAuth();
  const userId = habboAccount?.id;
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Buscar conversas do usuário
  const fetchConversations = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);

      // Buscar todas as mensagens onde o usuário é sender ou receiver
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

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
          const { data: habboData } = await supabase
            .from('habbo_accounts')
            .select('id, habbo_name, figure_string, is_online')
            .in('id', userIds);

          habboData?.forEach((habbo) => {
            const conv = conversationsMap.get(habbo.id);
            if (conv) {
              conv.username = habbo.habbo_name;
              conv.figureString = habbo.figure_string;
              conv.isOnline = habbo.is_online;
            }
          });
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
  };

  // Buscar mensagens de uma conversa específica
  const fetchMessages = async (otherUserId: string) => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setCurrentChat(otherUserId);

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Marcar mensagens como lidas
      await supabase
        .from('chat_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', userId)
        .eq('sender_id', otherUserId)
        .is('read_at', null);

      // Atualizar lista de conversas
      await fetchConversations();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar ID de usuário por nome do Habbo
  const findUserByName = async (habboName: string): Promise<{ id: string; habbo_name: string; figure_string?: string } | null> => {
    try {
      const { data, error } = await supabase
        .from('habbo_accounts')
        .select('id, habbo_name, figure_string, is_online')
        .ilike('habbo_name', habboName)
        .single();

      if (error) return null;
      return data;
    } catch (error) {
      return null;
    }
  };

  // Enviar mensagem
  const sendMessage = async (receiverId: string, message: string) => {
    if (!userId || !message.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: userId,
          receiver_id: receiverId,
          message: message.trim(),
        });

      if (error) throw error;

      // Recarregar mensagens
      await fetchMessages(receiverId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Bloquear usuário
  const blockUser = async (blockedId: string) => {
    if (!userId) return;

    try {
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

  // Denunciar mensagem
  const reportMessage = async (messageId: string, reason: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('message_reports')
        .insert({
          message_id: messageId,
          reporter_id: userId,
          reason,
        });

      if (error) throw error;

      alert('Mensagem denunciada com sucesso. Nossa equipe irá revisar.');
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

  // Enviar mensagem de boas-vindas para novos usuários (apenas uma vez)
  const [welcomeSent, setWelcomeSent] = useState(false);
  
  const sendWelcomeMessage = async () => {
    if (!userId || welcomeSent) return;

    try {
      // Verificar se já tem mensagens
      const { data: existingMessages } = await supabase
        .from('chat_messages')
        .select('id')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .limit(1);

      if (existingMessages && existingMessages.length > 0) {
        setWelcomeSent(true);
        return;
      }

      // Buscar ID do habbohub
      const { data: habbohub } = await supabase
        .from('habbo_accounts')
        .select('id')
        .ilike('habbo_name', 'habbohub')
        .single();

      if (!habbohub) {
        setWelcomeSent(true);
        return;
      }

      // Criar mensagem de boas-vindas
      const welcomeMessage = `🎉 Olá! Bem-vindo ao HabboHub!

Aqui você pode:
✨ Editar seu perfil e rotacionar seu avatar
📸 Gerenciar suas fotos (ocultar/restaurar)
👥 Buscar e seguir amigos
💬 Conversar com outros usuários cadastrados

Explore o console e aproveite! Se precisar de ajuda, estou aqui. 😊`;

      await supabase
        .from('chat_messages')
        .insert({
          sender_id: habbohub.id,
          receiver_id: userId,
          message: welcomeMessage
        });

      setWelcomeSent(true);
      
      // Recarregar conversas para mostrar a mensagem
      await fetchConversations();

    } catch (error) {
      setWelcomeSent(true);
      console.log('Could not send welcome message');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (userId) {
      fetchConversations();
      fetchBlockedUsers();
      // Enviar mensagem de boas-vindas se for novo usuário
      sendWelcomeMessage();
    }
  }, [userId]);

  // Subscription para novas mensagens em tempo real
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          // Recarregar conversas quando receber nova mensagem
          fetchConversations();
          
          // Se estiver na conversa atual, recarregar mensagens
          if (currentChat && payload.new.sender_id === currentChat) {
            fetchMessages(currentChat);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentChat]);

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
    setCurrentChat,
  };
};

