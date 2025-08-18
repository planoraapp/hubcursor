
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send } from 'lucide-react';
import { GuestbookEntry } from '@/types/guestbook';

interface GuestbookWidgetProps {
  entries?: GuestbookEntry[];
  onAddEntry?: (message: string) => void;
  isOwner?: boolean;
}

export const GuestbookWidget = ({ entries = [], onAddEntry, isOwner }: GuestbookWidgetProps) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = () => {
    if (newMessage.trim() && onAddEntry) {
      onAddEntry(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <Card className="w-full h-full p-4 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-lg volter-font">Livro de Visitas</h3>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 volter-font">Seja o primeiro a deixar uma mensagem!</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="bg-white p-2 rounded text-xs">
              <div className="font-bold volter-font">{entry.author_habbo_name}</div>
              <div className="text-gray-600 volter-font">{entry.message}</div>
              <div className="text-gray-400 text-xs volter-font">{new Date(entry.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
          ))
        )}
      </div>
      
      <div className="space-y-2">
        <Textarea
          placeholder="Deixe sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="text-xs h-16 volter-font"
        />
        <Button 
          size="sm" 
          onClick={handleSubmit}
          disabled={!newMessage.trim()}
          className="w-full volter-font"
        >
          <Send className="w-3 h-3 mr-1" />
          Enviar
        </Button>
      </div>
    </Card>
  );
};
