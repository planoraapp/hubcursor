import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import type { ForumPost } from '../types/forum';
import { PageHeader } from '../components/PageHeader';

// Panel component for consistent styling
interface HabboPanelProps {
  title: string;
  children: React.ReactNode;
  headerComponent?: React.ReactNode;
}

function HabboPanel({ title, children, headerComponent }: HabboPanelProps) {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {headerComponent ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{title}</h2>
            {headerComponent}
          </div>
        ) : (
          <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-t-lg mb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>{title}</h3>
          </div>
        )}
        <div className="p-6 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

// Forum Category Card component
interface ForumCategoryCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  topics: number;
  posts: number;
  lastPostTime: string;
  bgColorClass?: string;
}

function ForumCategoryCard({ icon, title, description, topics, posts, lastPostTime, bgColorClass = 'bg-blue-50' }: ForumCategoryCardProps) {
  return (
    <div className={`bg-white border border-gray-900 rounded-lg shadow-md p-4 flex items-start space-x-4 ${bgColorClass}`}>
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-lg mb-1 volter-font" style={{ textShadow: '0.5px 0.5px 0px black, -0.5px -0.5px 0px black, 0.5px -0.5px 0px black, -0.5px 0.5px 0px black' }}>{title}</h4>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Tópicos: {topics}</span>
          <span>Posts: {posts}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Último post: {lastPostTime}</p>
      </div>
    </div>
  );
}

// Post Card component
interface PostCardProps {
  post: ForumPost;
  onLike: (postId: string) => Promise<void>;
  currentUserId: string | null;
}

