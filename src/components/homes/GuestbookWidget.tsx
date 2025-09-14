
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import type { GuestbookEntry } from '@/types/habbo';
interface GuestbookWidgetProps {
  entries: GuestbookEntry[];
  onAddEntry: (message: string) => Promise<void>;
  isOwner: boolean;
  homeOwnerName: string;
}

export const GuestbookWidget: React.FC<GuestbookWidgetProps> = ({
  entries,
  onAddEntry,
  isOwner,
  homeOwnerName
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddEntry(newMessage.trim());
      setNewMessage('');
    } catch (error) {
          } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg volter-font">
          <MessageSquare className="w-5 h-5" />
          Livro de Visitas
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Add new entry form */}
        {!isOwner && (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder={`Deixe uma mensagem para ${homeOwnerName}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={200}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {newMessage.length}/200
              </span>
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newMessage.trim() || isSubmitting}
                className="volter-font"
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmitting ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        )}

        {/* Entries list */}
        <ScrollArea className="h-64">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma mensagem ainda</p>
              <p className="text-xs">Seja o primeiro a deixar um recado!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm volter-font">
                        {entry.author_habbo_name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        Visitante
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(entry.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
