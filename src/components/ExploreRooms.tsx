import { useState } from 'react';
import { Search, Users, Eye, MapPin, Star } from 'lucide-react';
import { PanelCard } from './PanelCard';
import { RoomsChart } from './RoomsChart';
import { useTopRooms, useRecentRooms } from '../hooks/useHabboData';
import { useLanguage } from '../hooks/useLanguage';

export const ExploreRooms = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: topRooms, isLoading, error } = useTopRooms();
  const { data: recentRooms } = useRecentRooms();

  const filteredRooms = topRooms?.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8">
      <PanelCard title={t('exploreRoomsTitle')}>
        <p className="text-lg text-gray-600 mb-6">
          {t('exploreRoomsSubtitle')}
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            id="room-search"
            placeholder="Pesquisar por nome do quarto ou proprietário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-[#5a5a5a] border-r-[#888888] border-b-[#888888] rounded-lg shadow-[inset_1px_1px_0px_0px_#cccccc] focus:outline-none focus:border-[#007bff] focus:shadow-[inset_1px_1px_0px_0px_#cccccc,_0_0_0_2px_rgba(0,123,255,0.25)]"
          />
        </div>
      </PanelCard>

      <PanelCard title={t('topRoomsByVisitors')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.slice(0, 6).map((room) => (
            <PanelCard key={room.id}>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-100">
                  <Users className="text-blue-500" size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{room.name}</h3>
                  <p className="text-sm text-gray-500">
                    <Eye className="inline-block mr-1" size={14} />
                    {room.userCount} online
                  </p>
                  <p className="text-sm text-gray-500">
                    <MapPin className="inline-block mr-1" size={14} />
                    {room.ownerName}
                  </p>
                </div>
              </div>
            </PanelCard>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};
