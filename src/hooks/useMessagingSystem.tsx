
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { useUnifiedAuth } from './useUnifiedAuth';
import { toast } from 'sonner';

export const useMessagingSystem = () => {
  const { habboAccount } = useUnifiedAuth();
  const queryClient = useQueryClient();
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const startConversation = async (targetHabboName: string) => {
    if (!habboAccount?.habbo_name) {
      toast.error('Você precisa estar logado para enviar mensagens');
      return null;
    }

    try {
      setIsCreatingConversation(true);
      
      console.log(`[💬 MESSAGING] Iniciando conversa com ${targetHabboName}`);
      
      // Criar ou obter conversa existente
      const conversationId = await chatService.createOrGetConversation(
        habboAccount.habbo_name,
        targetHabboName
      );
      
      // Invalidar queries relacionadas a conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      console.log(`[💬 MESSAGING] Conversa criada/encontrada: ${conversationId}`);
      
      toast.success(`Conversa iniciada com ${targetHabboName}`);
      
      return conversationId;
    } catch (error) {
      console.error('[💬 MESSAGING] Erro ao criar conversa:', error);
      toast.error('Erro ao iniciar conversa');
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  };

  return {
    startConversation,
    isCreatingConversation
  };
};
