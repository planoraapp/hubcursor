
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface HabboData {
  name: string;
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
  selectedBadges?: any[];
}

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface GuestbookWidgetProps {
  habboData: HabboData;
  guestbook?: GuestbookEntry[];
  onAddEntry?: (message: string) => Promise<void>;
  isOwner?: boolean;
}

export const GuestbookWidget: React.FC<GuestbookWidgetProps> = ({ 
  habboData, 
  guestbook = [], 
  onAddEntry,
  isOwner = false 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { habboAccount, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const handleSubmitMessage = async () => {
    if (!newMessage.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem",
        variant: "destructive"
      });
      return;
    }

    if (!isLoggedIn) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para deixar uma mensagem",
        variant: "destructive"
      });
      return;
    }

    if (!onAddEntry) {
      toast({
        title: "Erro",
        description: "Função de adicionar mensagem não disponível",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAddEntry(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao adicionar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (minutes < 60) {
        return `há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      } else if (hours < 24) {
        return `há ${hours} hora${hours !== 1 ? 's' : ''}`;
      } else if (days < 30) {
        return `há ${days} dia${days !== 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('pt-BR');
      }
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
        <CardTitle className="volter-font text-center flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Livro de Visitas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Entries List */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {guestbook && guestbook.length > 0 ? (
            guestbook.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-blue-600">
                    {entry.author_habbo_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{entry.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs">Seja o primeiro a deixar uma mensagem!</p>
            </div>
          )}
        </div>

        {/* Add Message Form */}
        {isLoggedIn ? (
          <div className="space-y-3 border-t pt-4">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Deixe uma mensagem para este usuário..."
              className="resize-none"
              rows={3}
              maxLength={200}
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newMessage.length}/200 caracteres
              </span>
              <Button 
                onClick={handleSubmitMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting || !newMessage.trim()}
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 border-t">
            <p className="text-sm text-gray-500 mb-2">
              Faça login para deixar uma mensagem
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
