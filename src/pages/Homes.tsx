
import React, { useState, useEffect } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Home, Calendar, MapPin, Star, ExternalLink, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useHubLogin } from '@/hooks/useHubLogin';
import { useLatestHomes } from '@/hooks/useLatestHomes';
import { HomePreviewCard } from '@/components/HomePreviewCard';

interface HabboUser {
  id: string;
  habbo_name: string;
  hotel: string;
  is_online: boolean;
  motto: string;
  created_at: string;
  figure_string?: string;
  last_seen_at?: string;
}

const Homes: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isLoggedIn } = useHubLogin();
  const { data: latestHomes, isLoading: loadingLatest } = useLatestHomes();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<HabboUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('discovered_users')
        .select('*')
        .eq('is_online', true)
        .order('habbo_name', { ascending: true })
        .limit(50);

      if (error) {
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      toast({
        title: "Erro ao buscar usuários",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      setSearchInitiated(true);

      const { data, error } = await supabase
        .from('discovered_users')
        .select('*')
        .ilike('habbo_name', `%${searchTerm}%`)
        .order('habbo_name', { ascending: true })
        .limit(50);

      if (error) {
        toast({
          title: "Erro ao buscar usuários",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      setUsers(data || []);
      setLoading(false);
    } else {
      // Se não há termo de busca, mostra usuários online
      setSearchInitiated(true);
      await fetchUsers();
    }
  };

  const filteredUsers = users.filter((user) => user.habbo_name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <CollapsibleAppSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-8 min-h-screen" style={{ 
            backgroundImage: 'url(/assets/bghabbohub.png)',
            backgroundRepeat: 'repeat'
          }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 volter-font"
                    style={{
                      textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                    }}>
                  🏠 Habbo Homes
                </h1>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Explore as homes dos usuários do HabboHub
                </p>
                
                {/* Botão Minha Home */}
                <div className="mt-4">
                  {isLoggedIn && currentUser ? (
                    <Button 
                      onClick={() => navigate(`/homes/${currentUser.habbo_username}`)}
                      className="habbo-button-green volter-font px-6 py-2"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Ver Minha Home
                      <Home className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => navigate('/login')}
                      className="habbo-button-orange volter-font px-6 py-2"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Fazer Login para Ver Minha Home
                    </Button>
                  )}
                </div>
              </div>

              <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-2 border-black">
                  <CardTitle className="text-xl volter-font habbo-text flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Buscar Usuários com Homes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder="Digite o nome do usuário Habbo ou deixe vazio para ver usuários online..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 border-2 border-gray-300 focus:border-purple-500 volter-font"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={loading}
                      className="habbo-button-purple volter-font"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {loading ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 volter-font">
                    💡 Dica: Deixe o campo vazio e clique em "Buscar" para ver usuários online com homes descobertas
                  </p>
                </CardContent>
              </Card>

              {/* Seção de Últimas Homes Editadas */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 volter-font text-center"
                    style={{
                      textShadow: '2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black'
                    }}>
                  🎨 Últimas Homes Editadas
                </h2>
                
                {loadingLatest ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
                    <span className="ml-3 text-white volter-font">Carregando homes...</span>
                  </div>
                ) : latestHomes && latestHomes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {latestHomes.map((home) => (
                      <HomePreviewCard key={home.user_id} home={home} />
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                    <CardContent className="p-6 text-center">
                      <Home className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 volter-font">
                        Ainda não há homes editadas recentemente
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {searchInitiated && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-b-2 border-black p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${user.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`}
                            alt={`Avatar de ${user.habbo_name}`}
                            className="w-12 h-12 object-contain bg-white/20 rounded border border-white/30"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${user.habbo_name}&size=s&direction=2&head_direction=3&headonly=1`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg volter-font habbo-text truncate">
                              {user.habbo_name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={`text-xs volter-font ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`}>
                                {user.is_online ? 'Online' : 'Offline'}
                              </Badge>
                              <Badge className="bg-white/20 text-white text-xs volter-font">
                                {user.hotel?.toUpperCase() || 'BR'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-4 space-y-3">
                        {user.motto && (
                          <div className="flex items-start gap-2">
                            <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 volter-font italic">
                              "{user.motto}"
                            </p>
                          </div>
                        )}
                        
                        {user.created_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-600 volter-font">
                              Descoberto em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="text-xs text-gray-600 volter-font">
                            Hotel: {user.hotel?.toUpperCase() || 'Brasil'}
                          </span>
                        </div>
                        
                        <Button 
                          onClick={() => navigate(`/homes/${user.habbo_name}`)}
                          className="w-full habbo-button-blue volter-font"
                        >
                          <Home className="w-4 h-4 mr-2" />
                          Ver Home
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {searchInitiated && filteredUsers.length === 0 && !loading && (
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2 volter-font">
                      Nenhum usuário encontrado
                    </h3>
                    <p className="text-gray-600 volter-font">
                      Tente buscar por um nome diferente ou deixe o campo vazio para ver usuários online.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Homes;
