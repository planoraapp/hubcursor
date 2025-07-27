
import { useState } from 'react';
import { Trophy, Award, MapPin, Users } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { useTopBadgeCollectors, useTopRooms } from '../hooks/useHabboData';
import { getAvatarUrl } from '../services/habboApi';

export const Rankings = () => {
  const [activeTab, setActiveTab] = useState('emblemas');
  const { data: topCollectors, isLoading: collectorsLoading, error: collectorsError } = useTopBadgeCollectors();
  const { data: topRooms, isLoading: roomsLoading, error: roomsError } = useTopRooms();

  const tabs = [
    { id: 'emblemas', label: 'Top Colecionadores de Emblemas', icon: Award },
    { id: 'quartos', label: 'Quartos Mais Visitados', icon: MapPin },
  ];

  const isLoading = collectorsLoading || roomsLoading;
  const hasError = collectorsError || roomsError;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PanelCard title="Rankings Habbo BR">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando rankings do Habbo BR...</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-8">
        <PanelCard title="Rankings Habbo BR">
          <div className="text-center py-8">
            <Trophy className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Erro ao carregar rankings</h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os rankings do Habbo BR.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#008800] text-white px-6 py-2 rounded-lg font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100"
            >
              Tentar Novamente
            </button>
          </div>
        </PanelCard>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PanelCard title="Rankings Habbo BR">
        <p className="text-lg text-gray-600">
          Veja os Habbos e quartos em destaque nos rankings oficiais do Habbo Hotel BR.
        </p>
      </PanelCard>

      <PanelCard>
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 font-bold border-2 border-[#5a5a5a] rounded-t-lg transition-all duration-100 ${
                  activeTab === tab.id
                    ? 'bg-white border-b-white text-[#38332c]'
                    : 'bg-[#d1d1d1] text-[#38332c] hover:bg-[#e1e1e1]'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {activeTab === 'emblemas' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Top Colecionadores de Emblemas</h3>
                <div className="text-sm text-gray-500">
                  📊 Baseado em dados reais da API
                </div>
              </div>

              {topCollectors && topCollectors.length > 0 ? (
                <div className="space-y-3">
                  {topCollectors.map((collector, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-2xl text-gray-700 w-8">
                          {index + 1}.
                        </span>
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                          <img
                            src={getAvatarUrl(collector.user.figureString, 's')}
                            alt={collector.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = 
                                `<div class="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">${collector.name.substring(0, 2).toUpperCase()}</div>`;
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{collector.name}</p>
                        <p className="text-sm text-gray-600">{collector.score} Emblemas</p>
                        {collector.user.motto && (
                          <p className="text-xs text-gray-500 italic">"{collector.user.motto}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-[#008800]">{collector.score}</div>
                        <div className="text-sm text-gray-500">emblemas</div>
                        <div className="text-xs text-gray-400">
                          {collector.user.online ? '🟢 Online' : '🔴 Offline'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">Nenhum colecionador encontrado no momento.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'quartos' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Quartos Mais Visitados</h3>
                <div className="text-sm text-gray-500">
                  📊 Baseado em dados reais da API
                </div>
              </div>

              {topRooms && topRooms.length > 0 ? (
                <div className="space-y-3">
                  {topRooms.map((room, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-2xl text-gray-700 w-8">
                          {index + 1}.
                        </span>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                          🏠
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{room.name}</p>
                        <p className="text-sm text-gray-600">Por: {room.owner}</p>
                        {room.room.description && (
                          <p className="text-xs text-gray-500 line-clamp-1">{room.room.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">⭐ {room.room.rating || 0}</span>
                          <span className="text-xs text-gray-500">
                            📅 {new Date(room.room.creationTime).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-[#008800]">{room.score}</div>
                        <div className="text-sm text-gray-500">visitantes</div>
                        <div className="text-xs text-gray-400">
                          Max: {room.room.maxUserCount || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600">Nenhum quarto encontrado no momento.</p>
                </div>
              )}
            </>
          )}
        </div>
      </PanelCard>

      <PanelCard title="Novatos em Destaque">
        <div className="text-center py-8">
          <Users className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="font-bold text-gray-800 mb-2">Em Desenvolvimento</h3>
          <p className="text-gray-600">
            Esta seção mostrará novos usuários ativos do Habbo BR em breve!
          </p>
        </div>
      </PanelCard>
    </div>
  );
};
