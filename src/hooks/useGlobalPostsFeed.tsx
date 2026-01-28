import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { useI18n } from '@/contexts/I18nContext';
import { FeedPost, PostComment } from '@/components/console/FriendsPostsFeed';
import { validatePost, sanitizePost, validateComment, sanitizeComment } from '@/utils/postValidation';

export interface UseGlobalPostsFeedOptions {
  limit?: number;
  hotel?: string;
}

export interface UseGlobalPostsFeedReturn {
  posts: FeedPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  addPost: (text: string) => Promise<FeedPost | null>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<PostComment | null>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  fetchPostComments: (postId: string) => Promise<PostComment[]>;
}

// Função helper para normalizar hotel para formato do banco (br, com, es, etc.)
const normalizeHotelForDB = (hotel: string | undefined | null): string => {
  if (!hotel) return 'br';
  if (hotel === 'com.br' || hotel === 'br') return 'br';
  if (hotel === 'com.tr' || hotel === 'tr') return 'tr';
  if (hotel === 'com' || hotel === 'us') return 'com';
  return hotel;
};

export const useGlobalPostsFeed = (options: UseGlobalPostsFeedOptions = {}): UseGlobalPostsFeedReturn => {
  const {
    limit = 20,
    hotel = 'all'
  } = options;

  // Garantir que hotel seja sempre uma string
  const hotelString = typeof hotel === 'string' ? hotel : 'all';

  const { habboAccount } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [cursor, setCursor] = useState<number>(0);
  const [allPosts, setAllPosts] = useState<FeedPost[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Resetar quando o hotel mudar
  useEffect(() => {
    setCursor(0);
    setAllPosts([]);
    setIsLoadingMore(false);
  }, [hotel]);

  // Função para buscar posts do Supabase
  const fetchPosts = useCallback(async (offset: number = 0): Promise<{ posts: FeedPost[]; hasMore: boolean }> => {
    try {
      let query = supabase
        .from('feed_posts')
        .select(`
          id,
          user_name,
          text,
          hotel,
          figure_string,
          created_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filtrar por hotel se não for 'all'
      if (hotelString !== 'all') {
        const hotelCode = hotelString === 'com.br' ? 'br' : hotelString === 'com.tr' ? 'tr' : hotelString;
        query = query.eq('hotel', hotelCode);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[📝 GLOBAL POSTS FEED] Error fetching posts:', error);
        // Se a tabela não existe (código 42P01 do PostgreSQL ou PGRST116)
        if (error.code === 'PGRST116' || error.code === '42P01' || 
            error.message?.includes('404') || 
            error.message?.includes('does not exist') ||
            error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn('[📝 GLOBAL POSTS FEED] Tabela feed_posts não existe. Execute a migration primeiro.');
          return { posts: [], hasMore: false };
        }
        throw error;
      }

      if (!data || data.length === 0) {
        return { posts: [], hasMore: false };
      }

      // Buscar likes do usuário atual para cada post
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

      // Buscar contagem de likes e comentários para cada post
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase
              .from('feed_post_likes')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id),
            supabase
              .from('feed_post_comments')
              .select('id', { count: 'exact', head: true })
              .eq('post_id', post.id)
          ]);

          const likesCount = likesResult.count || 0;
          const commentsCount = commentsResult.count || 0;

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
            comments: [] as PostComment[]
          } as FeedPost;
        })
      );

      return {
        posts: postsWithCounts,
        hasMore: data.length === limit
      };
    } catch (error) {
      console.error('[📝 GLOBAL POSTS FEED] Error:', error);
      return { posts: [], hasMore: false };
    }
  }, [limit, hotelString, habboAccount?.supabase_user_id, habboAccount?.id]);

  // Query principal
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['global-posts-feed', String(hotelString), Number(cursor)],
    queryFn: () => fetchPosts(cursor * limit),
    enabled: true,
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Atualizar lista de posts quando dados mudarem
  useEffect(() => {
    if (data?.posts) {
      if (cursor === 0) {
        // Primeira carga ou refresh
        setAllPosts(data.posts);
      } else {
        // Carregar mais
        setAllPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.posts.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      }
      setIsLoadingMore(false);
    }
  }, [data, cursor]);

  // Função para carregar mais posts
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !data?.hasMore) return;
    
    setIsLoadingMore(true);
    setCursor(prev => prev + 1);
  }, [isLoadingMore, data?.hasMore]);

  // Função para refresh
  const refreshFeed = useCallback(async () => {
    setCursor(0);
    setAllPosts([]);
    await refetch();
  }, [refetch]);

  // Mutation para adicionar post
  const addPostMutation = useMutation({
    mutationFn: async (text: string): Promise<FeedPost | null> => {
      if (!habboAccount) {
        throw new Error('Usuário não autenticado');
      }

      // Verificar se há supabase_user_id
      if (!habboAccount.supabase_user_id) {
        throw new Error('Usuário não possui autenticação Supabase válida. Faça login novamente.');
      }

      const validation = validatePost(text);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Post inválido');
      }

      const sanitized = sanitizePost(text);

      // Normalizar hotel antes de salvar
      const normalizedHotel = normalizeHotelForDB(habboAccount.hotel);
      
      const { data: postData, error } = await supabase
        .from('feed_posts')
        .insert({
          user_id: habboAccount.supabase_user_id,
          user_name: habboAccount.habbo_name,
          text: sanitized,
          hotel: normalizedHotel,
          figure_string: habboAccount.figure_string || null
        })
        .select()
        .single();

      if (error) {
        console.error('[📝 GLOBAL POSTS FEED] Error inserting post:', error);
        // Verificar se é erro de tabela não existente (código 42P01 do PostgreSQL ou PGRST116)
        if (error.code === 'PGRST116' || error.code === '42P01' || 
            error.message?.includes('404') || 
            error.message?.includes('does not exist') ||
            (error.message?.includes('relation') && error.message?.includes('does not exist'))) {
          throw new Error('Tabela feed_posts não existe. Execute a migration primeiro.');
        }
        throw error;
      }

      return {
        id: postData.id,
        userName: postData.user_name,
        text: postData.text,
        createdAt: postData.created_at,
        hotel: postData.hotel || 'br',
        figureString: postData.figure_string || undefined,
        likesCount: 0,
        commentsCount: 0,
        userLiked: false,
        comments: []
      } as FeedPost;
    },
    onSuccess: (newPost) => {
      if (newPost) {
        queryClient.invalidateQueries({ queryKey: ['global-posts-feed', hotelString] });
        // Invalidar também a query do perfil do usuário que criou o post
        if (newPost.userName && newPost.hotel) {
          const userHotelCode = newPost.hotel === 'com.br' ? 'br' : newPost.hotel === 'com.tr' ? 'tr' : newPost.hotel === 'com' || newPost.hotel === 'us' ? 'com' : newPost.hotel;
          queryClient.invalidateQueries({ queryKey: ['user-posts', newPost.userName, userHotelCode] });
        }
        setAllPosts(prev => [newPost, ...prev]);
        toast.success(t('pages.console.postPublished') || 'Post publicado!');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.message || 'Erro ao publicar post';
      console.error('[📝 GLOBAL POSTS FEED] Error adding post:', error);
      
      // Verificar se é erro de tabela não existente (código 42P01 do PostgreSQL ou PGRST116)
      if (error?.code === 'PGRST116' || error?.code === '42P01' || 
          errorMessage.includes('404') || 
          errorMessage.includes('does not exist') ||
          (errorMessage.includes('relation') && errorMessage.includes('does not exist'))) {
        toast.error('Tabela feed_posts não existe. Execute a migration primeiro.');
      } else if (error?.code === '42501' || errorMessage.includes('row-level security')) {
        toast.error('Erro de permissão. Verifique se você está autenticado corretamente. Se o problema persistir, faça login novamente.');
      } else if (error?.code === '401' || errorMessage.includes('Unauthorized')) {
        toast.error('Sessão expirada. Faça login novamente.');
      } else {
        toast.error(errorMessage);
      }
    }
  });

  // Mutation para like/unlike
  const likePostMutation = useMutation({
    mutationFn: async ({ postId, isLike }: { postId: string; isLike: boolean }) => {
      if (!habboAccount) throw new Error('Usuário não autenticado');

      if (!habboAccount.supabase_user_id) {
        throw new Error('Usuário não possui autenticação Supabase válida.');
      }
      const userId = habboAccount.supabase_user_id;
      if (isLike) {
        const { error } = await supabase
          .from('feed_post_likes')
          .insert({
            post_id: postId,
            user_id: userId
          });
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
      queryClient.invalidateQueries({ queryKey: ['global-posts-feed', hotel] });
    }
  });

  // Mutation para adicionar comentário
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }): Promise<PostComment | null> => {
      if (!habboAccount) throw new Error('Usuário não autenticado');

      const validation = validateComment(text);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Comentário inválido');
      }

      const sanitized = sanitizeComment(text);

      const userId = habboAccount.supabase_user_id || habboAccount.id;
      const { data: commentData, error } = await supabase
        .from('feed_post_comments')
        .insert({
          post_id: postId,
          user_id: userId,
          user_name: habboAccount.habbo_name,
          text: sanitized,
          hotel: normalizeHotelForDB(habboAccount.hotel),
          figure_string: habboAccount.figure_string || null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: commentData.id,
        postId: commentData.post_id,
        userName: commentData.user_name,
        text: commentData.text,
        createdAt: commentData.created_at,
        hotel: commentData.hotel || 'br',
        figureString: commentData.figure_string || undefined
      } as PostComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-posts-feed', hotel] });
    }
  });

  // Mutation para deletar post
  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!habboAccount) throw new Error('Usuário não autenticado');

      if (!habboAccount.supabase_user_id) {
        throw new Error('Usuário não possui autenticação Supabase válida.');
      }
      const userId = habboAccount.supabase_user_id;
      const { error } = await supabase
        .from('feed_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) throw error;
      return postId;
    },
    onSuccess: (postId) => {
      queryClient.invalidateQueries({ queryKey: ['global-posts-feed', hotel] });
      setAllPosts(prev => prev.filter(p => p.id !== postId));
      toast.success(t('pages.console.postDeleted') || 'Post deletado');
    },
    onError: () => {
      toast.error('Erro ao deletar post');
    }
  });

  // Mutation para deletar comentário
  const deleteCommentMutation = useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      if (!habboAccount) throw new Error('Usuário não autenticado');

      const userId = habboAccount.supabase_user_id || habboAccount.id;
      const { error } = await supabase
        .from('feed_post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['global-posts-feed', hotel] });
      toast.success(t('pages.console.deleteComment') || 'Comentário deletado');
    },
    onError: () => {
      toast.error('Erro ao deletar comentário');
    }
  });

  // Função para buscar comentários de um post
  const fetchPostComments = useCallback(async (postId: string): Promise<PostComment[]> => {
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
      console.error('[📝 GLOBAL POSTS FEED] Error fetching comments:', error);
      return [];
    }
  }, []);

  return {
    posts: allPosts,
    isLoading,
    isLoadingMore,
    error: error as Error | null,
    hasMore: data?.hasMore || false,
    loadMore,
    refreshFeed,
    addPost: (text: string) => addPostMutation.mutateAsync(text),
    likePost: (postId: string) => {
      const post = allPosts.find(p => p.id === postId);
      return likePostMutation.mutateAsync({ postId, isLike: !post?.userLiked });
    },
    unlikePost: (postId: string) => {
      return likePostMutation.mutateAsync({ postId, isLike: false });
    },
    addComment: (postId: string, text: string) => addCommentMutation.mutateAsync({ postId, text }),
    deletePost: (postId: string) => deletePostMutation.mutateAsync(postId),
    deleteComment: (postId: string, commentId: string) => deleteCommentMutation.mutateAsync({ postId, commentId }),
    fetchPostComments
  };
};
