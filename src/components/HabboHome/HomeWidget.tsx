
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingWidget } from './widgets/RatingWidget';
import { useIsMobile } from '@/hooks/use-mobile';

interface Widget {
  id: string;
  widget_type: string;
  x: number;
  y: number;
  z_index: number;
  width: number;
  height: number;
  is_visible: boolean;
  config?: any;
}

interface HabboData {
  id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  motto: string;
  figure_string: string;
  is_online: boolean;
  memberSince?: string;
}

interface GuestbookEntry {
  id: string;
  author_habbo_name: string;
  message: string;
  created_at: string;
}

interface HomeWidgetProps {
  widget: Widget;
  habboData: HabboData;
  guestbook: GuestbookEntry[];
  isEditMode: boolean;
  isOwner: boolean;
  onRemove: (widgetId: string) => void;
  onPositionChange: (widgetId: string, x: number, y: number) => void;
  onGuestbookSubmit?: (message: string) => Promise<void>;
  onGuestbookDelete?: (entryId: string) => Promise<void>;
  currentUser?: {
    id: string;
    habbo_name: string;
  } | null;
}

// Helper function to get country flag PNG from hotel
const getCountryFlagPng = (hotel: string): string => {
  const hotelFlags: Record<string, string> = {
    'com.br': '/assets/flagbrazil.png', 'br': '/assets/flagbrazil.png',
    'com': '/assets/flagcom.png', 'us': '/assets/flagcom.png',
    'es': '/assets/flagspain.png', 'com.es': '/assets/flagspain.png',
    'de': '/assets/flagdeus.png', 'com.de': '/assets/flagdeus.png',
    'fr': '/assets/flagfrance.png', 'com.fr': '/assets/flagfrance.png',
    'fi': '/assets/flafinland.png', 'com.fi': '/assets/flafinland.png',
    'it': '/assets/flagitaly.png', 'com.it': '/assets/flagitaly.png',
    'nl': '/assets/flagnetl.png', 'com.nl': '/assets/flagnetl.png',
    'com.tr': '/assets/flagtrky.png', 'tr': '/assets/flagtrky.png'
  };
  return hotelFlags[hotel.toLowerCase()] || '/assets/flagcom.png';
};

