
import { useState } from 'react';
import { PanelCard } from './PanelCard';
import { mockData } from '../data/mockData';

export const Rankings = () => {
  const [activeTab, setActiveTab] = useState('emblemas');

  const tabs = [
    { id: 'emblemas', label: 'Top Colecionadores de Emblemas' },
    { id: 'quartos', label: 'Quartos Mais Visitados' },
  ];

  return (
    <div className="space-y-8">
      <PanelCard title="Classificação Habbo">
        <p className="text-lg text-gray-600">
          Veja os Habbos e quartos em destaque nos rankings.
        </p>
      </PanelCard>

      <PanelCard>
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-bold border-2 border-[#5a5a5a] rounded-t-lg transition-all duration-100 ${
                activeTab === tab.id
                  ? 'bg-white border-b-white text-[#38332c]'
                  : 'bg-[#d1d1d1] text-[#38332c] hover:bg-[#e1e1e1]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === 'emblemas' && (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Top Colecionadores de Emblemas</h3>
              {mockData.rankings.emblemas.map((player, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                  <span className="font-bold text-2xl text-gray-700 w-8">{index + 1}.</span>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {player.name.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{player.name}</p>
                    <p className="text-sm text-gray-600">{player.score} Emblemas</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-[#008800]">{player.score}</div>
                    <div className="text-sm text-gray-500">emblemas</div>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === 'quartos' && (
            <>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Quartos Mais Visitados</h3>
              {mockData.rankings.quartos.map((room, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg border">
                  <span className="font-bold text-2xl text-gray-700 w-8">{index + 1}.</span>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    🏠
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{room.name}</p>
                    <p className="text-sm text-gray-600">Por: {room.owner}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-[#008800]">{room.score.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">visitas</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </PanelCard>
    </div>
  );
};
