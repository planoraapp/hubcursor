
import { Activity, TrendingUp, Users, Award } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { useTopRooms, useRealtimeStats, useTopBadgeCollectors } from '../hooks/useHabboData';

export const HomePage = () => {
  const { data: topRooms, isLoading: roomsLoading } = useTopRooms();
  const { data: stats, isLoading: statsLoading } = useRealtimeStats();
  const { data: topCollectors, isLoading: collectorsLoading } = useTopBadgeCollectors();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  // Simular notícias baseadas em atividade da API
  const apiNews = [
    {
      title: "Sistema de Rankings Atualizado",
      date: formatDate(new Date().toISOString()),
      snippet: "Novos dados em tempo real dos melhores colecionadores e quartos populares do Habbo BR."
    },
    {
      title: "Explorador de Quartos Melhorado",
      date: formatDate(new Date(Date.now() - 3600000).toISOString()),
      snippet: "Agora você pode descobrir quartos reais através da nossa integração com a API oficial."
    },
    {
      title: "Catálogo de Emblemas Expandido",
      date: formatDate(new Date(Date.now() - 7200000).toISOString()),
      snippet: "Todos os emblemas disponíveis no Habbo BR agora estão catalogados em tempo real."
    }
  ];

  return (
    <div className="space-y-8">
      <PanelCard title="Bem-vindo ao Habbo Hub BR" className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            🇧🇷
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Habbo Hotel Brasil</h2>
            <p className="text-gray-600">Dados em tempo real da API oficial</p>
          </div>
        </div>
        <p className="text-lg text-gray-600">
          Sua central de ferramentas e informações para o Habbo Hotel Brasil. Explore os dados públicos mais recentes e otimize sua experiência no jogo.
        </p>
      </PanelCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PanelCard title="Atividade Recente da API">
          <div className="space-y-4">
            {apiNews.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity size={14} className="text-blue-500" />
                  <h4 className="font-bold text-gray-800">{item.title}</h4>
                </div>
                <p className="text-sm text-gray-500 mb-1">{item.date}</p>
                <p className="text-sm text-gray-600">{item.snippet}</p>
              </div>
            ))}
          </div>
        </PanelCard>
        
        <PanelCard title="Quartos em Destaque">
          {roomsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
              <p className="text-gray-600">Carregando quartos...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topRooms?.slice(0, 3).map((room, index) => (
                <div key={index} className="border-l-4 border-green-400 pl-4 py-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">{room.name}</h4>
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                      <Users size={14} />
                      <span>{room.score}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">por {room.owner}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">⭐ {room.room.rating || 0}</span>
                    <span className="text-xs text-gray-500">
                      📅 {formatDate(room.room.creationTime)}
                    </span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-gray-500">Nenhum quarto disponível no momento.</p>
                </div>
              )}
            </div>
          )}
        </PanelCard>
      </div>

      <PanelCard title="Top Colecionadores">
        {collectorsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-gray-600">Carregando colecionadores...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCollectors?.slice(0, 3).map((collector, index) => (
              <div key={index} className="border-l-4 border-purple-400 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-gray-700">#{index + 1}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{collector.name}</h4>
                      <p className="text-sm text-gray-500">{collector.score} emblemas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm">
                    <Award size={14} className="text-purple-500" />
                    <span className="text-purple-600">{collector.score}</span>
                  </div>
                </div>
                {collector.user.motto && (
                  <p className="text-xs text-gray-500 italic mt-1">"{collector.user.motto}"</p>
                )}
              </div>
            )) || (
              <div className="text-center py-4">
                <p className="text-gray-500">Nenhum colecionador disponível no momento.</p>
              </div>
            )}
          </div>
        )}
      </PanelCard>
      
      <PanelCard title="Estatísticas em Tempo Real">
        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#008800]">{stats?.totalRooms || 0}</div>
              <div className="text-sm text-gray-600">Quartos Descobertos</div>
            </div>
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#dd0000]">{stats?.totalBadges || 0}</div>
              <div className="text-sm text-gray-600">Emblemas Disponíveis</div>
            </div>
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#0066cc]">{stats?.activeUsers || 0}</div>
              <div className="text-sm text-gray-600">Usuários Ativos</div>
            </div>
            <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
              <div className="text-2xl font-bold text-[#ff6600]">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Avaliação Média</div>
            </div>
          </div>
        )}
      </PanelCard>
    </div>
  );
};
