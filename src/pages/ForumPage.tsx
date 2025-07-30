
import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  author_supabase_user_id: string;
  author_habbo_name: string;
  likes: number;
  image_url?: string;
}

// Componente para um card de Painel
function HabboPanel({ title, children, headerComponent }: { 
  title: string; 
  children: React.ReactNode; 
  headerComponent?: React.ReactNode; 
}) {
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

// Componente para exibir as categorias do fórum
function ForumCategoryCard({ category }: { category: { name: string; description: string; icon: React.ReactNode; topics: number; posts: number; lastPostTime: string; bgColor: string } }) {
  return (
    <div className={`bg-white border border-gray-900 rounded-lg shadow-md p-4 flex items-start space-x-4 ${category.bgColor || 'bg-blue-50'}`}>
      <div className="flex-shrink-0">
        {category.icon}
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-lg mb-1 volter-font" style={{ textShadow: '0.5px 0.5px 0px black, -0.5px -0.5px 0px black, 0.5px -0.5px 0px black, -0.5px 0.5px 0px black' }}>{category.name}</h4>
        <p className="text-sm text-gray-600 mb-2">{category.description}</p>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Tópicos: {category.topics}</span>
          <span>Posts: {category.posts}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Último post: {category.lastPostTime}</p>
      </div>
    </div>
  );
}

// Componente para exibir um post
function PostCard({ post, onLike, currentUserId }: { post: Post; onLike: (postId: string) => Promise<void>; currentUserId: string | null }) {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const fetchComments = async () => {
    if (!showCommentForm) return;
    setLoadingComments(true);
    
    const { data, error } = await supabase
      .from('forum_comments')
      .select('*')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      toast.error('Erro ao carregar comentários');
    } else {
      setComments(data || []);
    }
    setLoadingComments(false);
  };

  useEffect(() => {
    fetchComments();
  }, [showCommentForm, post.id]);

  const handleAddCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim() || !currentUserId) return;

    setIsCommenting(true);
    const { data: habboAccount } = await supabase
      .from('habbo_accounts')
      .select('habbo_name')
      .eq('supabase_user_id', currentUserId)
      .single();

    const { data, error } = await supabase
      .from('forum_comments')
      .insert({
        post_id: post.id,
        content: newCommentContent.trim(),
        author_supabase_user_id: currentUserId,
        author_habbo_name: habboAccount?.habbo_name || 'Usuário'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
    } else {
      setComments([...comments, data]);
      setNewCommentContent('');
      toast.success('Comentário adicionado!');
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
            <button
              onClick={() => onLike(post.id)}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              disabled={!currentUserId}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.433a2.5 2.5 0 001.523 2.227l.958.428a1.5 1.5 0 002.134-.607l1.454-3.725a1.5 1.5 0 011.044-.716l2.943-.588A.75.75 0 0018 10.75V3.75A.75.75 0 0017.25 3H7.5A2.25 2.25 0 005.25 5.25v4.083z" />
              </svg>
              {post.likes} Curtidas
            </button>
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.758-1.379L2 17l1.62-2.16A8.844 8.844 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
              </svg>
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
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed volter-font" 
                disabled={isCommenting}
              >
                {isCommenting ? 'Adicionando...' : 'Adicionar Comentário'}
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
  const [activeSection, setActiveSection] = useState('forum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Geral');
  const { session, user, habboAccount } = useAuth();
  const [filter, setFilter] = useState('recent');
  const [isProcessingPost, setIsProcessingPost] = useState(false);

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
    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('forum_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (filter === 'popular') {
          query = query.order('likes', { ascending: false });
        }

        if (selectedCategory !== 'Todos') {
          query = query.eq('category', selectedCategory);
        }

        const { data: postsData, error: postsError } = await query;

        if (postsError) {
          throw postsError;
        }

        if (postsData) {
          setPosts(postsData);
        }
      } catch (error: any) {
        toast.error(`Erro ao carregar posts: ${error.message}`);
      }
    };

    fetchPosts();
  }, [filter, selectedCategory]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !user || !habboAccount) {
      toast.error('Você precisa estar logado para criar um post.');
      return;
    }

    setIsProcessingPost(true);
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          title: newPostTitle,
          content: newPostContent,
          category: selectedCategory,
          author_supabase_user_id: user.id,
          author_habbo_name: habboAccount.habbo_name
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPosts([data, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      toast.success('Post criado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao criar post: ${error.message}`);
    } finally {
      setIsProcessingPost(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) {
      toast.error('Faça login para curtir posts');
      return;
    }

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const { error } = await supabase
        .from('forum_posts')
        .update({ likes: post.likes + 1 })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
      
      toast.success('Post curtido!');
    } catch (error: any) {
      toast.error('Erro ao curtir post');
    }
  };

  const forumCategories = [
    { 
      name: "Discussões Gerais", 
      description: "Conversa sobre tudo relacionado ao Habbo", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle mx-auto text-gray-600"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>, 
      topics: 1250, 
      posts: 15670, 
      lastPostTime: "2 minutos atrás", 
      bgColor: "bg-blue-100" 
    },
    { 
      name: "Suporte Técnico", 
      description: "Precisa de ajuda? Poste aqui!", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users mx-auto text-gray-600"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, 
      topics: 890, 
      posts: 4320, 
      lastPostTime: "15 minutos atrás", 
      bgColor: "bg-green-100" 
    },
    { 
      name: "Eventos e Competições", 
      description: "Fique por dentro dos eventos e competições", 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock mx-auto text-gray-600"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>, 
      topics: 450, 
      posts: 2100, 
      lastPostTime: "1 hora atrás", 
      bgColor: "bg-purple-100" 
    },
  ];

  const renderContent = () => (
    <div className="space-y-6">
      {/* Seção de Categorias do Fórum */}
      <HabboPanel title="Categorias do Fórum">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forumCategories.map((category) => (
            <ForumCategoryCard key={category.name} category={category} />
          ))}
        </div>
      </HabboPanel>

      {/* Seção de Criar Novo Post */}
      <HabboPanel title="Criar Novo Post">
        {user && habboAccount ? (
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <label htmlFor="postCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                id="postCategory"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isProcessingPost}
              >
                <option value="Geral">Discussões Gerais</option>
                <option value="Suporte">Suporte Técnico</option>
                <option value="Eventos">Eventos e Competições</option>
              </select>
            </div>
            <div>
              <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Título do Post
              </label>
              <input
                type="text"
                id="postTitle"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Digite o título do seu post"
                required
                disabled={isProcessingPost}
              />
            </div>
            <div>
              <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo do Post
              </label>
              <textarea
                id="postContent"
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Escreva o conteúdo do seu post"
                required
                disabled={isProcessingPost}
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 volter-font"
              disabled={isProcessingPost}
            >
              {isProcessingPost ? 'Criando Post...' : 'Criar Post'}
            </button>
          </form>
        ) : (
          <p className="text-center text-gray-600">Faça login para criar um post no fórum</p>
        )}
      </HabboPanel>

      {/* Seção de Tópicos Recentes / Posts */}
      <HabboPanel
        title="Tópicos Recentes"
        headerComponent={
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded text-sm volter-font ${filter === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('recent')}
            >
              Recentes
            </button>
            <button
              className={`px-3 py-1 rounded text-sm volter-font ${filter === 'popular' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('popular')}
            >
              Populares
            </button>
          </div>
        }
      >
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setSelectedCategory('Todos')}
            className={`px-3 py-1 rounded text-sm volter-font ${selectedCategory === 'Todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedCategory('Geral')}
            className={`px-3 py-1 rounded text-sm volter-font ${selectedCategory === 'Geral' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Geral
          </button>
          <button
            onClick={() => setSelectedCategory('Suporte')}
            className={`px-3 py-1 rounded text-sm volter-font ${selectedCategory === 'Suporte' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Suporte
          </button>
          <button
            onClick={() => setSelectedCategory('Eventos')}
            className={`px-3 py-1 rounded text-sm volter-font ${selectedCategory === 'Eventos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            Eventos
          </button>
        </div>
        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-gray-700 text-center">Nenhum post encontrado. Seja o primeiro a criar um!</p>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLikePost}
                currentUserId={user?.id || null}
              />
            ))
          )}
        </div>
      </HabboPanel>
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          <PageHeader 
            title="Fórum Habbo Hub"
            icon="/assets/BatePapo1.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
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
            title="Fórum Habbo Hub"
            icon="/assets/BatePapo1.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
