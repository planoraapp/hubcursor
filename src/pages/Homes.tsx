import React, { useState, useEffect } from 'react';
import { CollapsibleAppSidebar } from '@/components/CollapsibleAppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, User, Home, Calendar, MapPin, Star, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HabboUser {
  id: string;
  habbo_name: string;
  hotel: string;
  is_online: boolean;
  motto: string;
  member_since: string;
  profile_visible: boolean;
  last_access_time: string;
}

const Homes: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<HabboUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('profile_visible', true)
        .order('habbo_name', { ascending: true });

      if (error) {
        toast.error('Erro ao buscar usuários');
        return;
      }

      setUsers(data);
    } catch (error) {
      toast.error('Erro ao buscar usuários');
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      setSearchInitiated(true);

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('habbo_name', `%${searchTerm}%`)
        .order('habbo_name', { ascending: true });

      if (error) {
        toast.error('Erro ao buscar usuários');
        return;
      }

      setUsers(data);
      setLoading(false);
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
          <main className="flex-1 p-8 bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-white mb-4 volter-font drop-shadow-lg">
                  🏠 Habbo Homes
                </h1>
                <p className="text-lg text-white/90 volter-font drop-shadow">
                  Explore as homes dos usuários do HabboHub
                </p>
              </div>

              {/* Search Section */}
              <Card className="mb-8 bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-2 border-black">
                  <CardTitle className="text-xl volter-font habbo-text flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Buscar Usuários
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      placeholder="Digite o nome do usuário Habbo..."
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
                </CardContent>
              </Card>

              {/* Users Grid */}
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
                        
                        {user.member_since && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-600 volter-font">
                              Membro desde: {new Date(user.member_since).toLocaleDateString('pt-BR')}
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
                      Tente buscar por um nome diferente ou verifique a ortografia.
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
