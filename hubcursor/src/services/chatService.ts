import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  otherUser: {
    habbo_name: string;
    figureString?: string;
    online?: boolean;
  };
  lastMessage?: {
    text: string;
    timestamp: Date;
    sender: string;
  };
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_habbo_name: string;
  message_text: string;
  created_at: string;
  message_type: string;
}

export const chatService = {
  // Get all conversations for current user
  async getConversations(currentUserHabboName: string): Promise<Conversation[]> {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        chat_messages!inner (
          message_text,
          created_at,
          sender_habbo_name
        )
      `)
      .or(`participant_1.eq.${currentUserHabboName},participant_2.eq.${currentUserHabboName}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    // Transform to expected format
    return conversations?.map(conv => {
      const otherUserName = conv.participant_1 === currentUserHabboName 
        ? conv.participant_2 
        : conv.participant_1;
      
      const lastMsg = conv.chat_messages?.[conv.chat_messages.length - 1];
      
      return {
        ...conv,
        otherUser: {
          habbo_name: otherUserName,
          figureString: 'hr-100-61.hd-180-1.ch-210-66.lg-270-82.sh-305-62', // Default
          online: Math.random() > 0.5 // Mock online status
        },
        lastMessage: lastMsg ? {
          text: lastMsg.message_text,
          timestamp: new Date(lastMsg.created_at),
          sender: lastMsg.sender_habbo_name
        } : undefined
      };
    }) || [];
  },

  // Get messages for a specific conversation
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Send a new message
  async sendMessage(conversationId: string, senderHabboName: string, messageText: string): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        sender_habbo_name: senderHabboName,
        message_text: messageText,
        message_type: 'text'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Create or get existing conversation
  async createOrGetConversation(participant1: string, participant2: string): Promise<string> {
    // Sort participants to ensure consistent ordering
    const [p1, p2] = [participant1, participant2].sort();
    
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${p1},participant_2.eq.${p2}),and(participant_1.eq.${p2},participant_2.eq.${p1})`)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: p1,
        participant_2: p2
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId: string, onMessage: (message: ChatMessage) => void) {
    return supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();
  },

  // Subscribe to conversation updates
  subscribeToConversations(userHabboName: string, onUpdate: () => void) {
    return supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `or(participant_1.eq.${userHabboName},participant_2.eq.${userHabboName})`
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();
  }
};