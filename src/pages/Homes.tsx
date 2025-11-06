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
import { useI18n } from '@/contexts/I18nContext';
import { useLatestHomes } from '@/hooks/useLatestHomes';
import { useTopRatedHomes } from '@/hooks/useTopRatedHomes';
import { useMostVisitedHomes } from '@/hooks/useMostVisitedHomes';
import { useMyHomeData } from '@/hooks/useMyHomeData';
import { HomesGrid } from '@/components/HomesGrid';
import { HomeCard } from '@/components/HomeCard';
import { generateUniqueUsername } from '@/utils/usernameUtils';
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary';
import PageBanner from '@/components/ui/PageBanner';
import { HotelTag } from '@/components/HotelTag';
import { AccentFixedText } from '@/components/AccentFixedText';
import { getBannerImageBySeed } from '@/utils/bannerUtils';
import { Footer } from '@/components/Footer';

import type { HabboUser } from '@/types/habbo';

const Homes: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { habboAccount, isLoggedIn } = useAuth();
  const { t } = useI18n();
  const { data: latestHomes, isLoading: loadingLatest, refetch: refetchLatest } = useLatestHomes();
  const { data: topRatedHomes, isLoading: loadingTopRated } = useTopRatedHomes();
  const { data: mostVisitedHomes, isLoading: loadingMostVisited } = useMostVisitedHomes();
  const { myHomeData, isLoading: myHomeLoading } = useMyHomeData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<HabboUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  

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
          title: t('messages.errorSearch'),
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      toast({
        title: t('messages.errorSearch'),
        description: t('messages.errorSearchDescription'),
        variant: "destructive"
      });
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setLoading(true);
      setSearchInitiated(true);

      // Buscar usuários com homes configuradas
      const { data: accountsData, error: accountsError } = await supabase
        .from('habbo_accounts')
        .select('supabase_user_id, habbo_name, hotel')
        .ilike('habbo_name', `%${searchTerm}%`)
        .limit(50);

      if (accountsError) {
        console.error('Erro ao buscar contas:', accountsError);
      }

      // Buscar backgrounds para os usuários encontrados
      let homesData: any[] = [];
      if (accountsData && accountsData.length > 0) {
        const userIds = accountsData.map(acc => acc.supabase_user_id).filter(Boolean);
        
        if (userIds.length > 0) {
          const { data: backgroundsData, error: backgroundsError } = await supabase
            .from('user_home_backgrounds')
            .select('*')
            .in('user_id', userIds)
            .order('updated_at', { ascending: false });

          if (!backgroundsError && backgroundsData) {
            // Combinar dados de accounts com backgrounds
            homesData = backgroundsData.map(bg => {
              const account = accountsData.find(acc => acc.supabase_user_id === bg.user_id);
              return {
                ...bg,
                habbo_name: account?.habbo_name,
                hotel: account?.hotel
              };
            });
          }
        }
      }

      // Também buscar em discovered_users para casos sem home configurada
      const { data: usersData, error: usersError } = await supabase
        .from('discovered_users')
        .select('*')
        .ilike('habbo_name', `%${searchTerm}%`)
        .order('habbo_name', { ascending: true })
        .limit(50);

      if (accountsError && usersError) {
        toast({
          title: t('messages.errorSearch'),
          description: t('messages.errorSearchDescription'),
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Combinar resultados, priorizando quem tem home configurada
      const combinedResults = [
        ...(homesData || []).map((home: any) => ({
          habbo_name: home.habbo_name,
          hotel: home.hotel || 'br',
          is_online: false,
          has_home: true,
          background_type: home.background_type,
          background_value: home.background_value,
          updated_at: home.updated_at,
          user_id: home.user_id
        })),
        ...(usersData || []).filter((user: any) => 
          !(accountsData || []).some((acc: any) => 
            acc.habbo_name === user.habbo_name
          )
        ).map((user: any) => ({
          ...user,
          has_home: false
        }))
      ];

      setUsers(combinedResults);
      setLoading(false);
    } else {
      // Se não há termo de busca, mostra usuários online
      setSearchInitiated(true);
      await fetchUsers();
    }
  };

  const filteredUsers = users.filter((user) => user.habbo_name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleHomeClick = (userId: string, habboName?: string, hotel?: string) => {
    if (habboName) {
      // Gerar nome único com domínio baseado no hotel
      const selectedHotel = hotel || 'br';
      const domainUsername = generateUniqueUsername(habboName, selectedHotel);
      navigate(`/home/${domainUsername}`);
    }
  };

  // Função para gerar o background da home (similar aos outros cards)
  const getHomeBackgroundUrl = (homeData: any) => {
    if (!homeData?.background_value) return null;
    
    // Detectar automaticamente se é uma URL de imagem
    const isImageUrl = homeData.background_value.startsWith('http') || 
                      homeData.background_value.startsWith('/') ||
                      homeData.background_value.includes('.gif') ||
                      homeData.background_value.includes('.png') ||
                      homeData.background_value.includes('.jpg') ||
                      homeData.background_value.includes('.jpeg') ||
                      homeData.background_value.includes('.webp');
    
    // Se for uma URL de imagem, usar diretamente
    if (isImageUrl) {
      return `url(${homeData.background_value})`;
    }
    
    // Se for uma cor hexadecimal
    if (homeData.background_value.startsWith('#')) {
      return `linear-gradient(135deg, ${homeData.background_value} 0%, ${homeData.background_value}dd 100%)`;
    }
    
    // Se for um nome de background (como "bghabbohub"), tentar construir a URL
    if (homeData.background_value === 'bghabbohub') {
      return `url(/assets/site/bghabbohub.png)`;
    }
    
    // Fallback para o tipo definido
    switch (homeData.background_type) {
      case 'image':
        return `url(${homeData.background_value})`;
      case 'color':
        return `linear-gradient(135deg, ${homeData.background_value} 0%, ${homeData.background_value}dd 100%)`;
      case 'repeat':
        return `url(${homeData.background_value})`;
      case 'cover':
        return `url(${homeData.background_value})`;
      case 'default':
        // Para tipo "default", tentar construir a URL baseada no valor
        if (homeData.background_value === 'bghabbohub') {
          return `url(/assets/site/bghabbohub.png)`;
        }
        return `url(/assets/site/${homeData.background_value}.png)`;
      default:
        return null;
    }
  };

  // Determinar cor de fundo baseada no tipo de background
  const getBackgroundColor = (homeData: any) => {
    if (homeData?.background_value?.startsWith('#')) {
      return homeData.background_value;
    }
    if (homeData?.background_type === 'color' && homeData.background_value) {
      return homeData.background_value;
    }
    return '#c7d2dc'; // Cor padrão
  };

  // Determinar configurações de background baseadas no tipo
  const getBackgroundSettings = (homeData: any) => {
    switch (homeData?.background_type) {
      case 'repeat':
        return {
          backgroundSize: 'auto',
          backgroundRepeat: 'repeat'
        };
      case 'cover':
        return {
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        };
      default:
        return {
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        };
    }
  };

  // Debounce para busca em tempo real
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Busca automática quando o termo debounced muda
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchTerm.trim().length >= 2) {
        setLoading(true);
        setSearchInitiated(true);

        // Buscar usuários com homes configuradas (apenas com background)
        const { data: accountsData, error: accountsError } = await supabase
          .from('habbo_accounts')
          .select('supabase_user_id, habbo_name, hotel')
          .ilike('habbo_name', `%${debouncedSearchTerm}%`)
          .limit(50);

        if (accountsError) {
          console.error('Erro ao buscar contas:', accountsError);
          toast({
            title: t('messages.errorSearch'),
            description: t('messages.errorSearchDescription'),
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Buscar backgrounds para os usuários encontrados
        let homesData: any[] = [];
        if (accountsData && accountsData.length > 0) {
          const userIds = accountsData.map(acc => acc.supabase_user_id).filter(Boolean);
          
          if (userIds.length > 0) {
            const { data: backgroundsData, error: backgroundsError } = await supabase
              .from('user_home_backgrounds')
              .select('*')
              .in('user_id', userIds)
              .order('updated_at', { ascending: false });

            if (!backgroundsError && backgroundsData && backgroundsData.length > 0) {
              // Combinar dados de accounts com backgrounds
              homesData = backgroundsData.map(bg => {
                const account = accountsData.find(acc => acc.supabase_user_id === bg.user_id);
                return {
                  ...bg,
                  habbo_name: account?.habbo_name,
                  hotel: account?.hotel
                };
              });
            }
          }
        }

        // Filtrar apenas homes com background configurado
        const validHomes = homesData
          .filter(home => home.background_value) // Apenas com background
          .map((home: any) => ({
            id: home.user_id,
            habbo_name: home.habbo_name,
            hotel: home.hotel || 'br',
            is_online: false,
            has_home: true,
            background_type: home.background_type,
            background_value: home.background_value,
            updated_at: home.updated_at,
            user_id: home.user_id
          }));

        setUsers(validHomes);
        setLoading(false);
      } else if (debouncedSearchTerm.trim().length === 0 && searchInitiated) {
        // Limpar resultados se a busca for apagada
        setUsers([]);
        setSearchInitiated(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm]);

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
              backgroundImage: 'url(/assets/site/bghabbohub.png)',
              backgroundRepeat: 'repeat'
            }}>
            <div className="max-w-7xl mx-auto">
              <PageBanner 
                title="Habbo Home"
                subtitle="Explore as homes dos usuários do HabboHub"
                backgroundImage={getBannerImageBySeed('homes')}
              />
              
              {/* Busca e Minha Home */}
              <div className="flex gap-6 mb-8 items-stretch">
                {/* Minicard Minha Home ou Login */}
                {isLoggedIn && habboAccount ? (
                  <div className="flex-shrink-0">
                    <Card 
                      className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer w-64 h-full relative overflow-hidden"
                      onClick={() => {
                        const domainUsername = generateUniqueUsername(habboAccount.habbo_name, habboAccount.hotel);
                        navigate(`/home/${domainUsername}`);
                      }}
                    >
                      {/* Background da Home - usando dados reais */}
                      <div 
                        className="absolute inset-0"
                        style={{
                          backgroundImage: getHomeBackgroundUrl(myHomeData),
                          backgroundColor: getBackgroundColor(myHomeData),
                          backgroundSize: getBackgroundSettings(myHomeData).backgroundSize,
                          backgroundRepeat: getBackgroundSettings(myHomeData).backgroundRepeat,
                          backgroundPosition: 'center'
                        }}
                      />
                      
                      {/* Overlay escuro para legibilidade */}
                      <div className="absolute inset-0 bg-black/30" />
                      
                      {/* Avatar grande no canto inferior direito - sempre busca size=l pela API */}
                      <div className="absolute inset-0 flex items-end justify-end p-3">
                        <img
                          src={`https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboAccount.habbo_name}&size=l&direction=2&head_direction=3&gesture=sml&action=std`}
                          alt={`Avatar de ${habboAccount.habbo_name}`}
                          className="h-full w-auto object-contain"
                          style={{ imageRendering: 'pixelated' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://habbo-imaging.s3.amazonaws.com/avatarimage?user=${habboAccount.habbo_name}&size=l&direction=2&head_direction=3&gesture=sml&action=std`;
                          }}
                        />
                      </div>
                      
                      {/* Conteúdo do card */}
                      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-lg volter-font drop-shadow-lg">
                            {habboAccount.habbo_name}
                          </h4>
                          <div className="mt-1">
                            <HotelTag hotel={habboAccount.hotel} />
                          </div>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 text-white drop-shadow-lg">
                            <Home className="w-5 h-5" />
                            <span className="font-semibold volter-font">Minha Home</span>
                          </div>
                          <p className="text-xs text-white/80 volter-font drop-shadow-lg mt-1">
                            Clique para visitar
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="flex-shrink-0">
                    <Card 
                      className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer w-64 h-full relative overflow-hidden"
                      onClick={() => navigate('/login')}
                    >
                      {/* Background padrão para não logado */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 opacity-20" />
                      
                      {/* Overlay escuro */}
                      <div className="absolute inset-0 bg-black/30" />
                      
                      {/* Ícone de login no canto inferior direito */}
                      <div className="absolute inset-0 flex items-end justify-end p-3">
                        <User className="w-16 h-16 text-white/80 drop-shadow-lg" />
                      </div>
                      
                      {/* Conteúdo do card */}
                      <div className="relative z-10 p-4 h-full flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-white text-lg volter-font drop-shadow-lg">
                            Fazer Login
                          </h4>
                          <p className="text-xs text-white/80 volter-font drop-shadow-lg mt-1">
                            Acesse sua conta
                          </p>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center gap-2 text-white drop-shadow-lg">
                            <Home className="w-5 h-5" />
                            <span className="font-semibold volter-font">Minha Home</span>
                          </div>
                          <p className="text-xs text-white/80 volter-font drop-shadow-lg mt-1">
                            Login necessário
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Campo de Busca */}
                <div className="flex-1">
                  <Card className="hover:shadow-lg transition-shadow bg-white/95 backdrop-blur-sm border-2 border-black">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-b-2 border-black">
                  <CardTitle className="flex items-center gap-2 sidebar-font-option-4 text-white"
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      letterSpacing: '0.3px'
                    }}>
                    <Search className="w-5 h-5 text-white" />
                    {t('pages.homes.searchButton')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder={t('pages.homes.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="border-2 border-gray-300 focus:border-purple-500 volter-body-text pr-10"
                      />
                      {loading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
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
                      {loading ? t('buttons.searching') : t('buttons.search')}
                    </Button>
                  </div>
                  <p className="text-gray-600 mt-2 volter-body-text">
                    <AccentFixedText>{t('messages.searchTip')}</AccentFixedText>
                  </p>
                </CardContent>
              </Card>
                </div>
              </div>

              {/* Resultados da Busca - Movido para cima */}
              {searchInitiated && filteredUsers.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-4 volter-goldfish-font" 
                      style={{ textShadow: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 0px 2px 0px #000, 0px -2px 0px #000, 2px 0px 0px #000, -2px 0px 0px #000' }}>
                    🔍 Resultados da Busca ({filteredUsers.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredUsers.map((user, index) => (
                      <HomeCard
                        key={`${user.habbo_name}-${index}`}
                        home={{
                          user_id: user.habbo_name,
                          habbo_name: user.habbo_name,
                          hotel: user.hotel,
                          updated_at: user.updated_at,
                          background_type: user.background_type,
                          background_value: user.background_value
                        }}
                        onHomeClick={handleHomeClick}
                      />
                    ))}
                  </div>
                </div>
              )}

              {searchInitiated && filteredUsers.length === 0 && !loading && (
                <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-2 border-black mb-8">
                  <CardContent className="p-8 text-center">
                    <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-700 mb-2 volter-font">
                      {t('messages.noResults')}
                    </h3>
                    <p className="text-gray-600 volter-font">
                      {t('messages.noResultsDescription')}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Grids de Homes */}
              <div className="mt-8">
                <HomesGrid
                  title="🎨 Últimas Modificadas"
                  homes={latestHomes || []}
                  isLoading={loadingLatest}
                  error={null}
                  onHomeClick={handleHomeClick}
                />
              </div>

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
            </div>
            
            {/* Footer Disclaimer */}
            <Footer />
            </main>
          </SidebarInset>
        </div>
        
      </SidebarProvider>
    </EnhancedErrorBoundary>
  );
};

export default Homes;