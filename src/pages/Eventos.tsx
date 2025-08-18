
import React, { useState } from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Trophy, Gift, Star } from 'lucide-react';

const Eventos = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const eventCategories = [
    { id: 'all', name: 'Todos', icon: '🎭' },
    { id: 'competition', name: 'Competições', icon: '🏆' },
    { id: 'party', name: 'Festas', icon: '🎉' },
    { id: 'building', name: 'Construção', icon: '🏗️' },
    { id: 'roleplay', name: 'RPG', icon: '🎲' },
    { id: 'music', name: 'Música', icon: '🎵' }
  ];

  const events = [
    {
      id: 1,
      title: 'Festival de Verão 2024',
      category: 'party',
      date: '2024-01-25',
      time: '20:00',
      location: 'Praia Central',
      attendees: 234,
      maxAttendees: 300,
      prize: '500 Coins + Badge Exclusivo',
      image: '/assets/events/summer.png',
      status: 'upcoming',
      description: 'Celebre o verão com música, dança e diversão na praia!'
    },
    {
      id: 2,
      title: 'Competição de Construção',
      category: 'building',
      date: '2024-01-28',
      time: '19:00',
      location: 'Arena de Construção',
      attendees: 45,
      maxAttendees: 50,
      prize: '1000 Coins + Móveis Raros',
      image: '/assets/events/building.png',
      status: 'upcoming',
      description: 'Mostre suas habilidades de construção e ganhe prêmios incríveis!'
    },
    {
      id: 3,
      title: 'Noite do Karaokê',
      category: 'music',
      date: '2024-01-26',
      time: '21:30',
      location: 'Club Musical',
      attendees: 156,
      maxAttendees: 200,
      prize: '300 Coins + Badge de Cantor',
      image: '/assets/events/karaoke.png',
      status: 'live',
      description: 'Cante suas músicas favoritas e ganhe prêmios!'
    },
    {
      id: 4,
      title: 'Torneio de Batalha',
      category: 'competition',
      date: '2024-01-24',
      time: '18:00',
      location: 'Arena PvP',
      attendees: 89,
      maxAttendees: 100,
      prize: '750 Coins + Troféu',
      image: '/assets/events/battle.png',
      status: 'ended',
      description: 'Competição épica de batalhas entre os melhores jogadores!'
    },
    {
      id: 5,
      title: 'Aventura RPG: Reino Perdido',
      category: 'roleplay',
      date: '2024-01-30',
      time: '20:30',
      location: 'Mundo Fantasy',
      attendees: 67,
      maxAttendees: 80,
      prize: 'Itens Épicos + XP Bônus',
      image: '/assets/events/rpg.png',
      status: 'upcoming',
      description: 'Embarque numa aventura épica no reino perdido!'
    },
    {
      id: 6,
      title: 'Mega Festa de Aniversário',
      category: 'party',
      date: '2024-02-01',
      time: '22:00',
      location: 'Salão Principal',
      attendees: 312,
      maxAttendees: 400,
      prize: 'Bolo Especial + Surpresas',
      image: '/assets/events/birthday.png',
      status: 'upcoming',
      description: 'Celebre conosco o aniversário do HabboHub!'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 animate-pulse';
      case 'upcoming': return 'bg-green-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'AO VIVO';
      case 'upcoming': return 'EM BREVE';
      case 'ended': return 'FINALIZADO';
      default: return 'EVENTO';
    }
  };

  const filteredEvents = events.filter(event => 
    selectedFilter === 'all' || event.category === selectedFilter
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main 
          className="flex-1 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          {/* Background overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
          
          <div className="relative z-10 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🎭 Eventos Habbo
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Participe dos eventos mais emocionantes da comunidade
                </p>
              </div>

              {/* Event Categories */}
              <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {eventCategories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedFilter === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedFilter(category.id)}
                        className="volter-font"
                      >
                        <span className="mr-1">{category.icon}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">24</div>
                    <div className="text-sm text-gray-600 volter-font">Eventos Ativos</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">1.2K</div>
                    <div className="text-sm text-gray-600 volter-font">Participantes</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">15K</div>
                    <div className="text-sm text-gray-600 volter-font">Coins em Prêmios</div>
                  </CardContent>
                </Card>
                <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800 volter-font">5★</div>
                    <div className="text-sm text-gray-600 volter-font">Avaliação Média</div>
                  </CardContent>
                </Card>
              </div>

              {/* Events Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <Card key={event.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <span className="text-6xl">🎭</span>
                      </div>
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(event.status)} text-white volter-font`}>
                        {getStatusText(event.status)}
                      </Badge>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 volter-font">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 volter-font">
                        {event.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="volter-font">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="volter-font">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="volter-font">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span className="volter-font">{event.attendees}/{event.maxAttendees} participantes</span>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-semibold text-yellow-800 volter-font">Prêmio:</span>
                        </div>
                        <p className="text-sm text-yellow-700 volter-font">{event.prize}</p>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white volter-font"
                        disabled={event.status === 'ended'}
                      >
                        {event.status === 'live' ? 'Participar Agora' :
                         event.status === 'upcoming' ? 'Inscrever-se' : 'Evento Finalizado'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredEvents.length === 0 && (
                <div className="text-center py-12">
                  <Card className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                    <CardContent className="p-8">
                      <div className="text-6xl mb-4">🎭</div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2 volter-font">
                        Nenhum evento encontrado
                      </h3>
                      <p className="text-gray-600 volter-font">
                        Tente selecionar uma categoria diferente
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Eventos;
