import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, Search, Heart, Loader2, AlertCircle, Globe, MessageCircle, Ellipsis, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGlobalPhotos } from '@/hooks/useGlobalPhotos';
import { useMyConsoleProfile } from '@/hooks/useMyConsoleProfile';
import { useI18n } from '@/contexts/I18nContext';
import { useCommentRateLimit } from '@/hooks/useCommentRateLimit';
import { validateComment, sanitizeComment, COMMENT_CONFIG } from '@/utils/commentValidation';
import { PhotoModal } from '../console/PhotoModal';
import { toast } from 'sonner';

export const FindPhotoFeedColumn: React.FC = () => {
  const { habboAccount } = useMyConsoleProfile();
  const { t } = useI18n();
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Rate limiting para comentários
  const { checkCanComment, recordComment } = useCommentRateLimit();
  
  const { 
    data: globalPhotos = [], 
    isLoading, 
    error, 
    refetch 
  } = useGlobalPhotos(
    (habboAccount as any)?.hotel || 'br',
    50, // Limite de 50 fotos por página
    currentPage // Página atual
  );

  // Atualizar allPhotos quando globalPhotos mudar
  useEffect(() => {
    if (globalPhotos.length > 0) {
      if (currentPage === 1) {
        // Primeira página - substituir todas as fotos
        setAllPhotos(globalPhotos);
      } else {
        // Páginas seguintes - adicionar às fotos existentes (evitar duplicação)
        setAllPhotos(prev => {
          const existingIds = new Set(prev.map(photo => photo.id));
          const newPhotos = globalPhotos.filter(photo => !existingIds.has(photo.id));
          return [...prev, ...newPhotos];
        });
      }
      setIsLoadingMore(false);
    } else if (currentPage > 1) {
      // Se não há mais fotos, parar o carregamento
      setIsLoadingMore(false);
    }
  }, [globalPhotos, currentPage]);

  // Intersection Observer para carregar mais fotos
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !isLoading) {
          loadMorePhotos();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, isLoading]);

  const loadMorePhotos = async () => {
    if (isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
    
    // O hook useGlobalPhotos será chamado novamente com a nova página
    // através do refetch ou mudança de parâmetros
  };

  const resetPagination = () => {
    setCurrentPage(1);
    setAllPhotos([]);
    setIsLoadingMore(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString.split('/').reverse().join('-'));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h atrás`;
    if (minutes < 10080) return `${Math.floor(minutes / 1440)}d atrás`;
    if (minutes < 43200) return `há ${Math.floor(minutes / 10080)} semanas`;
    if (minutes < 525600) return `há ${Math.floor(minutes / 43200)} meses`;
    return `há ${Math.floor(minutes / 525600)} anos`;
  };
  
  /**
   * Enviar comentário com validação e rate limiting
   */
  const handleSubmitComment = async (photoId: string) => {
    if (!habboAccount) {
      toast.error('Você precisa estar logado para comentar');
      return;
    }
    
    // Verificar rate limit
    const rateLimitStatus = checkCanComment(photoId);
    if (!rateLimitStatus.canComment) {
      toast.error(rateLimitStatus.error || 'Você está comentando muito rápido');
      return;
    }

    // Validar comentário
    const validation = validateComment(commentText);
    if (!validation.isValid) {
      toast.error(validation.error || 'Comentário inválido');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sanitized = sanitizeComment(commentText);
      
      // TODO: Implementar envio ao banco de dados
      console.log('📝 Enviando comentário:', { photoId, text: sanitized });
      
      // Registrar ação para rate limiting
      recordComment(photoId);
      
      // Limpar campo
      setCommentText('');
      toast.success('Comentário enviado!');
      
    } catch (error: any) {
      console.error('Erro ao enviar comentário:', error);
      toast.error('Erro ao enviar comentário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto({
      id: photo.id,
      imageUrl: photo.imageUrl,
      date: photo.date,
      likes: photo.likes,
      caption: photo.caption,
      roomName: photo.roomName
    });
  };

  // Filtrar fotos baseado no termo de busca
  const filteredPhotos = allPhotos.filter(photo => 
    photo.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (photo.caption && photo.caption.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (photo.roomName && photo.roomName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <img
              src="/assets/console/hotelfilter.png"
              alt="Filtro"
              className="h-5 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            Feed Global da Comunidade
          </h3>
          <div className="text-sm text-white/60">Carregando...</div>
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden mb-4 relative animate-pulse">
              <div className="px-1 py-2 bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex-shrink-0 overflow-hidden bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-1" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-muted rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <img
              src="/assets/console/hotelfilter.png"
              alt="Filtro"
              className="h-5 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            Feed Global da Comunidade
          </h3>
          <div className="text-sm text-white/60">Erro</div>
        </div>
        <div className="text-center py-8 space-y-3">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <div className="text-muted-foreground">
            <p className="font-medium">Erro ao carregar feed</p>
            <p className="text-sm">{error.message}</p>
          </div>
          <Button variant="outline" onClick={() => {
            resetPagination();
            refetch();
          }}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (globalPhotos.length === 0) {
    return (
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <img
              src="/assets/console/hotelfilter.png"
              alt="Filtro"
              className="h-5 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            Feed Global da Comunidade
          </h3>
          <div className="text-sm text-white/60">0 fotos</div>
        </div>
        <div className="text-center py-8 space-y-3">
          <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
          <div className="text-muted-foreground">
            <p className="font-medium">{t('pages.console.noPhotos')}</p>
            <p className="text-sm">{t('pages.console.noCommunityPhotos')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 relative">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <img
              src="/assets/console/hotelfilter.png"
              alt="Filtro"
              className="h-5 w-auto object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
            Feed Global da Comunidade
          </h3>
          <div className="text-sm text-white/60">{filteredPhotos.length} fotos</div>
        </div>
        
        {/* Barra de busca */}
        <div className="px-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              type="text"
              placeholder={t('pages.console.searchUser')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-yellow-400"
            />
          </div>
        </div>
        
        <div className="space-y-4 overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {filteredPhotos.length === 0 && searchTerm ? (
            <div className="text-center py-8 space-y-3">
              <Search className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-muted-foreground">
                <p className="font-medium">{t('pages.console.noPhotos')}</p>
                <p className="text-sm">Tente buscar por outro termo</p>
              </div>
            </div>
          ) : (
            filteredPhotos.map((photo) => (
              <div key={`${photo.userName}-${photo.id}`} className="overflow-hidden mb-4 relative">
                {/* Header do post */}
                <div className="px-1 py-2 bg-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 overflow-hidden">
                      <img
                        src={photo.userAvatar}
                        alt={photo.userName}
                        className="w-full h-full cursor-pointer transition-opacity object-cover"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/48x48/4B5563/FFFFFF?text=${photo.userName[0]}`;
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <button className="font-semibold text-white hover:text-yellow-400 transition-colors">
                        {photo.userName}
                      </button>
                      <div className="text-xs text-white/60">
                        {formatTimeAgo(photo.date)}
                      </div>
                    </div>
                    <button className="text-white/60 hover:text-white transition-colors">
                      <Ellipsis className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Foto */}
                <div className="relative">
                  <img
                    src={photo.imageUrl}
                    alt={`Foto de ${photo.userName}`}
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={() => handlePhotoClick(photo)}
                    onError={(e) => {
                      e.currentTarget.src = `https://placehold.co/400x400/4B5563/FFFFFF?text=Foto+Não+Disponível`;
                    }}
                  />
                  <div className="absolute bottom-2 left-2">
                    <img src="/hub.gif" alt="Hub" className="w-6 h-6 opacity-80" style={{ display: 'none' }} />
                  </div>
                </div>

                {/* Ações (likes e comentários) */}
                <div className="px-1 py-2 bg-transparent">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 transition-colors text-white/60 hover:text-red-500">
                      <Heart className="w-6 h-6" />
                      <button className="text-sm font-medium hover:underline">{photo.likes}</button>
                    </button>
                    <button className="flex items-center gap-2 text-white/60 transition-colors">
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-sm font-medium">0</span>
                    </button>
                  </div>
                </div>

                {/* Campo de comentário */}
                <div className="px-1 py-2 bg-transparent">
                  <form className="flex items-center gap-2" onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitComment(photo.id || photo.photo_id);
                  }}>
                    <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                      <img
                        src={habboAccount?.habbo_name
                          ? `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=2&headonly=1`
                          : `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`
                        }
                        alt={habboAccount?.habbo_name || 'Usuário'}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`;
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
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 pr-10 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-yellow-400 text-sm disabled:opacity-50"
                      />
                      
                      {/* Botão de enviar - só aparece quando há texto */}
                      {commentText.trim() && (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('pages.console.sendComment')}
                        >
                          <Send className="w-4 h-4" />
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
            ))
          )}
          
          {/* Elemento para detectar quando carregar mais fotos */}
          <div ref={loadMoreRef} className="py-4">
            {isLoadingMore && (
              <div className="flex items-center justify-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-white/60" />
                <span className="text-white/60 text-sm">Carregando mais fotos...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoModal
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photo={selectedPhoto}
        />
      )}
    </>
  );
};