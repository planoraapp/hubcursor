
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Star, TrendingUp } from 'lucide-react';
import { getTopRooms, getTopBadgeCollectors, HabboRoom } from '@/services/habboApi';

export const Rankings = () => {
  const [topRooms, setTopRooms] = useState<HabboRoom[]>([]);
  const [topBadgeCollectors, setTopBadgeCollectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const [roomsData, badgeData] = await Promise.all([
          getTopRooms(),
          getTopBadgeCollectors()
        ]);
        setTopRooms(roomsData);
        setTopBadgeCollectors(badgeData);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${position}º`;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border-2 border-black shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando rankings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-2 border-black shadow-lg">
      <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-b-2 border-black">
        <CardTitle className="volter-font flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Rankings Habbo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="rooms" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rooms" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Salas
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Emblemas
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Atividade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-4">
            <div className="space-y-3">
              {topRooms.map((room, index) => (
                <div 
                  key={room.id} 
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-600 w-12 text-center">
                      {getRankingIcon(index + 1)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{room.name}</h3>
                      <p className="text-sm text-gray-600">
                        {room.description || 'Sem descrição'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Proprietário: {room.ownerName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-2">
                      <Users className="w-3 h-3 mr-1" />
                      {room.userCount}
                    </Badge>
                    {room.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {room.rating}
                      </div>
                    )}
                    {room.creationTime && (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(room.creationTime).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {topRooms.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Nenhuma sala rankeada disponível no momento.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Rankings de emblemas em desenvolvimento...</p>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Rankings de atividade em desenvolvimento...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Rankings;
