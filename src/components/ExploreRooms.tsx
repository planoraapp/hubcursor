
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HabboRoom } from '@/services/habboApi';

const ExploreRooms: React.FC = () => {
  // Mock room data with proper structure
  const mockRooms: HabboRoom[] = [
    {
      id: '1',
      name: 'Test Room 1',
      description: 'A test room description',
      ownerName: 'TestUser',
      owner: 'TestUser',
      userCount: 5,
      maxUsers: 25,
      maxUserCount: 25,
      room: 'Test Room 1',
      score: 4.5,
      rating: 4.5,
      creationTime: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Test Room 2',
      description: 'Another test room',
      ownerName: 'TestUser2',
      owner: 'TestUser2',
      userCount: 3,
      maxUsers: 20,
      maxUserCount: 20,
      room: 'Test Room 2',
      score: 4.0,
      rating: 4.0,
      creationTime: new Date().toISOString()
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Explore Rooms</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRooms.map((room) => (
            <div key={room.id} className="p-4 border rounded-lg">
              <h3 className="font-bold">{room.name}</h3>
              <p className="text-sm text-gray-600">{room.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm">Owner: {room.ownerName}</span>
                <span className="text-sm">{room.userCount}/{room.maxUsers} users</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExploreRooms;
