
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Heart, MessageCircle, Send, Image as ImageIcon } from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
  likes: number;
}

interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
}

function PostCard({ post, onLike, currentUserId }: { 
  post: ForumPost; 
  onLike: (postId: string) => void; 
  currentUserId: string | null; 
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast } = useToast();
  const { habboAccount } = useAuth();

  const fetchComments = async () => {
    if (!showComments) return;
    
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar comentários",
        variant: "destructive"
      });
    } else {
      setComments(data || []);
    }
    setLoadingComments(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId || !habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: post.id,
        content: newComment.trim(),
        author_supabase_user_id: currentUserId,
        author_habbo_name: habboAccount.habbo_name,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar comentário",
        variant: "destructive"
      });
    } else {
      setComments([...comments, data]);
      setNewComment('');
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!"
      });
    }
  };

  useEffect(() => {
    fetchComments();
  }, [showComments]);

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {post.image_url && (
            <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-auto overflow-hidden rounded-lg">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
            <p className="text-gray-700 text-sm mb-3">{post.content}</p>
            <div className="text-xs text-gray-500 mb-4">
              Por <span className="font-semibold">{post.author_habbo_name}</span> em{' '}
              {new Date(post.created_at).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike(post.id)}
                className="flex items-center space-x-1"
                disabled={!currentUserId}
              >
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-1"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}</span>
              </Button>
            </div>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-3">Comentários</h4>
            {loadingComments ? (
              <p className="text-gray-500">Carregando comentários...</p>
            ) : (
              <div className="space-y-3 mb-4">
                {comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Por {comment.author_habbo_name} em{' '}
                      {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {currentUserId ? (
              <div className="flex space-x-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escreva um comentário..."
                  className="flex-1"
                />
                <Button onClick={handleAddComment} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Faça login para comentar</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, user, habboAccount } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar posts do fórum",
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (!isLoggedIn || !user || !habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        author_supabase_user_id: user.id,
        author_habbo_name: habboAccount.habbo_name,
      });

    if (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar post",
        variant: "destructive"
      });
    } else {
      setNewPostTitle('');
      setNewPostContent('');
      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!"
      });
      fetchPosts();
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para curtir",
        variant: "destructive"
      });
      return;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const { error } = await supabase
      .from('forum_posts')
      .update({ likes: post.likes + 1 })
      .eq('id', postId);

    if (error) {
      console.error('Error liking post:', error);
      toast({
        title: "Erro",
        description: "Erro ao curtir post",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Post curtido!"
      });
      fetchPosts();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="relative mb-6 p-6 rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <MessageCircle className="w-8 h-8 text-white" />
          <h1 className="text-2xl font-bold text-white">Fórum Habbo Hub</h1>
        </div>
      </div>

      {/* Create Post Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Criar Novo Post</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoggedIn ? (
            <div className="space-y-4">
              <Input
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Título do post"
                className="w-full"
              />
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Conteúdo do post"
                rows={4}
                className="w-full"
              />
              <Button onClick={handleCreatePost} className="w-full">
                Publicar Post
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Faça login para criar um post no fórum</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Posts */}
      <div>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum post encontrado. Seja o primeiro a criar um!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLikePost}
              currentUserId={user?.id || null}
            />
          ))
        )}
      </div>
    </div>
  );
}
