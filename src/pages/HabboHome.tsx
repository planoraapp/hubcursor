
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Users, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { habboApiService } from '@/services/habboApiService';
import { habboProxyService } from '@/services/habboProxyService';
import { NewAppSidebar } from '@/components/NewAppSidebar';

interface HabboRoom {
  id: number;
  name: string;
  description: string;
  ownerName: string;
  userCount: number;
  maxUsers: number;
  tags: string[];
  creationTime: string;
  habboGroupId?: number;
}

const HabboHome = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<HabboRoom[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const searchRooms = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // This would be replaced with actual room search API
      console.log('Searching for rooms:', searchQuery);
      // Placeholder for room search results
      setRooms([]);
    } catch (error) {
      console.error('Error searching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <NewAppSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Habbo Home</h1>
            <p className="text-gray-600">Explorar quartos e espaços do Habbo</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Quartos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome do quarto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchRooms()}
                />
                <Button onClick={searchRooms} disabled={loading}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Quartos Encontrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum quarto encontrado</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Use a busca para encontrar quartos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <Badge variant="outline">
                          <Users className="w-3 h-3 mr-1" />
                          {room.userCount}/{room.maxUsers}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{room.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Por: {room.ownerName}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(room.creationTime).toLocaleDateString()}
                        </span>
                      </div>
                      {room.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {room.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HabboHome;
