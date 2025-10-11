
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
import { useAuth } from '@/hooks/useAuth';
import { useLatestHomes } from '@/hooks/useLatestHomes';
import { useTopRatedHomes } from '@/hooks/useTopRatedHomes';
import { useMostVisitedHomes } from '@/hooks/useMostVisitedHomes';
import { HomesGrid } from '@/components/HomesGrid';
import { generateUniqueUsername } from '@/utils/usernameUtils';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import PageBanner from '@/components/ui/PageBanner';
import { AccentFixedText } from '@/components/AccentFixedText';



import type { HabboUser } from '@/types/habbo';
const Homes: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { habboAccount, isLoggedIn } = useAuth();
  const { data: latestHomes, isLoading: loadingLatest, refetch: refetchLatest } = useLatestHomes();
  const { data: topRatedHomes, isLoading: loadingTopRated } = useTopRatedHomes();
  const { data: mostVisitedHomes, isLoading: loadingMostVisited } = useMostVisitedHomes();
  
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

  const handleHomeClick = (userId: string, habboName?: string, hotel?: string) => {
    console.log('🏠 handleHomeClick chamado:', { userId, habboName, hotel });
    
    if (habboName) {
      // Gerar nome único com domínio baseado no hotel
      const selectedHotel = hotel || 'br';
      const domainUsername = generateUniqueUsername(habboName, selectedHotel);
      console.log('🔗 Navegando para:', `/home/${domainUsername}`);
      navigate(`/home/${domainUsername}`);
    } else {
      console.warn('⚠️ habboName está vazio, não pode navegar');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <EnhancedErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CollapsibleAppSidebar />
          <SidebarInset className="flex-1">
            
            <main className="flex-1 p-8 min-h-screen" style={{ 
              backgroundImage: 'url(/assets/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}>
            <div className="max-w-7xl mx-auto">
              <PageBanner 
                title="Habbo Home"
                subtitle="Explore as homes dos usuários do HabboHub"
              />
              
              {/* Botão Minha Home */}
              <div className="text-center mb-8">
                {isLoggedIn && habboAccount ? (
                  <Button 
                    onClick={() => {
                      console.log('🏠 Botão "Ver Minha Home" clicado');
                      console.log('📝 Dados da conta:', habboAccount);
                      
                      // Gerar nome único com domínio baseado no hotel do usuário
                      const domainUsername = generateUniqueUsername(habboAccount.habbo_name, habboAccount.hotel);
                      console.log('🔗 URL gerada:', `/home/${domainUsername}`);
                      
                      navigate(`/home/${domainUsername}`);
                    }}
                    className="habbo-button-green volter-font px-6 py-2"
                  >
                    <User className="w-4 h-4 mr-2" />
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

              <Card className="mb-8 hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-2 border-black">
                  <CardTitle className="flex items-center gap-2 sidebar-font-option-4 text-white"
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      letterSpacing: '0.3px'
                    }}>
                    <Search className="w-5 h-5 text-white" />
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
                      className="flex-1 border-2 border-gray-300 focus:border-purple-500 volter-body-text"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={loading}
                      className="habbo-button-purple sidebar-font-option-4"
                      style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '0.3px'
                      }}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {loading ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                  <p className="text-gray-600 mt-2 volter-body-text">
                    <AccentFixedText>💡 Dica: Deixe o campo vazio e clique em "Buscar" para ver usuários online com homes descobertas</AccentFixedText>
                  </p>
                </CardContent>
              </Card>

              {/* Grids de Homes */}
              <HomesGrid
                title="🎨 Últimas Modificadas"
                homes={latestHomes || []}
                isLoading={loadingLatest}
                error={null}
                onHomeClick={handleHomeClick}
              />

              <HomesGrid
                title="⭐ Maiores Avaliações"
                homes={topRatedHomes || []}
                isLoading={loadingTopRated}
                error={null}
                onHomeClick={handleHomeClick}
              />

              <HomesGrid
                title="👥 Mais Visitadas"
                homes={mostVisitedHomes || []}
                isLoading={loadingMostVisited}
                error={null}
                showVisits={true}
                onHomeClick={handleHomeClick}
              />

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
                              <Badge className={`text-sm volter-font ${user.is_online ? 'bg-green-500' : 'bg-gray-500'}`}>
                                {user.is_online ? 'Online' : 'Offline'}
                              </Badge>
                              <Badge className="bg-white/20 text-white text-sm volter-font">
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
                            <span className="text-sm text-gray-600 volter-font">
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
                          onClick={() => {
                            const domainUsername = generateUniqueUsername(user.habbo_name, user.hotel);
                            navigate(`/home/${domainUsername}`);
                          }}
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
    </EnhancedErrorBoundary>
  );
};

export default Homes;

