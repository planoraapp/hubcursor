import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Send, Edit3 } from 'lucide-react';

interface ACMAnotepadEntry {
  id: string;
  message: string;
  author_habbo_name: string;
  created_at: string;
}

interface ACMAnotepadWidgetProps {
  entries?: ACMAnotepadEntry[];
  onAddEntry?: (message: string) => void;
  isOwner?: boolean;
  className?: string;
}

export const ACMAnotepadWidget: React.FC<ACMAnotepadWidgetProps> = ({ 
  entries = [], 
  onAddEntry, 
  isOwner = false,
  className = ''
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting || !onAddEntry) return;

    setIsSubmitting(true);
    try {
      await onAddEntry(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao adicionar mensagem no ACMA_notepad:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`w-full h-full ${className}`}
      style={{
        backgroundImage: 'url(https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/acma_notepad.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full h-full p-3 flex flex-col">
        {/* Área de mensagens */}
        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto flex-1">
          {entries.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-black volter-font font-bold">
                Nenhuma anotação ainda...
              </p>
              <p className="text-xs text-black volter-font">
                Seja o primeiro a deixar uma anotação!
              </p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="p-2">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-black volter-font">
                    {entry.author_habbo_name}
                  </span>
                  <span className="text-xs text-black volter-font">
                    {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm text-black volter-font font-medium leading-relaxed">
                  {entry.message}
                </p>
              </div>
            ))
          )}
        </div>
        
        {/* Formulário para nova mensagem */}
        {!isOwner && (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              placeholder="Digite sua anotação aqui..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="text-sm volter-font font-medium text-black border-0 resize-none focus:ring-0 focus:outline-none bg-transparent"
              rows={3}
              disabled={isSubmitting}
            />
            <Button 
              type="submit"
              size="sm" 
              disabled={!newMessage.trim() || isSubmitting}
              className="w-full volter-font font-bold bg-transparent hover:bg-black/10 text-black border-2 border-black"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {isSubmitting ? 'Salvando...' : 'Salvar Anotação'}
            </Button>
          </form>
        )}
        
        {/* Mensagem para não proprietários */}
        {!isOwner && (
          <div className="text-center py-2 mt-3">
            <p className="text-xs text-black volter-font font-medium">
              Faça login para deixar uma anotação
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
