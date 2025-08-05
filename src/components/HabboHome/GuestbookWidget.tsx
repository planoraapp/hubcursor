
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface GuestbookWidgetProps {
  entries: GuestbookEntry[];
  onAddEntry: (message: string) => void;
  isOwner?: boolean;
}

export const GuestbookWidget: React.FC<GuestbookWidgetProps> = ({
  entries,
  onAddEntry,
  isOwner
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isLoggedIn } = useAuth();

  const handleSubmit = async () => {
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddEntry(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error adding guestbook entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5" />
          Livro de Visitas
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Lista de mensagens */}
        <div className="flex-1 space-y-3 max-h-40 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              <p className="text-sm">Nenhuma mensagem ainda.</p>
              <p className="text-xs">Seja o primeiro a deixar um recado!</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-gray-50 p-3 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-blue-600">
                    {entry.author_habbo_name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 break-words">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Formulário de nova mensagem */}
        {isLoggedIn && (
          <div className="space-y-2 border-t pt-3">
            <Textarea
              placeholder="Deixe uma mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={200}
              rows={3}
              className="text-sm resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newMessage.length}/200
              </span>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newMessage.trim() || isSubmitting}
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}

        {!isLoggedIn && (
          <div className="text-center text-gray-500 text-sm border-t pt-3">
            <p>Faça login para deixar uma mensagem</p>
          </div>
        )}
      </CardContent>
    </div>
  );
};
