
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface GuestbookWidgetProps {
  entries: GuestbookEntry[];
  onAddEntry: (message: string) => void;
  isOwner: boolean;
}

export const GuestbookWidget: React.FC<GuestbookWidgetProps> = ({
  entries,
  onAddEntry,
  isOwner
}) => {
  const [newMessage, setNewMessage] = useState('');
  const { isLoggedIn, habboAccount } = useSimpleAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isLoggedIn) {
      onAddEntry(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200 flex flex-col">
      <h3 className="font-bold text-blue-800 mb-3 volter-font flex items-center gap-2">
        💬 Livro de Visitas
        <span className="text-xs bg-blue-200 px-2 py-1 rounded">
          {entries.length} mensagens
        </span>
      </h3>
      
      <ScrollArea className="flex-1 mb-4 pr-2">
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-blue-600 volter-font text-sm">
                📝 Nenhuma mensagem ainda.
              </p>
              <p className="text-blue-500 volter-font text-xs mt-1">
                Seja o primeiro a deixar uma mensagem!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-blue-800 volter-font text-sm">
                    {entry.author_habbo_name}
                  </span>
                  <span className="text-xs text-blue-500">
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <p className="text-blue-700 text-sm leading-relaxed">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escreva uma mensagem..."
            className="bg-white border-blue-200 focus:border-blue-400"
            maxLength={200}
          />
          <Button
            type="submit"
            size="sm"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
            disabled={!newMessage.trim()}
          >
            ✍️ Enviar Mensagem
          </Button>
        </form>
      ) : (
        <div className="text-center py-3 bg-blue-100 rounded-lg border border-blue-200">
          <p className="text-blue-700 volter-font text-sm">
            🔒 Faça login para deixar uma mensagem
          </p>
        </div>
      )}
    </div>
  );
};
