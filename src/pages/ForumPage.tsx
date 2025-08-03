import React, { useState, useEffect } from 'react';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { PageHeader } from '../components/PageHeader';
import { PanelCard } from '../components/PanelCard';
import { useIsMobile } from '../hooks/use-mobile';
import MobileLayout from '../layouts/MobileLayout';
import { Book, MessageSquare, Users, LayoutDashboard } from 'lucide-react';

const forumCategories = [
  {
    title: 'Geral',
    description: 'Discussões gerais sobre o Habbo e a comunidade.',
    topics: 120,
    posts: 1800,
    lastPost: 'Ontem às 22:45',
    icon: MessageSquare,
    bgColor: '#f0fdfa'
  },
  {
    title: 'Ajuda e Suporte',
    description: 'Precisa de ajuda? Tire suas dúvidas aqui.',
    topics: 45,
    posts: 675,
    lastPost: 'Hoje às 08:12',
    icon: Book,
    bgColor: '#ecfdf5'
  },
  {
    title: 'Apresentações',
    description: 'Apresente-se para a comunidade HabboHub!',
    topics: 60,
    posts: 900,
    lastPost: 'Hoje às 14:20',
    icon: Users,
    bgColor: '#fefce8'
  },
  {
    title: 'Sugestões',
    description: 'Compartilhe suas ideias para melhorar o HabboHub.',
    topics: 30,
    posts: 450,
    lastPost: 'Hoje às 16:55',
    icon: LayoutDashboard,
    bgColor: '#f5f3ff'
  },
];

const CreatePostForm = () => {
  return (
    <form className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título:</label>
        <input type="text" id="title" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">Conteúdo:</label>
        <textarea id="content" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
      </div>
      <div>
        <button type="submit" className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Criar Post
        </button>
      </div>
    </form>
  );
};

const PostsList = () => {
  const recentPosts = [
    { title: 'Bem-vindos ao novo fórum!', author: 'Admin', date: 'Hoje às 10:00' },
    { title: 'Dúvidas frequentes sobre o Habbo', author: 'Usuário123', date: 'Ontem às 18:30' },
    { title: 'Apresentem-se aqui!', author: 'NovoHabbo', date: '22/04/2024' },
  ];

  return (
    <ul>
      {recentPosts.map((post, index) => (
        <li key={index} className="py-2 border-b border-gray-200">
          <div className="flex justify-between">
            <h5 className="font-medium text-gray-800">{post.title}</h5>
            <span className="text-sm text-gray-500">{post.date}</span>
          </div>
          <p className="text-sm text-gray-600">Autor: {post.author}</p>
        </li>
      ))}
    </ul>
  );
};

export default function ForumPage() {
  const [activeSection, setActiveSection] = useState('forum');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener);
    };
  }, []);

  const renderContent = () => (
    <div className="space-y-6">
      {/* Forum Categories Card - Otimizado sem borda branca */}
      <div 
        className="rounded-lg shadow-lg overflow-hidden"
        style={{ border: '2px solid black' }}
      >
        {/* Header colorido */}
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font"
              style={{ textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px' }}>
            Categorias do Fórum
          </h3>
        </div>

        {/* Conteúdo principal */}
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forumCategories.map((category, index) => (
              <div key={index} className="bg-white border border-gray-900 rounded-lg shadow-md p-4 flex items-start space-x-4" 
                   style={{ backgroundColor: category.bgColor }}>
                <div className="flex-shrink-0">
                  <category.icon className="mx-auto text-gray-600" size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-1 volter-font"
                      style={{ textShadow: 'black 0.5px 0.5px 0px, black -0.5px -0.5px 0px, black 0.5px -0.5px 0px, black -0.5px 0.5px 0px' }}>
                    {category.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tópicos: {category.topics}</span>
                    <span>Posts: {category.posts}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Último post: {category.lastPost}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create New Post Card - Otimizado */}
      <div 
        className="rounded-lg shadow-lg overflow-hidden"
        style={{ border: '2px solid black' }}
      >
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font"
              style={{ textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px' }}>
            Criar Novo Post
          </h3>
        </div>
        <div className="p-6 bg-white">
          <CreatePostForm />
        </div>
      </div>

      {/* Recent Posts Card - Otimizado */}
      <div 
        className="rounded-lg shadow-lg overflow-hidden"
        style={{ border: '2px solid black' }}
      >
        <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-center volter-font"
              style={{ textShadow: 'black 1px 1px 0px, black -1px -1px 0px, black 1px -1px 0px, black -1px 1px 0px' }}>
            Posts Recentes
          </h3>
        </div>
        <div className="p-6 bg-white">
          <PostsList />
        </div>
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
            title="Fórum Habbo"
            icon="/assets/BatePapo1.png"
            backgroundImage="/assets/1360__-3C7.png"
          />
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
