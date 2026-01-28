import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { getAvatarUrl, getAvatarHeadUrl, getAvatarFallbackUrl } from "@/utils/avatarHelpers";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedPost, PostComment } from "./FriendsPostsFeed";
import { PostDetailView } from "./PostDetailView";
import { useAuth } from "@/hooks/useAuth";
import { validateComment, sanitizeComment } from "@/utils/postValidation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHotelFlag } from "@/utils/hotelHelpers";

// Função para formatar data de posts
const formatPostDate = (dateString: string | Date, includeTime: boolean = false): string => {
  const postDate = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (!postDate || Number.isNaN(postDate.getTime())) {
    return dateString.toString();
  }

  const now = new Date();
  const diffMs = now.getTime() - postDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  // Se deve incluir hora completa (visualização individual ou lista completa)
  if (includeTime) {
    return postDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Menos de 1 minuto: "agora"
  if (diffMinutes < 1) {
    return "agora";
  }

  // Menos de 1 hora: "há X min"
  if (diffMinutes < 60) {
    return `há ${diffMinutes} min`;
  }

  // Menos de 24 horas: "há Xh"
  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }

  // A partir de 24h: data concisa (28/01/26)
  return postDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};

interface ProfilePostsSectionProps {
  viewingUsername: string;
  currentUserName?: string;
  onNavigateToProfile?: (username: string, hotelDomain?: string, uniqueId?: string) => void;
  hotel?: string;
  onViewingPostChange?: (isViewing: boolean) => void;
  setActiveTab?: (tab: string) => void;
  setSelectedPost?: (post: FeedPost | null) => void;
  showHeader?: boolean; // Se false, não mostra o header "Posts (X)" e botão "Ver Todos"
  showAllPosts?: boolean; // Se true, mostra todos os posts ao invés de apenas 3
}

