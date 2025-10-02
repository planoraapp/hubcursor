import { useQuery } from '@tanstack/react-query';

export interface GlobalPhoto {
  id: string;
  imageUrl: string;
  date: string;
  likes: number;
  userName: string;
  userAvatar: string;
  timestamp?: number;
  caption?: string;
  roomName?: string;
}

export const useGlobalPhotos = (hotel: string = 'br', limit: number = 50, page: number = 1) => {
  return useQuery({
    queryKey: ['global-photos', hotel, limit, page],
    queryFn: async (): Promise<GlobalPhoto[]> => {
      try {
        // Simular busca na API oficial do Habbo
        // Por enquanto, vamos usar dados mockados baseados na estrutura da página oficial
        
        // Simular delay da API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock de fotos globais baseado na estrutura da página oficial
        const mockPhotos: GlobalPhoto[] = [
          {
            id: 'global-1',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-4004243-1759352142069.png',
            date: '01/10/25',
            likes: 1,
            userName: 'adrianooooooo',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=adrianooooooo&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 5, // 5 minutos atrás
            caption: 'Foto incrível do meu quarto!',
            roomName: 'Meu Quarto Especial'
          },
          {
            id: 'global-2',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-92417475-1759351845231.png',
            date: '01/10/25',
            likes: 1,
            userName: '!thaly',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=!thaly&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 10, // 10 minutos atrás
            caption: 'Selfie com os amigos!',
            roomName: 'Quarto da Festa'
          },
          {
            id: 'global-3',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-66179142-1759350614694.png',
            date: '01/10/25',
            likes: 1,
            userName: '.:odiado:.',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=.:odiado:.&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 15, // 15 minutos atrás
            caption: 'Decoração nova ficou show!',
            roomName: 'Meu Cantinho'
          },
          {
            id: 'global-4',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-89011003-1759350395461.png',
            date: '01/10/25',
            likes: 1,
            userName: 'Yildz',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Yildz&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 20, // 20 minutos atrás
            caption: 'Festa épica!',
            roomName: 'Club House'
          },
          {
            id: 'global-5',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-81182664-1759349455698.png',
            date: '01/10/25',
            likes: 2,
            userName: '-A@riane..',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=-A@riane..&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 25, // 25 minutos atrás
            caption: 'Momento perfeito!',
            roomName: 'Café Central'
          },
          {
            id: 'global-6',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-49256140-1759349053219.png',
            date: '01/10/25',
            likes: 2,
            userName: 'JhullyMaggot',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=JhullyMaggot&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 30, // 30 minutos atrás
            caption: 'Nova decoração!',
            roomName: 'Quarto Moderno'
          },
          {
            id: 'global-7',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-72502417-1759348599760.png',
            date: '01/10/25',
            likes: 1,
            userName: 'HannaKitanda',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=HannaKitanda&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 35, // 35 minutos atrás
            caption: 'Selfie do dia!',
            roomName: 'Meu Espaço'
          },
          {
            id: 'global-8',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-81155621-1759348281660.png',
            date: '01/10/25',
            likes: 1,
            userName: '..:Leeeehh:..',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=..:Leeeehh:..&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 40, // 40 minutos atrás
            caption: 'Festa incrível!',
            roomName: 'Party Room'
          },
          {
            id: 'global-9',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-22960807-1759347845844.png',
            date: '01/10/25',
            likes: 1,
            userName: 'Siftwe',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Siftwe&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 45, // 45 minutos atrás
            caption: 'Momento especial!',
            roomName: 'Quarto VIP'
          },
          {
            id: 'global-10',
            imageUrl: 'https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-91224871-1759346981961.png',
            date: '01/10/25',
            likes: 1,
            userName: 'sheyla@bb',
            userAvatar: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=sheyla@bb&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std',
            timestamp: Date.now() - 1000 * 60 * 50, // 50 minutos atrás
            caption: 'Decoração nova!',
            roomName: 'Casa da Sheyla'
          }
        ];

        // Gerar mais fotos mockadas para simular paginação
        const generateMorePhotos = (startId: number, count: number): GlobalPhoto[] => {
          const photos: GlobalPhoto[] = [];
          for (let i = 0; i < count; i++) {
            photos.push({
              id: `global-${startId + i}`,
              imageUrl: `https://habbo-stories-content.s3.amazonaws.com/servercamera/purchased/hhbr/p-${Math.floor(Math.random() * 100000000)}-${Date.now() - Math.random() * 1000000000}.png`,
              date: '01/10/25',
              likes: Math.floor(Math.random() * 10) + 1,
              userName: `user${startId + i}`,
              userAvatar: `https://www.habbo.com.br/habbo-imaging/avatarimage?user=user${startId + i}&headonly=1&size=b&gesture=sml&direction=2&head_direction=2&action=std`,
              timestamp: Date.now() - Math.random() * 1000000000, // Timestamp aleatório
              caption: `Foto incrível ${startId + i}!`,
              roomName: `Quarto ${startId + i}`
            });
          }
          return photos;
        };

        // Combinar fotos mockadas com fotos geradas
        const allMockPhotos = [
          ...mockPhotos,
          ...generateMorePhotos(11, 100) // Gerar 100 fotos adicionais
        ];

        // Ordenar por timestamp (mais recentes primeiro)
        const sortedPhotos = allMockPhotos
          .sort((a, b) => {
            const timestampA = a.timestamp || Date.now();
            const timestampB = b.timestamp || Date.now();
            return timestampB - timestampA;
          });

        // Aplicar paginação
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPhotos = sortedPhotos.slice(startIndex, endIndex);

        console.log(`[✅ GLOBAL PHOTOS] Successfully fetched ${paginatedPhotos.length} photos (page ${page})`);
        
        return paginatedPhotos;
      } catch (error) {
        console.error('[❌ GLOBAL PHOTOS] Error fetching photos:', error);
        throw new Error('Failed to fetch global photos');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: 2
  });
};
