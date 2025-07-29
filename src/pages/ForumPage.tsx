
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Image as ImageIcon } from 'lucide-react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { ForumCategoryCard } from '../components/forum/ForumCategoryCard';
import { PostCard } from '../components/forum/PostCard';

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

  const renderContent = () => (
    <div className="space-y-6">
      {/* Forum Categories Section */}
      <Card className="bg-white border-gray-900">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="volter-font">Categorias do Fórum</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ForumCategoryCard
              title="Discussões Gerais"
              description="Conversa sobre tudo relacionado ao Habbo"
              topics={1250}
              posts={15670}
              lastPostTime="2 minutos atrás"
              bgColorClass="bg-blue-100"
            />
            <ForumCategoryCard
              title="Suporte Técnico"
              description="Precisa de ajuda? Poste aqui!"
              topics={890}
              posts={4320}
              lastPostTime="15 minutos atrás"
              bgColorClass="bg-green-100"
            />
            <ForumCategoryCard
              title="Eventos e Competições"
              description="Fique por dentro dos eventos e competições"
              topics={450}
              posts={2100}
              lastPostTime="1 hora atrás"
              bgColorClass="bg-purple-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create New Post Section */}
      <Card className="bg-white border-gray-900">
        <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardTitle className="volter-font">Criar Novo Post</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
                disabled={isCreatingPost}
              />
              
              <Textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Conteúdo do post"
                rows={4}
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
        </CardContent>
      </Card>

      {/* Recent Posts Section */}
      <Card className="bg-white border-gray-900">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="volter-font">Tópicos Recentes</CardTitle>
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
        </CardHeader>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
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
