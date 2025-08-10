
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Star, Calendar } from 'lucide-react';
import { discoverRooms, HabboRoom } from '@/services/habboApi';

export const ExploreRooms = () => {
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const roomsData = await discoverRooms();
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setError('Erro ao carregar salas');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoomClick = (room: HabboRoom) => {
    console.log('Clicked room:', room.name);
    // Here you would implement room joining logic
  };

  if (loading) {
    return (
      <Card className="bg-white border-2 border-black shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando salas...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-2 border-black shadow-lg">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-black shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-b-2 border-black">
        <CardTitle className="volter-font flex items-center gap-2">
          <Users className="w-5 h-5" />
          Explorar Salas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar salas ou proprietários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-2 border-gray-300 focus:border-blue-500"
          />
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <Card 
              key={room.id} 
              className="border-2 border-gray-200 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleRoomClick(room)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800 truncate">{room.name}</h3>
                  <Badge variant="outline" className="ml-2">
                    <Users className="w-3 h-3 mr-1" />
                    {room.userCount}/{room.maxUsers}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {room.description || 'Sem descrição'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room.ownerName}
                  </span>
                  
                  {room.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      {room.rating}
                    </span>
                  )}
                </div>

                {room.creationTime && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Criada em {new Date(room.creationTime).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRooms.length === 0 && searchTerm && (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma sala encontrada para "{searchTerm}"</p>
          </div>
        )}

        {filteredRooms.length === 0 && !searchTerm && (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhuma sala disponível no momento.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExploreRooms;
