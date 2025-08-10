
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HabboRoom } from '@/services/habboApi';

const Rankings: React.FC = () => {
  // Mock room data with proper structure
  const mockRooms: HabboRoom[] = [
    {
      id: '1',
      name: 'Top Room 1',
      description: 'Amazing room with great decoration',
      ownerName: 'TopUser1',
      owner: 'TopUser1',
      userCount: 15,
      maxUsers: 25,
      maxUserCount: 25,
      room: 'Top Room 1',
      score: 4.8,
      rating: 4.8,
      creationTime: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Popular Room',
      description: 'Very popular room with lots of visitors',
      ownerName: 'PopularUser',
      owner: 'PopularUser',
      userCount: 20,
      maxUsers: 30,
      maxUserCount: 30,
      room: 'Popular Room',
      score: 4.5,
      rating: 4.5,
      creationTime: new Date().toISOString()
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Rankings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRooms.map((room, index) => (
            <div key={room.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">#{index + 1} {room.name}</h3>
                  <p className="text-sm text-gray-600">{room.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm">Owner: {room.ownerName}</span>
                    <span className="text-sm">Rating: {room.rating}/5</span>
                    <span className="text-sm">
                      Created: {new Date(room.creationTime || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{room.userCount}/{room.maxUserCount}</div>
                  <div className="text-sm text-gray-500">users</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Rankings;