function PostCard({ post, onLike, currentUserId }: PostCardProps) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const { toast } = useToast();
  const { habboAccount } = useAuth();

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    if (showCommentForm) {
      fetchComments();
    }
  }, [showCommentForm, post.id]);

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !currentUserId || !habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar",
        variant: "destructive"
      });
      return;
    }

    setIsCommenting(true);
    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: post.id,
        content: newCommentContent.trim(),
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
      setNewCommentContent('');
      toast({
        title: "Sucesso",
        description: "Comentário adicionado com sucesso!"
      });
    }
    setIsCommenting(false);
  };

  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
        {post.image_url && (
          <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-auto overflow-hidden rounded-lg">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-800 volter-font">{post.title}</h3>
            {post.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {post.category}
              </span>
            )}
          </div>
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
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              disabled={!currentUserId}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.433a2.5 2.5 0 001.523 2.227l.958.428a1.5 1.5 0 002.134-.607l1.454-3.725a1.5 1.5 0 011.044-.716l2.943-.588A.75.75 0 0018 10.75V3.75A.75.75 0 0017.25 3H7.5A2.25 2.25 0 005.25 5.25v4.083z" />
              </svg>
              <span>{post.likes} Curtidas</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.758-1.379L2 17l1.62-2.16A8.844 8.844 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
              </svg>
              <span>{comments.length} Comentários</span>
            </Button>
          </div>
        </div>
      </div>

      {showCommentForm && (
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <h4 className="font-semibold text-gray-800 mb-3">Comentários:</h4>
          {loadingComments ? (
            <p className="text-gray-600">Carregando comentários...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-600">Nenhum comentário ainda. Seja o primeiro!</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  <span className="text-xs text-gray-500">Por {comment.author_habbo_name} em {new Date(comment.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              ))}
            </div>
          )}
          {currentUserId ? (
            <form onSubmit={handleAddCommentSubmit} className="flex flex-col gap-2">
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Escreva seu comentário..."
                rows={2}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                disabled={isCommenting}
              />
              <Button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 volter-font"
                disabled={isCommenting}
              >
                {isCommenting ? 'Adicionando...' : 'Adicionar Comentário'}
              </Button>
            </form>
          ) : (
            <p className="text-red-600 text-sm">Faça login para adicionar um comentário.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function ForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isProcessingPost, setIsProcessingPost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const { isLoggedIn, user, habboAccount } = useAuth();
  const { toast } = useToast();

  const [debugLog, setDebugLog] = useState<string[]>([]);
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setDebugLog((prev) => [...prev, `${timestamp}: ${message}`]);
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    addLog(`Fetching posts for category: ${selectedCategory}`);
    let query = supabase.from('forum_posts').select('*').order('created_at', { ascending: false });
    
    if (selectedCategory !== 'Todos') {
      query = query.eq('category', selectedCategory);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Erro ao carregar posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar posts do fórum.",
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
      addLog(`Loaded ${data?.length || 0} posts.`);
    }
  };

  const uploadImageToSupabase = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `forum_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('habbo-hub-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('habbo-hub-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    setUploadingImage(true);
    const imageUrl = await uploadImageToSupabase(file);
    setUploadingImage(false);

    if (imageUrl) {
      setNewPostImage(imageUrl);
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso!"
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive"
      });
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsProcessingPost(true);

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        image_url: newPostImage,
        author_supabase_user_id: user.id,
        author_habbo_name: habboAccount.habbo_name,
        category: selectedCategory === 'Todos' ? 'Geral' : selectedCategory
      });

    if (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar post",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!"
      });
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage(null);
      fetchPosts();
    }
    setIsProcessingPost(false);
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

  const forumCategories = [
    { 
      name: "Discussões Gerais", 
      categoryKey: "Geral", 
      description: "Conversa sobre tudo relacionado ao Habbo", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle mx-auto text-gray-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>, 
      topics: 1250, 
      posts: 15670, 
      lastPostTime: "2 minutos atrás", 
      bgColor: "bg-blue-100" 
    },
    { 
      name: "Suporte Técnico", 
      categoryKey: "Suporte", 
      description: "Precisa de ajuda? Poste aqui!", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users mx-auto text-gray-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, 
      topics: 890, 
      posts: 4320, 
      lastPostTime: "15 minutos atrás", 
      bgColor: "bg-green-100" 
    },
    { 
      name: "Eventos e Competições", 
      categoryKey: "Eventos", 
      description: "Fique por dentro dos eventos e competições", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock mx-auto text-gray-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, 
      topics: 450, 
      posts: 2100, 
      lastPostTime: "1 hora atrás", 
      bgColor: "bg-purple-100" 
    }
  ];

  return (
    <div className="min-h-full">
      {/* Page Header */}
      <div className="relative mb-6 p-6 rounded-lg overflow-hidden"
        style={{ backgroundImage: 'url("/assets/1360__-3C7.png")', backgroundSize: 'cover', backgroundPosition: 'center center' }}>
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center space-x-4">
          <img src="/assets/BatePapo1.png" alt="Fórum" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-white volter-font" style={{ textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black' }}>Fórum Habbo Hub</h1>
        </div>
      </div>

      <div className="space-y-6">
        <HabboPanel title="Console de Debug:">
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-40 overflow-y-auto">
            {debugLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </HabboPanel>

        <HabboPanel title="Categorias do Fórum">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forumCategories.map(category => (
              <ForumCategoryCard
                key={category.name}
                icon={category.icon}
                title={category.name}
                description={category.description}
                topics={category.topics}
                posts={category.posts}
                lastPostTime={category.lastPostTime}
                bgColorClass={category.bgColor}
              />
            ))}
          </div>
        </HabboPanel>

        <HabboPanel title="Criar Novo Post">
          {isLoggedIn ? (
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isProcessingPost}
              >
                <option value="Geral">Discussões Gerais</option>
                <option value="Suporte">Suporte Técnico</option>
                <option value="Eventos">Eventos e Competições</option>
              </select>
              <Input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Título do Post"
                disabled={isProcessingPost}
              />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Conteúdo do Post (máx. 500 caracteres)"
                rows={5}
                maxLength={500}
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                disabled={isProcessingPost}
              />
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center gap-2 volter-font">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-4 3 3 5-5V15z" clipRule="evenodd" />
                  </svg>
                  {uploadingImage ? 'Carregando Imagem...' : 'Adicionar Imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage || isProcessingPost}
                  />
                </label>
                {newPostImage && (
                  <div className="relative">
                    <img src={newPostImage} alt="Preview" className="h-12 w-12 object-cover rounded-md border" />
                    <button
                      type="button"
                      onClick={() => setNewPostImage(null)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 volter-font"
                disabled={isProcessingPost || uploadingImage}
              >
                {isProcessingPost ? 'Publicando Post...' : 'Publicar Post'}
              </Button>
            </form>
          ) : (
            <p className="text-red-600 text-center">Faça login para criar um novo post no fórum.</p>
          )}
        </HabboPanel>

        <HabboPanel
          title="Tópicos Recentes"
          headerComponent={
            <div className="flex space-x-2">
              <Button
                onClick={() => setSelectedCategory('Todos')}
                variant={selectedCategory === 'Todos' ? 'default' : 'outline'}
                size="sm"
                className="volter-font"
              >
                Todos
              </Button>
              <Button
                onClick={() => setSelectedCategory('Geral')}
                variant={selectedCategory === 'Geral' ? 'default' : 'outline'}
                size="sm"
                className="volter-font"
              >
                Geral
              </Button>
              <Button
                onClick={() => setSelectedCategory('Suporte')}
                variant={selectedCategory === 'Suporte' ? 'default' : 'outline'}
                size="sm"
                className="volter-font"
              >
                Suporte
              </Button>
              <Button
                onClick={() => setSelectedCategory('Eventos')}
                variant={selectedCategory === 'Eventos' ? 'default' : 'outline'}
                size="sm"
                className="volter-font"
              >
                Eventos
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {posts.length === 0 ? (
              <p className="text-gray-700 text-center">Nenhum post no fórum ainda. Seja o primeiro a criar um!</p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  currentUserId={user ? user.id : null}
                />
              ))
            )}
          </div>
        </HabboPanel>
      </div>
    </div>
  );
}
