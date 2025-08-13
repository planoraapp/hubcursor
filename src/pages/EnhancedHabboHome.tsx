
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { CompactHotelFeed } from '@/components/home/CompactHotelFeed';
import { UserActivityTimeline } from '@/components/home/UserActivityTimeline';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/layouts/MobileLayout';
import { 
  User, 
  Calendar, 
  Trophy, 
  Users, 
  MapPin, 
  Clock,
  ExternalLink,
  Star,
  Heart
} from 'lucide-react';
import { habboFeedService } from '@/services/habboFeedService';

interface HabboUserData {
  supabase_user_id: string;
  habbo_name: string;
  habbo_id: string;
  hotel: string;
  figure_string?: string;
  motto?: string;
  is_online?: boolean;
  created_at?: string;
  last_updated?: string;
}

const EnhancedHabboHome = () => {
  const { username, hotel } = useParams<{ username: string; hotel: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('homes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const { data: habboUser, isLoading } = useQuery({
    queryKey: ['habbo-user', username, hotel],
    queryFn: async () => {
      if (!username) return null;
      
      try {
        console.log(`🔍 [EnhancedHabboHome] Fetching data for ${username} at hotel ${hotel}`);
        
        const { data, error } = await supabase
          .rpc('get_habbo_account_public_by_name', { 
            habbo_name_param: username.trim().toLowerCase() 
          });

        if (error) {
          console.error('❌ [EnhancedHabboHome] Error fetching user:', error);
          throw error;
        }

        const userData = Array.isArray(data) ? data[0] : data;
        console.log('✅ [EnhancedHabboHome] User data loaded:', userData?.habbo_name);
        
        return userData as HabboUserData;
      } catch (error) {
        console.error('❌ [EnhancedHabboHome] Failed to fetch user data:', error);
        throw error;
      }
    },
    enabled: !!username,
    retry: 2,
    staleTime: 5 * 60 * 1000,
  });

  // Garante rastreamento/sincronização e SEO por usuário
  useEffect(() => {
    if (habboUser?.habbo_id && habboUser?.habbo_name && habboUser?.hotel) {
      habboFeedService.ensureTrackedAndSynced({
        habbo_name: habboUser.habbo_name,
        habbo_id: habboUser.habbo_id,
        hotel: habboUser.hotel,
      }).catch(() => {});
    }
  }, [habboUser?.habbo_id, habboUser?.habbo_name, habboUser?.hotel]);

  useEffect(() => {
    if (!habboUser) return;
    const title = `${habboUser.habbo_name} • Habbo Home (${habboUser.hotel?.toUpperCase()}) | HabboHub`;
    document.title = title;

    // Meta description
    const descText = `Veja o perfil Habbo de ${habboUser.habbo_name} (${habboUser.hotel}). Emblemas, amigos, quartos e atividades recentes.`;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.setAttribute('name', 'description');
      document.head.appendChild(desc);
    }
    desc.setAttribute('content', descText);

    // Canonical
    const canonicalHref = `${window.location.origin}/home/${habboUser.hotel}/${habboUser.habbo_name}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    // JSON-LD Person
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: habboUser.habbo_name,
      url: canonicalHref,
      description: descText,
    });
    document.head.appendChild(script);
    return () => {
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [habboUser]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg volter-font text-white" style={{
            textShadow: '1px 1px 0px black, -1px -1px 0px black, 1px -1px 0px black, -1px 1px 0px black'
          }}>
            Carregando perfil do {username}...
          </div>
        </div>
      </div>
    );
  }

  if (!habboUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-repeat"
           style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-black">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Usuário não encontrado</h2>
            <p className="text-gray-600 mb-4">
              O usuário "{username}" não foi encontrado em nosso banco de dados.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = habboUser?.figure_string 
    ? `https://www.habbo.${habboUser.hotel}/habbo-imaging/avatarimage?figure=${habboUser.figure_string}&size=l&direction=2&head_direction=3&action=std`
    : `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&action=std`;

  const renderMainContent = () => {
    return (
      <div className="space-y-6">
        {/* User Profile Header */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-black">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt={habboUser.habbo_name}
                    className="h-32 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.src = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=l&direction=2&head_direction=3&action=std`;
                    }}
                  />
                  <Badge 
                    className={`absolute -bottom-2 -right-2 ${habboUser.is_online ? 'bg-green-500' : 'bg-red-500'} text-white`}
                  >
                    {habboUser.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold volter-font mb-2">{habboUser.habbo_name}</h1>
                
                {habboUser.motto && (
                  <p className="text-lg text-gray-600 italic mb-4">"{habboUser.motto}"</p>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Hotel: {habboUser.hotel?.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span>Desde: {habboUser.created_at ? new Date(habboUser.created_at).getFullYear() : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Atualizado: {habboUser.last_updated ? new Date(habboUser.last_updated).toLocaleDateString('pt-BR') : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>ID: {habboUser.habbo_id}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotel Feed Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompactHotelFeed />

          <UserActivityTimeline hotel={habboUser.hotel} username={habboUser.habbo_name} />
          
          {/* User Stats/Info Card */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-2 border-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Informações do Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nome Habbo:</span>
                  <span className="text-sm">{habboUser.habbo_name}</span>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hotel:</span>
                  <Badge variant="outline">{habboUser.hotel?.toUpperCase()}</Badge>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={habboUser.is_online ? 'bg-green-500' : 'bg-red-500'}>
                    {habboUser.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://www.habbo.${habboUser.hotel}/profile/${habboUser.habbo_name}`, '_blank')}
                  >
                    Ver Perfil Oficial
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="p-4">
          {renderMainContent()}
        </div>
      </MobileLayout>
    );
  }

  return (
    <div className="min-h-screen bg-repeat" style={{ backgroundImage: 'url(/assets/bghabbohub.png)' }}>
      <div className="flex min-h-screen">
        <CollapsibleSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export default EnhancedHabboHome;
