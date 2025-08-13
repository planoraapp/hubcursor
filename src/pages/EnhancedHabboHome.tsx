
import React, { useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { habboFeedService } from '@/services/habboFeedService';
import { usePublicHabboProfile } from '@/hooks/usePublicHabboProfile';
import UserActivityTimeline from '@/components/home/UserActivityTimeline';
import { Users, Home } from 'lucide-react';

const normalizeHotel = (hotel: string) => (hotel === 'com.br' ? 'com.br' : hotel);

const avatarFromFigure = (figure?: string | null) => {
  if (!figure) return '';
  const params = new URLSearchParams({
    figure,
    direction: '2',
    head_direction: '2',
    gesture: 'sml',
    size: 'l',
  });
  return `https://www.habbo.com/habbo-imaging/avatarimage?${params.toString()}`;
};

const EnhancedHabboHome: React.FC = () => {
  const params = useParams();
  const queryClient = useQueryClient();

  const hotelParam = params.hotel || '';
  const usernameParam = params.username || '';

  // Basic validation – redirect if malformed
  if (!hotelParam || !usernameParam) {
    return <Navigate to="/" replace />;
  }

  const hotel = useMemo(() => normalizeHotel(hotelParam), [hotelParam]);
  const username = useMemo(() => usernameParam, [usernameParam]);

  // Load minimal public profile via RPC
  const { data: profile, isLoading: loadingProfile } = usePublicHabboProfile(username, hotel);

  // Trigger on-demand sync for this user to populate fresh activities
  useEffect(() => {
    let cancelled = false;
    (async () => {
      console.log('🧭 [EnhancedHabboHome] Triggering user sync for', { username, hotel });
      const resp = await habboFeedService.triggerUserSync(username, hotel);
      console.log('🔄 [EnhancedHabboHome] Sync result:', resp);
      if (!cancelled) {
        // After sync, refresh feed shortly after
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['user-feed', hotel, username] });
          queryClient.invalidateQueries({ queryKey: ['public-habbo-profile', username.toLowerCase(), hotel] });
        }, 400);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hotel, username, queryClient]);

  // Load user feed filtered by username
  const { data: feed, isLoading: loadingFeed } = useQuery({
    queryKey: ['user-feed', hotel, username],
    queryFn: async () => {
      console.log('📰 [EnhancedHabboHome] Fetching user feed for', { hotel, username });
      const data = await habboFeedService.getUserFeed(hotel, username);
      return data;
    },
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 1000 * 30,
  });

  const figureUrl = profile?.figure_string ? avatarFromFigure(profile.figure_string) : '';

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20 border">
              {figureUrl ? (
                <AvatarImage src={figureUrl} alt={profile?.habbo_name || username} />
              ) : null}
              <AvatarFallback className="text-lg font-bold">
                {(profile?.habbo_name || username)[0]?.toUpperCase() || 'H'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {profile?.habbo_name || username}
                {profile?.is_online ? (
                  <span className="inline-flex items-center h-2.5 w-2.5 rounded-full bg-green-500" />
                ) : (
                  <span className="inline-flex items-center h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                )}
              </CardTitle>
              <p className="text-muted-foreground italic mt-1">
                {loadingProfile ? 'Carregando missão...' : profile?.motto || 'Sem missão definida'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{hotel}</Badge>
                {profile?.last_updated ? (
                  <span className="text-xs text-muted-foreground">
                    Atualizado: {new Date(profile.last_updated).toLocaleString()}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
              <TabsTrigger value="more">Mais</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="text-muted-foreground text-sm">
                {profile
                  ? 'Página pública do Habbo com dados básicos e atividades recentes.'
                  : 'Ainda não temos dados deste usuário — sincronizando...'}
              </div>
            </TabsContent>

            <TabsContent value="activities" className="mt-4">
              <UserActivityTimeline activities={feed?.activities || []} isLoading={loadingFeed} />
            </TabsContent>

            <TabsContent value="more" className="mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2" />
                    Amigos e grupos em breve
                  </CardContent>
                </Card>
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    <Home className="w-8 h-8 mx-auto mb-2" />
                    Quartos e fotos em breve
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedHabboHome;
