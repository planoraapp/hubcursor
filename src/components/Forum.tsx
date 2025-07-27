
import { useLanguage } from '../hooks/useLanguage';
import { PanelCard } from './PanelCard';
import { MessageCircle, Users, Clock, Pin } from 'lucide-react';

export const Forum = () => {
  const { t } = useLanguage();

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

  const recentTopics = [
    {
      id: 1,
      title: 'Como conseguir moedas rápido?',
      author: 'HabboFan2024',
      replies: 23,
      views: 456,
      lastReply: '5 minutos atrás',
      isPinned: false
    },
    {
      id: 2,
      title: '[OFICIAL] Regras do Fórum - Leia antes de postar',
      author: 'Moderador',
      replies: 1,
      views: 2340,
      lastReply: '2 dias atrás',
      isPinned: true
    },
    {
      id: 3,
      title: 'Dicas para decorar seu quarto',
      author: 'DesignMaster',
      replies: 67,
      views: 1250,
      lastReply: '1 hora atrás',
      isPinned: false
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

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tópicos Recentes</h3>
            <div className="space-y-2">
              {recentTopics.map((topic) => (
                <div key={topic.id} className="habbo-card">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {topic.isPinned && (
                        <Pin size={16} className="text-yellow-600" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{topic.title}</h4>
                        <p className="text-sm text-gray-600">por {topic.author}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{topic.replies} respostas</div>
                      <div>{topic.views} visualizações</div>
                      <div className="text-xs">{topic.lastReply}</div>
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
