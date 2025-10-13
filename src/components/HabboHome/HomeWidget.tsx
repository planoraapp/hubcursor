
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingWidget } from './widgets/RatingWidget';
import { useIsMobile } from '@/hooks/use-mobile';
import type { 
  Widget, 
  HabboData, 
  GuestbookEntry, 
  HomeWidgetProps 
} from '@/types/habbo';

// Helper function to get country flag PNG from hotel
const getCountryFlagPng = (hotel: string): string => {
  const hotelFlags: Record<string, string> = {
    'com.br': '/flags/flagbrazil.png', 'br': '/flags/flagbrazil.png',
    'com': '/flags/flagcom.png', 'us': '/flags/flagcom.png',
    'es': '/flags/flagspain.png', 'com.es': '/flags/flagspain.png',
    'de': '/flags/flagdeus.png', 'com.de': '/flags/flagdeus.png',
    'fr': '/flags/flagfrance.png', 'com.fr': '/flags/flagfrance.png',
    'fi': '/flags/flafinland.png', 'com.fi': '/flags/flafinland.png',
    'it': '/flags/flagitaly.png', 'com.it': '/flags/flagitaly.png',
    'nl': '/flags/flagnetl.png', 'com.nl': '/flags/flagnetl.png',
    'com.tr': '/flags/flagtrky.png', 'tr': '/flags/flagtrky.png'
  };
  return hotelFlags[hotel.toLowerCase()] || '/flags/flagcom.png';
};

// Função para obter URL da skin do Supabase
const getSkinUrl = (skinName: string): string => {
  // URL do Supabase para as skins hospedadas
  return `https://qjqjqjqjqjqjqjqjqjqj.supabase.co/storage/v1/object/public/home-assets/skins/${skinName}`;
};

