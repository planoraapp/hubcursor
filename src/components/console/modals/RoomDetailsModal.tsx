import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, Star, Copy, Check } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface HabboRoom {
  id: string;
  name: string;
  description: string;
  ownerName?: string;
  ownerUniqueId?: string;
  rating?: number;
  maximumVisitors?: number;
  userCount?: number;
  tags?: string[];
  creationTime?: string;
  categoryId?: number;
  habboGroupId?: string;
}

interface RoomDetailsModalProps {
  roomId: string;
  hotelDomain: string;
  photoImageRef?: React.RefObject<HTMLImageElement>;
  isOpen: boolean;
  onClose: () => void;
}

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  roomId,
  hotelDomain,
  photoImageRef,
  isOpen,
  onClose
}) => {
  const { t } = useI18n();
  const [room, setRoom] = useState<HabboRoom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedRoomId, setCopiedRoomId] = useState(false);
  const [isCopyButtonExpanded, setIsCopyButtonExpanded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isThumbnailExpanded, setIsThumbnailExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [modalStyle, setModalStyle] = useState<React.CSSProperties>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingProgrammaticallyRef = useRef(false);

  // Extrair código do hotel do domínio (ex: com.br -> br, com.tr -> tr)
  const getHotelCode = (domain: string): string => {
    if (domain === 'com.br') return 'br';
    if (domain === 'com.tr') return 'tr';
    if (domain === 'com' || domain === 'us') return 'com';
    return domain;
  };

  const hotelCode = getHotelCode(hotelDomain);

  // Função para gerar URLs de thumbnail de quartos com múltiplos fallbacks
  const getRoomThumbnailUrls = (roomId: string, hotelCode: string) => {
    return [
      // URL real do S3 usado pelo Habbo oficial
      `https://habbo-stories-content.s3.amazonaws.com/navigator-thumbnail/hh${hotelCode}/${roomId}.png`,
      
      // URLs oficiais do Habbo para thumbnails de quartos
      `https://www.habbo.${hotelDomain}/habbo-imaging/roomimage/${roomId}`,
      `https://images.habbo.com/c_images/reception/room_icon_${roomId}.png`,
      
      // URLs alternativas do S3
      `https://habbo-stories-content.s3.amazonaws.com/room_thumbs/${roomId}.png`,
      `https://habbo-stories-content.s3.amazonaws.com/servercamera/rooms/${roomId}.png`,
      
      // URLs de fallback genéricas
      `https://images.habbo.com/c_images/reception/room_icon_default.png`,
      '/assets/mockroom.png',
      '/assets/home.png',
      '/placeholder.svg'
    ];
  };

  // Calcular posição e tamanho do modal baseado na foto
  // useLayoutEffect garante que o cálculo seja feito antes do paint, evitando movimento visual
  useLayoutEffect(() => {
    if (!isOpen || !photoImageRef?.current) {
      return;
    }

    const calculatePosition = () => {
      const photoImg = photoImageRef.current;
      if (!photoImg) return;

      const photoRect = photoImg.getBoundingClientRect();
      
      // Tamanho do modal: 10% menor que a foto
      const modalWidth = photoRect.width * 0.9;
      const modalHeight = photoRect.height * 0.9;
      
      // Posição centralizada horizontalmente e verticalmente, levemente abaixo do centro
      const left = photoRect.left + (photoRect.width - modalWidth) / 2;
      // Centralizar verticalmente e deslocar levemente para baixo (5% abaixo do centro)
      const verticalCenter = photoRect.top + (photoRect.height - modalHeight) / 2;
      const top = verticalCenter + (modalHeight * 0.05); // 5% abaixo do centro vertical (levemente abaixo)

      setModalStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${modalWidth}px`,
        maxHeight: `${modalHeight}px`,
        zIndex: 1 // Abaixo de todos os headers (z-index 10, 99, 100) - não sobrepõe background dos headers
      });
    };

    // Calcular imediatamente
    calculatePosition();
  }, [isOpen, photoImageRef]);

  // Recalcular posição no scroll e resize (usando useEffect normal para não bloquear o paint)
  useEffect(() => {
    if (!isOpen || !photoImageRef?.current) {
      return;
    }

    const calculatePosition = () => {
      const photoImg = photoImageRef.current;
      if (!photoImg) return;

      const photoRect = photoImg.getBoundingClientRect();
      const modalWidth = photoRect.width * 0.9;
      const modalHeight = photoRect.height * 0.9;
      const left = photoRect.left + (photoRect.width - modalWidth) / 2;
      // Centralizar verticalmente e deslocar levemente para baixo (5% abaixo do centro)
      const verticalCenter = photoRect.top + (photoRect.height - modalHeight) / 2;
      const top = verticalCenter + (modalHeight * 0.05); // 5% abaixo do centro vertical (levemente abaixo)

      setModalStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${modalWidth}px`,
        maxHeight: `${modalHeight}px`,
        zIndex: 1 // Abaixo de todos os headers (z-index 10, 99, 100) - não sobrepõe background dos headers
      });
    };
    
    // Recalcular no scroll e resize
    const handleScroll = () => calculatePosition();
    const handleResize = () => calculatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, photoImageRef]);

  // Buscar detalhes do quarto quando o modal abrir (usando Edge Function para evitar CORS)
  useEffect(() => {
    if (!isOpen || !roomId) {
      setRoom(null);
      return;
    }

    const fetchRoomDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('habbo-room-details', {
          body: {
            roomId: roomId,
            hotelDomain: hotelDomain
          }
        });

        if (error) {
          console.error('Erro ao buscar detalhes do quarto:', error);
          toast.error(t('messages.error'));
          onClose();
          return;
        }

        if (data) {
          setRoom(data as HabboRoom);
          
          // Tentar carregar thumbnail
          const thumbnailUrls = getRoomThumbnailUrls(roomId, hotelCode);
          setThumbnailUrl(thumbnailUrls[0]);
        } else {
          toast.error(t('messages.error'));
          onClose();
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes do quarto:', error);
        toast.error(t('messages.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomDetails();
  }, [isOpen, roomId, hotelDomain, hotelCode, onClose, t]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const copyRoomId = async () => {
    try {
      const roomIdText = `:roomid ${roomId}`;
      await navigator.clipboard.writeText(roomIdText);
      setCopiedRoomId(true);
      setIsCopyButtonExpanded(true);
      toast.success(t('messages.success'));
      
      // Limpar timeout anterior se existir
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      
      // Recolher botão após 3 segundos
      copyTimeoutRef.current = setTimeout(() => {
        setIsCopyButtonExpanded(false);
        setTimeout(() => setCopiedRoomId(false), 300); // Resetar estado após animação
      }, 3000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      toast.error(t('messages.error'));
    }
  };

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Listener para fechar modal ao clicar fora (sem bloquear scroll)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Não fechar se o clique foi no modal ou em seus filhos
      if (modalRef.current && modalRef.current.contains(target)) {
        return;
      }

      // Não fechar se o clique foi na foto (photoImageRef)
      if (photoImageRef?.current && photoImageRef.current.contains(target)) {
        return;
      }

      // Fechar o modal
      onClose();
    };

    // Adicionar listener com delay para não interferir com cliques no modal
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, photoImageRef]);

  // Listener para fechar modal ao fazer scroll (como no feed de fotos)
  useEffect(() => {
    if (!isOpen) return;

    let lastScrollTime = Date.now();
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Não fechar se o scroll foi causado programaticamente (centralização da foto)
      if (isScrollingProgrammaticallyRef.current) {
        return;
      }

      // Verificar se o scroll foi manual (usuário interagiu recentemente)
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime;
      
      // Se o scroll aconteceu muito rápido após o modal abrir, provavelmente é programático
      if (timeSinceLastScroll < 1200) {
        return;
      }

      // Fechar o modal quando o usuário faz scroll manual
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        onClose();
      }, 50); // Pequeno delay para evitar múltiplos fechamentos
      
      lastScrollTime = now;
    };

    // Delay antes de ativar o listener para evitar fechar durante scroll programático inicial
    const activationTimeout = setTimeout(() => {
      // Adicionar listener de scroll em todos os elementos scrolláveis
      const scrollableElements = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"], [class*="overflow-scroll"]');
      
      scrollableElements.forEach((element) => {
        element.addEventListener('scroll', handleScroll, { passive: true });
      });

      // Também adicionar no window para capturar scroll da página
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 1200); // Delay de 1.2 segundos para permitir scroll programático completar

    return () => {
      clearTimeout(activationTimeout);
      clearTimeout(scrollTimeout);
      const scrollableElements = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"], [class*="overflow-scroll"]');
      scrollableElements.forEach((element) => {
        element.removeEventListener('scroll', handleScroll);
      });
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, onClose]);

  // Marcar quando o scroll programático está acontecendo (para evitar fechar o modal)
  useEffect(() => {
    if (!isOpen) return;

    // Quando o modal abre, marcar que vamos fazer scroll programático
    isScrollingProgrammaticallyRef.current = true;
    
    // Após o scroll programático terminar (tempo suficiente para animação suave)
    const timeout = setTimeout(() => {
      isScrollingProgrammaticallyRef.current = false;
    }, 1200); // Tempo suficiente para scroll suave completar

    return () => {
      clearTimeout(timeout);
      isScrollingProgrammaticallyRef.current = false;
    };
  }, [isOpen]);

  const handleThumbnailError = () => {
    const thumbnailUrls = getRoomThumbnailUrls(roomId, hotelCode);
    const currentIndex = thumbnailUrls.indexOf(thumbnailUrl);
    
    if (currentIndex < thumbnailUrls.length - 1) {
      setThumbnailUrl(thumbnailUrls[currentIndex + 1]);
    } else {
      setThumbnailUrl('/assets/mockroom.png');
    }
  };

  // Não renderizar se não estiver aberto ou se não houver referência da foto
  if (!isOpen) {
    return null;
  }

  if (!photoImageRef?.current) {
    return null;
  }

  // Não renderizar até que a posição tenha sido calculada (evita movimento inicial)
  if (!modalStyle.left || !modalStyle.top) {
    return null;
  }

  return (
    <>
      
      {/* Modal renderizado dentro do container da foto */}
      <div
        ref={modalRef}
        className={cn(
          "p-0 bg-transparent border-0 overflow-hidden rounded-lg",
          "animate-slide-up-fade"
        )}
        style={{
          ...modalStyle,
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px',
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Borda superior amarela com textura pontilhada - compacta */}
        <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
          <div className="p-2 relative z-10">
            <div className="flex items-center gap-2 text-white font-bold text-xs" style={{
              textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
            }}>
              <Home className="w-4 h-4 text-white flex-shrink-0" />
              <span className="truncate">Detalhes do Quarto</span>
            </div>
          </div>
        </div>

        {/* Conteúdo principal com fundo de linhas horizontais - otimizado */}
        <div className="bg-gray-900 relative overflow-y-auto" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
          backgroundSize: '100% 2px',
          maxHeight: 'calc(100% - 60px)' // Altura total menos o header
        }}>
          <div className="relative z-10 p-3 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="text-white/60 text-xs">Carregando...</div>
              </div>
            ) : room ? (
              <>
                {/* Thumbnail do quarto - expansível */}
                <div 
                  className={cn(
                    "relative rounded overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 cursor-pointer",
                    isThumbnailExpanded ? "w-full h-[200px]" : "w-full h-24"
                  )}
                  onClick={() => setIsThumbnailExpanded(!isThumbnailExpanded)}
                >
                  <img
                    src={thumbnailUrl}
                    alt={room.name}
                    className={cn(
                      "object-cover transition-all duration-300",
                      isThumbnailExpanded ? "w-full h-full min-h-[200px]" : "h-24 w-full"
                    )}
                    onError={handleThumbnailError}
                  />
                  
                  {/* Tags sobrepostas no canto inferior direito */}
                  {room.tags && room.tags.length > 0 && (
                    <div className="absolute bottom-1.5 right-1.5 flex flex-wrap gap-1 justify-end max-w-[70%]">
                      {room.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="text-[10px] bg-gray-700/90 border-white/30 text-white px-1.5 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {room.tags.length > 3 && (
                        <Badge variant="outline" className="text-[10px] bg-gray-700/90 border-white/30 text-white/80 px-1.5 py-0">
                          +{room.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Botão de copiar room id - abaixo da foto quando expandida */}
                {isThumbnailExpanded && (
                  <div className="flex justify-end pt-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyRoomId();
                      }}
                      className={cn(
                        "h-7 px-2.5 text-xs transition-all duration-300 overflow-hidden whitespace-nowrap",
                        copiedRoomId || isCopyButtonExpanded
                          ? "bg-green-600/80 hover:bg-green-600/90 text-white px-3"
                          : "bg-black/70 hover:bg-black/90 text-white"
                      )}
                    >
                      {copiedRoomId || isCopyButtonExpanded ? (
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3 h-3" />
                          <span className="text-[10px]">:roomid {room.id}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Copy className="w-3 h-3" />
                          Copiar ID
                        </span>
                      )}
                    </Button>
                  </div>
                )}

                {/* Nome e Descrição - compacto (recolhido quando thumbnail expandido, mas sempre visível quando descrição expandida) */}
                <div className={cn(
                  "space-y-1 transition-all duration-300",
                  isThumbnailExpanded ? "max-h-0 opacity-0 overflow-hidden" : isDescriptionExpanded ? "max-h-[500px] opacity-100" : "max-h-40 opacity-100 overflow-hidden"
                )}>
                  <div className="flex items-start justify-between gap-2 relative">
                    <div className="flex-1 min-w-0">
                      <h3 
                        className={cn(
                          "font-semibold text-sm text-white leading-tight cursor-pointer hover:text-white/90 transition-colors",
                          isDescriptionExpanded ? "" : "line-clamp-2"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (room.description) {
                            setIsDescriptionExpanded(!isDescriptionExpanded);
                          }
                        }}
                      >{room.name}</h3>
                      {room.description && (
                        <div 
                          className={cn(
                            "mt-0.5 transition-all duration-300",
                            isDescriptionExpanded 
                              ? "max-h-[400px] overflow-y-auto pr-1 custom-scrollbar" 
                              : "overflow-hidden"
                          )}
                        >
                          <p 
                            className={cn(
                              "text-xs text-white/60 cursor-pointer hover:text-white/80 transition-colors break-words",
                              isDescriptionExpanded ? "" : "line-clamp-1"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDescriptionExpanded(!isDescriptionExpanded);
                            }}
                          >
                            {room.description}
                          </p>
                        </div>
                      )}
                    </div>
                    {/* Botão de copiar - expandível para a esquerda */}
                    <div className="relative flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyRoomId();
                        }}
                        className={cn(
                          "h-6 text-xs flex-shrink-0 transition-all duration-300 overflow-hidden whitespace-nowrap",
                          isCopyButtonExpanded 
                            ? "px-3 bg-green-600/80 hover:bg-green-600/90 text-white relative" 
                            : "px-2 text-white/60 hover:text-white hover:bg-white/10"
                        )}
                        style={isCopyButtonExpanded ? { zIndex: 10000 } : {}}
                      >
                        {isCopyButtonExpanded ? (
                          <span className="flex items-center gap-1.5">
                            <Check className="w-3 h-3" />
                            <span className="text-[10px]">:roomid {room.id}</span>
                          </span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Estatísticas - layout compacto em grid 3 colunas (recolhido quando thumbnail ou descrição expandidos) */}
                <div className={cn(
                  "grid grid-cols-3 gap-2 pt-1 border-t border-white/10 transition-all duration-300 overflow-hidden",
                  (isThumbnailExpanded || isDescriptionExpanded) ? "max-h-0 opacity-0 pt-0 border-t-0" : "max-h-96 opacity-100"
                )}>
                  {/* Coluna 1: Lotação */}
                  {room.maximumVisitors !== undefined && (
                    <div className="flex items-center gap-1.5">
                      <img 
                        src="/assets/roomuserlimit.png" 
                        alt="Lotação" 
                        className="w-3.5 h-3.5 flex-shrink-0"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-white/50 leading-none">Lotação</div>
                        <div className="text-xs font-medium text-white leading-tight truncate">{room.maximumVisitors}</div>
                      </div>
                    </div>
                  )}

                  {/* Coluna 2: Avaliação */}
                  {room.rating !== undefined && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-white/50 leading-none">Avaliação</div>
                        <div className="text-xs font-medium text-white leading-tight truncate">{room.rating}</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Coluna 3: ID */}
                  <div className="flex items-center gap-1.5 min-w-0 justify-end">
                    <div className="min-w-0 flex-1 text-right">
                      <div className="text-[10px] text-white/50 leading-none">ID</div>
                      <div className="text-xs font-medium text-white leading-tight truncate">{room.id}</div>
                    </div>
                  </div>

                  {/* Linha 2: Proprietário e Criado em lado a lado */}
                  {room.ownerName && (
                    <div className="col-span-2">
                      <div className="text-[10px] text-white/50 leading-none">Proprietário</div>
                      <div className="text-xs font-medium text-white truncate">{room.ownerName}</div>
                    </div>
                  )}

                  {room.creationTime && (
                    <div className={room.ownerName ? "col-span-1" : "col-span-3"}>
                      <div className="text-[10px] text-white/50 leading-none">Criado em</div>
                      <div className="text-xs font-medium text-white">{formatDate(room.creationTime)}</div>
                    </div>
                  )}
                </div>

              </>
            ) : (
              <div className="text-center py-6 text-white/60 text-xs">
                Quarto não encontrado
              </div>
            )}
          </div>
        </div>

        {/* Borda inferior amarela com textura pontilhada */}
        <div className="bg-yellow-400 border-2 border-black border-t-0 rounded-b-lg relative overflow-hidden" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '8px 8px'
        }}>
          <div className="pixel-pattern absolute inset-0 opacity-20"></div>
        </div>
      </div>
    </>
  );
};

