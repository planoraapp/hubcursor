
import { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from '../components/PanelCard';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { MessageCircle, Users, Clock, Pin, Heart, MessageSquare } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  replies: number;
  views: number;
  lastReply: string;
  isPinned: boolean;
  likes: number;
  image?: string;
}

interface ForumComment {
  id: string;
  postId: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function ForumPage() {
  const { t } = useLanguage();
  const { habboAccount, user } = useSupabaseAuth();
  const { toast } = useToast();
  
  // Mock data for now - will be replaced with real data later
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Como conseguir moedas rápido?',
      content: 'Pessoal, queria saber algumas dicas para conseguir moedas no Habbo de forma mais rápida. Alguém tem alguma dica legal?',
      author: 'HabboFan2024',
      replies: 23,
      views: 456,
      lastReply: '5 minutos atrás',
      isPinned: false,
      likes: 12
    },
    {
      id: '2',
      title: '[OFICIAL] Regras do Fórum - Leia antes de postar',
      content: 'Estas são as regras oficiais do fórum Habbo Hub. Por favor, leia atentamente antes de fazer qualquer postagem.',
      author: 'habbohub',
      replies: 1,
      views: 2340,
      lastReply: '2 dias atrás',
      isPinned: true,
      likes: 45
    },
    {
      id: '3',
      title: 'Dicas para decorar seu quarto',
      content: 'Vou compartilhar algumas dicas incríveis para deixar seu quarto no Habbo com uma decoração moderna e estilosa!',
      author: 'DesignMaster',
      replies: 67,
      views: 1250,
      lastReply: '1 hora atrás',
      isPinned: false,
      likes: 89
    }
  ]);

  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um post.",
        variant: "destructive"
      });
      return;
    }

    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast({
        title: "Erro",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newPost: ForumPost = {
      id: Date.now().toString(),
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      author: habboAccount.habbo_name,
      replies: 0,
      views: 0,
      lastReply: 'Agora',
      isPinned: false,
      likes: 0
    };

    setPosts([newPost, ...posts]);
    setNewPostTitle('');
    setNewPostContent('');
    
    toast({
      title: "Sucesso",
      description: "Post criado com sucesso!",
    });
  };

  const handleLikePost = (postId: string) => {
    if (!habboAccount) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para curtir posts.",
        variant: "destructive"
      });
      return;
    }

    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habboAccount || !selectedPost) return;

    if (!newComment.trim()) {
      toast({
        title: "Erro",
        description: "Comentário não pode estar vazio.",
        variant: "destructive"
      });
      return;
    }

    const comment: ForumComment = {
      id: Date.now().toString(),
      postId: selectedPost.id,
      content: newComment.trim(),
      author: habboAccount.habbo_name,
      createdAt: new Date().toLocaleString('pt-BR')
    };

    setComments([...comments, comment]);
    setNewComment('');
    
    // Update post reply count
    setPosts(posts.map(post => 
      post.id === selectedPost.id 
        ? { ...post, replies: post.replies + 1, lastReply: 'Agora' }
        : post
    ));

    toast({
      title: "Sucesso",
      description: "Comentário adicionado!",
    });
  };

  const openPost = (post: ForumPost) => {
    setSelectedPost(post);
    // Update views
    setPosts(posts.map(p => 
      p.id === post.id 
        ? { ...p, views: p.views + 1 }
        : p
    ));
    // Load comments for this post
    setComments([]);
  };

  const forumCategories = [
    {
      id: 1,
      name: 'Discussões Gerais',
      description: 'Conversa sobre tudo relacionado ao Habbo',
      topics: 1250,
      posts: 15670,
      lastPost: '2 minutos atrás',
      icon: MessageCircle,
      color: 'bg-blue-100'
    },
    {
      id: 2,
      name: 'Suporte Técnico',
      description: 'Precisa de ajuda? Poste aqui!',
      topics: 890,
      posts: 4320,
      lastPost: '15 minutos atrás',
      icon: Users,
      color: 'bg-green-100'
    },
    {
      id: 3,
      name: 'Eventos e Competições',
      description: 'Fique por dentro dos eventos',
      topics: 450,
      posts: 2100,
      lastPost: '1 hora atrás',
      icon: Clock,
      color: 'bg-purple-100'
    }
  ];

  if (selectedPost) {
    return (
      <div className="space-y-6">
        <PanelCard title="Fórum">
          <div className="space-y-4">
            <button
              onClick={() => setSelectedPost(null)}
              className="text-blue-600 hover:text-blue-800 mb-4"
            >
              ← Voltar ao fórum
            </button>
            
            <div className="habbo-card">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {selectedPost.isPinned && <Pin className="inline w-5 h-5 text-yellow-600 mr-2" />}
                      {selectedPost.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      Por <span className="font-semibold">{selectedPost.author}</span>
                    </p>
                    <p className="text-gray-700 mb-4">{selectedPost.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{selectedPost.views} visualizações</span>
                      <span>{selectedPost.replies} respostas</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLikePost(selectedPost.id)}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-600"
                  >
                    <Heart className="w-5 h-5" />
                    <span>{selectedPost.likes}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="habbo-card">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Comentários</h3>
                
                {comments.length === 0 ? (
                  <p className="text-gray-600 mb-4">Nenhum comentário ainda. Seja o primeiro!</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-800">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.createdAt}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {habboAccount ? (
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva seu comentário..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Comentar
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-600">Faça login para comentar</p>
                )}
              </div>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelCard title="Fórum">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forumCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="habbo-card">
                  <div className={`p-4 ${category.color}`}>
                    <Icon size={32} className="mx-auto text-gray-600" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Tópicos:</span>
                        <span className="font-medium">{category.topics}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Posts:</span>
                        <span className="font-medium">{category.posts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Último post:</span>
                        <span className="font-medium">{category.lastPost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {habboAccount && (
            <div className="habbo-card">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Criar Novo Post</h3>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="Título do post"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Conteúdo do post"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publicar
                  </button>
                </form>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800">Tópicos Recentes</h3>
            {posts.map((post) => (
              <div key={post.id} className="habbo-card">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {post.isPinned && (
                      <Pin size={16} className="text-yellow-600" />
                    )}
                    <div className="flex-1">
                      <button
                        onClick={() => openPost(post)}
                        className="text-left hover:text-blue-600 transition-colors"
                      >
                        <h4 className="font-medium text-gray-800">{post.title}</h4>
                        <p className="text-sm text-gray-600">por {post.author}</p>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replies}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="text-right">
                      <div>{post.views} visualizações</div>
                      <div className="text-xs">{post.lastReply}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PanelCard>
    </div>
  );
}
