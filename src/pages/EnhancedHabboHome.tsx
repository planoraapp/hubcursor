
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CollapsibleSidebar } from '@/components/CollapsibleSidebar';
import { CompactHotelFeed } from '@/components/home/CompactHotelFeed';
import { UserActivityTimeline } from '@/components/home/UserActivityTimeline';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileBadges } from '@/components/profile/ProfileBadges';
import { ProfilePhotos } from '@/components/profile/ProfilePhotos';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileLayout from '@/layouts/MobileLayout';
import { User } from 'lucide-react';

const EnhancedHabboHome = () => {
  const { username, hotel } = useParams<{ username: string; hotel: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('homes');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const { habboUser, habboProfile, photos, avatarUrl, stats, isLoading, error } = useUserProfile(username || '');

  // Set document title and meta tags
  useEffect(() => {
    if (!habboUser) return;
    
    const title = `${habboUser.habbo_name} • Habbo Home (${habboUser.hotel?.toUpperCase()}) | HabboHub`;
    document.title = title;

    // Meta description
    const descText = `Veja o perfil Habbo de ${habboUser.habbo_name} (${habboUser.hotel}). Emblemas, fotos e atividades recentes.`;
    let desc = document.querySelector('meta[name="description"]');
    if (!desc) {
      desc = document.createElement('meta');
      desc.setAttribute('name', 'description');
      document.head.appendChild(desc);
    }
    desc.setAttribute('content', descText);

    // Canonical URL
    const canonicalHref = `${window.location.origin}/home/${habboUser.hotel}/${habboUser.habbo_name}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);

    // JSON-LD structured data
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
            Carregando perfil de {username}...
          </div>
        </div>
      </div>
    );
  }

  if (!habboUser || error) {
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

  const renderMainContent = () => {
    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <ProfileHeader habboUser={habboUser} avatarUrl={avatarUrl} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats and Hotel Feed */}
          <div className="space-y-6">
            <ProfileStats habboUser={habboUser} stats={stats} />
            <CompactHotelFeed />
          </div>

          {/* Middle Column - Badges */}
          <div>
            <ProfileBadges 
              badges={habboProfile?.selectedBadges || []} 
              habboName={habboUser.habbo_name} 
            />
          </div>

          {/* Right Column - Photos and Activity */}
          <div className="space-y-6">
            <ProfilePhotos photos={photos} habboName={habboUser.habbo_name} />
            <UserActivityTimeline hotel={habboUser.hotel} username={habboUser.habbo_name} />
          </div>
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
