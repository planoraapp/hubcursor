import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { messageNotificationSound } from '@/utils/messageNotificationSound';

interface ChatNotificationContextType {
  unreadCount: number;
  hasNotifications: boolean;
  refreshUnreadCount: () => Promise<void>;
}

const ChatNotificationContext = createContext<ChatNotificationContextType | undefined>(undefined);

export const ChatNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { habboAccount } = useAuth();
  const userId = habboAccount?.supabase_user_id;
  const [unreadCount, setUnreadCount] = useState(0);
  const prevUnreadCountRef = React.useRef(0);
  const notifiedMessagesRef = React.useRef<Set<string>>(new Set()); // Rastrear mensagens já notificadas
  const hasCheckedInitialMessagesRef = React.useRef(false); // Verificar se já checou mensagens no login

  // Resetar contador quando userId muda
  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
      notifiedMessagesRef.current.clear();
      hasCheckedInitialMessagesRef.current = false;
    } else {
      // Resetar quando userId muda (novo login)
      notifiedMessagesRef.current.clear();
      hasCheckedInitialMessagesRef.current = false;
    }
  }, [userId]);

  // Buscar contador de mensagens não lidas
  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      prevUnreadCountRef.current = 0;
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('chat-messages', {
        body: {
          action: 'conversations',
          user_id: userId,
        }
      });

      if (error || !data?.success) {
        console.error('[CHAT NOTIFICATIONS] Error fetching conversations:', error);
        // Em caso de erro, resetar contador para 0 para evitar manter estado incorreto
        setUnreadCount(0);
        return;
      }

      const messages = data.messages || [];
      
      // Buscar IDs únicos de todos os senders para verificar se ainda existem
      const senderIds = [...new Set(messages.map((msg: any) => msg.sender_id).filter(Boolean))];
      let validSenderIds = new Set<string>();
      
      if (senderIds.length > 0) {
        try {
          const { data: senderData } = await supabase
            .from('habbo_accounts')
            .select('supabase_user_id')
            .in('supabase_user_id', senderIds);
          
          if (senderData) {
            validSenderIds = new Set(senderData.map((s: any) => s.supabase_user_id));
          }
        } catch (error) {
          console.error('[CHAT NOTIFICATIONS] Error fetching sender data:', error);
          // Se houver erro, assumir que todos os senders são válidos para não perder notificações legítimas
          validSenderIds = new Set(senderIds);
        }
      }
      
      // Contar mensagens não lidas onde:
      // 1. O usuário é o receiver
      // 2. A mensagem não foi lida
      // 3. O sender ainda existe no banco (para evitar notificações de usuários deletados)
      const unreadMessages = messages.filter(
        (msg: any) => 
          msg.receiver_id === userId && 
          !msg.read_at &&
          msg.sender_id &&
          validSenderIds.has(msg.sender_id)
      );
      const unread = unreadMessages.length;

      console.log('[CHAT NOTIFICATIONS] Unread count calculation:', {
        totalMessages: messages.length,
        unreadCount: unread,
        userId: userId?.substring(0, 8),
        unreadMessages: unreadMessages.map((msg: any) => ({
          id: msg.id?.substring(0, 8),
          sender_id: msg.sender_id?.substring(0, 8),
          receiver_id: msg.receiver_id?.substring(0, 8),
          read_at: msg.read_at,
          message: msg.message?.substring(0, 50),
          created_at: msg.created_at
        }))
      });
      
      // Se há mensagens não lidas, logar detalhes completos para debug
      if (unread > 0) {
        console.warn('[CHAT NOTIFICATIONS] ⚠️ Encontradas mensagens não lidas:', unreadMessages);
      }
      
      // Sempre atualizar o estado, mesmo se for 0, para garantir sincronização
      const previousCount = prevUnreadCountRef.current;
      console.log('[CHAT NOTIFICATIONS] Setting unreadCount to:', unread, 'previous:', previousCount);
      
      // Tocar som ao fazer login se houver mensagens não lidas (apenas uma vez)
      if (!hasCheckedInitialMessagesRef.current && unread > 0) {
        hasCheckedInitialMessagesRef.current = true;
        const isOnChatPage = window.location.pathname === '/console';
        const activeChatTab = (window as any).activeChatTab;
        const currentChatUserId = (window as any).currentChatUserId;
        const isViewingAnyConversation = isOnChatPage && activeChatTab === 'chat' && currentChatUserId;
        
        if (!isViewingAnyConversation && messageNotificationSound.isEnabled()) {
          console.log('[CHAT NOTIFICATIONS] 🎵 Playing sound on login - unread messages detected');
          try {
            messageNotificationSound.play();
          } catch (error) {
            console.error('[CHAT NOTIFICATIONS] ❌ Error calling sound.play():', error);
          }
        }
      }
      
      // NÃO tocar som quando o contador aumenta via polling (apenas via subscription para novas mensagens)
      prevUnreadCountRef.current = unread;
      setUnreadCount(unread);
    } catch (error) {
      console.error('[CHAT NOTIFICATIONS] Error:', error);
    }
  }, [userId]);

  // Subscription para atualizar contador em tempo real
  useEffect(() => {
    if (!userId) return;

    // Buscar contador inicial
    fetchUnreadCount();

    // Configurar subscription
    const channel = supabase
      .channel(`chat-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('[CHAT NOTIFICATIONS] 📨 New message received via subscription:', {
            messageId: payload.new?.id?.substring(0, 8),
            senderId: payload.new?.sender_id?.substring(0, 8),
            receiverId: payload.new?.receiver_id?.substring(0, 8),
            userId: userId?.substring(0, 8)
          });
          
          const newMessage = payload.new as any;
          
          // Verificar se a página atual é a conversa ativa
          // Se não for, tocar som e atualizar contador
          const isOnChatPage = window.location.pathname === '/console';
          const activeChatTab = (window as any).activeChatTab;
          const currentChatUserId = (window as any).currentChatUserId;
          const isViewingThisConversation = isOnChatPage && activeChatTab === 'chat' && currentChatUserId === newMessage.sender_id;

          console.log('[CHAT NOTIFICATIONS] 📊 Sound play conditions:', {
            isOnChatPage,
            activeChatTab,
            currentChatUserId: currentChatUserId?.substring(0, 8),
            newMessageSenderId: newMessage.sender_id?.substring(0, 8),
            isViewingThisConversation,
            userId: userId?.substring(0, 8),
            sameSender: newMessage.sender_id === userId
          });

          // Se NÃO estiver visualizando esta conversa específica, tocar som (apenas uma vez por mensagem)
          if (!isViewingThisConversation && newMessage.sender_id !== userId) {
            const messageId = newMessage.id;
            
            // Verificar se já notificamos esta mensagem
            if (notifiedMessagesRef.current.has(messageId)) {
              console.log('[CHAT NOTIFICATIONS] 🔇 Sound already played for this message, skipping');
              fetchUnreadCount();
              return;
            }
            
            // Verificar se o som está habilitado nas configurações
            if (!messageNotificationSound.isEnabled()) {
              console.log('[CHAT NOTIFICATIONS] 🔇 Sound disabled by user settings');
              fetchUnreadCount();
              return;
            }
            
            // Marcar mensagem como notificada
            notifiedMessagesRef.current.add(messageId);
            
            console.log('[CHAT NOTIFICATIONS] 🎵 Attempting to play sound - new message received');
            try {
              const played = messageNotificationSound.play();
              console.log('[CHAT NOTIFICATIONS] 🎵 Sound play() returned:', played);
              if (!played) {
                console.warn('[CHAT NOTIFICATIONS] ⚠️ Sound play() returned false - may be rate limited');
                // Se não tocou, remover do Set para tentar novamente na próxima vez
                notifiedMessagesRef.current.delete(messageId);
              }
            } catch (error) {
              console.error('[CHAT NOTIFICATIONS] ❌ Error calling sound.play():', error);
              // Em caso de erro, remover do Set
              notifiedMessagesRef.current.delete(messageId);
            }
          } else {
            console.log('[CHAT NOTIFICATIONS] 🔇 NOT playing sound - conditions not met:', {
              isViewingThisConversation,
              newMessageSenderId: newMessage.sender_id?.substring(0, 8),
              userId: userId?.substring(0, 8),
              sameSender: newMessage.sender_id === userId
            });
          }

          // Não incrementar imediatamente - apenas recarregar para garantir precisão
          // Isso evita que o contador fique incorreto se a mensagem já foi lida
          fetchUnreadCount();
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
          // Se uma mensagem foi marcada como lida, atualizar contador
          const updatedMessage = payload.new as any;
          const oldMessage = payload.old as any;
          // Só atualizar se realmente mudou de não lida para lida
          if (updatedMessage.read_at && !oldMessage?.read_at && updatedMessage.receiver_id === userId) {
            console.log('[CHAT NOTIFICATIONS] Message marked as read, refreshing count');
            // Recarregar contador imediatamente
            fetchUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnreadCount]);

  // Atualizar contador periodicamente (fallback) - reduzido para 3 segundos para melhor responsividade
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 3000); // A cada 3 segundos para melhor responsividade

    return () => clearInterval(interval);
  }, [userId, fetchUnreadCount]);

  // Limpar mensagens antigas do Set de notificações (evitar crescimento excessivo)
  useEffect(() => {
    if (!userId) return;

    const cleanupInterval = setInterval(() => {
      // Limpar mensagens antigas (manter apenas as últimas 100)
      if (notifiedMessagesRef.current.size > 100) {
        const messages = Array.from(notifiedMessagesRef.current);
        const toKeep = messages.slice(-100); // Manter apenas as últimas 100
        notifiedMessagesRef.current.clear();
        toKeep.forEach(id => notifiedMessagesRef.current.add(id));
        console.log('[CHAT NOTIFICATIONS] Cleaned up old notified messages, kept', toKeep.length);
      }
    }, 60000); // A cada 1 minuto

    return () => clearInterval(cleanupInterval);
  }, [userId]);

  const hasNotificationsValue = unreadCount > 0;
  
  // Log para debug
  useEffect(() => {
    console.log('[CHAT NOTIFICATIONS PROVIDER] Current state:', {
      unreadCount,
      hasNotifications: hasNotificationsValue,
      userId: userId?.substring(0, 8)
    });
  }, [unreadCount, hasNotificationsValue, userId]);

  return (
    <ChatNotificationContext.Provider value={{ unreadCount, hasNotifications: hasNotificationsValue, refreshUnreadCount: fetchUnreadCount }}>
      {children}
    </ChatNotificationContext.Provider>
  );
};

export const useChatNotifications = () => {
  const context = useContext(ChatNotificationContext);
  if (context === undefined) {
    throw new Error('useChatNotifications must be used within a ChatNotificationProvider');
  }
  return context;
};