export const ProfilePostsSection: React.FC<ProfilePostsSectionProps> = ({
  viewingUsername,
  currentUserName,
  onNavigateToProfile,
  hotel = "br",
  onViewingPostChange,
  setActiveTab,
  setSelectedPost,
  showHeader = true,
  showAllPosts = false,
}) => {
  const { t } = useI18n();
  const { habboAccount } = useAuth();
  const queryClient = useQueryClient();
  const [viewingAllPosts, setViewingAllPosts] = useState(false);
  const [viewingPost, setViewingPost] = useState<FeedPost | null>(null);
  const [localPosts, setLocalPosts] = useState<FeedPost[]>([]);
  
  // Estado para controlar visualização de todos os posts em uma aba separada (feed completo)
  const [viewingAllPostsFeed, setViewingAllPostsFeed] = useState(false);
  
  // Guardar se estava visualizando feed completo quando abriu post individual
  const [wasViewingAllPostsFeed, setWasViewingAllPostsFeed] = useState(false);

  // Normalizar hotel para formato do banco (br, com, es, etc.)
  const hotelCode = React.useMemo(() => {
    if (!hotel) {
      return 'br';
    }
    
    let normalized: string;
    if (hotel === 'com.br') {
      normalized = 'br';
    } else if (hotel === 'com.tr') {
      normalized = 'tr';
    } else if (hotel === 'com' || hotel === 'us') {
      normalized = 'com';
    } else {
      normalized = hotel;
    }
    
    return normalized;
  }, [hotel]);

  // Buscar posts do usuário do Supabase
  const { data: userPosts = [], isLoading: isLoadingPosts, error: queryError } = useQuery({
    queryKey: ['user-posts', viewingUsername, hotelCode],
    enabled: !!viewingUsername && !!hotelCode, // Garantir que está habilitado
    queryFn: async (): Promise<FeedPost[]> => {
      try {
        if (!viewingUsername) {
          return [];
        }

        // Tentar busca exata primeiro (case-sensitive) COM FILTRO DE HOTEL
        // Buscar tanto com hotelCode quanto com formato alternativo (ex: 'br' e 'com.br')
        const hotelVariants = hotelCode === 'br' ? ['br', 'com.br'] : 
                              hotelCode === 'tr' ? ['tr', 'com.tr'] : 
                              hotelCode === 'com' ? ['com', 'us'] : [hotelCode];
        
        let query = supabase
          .from('feed_posts')
          .select('id, user_name, text, hotel, figure_string, created_at')
          .eq('user_name', viewingUsername)
          .in('hotel', hotelVariants);

        const { data: exactData, error: exactError } = await query
          .order('created_at', { ascending: false })
          .limit(100);

        // Se não encontrou com busca exata, tentar case-insensitive COM FILTRO DE HOTEL
        let data = exactData;
        let error = exactError;
        
        if ((!data || data.length === 0) && !error) {
          const { data: ilikeData, error: ilikeError } = await supabase
            .from('feed_posts')
            .select('id, user_name, text, hotel, figure_string, created_at')
            .ilike('user_name', viewingUsername)
            .in('hotel', hotelVariants)
            .order('created_at', { ascending: false })
            .limit(100);
          
          data = ilikeData;
          error = ilikeError;
        }

        if (error) {
          return [];
        }

        if (!data || data.length === 0) {
          return [];
        }

        // Buscar likes do usuário atual
        const postIds = data.map(p => p.id);
        let userLikes: Set<string> = new Set();
        
        const userId = habboAccount?.supabase_user_id;
        if (userId && postIds.length > 0) {
          const { data: likesData } = await supabase
            .from('feed_post_likes')
            .select('post_id')
            .eq('user_id', userId)
            .in('post_id', postIds);
          
          if (likesData) {
            userLikes = new Set(likesData.map(l => l.post_id));
          }
        }

        // Buscar contagem de likes e comentários para cada post, incluindo últimos 3 comentários
        const postsWithCounts = await Promise.all(
          data.map(async (post) => {
            const [likesResult, commentsResult, recentCommentsResult] = await Promise.all([
              supabase
                .from('feed_post_likes')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', post.id),
              supabase
                .from('feed_post_comments')
                .select('id', { count: 'exact', head: true })
                .eq('post_id', post.id),
              supabase
                .from('feed_post_comments')
                .select('id, post_id, user_name, text, hotel, figure_string, created_at')
                .eq('post_id', post.id)
                .order('created_at', { ascending: false })
                .limit(3)
            ]);

            const likesCount = likesResult.count || 0;
            const commentsCount = commentsResult.count || 0;
            
            // Mapear últimos 3 comentários
            const recentComments: PostComment[] = (recentCommentsResult.data || [])
              .reverse() // Reverter para ordem cronológica
              .map(comment => ({
                id: comment.id,
                postId: comment.post_id,
                userName: comment.user_name,
                text: comment.text,
                createdAt: comment.created_at,
                hotel: comment.hotel || 'br',
                figureString: comment.figure_string || undefined
              })) as PostComment[];

            return {
              id: post.id,
              userName: post.user_name,
              text: post.text,
              createdAt: post.created_at,
              hotel: post.hotel || 'br',
              figureString: post.figure_string || undefined,
              likesCount,
              commentsCount,
              userLiked: userLikes.has(post.id),
              comments: recentComments
            } as FeedPost;
          })
        );

        return postsWithCounts;
      } catch (error) {
        return [];
      }
    },
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Tentar apenas 1 vez em caso de erro
  });

  // Log de erros da query
  useEffect(() => {
    if (queryError) {
    }
  }, [queryError]);

  // Criar versão estável de userPosts baseada nos IDs para evitar loops infinitos
  const stableUserPostsIds = React.useMemo(() => {
    if (!userPosts || userPosts.length === 0) return '';
    return userPosts.map(p => String(p.id)).sort().join('|');
  }, [userPosts]);

  // Armazenar userPosts em ref para acesso estável
  const userPostsRef = React.useRef<FeedPost[]>(userPosts);
  React.useEffect(() => {
    userPostsRef.current = userPosts;
  }, [userPosts]);

  // Atualizar posts locais quando userPosts mudar (usando comparação estável)
  const stableUserPostsIdsRef = React.useRef<string>('');
  
  useEffect(() => {
    if (stableUserPostsIds !== stableUserPostsIdsRef.current) {
      stableUserPostsIdsRef.current = stableUserPostsIds;
      setLocalPosts(userPostsRef.current);
    }
  }, [stableUserPostsIds]); // Usar apenas stableUserPostsIds para evitar loops

  // Mutation para like/unlike
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, isLike }: { postId: string; isLike: boolean }) => {
      if (!habboAccount?.supabase_user_id) throw new Error('Usuário não autenticado');
      const userId = habboAccount.supabase_user_id;
      
      if (isLike) {
        const { error } = await supabase
          .from('feed_post_likes')
          .insert({ post_id: postId, user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('feed_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts', viewingUsername, hotelCode] });
    },
    onError: () => {
      toast.error('Erro ao curtir post');
    }
  });

  // Mutation para adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      if (!habboAccount?.supabase_user_id) throw new Error('Usuário não autenticado');
      
      const validation = validateComment(text);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Comentário inválido');
      }
      
      const sanitized = sanitizeComment(text);
      const { data, error } = await supabase
        .from('feed_post_comments')
        .insert({
          post_id: postId,
          user_id: habboAccount.supabase_user_id,
          user_name: habboAccount.habbo_name,
          text: sanitized,
          hotel: habboAccount.hotel || 'br',
          figure_string: habboAccount.figure_string || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts', viewingUsername, hotelCode] });
      toast.success('Comentário adicionado');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Erro ao adicionar comentário');
    }
  });

  // Mutation para deletar post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!habboAccount?.supabase_user_id) throw new Error('Usuário não autenticado');
      const userId = habboAccount.supabase_user_id;
      
      const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts', viewingUsername, hotelCode] });
      toast.success('Post deletado');
    },
    onError: () => {
      toast.error('Erro ao deletar post');
    }
  });

  // Mutation para deletar comentário
  const deleteCommentMutation = useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      if (!habboAccount?.supabase_user_id) throw new Error('Usuário não autenticado');
      const userId = habboAccount.supabase_user_id;
      
      // Verificar se é o autor do comentário ou dono do post
      const { data: commentData } = await supabase
        .from('feed_post_comments')
        .select('user_id, post_id')
        .eq('id', commentId)
        .single();
      
      if (!commentData) throw new Error('Comentário não encontrado');
      
      const { data: postData } = await supabase
        .from('feed_posts')
        .select('user_id')
        .eq('id', postId)
        .single();
      
      const canDelete = commentData.user_id === userId || postData?.user_id === userId;
      if (!canDelete) throw new Error('Sem permissão para deletar');
      
      const { error } = await supabase
        .from('feed_post_comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-posts', viewingUsername, hotelCode] });
      toast.success('Comentário deletado');
    },
    onError: () => {
      toast.error('Erro ao deletar comentário');
    }
  });

  // Buscar comentários quando necessário
  const fetchPostComments = async (postId: string): Promise<PostComment[]> => {
    try {
      const { data, error } = await supabase
        .from('feed_post_comments')
        .select('id, post_id, user_name, text, hotel, figure_string, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(comment => ({
        id: comment.id,
        postId: comment.post_id,
        userName: comment.user_name,
        text: comment.text,
        createdAt: comment.created_at,
        hotel: comment.hotel || 'br',
        figureString: comment.figure_string || undefined
      })) as PostComment[];
    } catch (error) {
      return [];
    }
  };

  // Buscar comentários quando visualizar um post
  // Buscar comentários quando viewingPost muda (apenas para fallback quando não há setActiveTab/setSelectedPost)
  useEffect(() => {
    if (viewingPost && (!setActiveTab || !setSelectedPost) && (!viewingPost.comments || viewingPost.comments.length === 0)) {
      const postId = viewingPost.id;
      if (typeof postId === 'string' && postId) {
        fetchPostComments(postId).then(comments => {
          setViewingPost(prev => prev ? { ...prev, comments } : null);
        }).catch(err => {
        });
      }
    }
  }, [viewingPost?.id, setActiveTab, setSelectedPost]);


  // Mostrar apenas os 3 últimos posts (ou todos se showAllPosts for true)
  const displayedPosts = showAllPosts ? localPosts : (viewingAllPosts ? localPosts : localPosts.slice(0, 3));
  const hasMorePosts = !showAllPosts && localPosts.length > 3;

  const handleLikePost = async (postId: string) => {
    const post = localPosts.find(p => p.id === postId);
    if (!post) return;
    
    const isLike = !post.userLiked;
    likePostMutation.mutate({ postId, isLike });
    
    // Atualização otimista
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              userLiked: isLike,
              likesCount: (p.likesCount || 0) + (isLike ? 1 : -1),
            }
          : p
      )
    );
    // Atualizar viewingPost local apenas se não estiver usando aba específica
    if (viewingPost?.id === postId && (!setActiveTab || !setSelectedPost)) {
      setViewingPost((prev) =>
        prev
          ? {
              ...prev,
              userLiked: isLike,
              likesCount: (prev.likesCount || 0) + (isLike ? 1 : -1),
            }
          : null
      );
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    addCommentMutation.mutate({ postId, text });
    
    // Buscar comentários atualizados após adicionar
    setTimeout(() => {
      fetchPostComments(postId).then(comments => {
        setLocalPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments, commentsCount: comments.length }
              : p
          )
        );
        // Atualizar viewingPost local apenas se não estiver usando aba específica
        if (viewingPost?.id === postId && (!setActiveTab || !setSelectedPost)) {
          setViewingPost((prev) =>
            prev ? { ...prev, comments, commentsCount: comments.length } : null
          );
        }
      });
    }, 500);
  };

  const handleDeletePost = async (postId: string) => {
    deletePostMutation.mutate(postId);
    setLocalPosts((prev) => prev.filter((p) => p.id !== postId));
    // Se estiver visualizando o post deletado, fechar visualização
    if (viewingPost?.id === postId && (!setActiveTab || !setSelectedPost)) {
      setViewingPost(null);
    }
    // Se estiver na aba específica, o FunctionalConsole vai lidar com isso
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    deleteCommentMutation.mutate({ postId, commentId });
    
    // Atualização otimista
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentsCount: Math.max(0, (p.commentsCount || 0) - 1),
              comments: (p.comments || []).filter((c) => c.id !== commentId),
            }
          : p
      )
    );
    // Atualizar viewingPost local apenas se não estiver usando aba específica
    if (viewingPost?.id === postId && (!setActiveTab || !setSelectedPost)) {
      setViewingPost((prev) =>
        prev
          ? {
              ...prev,
              commentsCount: Math.max(0, (prev.commentsCount || 0) - 1),
              comments: (prev.comments || []).filter((c) => c.id !== commentId),
            }
          : null
      );
    }
  };

  // Notificar AccountTab quando um post está sendo visualizado (apenas para fallback)
  const viewingPostIdRef = React.useRef<string | null>(null);
  const onViewingPostChangeRef = React.useRef(onViewingPostChange);
  
  // Atualizar ref quando callback mudar
  useEffect(() => {
    onViewingPostChangeRef.current = onViewingPostChange;
  }, [onViewingPostChange]);
  
  useEffect(() => {
    const currentPostId = viewingPost?.id || null;
    if (currentPostId !== viewingPostIdRef.current) {
      viewingPostIdRef.current = currentPostId;
      if (onViewingPostChangeRef.current && (!setActiveTab || !setSelectedPost)) {
        onViewingPostChangeRef.current(!!viewingPost);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingPost?.id]); // Usar apenas viewingPost?.id para evitar loops
  
  // Renderizar visualização local apenas se não tiver setActiveTab/setSelectedPost (fallback)
  if (viewingPost && (!setActiveTab || !setSelectedPost)) {
    return (
      <div className="absolute inset-0 z-50 bg-transparent flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="h-full w-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent px-4 py-4">
            <PostDetailView
              post={viewingPost}
              onBack={() => {
                setViewingPost(null);
                // Se estava visualizando feed completo, restaurar essa visualização ao voltar
                if (wasViewingAllPostsFeed) {
                  setViewingAllPostsFeed(true);
                }
              }}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
              onNavigateToProfile={onNavigateToProfile}
            />
          </div>
        </div>
      </div>
    );
  }

  // Função helper para abrir post em aba específica
  const handleOpenPost = async (post: FeedPost) => {
    const comments = await fetchPostComments(post.id);
    const postWithComments = { ...post, comments };
    
    if (setActiveTab && setSelectedPost) {
      // Abrir em aba específica do console
      setSelectedPost(postWithComments);
      setActiveTab('post');
    } else {
      // Fallback: usar visualização local (compatibilidade)
      setViewingPost(postWithComments);
    }
  };

  // Renderizar feed completo de todos os posts do usuário (apenas se não estiver usando aba específica)
  if (viewingAllPostsFeed && !setActiveTab) {
    return (
      <div className="p-0 border-t border-white/20">
        <div className="rounded-lg bg-transparent text-white border-0 shadow-none h-full flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent relative">
          <div className="flex flex-col h-full">
            {/* Header com botão voltar */}
            <div className="flex items-center justify-between px-4 py-2 flex-shrink-0 border-b border-white/20">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Posts de {viewingUsername}
              </h3>
              <button
                type="button"
                onClick={() => setViewingAllPostsFeed(false)}
                className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center px-3"
              >
                Voltar
              </button>
            </div>
            {/* Lista de posts */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide hover:scrollbar-thin hover:scrollbar-thumb-white/20 hover:scrollbar-track-transparent px-4 py-4">
              {localPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-white/60 mb-2">Nenhum post ainda</p>
                  <p className="text-white/40 text-sm">Este usuário ainda não publicou nada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {localPosts.map((post, index) => {
                    const hotelDomain =
                      (post.hotel || hotel) === "br"
                        ? "com.br"
                        : (post.hotel || hotel) === "tr"
                        ? "com.tr"
                        : post.hotel || "com.br";
                    const avatarUrl = getAvatarUrl(
                      post.userName,
                      post.hotel || hotel,
                      post.figureString,
                      { size: "m", direction: 2, headDirection: 2, gesture: "std", action: "std" }
                    );

                    return (
                      <React.Fragment key={post.id}>
                        <div
                          onClick={() => handleOpenPost(post)}
                          className="cursor-pointer hover:bg-white/5 rounded p-2 -m-2 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-12 h-24 overflow-hidden flex items-center justify-start">
                              <img
                                src={avatarUrl}
                                alt={post.userName}
                                className="h-full w-auto object-contain"
                                style={{ imageRendering: "pixelated" }}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const fallbackUrl = post.figureString
                                    ? `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(post.userName)}&size=m&direction=2&head_direction=2&gesture=std&action=std`
                                    : getAvatarFallbackUrl(post.userName, "m");
                                  target.src = fallbackUrl;
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateToProfile?.(post.userName, hotelDomain);
                                  }}
                                  className="text-sm font-semibold text-white hover:underline truncate"
                                >
                                  {post.userName}
                                </button>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={getHotelFlag(post.hotel || hotel)}
                                    alt=""
                                    className="h-4 w-auto object-contain"
                                    style={{ imageRendering: "pixelated" }}
                                  />
                                  {currentUserName &&
                                    currentUserName.toLowerCase() === post.userName.toLowerCase() && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeletePost(post.id);
                                        }}
                                        className="w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                                        title={t("pages.console.deletePost")}
                                      >
                                        <img
                                          src="/assets/deletetrash.gif"
                                          alt={t("pages.console.deletePost")}
                                          className="max-w-full max-h-full object-contain"
                                          style={{ imageRendering: "pixelated" }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.src = "/assets/deletetrash1.gif";
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.src = "/assets/deletetrash.gif";
                                          }}
                                        />
                                      </button>
                                    )}
                                </div>
                              </div>
                              <p className={cn(
                                "text-sm text-white/90 break-words whitespace-pre-wrap mb-2",
                                !showAllPosts && "line-clamp-2"
                              )}>
                                {post.text}
                              </p>
                              <div className="flex items-center justify-between gap-4 mt-2">
                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLikePost(post.id);
                                    }}
                                    className={cn(
                                      "flex items-center gap-1 text-white/60 hover:text-white transition-colors",
                                      post.userLiked && "text-red-400 hover:text-red-300"
                                    )}
                                  >
                                    <Heart className={cn("w-4 h-4", post.userLiked && "fill-current")} />
                                    <span className="text-sm">{post.likesCount || 0}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenPost(post);
                                    }}
                                    className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-sm">{post.commentsCount || 0}</span>
                                  </button>
                                </div>
                                <p className="text-xs text-white/50">
                                  {new Date(post.createdAt).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Linha divisória após o post (exceto o último) */}
                        {index < localPosts.length - 1 && (
                          <div className="border-t border-dashed border-white/20 my-2"></div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingPosts) {
    return (
      <div className="p-0 border-t border-white/20">
        <div className="px-4 pt-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            Posts (carregando...)
          </h3>
        </div>
      </div>
    );
  }

  if (localPosts.length === 0) {
    return null;
  }

  return (
    <div className={showHeader ? "p-0 border-t border-white/20" : "p-0"}>
      {showHeader && (
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Posts ({localPosts.length})
            </h3>
            {localPosts.length > 0 && setActiveTab && (
              <button
                type="button"
                onClick={() => {
                  if (setActiveTab) {
                    // Abrir em aba específica do console
                    setActiveTab('user-posts');
                  } else {
                    // Fallback: usar visualização local
                    setViewingAllPostsFeed(true);
                  }
                }}
                className="py-1 bg-transparent border border-white/30 hover:bg-white text-white hover:text-gray-800 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 text-center px-3"
              >
                Ver Todos
              </button>
            )}
          </div>
        </div>
      )}
      <div className={showAllPosts ? "px-2 pb-4 space-y-4" : "px-4 pb-4 space-y-4"}>
        {displayedPosts.map((post, index) => {
          const hotelDomain =
            (post.hotel || hotel) === "br"
              ? "com.br"
              : (post.hotel || hotel) === "tr"
              ? "com.tr"
              : post.hotel || "com.br";
          
          // Se showAllPosts for true, usar figura completa (como no feed); senão, usar apenas head no tamanho m
          const avatarUrl = showAllPosts
            ? getAvatarUrl(
                post.userName,
                post.hotel || hotel,
                post.figureString,
                { size: "m", direction: 2, headDirection: 2, gesture: "std", action: "std" }
              )
            : getAvatarHeadUrl(
                post.userName,
                post.hotel || hotel,
                post.figureString,
                "m"
              );

          return (
            <React.Fragment key={post.id}>
              {/* Post clicável */}
              <div
                onClick={() => handleOpenPost(post)}
                className="cursor-pointer hover:bg-white/5 rounded p-2 -m-2 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar: figura completa se showAllPosts, senão apenas head */}
                  {showAllPosts ? (
                    <div className="flex-shrink-0 w-12 h-24 overflow-hidden flex items-center justify-start">
                      <img
                        src={avatarUrl}
                        alt={post.userName}
                        className="h-full w-auto object-contain"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const fallbackUrl = post.figureString
                            ? `https://www.habbo.${hotelDomain}/habbo-imaging/avatarimage?user=${encodeURIComponent(post.userName)}&size=m&direction=2&head_direction=2&gesture=std&action=std`
                            : getAvatarFallbackUrl(post.userName, "m");
                          target.src = fallbackUrl;
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 flex-shrink-0 overflow-hidden rounded">
                      <img
                        src={avatarUrl}
                        alt={post.userName}
                        className="w-full h-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getAvatarFallbackUrl(post.userName, "m");
                        }}
                      />
                    </div>
                  )}
                  {/* Conteúdo à direita */}
                  <div className="flex-1 min-w-0">
                    {/* Header: nome clicável + bandeira (se showAllPosts) + botão deletar (se dono) */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToProfile?.(post.userName, hotelDomain);
                        }}
                        className="text-sm font-semibold text-white hover:underline truncate"
                      >
                        {post.userName}
                      </button>
                      <div className="flex items-center gap-2">
                        {/* Bandeira apenas se showAllPosts */}
                        {showAllPosts && (
                          <img
                            src={getHotelFlag(post.hotel || hotel)}
                            alt=""
                            className="h-4 w-auto object-contain"
                            style={{ imageRendering: "pixelated" }}
                          />
                        )}
                        {/* Botão deletar (se dono) */}
                        {currentUserName &&
                          currentUserName.toLowerCase() === post.userName.toLowerCase() && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePost(post.id);
                              }}
                              className="w-5 h-5 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                              title={t("pages.console.deletePost")}
                            >
                              <img
                                src="/assets/deletetrash.gif"
                                alt={t("pages.console.deletePost")}
                                className="max-w-full max-h-full object-contain"
                                style={{ imageRendering: "pixelated" }}
                                onMouseOver={(e) => {
                                  e.currentTarget.src = "/assets/deletetrash1.gif";
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.src = "/assets/deletetrash.gif";
                                }}
                              />
                            </button>
                          )}
                      </div>
                    </div>
                    {/* Texto do post - limitado a 2 linhas no perfil individual */}
                    <p className={cn(
                      "text-xs text-white/60 break-words whitespace-pre-wrap mb-2",
                      !showAllPosts && "line-clamp-2"
                    )}>
                      {post.text}
                    </p>
                    {/* Ações: Like e Comentários com Data */}
                    <div className="flex items-center justify-between gap-4 mt-2">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikePost(post.id);
                          }}
                          className={cn(
                            "flex items-center gap-1 text-white/60 hover:text-white transition-colors",
                            post.userLiked && "text-red-400 hover:text-red-300"
                          )}
                        >
                          <Heart className={cn("w-4 h-4", post.userLiked && "fill-current")} />
                          <span className="text-sm">{post.likesCount || 0}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPost(post);
                          }}
                          className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{post.commentsCount || 0}</span>
                        </button>
                      </div>
                      {/* Data - mostra hora completa apenas em showAllPosts (lista completa) */}
                      <p className="text-xs text-white/50">
                        {formatPostDate(post.createdAt, showAllPosts)}
                      </p>
                    </div>
                    {/* Comentários (últimos 3) */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed border-white/20">
                        <div className="space-y-2">
                          {post.comments
                            .slice(-3)
                            .reverse()
                            .map((comment) => {
                              const commentHotelDomain =
                                (comment.hotel || hotel) === "br"
                                  ? "com.br"
                                  : (comment.hotel || hotel) === "tr"
                                  ? "com.tr"
                                  : comment.hotel || "com.br";
                              return (
                                <div key={comment.id} className="flex items-start gap-2">
                                  <div className="w-8 h-8 flex-shrink-0 overflow-hidden rounded">
                                    <img
                                      src={getAvatarHeadUrl(
                                        comment.userName,
                                        comment.hotel || hotel,
                                        comment.figureString,
                                        "s"
                                      )}
                                      alt={comment.userName}
                                      className="w-full h-full object-cover"
                                      style={{ imageRendering: "pixelated" }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = getAvatarFallbackUrl(comment.userName, "s");
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onNavigateToProfile?.(comment.userName, commentHotelDomain);
                                        }}
                                        className="text-xs font-semibold text-white hover:underline truncate"
                                      >
                                        {comment.userName}
                                      </button>
                                    </div>
                                    <p className="text-xs text-white/80 break-words whitespace-pre-wrap">
                                      {comment.text}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                        {post.commentsCount && post.commentsCount > 3 && (
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              // Guardar estado antes de abrir post individual
                              setWasViewingAllPostsFeed(viewingAllPostsFeed);
                              // Buscar comentários antes de visualizar
                              const comments = await fetchPostComments(post.id);
                              setViewingPost({ ...post, comments });
                            }}
                            className="text-xs text-white/60 hover:text-white transition-colors mt-2"
                          >
                            Ver todos os {post.commentsCount} comentários
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Linha divisória após o post (exceto o último) */}
              {index < displayedPosts.length - 1 && (
                <div className="border-t border-dashed border-white/20 my-2"></div>
              )}
            </React.Fragment>
          );
        })}
        {/* Botão para ver todos os posts */}
        {hasMorePosts && !viewingAllPosts && (
          <button
            type="button"
            onClick={() => setViewingAllPosts(true)}
            className="w-full py-2 px-4 text-sm font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/20 transition-colors"
          >
            Ver todos os {localPosts.length} posts
          </button>
        )}
      </div>
    </div>
  );
};
