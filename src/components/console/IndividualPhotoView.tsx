import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { EnhancedPhoto } from '@/types/habbo';
import { usePhotoLikes } from '@/hooks/usePhotoLikes';
import { useAuth } from '@/hooks/useAuth';
import { useI18n } from '@/contexts/I18nContext';
import { useCommentRateLimit } from '@/hooks/useCommentRateLimit';
import { validateComment, sanitizeComment, COMMENT_CONFIG } from '@/utils/commentValidation';
import { toast } from 'sonner';

interface IndividualPhotoViewProps {
  photo: {
    id: string;
    imageUrl: string;
    date: string;
    likes: number;
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
  
  // Hook de likes com armazenamento no banco
  const { likesCount, userLiked, toggleLike, isToggling, likes } = usePhotoLikes(photo.id);
  
  // Rate limiting
  const { checkCanComment, recordComment } = useCommentRateLimit();
  
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
  const handleSubmitComment = async () => {
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
      
      // TODO: Implementar envio ao banco de dados
      console.log('📝 Enviando comentário:', { photoId, text: sanitized });
      
      // Registrar ação para rate limiting
      recordComment(photoId);
      
      // Limpar campo
      setCommentText('');
      toast.success(t('toast.commentSent'));
      
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
    <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent">
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
                    src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${userName}&size=l&direction=2&head_direction=3&headonly=1`} 
                    alt={userName} 
                    className="w-full h-full cursor-pointer transition-opacity object-cover" 
                    style={{imageRendering: 'pixelated'}}
                    onClick={() => onUserClick(userName)}
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
                src={photo.imageUrl} 
                alt={`Foto de ${userName}`} 
                className="w-full h-auto object-contain"
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
                                  src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${like.habbo_name}&size=m&direction=2&head_direction=3&headonly=1`} 
                                  alt={like.habbo_name} 
                                  className="w-full h-full object-cover" 
                                  style={{imageRendering: 'pixelated'}}
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
              
              {/* Popover de Comentários */}
              {showCommentsPopover && (
                <div className="absolute inset-0 z-50 flex items-end justify-center animate-in fade-in duration-200">
                  {/* Overlay escuro */}
                  <div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowCommentsPopover(false)}
                  ></div>
                  
                  {/* Modal que desliza de baixo para cima */}
                  <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-yellow-400 rounded-t-2xl shadow-2xl max-h-[50vh] flex flex-col animate-in slide-in-from-bottom duration-300 ease-out">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-400 to-yellow-300 border-b-2 border-yellow-500 rounded-t-xl">
                      <h3 className="text-sm font-bold text-white" style={{
                        textShadow: '2px 2px 0px #000000, -1px -1px 0px #000000, 1px -1px 0px #000000, -1px 1px 0px #000000'
                      }}>
                        Comentários
                      </h3>
                      <button 
                        onClick={() => setShowCommentsPopover(false)}
                        className="text-white hover:bg-white/20 rounded-full p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="text-center text-white/60 text-sm">
                        Sistema de comentários em desenvolvimento
                      </div>
                    </div>
                  </div>
                </div>
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
                  <span className="text-sm font-medium">0</span>
                </button>
              </div>
            </div>

            {/* Campo de comentário */}
            <div className="px-1 py-2 bg-transparent">
              <form className="flex items-center gap-2" onSubmit={(e) => {
                e.preventDefault();
                handleSubmitComment();
              }}>
                <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                  <img 
                    src={habboAccount?.habbo_name
                      ? `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=m&direction=2&head_direction=2&headonly=1`
                      : `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`
                    } 
                    alt={habboAccount?.habbo_name || 'Guest'} 
                    className="w-full h-full object-cover" 
                    style={{imageRendering: 'pixelated'}}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?figure=hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-&size=m&direction=2&head_direction=2&headonly=1`;
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
            
            <div className="border-t border-white/10 pt-3"></div>
          </div>
        </div>
      </div>
      
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
  );
};
