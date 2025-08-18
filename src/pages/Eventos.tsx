
import React from 'react';
import { NewAppSidebar } from '@/components/NewAppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Trophy, Clock, MapPin } from 'lucide-react';

const Eventos = () => {
  const eventos = [
    {
      id: 1,
      title: 'Concurso de Homes Criativas',
      description: 'Mostre sua criatividade e ganhe emblemas exclusivos decorando sua Habbo Home com tema de verão.',
      date: '2024-02-01',
      endDate: '2024-02-15',
      participants: 156,
      status: 'active',
      prize: 'Emblema Dourado + 500 pontos',
      location: 'Todas as Homes'
    },
    {
      id: 2,
      title: 'Caça ao Tesouro Virtual',
      description: 'Encontre pistas espalhadas pelo HabboHub and resolva enigmas para conquistar prêmios especiais.',
      date: '2024-02-10',
      endDate: '2024-02-20',
      participants: 89,
      status: 'upcoming',
      prize: 'Widget Especial + 300 pontos',
      location: 'Console Social'
    },
    {
      id: 3,
      title: 'Torneio de Fotografias',
      description: 'Compartilhe suas melhores fotos do Habbo e vote nas criações de outros jogadores.',
      date: '2024-01-15',
      endDate: '2024-01-30',
      participants: 234,
      status: 'finished',
      prize: 'Título Especial + Background',
      location: 'Galeria de Fotos'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'finished': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'upcoming': return 'Em Breve';
      case 'finished': return 'Finalizado';
      default: return 'Desconhecido';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewAppSidebar />
        <main 
          className="flex-1 relative bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-purple-900/10 to-blue-900/30"></div>
          
          <div className="relative z-10 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🎉 Eventos HabboHub
                </h1>
                <p className="text-xl text-white/90 volter-font drop-shadow">
                  Participe dos eventos da comunidade e ganhe prêmios exclusivos
                </p>
              </div>

              <div className="space-y-6">
                {eventos.map((evento) => (
                  <Card key={evento.id} className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-2 border-black">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-2xl volter-font mb-2">
                            {evento.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span className="volter-font">
                                {new Date(evento.date).toLocaleDateString('pt-BR')} - {new Date(evento.endDate).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span className="volter-font">{evento.participants} participantes</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(evento.status)} text-white volter-font`}>
                          {getStatusText(evento.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-600 mb-4 volter-font">
                        {evento.description}
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-600" />
                          <div>
                            <span className="text-sm text-gray-500 volter-font">Prêmio:</span>
                            <p className="font-semibold volter-font">{evento.prize}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-600" />
                          <div>
                            <span className="text-sm text-gray-500 volter-font">Local:</span>
                            <p className="font-semibold volter-font">{evento.location}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button 
                          className={`flex-1 volter-font ${
                            evento.status === 'active' 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
                              : evento.status === 'upcoming'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                              : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          }`}
                          disabled={evento.status === 'finished'}
                        >
                          {evento.status === 'active' ? 'Participar Agora' : 
                           evento.status === 'upcoming' ? 'Inscrever-se' : 'Finalizado'}
                        </Button>
                        <Button variant="outline" className="volter-font">
                          Ver Detalhes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-12 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-black">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 volter-font text-center">
                    📅 Calendário de Eventos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3 volter-font">🔥 Eventos Regulares</h4>
                      <ul className="space-y-2 volter-font text-sm">
                        <li className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>Sextas-feiras: Noite de Jogos</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>Domingos: Concurso de Fotos</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>Quinzenalmente: Torneio de Homes</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-700 mb-3 volter-font">🎁 Recompensas</h4>
                      <ul className="space-y-2 volter-font text-sm">
                        <li>• Emblemas exclusivos de eventos</li>
                        <li>• Pontos para o catálogo</li>
                        <li>• Widgets especiais para homes</li>
                        <li>• Backgrounds únicos</li>
                        <li>• Títulos de reconhecimento</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Eventos;
