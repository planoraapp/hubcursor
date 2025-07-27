
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { MessageCircle, Users, Pin, Clock, Eye } from 'lucide-react';

export const Forum = () => {
  const { t } = useLanguage();

  const forumCategories = [
    {
      id: 1,
      name: 'Discussões Gerais',
      description: 'Converse sobre qualquer tópico relacionado ao Habbo',
      topics: 245,
      posts: 1834,
      lastPost: '2024-01-15 14:30',
      icon: MessageCircle
    },
    {
      id: 2,
      name: 'Ajuda e Suporte',
      description: 'Tire suas dúvidas e ajude outros jogadores',
      topics: 89,
      posts: 567,
      lastPost: '2024-01-15 13:45',
      icon: Users
    },
    {
      id: 3,
      name: 'Eventos e Competições',
      description: 'Fique por dentro dos eventos da comunidade',
      topics: 67,
      posts: 423,
      lastPost: '2024-01-15 12:20',
      icon: Pin
    }
  ];

  const recentTopics = [
    {
      id: 1,
      title: 'Como conseguir emblemas raros?',
      author: 'HabboPlayer123',
      replies: 23,
      views: 156,
      lastReply: '2024-01-15 14:30',
      pinned: false
    },
    {
      id: 2,
      title: '[OFICIAL] Regras do Fórum',
      author: 'Moderador',
      replies: 5,
      views: 1234,
      lastReply: '2024-01-15 10:00',
      pinned: true
    },
    {
      id: 3,
      title: 'Compartilhe seus quartos favoritos!',
      author: 'DesignMaster',
      replies: 45,
      views: 289,
      lastReply: '2024-01-15 13:15',
      pinned: false
    }
  ];

  return (
    <div className="space-y-6">
      <PanelCard title={t('forumTitle')}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {forumCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-4 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100 cursor-pointer">
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon size={24} className="text-[#008800]" />
                    <h3 className="font-bold text-[#38332c]">{category.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{category.topics} tópicos</span>
                    <span>{category.posts} posts</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{category.lastPost}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] shadow-[2px_2px_0px_0px_#cccccc] p-4">
            <h3 className="font-bold text-[#38332c] mb-4">Tópicos Recentes</h3>
            <div className="space-y-3">
              {recentTopics.map((topic) => (
                <div key={topic.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center space-x-3">
                    {topic.pinned && <Pin size={16} className="text-[#008800]" />}
                    <div>
                      <h4 className="font-medium text-[#38332c]">{topic.title}</h4>
                      <p className="text-xs text-gray-500">por {topic.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MessageCircle size={12} />
                      <span>{topic.replies}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={12} />
                      <span>{topic.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{topic.lastReply}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PanelCard>
    </div>
  );
};