export const HomeWidget: React.FC<HomeWidgetProps> = ({
  widget,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onRemove,
  onPositionChange,
  onGuestbookSubmit,
  onGuestbookDelete,
  currentUser
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, elementX: widget.x, elementY: widget.y });
  const [newMessage, setNewMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isMobile = useIsMobile();

  const handleGuestbookSubmit = async () => {
    console.log('🔍 [HomeWidget] handleGuestbookSubmit chamado:', {
      hasOnGuestbookSubmit: !!onGuestbookSubmit,
      message: newMessage,
      messageTrimmed: newMessage.trim(),
      currentUser,
      isOwner
    });
    
    if (!onGuestbookSubmit || !newMessage.trim()) {
      console.log('❌ [HomeWidget] Condições não atendidas para envio');
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('📤 [HomeWidget] Enviando mensagem:', newMessage.trim());
      await onGuestbookSubmit(newMessage.trim());
      console.log('✅ [HomeWidget] Mensagem enviada com sucesso');
      setNewMessage('');
    } catch (error) {
      console.error('❌ [HomeWidget] Erro ao enviar mensagem:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestbookDelete = async (entryId: string) => {
    console.log('🗑️ [HomeWidget] handleGuestbookDelete chamado:', {
      entryId,
      hasOnGuestbookDelete: !!onGuestbookDelete,
      currentUser: currentUser?.habbo_name,
      isOwner,
      onGuestbookDeleteType: typeof onGuestbookDelete
    });
    
    if (!onGuestbookDelete) {
      console.error('❌ [HomeWidget] onGuestbookDelete não está definido');
      alert('Erro: Função de exclusão não disponível');
      return;
    }
    
    try {
      console.log('🗑️ [HomeWidget] Chamando onGuestbookDelete...');
      const result = await onGuestbookDelete(entryId);
      console.log('✅ [HomeWidget] Mensagem deletada com sucesso:', result);
    } catch (error) {
      console.error('❌ [HomeWidget] Erro ao deletar mensagem:', error);
      alert(`Erro ao deletar mensagem: ${error.message || error}`);
    }
  };

  const canDeleteEntry = (entry: GuestbookEntry) => {
    console.log('🔍 [HomeWidget] canDeleteEntry chamado:', {
      entry: entry.author_habbo_name,
      currentUser: currentUser?.habbo_name,
      isOwner,
      canDelete: !currentUser ? false : (isOwner || entry.author_habbo_name === currentUser.habbo_name)
    });
    
    if (!currentUser) return false;
    return isOwner || entry.author_habbo_name === currentUser.habbo_name;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditMode || !isOwner) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: widget.x,
      elementY: widget.y
    });
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const canvasWidth = isMobile ? 768 : 1080;
        const canvasHeight = isMobile ? 1280 : 1800;
        const newX = Math.max(0, Math.min(canvasWidth - widget.width, dragStart.elementX + deltaX));
        const newY = Math.max(0, Math.min(canvasHeight - widget.height, dragStart.elementY + deltaY));
        
        onPositionChange(widget.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    };
  }, [isDragging, dragStart, onPositionChange, widget]);

  const renderWidgetContent = () => {
    // Debug: Verificar estado do usuário
    console.log('🔍 [HomeWidget] Debug currentUser:', { 
      currentUser, 
      isOwner, 
      hasCurrentUser: !!currentUser,
      currentUserType: typeof currentUser,
      currentUserHabboName: currentUser?.habbo_name,
      widgetType: widget.widget_type
    });
    
    switch (widget.widget_type) {
      case 'avatar':
      case 'usercard':
        const hotel = habboData.hotel === 'br' ? 'com.br' : (habboData.hotel || 'com.br');
        const avatarUrl = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${habboData.habbo_name}&action=std&direction=4&head_direction=4&gesture=sml&size=l`;
        const flagUrl = getCountryFlagPng(habboData.hotel);
        
        // Formatar data do memberSince
        const formatMemberSince = (memberSince: string) => {
          if (!memberSince) return 'Criado em: 2021';
          try {
            const date = new Date(memberSince);
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `Criado em: ${day}/${month}/${year}`;
          } catch {
            return 'Criado em: 2021';
          }
        };
        
        return (
          <div className="flex gap-3 p-4 h-full">
            {/* Avatar - proporção 64x110 */}
            <div className="flex-shrink-0">
              <img
                src={avatarUrl}
                alt={`${habboData.habbo_name} avatar`}
                className="w-16 h-28 object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${habboData.habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=l`;
                }}
              />
            </div>
            
            {/* Informações do usuário - layout vertical organizado */}
            <div className="flex-1 flex flex-col justify-start pt-1 min-w-0">
              {/* Linha 1: Bandeira + Nome + Status online/offline */}
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src={flagUrl}
                  alt={`${habboData.hotel} flag`}
                  className="w-4 h-3 flex-shrink-0"
                  style={{ imageRendering: 'pixelated' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/flagcom.png';
                  }}
                />
                <h3 className="text-sm font-bold text-gray-800 truncate flex-1 font-volter">
                  {habboData.habbo_name}
                </h3>
                <div className="flex-shrink-0" title={habboData.is_online ? 'Online' : 'Offline'}>
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    habboData.is_online ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                </div>
              </div>
              
              {/* Linha 2: Motto em itálico */}
              {habboData.motto && (
                <p className="text-xs text-gray-600 italic mb-2 line-clamp-2 font-volter">
                  "{habboData.motto}"
                </p>
              )}
              
              {/* Linha 3: Data de criação formatada */}
              <p className="text-xs text-gray-500 font-volter">
                {formatMemberSince(habboData.memberSince || '')}
              </p>
            </div>
          </div>
        );

      case 'guestbook':
        return (
          <div className="flex flex-col h-full">
            {/* Cabeçalho fixo */}
            <div className="p-4 border-b flex-shrink-0">
              <h4 className="font-volter font-bold text-black">
                📝 Livro de Visitas
              </h4>
            </div>
            
            {/* Área de mensagens com scroll */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
              {guestbook.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <p className="font-volter">Seja o primeiro a deixar uma mensagem!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Ordenar mensagens cronologicamente (mais recentes primeiro) */}
                  {guestbook
                    .slice()
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 10)
                    .map((entry) => (
                    <div key={entry.id} className="py-2">
                      <div className="flex gap-3">
                        {/* Avatar à esquerda */}
                        <div className="flex-shrink-0">
                            <img
                              src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=m&headonly=1`}
                              alt={entry.author_habbo_name}
                              className="w-12 h-12 rounded object-contain"
                              style={{ imageRendering: 'pixelated' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://www.habbo.com/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=m`;
                              }}
                            />
                        </div>
                        
                        {/* Conteúdo à direita */}
                        <div className="flex-1 min-w-0">
                          {/* Nome clicável e data */}
                          <div className="flex items-center justify-between mb-1">
                            <a
                              href={`/homes/${entry.author_habbo_name}`}
                              className="font-volter text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {entry.author_habbo_name}
                            </a>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                              </span>
                                {canDeleteEntry(entry) && (
                                  <button
                                    onClick={(e) => {
                                      console.log('🖱️ [HomeWidget] Botão de exclusão clicado:', {
                                        entryId: entry.id,
                                        entryAuthor: entry.author_habbo_name,
                                        currentUser: currentUser?.habbo_name,
                                        isOwner,
                                        canDelete: canDeleteEntry(entry)
                                      });
                                      e.stopPropagation();
                                      if (window.confirm('Tem certeza que deseja excluir este recado?\n\nEsta ação não pode ser desfeita.')) {
                                        console.log('✅ [HomeWidget] Usuário confirmou exclusão, chamando handleGuestbookDelete');
                                        try {
                                          handleGuestbookDelete(entry.id);
                                        } catch (error) {
                                          console.error('❌ [HomeWidget] Erro ao chamar handleGuestbookDelete:', error);
                                        }
                                      } else {
                                        console.log('❌ [HomeWidget] Usuário cancelou exclusão');
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs px-1 rounded hover:bg-red-50"
                                    title="Excluir comentário"
                                  >
                                    ×
                                  </button>
                                )}
                            </div>
                          </div>
                          
                          {/* Mensagem */}
                          <p className="text-sm text-gray-700 font-volter leading-relaxed">
                            {entry.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Área de mensagem fixa na parte inferior */}
            <div className="border-t p-4 flex-shrink-0 bg-white">
              {/* Área para nova mensagem - para usuários logados (incluindo o dono) */}
              {currentUser && (
                <div className="flex gap-2 items-end">
                  <Textarea
                    placeholder="Deixe um recado"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      // Auto-scroll para baixo quando o texto cresce
                      const textarea = e.target;
                      textarea.style.height = 'auto';
                      textarea.style.height = textarea.scrollHeight + 'px';
                    }}
                    className="text-sm resize-none flex-1 min-h-[40px] max-h-[120px] overflow-y-auto"
                    rows={1}
                    disabled={isSubmitting}
                    style={{ 
                      height: '40px',
                      lineHeight: '1.2'
                    }}
                  />
                  <Button 
                    size="sm" 
                    className="font-volter h-[40px] w-[40px] p-0 flex items-center justify-center"
                    disabled={!newMessage.trim() || isSubmitting}
                    onClick={handleGuestbookSubmit}
                    title={isSubmitting ? 'Enviando...' : (isOwner ? 'Deixar Recado' : 'Enviar Mensagem')}
                  >
                    {isSubmitting ? '⏳' : '📤'}
                  </Button>
                </div>
              )}

              {/* Mensagem para usuários não logados */}
              {!currentUser && (
                <div className="text-center">
                  <p className="text-sm text-gray-500 font-volter">
                    Faça login para deixar uma mensagem
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'rating':
        return (
          <RatingWidget
            homeOwnerId={habboData.id}
            className="w-full h-full"
          />
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-gray-500 font-volter">
              Widget: {widget.widget_type}
            </p>
          </div>
        );
    }
  };

  const containerStyle = {
    left: widget.x,
    top: widget.y,
    width: widget.width,
    height: widget.height,
    zIndex: isDragging ? 9999 : widget.z_index,
    opacity: isDragging ? 0.8 : 1,
    transform: isDragging ? 'scale(1.02)' : 'scale(1)',
    transition: isDragging ? 'none' : 'all 0.2s ease-out'
  };

  return (
    <div
      className={`absolute ${isEditMode && isOwner ? 'cursor-move' : 'cursor-default'}`}
      style={containerStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Botão de Remoção - Acima do widget */}
      {isEditMode && isOwner && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(widget.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex items-center justify-center shadow-lg z-30 border-2 border-white"
          title="Remover Widget"
        >
          ×
        </button>
      )}

      <Card className="h-full bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black overflow-hidden">
        {renderWidgetContent()}
      </Card>

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
