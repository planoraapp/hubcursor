
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Users, Crown, TrendingUp } from 'lucide-react';

interface HabboRoom {
  id: string;
  name: string;
  description: string;
  ownerName: string;
  userCount: number;
  maxUserCount: number;
  rating: number;
  tags: string[];
  creationTime: string;
  thumbnailUrl?: string;
}

const Rankings = () => {
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');

  // Mock data
  const mockRooms: HabboRoom[] = [
    {
      id: '1',
      name: 'Popular Room 1',
      description: 'Amazing room with great decoration',
      ownerName: 'HabboUser1',
      userCount: 25,
      maxUserCount: 30,
      rating: 4.8,
      tags: ['popular', 'games'],
      creationTime: '2024-01-15T10:00:00Z',
      thumbnailUrl: 'https://via.placeholder.com/150x100'
    },
    {
      id: '2',
      name: 'Cool Hangout',
      description: 'Perfect place to chill with friends',
      ownerName: 'HabboUser2',
      userCount: 18,
      maxUserCount: 25,
      rating: 4.5,
      tags: ['hangout', 'friends'],
      creationTime: '2024-01-14T15:30:00Z',
      thumbnailUrl: 'https://via.placeholder.com/150x100'
    }
  ];

  useEffect(() => {
    setRooms(mockRooms);
  }, []);

  const renderRoomCard = (room: HabboRoom, index: number) => (
    <Card key={room.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold">
            {index + 1}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg volter-font">{room.name}</CardTitle>
            <p className="text-sm text-gray-600 volter-font">por {room.ownerName}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">{room.description}</p>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="volter-font">{room.userCount}/{room.maxUserCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="volter-font">{room.rating}</span>
            </div>
            <div className="text-gray-500 volter-font">
              {new Date(room.creationTime).toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {room.tags.map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold volter-font mb-2">🏆 Rankings dos Quartos</h2>
        <p className="text-gray-600 volter-font">Descubra os quartos mais populares do Habbo</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Populares
          </TabsTrigger>
          <TabsTrigger value="newest" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Novos
          </TabsTrigger>
          <TabsTrigger value="rating" className="flex items-center gap-2">
            <Crown className="w-4 h-4" />
            Mais Votados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <div className="grid gap-4">
            {rooms.map((room, index) => renderRoomCard(room, index))}
          </div>
        </TabsContent>

        <TabsContent value="newest" className="space-y-4">
          <div className="grid gap-4">
            {rooms.slice().reverse().map((room, index) => renderRoomCard(room, index))}
          </div>
        </TabsContent>

        <TabsContent value="rating" className="space-y-4">
          <div className="grid gap-4">
            {rooms.slice().sort((a, b) => b.rating - a.rating).map((room, index) => renderRoomCard(room, index))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Rankings;
