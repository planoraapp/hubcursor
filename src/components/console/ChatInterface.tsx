import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, MoreVertical, AlertCircle, Ban, Flag, ChevronLeft, X } from 'lucide-react';
import { useChat, Conversation } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  friends: any[];
  onNavigateToProfile: (username: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ friends, onNavigateToProfile }) => {
  const { habboAccount } = useAuth();
  const userId = habboAccount?.id;
  
  const { 
    conversations, 
    currentChat, 
    messages, 
    isLoading,
    blockedUsers,
    fetchMessages,
    findUserByName,
    sendMessage, 
    blockUser,
    unblockUser,
    reportMessage,
    setCurrentChat
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [showSecurityWarning, setShowSecurityWarning] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Usar apenas dados reais - sem mocks
  const displayConversations = conversations;
  const displayMessages = messages;

  // Filtrar conversas
  const filteredConversations = displayConversations.filter(conv =>
    conv.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = displayConversations.find(c => c.userId === currentChat) || (currentChat ? {
    userId: currentChat,
    username: 'Carregando...',
    figureString: undefined,
    lastMessage: '',
    lastMessageTime: new Date().toISOString(),
    unreadCount: 0,
    isOnline: false
  } : null);
  
  const isUserBlocked = currentChat && blockedUsers.includes(currentChat);

  // Função para iniciar conversa com um usuário (exposta globalmente)
  const startConversationWith = async (habboName: string) => {
    const user = await findUserByName(habboName);
    
    if (!user) {
      alert('⚠️ O usuário ainda não se cadastrou, que tal convidá-lo? :)');
      return false;
    }
    
    setCurrentChat(user.id);
    await fetchMessages(user.id);
    return true;
  };

  // Expor função globalmente para ser usada pelo botão "Mensagem"
  useEffect(() => {
    (window as any).startChatWith = startConversationWith;
    return () => {
      delete (window as any).startChatWith;
    };
  }, [findUserByName]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;
    
    await sendMessage(currentChat, newMessage);
    setNewMessage('');
  };

  const handleReportMessage = async () => {
    if (!reportingMessageId || !reportReason.trim()) return;

    await reportMessage(reportingMessageId, reportReason);
    setShowReportModal(false);
    setReportingMessageId(null);
    setReportReason('');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 10) return 'Agora mesmo';
    if (diffSecs < 60) return `${diffSecs} segundos atrás`;
    if (diffMins < 60) return `${diffMins} minuto${diffMins > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-hidden">
      {/* Campo de busca - apenas quando não está em uma conversa */}
      {!currentChat && (
        <div className="p-3 border-b border-white/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar conversas ou mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
            />
          </div>
        </div>
      )}

      {!currentChat ? (
        /* Lista de conversas */
        <div className="flex-1 overflow-y-auto scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
          {filteredConversations.length > 0 ? (
            <div className="space-y-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => {
                    setCurrentChat(conv.userId);
                    fetchMessages(conv.userId);
                  }}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors relative"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${conv.username}&size=m&direction=2&head_direction=3&headonly=1`}
                      alt={conv.username}
                      className="w-12 h-12 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-3 h-3 border border-white rounded-full",
                      conv.isOnline ? "bg-green-500" : "bg-gray-500"
                    )}></div>
                  </div>

                  {/* Info da conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white truncate">{conv.username}</span>
                      <span className="text-xs text-white/40">{formatTime(conv.lastMessageTime)}</span>
                    </div>
                    <p className="text-sm text-white/60 truncate">{conv.lastMessage}</p>
                  </div>

                  {/* Badge de não lidas */}
                  {conv.unreadCount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-white/60">
                <p className="text-sm">Nenhuma conversa encontrada</p>
                <p className="text-xs mt-2">Envie mensagens para seus amigos!</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Área de conversa ativa */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header da conversa */}
          <div className="p-2 border-b border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => setCurrentChat(null)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <img
                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${selectedConversation?.username}&size=m&direction=2&head_direction=3&headonly=1`}
                alt={selectedConversation?.username}
                className="w-8 h-8 object-contain cursor-pointer"
                style={{ imageRendering: 'pixelated' }}
                onClick={() => onNavigateToProfile(selectedConversation?.username || '')}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white truncate cursor-pointer" onClick={() => onNavigateToProfile(selectedConversation?.username || '')}>
                  {selectedConversation?.username}
                </div>
                <div className="text-xs text-white/60">
                  {selectedConversation?.isOnline ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
            </div>

            {/* Menu de ações */}
            <div className="relative">
              <button
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showActionsMenu && (
                <div className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/20 rounded-lg p-2 min-w-[160px] z-50 space-y-1">
                  <button
                    onClick={() => {
                      onNavigateToProfile(selectedConversation?.username || '');
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Ver Perfil
                  </button>
                  <button
                    onClick={() => {
                      setShowReportModal(true);
                      setReportingMessageId('conversation');
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded flex items-center gap-2 text-amber-400"
                  >
                    <Flag className="w-4 h-4" />
                    Denunciar Conversa
                  </button>
                  <button
                    onClick={() => {
                      if (currentChat) {
                        isUserBlocked ? unblockUser(currentChat) : blockUser(currentChat);
                      }
                      setShowActionsMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 rounded flex items-center gap-2 text-red-400"
                  >
                    <Ban className="w-4 h-4" />
                    {isUserBlocked ? 'Desbloquear' : 'Bloquear Usuário'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
            {isUserBlocked ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white/60">
                  <Ban className="w-12 h-12 mx-auto mb-2 text-red-400" />
                  <p className="text-sm font-semibold">Usuário Bloqueado</p>
                  <p className="text-xs mt-1">Você bloqueou este usuário</p>
                </div>
              </div>
            ) : displayMessages.length > 0 ? (
              displayMessages.map((msg) => {
                const isOwn = msg.sender_id === userId;
                const shouldShow = isOwn ? !msg.deleted_by_sender : !msg.deleted_by_receiver;

                if (!shouldShow) return null;

                return (
                  <div key={msg.id} className={cn("flex gap-2 w-full", isOwn ? "flex-row-reverse" : "flex-row")}>
                    {/* Avatar */}
                    <img
                      src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${isOwn ? (habboAccount?.habbo_name || 'Beebop') : selectedConversation?.username}&size=m&direction=${isOwn ? 7 : 1}&head_direction=${isOwn ? 7 : 1}&headonly=1`}
                      alt={isOwn ? 'YOU' : selectedConversation?.username}
                      className="w-8 h-8 object-contain flex-shrink-0 self-end"
                      style={{ imageRendering: 'pixelated' }}
                    />

                    {/* Balão de mensagem e timestamp */}
                    <div className={cn("flex flex-col flex-1", isOwn ? "items-end" : "items-start")}>
                      <div className="relative w-full">
                        <div
                          className={cn(
                            "relative px-3 py-2 rounded-lg text-sm break-words whitespace-pre-wrap",
                            isOwn ? "bg-white text-gray-800" : "bg-white text-gray-800"
                          )}
                        >
                          {msg.message}
                          
                          {/* Triângulo do balão */}
                          <div
                            className={cn(
                              "absolute top-1 w-0 h-0",
                              isOwn
                                ? "right-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[5px] border-l-white translate-x-full"
                                : "left-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-white -translate-x-full"
                            )}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <span className="text-xs text-white/40 mt-0.5">
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white/60">
                  <p className="text-sm">Nenhuma mensagem ainda</p>
                  <p className="text-xs mt-1">Seja o primeiro a enviar!</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Aviso de segurança */}
          {!isUserBlocked && showSecurityWarning && (
            <div className="px-3 py-1.5 bg-blue-500/10 border-t border-blue-500/20 relative">
              <p className="text-xs text-blue-200/80 flex items-center gap-2 pr-6">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                Todas as mensagens ficam registradas para sua segurança. Denúncias são analisadas pela moderação.
              </p>
              <button
                onClick={() => setShowSecurityWarning(false)}
                className="absolute top-1/2 right-2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded text-blue-200/60 hover:text-blue-200"
                title="Fechar aviso"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input de mensagem */}
          {!isUserBlocked && (
            <div className="p-2 border-t border-white/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40"
                  disabled={isUserBlocked}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isUserBlocked}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de denúncia */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md p-4 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Flag className="w-5 h-5 text-amber-400" />
              Denunciar Mensagem
            </h3>
            
            <p className="text-sm text-white/60 mb-3">
              Descreva o motivo da denúncia. Nossa equipe irá analisar.
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Ex: Conteúdo ofensivo, spam, etc..."
              className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 resize-none"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportingMessageId(null);
                  setReportReason('');
                }}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReportMessage}
                disabled={!reportReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-white/10 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Enviar Denúncia
              </button>
            </div>

            <p className="text-xs text-white/40 mt-3 text-center">
              ⚠️ Denúncias falsas podem resultar em punições
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

