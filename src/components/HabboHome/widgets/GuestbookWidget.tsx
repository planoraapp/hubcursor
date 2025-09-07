import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AlertTriangle } from 'lucide-react';

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
  replies?: GuestbookReply[];
}

interface GuestbookReply {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface GuestbookWidgetProps {
  homeOwnerId: string;
  guestbook: GuestbookEntry[];
  className?: string;
  onRefresh?: () => void;
  theme?: 'basic' | 'habbo';
}

export const GuestbookWidget: React.FC<GuestbookWidgetProps> = ({
  homeOwnerId,
  guestbook = [],
  className = '',
  onRefresh,
  theme = 'habbo'
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [newReply, setNewReply] = useState<{ [entryId: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { habboAccount } = useAuth();

  const handleSubmitMessage = async () => {
    if (!habboAccount || !newMessage.trim()) return;

    try {
      setLoading(true);
      console.log('📝 Enviando mensagem no guestbook...');

      const { error } = await supabase
        .from('guestbook_entries')
        .insert({
          home_owner_user_id: homeOwnerId,
          author_habbo_name: habboAccount.habbo_name,
          message: newMessage.trim(),
          moderation_status: 'approved'
        });

      if (!error) {
        setNewMessage('');
        onRefresh?.();
        console.log('✅ Mensagem enviada com sucesso');
      } else {
        console.error('❌ Erro ao enviar mensagem:', error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao enviar mensagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (entryId: string) => {
    const replyMessage = newReply[entryId];
    if (!habboAccount || !replyMessage?.trim()) return;

    try {
      setLoading(true);
      console.log('💬 Enviando resposta no guestbook...');

      const { error } = await supabase
        .from('guestbook_replies')
        .insert({
          guestbook_entry_id: entryId,
          author_habbo_name: habboAccount.habbo_name,
          message: replyMessage.trim(),
          moderation_status: 'approved'
        });

      if (!error) {
        setNewReply(prev => ({ ...prev, [entryId]: '' }));
        onRefresh?.();
        console.log('✅ Resposta enviada com sucesso');
      } else {
        console.error('❌ Erro ao enviar resposta:', error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao enviar resposta:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!habboAccount) return;

    try {
      setLoading(true);
      console.log('🗑️ Excluindo entrada do guestbook...');

      const { error } = await supabase
        .from('guestbook_entries')
        .delete()
        .eq('id', entryId);

      if (!error) {
        onRefresh?.();
        console.log('✅ Entrada excluída com sucesso');
      } else {
        console.error('❌ Erro ao excluir entrada:', error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao excluir entrada:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportEntry = async (entryId: string) => {
    if (!habboAccount) return;

    try {
      setLoading(true);
      console.log('🚨 Reportando entrada do guestbook...');

      const { error } = await supabase
        .from('guestbook_reports')
        .insert({
          guestbook_entry_id: entryId,
          reporter_habbo_name: habboAccount.habbo_name,
          reason: 'Conteúdo ofensivo',
          status: 'pending'
        });

      if (!error) {
        console.log('✅ Denúncia enviada com sucesso');
        alert('Denúncia enviada! A administração irá analisar o conteúdo.');
      } else {
        console.error('❌ Erro ao enviar denúncia:', error);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao enviar denúncia:', error);
    } finally {
      setLoading(false);
    }
  };

  // Versão básica (fallback)
  if (theme === 'basic') {
    return (
      <div className={`p-4 h-full bg-white/95 backdrop-blur-sm shadow-lg overflow-hidden ${className}`}>
        <div className="flex flex-col h-full">
          {/* Título */}
          <h4 className="font-volter font-bold text-black border-b pb-2 mb-3">
            📝 Livro de Visitas
          </h4>
          
          {/* Lista de mensagens */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-3">
            {guestbook.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <p className="font-volter">Seja o primeiro a deixar uma mensagem!</p>
              </div>
            ) : (
              guestbook.slice(0, 5).map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=s&headonly=1`}
                      alt={entry.author_habbo_name}
                      className="w-6 h-6 rounded object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=s`;
                      }}
                    />
                    <a
                      href={`/homes/${entry.author_habbo_name}`}
                      className="font-volter text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {entry.author_habbo_name}
                    </a>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    
                    {/* Botões de ação */}
                    <div className="flex gap-1">
                      {/* Botão de denúncia */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReportEntry(entry.id);
                        }}
                        className="text-orange-500 hover:text-orange-700 text-xs px-1"
                        title="Denunciar conteúdo"
                      >
                        <AlertTriangle size={12} />
                      </button>
                      
                      {/* Botão de excluir (apenas para autor ou dono da home) */}
                      {(habboAccount?.habbo_name === entry.author_habbo_name || habboAccount?.habbo_name === homeOwnerId) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
                              handleDeleteEntry(entry.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 text-xs px-1"
                          title="Excluir comentário"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 ml-8 mb-2">{entry.message}</p>
                  
                  {/* Área de resposta */}
                  {habboAccount && (
                    <div className="ml-8 mt-2">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Responder..."
                          value={newReply[entry.id] || ''}
                          onChange={(e) => setNewReply(prev => ({ ...prev, [entry.id]: e.target.value }))}
                          className="text-xs resize-none flex-1"
                          rows={1}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(entry.id)}
                          disabled={!newReply[entry.id]?.trim() || loading}
                          className="text-xs px-2 py-1"
                        >
                          Responder
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Área para nova mensagem - apenas se não for o dono */}
          {habboAccount && habboAccount.habbo_name !== homeOwnerId && (
            <div className="border-t pt-3">
              <Textarea
                placeholder="Deixe sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="text-sm resize-none mb-2"
                rows={2}
              />
              <Button 
                size="sm" 
                className="w-full font-volter"
                disabled={!newMessage.trim() || loading}
                onClick={handleSubmitMessage}
              >
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </Button>
            </div>
          )}
          
          {!habboAccount && (
            <div className="text-xs text-gray-500 text-center py-2">
              Faça login para deixar uma mensagem
            </div>
          )}
        </div>
      </div>
    );
  }

  // Versão Habbo (design autêntico)
  return (
    <div className={`habbo-widget h-full overflow-hidden ${className}`} style={{ imageRendering: 'pixelated' }}>
      {/* Cabeçalho estilo Habbo */}
      <div className="habbo-header bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-blue-800 p-2 shadow-inner">
        <div className="flex items-center gap-2">
          <img 
            src="https://www.habbo.com/habbo-imaging/badge/badge_ACH_AllTimeHotelPresence1.gif"
            alt="Badge"
            className="w-6 h-6"
            style={{ imageRendering: 'pixelated' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <h4 className="font-volter font-bold text-white text-shadow-lg">
            📖 Livro de Visitas
          </h4>
        </div>
      </div>
      
      {/* Conteúdo com bordas pixeladas */}
      <div className="habbo-content bg-gradient-to-b from-yellow-100 to-yellow-200 border-2 border-yellow-800 p-3 h-full">
        {/* Lista de mensagens */}
        <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
          {guestbook.length === 0 ? (
            <div className="text-center text-gray-600 py-4">
              <p className="font-volter text-sm">Seja o primeiro a deixar uma mensagem!</p>
            </div>
          ) : (
            guestbook.slice(0, 5).map((entry) => (
              <div key={entry.id} className="habbo-message bg-white border-2 border-gray-400 p-2 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=s&headonly=1`}
                    alt={entry.author_habbo_name}
                    className="w-8 h-8 border border-gray-300"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=s`;
                    }}
                  />
                  <a
                    href={`/homes/${entry.author_habbo_name}`}
                    className="font-volter font-bold text-blue-600 hover:text-blue-800 transition-colors flex-1 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {entry.author_habbo_name}
                  </a>
                  <span className="text-xs text-gray-500 font-volter">
                    {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  
                  {/* Botões de ação */}
                  <div className="flex gap-1">
                    {/* Botão de denúncia */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportEntry(entry.id);
                      }}
                      className="habbo-button-small bg-orange-400 border border-orange-600 text-orange-800 hover:bg-orange-500 px-1 py-0.5 text-xs font-volter"
                      title="Denunciar conteúdo"
                    >
                      ⚠
                    </button>
                    
                    {/* Botão de excluir (apenas para autor ou dono da home) */}
                    {(habboAccount?.habbo_name === entry.author_habbo_name || habboAccount?.habbo_name === homeOwnerId) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
                            handleDeleteEntry(entry.id);
                          }
                        }}
                        className="habbo-button-small bg-red-400 border border-red-600 text-red-800 hover:bg-red-500 px-1 py-0.5 text-xs font-volter"
                        title="Excluir comentário"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 ml-10 font-volter">{entry.message}</p>
                
                {/* Área de resposta */}
                {habboAccount && (
                  <div className="ml-10 mt-2">
                    <div className="flex gap-2">
                      <textarea
                        placeholder="Responder..."
                        value={newReply[entry.id] || ''}
                        onChange={(e) => setNewReply(prev => ({ ...prev, [entry.id]: e.target.value }))}
                        className="habbo-input text-xs resize-none flex-1 p-1 border border-gray-400 font-volter"
                        rows={1}
                      />
                      <button
                        onClick={() => handleSubmitReply(entry.id)}
                        disabled={!newReply[entry.id]?.trim() || loading}
                        className="habbo-button bg-gradient-to-r from-green-400 to-green-600 border border-green-800 text-white px-2 py-1 text-xs font-volter font-bold hover:from-green-500 hover:to-green-700 disabled:opacity-50"
                      >
                        Responder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Área para nova mensagem - apenas se não for o dono */}
        {habboAccount && habboAccount.habbo_name !== homeOwnerId && (
          <div className="border-t-2 border-gray-400 pt-2">
            <textarea
              placeholder="Deixe sua mensagem..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="habbo-input w-full p-2 border-2 border-gray-400 font-volter text-sm resize-none mb-2"
              rows={2}
            />
            <button
              onClick={handleSubmitMessage}
              disabled={!newMessage.trim() || loading}
              className="habbo-button w-full bg-gradient-to-r from-green-400 to-green-600 border-2 border-green-800 text-white px-4 py-2 font-volter font-bold hover:from-green-500 hover:to-green-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Mensagem'}
            </button>
          </div>
        )}
        
        {!habboAccount && (
          <div className="text-xs text-gray-600 text-center py-2 font-volter">
            Faça login para deixar uma mensagem
          </div>
        )}
      </div>
    </div>
  );
};