// Função para aplicar skin ao guestbook
const getGuestbookSkinStyle = (widget: Widget) => {
  const skinConfig = widget.config?.skin;
  if (skinConfig?.skinName) {
    return {
      backgroundImage: `url(${getSkinUrl(skinConfig.skinName)})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  }
  return {};
};

export const HomeWidget: React.FC<HomeWidgetProps> = ({
  widget,
  habboData,
  guestbook,
  isEditMode,
  isOwner,
  onRemove,
  onPositionChange,
  onUpdateConfig,
  onGuestbookSubmit,
  onGuestbookDelete,
  currentUser
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0, elementX: widget.x, elementY: widget.y });
  const [newMessage, setNewMessage] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isMobile = useIsMobile();

  const handleGuestbookSubmit = useCallback(async () => {
    console.log('🔍 [HomeWidget] handleGuestbookSubmit chamado:', {
      hasOnGuestbookSubmit: !!onGuestbookSubmit,
      message: newMessage,
      messageTrimmed: newMessage.trim(),
      currentUser,
      isOwner
    });
    
    if (!onGuestbookSubmit || !newMessage.trim()) {
            return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('📤 [HomeWidget] Enviando mensagem:', newMessage.trim());
      await onGuestbookSubmit(newMessage.trim());
            setNewMessage('');
    } catch (error) {
          } finally {
      setIsSubmitting(false);
    }
  }, [onGuestbookSubmit, newMessage, currentUser, isOwner]);

  const handleGuestbookDelete = useCallback(async (entryId: string) => {
        if (!onGuestbookDelete) {
            alert('Erro: Função de exclusão não disponível');
      return;
    }
    
    try {
            const result = await onGuestbookDelete(entryId);
          } catch (error) {
            alert(`Erro ao deletar mensagem: ${error.message || error}`);
    }
  }, [onGuestbookDelete, currentUser, isOwner]);

  const canDeleteEntry = useCallback((entry: GuestbookEntry) => {
    if (!currentUser) {
      console.log('🗑️ canDeleteEntry: currentUser não encontrado');
      return false;
    }
    
    const canDelete = isOwner || entry.author_habbo_name === currentUser.habbo_name;
    
    console.log('🗑️ canDeleteEntry:', {
      entryAuthor: entry.author_habbo_name,
      currentUserName: currentUser.habbo_name,
      isOwner,
      canDelete,
      match: entry.author_habbo_name === currentUser.habbo_name
    });
    
    return canDelete;
  }, [currentUser, isOwner]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
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
  }, [isEditMode, isOwner, widget.x, widget.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const canvasWidth = isMobile ? 768 : 1080;
      const canvasHeight = isMobile ? 1280 : 1800;
      const newX = Math.max(0, Math.min(canvasWidth - widget.width, dragStart.elementX + deltaX));
      const newY = Math.max(0, Math.min(canvasHeight - widget.height, dragStart.elementY + deltaY));
      
      onPositionChange(widget.id, newX, newY);
    }
  }, [isDragging, dragStart.x, dragStart.y, dragStart.elementX, dragStart.elementY, onPositionChange, widget.id, widget.width, widget.height, isMobile]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  React.useEffect(() => {
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
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const renderWidgetContent = () => {
    // Debug logs removidos para produção
    
    switch (widget.widget_type) {
      case 'avatar':
      case 'usercard':
      case 'profile':
        // Debug logs removidos para produção
        
        const hotel = habboData.hotel === 'br' ? 'com.br' : (habboData.hotel || 'com.br');
        const avatarUrl = `https://www.habbo.${hotel}/habbo-imaging/avatarimage?user=${habboData.habbo_name}&action=std&direction=4&head_direction=4&gesture=sml&size=m`;
        const flagUrl = getCountryFlagPng(habboData.hotel);
        
        // Formatar data do memberSince (apenas dados reais)
        const formatMemberSince = (memberSince: string) => {
          if (!memberSince) return 'Data não disponível';
          
          // Verificar se é uma data fictícia conhecida
          const fakeDates = [
            '2024-01-01T00:00:00.000Z',
            '2024-01-15',
            '2024',
            ''
          ];
          
          if (fakeDates.includes(memberSince)) {
            return 'Data não disponível';
          }
          
          try {
            const date = new Date(memberSince);
            
            // Verificar se é uma data válida e não muito antiga (antes de 2020)
            if (isNaN(date.getTime()) || date.getFullYear() < 2020) {
              return 'Data não disponível';
            }
            
            return date.toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          } catch {
            return 'Data não disponível';
          }
        };

        return (
          <div 
            className="widget w_skin_defaultskin relative"
            style={{
              width: '400px',
              height: '200px'
            }}
          >
            {/* Widget Body */}
            <div className="widget-body w-full h-full">
              <div className="widget-content flex items-center gap-4 p-6 h-full">
                {/* Informações do Usuário - Lado Esquerdo */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Nome do usuário com bandeira */}
                  <div className="flex items-center gap-2">
                    <img
                      src={flagUrl}
                      alt="Bandeira do país"
                      className="w-9 h-6 object-contain"
                    />
                    <h3 className="text-xl font-bold text-gray-900 truncate volter-font">
                      {habboData.habbo_name}
                    </h3>
                  </div>

                  {/* Motto - 2 linhas permitidas */}
                  <div>
                    <p className="text-sm text-gray-600 italic volter-font line-clamp-2 leading-tight">
                      "{habboData.motto || 'Sem motto definido'}"
                    </p>
                  </div>

                  {/* Status online/offline com GIFs */}
                  <div className="flex items-center gap-2">
                    <img 
                      src={habboData.is_online 
                        ? "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/online.gif"
                        : "https://wueccgeizznjmjgmuscy.supabase.co/storage/v1/object/public/home-assets/offline.gif"
                      }
                      alt={habboData.is_online ? "Online" : "Offline"}
                      className="w-16 h-4 object-contain"
                      style={{ imageRendering: 'pixelated' }}
                      onError={(e) => {
                        // Fallback para ícone simples se GIF falhar
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-2 h-2 rounded-full ${habboData.is_online ? 'bg-green-500' : 'bg-gray-400'}"></div>
                            <span class="text-xs font-medium volter-font ${habboData.is_online ? 'text-green-600' : 'text-gray-500'}">
                              ${habboData.is_online ? 'Online' : 'Offline'}
                            </span>
                          `;
                        }
                      }}
                    />
                  </div>

                  {/* Data de criação */}
                  <div>
                    <p className="text-[10px] text-gray-600 volter-font">
                      <span className="font-medium">Membro desde:</span>{' '}
                      {formatMemberSince(habboData.member_since || '')}
                    </p>
                  </div>
                </div>

                {/* Avatar do Habbo - Lado Direito */}
                <div className="flex-shrink-0">
                  <img
                    src={avatarUrl}
                    alt={`Avatar de ${habboData.habbo_name}`}
                    className="w-16 h-28 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                    onError={(e) => {
                      e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboData.habbo_name}&size=m&direction=4&head_direction=4&action=std&gesture=std`;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'guestbook':
        return (
          <div 
            className="widget w_skin_defaultskin relative flex flex-col"
            style={{
              ...getGuestbookSkinStyle(widget),
              width: '350px',
              height: '400px'
            }}
          >
            {/* Widget Corner - Cabeçalho */}
            <div className="widget-corner flex-shrink-0">
              <div className="widget-headline relative px-3 py-2">
                <h3 className="volter-font font-bold text-black text-sm m-0">
                  Guestbook ({guestbook.length})
                </h3>
              </div>
            </div>

            {/* Widget Body - Conteúdo Principal */}
            <div className="widget-body flex-1 flex flex-col relative overflow-hidden" style={{ paddingBottom: '60px' }}>
              {/* Área de Comentários - Scrollável */}
              <div 
                className="guestbook-content absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent" 
                style={{ 
                  padding: '8px',
                  paddingBottom: '68px'
                }}
              >
                  {guestbook.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', paddingTop: '20px' }}>
                      <p className="volter-font text-sm">No comments yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {guestbook
                        .slice()
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .slice(0, 15)
                        .map((entry) => (
                        <div key={entry.id} className="guestbook-entry p-2 border-b border-gray-200 last:border-b-0">
                          <div className="flex gap-2 items-start">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              <img
                                src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=s&headonly=1`}
                                alt={entry.author_habbo_name}
                                className="w-6 h-6 rounded object-contain"
                                style={{ imageRendering: 'pixelated' }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${entry.author_habbo_name}&action=std&direction=2&head_direction=3&gesture=sml&size=s`;
                                }}
                              />
                            </div>
                            
                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <a
                                  href={`/homes/${entry.author_habbo_name}`}
                                  className="volter-font text-xs font-bold text-blue-600 hover:text-blue-800"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {entry.author_habbo_name}
                                </a>
                                <div className="flex items-center gap-1">
                                  <span className="volter-font text-gray-500" style={{ fontSize: '10px' }}>
                                    {new Date(entry.created_at).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {canDeleteEntry(entry) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Tem certeza que deseja excluir este recado?')) {
                                          handleGuestbookDelete(entry.id);
                                        }
                                      }}
                                      className="group relative w-5 h-5 flex items-center justify-center"
                                      title="Excluir comentário"
                                    >
                                      <img 
                                        src="/assets/deletetrash.gif" 
                                        alt="Excluir"
                                        className="max-w-full max-h-full opacity-70 group-hover:opacity-100 transition-opacity duration-200 object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                        onMouseOver={(e) => {
                                          e.currentTarget.src = '/assets/deletetrash1.gif';
                                        }}
                                        onMouseOut={(e) => {
                                          e.currentTarget.src = '/assets/deletetrash.gif';
                                        }}
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-700 volter-font leading-relaxed break-words">
                                {entry.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              {/* Footer FIXO na borda inferior do widget */}
              <div 
                className="guestbook-footer border-t border-gray-200 bg-white flex-shrink-0" 
                style={{ 
                  padding: '8px',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 10
                }}
              >
                {currentUser ? (
                  <div className="flex gap-2 items-end">
                    <Textarea
                      placeholder="Add Comment..."
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        const textarea = e.target;
                        textarea.style.height = 'auto';
                        textarea.style.height = Math.min(textarea.scrollHeight, 50) + 'px';
                      }}
                      className="text-xs resize-none flex-1 min-h-[28px] max-h-[50px] overflow-y-auto volter-font border-gray-300"
                      rows={1}
                      disabled={isSubmitting}
                      style={{ 
                        height: '28px',
                        lineHeight: '1.2',
                        fontSize: '11px'
                      }}
                    />
                    <Button 
                      size="sm" 
                      className="volter-font h-[28px] w-[28px] p-0 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-xs"
                      disabled={!newMessage.trim() || isSubmitting}
                      onClick={handleGuestbookSubmit}
                      title={isSubmitting ? 'Enviando...' : 'Add Comment'}
                    >
                      {isSubmitting ? '⏳' : '📤'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="volter-font text-xs text-gray-500">
                      Faça login para comentar
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'rating':
        return (
          <RatingWidget
            homeOwnerId={habboData.supabase_user_id}
            className="w-full h-full"
          />
        );

      default:
        return (
          <div className="p-4 text-center">
            <p className="text-gray-500 volter-font">
              Widget: {widget.widget_type}
            </p>
          </div>
        );
    }
  };

  // Tamanhos padronizados por tipo de widget
  const getWidgetSize = () => {
    const standardSizes: Record<string, { width: string; height: string }> = {
      profile: { width: '400px', height: '200px' },
      avatar: { width: '400px', height: '200px' },
      usercard: { width: '400px', height: '200px' },
      guestbook: { width: '350px', height: '400px' },
      rating: { width: '200px', height: '180px' },
      badges: { width: '300px', height: '200px' },
      friends: { width: '300px', height: '300px' }
    };
    
    return standardSizes[widget.widget_type] || {
      width: `${widget.width}px`,
      height: `${widget.height}px`
    };
  };

  const widgetSize = getWidgetSize();
  
  const containerStyle = {
    left: widget.x,
    top: widget.y,
    width: widgetSize.width,
    height: widgetSize.height,
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
      {/* Botão de Remoção - Acima do widget (não exibir para widgets de perfil) */}
      {isEditMode && isOwner && widget.widget_type !== 'profile' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(widget.id);
          }}
          className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center transition-all z-30 opacity-50 hover:opacity-100"
          title="Remover Widget"
        >
          <img 
            src="/assets/Xis3.png" 
            alt="Remover" 
            className="w-full h-full object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </button>
      )}

      <Card 
        className={`w-full h-full backdrop-blur-sm shadow-lg overflow-hidden ${widget.config?.skin?.className || 'widget-skin-pillow'}`}
        style={{
          background: widget.config?.skin?.bgColor || '#f0f0f0',
          borderColor: widget.config?.skin?.borderColor || '#d0d0d0',
          color: widget.config?.skin?.textColor || '#333'
        }}
      >
        {renderWidgetContent()}
      </Card>

      {isDragging && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded pointer-events-none" />
      )}
    </div>
  );
};
