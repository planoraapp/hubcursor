
import React, { useState, useEffect } from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Users, Pin, Clock, Eye, MessageCircle, Plus, Heart, Send } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_habbo_name: string;
  created_at: string;
  likes: number;
  category: string;
  comments_count?: number;
}

interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  author_habbo_name: string;
  created_at: string;
}

const Forum = () => {
  const { habboAccount } = useUnifiedAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Geral');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'Geral', name: 'Discussões Gerais', color: 'bg-blue-100 text-blue-800', count: 0 },
    { id: 'Suporte', name: 'Suporte e Ajuda', color: 'bg-green-100 text-green-800', count: 0 },
    { id: 'Trading', name: 'Trading e Mercado', color: 'bg-yellow-100 text-yellow-800', count: 0 },
    { id: 'Eventos', name: 'Eventos e Competições', color: 'bg-purple-100 text-purple-800', count: 0 }
  ];

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_comments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithCounts = data.map(post => ({
        ...post,
        comments_count: post.forum_comments?.[0]?.count || 0
      }));

      setPosts(postsWithCounts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    }
  };

  const createPost = async () => {
    if (!habboAccount) {
      toast.error('Faça login para criar um post');
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          title: newPostTitle,
          content: newPostContent,
          category: newPostCategory,
          author_supabase_user_id: habboAccount.supabase_user_id,
          author_habbo_name: habboAccount.habbo_name,
          likes: 0
        });

      if (error) throw error;

      toast.success('Post criado com sucesso!');
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
      loadPosts();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      toast.error('Erro ao criar post');
    }
  };

  const addComment = async () => {
    if (!habboAccount || !selectedPost) {
      toast.error('Faça login para comentar');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    try {
      const { error } = await supabase
        .from('forum_comments')
        .insert({
          post_id: selectedPost.id,
          content: newComment,
          author_supabase_user_id: habboAccount.supabase_user_id,
          author_habbo_name: habboAccount.habbo_name
        });

      if (error) throw error;

      toast.success('Comentário adicionado!');
      setNewComment('');
      loadComments(selectedPost.id);
    } catch (error) {
      console.error('Erro ao comentar:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };

  const openPost = (post: ForumPost) => {
    setSelectedPost(post);
    loadComments(post.id);
  };

  if (selectedPost) {
    return (
      <SidebarProvider>
        <div 
          className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <NewAppSidebar />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
            <div className="max-w-4xl mx-auto">
              <Button 
                onClick={() => setSelectedPost(null)}
                variant="outline" 
                className="mb-6 border-2 border-black bg-white/90 backdrop-blur-sm"
              >
                ← Voltar ao Fórum
              </Button>

              {/* Post Principal */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black mb-6">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="text-2xl volter-font">{selectedPost.title}</CardTitle>
                  <CardDescription className="text-white/90 volter-font">
                    Por {selectedPost.author_habbo_name} • {new Date(selectedPost.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-4 volter-font whitespace-pre-wrap">{selectedPost.content}</p>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 volter-font">
                      <Heart className="w-4 h-4 mr-1" />
                      {selectedPost.likes}
                    </Button>
                    <Badge className={categories.find(c => c.id === selectedPost.category)?.color || 'bg-gray-100 text-gray-800'}>
                      {categories.find(c => c.id === selectedPost.category)?.name || selectedPost.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Comentários */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="volter-font">Comentários ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Adicionar Comentário */}
                  {habboAccount ? (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <Textarea
                        placeholder="Deixe seu comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-3 volter-font"
                      />
                      <Button onClick={addComment} className="bg-blue-600 hover:bg-blue-700 volter-font">
                        <Send className="w-4 h-4 mr-2" />
                        Comentar
                      </Button>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 text-center">
                      <p className="text-yellow-800 volter-font">Faça login para comentar</p>
                    </div>
                  )}

                  {/* Lista de Comentários */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-800 volter-font">{comment.author_habbo_name}</span>
                          <span className="text-sm text-gray-500 volter-font">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-gray-700 volter-font whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                    
                    {comments.length === 0 && (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 volter-font">Nenhum comentário ainda. Seja o primeiro!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div 
        className="min-h-screen flex w-full"
        style={{ 
          backgroundImage: 'url(/assets/bghabbohub.png)',
          backgroundRepeat: 'repeat'
        }}
      >
        <NewAppSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto scrollbar-hide">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                💬 Fórum HabboHub
              </h1>
              <p className="text-lg text-white/90 volter-font drop-shadow">
                Conecte-se com a comunidade Habbo! Compartilhe, discuta e faça novos amigos.
              </p>
            </div>

            {/* Criar Post */}
            {habboAccount && (
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black mb-8">
                <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                  <CardTitle className="volter-font flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    {showCreatePost ? 'Criar Novo Post' : 'Compartilhe com a Comunidade'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!showCreatePost ? (
                    <Button 
                      onClick={() => setShowCreatePost(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white volter-font"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Post
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <select
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value)}
                        className="w-full p-3 border-2 border-gray-300 rounded-lg volter-font"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      
                      <Input
                        placeholder="Título do post"
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="border-2 border-gray-300 volter-font"
                      />
                      
                      <Textarea
                        placeholder="Conteúdo do post"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={5}
                        className="border-2 border-gray-300 volter-font"
                      />
                      
                      <div className="flex gap-2">
                        <Button onClick={createPost} className="bg-green-600 hover:bg-green-700 volter-font">
                          Publicar
                        </Button>
                        <Button 
                          onClick={() => setShowCreatePost(false)} 
                          variant="outline"
                          className="border-2 border-gray-300 volter-font"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-4 volter-font">Carregando posts...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map((post) => (
                  <Card 
                    key={post.id} 
                    className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => openPost(post)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 volter-font hover:text-blue-600">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm volter-font line-clamp-2">
                            {post.content}
                          </p>
                        </div>
                        <Badge className={categories.find(c => c.id === post.category)?.color || 'bg-gray-100 text-gray-800'}>
                          {categories.find(c => c.id === post.category)?.name || post.category}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4 volter-font">
                          <span>por {post.author_habbo_name}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(post.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 volter-font">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.comments_count || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {posts.length === 0 && (
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                    <CardContent className="p-12 text-center">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-bold text-gray-600 mb-2 volter-font">
                        Nenhum post ainda
                      </h3>
                      <p className="text-gray-500 volter-font">
                        Seja o primeiro a compartilhar algo com a comunidade!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Forum;
