
import { useState, useEffect } from 'react';

export interface TickerActivity {
  id: string;
  type: string;
  message: string;
  description?: string;
  timestamp: string;
  user?: string;
  room?: string;
}

export const useHotelTicker = () => {
  const [activities, setActivities] = useState<TickerActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Mock ticker activities
      const mockActivities: TickerActivity[] = [
        {
          id: '1',
          type: 'login',
          message: 'User joined the hotel',
          description: 'A new user has entered the hotel',
          timestamp: new Date().toISOString(),
          user: 'TestUser'
        },
        {
          id: '2',
          type: 'room',
          message: 'New room created',
          description: 'A user created a new room',
          timestamp: new Date().toISOString(),
          user: 'TestUser',
          room: 'Test Room'
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Error fetching ticker activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    refetch: fetchActivities
  };
};
