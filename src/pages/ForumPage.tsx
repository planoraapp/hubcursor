
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../integrations/supabase/client';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { MessageCircle, Heart, Image, Send } from 'lucide-react';

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

// Componente para um card de Post
function PostCard({ post, onLike, currentUserId, isAdmin }: {
  post: ForumPost;
  onLike: (postId: string) => void;
  currentUserId: string | null;
  isAdmin: boolean;
}) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchComments = async () => {
      if (!showCommentForm) return;
      
      setLoadingComments(true);
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao carregar comentários:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar comentários.",
          variant: "destructive"
        });
      } else {
        setComments(data || []);
      }
      setLoadingComments(false);
    };

    fetchComments();
  }, [showCommentForm, post.id, toast]);

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) {
      toast({
        title: "Erro",
        description: "Comentário não pode ser vazio.",
        variant: "destructive"
      });
      return;
    }
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para comentar.",
        variant: "destructive"
      });
      return;
    }

    const { data: userLink } = await supabase
      .from('habbo_accounts')
      .select('habbo_name')
      .eq('supabase_user_id', currentUserId)
      .single();

    if (!userLink) {
      toast({
        title: "Erro",
        description: "Não foi possível obter os detalhes da sua conta Habbo.",
        variant: "destructive"
      });
      return;
    }

    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: post.id,
        content: newCommentContent.trim(),
        author_supabase_user_id: currentUserId,
        author_habbo_name: userLink.habbo_name,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar comentário.",
        variant: "destructive"
      });
    } else {
      setComments([...comments, data]);
      setNewCommentContent('');
      toast({
        title: "Sucesso",
        description: "Comentário adicionado!"
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg border-2 border-gray-400 border-r-gray-600 border-b-gray-600 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-4 md:p-6 flex flex-col md:flex-row gap-4">
        {post.image_url && (
          <div className="flex-shrink-0 w-full md:w-48 h-48 md:h-auto overflow-hidden rounded-lg">
            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
          <p className="text-gray-700 text-sm mb-3">{post.content}</p>
          <div className="text-xs text-gray-500 mb-4">
            Por <span className="font-semibold">{post.author_habbo_name}</span> em {new Date(post.created_at).toLocaleDateString('pt-BR')}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Heart className="h-5 w-5 mr-1" />
              {post.likes} Curtidas
            </button>
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-1" />
              {comments.length} Comentários
            </button>
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
              {comments.map(comment => (
                <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  <span className="text-xs text-gray-500">
                    Por {comment.author_habbo_name} em {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                  </span>
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
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Adicionar Comentário
              </button>
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
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('forum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isProcessingPost, setIsProcessingPost] = useState(false);

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

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar posts:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar posts do fórum.",
        variant: "destructive"
      });
    } else {
      setPosts(data || []);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `forum_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('forum-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Erro ao fazer upload da imagem:', uploadError);
      toast({
        title: "Erro",
        description: "Erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive"
      });
      setUploadingImage(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('forum-images')
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      setNewPostImage(publicUrlData.publicUrl);
      toast({
        title: "Sucesso",
        description: "Imagem carregada com sucesso!"
      });
    }
    setUploadingImage(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo não podem ser vazios.",
        variant: "destructive"
      });
      return;
    }
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post.",
        variant: "destructive"
      });
      return;
    }

    const { data: userLink } = await supabase
      .from('habbo_accounts')
      .select('habbo_name')
      .eq('supabase_user_id', user.id)
      .single();

    if (!userLink) {
      toast({
        title: "Erro",
        description: "Não foi possível obter os detalhes da sua conta Habbo.",
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
        author_habbo_name: userLink.habbo_name,
      });

    if (error) {
      console.error('Erro ao criar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar post.",
        variant: "destructive"
      });
    } else {
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostImage(null);
      toast({
        title: "Sucesso",
        description: "Post criado com sucesso!"
      });
      fetchPosts();
    }
    setIsProcessingPost(false);
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para curtir.",
        variant: "destructive"
      });
      return;
    }

    const { data: postToUpdate, error: fetchError } = await supabase
      .from('forum_posts')
      .select('likes')
      .eq('id', postId)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar post para curtir:', fetchError);
      toast({
        title: "Erro",
        description: "Erro ao curtir.",
        variant: "destructive"
      });
      return;
    }

    const newLikes = (postToUpdate.likes || 0) + 1;
    const { error: updateError } = await supabase
      .from('forum_posts')
      .update({ likes: newLikes })
      .eq('id', postId);

    if (updateError) {
      console.error('Erro ao curtir post:', updateError);
      toast({
        title: "Erro",
        description: "Erro ao curtir post.",
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

  const renderContent = () => (
    <div className="space-y-6">
      {/* Create Post Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg border-2 border-gray-400 border-r-gray-600 border-b-gray-600 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
          <h2 className="text-white font-bold text-lg">Criar Novo Post</h2>
        </div>
        <div className="p-6">
          {isLoggedIn ? (
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <input
                type="text"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Título do Post"
                className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 cursor-pointer flex items-center gap-2">
                  <Image className="h-5 w-5" />
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
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessingPost || uploadingImage}
              >
                {isProcessingPost ? 'Criando Post...' : 'Publicar Post'}
              </button>
            </form>
          ) : (
            <p className="text-red-600 text-center">Faça login para criar um novo post no fórum.</p>
          )}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-700 text-center">Nenhum post no fórum ainda. Seja o primeiro a criar um!</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onLike={handleLikePost}
              currentUserId={user?.id || null}
              isAdmin={false} // TODO: Implement admin check
            />
          ))
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Fórum Habbo"
            icon="/assets/BatePapo1.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 min-h-full">
            {renderContent()}
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <PageHeader 
            title="Fórum Habbo"
            icon="/assets/BatePapo1.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 md:p-6 min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
