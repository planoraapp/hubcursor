// --- Interfaces para Tipagem de Dados ---
export interface Activity {
  user: string;
  type: string;
  description: string;
  timestamp: number;
}

export interface Badge {
  code: string;
  imageUrl: string;
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  timestamp: number;
}

export interface Friend {
  uniqueId: string;
  name: string;
  look: string;
}

export interface UserProfile {
  uniqueId: string;
  name: string;
  motto: string;
  look: string;
  creationDate: string;
  lastVisit: string;
  online: boolean;
  friendsCount: number;
  followerCount: number;
  photos: Photo[];
  badges: Badge[];
  friends: Friend[];
}

// --- Mock Data e Funções Auxiliares ---
export const mockHabboApi = {
  users: {
    'Beebop': {
      uniqueId: 'Beebop',
      name: 'Beebop',
      motto: 'A vida é pixel por pixel!',
      look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&headonly=0&direction=2&gesture=sml&action=std&size=l&head_direction=2',
      creationDate: '01/01/2018',
      lastVisit: 'Hoje',
      online: true,
      friendsCount: 123,
      followerCount: 75,
      photos: [
        { id: 'photo_1', url: 'https://placehold.co/300x200/FBBF24/374151?text=Quarto+Divertido', caption: 'Meu novo quarto!', timestamp: Date.now() - 86400000 * 2 },
        { id: 'photo_2', url: 'https://placehold.co/300x200/FBBF24/374151?text=Com+os+Amigos', caption: 'Galera reunida!', timestamp: Date.now() - 86400000 * 5 },
        { id: 'photo_3', url: 'https://placehold.co/300x200/FBBF24/374151?text=Evento+Habbo', caption: 'Participando do evento!', timestamp: Date.now() - 86400000 * 7 },
        { id: 'photo_4', url: 'https://placehold.co/300x200/FBBF24/374151?text=Look+Novo', caption: 'Look novo para o verão.', timestamp: Date.now() - 86400000 * 10 },
      ],
      badges: [
        { code: 'ACH_DiamondCollector1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_DiamondCollector1.gif' },
        { code: 'ACH_Registration1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_Registration1.gif' },
        { code: 'ACH_TalentTracker1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_TalentTracker1.gif' },
        { code: 'ACH_AllRounder1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_AllRounder1.gif' },
        { code: 'ACH_RoomBuilder1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_RoomBuilder1.gif' },
        { code: 'ACH_Trader1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_Trader1.gif' },
      ],
      friends: [
        { uniqueId: 'HabboAmigo', name: 'HabboAmigo', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=HabboAmigo&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'PixelArtist', name: 'PixelArtist', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=PixelArtist&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'AmigoTop', name: 'AmigoTop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=AmigoTop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'MestrePixel', name: 'MestrePixel', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=MestrePixel&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
      ]
    },
    'HabboAmigo': {
      uniqueId: 'HabboAmigo',
      name: 'HabboAmigo',
      motto: 'Sempre online para fazer amigos!',
      look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=HabboAmigo&headonly=0&direction=2&gesture=sml&action=std&size=l&head_direction=2',
      creationDate: '15/03/2020',
      lastVisit: 'Ontem',
      online: false,
      friendsCount: 88,
      followerCount: 42,
      photos: [
        { id: 'photo_5', url: 'https://placehold.co/300x200/22D3EE/0F172A?text=Noite+de+Festa', caption: 'Aproveitando a festa!', timestamp: Date.now() - 86400000 * 3 },
        { id: 'photo_6', url: 'https://placehold.co/300x200/22D3EE/0F172A?text=Quarto+Temático', caption: 'Meu quarto temático.', timestamp: Date.now() - 86400000 * 6 },
      ],
      badges: [
        { code: 'ACH_Detective1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_Detective1.gif' },
        { code: 'ACH_SocialNetworking1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_SocialNetworking1.gif' },
        { code: 'ACH_PetLover1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_PetLover1.gif' },
      ],
      friends: [
        { uniqueId: 'Beebop', name: 'Beebop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'MestrePixel', name: 'MestrePixel', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=MestrePixel&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
      ]
    },
    'PixelArtist': {
      uniqueId: 'PixelArtist',
      name: 'PixelArtist',
      motto: 'Transformando pixels em arte!',
      look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=PixelArtist&headonly=0&direction=2&gesture=sml&action=std&size=l&head_direction=2',
      creationDate: '01/05/2019',
      lastVisit: 'Hoje',
      online: true,
      friendsCount: 210,
      followerCount: 155,
      photos: [
        { id: 'photo_7', url: 'https://placehold.co/300x200/A78BFA/1E293B?text=Arte+em+Pixel', caption: 'Minha última criação.', timestamp: Date.now() - 86400000 * 1 },
        { id: 'photo_8', url: 'https://placehold.co/300x200/A78BFA/1E293B?text=Exposição+de+Arte', caption: 'Expondo minhas artes.', timestamp: Date.now() - 86400000 * 4 },
      ],
      badges: [
        { code: 'ACH_PixelArtist1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_PixelArtist1.gif' },
        { code: 'ACH_Designer1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_Designer1.gif' },
        { code: 'ACH_Creative1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_Creative1.gif' },
      ],
      friends: [
        { uniqueId: 'Beebop', name: 'Beebop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'AmigoTop', name: 'AmigoTop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=AmigoTop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
      ]
    },
    'AmigoTop': {
      uniqueId: 'AmigoTop',
      name: 'AmigoTop',
      motto: 'Sempre no topo com os melhores amigos!',
      look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=AmigoTop&headonly=0&direction=2&gesture=sml&action=std&size=l&head_direction=2',
      creationDate: '10/11/2021',
      lastVisit: 'Hoje',
      online: true,
      friendsCount: 320,
      followerCount: 250,
      photos: [
        { id: 'photo_9', url: 'https://placehold.co/300x200/67E8F9/0F172A?text=Festa+na+Piscina', caption: 'Curtindo a piscina com a galera.', timestamp: Date.now() - 86400000 * 8 },
        { id: 'photo_10', url: 'https://placehold.co/300x200/67E8F9/0F172A?text=Noite+de+Karaoke', caption: 'Soltando a voz no karaokê.', timestamp: Date.now() - 86400000 * 11 },
      ],
      badges: [
        { code: 'ACH_TopAmigo1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_TopAmigo1.gif' },
        { code: 'ACH_PartyAnimal1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_PartyAnimal1.gif' },
        { code: 'ACH_SocialButterfly1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_SocialButterfly1.gif' },
      ],
      friends: [
        { uniqueId: 'Beebop', name: 'Beebop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'PixelArtist', name: 'PixelArtist', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=PixelArtist&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
      ]
    },
    'MestrePixel': {
      uniqueId: 'MestrePixel',
      name: 'MestrePixel',
      motto: 'Dominando a arte dos pixels!',
      look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=MestrePixel&headonly=0&direction=2&gesture=sml&action=std&size=l&head_direction=2',
      creationDate: '20/07/2017',
      lastVisit: 'Ontem',
      online: false,
      friendsCount: 450,
      followerCount: 380,
      photos: [
        { id: 'photo_11', url: 'https://placehold.co/300x200/F472B6/4A5568?text=Criando+em+Pixel', caption: 'Mais uma criação em pixel art.', timestamp: Date.now() - 86400000 * 10 },
        { id: 'photo_12', url: 'https://placehold.co/300x200/F472B6/4A5568?text=Exposição+de+Artes', caption: 'Expondo minhas artes para o mundo.', timestamp: Date.now() - 86400000 * 14 },
      ],
      badges: [
        { code: 'ACH_MasterPixel1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_MasterPixel1.gif' },
        { code: 'ACH_ArtCreator1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_ArtCreator1.gif' },
        { code: 'ACH_ArtCollector1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_ArtCollector1.gif' },
      ],
      friends: [
        { uniqueId: 'HabboAmigo', name: 'HabboAmigo', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=HabboAmigo&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'PixelArtist', name: 'PixelArtist', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=PixelArtist&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
      ]
    },
    'HabboLover': {
      uniqueId: 'HabboLover',
      name: 'HabboLover',
      motto: 'Vivendo e amando o mundo Habbo!',
      look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=HabboLover&headonly=0&direction=2&gesture=sml&action=std&size=l&head_direction=2',
      creationDate: '05/02/2022',
      lastVisit: 'Hoje',
      online: true,
      friendsCount: 500,
      followerCount: 420,
      photos: [
        { id: 'photo_13', url: 'https://placehold.co/300x200/4ADE80/1E293B?text=Amo+o+Habbo', caption: 'Declarando meu amor ao Habbo.', timestamp: Date.now() - 86400000 * 6 },
        { id: 'photo_14', url: 'https://placehold.co/300x200/4ADE80/1E293B?text=Comunidade+Habbo', caption: 'Celebrando a comunidade Habbo.', timestamp: Date.now() - 86400000 * 9 },
      ],
      badges: [
        { code: 'ACH_HabboFan1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_HabboFan1.gif' },
        { code: 'ACH_CommunityLover1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_CommunityLover1.gif' },
        { code: 'ACH_Supporter1', imageUrl: 'https://assets.habbo.com/c_images/album1584/ACH_Supporter1.gif' },
      ],
      friends: [
        { uniqueId: 'Beebop', name: 'Beebop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=Beebop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
        { uniqueId: 'AmigoTop', name: 'AmigoTop', look: 'https://www.habbo.com.br/habbo-imaging/avatarimage?user=AmigoTop&direction=2&head_direction=2&gesture=sml&action=std&size=s' },
      ]
    }
  },
  ticker: [
    { user: 'Beebop', type: 'room_entry', description: 'entrou no quarto "O Paraíso dos pixels"', timestamp: Date.now() - 1000 * 60 * 5 },
    { user: 'Beebop', type: 'motto_change', description: 'mudou seu lema para "Novas aventuras!"', timestamp: Date.now() - 1000 * 60 * 15 },
    { user: 'HabboAmigo', type: 'achievement', description: 'ganhou o emblema "Construtor Novato"', timestamp: Date.now() - 1000 * 60 * 20 },
    { user: 'PixelArtist', type: 'friend_request', description: 'fez amizade com HabboLover', timestamp: Date.now() - 1000 * 60 * 30 },
    { user: 'AmigoTop', type: 'room_decoration', description: 'adicionou uma nova mobília ao quarto "Balada dos Amigos"', timestamp: Date.now() - 1000 * 60 * 40 },
    { user: 'MestrePixel', type: 'badge_earned', description: 'conquistou o emblema "Mestre da Decoração"', timestamp: Date.now() - 1000 * 60 * 50 },
    { user: 'HabboLover', type: 'room_entry', description: 'entrou no quarto "Cantinho do Amor"', timestamp: Date.now() - 1000 * 60 * 60 },
    { user: 'Beebop', type: 'trade_completed', description: 'trocou mobis com PixelArtist', timestamp: Date.now() - 1000 * 60 * 70 },
    { user: 'HabboAmigo', type: 'online_status', description: 'ficou online', timestamp: Date.now() - 1000 * 60 * 80 },
    { user: 'PixelArtist', type: 'photo_uploaded', description: 'publicou uma nova foto no seu perfil', timestamp: Date.now() - 1000 * 60 * 90 }
  ],
  async fetchUser(uniqueId: string): Promise<UserProfile | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve((this.users as any)[uniqueId] || null);
      }, 500);
    });
  },
  async fetchTicker(limit = 10, offset = 0): Promise<Activity[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const startIndex = Math.min(offset, this.ticker.length);
        const endIndex = Math.min(startIndex + limit, this.ticker.length);
        resolve(this.ticker.slice(startIndex, endIndex));
      }, 300);
    });
  }
};

// Helper function for grouping activities by time
export const groupActivitiesByTime = (activities: Activity[]): { [key: string]: Activity[] } => {
  const grouped: { [key: string]: Activity[] } = {};
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;

  activities.sort((a, b) => b.timestamp - a.timestamp);

  activities.forEach(activity => {
    const userName = activity.user;
    if (!grouped[userName]) {
      grouped[userName] = [];
    }

    const lastActivityInGroup = grouped[userName].length > 0 ? grouped[userName][0] : null;

    if (lastActivityInGroup && (lastActivityInGroup.timestamp - activity.timestamp < THIRTY_MINUTES_MS)) {
      grouped[userName].push(activity);
    } else {
      grouped[userName].unshift(activity);
    }
  });
  return grouped;
};
