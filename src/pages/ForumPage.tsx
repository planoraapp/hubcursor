import { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ForumCategory {
  id: number;
  name: string;
  description: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  category_id: number;
  created_at: string;
  user_id: string;
  user_name: string;
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
function ForumCategoryCard({ category }: { category: ForumCategory }) {
  return (
    <div className="bg-gray-100 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <h3 className="font-bold text-gray-800">{category.name}</h3>
      <p className="text-gray-600 text-sm">{category.description}</p>
    </div>
  );
}

// Componente para exibir um post
function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200">
      <h4 className="font-bold text-blue-600">{post.title}</h4>
      <p className="text-gray-700 text-sm">{post.content.substring(0, 100)}...</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-gray-500 text-xs">Criado em: {new Date(post.created_at).toLocaleDateString()}</span>
        <span className="text-blue-500 text-xs">Por: {post.user_name}</span>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const [activeSection, setActiveSection] = useState('forum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { session, user } = useAuth();
  const [filter, setFilter] = useState('recent');

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
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('forum_categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          setForumCategories(data);
        }
      } catch (error: any) {
        toast.error(`Erro ao carregar categorias: ${error.message}`);
      }
    };

    const fetchPosts = async () => {
      try {
        let query = supabase
          .from('forum_posts')
          .select('*, user:user_profiles(user_name)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (filter === 'popular') {
          query = query.order('likes', { ascending: false }).limit(5);
        }

        const { data: postsData, error: postsError } = await query;

        if (postsError) {
          throw postsError;
        }

        if (postsData) {
          const formattedPosts = postsData.map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category_id: post.category_id,
            created_at: post.created_at,
            user_id: post.user_id,
            user_name: post.user?.user_name || 'Usuário Desconhecido',
          }));
          setPosts(formattedPosts);
        }
      } catch (error: any) {
        toast.error(`Erro ao carregar posts: ${error.message}`);
      }
    };

    fetchCategories();
    fetchPosts();
  }, [filter]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session || !user) {
      toast.error('Você precisa estar logado para criar um post.');
      return;
    }

    if (!selectedCategory) {
      toast.error('Selecione uma categoria para o post.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            title: newPostTitle,
            content: newPostContent,
            category_id: selectedCategory,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setPosts([
        {
          id: data.id,
          title: data.title,
          content: data.content,
          category_id: data.category_id,
          created_at: data.created_at,
          user_id: user.id,
          user_name: user.user_name || 'Você',
        },
        ...posts,
      ]);
      setNewPostTitle('');
      setNewPostContent('');
      setSelectedCategory(null);
      toast.success('Post criado com sucesso!');
    } catch (error: any) {
      toast.error(`Erro ao criar post: ${error.message}`);
    }
  };

  const renderContent = () => (
    <div className="space-y-6">
      {/* Seção de Categorias do Fórum */}
      <HabboPanel title="Categorias do Fórum">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forumCategories.map((category) => (
            <ForumCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </HabboPanel>

      {/* Seção de Criar Novo Post */}
      <HabboPanel title="Criar Novo Post">
        <form onSubmit={handleSubmitPost} className="space-y-4">
          <div>
            <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700">
              Título do Post
            </label>
            <input
              type="text"
              id="postTitle"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={newPostTitle}
              onChange={(e) => setNewPostTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="postContent" className="block text-sm font-medium text-gray-700">
              Conteúdo do Post
            </label>
            <textarea
              id="postContent"
              rows={4}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="postCategory" className="block text-sm font-medium text-gray-700">
              Categoria
            </label>
            <select
              id="postCategory"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(Number(e.target.value))}
              required
            >
              <option value="">Selecione uma categoria</option>
              {forumCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Criar Post
            </button>
          </div>
        </form>
      </HabboPanel>

      {/* Seção de Tópicos Recentes / Posts */}
      <HabboPanel
        title="Tópicos Recentes"
        headerComponent={
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${filter === 'recent' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('recent')}
            >
              Recentes
            </button>
            <button
              className={`px-3 py-1 rounded ${filter === 'popular' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('popular')}
            >
              Populares
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
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
