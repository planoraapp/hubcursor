
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Send } from 'lucide-react';

interface HabboData {
  name: string;
  figureString?: string;
  motto?: string;
  online?: boolean;
  memberSince?: string;
  selectedBadges?: any[];
}

interface GuestbookWidgetProps {
  habboData: HabboData;
}

export const GuestbookWidget = ({ habboData }: GuestbookWidgetProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      console.log('Sending guestbook message:', message);
      setMessage('');
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 volter-font">
          <MessageCircle className="w-5 h-5" />
          Livro de Visitas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Deixe uma mensagem para ${habboData.name}...`}
            className="min-h-[80px]"
          />
          <Button type="submit" size="sm" className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensagem
          </Button>
        </form>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Mensagens recentes aparecerão aqui...</p>
        </div>
      </CardContent>
    </Card>
  );
};
