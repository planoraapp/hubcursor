import React, { useState, useEffect, useRef } from 'react';
import { useGlobalPostsFeed } from '@/hooks/useGlobalPostsFeed';
import { FriendsPostsFeed, FeedPost, PostComment } from './FriendsPostsFeed';
import { PostDetailView } from './PostDetailView';
import { LoadingSpinner } from './LoadingSpinner';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountryDropdown } from './shared/CountryDropdown';
import { getAvatarUrl } from '@/utils/avatarHelpers';
import { validatePost, sanitizePost, POST_CONFIG } from '@/utils/postValidation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GlobalPostsFeedColumnProps {
  hotel?: string;
  className?: string;
  onNavigateToProfile?: (username: string, hotelDomain?: string, uniqueId?: string) => void;
  refreshTrigger?: number;
  onPostViewChange?: (isViewing: boolean) => void;
}

const GlobalPostsFeedColumn: React.FC<GlobalPostsFeedColumnProps> = ({
  hotel = 'all',
  className = '',
  onNavigateToProfile,
  refreshTrigger = 0,
  onPostViewChange
}) => {
  const { t } = useI18n();
  const { habboAccount } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    const h = hotel || 'all';
    return typeof h === 'string' ? h : 'all';
  });
  const [viewingPost, setViewingPost] = useState<FeedPost | null>(null);
  const [newPostText, setNewPostText] = useState('');

  // Notificar mudança de visualização de post
  const onPostViewChangeRef = useRef(onPostViewChange);
  useEffect(() => {
    onPostViewChangeRef.current = onPostViewChange;
  }, [onPostViewChange]);
  
  useEffect(() => {
    onPostViewChangeRef.current?.(!!viewingPost);
  }, [viewingPost]);

  // Converter hotel para formato correto
  const hotelCode = React.useMemo(() => {
    const country = selectedCountry || 'all';
    if (typeof country !== 'string') return 'all';
    if (country === 'all') return 'all';
    if (country === 'br') return 'com.br';
    if (country === 'tr') return 'com.tr';
    return country;
  }, [selectedCountry]);

  const {
    posts,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refreshFeed,
    addPost,
    likePost,
    addComment,
    deletePost,
    deleteComment,
    fetchPostComments
  } = useGlobalPostsFeed({
    limit: 20,
    hotel: typeof hotelCode === 'string' ? hotelCode : 'all'
  });

  // Buscar comentários quando visualizar um post
  useEffect(() => {
    if (viewingPost && (!viewingPost.comments || viewingPost.comments.length === 0)) {
      const postId = viewingPost.id;
      if (typeof postId === 'string' && postId) {
        fetchPostComments(postId).then(comments => {
          setViewingPost(prev => prev ? { ...prev, comments } : null);
        }).catch(err => {
          console.error('[📝 GLOBAL POSTS FEED] Error fetching comments:', err);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingPost?.id]);

  // Atualizar selectedCountry quando hotel prop mudar (apenas se não estiver visualizando post)
  useEffect(() => {
    if (!viewingPost) {
      const h = hotel || 'all';
      setSelectedCountry(typeof h === 'string' ? h : 'all');
    }
  }, [hotel, viewingPost]);

  // Resetar quando hotel mudar (apenas se não estiver visualizando post)
  useEffect(() => {
    if (!viewingPost && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [hotelCode, viewingPost]);

  // Refresh quando trigger mudar
  const lastRefreshTriggerRef = useRef(typeof refreshTrigger === 'number' ? refreshTrigger : 0);
  useEffect(() => {
    const trigger = typeof refreshTrigger === 'number' ? refreshTrigger : 0;
    if (trigger > lastRefreshTriggerRef.current) {
      lastRefreshTriggerRef.current = trigger;
      refreshFeed();
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [refreshTrigger, refreshFeed]);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, loadMore]);

  const handleCreatePost = async () => {
    if (!habboAccount || !newPostText.trim()) return;

    const validation = validatePost(newPostText);
    if (!validation.isValid) {
      toast.error(validation.error || 'Erro ao validar post');
      return;
    }

    try {
      await addPost(newPostText);
      setNewPostText('');
    } catch (error: any) {
      console.error('[📝 GLOBAL POSTS FEED] Error creating post:', error);
      // O erro já é tratado no hook, não precisa mostrar novamente
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Seção de criação de post */}
      {!viewingPost && (
        <div className="px-2 mb-2 flex items-center gap-2 flex-shrink-0">
          <div className="w-12 h-12 flex-shrink-0 overflow-hidden rounded">
            <img
              src={
                habboAccount?.habbo_name
                  ? getAvatarUrl(
                      habboAccount.habbo_name,
                      habboAccount.hotel || 'br',
                      habboAccount.figure_string,
                      {
                        size: 'm',
                        direction: 2,
                        headDirection: 3,
                        headOnly: true
                      }
                    )
                  : getAvatarUrl('', 'br', 'hr-100-7-.hd-190-7-.ch-210-66-.lg-270-82-.sh-290-80-', {
                      size: 'm',
                      direction: 2,
                      headDirection: 3,
                      headOnly: true
                    })
              }
              alt={habboAccount?.habbo_name || 'Usuário'}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="relative flex-1" style={{ zIndex: 100 }}>
            <div className="flex flex-col">
              <div className="flex items-center bg-white/10 border border-white/30 rounded focus-within:border-white/70 transition-colors h-8">
                <input
                  type="text"
                  value={newPostText}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= POST_CONFIG.MAX_LENGTH) {
                      setNewPostText(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newPostText.trim() && habboAccount) {
                      e.preventDefault();
                      handleCreatePost();
                    }
                  }}
                  placeholder={habboAccount ? t('pages.console.newPostPlaceholder') : t('pages.console.loginRequired')}
                  disabled={!habboAccount}
                  maxLength={POST_CONFIG.MAX_LENGTH}
                  className="flex-1 bg-transparent text-white text-sm px-3 py-1 placeholder-white/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {newPostText.trim() && habboAccount && (
                  <button
                    type="button"
                    onClick={handleCreatePost}
                    className="px-2 py-1 text-white/80 hover:text-white transition-colors flex items-center justify-center h-full flex-shrink-0"
                    title={t('pages.console.publish')}
                    style={{ minWidth: '32px' }}
                  >
                    <img
                      src="/assets/write.png"
                      alt={t('pages.console.publish')}
                      className="w-4 h-4"
                      style={{ imageRendering: 'pixelated', objectFit: 'contain' }}
                    />
                  </button>
                )}
              </div>
              {habboAccount && newPostText.length >= 100 && (
                <div className="flex justify-end mt-1">
                  <span
                    className={cn(
                      "text-xs",
                      newPostText.length > POST_CONFIG.MAX_LENGTH * 0.9
                        ? "text-red-400"
                        : newPostText.length > POST_CONFIG.MAX_LENGTH * 0.7
                        ? "text-yellow-400"
                        : "text-white/50"
                    )}
                  >
                    {newPostText.length}/{POST_CONFIG.MAX_LENGTH}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo do feed */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent"
      >
        {viewingPost ? (
          <PostDetailView
              post={viewingPost}
              onBack={() => setViewingPost(null)}
              onLikePost={async (postId) => {
                await likePost(postId);
                // Atualizar post visualizado se for o mesmo
                if (viewingPost?.id === postId) {
                  const updatedPost = posts.find(p => p.id === postId);
                  if (updatedPost) {
                    setViewingPost({ ...updatedPost, comments: viewingPost.comments || [] });
                  }
                }
              }}
              onAddComment={async (postId, text) => {
                await addComment(postId, text);
                // Buscar comentários atualizados
                const comments = await fetchPostComments(postId);
                const updatedPost = posts.find(p => p.id === postId);
                if (updatedPost) {
                  setViewingPost({ ...updatedPost, comments });
                }
              }}
              onDeletePost={async (postId) => {
                await deletePost(postId);
                setViewingPost(null);
              }}
              onDeleteComment={async (postId, commentId) => {
                await deleteComment(postId, commentId);
                const updatedPost = posts.find(p => p.id === postId);
                if (updatedPost) {
                  setViewingPost(updatedPost);
                }
              }}
              onNavigateToProfile={onNavigateToProfile}
            />
        ) : (
          <>
            {isLoading && posts.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="text-center py-8 space-y-3">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <div className="text-white/80">
                  <p className="font-medium">Erro ao carregar feed</p>
                  <p className="text-sm text-white/60">
                    {error.message?.includes('404') || error.message?.includes('does not exist') || error.message?.includes('PGRST116')
                      ? 'Tabela feed_posts não existe. Execute a migration primeiro.'
                      : error.message || 'Erro desconhecido'}
                  </p>
                </div>
                <Button variant="outline" onClick={refreshFeed}>
                  Tentar novamente
                </Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-white/60 mb-2">Nenhum post ainda</p>
                <p className="text-white/40 text-sm">Seja o primeiro a publicar no feed</p>
              </div>
            ) : (
              <>
                <FriendsPostsFeed
                  posts={posts}
                  onNavigateToProfile={onNavigateToProfile}
                  onLikePost={async (postId) => {
                    await likePost(postId);
                  }}
                  onViewPost={async (post) => {
                    // Buscar comentários antes de visualizar
                    const comments = await fetchPostComments(post.id);
                    setViewingPost({ ...post, comments });
                  }}
                  onDeletePost={async (postId) => {
                    await deletePost(postId);
                  }}
                  onAddComment={async (postId, text) => {
                    await addComment(postId, text);
                  }}
                  onDeleteComment={async (postId, commentId) => {
                    await deleteComment(postId, commentId);
                  }}
                  currentUserName={habboAccount?.habbo_name}
                />
                {hasMore && (
                  <div ref={sentinelRef} className="flex justify-center py-4">
                    {isLoadingMore && <LoadingSpinner />}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GlobalPostsFeedColumn;
