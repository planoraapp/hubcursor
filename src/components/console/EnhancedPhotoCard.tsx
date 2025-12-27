import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, User, Calendar, MapPin, MoreHorizontal, Send } from 'lucide-react';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { usePhotoComments } from '@/hooks/usePhotoComments';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { useCommentRateLimit } from '@/hooks/useCommentRateLimit';
import { validateComment, sanitizeComment, COMMENT_CONFIG } from '@/utils/commentValidation';
import { PhotoCardProps, PhotoType } from '@/types/habbo';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RoomDetailsModal } from './modals/RoomDetailsModal';
import { getPhotoId, getPhotoUserName } from '@/utils/photoNormalizer';
import { getAvatarHeadUrl, getAvatarFallbackUrl } from '@/utils/avatarHelpers';
import { getHotelFlag, hotelDomainToCode, HOTEL_COUNTRIES } from '@/utils/hotelHelpers';

export const EnhancedPhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onUserClick,
  onLikesClick,
  onCommentsClick,
  showDivider = false,
  className = ''
}) => {
  const { t, language } = useI18n();
  const { habboAccount } = useAuth();
  const [showLikesPopover, setShowLikesPopover] = useState(false);
  const [showCommentsPopover, setShowCommentsPopover] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomHotel, setSelectedRoomHotel] = useState<string>('');
  const [roomDisplayName, setRoomDisplayName] = useState<string | null>(null);
  const photoImageRef = React.useRef<HTMLImageElement>(null);
  const [photoWidth, setPhotoWidth] = useState<number | null>(null);
  const commentFormRef = React.useRef<HTMLDivElement>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  
  // Rate limiting
  const { checkCanComment, recordComment } = useCommentRateLimit();
  
  const handleLikesClick = () => {
    setShowLikesPopover(!showLikesPopover);
  };
  
  const handleCommentsClick = () => {
    setShowCommentsPopover(!showCommentsPopover);
    setShowLikesPopover(false);
  };

  // Calcular posição do modal baseado no formulário de comentários
  React.useLayoutEffect(() => {
    if (!showCommentsPopover || !commentFormRef.current) {
      setModalPosition(null);
      return;
    }

    const calculatePosition = () => {
      const commentDiv = commentFormRef.current;
      if (!commentDiv) {
        console.log('❌ Comment div ref not found');
        return;
      }

      const divRect = commentDiv.getBoundingClientRect();
      
      // Encontrar o container pai com position relative (deve ser o div principal do componente)
      let container = commentDiv.parentElement;
      while (container) {
        const style = getComputedStyle(container);
        if (style.position === 'relative' || style.position === 'absolute' || style.position === 'fixed') {
          break;
        }
        container = container.parentElement;
        if (container && container.classList && container.classList.contains('space-y-3')) {
          // Encontramos o container principal
          break;
        }
      }
      
      if (!container) {
        container = commentDiv.closest('.space-y-3') || commentDiv.parentElement;
      }

      const containerRect = container?.getBoundingClientRect() || { top: 0, left: 0 };
      
      // Posição relativa ao container
      const relativeTop = divRect.top - containerRect.top;
      const relativeLeft = divRect.left - containerRect.left;
      
      // Largura do modal = largura da div do formulário
      const modalWidth = divRect.width;
      
      // Altura do modal = altura para 5 comentários (320px)
      const modalHeight = 320;
      
      // Posição: começar do topo da div e expandir para cima
      const position = {
        top: relativeTop - modalHeight,
        left: relativeLeft,
        width: modalWidth
      };
      
      console.log('📍 Modal position calculated:', position, { divRect, containerRect });
      setModalPosition(position);
    };

    // Calcular imediatamente e após um pequeno delay
    calculatePosition();
    const timeout = setTimeout(calculatePosition, 50);
    const timeout2 = setTimeout(calculatePosition, 200);
    
    // Recalcular em resize e scroll
    const handleResize = () => calculatePosition();
    const handleScroll = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      clearTimeout(timeout);
      clearTimeout(timeout2);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showCommentsPopover]);
  
  /**
   * Enviar comentário com validação e rate limiting
   */
  const handleSubmitComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!habboAccount) {
      toast.error(t('toast.loginRequired'));
      return;
    }

    const photoId = getPhotoId(photo);
    
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
      
      // TODO: Implementar envio ao banco de dados via usePhotoComments
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
      // Exibir mensagem de erro específica se disponível (filtros anti-spam, rate limit, etc)
      const errorMessage = error?.message || t('toast.commentError');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const { 
    likes, 
    likesCount, 
    userLiked, 
    toggleLike, 
    isToggling 
  } = usePhotoLikes(getPhotoId(photo));

  const { 
    comments,
    commentsCount, 
    lastTwoComments,
    addComment,
    deleteComment,
    canDeleteComment,
    isAddingComment,
    isDeletingComment
  } = usePhotoComments(getPhotoId(photo), getPhotoUserName(photo));

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
    // Outros hotéis (es, fr, de, it, nl, fi) usam o código diretamente como domínio
    return code;
  };

  /**
   * Obtém o domínio correto do hotel baseado na foto
   * Prioridade: 1) URL da foto, 2) hotelDomain da foto, 3) hotel da foto, 4) fallback
   */
  const getPhotoHotelDomain = (): string => {
    // 1. Tentar extrair da URL da foto (fonte de verdade)
    const photoUrl = photo.s3_url || photo.imageUrl || photo.preview_url;
    const hotelCodeFromUrl = extractHotelFromPhotoUrl(photoUrl);
    if (hotelCodeFromUrl) {
      return hotelCodeToDomain(hotelCodeFromUrl);
    }
    
    // 2. Tentar usar hotelDomain anotado na foto (já está no formato de domínio)
    const hotelDomainFromPhoto = (photo as any).hotelDomain as string | undefined;
    if (hotelDomainFromPhoto) {
      // Se já contém ponto, já é um domínio completo (com.br, com.tr, etc)
      if (hotelDomainFromPhoto.includes('.')) {
        return hotelDomainFromPhoto;
      }
      // Caso contrário, converter código para domínio
      return hotelCodeToDomain(hotelDomainFromPhoto);
    }
    
    // 3. Tentar usar código do hotel anotado na foto
    const hotelCodeFromPhoto = (photo as any).hotel as string | undefined;
    if (hotelCodeFromPhoto) {
      return hotelCodeToDomain(hotelCodeFromPhoto);
    }
    
    // 4. Fallback padrão
    return 'com.br';
  };

  /**
   * Obtém o código do hotel para exibir a flag
   * Retorna o código do hotel (br, com, es, fr, etc.) baseado na foto
   */
  const getPhotoHotelCode = (): string => {
    // 1. Tentar extrair da URL da foto (fonte de verdade)
    const photoUrl = photo.s3_url || photo.imageUrl || photo.preview_url;
    const hotelCodeFromUrl = extractHotelFromPhotoUrl(photoUrl);
    if (hotelCodeFromUrl) {
      return hotelCodeFromUrl;
    }
    
    // 2. Tentar usar hotelDomain anotado na foto
    const hotelDomainFromPhoto = (photo as any).hotelDomain as string | undefined;
    if (hotelDomainFromPhoto) {
      // Se já contém ponto, converter domínio para código
      if (hotelDomainFromPhoto.includes('.')) {
        return hotelDomainToCode(hotelDomainFromPhoto);
      }
      // Caso contrário, já é um código
      return hotelDomainFromPhoto;
    }
    
    // 3. Tentar usar código do hotel anotado na foto
    const hotelCodeFromPhoto = (photo as any).hotel as string | undefined;
    if (hotelCodeFromPhoto) {
      return hotelCodeFromPhoto;
    }
    
    // 4. Fallback padrão
    return 'br';
  };

  // Buscar nome do quarto quando houver roomName
  useEffect(() => {
    if (!photo.roomName) {
      setRoomDisplayName(null);
      return;
    }
    
    // Prioridade: 1) roomId direto, 2) extrair do roomName (ex: "Room 117037234" -> "117037234")
    let roomId: string | null = null;
    
    if (photo.roomId) {
      roomId = String(photo.roomId);
    } else {
      const roomIdMatch = photo.roomName.match(/Room\s+(\d+)/i);
      if (roomIdMatch) {
        roomId = roomIdMatch[1];
      }
    }
    
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
          // Outros erros (500, etc) - logar apenas em modo debug
          console.debug(`[EnhancedPhotoCard] Erro ${response.status} ao buscar quarto ${roomId}:`, response.statusText);
          setRoomDisplayName(photo.roomName); // Fallback para roomName original
        }
      } catch (error) {
        // Erros de rede - logar apenas em modo debug para não poluir console
        console.debug('[EnhancedPhotoCard] Erro de rede ao buscar nome do quarto:', error);
        setRoomDisplayName(photo.roomName); // Fallback para roomName original
      }
    };
    
    fetchRoomName();
  }, [photo.roomName, photo.roomId, photo.s3_url, photo.imageUrl, photo.preview_url, photo.hotelDomain, photo.hotel]);

  const getPhotoOwnerAvatarUrl = (userName: string, preferredDomain?: string): string => {
    const domain = preferredDomain ? hotelCodeToDomain(preferredDomain) : getPhotoHotelDomain();
    return getAvatarHeadUrl(userName, domain, undefined, 'l');
  };

  // Lista completa de domínios para fallback (ordenados por popularidade)
  const ALL_HOTEL_DOMAINS = ['com.br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'com.tr'];
  const MAX_RETRY_ATTEMPTS = 2; // Limitar a 2 tentativas adicionais (hotel original + 2 fallbacks = 3 total)
  
  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>, userName: string) => {
    const target = e.target as HTMLImageElement;
    
    // Obter ou inicializar lista de tentativas
    let triedDomains = (target as any)._triedDomains;
    if (!triedDomains) {
      triedDomains = [];
      (target as any)._triedDomains = triedDomains;
    }
    
    // Adicionar o domínio atual (que falhou) à lista de tentados
    const currentDomain = getPhotoHotelDomain();
    if (!triedDomains.includes(currentDomain)) {
      triedDomains.push(currentDomain);
    }
    
    // Limitar número de tentativas (hotel original + 2 fallbacks = máximo 3 tentativas)
    if (triedDomains.length > MAX_RETRY_ATTEMPTS + 1) {
      return;
    }
    
    // Criar lista de fallback excluindo os hotéis já tentados
    const fallbackDomains = ALL_HOTEL_DOMAINS.filter(d => 
      !triedDomains.includes(d)
    );
    
    const nextDomain = fallbackDomains[0];
    
    if (nextDomain) {
      triedDomains.push(nextDomain);
      
      // Usar timeout para evitar requests abortados muito rápidos
      const timeoutId = setTimeout(() => {
        if (target && target.parentNode && target.isConnected) {
          target.src = getPhotoOwnerAvatarUrl(userName, nextDomain);
        }
      }, 200);
      
      // Limpar timeout anterior se existir
      if ((target as any)._retryTimeout) {
        clearTimeout((target as any)._retryTimeout);
      }
      (target as any)._retryTimeout = timeoutId;
    }
  };

  const getRelativeTime = (dateString: string, timestamp?: number | string) => {
    // Se não houver nenhuma informação de data, assume "agora"
    if ((!dateString || dateString === 'Invalid Date') && !timestamp) {
      return t('time.now');
    }

    let photoDate: Date | null = null;

    // 1) Priorizar timestamp bruto (mais confiável)
    if (timestamp) {
      if (typeof timestamp === 'number') {
        // Habbo normalmente usa milissegundos; se vier em segundos, converte
        const ts =
          timestamp < 10_000_000_000
            ? timestamp * 1000
            : timestamp;
        photoDate = new Date(ts);
      } else if (typeof timestamp === 'string') {
        const parsed = Date.parse(timestamp);
        if (!Number.isNaN(parsed)) {
          photoDate = new Date(parsed);
        }
      }
    }

    // 2) Fallback: tentar usar a string de data (ex: "20/12/2025")
    if (!photoDate || Number.isNaN(photoDate.getTime())) {
      if (dateString) {
        if (dateString.includes('/')) {
          // Formato DD/MM/YYYY
          const parts = dateString.split('/');
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts.map(Number);
            photoDate = new Date(yyyy, mm - 1, dd);
          } else {
            photoDate = new Date(dateString);
          }
        } else {
          photoDate = new Date(dateString);
        }
      }
    }

    // Se ainda estiver inválida, devolve a string bruta para não ficar "Agora" sempre
    if (!photoDate || Number.isNaN(photoDate.getTime())) {
      return dateString || t('time.now');
    }

    const now = new Date();
    const diffMs = now.getTime() - photoDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    // Menos de 1 minuto: "agora"
    if (diffMinutes < 1) {
      return t('time.now');
    }

    // Menos de 1 hora: "há X min"
    if (diffMinutes < 60) {
      return `há ${diffMinutes} min`;
    }

    // Menos de 24 horas: "há Xh"
    if (diffHours < 24) {
      return `há ${diffHours}h`;
    }

    // A partir de 24h: exibir data absoluta, com formato por idioma
    const lang = (language || 'pt').toLowerCase();
    const isEnglish = lang.startsWith('en');
    const isSpanish = lang.startsWith('es');

    const locale = isEnglish ? 'en-US' : isSpanish ? 'es-ES' : 'pt-BR';

    return photoDate.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  const formatDate = (dateString: string, timestamp?: number | string) => {
    return getRelativeTime(dateString, timestamp);
  };

  const getPhotoTypeClass = (type: PhotoType, contentWidth?: number, contentHeight?: number) => {
    const baseClass = "card__image";
    
    switch (type) {
      case 'SELFIE':
        return `${baseClass} card__image--selfie`;
      case 'PHOTO':
        return `${baseClass} card__image--photo`;
      case 'USER_CREATION':
        if (contentWidth && contentHeight) {
          return contentHeight < contentWidth 
            ? `${baseClass} card__image--wide`
            : `${baseClass} card__image--tall`;
        }
        return `${baseClass} card__image--photo`;
      default:
        return `${baseClass} card__image--photo`;
    }
  };

  // Usar helper centralizado para URLs de avatar
  const getPhotoUserAvatarUrl = (userName: string) => {
    return getAvatarHeadUrl(userName, getPhotoHotelDomain(), undefined, 's');
  };

  const getRecentLikers = () => {
    const currentUserId = habboAccount?.id;
    const currentUserLike = currentUserId
      ? likes.find(like => like.user_id === currentUserId)
      : undefined;
    const otherLikes = currentUserId
      ? likes.filter(like => like.user_id !== currentUserId)
      : likes;
    
    if (currentUserLike) {
      return [currentUserLike, ...otherLikes.slice(0, 4)];
    }
    return otherLikes.slice(0, 5);
  };

  const recentLikers = getRecentLikers();
  const hasMoreLikes = likesCount > recentLikers.length;

  // Obter código do hotel e flag para exibição
  const photoHotelCode = React.useMemo(() => getPhotoHotelCode(), [photo.s3_url, photo.imageUrl, photo.preview_url, photo.hotelDomain, photo.hotel]);
  const countryData = React.useMemo(() => HOTEL_COUNTRIES.find(c => c.code === photoHotelCode) || HOTEL_COUNTRIES.find(c => c.code === 'com'), [photoHotelCode]);

  return (
    <div className={cn("space-y-3 relative", className)}>
      {/* User Info */}
      <div className="px-1 py-2 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
            <img
              src={getPhotoOwnerAvatarUrl(photo.userName)}
              alt={photo.userName}
              className="w-full h-full cursor-pointer object-cover"
              loading="lazy"
              style={{ imageRendering: 'pixelated' }}
              onClick={() => onUserClick(photo.userName, photo)}
              onError={(e) => handleAvatarError(e, photo.userName)}
            />
          </div>
          <div className="flex-1">
            <button
              onClick={() => onUserClick(photo.userName, photo)}
              className="font-semibold text-white hover:text-yellow-400 transition-colors"
            >
              {photo.userName}
            </button>
            <div className="text-xs text-white/60">
              {formatDate(
                photo.date,
                typeof photo.timestamp === 'number'
                  ? photo.timestamp
                  : photo.timestamp
                  ? Date.parse(photo.timestamp as string)
                  : undefined
              )}
            </div>
          </div>
          <div className="flex items-center">
            {/* Flag do país de origem da foto */}
            <img
              src={getHotelFlag(photoHotelCode)}
              alt=""
              className="w-auto object-contain mr-2"
              style={{ imageRendering: 'pixelated', height: 'auto', maxHeight: 'none' }}
              title={countryData ? `Origem: ${countryData.name}` : `Origem: ${photoHotelCode.toUpperCase()}`}
            />
            <button className="text-white/60 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="relative" style={{ position: 'relative' }}>
        <img
          ref={photoImageRef}
          src={photo.imageUrl}
          alt={`Foto de ${photo.userName}`}
          className="w-full h-auto object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Modal de detalhes do quarto - renderizado aqui para estar no mesmo contexto */}
        {showRoomDetails && selectedRoomId && (
          <RoomDetailsModal
            roomId={selectedRoomId}
            hotelDomain={selectedRoomHotel}
            photoImageRef={photoImageRef}
            isOpen={showRoomDetails}
            onClose={() => {
              setShowRoomDetails(false);
              setSelectedRoomId(null);
            }}
          />
        )}
        
        {/* Hub.gif logo - canto inferior esquerdo */}
        <div className="absolute bottom-2 left-2">
          <img
            src="/hub.gif"
            alt="Hub"
            className="w-6 h-6 opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        {/* Modal de Likes - mesmo design do RoomDetailsModal */}
        {showLikesPopover && (
          <>
            {/* Overlay para fechar ao clicar fora */}
            <div
              className="fixed inset-0 bg-transparent"
              onClick={() => setShowLikesPopover(false)}
              style={{ pointerEvents: 'auto', zIndex: 49 }}
            />
            
            {/* Modal */}
            <div
              className={cn(
                "absolute top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center",
                "p-0"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative w-full max-w-md mx-4 p-0 bg-transparent border-0 overflow-hidden rounded-lg animate-slide-up-fade"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                  backgroundSize: '100% 2px',
                  pointerEvents: 'auto',
                  maxHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={(e) => e.stopPropagation()}
              >
              {/* Header */}
              <div className="bg-yellow-400 border-2 border-black border-b-0 rounded-t-lg relative overflow-hidden flex-shrink-0" style={{
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }}>
                <div className="pixel-pattern absolute inset-0 opacity-20"></div>
                <div className="p-2 relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-xs" style={{
                    textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                  }}>
                    <Heart className="w-4 h-4 text-white flex-shrink-0 fill-current" />
                    <span>Curtidas ({likesCount})</span>
                  </div>
                  <button 
                    onClick={() => setShowLikesPopover(false)}
                    className="text-white hover:bg-white/20 rounded p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Conteúdo com scroll */}
              <div className="bg-gray-900 relative overflow-y-auto flex-1" style={{
                backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                backgroundSize: '100% 2px'
              }}>
                <div className="relative z-10 p-3 space-y-2">
                  {likes.length > 0 ? (
                    likes.map((like) => (
                      <div key={like.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors">
                        <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                          <img
                            src={getPhotoUserAvatarUrl(like.habbo_name)}
                            alt={like.habbo_name}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'pixelated' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = getAvatarFallbackUrl(like.habbo_name, 's');
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => onUserClick(like.habbo_name, photo)}
                            className="text-sm font-semibold text-white hover:text-yellow-400 transition-colors truncate block w-full text-left"
                          >
                            {like.habbo_name}
                          </button>
                          <div className="text-xs text-white/60">
                            {new Date(like.created_at).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-white/60 text-sm py-6">
                      Nenhuma curtida ainda
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
          </>
        )}

        {/* Modal de Comentários - abre a partir do formulário de comentários */}
        {showCommentsPopover && (
          <>
            {/* Overlay para fechar ao clicar fora - não cobre a área do formulário */}
            <div
              className="fixed inset-0 bg-transparent"
              onClick={(e) => {
                // Não fechar se o clique for na área do formulário
                const target = e.target as HTMLElement;
                if (commentFormRef.current && commentFormRef.current.contains(target)) {
                  return;
                }
                setShowCommentsPopover(false);
              }}
              style={{ pointerEvents: 'auto', zIndex: 49 }}
            />
            
            {/* Modal posicionado acima do formulário */}
            <div
              className="absolute z-50 overflow-hidden rounded-lg animate-in slide-in-from-bottom duration-300"
              style={{
                top: modalPosition ? `${modalPosition.top}px` : 'auto',
                bottom: modalPosition ? 'auto' : '100%',
                left: modalPosition ? `${modalPosition.left}px` : '0px',
                width: modalPosition ? `${modalPosition.width}px` : '100%',
                height: '320px',
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'auto',
                marginBottom: modalPosition ? '0' : '8px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative w-full h-full flex flex-col"
                style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #333333, #333333 1px, #222222 1px, #222222 2px)',
                  backgroundSize: '100% 2px',
                  backgroundColor: 'transparent'
                }}
              >
                {/* Header com cores do formulário */}
                <div className="flex-shrink-0 border-b border-white/20" style={{
                  backgroundColor: '#1a1a1a'
                }}>
                  <div className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <MessageCircle className="w-4 h-4 text-white/70" />
                      <span>Comentários ({commentsCount})</span>
                    </div>
                    <button 
                      onClick={() => setShowCommentsPopover(false)}
                      className="text-white/60 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Conteúdo com scroll - altura fixa para mostrar 5 comentários */}
                <div className="relative overflow-y-auto" style={{
                  backgroundColor: '#1a1a1a',
                  height: 'calc(320px - 48px)' // Altura total menos altura do header (~48px)
                }}>
                  <div className="relative z-10 p-3 space-y-2">
                    {comments && comments.length > 0 ? (
                      comments.map((comment: any) => (
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
                                  onClick={() => onUserClick(comment.habbo_name, photo)}
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
                      ))
                    ) : (
                      <div className="text-center text-white/60 text-sm py-6">
                        Nenhum comentário ainda
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

      {/* Caption and Room */}
      {(photo.caption || photo.roomName) && (
        <div className="space-y-1 pt-2 pb-3">
          {photo.caption && (
            <p className="text-sm text-white/90">{photo.caption}</p>
          )}
          {photo.roomName && (() => {
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
            
            const hotelDomain = getPhotoHotelDomain();
            
            // Usar nome do quarto se disponível, senão usar roomName original
            const displayText = roomDisplayName || photo.roomName;
            
            if (!roomId) {
              // Sem roomId, não é clicável (ex: "Quarto do jogo")
              return (
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <MapPin className="w-3 h-3" />
                  <span>{displayText}</span>
                </div>
              );
            }

            return (
              <div 
                className={cn(
                  "flex items-center gap-1 text-xs text-white/60 cursor-pointer hover:text-white/80 transition-colors"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedRoomId(roomId!);
                  setSelectedRoomHotel(hotelDomain);
                  setShowRoomDetails(true);
                }}
              >
                <MapPin className="w-3 h-3" />
                <span>{displayText}</span>
              </div>
            );
          })()}
        </div>
      )}

      {/* Actions */}
      <div className="px-1 py-2 bg-transparent">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleLike}
                disabled={isToggling}
                className={`flex items-center gap-2 transition-colors ${
                  userLiked ? 'text-red-500' : 'text-white/60 hover:text-red-500'
                }`}
              >
                <Heart className={`w-6 h-6 ${userLiked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleLikesClick}
                className="text-sm font-medium hover:underline text-white/60 hover:text-white"
              >
                {likesCount}
              </button>
            </div>
            
            <button
              onClick={handleCommentsClick}
              className="flex items-center gap-2 text-white/60 transition-colors hover:text-white"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium">{commentsCount}</span>
            </button>
          </div>

          {/* Recent Likers - à direita */}
          {likesCount > 0 && (
            <button
              onClick={handleLikesClick}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <div className="flex -space-x-2">
                {recentLikers.slice(0, 5).map((like, index) => (
                  <div
                    key={like.id}
                    className="w-6 h-6 overflow-hidden"
                    style={{ zIndex: 5 - index }}
                  >
                    <img
                      src={getPhotoUserAvatarUrl(like.habbo_name)}
                      alt={`Avatar de ${like.habbo_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getAvatarFallbackUrl(like.habbo_name, 's');
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <span className="text-xs">
                {hasMoreLikes ? `e mais ${likesCount - recentLikers.length}` : `${likesCount} ${likesCount === 1 ? t('pages.console.likes') : t('pages.console.likesPlural')}`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Campo para novo comentário - sempre visível */}
      <div 
        ref={commentFormRef}
        className="px-1 py-2 bg-transparent relative z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <form 
          className="flex items-center gap-2" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitComment();
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Avatar do usuário logado */}
          <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
            <img
              src={habboAccount?.habbo_name
                ? getAvatarHeadUrl(habboAccount.habbo_name, habboAccount.hotel || 'br', undefined, 'm')
                : getAvatarHeadUrl('', 'br', 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-', 'm')
              }
              alt={habboAccount?.habbo_name || 'Guest'}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`;
              }}
            />
          </div>
          
          {/* Campo de texto */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('pages.console.addComment')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={COMMENT_CONFIG.MAX_LENGTH}
              disabled={isSubmitting}
              className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Botão de enviar - só aparece quando há texto */}
            {commentText.trim() && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={t('pages.console.sendComment')}
              >
                <img 
                  src="/assets/write.png" 
                  alt={t('pages.console.sendComment')} 
                  className="w-4 h-4" 
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

      {/* Divider */}
      {showDivider && (
        <div className="border-t border-white/10 pt-3" />
      )}

      {/* Overlay para fechar popovers */}
      {(showLikesPopover || showCommentsPopover) && (
        <div 
          className="absolute inset-0 z-40 bg-transparent"
          onClick={() => {
            setShowLikesPopover(false);
            setShowCommentsPopover(false);
          }}
        />
      )}
      </div>
    </div>
  );
};

