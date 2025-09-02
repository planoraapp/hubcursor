
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const mockEvents = [
  {
    id: 1,
    title: 'Festival de Verão',
    description: 'Grande evento de verão com muitas atividades!',
    date: '2024-01-25',
    time: '20:00',
    location: 'Piscina Central',
    participants: 150,
    type: 'festival',
    status: 'active'
  },
  {
    id: 2,
    title: 'Competição de Dança',
    description: 'Mostre seus melhores passos de dança!',
    date: '2024-01-28',
    time: '19:30',
    location: 'Sala de Dança',
    participants: 85,
    type: 'competition',
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Quiz Night',
    description: 'Teste seus conhecimentos em nosso quiz!',
    date: '2024-01-30',
    time: '21:00',
    location: 'Auditório',
    participants: 200,
    type: 'quiz',
    status: 'upcoming'
  }
];

export const EventsGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockEvents.map((event) => (
        <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-purple-900 volter-font">
              {event.title}
            </h3>
            <Badge 
              variant={event.status === 'active' ? 'default' : 'secondary'}
              className="volter-font"
            >
              {event.status === 'active' ? 'Ativo' : 'Em breve'}
            </Badge>
          </div>
          
          <p className="text-gray-600 mb-4 volter-font">
            {event.description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600 volter-font">
              <Calendar className="w-4 h-4 mr-2" />
              {event.date}
            </div>
            <div className="flex items-center text-sm text-gray-600 volter-font">
              <Clock className="w-4 h-4 mr-2" />
              {event.time}
            </div>
            <div className="flex items-center text-sm text-gray-600 volter-font">
              <MapPin className="w-4 h-4 mr-2" />
              {event.location}
            </div>
            <div className="flex items-center text-sm text-gray-600 volter-font">
              <Users className="w-4 h-4 mr-2" />
              {event.participants} participantes
            </div>
          </div>
          
          <Button className="w-full volter-font">
            {event.status === 'active' ? 'Participar Agora' : 'Inscrever-se'}
          </Button>
        </Card>
      ))}
    </div>
  );
};
