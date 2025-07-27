
import { useState } from 'react';
import { Search, MapPin, Users, Clock } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { RoomsChart } from './RoomsChart';
import { useDiscoverRooms, useTopRooms } from '../hooks/useHabboData';
import { getAvatarUrl } from '../services/habboApi';

export const ExploreRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: rooms, isLoading: roomsLoading, error: roomsError } = useDiscoverRooms();
  const { data: topRooms, isLoading: topRoomsLoading } = useTopRooms();

  const filteredRooms = rooms?.filter(room => 
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    room.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  if (roomsLoading) {
    return (
      <div className="space-y-8">
        <PanelCard title="Explorador de Quartos">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Descobrindo quartos do Habbo BR...</p>
            </div>
          </div>
        </PanelCard>
      </div>
    );
  }

  if (roomsError || !rooms || rooms.length === 0) {
    return (
      <div className="space-y-8">
        <PanelCard title="Explorador de Quartos">
          <div className="text-center py-8">
            <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Nenhum quarto encontrado</h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os quartos do Habbo BR no momento.
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
      <PanelCard title="Explorador de Quartos">
        <p className="text-lg text-gray-600 mb-4">
          Descubra os quartos mais interessantes do Habbo Hotel BR através da nossa API.
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

        <div className="mt-4 text-sm text-gray-600">
          <p>📊 Quartos descobertos: {rooms.length} | 🔍 Resultados da pesquisa: {filteredRooms.length}</p>
        </div>
      </PanelCard>

      <PanelCard title="Top 5 Quartos por Visitantes">
        {topRoomsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <p className="text-gray-600">Carregando ranking...</p>
          </div>
        ) : (
          <RoomsChart />
        )}
      </PanelCard>

      <PanelCard title="Quartos Descobertos Recentemente">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.slice(0, 12).map((room, index) => (
            <PanelCard key={room.id || index}>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-gray-800 truncate">{room.name}</h3>
                  <div className="flex items-center text-sm font-medium text-[#008800] bg-green-100 px-2 py-1 rounded">
                    <Users size={14} className="mr-1" />
                    {room.userCount || 0}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {room.ownerName.substring(0, 2).toUpperCase()}
                  </div>
                  <p className="text-gray-600 text-sm">
                    por <span className="font-medium">{room.ownerName}</span>
                  </p>
                </div>
                
                {room.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{room.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{formatDate(room.creationTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>⭐</span>
                    <span>{room.rating || 0}</span>
                  </div>
                </div>
                
                {room.tags && room.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {room.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2">
                  <button className="text-sm text-[#007bff] hover:underline">
                    Ver detalhes
                  </button>
                  <button className="bg-[#008800] text-white px-3 py-1 rounded text-sm font-medium border-2 border-[#005500] border-r-[#00bb00] border-b-[#00bb00] shadow-[1px_1px_0px_0px_#5a5a5a] hover:bg-[#00bb00] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-100">
                    Visitar
                  </button>
                </div>
              </div>
            </PanelCard>
          ))}
        </div>
        
        {filteredRooms.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="font-bold text-gray-800 mb-2">Nenhum quarto encontrado</h3>
            <p className="text-gray-600">Tente ajustar sua pesquisa.</p>
          </div>
        )}
      </PanelCard>
    </div>
  );
};
