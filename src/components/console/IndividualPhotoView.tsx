import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Send, MapPin } from 'lucide-react';
import { EnhancedPhoto } from '@/types/habbo';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { useCommentRateLimit } from '@/hooks/useCommentRateLimit';
import { validateComment, sanitizeComment, COMMENT_CONFIG } from '@/utils/commentValidation';
import { getAvatarHeadUrl, getAvatarFallbackUrl } from '@/utils/avatarHelpers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { RoomDetailsModal } from './modals/RoomDetailsModal';
import { useCompleteProfile } from '@/hooks/useCompleteProfile';

interface IndividualPhotoViewProps {
  photo: {
    id: string;
    imageUrl: string;
    date: string;
    likes: number;
    roomName?: string;
    roomId?: string | number;
    s3_url?: string;
    preview_url?: string;
    hotel?: string;
    hotelDomain?: string;
    caption?: string;
    timestamp?: number;
  };
  userName: string;
  onBack: () => void;
  onUserClick?: (userName: string) => void;
}

export const IndividualPhotoView: React.FC<IndividualPhotoViewProps> = ({
  photo,
  userName,
  onBack,
  onUserClick = () => {}
}) => {
  const { t } = useI18n();
  const { habboAccount } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLikesPopover, setShowLikesPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const photoImageRef = React.useRef<HTMLImageElement>(null);
  const [photoWidth, setPhotoWidth] = useState<number | null>(null);
  const commentFormRef = React.useRef<HTMLDivElement>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomHotel, setSelectedRoomHotel] = useState<string>('');
  const [roomDisplayName, setRoomDisplayName] = useState<string | null>(null);
  
  // Hook de likes com armazenamento no banco
  const { likesCount, userLiked, toggleLike, isToggling, likes } = usePhotoLikes(photo.id);
  
  // Hook de comentários com armazenamento no banco
  const { 
    comments,
    commentsCount, 
    lastTwoComments,
    addComment,
    deleteComment,
    canDeleteComment,
    isAddingComment,
    isDeletingComment
  } = usePhotoComments(photo.id, userName);
  
  // Rate limiting
  const { checkCanComment, recordComment } = useCommentRateLimit();
  
  /**
   * Extrai o código do hotel da URL da foto (fonte de verdade)
   * Exemplo: .../hhfi/... → 'fi', .../hhfr/... → 'fr'
   */
  const extractHotelFromPhotoUrl = (url?: string): string | null => {
    if (!url) return null;
    
    // Padrão: hhXX onde XX é o código do hotel
    const match = url.match(/\/hh([a-z]{2})\//);
    if (match && match[1]) {
      return match[1];
    }
    
    return null;
  };

  /**
   * Converte código do hotel para domínio de API
   */
  const hotelCodeToDomain = (code: string): string => {
    if (code === 'br') return 'com.br';
    if (code === 'tr') return 'com.tr';
    if (code === 'us' || code === 'com') return 'com';
    return code; // es, fr, de, it, nl, fi já são domínios corretos
  };

  /**
   * Valida se uma string é um domínio válido (não é um uniqueId)
   */
  const isValidHotelDomain = (domain: string | undefined): boolean => {
    if (!domain) return false;
    // UniqueId geralmente começa com 'hh' seguido de código de hotel e hífen, e tem muitos caracteres
    // Domínios válidos são: com.br, com.tr, com, es, fr, de, it, nl, fi
    // Rejeitar se parecer um uniqueId (muito longo, tem hífens no meio, começa com hh seguido de código e hífen)
    if (domain.length > 20) return false; // UniqueId geralmente é muito longo
    if (domain.match(/^hh[a-z]{2}-/)) return false; // Começa com hhXX- (formato de uniqueId como hhbr-xxx)
    
    // Aceitar domínios válidos
    const validDomains = ['com.br', 'com.tr', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr', 'br', 'us'];
    if (validDomains.includes(domain)) return true;
    // Aceitar domínios com ponto (com.br, com.tr, etc)
    if (domain.includes('.') && (domain.endsWith('.br') || domain.endsWith('.tr') || domain.endsWith('.com'))) return true;
    
    return false;
  };

  /**
   * Obtém o domínio do hotel da foto
   * Prioridade: 1) URL da foto (fonte de verdade), 2) hotelDomain do photo (validado), 3) hotel do photo (convertido), 4) fallback
   */
  const getPhotoHotelDomain = (): string => {
    // Prioridade 1: Tentar extrair da URL da foto (fonte de verdade, mais confiável)
    const photoUrl = photo.imageUrl || photo.s3_url || photo.preview_url;
    const hotelCodeFromUrl = extractHotelFromPhotoUrl(photoUrl);
    if (hotelCodeFromUrl) {
      return hotelCodeToDomain(hotelCodeFromUrl);
    }
    
    // Prioridade 2: Usar hotelDomain do photo, mas validar que não é um uniqueId
    if (photo.hotelDomain && isValidHotelDomain(photo.hotelDomain)) {
      // Se já contém ponto, já é um domínio completo
      if (photo.hotelDomain.includes('.')) {
        return photo.hotelDomain;
      }
      // Caso contrário, converter código para domínio
      return hotelCodeToDomain(photo.hotelDomain);
    }
    
    // Prioridade 3: Converter hotel (código) para domínio
    if (photo.hotel && isValidHotelDomain(photo.hotel)) {
      return hotelCodeToDomain(photo.hotel);
    }
    
    // Fallback padrão
    return 'com.br';
  };

  // Estado para armazenar roomId extraído
  const [extractedRoomId, setExtractedRoomId] = useState<string | null>(null);
  
  // Buscar nome do quarto quando houver roomName
  useEffect(() => {
    if (!photo.roomName) {
      setRoomDisplayName(null);
      setExtractedRoomId(null);
      return;
    }
    
    // Verificar se é um placeholder (ex: "Quarto do jogo")
    const isPlaceholder = photo.roomName.toLowerCase().includes('quarto do jogo') || 
                         photo.roomName.toLowerCase().includes('game room');
    
    if (isPlaceholder && !photo.roomId) {
      setRoomDisplayName(photo.roomName);
      setExtractedRoomId(null);
      return;
    }
    
    // Prioridade: 1) roomId direto, 2) extrair do roomName (ex: "Room 117037234" -> "117037234"), 3) tentar extrair qualquer número do roomName
    let roomId: string | null = null;
    
    if (photo.roomId) {
      // Usar roomId direto se disponível
      roomId = String(photo.roomId);
    } else {
      // Tentar extrair do formato "Room XXXXX"
      const roomIdMatch = photo.roomName.match(/Room\s+(\d+)/i);
      if (roomIdMatch) {
        roomId = roomIdMatch[1];
      } else {
        // Tentar extrair qualquer número do roomName (última tentativa)
        const numberMatch = photo.roomName.match(/(\d+)/);
        if (numberMatch) {
          roomId = numberMatch[1];
        }
      }
    }
    
    // Armazenar roomId extraído para uso no botão
    setExtractedRoomId(roomId);
    
    if (!roomId) {
      setRoomDisplayName(photo.roomName); // Se não conseguir extrair ID, usar o roomName original
      return;
    }
    
    // Buscar nome do quarto da API
    const fetchRoomName = async () => {
      const hotelDomain = getPhotoHotelDomain();
      try {
        const response = await fetch(`https://www.habbo.${hotelDomain}/api/public/rooms/${roomId}`, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
          const roomData = await response.json();
          if (roomData.name) {
            setRoomDisplayName(roomData.name);
          } else {
            setRoomDisplayName(photo.roomName); // Fallback para roomName original
          }
        } else if (response.status === 404) {
          // 404 é esperado se o quarto não existir mais - não fazer log de erro
          setRoomDisplayName(photo.roomName); // Fallback para roomName original
        } else {
          // Outros erros - logar apenas em modo debug
          console.debug(`[IndividualPhotoView] Erro ${response.status} ao buscar quarto ${roomId}:`, response.statusText);
          setRoomDisplayName(photo.roomName); // Fallback para roomName original
        }
      } catch (error) {
        // Erros de rede - logar apenas em modo debug
        console.debug('[IndividualPhotoView] Erro de rede ao buscar nome do quarto:', error);
        setRoomDisplayName(photo.roomName); // Fallback para roomName original
      }
    };
    
    fetchRoomName();
  }, [photo.roomName, photo.roomId, photo.imageUrl]);

  // Buscar perfil completo do usuário para obter figureString
  const hotelDomainForProfile = getPhotoHotelDomain();
  const { data: userProfile } = useCompleteProfile(userName, hotelDomainForProfile);
  const userFigureString = userProfile?.figureString;

  // Helper para URL de avatar do usuário da foto
  const getPhotoUserAvatarUrl = (userName: string) => {
    const domain = getPhotoHotelDomain();
    // Usar figureString se disponível, caso contrário usar userName
    return getAvatarHeadUrl(userName, domain, userFigureString, 'l');
  };
  
  const handleLikesClick = () => {
    setShowLikesPopover(!showLikesPopover);
    setShowCommentsPopover(false);
  };
  
  const handleCommentsClick = () => {
    setShowCommentsPopover(!showCommentsPopover);
    setShowLikesPopover(false);
  };
  
  /**
   * Enviar comentário com validação e rate limiting
   */
  const handleSubmitComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!habboAccount) {
      toast.error(t('toast.loginRequired'));
      return;
    }

    const photoId = photo.id;
    
    // Verificar rate limit
    const rateLimitStatus = checkCanComment(photoId);
    if (!rateLimitStatus.canComment) {
      toast.error(rateLimitStatus.error || t('toast.commentingTooFast'));
      return;
    }

    // Validar comentário
    const validation = validateComment(commentText);
    if (!validation.isValid) {
      toast.error(validation.error || t('toast.invalidComment'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sanitized = sanitizeComment(commentText);
      
      // Usar o hook para adicionar comentário ao banco
      await addComment(sanitized);
      
      // Registrar ação para rate limiting
      recordComment(photoId);
      
      // Limpar campo
      setCommentText('');
      toast.success(t('toast.commentSent'));
      
      // Abrir modal de comentários após enviar
      setShowCommentsPopover(true);
      setShowLikesPopover(false);
      
    } catch (error: any) {
      console.error('Erro ao enviar comentário:', error);
      toast.error(t('toast.commentError'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Converter para formato EnhancedPhoto com dados do banco
  const enhancedPhoto: EnhancedPhoto = {
    id: photo.id,
    photo_id: photo.id,
    userName: userName,
    imageUrl: photo.imageUrl,
    date: photo.date,
    likes: likes, // Likes do banco de dados
    likesCount: likesCount, // Contagem real do banco
    userLiked: userLiked, // Se o usuário atual curtiu
    type: 'PHOTO',
    caption: '',
    roomName: ''
  };

  return (
    <div className="relative rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-3 mb-4 px-4 py-3 bg-transparent border-b border-white/10 flex-shrink-0">
        <Button 
          onClick={onBack}
          size="sm"
          variant="ghost" 
          className="text-white/80 hover:text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-lg font-semibold text-white">Foto de {userName}</h2>
      </div>

      {/* Container principal com scroll */}
      <div className="flex-1 min-h-0">
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Header da foto com avatar e info do usuário */}
            <div className="px-1 py-2 bg-transparent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                  <img 
                    src={getPhotoUserAvatarUrl(userName)} 
                    alt={userName} 
                    className="w-full h-full cursor-pointer transition-opacity object-cover" 
                    style={{imageRendering: 'pixelated'}}
                    onClick={() => onUserClick(userName)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarFallbackUrl(userName, 'l');
                    }}
                  />
                </div>
                <div className="flex-1">
                  <button 
                    className="font-semibold text-white hover:text-yellow-400 transition-colors"
                    onClick={() => onUserClick(userName)}
                  >
                    {userName}
                  </button>
                  <div className="text-xs text-white/60">{photo.date}</div>
                </div>
                <button className="text-white/60 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Imagem da foto */}
            <div className="relative">
              <img 
                ref={photoImageRef}
                src={photo.imageUrl} 
                alt={`Foto de ${userName}`} 
                className="w-full h-auto object-contain"
                onLoad={() => {
                  if (photoImageRef.current) {
                    setPhotoWidth(photoImageRef.current.offsetWidth);
                  }
                }}
              />
              <div className="absolute bottom-2 left-2">
                <img src="/hub.gif" alt="Hub" className="w-6 h-6 opacity-80" style={{display: 'none'}} />
              </div>
              
              {/* Popover de Likes */}
              {showLikesPopover && (
                <div className="absolute inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
                  {/* Overlay escuro */}
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowLikesPopover(false)}
                  ></div>
                  
                  {/* Modal que desliza de baixo para cima */}
                  <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col animate-in slide-in-from-bottom duration-300 ease-out">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
                      <h3 className="text-sm font-bold text-white" style={{
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                      }}>
                        Curtidas
                      </h3>
                      <button 
                        onClick={() => setShowLikesPopover(false)}
                        className="text-white hover:bg-white/20 rounded-full p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {likes.length > 0 ? (
                        <div className="space-y-2">
                          {likes.map((like) => (
                            <div key={like.id} className="flex items-center gap-3 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                              <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded-full">
                                <img 
                                  src={getPhotoUserAvatarUrl(like.habbo_name)} 
                                  alt={like.habbo_name} 
                                  className="w-full h-full object-cover" 
                                  style={{imageRendering: 'pixelated'}}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getAvatarFallbackUrl(like.habbo_name, 's');
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm truncate">{like.habbo_name}</p>
                                <p className="text-white/50 text-xs">
                                  {new Date(like.created_at).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-white/60 text-sm">
                          {t('pages.console.noLikesYet')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Popover de Comentários - sobrepondo a foto */}
              {showCommentsPopover && (
                <div className="absolute inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
                  {/* Overlay escuro */}
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowCommentsPopover(false)}
                  />
                  
                  {/* Modal que desliza de baixo para cima */}
                  <div 
                    className="relative w-full max-w-md mx-4 overflow-hidden rounded-lg shadow-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-300 ease-out"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                      backgroundSize: '100% 2px',
                      backgroundColor: '#1a1a1a'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex-shrink-0 border-b border-white/20" style={{
                      backgroundColor: '#1a1a1a'
                    }}>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white font-semibold text-sm">
                          <MessageCircle className="w-5 h-5 text-white/70" />
                          <span>Comentários ({commentsCount || 0})</span>
                        </div>
                        <button 
                          onClick={() => setShowCommentsPopover(false)}
                          className="text-white/60 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Conteúdo com scroll */}
                    <div className="flex-1 overflow-y-auto p-4" style={{
                      backgroundColor: '#1a1a1a'
                    }}>
                      {comments && comments.length > 0 ? (
                        <div className="space-y-2">
                          {comments.map((comment: any) => (
                            <div key={comment.id} className="flex items-start gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                              <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                                <img
                                  src={getAvatarHeadUrl(comment.habbo_name, comment.hotel || 'br', undefined, 's')}
                                  alt={comment.habbo_name}
                                  className="w-full h-full object-cover"
                                  style={{ imageRendering: 'pixelated' }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = getAvatarFallbackUrl(comment.habbo_name, 's');
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => onUserClick(comment.habbo_name)}
                                      className="text-sm font-semibold text-white hover:text-yellow-400 transition-colors"
                                    >
                                      {comment.habbo_name}
                                    </button>
                                    <span className="text-xs text-white/60">
                                      {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  {canDeleteComment(comment) && (
                                    <button
                                      onClick={() => deleteComment(comment.id)}
                                      disabled={isDeletingComment}
                                      className="group relative w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity disabled:opacity-50"
                                      title="Excluir comentário"
                                    >
                                      <img 
                                        src="/assets/deletetrash.gif" 
                                        alt="Excluir"
                                        className="max-w-full max-h-full object-contain"
                                        style={{ imageRendering: 'pixelated' }}
                                        onMouseOver={(e) => {
                                          if (!isDeletingComment) {
                                            e.currentTarget.src = '/assets/deletetrash1.gif';
                                          }
                                        }}
                                        onMouseOut={(e) => {
                                          if (!isDeletingComment) {
                                            e.currentTarget.src = '/assets/deletetrash.gif';
                                          }
                                        }}
                                      />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-white/90 break-words">{comment.comment_text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-white/60 text-sm py-6">
                          Nenhum comentário ainda
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
              
            {/* Caption and Room */}
            {photo.roomName && (
              <div className="space-y-1 pt-2 pb-3">
                {(() => {
                  // Usar roomId extraído do useEffect ou do photo diretamente
                  const roomId = extractedRoomId || (photo.roomId ? String(photo.roomId) : null);
                  const hotelDomain = getPhotoHotelDomain();
                  
                  // Usar nome do quarto se disponível, senão usar roomName original
                  const displayText = roomDisplayName || photo.roomName;
                  
                  // Verificar se é "Quarto do jogo" ou similar (sem informações reais do quarto)
                  const isPlaceholderRoom = !roomId || 
                    photo.roomName.toLowerCase().includes('quarto do jogo') ||
                    photo.roomName.toLowerCase().includes('game room') ||
                    (!photo.roomId && !extractedRoomId && !photo.roomName.match(/\d+/));
                  
                  if (isPlaceholderRoom) {
                    // Sem roomId válido, não é clicável
                    return (
                      <div className="flex items-center gap-1 text-xs text-white/60">
                        <MapPin className="w-3 h-3" />
                        <span>{displayText}</span>
                      </div>
                    );
                  }

                  return (
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-1 text-xs text-white/60 cursor-pointer hover:text-white/80 transition-colors w-full text-left"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (roomId) {
                          console.log('[IndividualPhotoView] Abrindo modal do quarto:', { roomId, hotelDomain, displayText });
                          setSelectedRoomId(roomId);
                          setSelectedRoomHotel(hotelDomain);
                          setShowRoomDetails(true);
                        }
                      }}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{displayText}</span>
                    </button>
                  );
                })()}
              </div>
            )}

            {/* Ações da foto (like e comentários) */}
            <div className="px-1 py-2 bg-transparent">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (habboAccount) {
                        toggleLike();
                      } else {
                        handleLikesClick();
                      }
                    }}
                    disabled={isToggling}
                    className={`flex items-center gap-2 transition-colors ${
                      userLiked 
                        ? 'text-red-500' 
                        : 'text-white/60 hover:text-red-500'
                    } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Heart className={`w-6 h-6 ${userLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm font-medium">{likesCount}</span>
                  </button>
                </div>
                <button 
                  onClick={handleCommentsClick}
                  className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-medium">{commentsCount || 0}</span>
                </button>
              </div>
            </div>

            {/* Campo de comentário */}
            <div 
              ref={commentFormRef}
              className="px-1 py-2 bg-transparent relative z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <form 
                className="flex items-center gap-2" 
                onSubmit={(e) => {
                  handleSubmitComment(e);
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                  <img 
                    src={habboAccount?.habbo_name
                      ? getAvatarHeadUrl(habboAccount.habbo_name, habboAccount.hotel || 'br', undefined, 'm')
                      : getAvatarHeadUrl('', 'br', 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-', 'm')
                    } 
                    alt={habboAccount?.habbo_name || 'Guest'} 
                    className="w-full h-full object-cover" 
                    style={{imageRendering: 'pixelated'}}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getAvatarHeadUrl('', 'br', 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-', 'm');
                    }}
                  />
                </div>
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder={t('pages.console.addComment')} 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    maxLength={COMMENT_CONFIG.MAX_LENGTH}
                    disabled={isSubmitting || isAddingComment}
                    className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Botão de enviar - só aparece quando há texto */}
                  {commentText.trim() && (
                    <button
                      type="submit"
                      disabled={isSubmitting || isAddingComment}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title={t('pages.console.sendComment')}
                    >
                      <img 
                        src="/assets/write.png" 
                        alt="Enviar" 
                        className="w-4 h-4"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </button>
                  )}
                  
                  {/* Contador de caracteres */}
                  {commentText.length > COMMENT_CONFIG.MAX_LENGTH * 0.8 && (
                    <div className="absolute -bottom-5 right-0 text-xs text-white/60">
                      {commentText.length}/{COMMENT_CONFIG.MAX_LENGTH}
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do quarto */}
      {showRoomDetails && selectedRoomId && (
        <RoomDetailsModal
          roomId={selectedRoomId}
          hotelDomain={selectedRoomHotel}
          photoImageRef={photoImageRef}
          isOpen={showRoomDetails}
          onClose={() => {
            setShowRoomDetails(false);
            setSelectedRoomId(null);
            setSelectedRoomHotel('');
          }}
        />
      )}
    </div>
  );
};
