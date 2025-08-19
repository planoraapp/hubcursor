import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
  author_user_id?: string;
}

interface FunctionalGuestbookWidgetProps {
  homeOwnerUserId: string;
  homeOwnerName: string;
}

export const FunctionalGuestbookWidget: React.FC<FunctionalGuestbookWidgetProps> = ({
  homeOwnerUserId,
  homeOwnerName
}) => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { habboAccount } = useSimpleAuth();
  const { toast } = useToast();
  
  const isLoggedIn = !!habboAccount;
  const isOwner = habboAccount?.supabase_user_id === homeOwnerUserId;

  useEffect(() => {
    loadEntries();
  }, [homeOwnerUserId]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .select('*')
        .eq('home_owner_user_id', homeOwnerUserId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setEntries(data);
      }
    } catch (error) {
      console.error('Erro ao carregar entradas do guestbook:', error);
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn || !newMessage.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('guestbook_entries')
        .insert({
          home_owner_user_id: homeOwnerUserId,
          author_user_id: habboAccount?.supabase_user_id,
          author_habbo_name: habboAccount?.habbo_name || 'Anônimo',
          message: newMessage.trim(),
          moderation_status: 'approved'
        });

      if (!error) {
        setNewMessage('');
        await loadEntries();
        
        toast({
          title: "Mensagem enviada!",
          description: "Sua mensagem foi adicionada ao livro de visitas."
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua mensagem.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string, authorUserId?: string) => {
    const canDelete = isOwner || (authorUserId && habboAccount?.supabase_user_id === authorUserId);
    
    if (!canDelete) return;

    try {
      const { error } = await supabase
        .from('guestbook_entries')
        .delete()
        .eq('id', entryId);

      if (!error) {
        await loadEntries();
        toast({
          title: "Mensagem removida",
          description: "A mensagem foi removida do livro de visitas."
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a mensagem.",
        variant: "destructive"
      });
    }
  };

  const canDeleteEntry = (entry: GuestbookEntry) => {
    return isOwner || (entry.author_user_id && habboAccount?.supabase_user_id === entry.author_user_id);
  };

  return (
    <Card className="w-full h-full bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white p-3">
        <CardTitle className="volter-font text-center text-lg habbo-text flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Livro de Visitas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3 h-full flex flex-col">
        {/* Messages List */}
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-2">
            {entries.length > 0 ? (
              entries.map((entry) => (
                <div key={entry.id} className="bg-gray-50 p-2 rounded-lg border relative">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-blue-600 volter-font font-semibold">
                      {entry.author_habbo_name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 volter-font">
                        {formatDistanceToNow(new Date(entry.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                      {canDeleteEntry(entry) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id, entry.author_user_id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 volter-font break-words">
                    {entry.message}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 volter-font">
                  Ainda não há mensagens no livro de visitas
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Message Form */}
        {!isOwner && (
          <div className="border-t pt-3 space-y-2">
            {isLoggedIn ? (
              <>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Deixe uma mensagem para ${homeOwnerName}...`}
                  className="volter-font text-sm resize-none"
                  rows={3}
                  maxLength={500}
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 volter-font">
                    {newMessage.length}/500
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={!newMessage.trim() || isSubmitting}
                    size="sm"
                    className="volter-font bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/login'}
                  className="volter-font"
                >
                  Fazer login para comentar
                </Button>
              </div>
            )}
          </div>
        )}

        {isOwner && (
          <div className="text-xs text-gray-500 volter-font text-center border-t pt-2">
            Esta é sua home - visitantes podem deixar mensagens
          </div>
        )}
      </CardContent>
    </Card>
  );
};