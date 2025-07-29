
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Heart, MessageCircle, Send, Image as ImageIcon, Clock, Users } from 'lucide-react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
  likes: number;
  category?: string;
}

interface ForumComment {
  id: string;
  post_id: string;
  content: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  created_at: string;
}

// Componente para Card de Categoria do Fórum
function ForumCategoryCard({ icon, title, description, topics, posts, lastPostTime, bgColorClass = "bg-blue-100" }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  topics: number;
  posts: number;
  lastPostTime: string;
  bgColorClass?: string;
}) {
  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className={`p-4 ${bgColorClass}`}>
        {icon}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 volter-font">{title}</h3>
        <p className="text-sm text-gray-600 mb-3">{description}</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between"><span>Tópicos:</span><span className="font-medium">{topics}</span></div>
          <div className="flex justify-between"><span>Posts:</span><span className="font-medium">{posts}</span></div>
          <div className="flex justify-between"><span>Último post:</span><span className="font-medium">{lastPostTime}</span></div>
        </div>
      </div>
    </div>
  );
}

// Componente para um card de Post
function PostCard({ post, onLike, currentUserId }: { 
  post: ForumPost; 
  onLike: (postId: string) => void; 
  currentUserId: string | null; 
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
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

    setIsCommenting(true);
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
    setIsCommenting(false);
  };

  useEffect(() => {
    fetchComments();
  }, [showComments]);

  return (
    <div className="bg-white border border-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
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
              <Heart className="h-4 w-4" />
              <span>{post.likes}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </Button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          <h4 className="font-semibold mb-3 volter-font">Comentários</h4>
          {loadingComments ? (
            <p className="text-gray-500">Carregando comentários...</p>
          ) : (
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
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
              <Button 
                onClick={handleAddComment} 
                size="sm"
                disabled={isCommenting}
                className="bg-green-600 hover:bg-green-700 text-white volter-font"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Faça login para comentar</p>
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
  const [newPostImage, setNewPostImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const [activeSection, setActiveSection] = useState('forum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { isLoggedIn, user, habboAccount } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Handle sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedCategory !== 'Todos') {
      query = query.eq('category', selectedCategory);
    }

    const { data, error } = await query;

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive"
      });
      return;
    }

    setNewPostImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToSupabase = async (file: File): Promise<string | null> => {
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

    setIsCreatingPost(true);
    let imageUrl = null;

    // Upload image if provided
    if (newPostImage) {
      setUploadingImage(true);
      imageUrl = await uploadImageToSupabase(newPostImage);
      setUploadingImage(false);
      
      if (!imageUrl) {
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da imagem",
          variant: "destructive"
        });
        setIsCreatingPost(false);
        return;
      }
    }

    const { error } = await supabase
      .from('forum_posts')
      .insert({
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
        image_url: imageUrl,
        author_supabase_user_id: user.id,
        author_habbo_name: habboAccount.habbo_name,
        category: selectedCategory
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
      setNewPostImage(null);
      setImagePreview(null);
      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!"
      });
      fetchPosts();
    }
    setIsCreatingPost(false);
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

  const removeImage = () => {
    setNewPostImage(null);
    setImagePreview(null);
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  // Dados das categorias do fórum
  const forumCategories = [
    { 
      name: "Discussões Gerais", 
      description: "Conversa sobre tudo relacionado ao Habbo", 
      icon: <MessageCircle className="w-8 h-8 mx-auto text-gray-600" />, 
      topics: 1250, 
      posts: 15670, 
      lastPostTime: "2 minutos atrás", 
      bgColor: "bg-blue-100" 
    },
    { 
      name: "Suporte Técnico", 
      description: "Precisa de ajuda? Poste aqui!", 
      icon: <Users className="w-8 h-8 mx-auto text-gray-600" />, 
      topics: 890, 
      posts: 4320, 
      lastPostTime: "15 minutos atrás", 
      bgColor: "bg-green-100" 
    },
    { 
      name: "Eventos e Competições", 
      description: "Fique por dentro dos eventos e competições", 
      icon: <Clock className="w-8 h-8 mx-auto text-gray-600" />, 
      topics: 450, 
      posts: 2100, 
      lastPostTime: "1 hora atrás", 
      bgColor: "bg-purple-100" 
    },
  ];

  const renderContent = () => (
    <div className="space-y-6">
      {/* Seção de Categorias do Fórum */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white volter-font">Categorias do Fórum</h2>
        </div>
        <div className="p-6">
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
        </div>
      </div>

      {/* Seção de Criar Novo Post */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white volter-font">Criar Novo Post</h2>
        </div>
        <div className="p-6">
          {isLoggedIn ? (
            <div className="space-y-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isCreatingPost}
              >
                <option value="Geral">Discussões Gerais</option>
                <option value="Suporte">Suporte Técnico</option>
                <option value="Eventos">Eventos e Competições</option>
              </select>
              
              <Input
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Título do post"
                className="w-full"
                disabled={isCreatingPost}
              />
              
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Conteúdo do post"
                rows={4}
                className="w-full"
                disabled={isCreatingPost}
              />
              
              {/* Image Upload */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 cursor-pointer volter-font">
                  <ImageIcon className="h-4 w-4" />
                  {uploadingImage ? 'Carregando...' : 'Adicionar Imagem'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage || isCreatingPost}
                  />
                </label>
                
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-16 w-16 object-cover rounded-lg border"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleCreatePost} 
                className="w-full bg-green-600 hover:bg-green-700 text-white volter-font"
                disabled={isCreatingPost || uploadingImage}
              >
                {isCreatingPost ? 'Criando...' : 'Publicar Post'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Faça login para criar um post no fórum</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção de Posts */}
      <div className="bg-white border border-gray-900 rounded-lg shadow-md">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 rounded-t-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white volter-font">Tópicos Recentes</h2>
            <div className="flex flex-wrap gap-2">
              {['Todos', 'Geral', 'Suporte', 'Eventos'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded text-sm volter-font transition-colors ${
                    selectedCategory === category 
                      ? 'bg-white text-purple-600' 
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum post encontrado. Seja o primeiro a criar um!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLikePost}
                  currentUserId={user?.id || null}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        {renderContent()}
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Fórum Habbo Hub"
            icon="/assets/BatePapo1.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full border border-gray-900">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
