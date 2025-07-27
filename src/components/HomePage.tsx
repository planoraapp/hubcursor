import { useState, useEffect } from 'react';
import { PanelCard } from './PanelCard';
import { RoomsChart } from './RoomsChart';
import { useHotelStats, useRecentRooms, useTopUsers } from '../hooks/useHabboData';
import { useLanguage } from '../hooks/useLanguage';

export const HomePage = () => {
  const { t } = useLanguage();
  const { data: hotelStats } = useHotelStats();
  const { data: recentRooms } = useRecentRooms();
  const { data: topUsers } = useTopUsers();

  const [news, setNews] = useState([
    {
      title: '🎉 Bem-vindo ao Habbo Hub!',
      content: 'Explore as ferramentas mais completas para jogadores de Habbo Hotel. Descubra quartos, catálogos, rankings e muito mais!',
      date: 'Hoje',
      source: 'Oficial'
    },
    {
      title: '📊 Dados em Tempo Real',
      content: 'Agora utilizamos a API oficial do Habbo para fornecer informações atualizadas sobre usuários, quartos e emblemas.',
      date: 'Hoje',
      source: 'Atualização'
    }
  ]);

  const [featuredRooms, setFeaturedRooms] = useState([
    { name: 'Quarto da Comunidade', visitors: 45 },
    { name: 'Festa no Jardim', visitors: 32 },
    { name: 'Balada Secreta', visitors: 28 },
    { name: 'Hall dos Troféus', visitors: 22 },
    { name: 'Piscina Relaxante', visitors: 18 }
  ]);

  return (
    <div className="space-y-8">
      <PanelCard title={t('homeTitle')}>
        <p className="text-lg text-gray-600 mb-6">
          {t('homeSubtitle')}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PanelCard title={t('latestNews')}>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888]">
                <h4 className="font-bold text-gray-800 mb-2">🎉 Bem-vindo ao Habbo Hub!</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Explore as ferramentas mais completas para jogadores de Habbo Hotel. 
                  Descubra quartos, catálogos, rankings e muito mais!
                </p>
                <span className="text-xs text-gray-500">Hoje • Oficial</span>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888]">
                <h4 className="font-bold text-gray-800 mb-2">📊 Dados em Tempo Real</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Agora utilizamos a API oficial do Habbo para fornecer informações 
                  atualizadas sobre usuários, quartos e emblemas.
                </p>
                <span className="text-xs text-gray-500">Hoje • Atualização</span>
              </div>
            </div>
          </PanelCard>

          <PanelCard title={t('featuredRooms')}>
            <RoomsChart />
          </PanelCard>
        </div>
      </PanelCard>

      <PanelCard title="Estatísticas do Hotel">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-xl">{hotelStats?.users_online || 'Carregando...'}</h3>
            <p className="text-sm text-gray-600">Habbos Online</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-xl">{hotelStats?.total_rooms || 'Carregando...'}</h3>
            <p className="text-sm text-gray-600">Quartos Criados</p>
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-800 text-xl">{hotelStats?.total_users || 'Carregando...'}</h3>
            <p className="text-sm text-gray-600">Total de Habbos</p>
          </div>
        </div>
      </PanelCard>

      <PanelCard title="Top Habbos">
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nível
                </th>
              </tr>
            </thead>
            <tbody>
              {topUsers?.slice(0, 5).map((user, index) => (
                <tr key={index}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">#{index + 1}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <img
                          className="w-full h-full rounded-full"
                          src={`https://www.habbo.com/habbo-imaging/avatarimage?figure=${user.look}&size=s`}
                          alt={user.username}
                        />
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-900 whitespace-no-wrap">{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{user.level}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
};
