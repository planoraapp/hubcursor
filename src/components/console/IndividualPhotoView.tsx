import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

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
  const [extractedRoomId, setExtractedRoomId] = useState<string | null>(null);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionText, setCaptionText] = useState('');
  const [isSavingCaption, setIsSavingCaption] = useState(false);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Buscar perfil completo do usuário para obter figureString e quartos (ANTES do useEffect para evitar erro de inicialização)
  // Usar userName da prop, mas se não estiver disponível, tentar extrair do photo (como EnhancedPhotoCard faz)
  const effectiveUserName = userName || (photo as any).userName || '';
  const hotelDomainForProfile = getPhotoHotelDomain();
  const { data: userProfile } = useCompleteProfile(effectiveUserName, hotelDomainForProfile);
  const userFigureString = userProfile?.figureString;
  const userRooms = useMemo(() => userProfile?.data?.rooms || [], [userProfile?.data?.rooms]);

  // Verificar se é o dono da foto
  const isPhotoOwner = habboAccount && habboAccount.habbo_name && 
    habboAccount.habbo_name.toLowerCase() === effectiveUserName.toLowerCase();

  // Buscar legenda da foto
  useEffect(() => {
    const fetchCaption = async () => {
      const photoId = photo.id || (photo as any).photo_id;
      if (!photoId) return;
      
      try {
        const { data, error } = await supabase
          .from('habbo_photos')
          .select('caption')
          .eq('photo_id', photoId)
          .maybeSingle(); // Usar maybeSingle ao invés de single para não dar erro quando não há registro
        
        if (error) {
          console.error('Erro ao buscar legenda:', error);
          return;
        }
        
        if (data?.caption) {
          setCaptionText(data.caption);
        } else {
          setCaptionText('');
        }
      } catch (error) {
        console.error('Erro ao buscar legenda:', error);
      }
    };

    fetchCaption();
  }, [photo.id, (photo as any).photo_id]);

  // Fechar menu dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target as Node)) {
        setShowMenuDropdown(false);
      }
    };

    if (showMenuDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenuDropdown]);

  // Salvar legenda
  const handleSaveCaption = async () => {
    const photoId = photo.id || (photo as any).photo_id;
    if (!photoId || !habboAccount) {
      toast.error('Você precisa estar logado para adicionar legenda');
      return;
    }

    if (!isPhotoOwner) {
      toast.error('Apenas o dono da foto pode adicionar legenda');
      return;
    }

    setIsSavingCaption(true);
    
    try {
      console.log('Salvando legenda para photo_id:', photoId);
      console.log('Texto da legenda:', captionText);
      console.log('Foto completa:', photo);
      
      // Tentar buscar o registro da foto pelo photo_id
      let photoData = null;
      let fetchError = null;
      
      // Primeira tentativa: buscar por photo_id
      const { data: data1, error: error1 } = await supabase
        .from('habbo_photos')
        .select('id, photo_id, habbo_name, hotel')
        .eq('photo_id', photoId)
        .maybeSingle();
      
      if (error1) {
        console.error('Erro ao buscar foto por photo_id:', error1);
        fetchError = error1;
      } else if (data1) {
        photoData = data1;
      } else {
        // Segunda tentativa: buscar por s3_url se disponível
        if (photo.s3_url) {
          const { data: data2, error: error2 } = await supabase
            .from('habbo_photos')
            .select('id, photo_id, habbo_name, hotel')
            .eq('s3_url', photo.s3_url)
            .maybeSingle();
          
          if (error2) {
            console.error('Erro ao buscar foto por s3_url:', error2);
          } else if (data2) {
            photoData = data2;
          }
        }
      }

      console.log('Resultado da busca:', { photoData, fetchError });

      if (fetchError && !photoData) {
        throw fetchError;
      }

      if (photoData) {
        console.log('Atualizando legenda para registro:', photoData.id);
        // Atualizar legenda existente
        const { data: updatedData, error: updateError } = await supabase
          .from('habbo_photos')
          .update({ caption: captionText.trim() || null })
          .eq('id', photoData.id)
          .select()
          .single();

        console.log('Resultado da atualização:', { updatedData, updateError });

        if (updateError) {
          console.error('Erro ao atualizar legenda:', updateError);
          throw updateError;
        }

        // Atualizar estado local com a legenda salva
        setCaptionText(updatedData.caption || '');
        toast.success('Legenda salva com sucesso!');
        setIsEditingCaption(false);
        setShowMenuDropdown(false);
      } else {
        // Foto não encontrada no banco - tentar criar registro se possível
        console.warn('Foto não encontrada no banco para photo_id:', photoId);
        
        // Se temos informações suficientes, criar o registro
        if (photo.s3_url && habboAccount.habbo_name) {
          console.log('Tentando criar registro para a foto...');
          const { data: newPhotoData, error: insertError } = await supabase
            .from('habbo_photos')
            .insert({
              photo_id: photoId,
              habbo_id: habboAccount.habbo_id || habboAccount.habbo_name,
              habbo_name: habboAccount.habbo_name,
              hotel: habboAccount.hotel || 'br',
              s3_url: photo.s3_url,
              caption: captionText.trim() || null,
              preview_url: photo.preview_url || null,
              room_name: photo.roomName || null,
            })
            .select()
            .single();

          if (insertError) {
            console.error('Erro ao criar registro da foto:', insertError);
            toast.error('Erro ao criar registro da foto. Tente novamente.');
          } else {
            console.log('Registro criado com sucesso:', newPhotoData);
            setCaptionText(newPhotoData.caption || '');
            toast.success('Legenda salva com sucesso!');
            setIsEditingCaption(false);
            setShowMenuDropdown(false);
          }
        } else {
          toast.error('Foto não encontrada no banco de dados. Não foi possível salvar a legenda.');
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar legenda:', error);
      toast.error(error?.message || 'Erro ao salvar legenda');
    } finally {
      setIsSavingCaption(false);
    }
  };

  // Usar diretamente o roomName fornecido pelas Edge Functions (já vem correto)
  useEffect(() => {
    if (!photo.roomName) {
      setRoomDisplayName(null);
      setExtractedRoomId(null);
      return;
    }
    
    // Prioridade: 1) roomId direto, 2) extrair do roomName (ex: "Room 117037234" -> "117037234"), 3) tentar extrair qualquer número do roomName
    let roomId: string | null = null;
    
    if (photo.roomId) {
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
    
    // Se ainda não temos roomId e temos quartos do usuário, tentar encontrar o quarto correspondente
    // Isso é útil quando roomName é "Quarto do jogo" mas o usuário tem apenas um quarto
    if (!roomId && userRooms.length === 1) {
      roomId = String(userRooms[0].id);
    }
    
    // Armazenar roomId extraído para usar na renderização
    setExtractedRoomId(roomId);
    
    // Usar diretamente o roomName fornecido pelas Edge Functions (já vem com o nome correto)
    setRoomDisplayName(photo.roomName);
  }, [photo.roomName, photo.roomId, userRooms]);

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
                {isPhotoOwner && (
                  <div className="relative" ref={menuDropdownRef}>
                    <button 
                      className="text-white/60 hover:text-white transition-colors"
                      onClick={() => setShowMenuDropdown(!showMenuDropdown)}
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showMenuDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50">
                        <button
                          onClick={() => {
                            setIsEditingCaption(true);
                            setShowMenuDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 transition-colors rounded-t-lg"
                        >
                          Adicionar Legenda
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
                    setSelectedRoomHotel('');
                  }}
                />
              )}
              
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
            <div className="space-y-1 pt-2 pb-3">
              {/* Localização do quarto */}
              {photo.roomName && (
                <div>
                  {(() => {
                    // Usar roomId extraído do useEffect (que já considera fallback de userRooms)
                    // Se não houver, tentar extrair diretamente do photo (mesma lógica do EnhancedPhotoCard)
                    let roomId: string | null = extractedRoomId;
                    
                    if (!roomId && photo.roomId) {
                      // Usar roomId direto se disponível
                      roomId = String(photo.roomId);
                    } else if (!roomId) {
                      // Tentar extrair do formato "Room XXXXX" como fallback
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
                    
                    // Se ainda não temos roomId e temos quartos do usuário, tentar encontrar o quarto correspondente
                    if (!roomId && userRooms.length === 1) {
                      roomId = String(userRooms[0].id);
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
              
              {/* Legenda */}
              {isEditingCaption ? (
                <div className="mt-2">
                  <textarea
                    value={captionText}
                    onChange={(e) => setCaptionText(e.target.value)}
                    placeholder="Adicione uma legenda para esta foto..."
                    maxLength={300}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      onClick={() => {
                        setIsEditingCaption(false);
                        // Restaurar legenda original se cancelar
                        const photoId = photo.id || (photo as any).photo_id;
                        const fetchCaption = async () => {
                          if (!photoId) {
                            setCaptionText('');
                            return;
                          }
                          try {
                            const { data } = await supabase
                              .from('habbo_photos')
                              .select('caption')
                              .eq('photo_id', photoId)
                              .maybeSingle();
                            if (data?.caption) {
                              setCaptionText(data.caption);
                            } else {
                              setCaptionText('');
                            }
                          } catch (error) {
                            setCaptionText('');
                          }
                        };
                        fetchCaption();
                      }}
                      className="px-3 py-1 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveCaption}
                      disabled={isSavingCaption}
                      className="px-3 py-1 text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded transition-colors disabled:opacity-50"
                    >
                      {isSavingCaption ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                captionText && (
                  <div className="mt-2">
                    <p className="text-xs text-white/80 break-words whitespace-pre-wrap">
                      {captionText}
                    </p>
                    {isPhotoOwner && (
                      <button
                        onClick={() => setIsEditingCaption(true)}
                        className="mt-1 text-xs text-white/60 hover:text-white transition-colors"
                      >
                        Editar legenda
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

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
    </div>
  );
};
