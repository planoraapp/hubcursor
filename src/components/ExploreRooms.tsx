
import { useState } from 'react';
import { Search } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { mockData } from '../data/mockData';
import { RoomsChart } from './RoomsChart';

export const ExploreRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = mockData.rooms.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PanelCard title="Explorador de Quartos">
        <p className="text-lg text-gray-600 mb-4">
          Pesquise e filtre os quartos públicos mais populares do Habbo Hotel.
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Pesquisar por nome do quarto ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
          />
        </div>
      </PanelCard>

      <PanelCard title="Top 5 Quartos por Visitantes">
        <RoomsChart />
      </PanelCard>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room, index) => (
          <PanelCard key={index}>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-800">{room.name}</h3>
                <span className="text-sm font-medium text-[#008800] bg-green-100 px-2 py-1 rounded">
                  {room.visitors} visitantes
                </span>
              </div>
              <p className="text-gray-600">por <span className="font-medium">{room.owner}</span></p>
              <p className="text-sm text-gray-500">{room.desc}</p>
              <div className="flex justify-between items-center pt-2">
                <button className="text-sm text-[#007bff] hover:underline">Ver detalhes</button>
                <button className="bg-[#008800] text-white px-3 py-1 rounded text-sm font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
                  Visitar
                </button>
              </div>
            </div>
          </PanelCard>
        ))}
      </div>
    </div>
  );
};
