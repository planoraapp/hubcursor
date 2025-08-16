
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageSquare, RefreshCw, Camera } from 'lucide-react';
import { UserProfileModal } from '@/components/UserProfileModal';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface HabboPhoto {
  id: string;
  photo_id: string;
  habbo_name: string;
  habbo_id: string;
  s3_url: string;
  preview_url?: string;
  room_name?: string;
  likes_count: number;
  taken_date: string;
  hotel: string;
}

export const HotelPhotoFeedColumn = () => {
  const { habboAccount } = useUnifiedAuth();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: photos = [], isLoading, refetch } = useQuery({
    queryKey: ['hotel-feed-photos'],
    queryFn: async (): Promise<HabboPhoto[]> => {
      // Primeira prioridade: fotos de amigos (simulado por ora)
      let friendsPhotos: HabboPhoto[] = [];
      
      if (habboAccount?.habbo_name) {
        // Em produção, isso buscaria amigos reais do usuário
        // Por ora, vamos pegar algumas fotos específicas como "amigos"
        const friendNames = ['Beebop', 'TestUser', 'HabboFriend'];
        const { data: friendsData } = await supabase
          .from('habbo_photos')
          .select('*')
          .in('habbo_name', friendNames)
          .order('taken_date', { ascending: false })
          .limit(5);
        
        friendsPhotos = friendsData || [];
      }

      // Segunda prioridade: fotos aleatórias do hotel
      const { data: randomPhotos } = await supabase
        .from('habbo_photos')
        .select('*')
        .order('taken_date', { ascending: false })
        .limit(15);

      // Combinar e remover duplicatas
      const allPhotos = [...friendsPhotos, ...(randomPhotos || [])];
      const uniquePhotos = allPhotos.filter((photo, index, self) => 
        index === self.findIndex(p => p.photo_id === photo.photo_id)
      );

      return uniquePhotos.slice(0, 20);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const getAvatarUrl = (habboName: string) => {
    return `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${habboName}&size=s&direction=2&head_direction=3&action=std&headonly=1`;
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto bg-background space-y-4 h-screen overflow-y-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-sm mx-auto bg-background space-y-4 h-screen overflow-y-auto p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Feed do Hotel
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="ml-auto"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>

        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Header com usuário */}
              <div className="p-3 flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage 
                    src={getAvatarUrl(photo.habbo_name)} 
                    className="pixelated bg-transparent"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <AvatarFallback className="text-xs">
                    {photo.habbo_name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <button
                    onClick={() => setSelectedUser(photo.habbo_name)}
                    className="font-semibold text-sm hover:underline text-left"
                  >
                    {photo.habbo_name}
                  </button>
                  <p className="text-xs text-muted-foreground">
                    {formatTimeAgo(photo.taken_date)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {photo.hotel === 'br' ? 'BR' : photo.hotel.toUpperCase()}
                </Badge>
              </div>

              {/* Imagem da foto */}
              <div className="aspect-square bg-muted">
                <img
                  src={photo.preview_url || photo.s3_url}
                  alt="Foto do Habbo"
                  className="w-full h-full object-cover pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              {/* Footer com interações */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Heart className="w-4 h-4 mr-1" />
                    <span className="text-xs">{photo.likes_count}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    <span className="text-xs">0</span>
                  </Button>
                </div>
                {photo.room_name && (
                  <p className="text-xs text-muted-foreground">
                    📍 {photo.room_name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {photos.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Nenhuma foto encontrada no feed
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="mt-2"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de perfil do usuário */}
      {selectedUser && (
        <UserProfileModal
          open={!!selectedUser}
          setOpen={() => setSelectedUser(null)}
          habboName={selectedUser}
        />
      )}
    </>
  );
};
