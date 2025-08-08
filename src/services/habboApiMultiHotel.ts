
// Multi-hotel Habbo API service
interface HabboUser {
  uniqueId: string;
  name: string;
  motto: string;
  online: boolean;
  memberSince: string;
  figureString: string;
  selectedBadges: any[];
}

const HOTELS = ['br', 'com', 'es', 'fr', 'de', 'it', 'nl', 'fi', 'tr'];

export const getUserByName = async (username: string): Promise<HabboUser | null> => {
  if (!username || !username.trim()) {
    throw new Error('Nome de usuário é obrigatório');
  }

  const normalizedUsername = username.trim();

  for (const hotel of HOTELS) {
    try {
      console.log(`🔍 Buscando ${normalizedUsername} no hotel ${hotel}`);
      
      const response = await fetch(
        `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(normalizedUsername)}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'HabboHub/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        if (data && data.name && data.uniqueId) {
          console.log(`✅ Usuário ${normalizedUsername} encontrado no hotel ${hotel}`);
          return {
            uniqueId: data.uniqueId,
            name: data.name,
            motto: data.motto || '',
            online: data.online || false,
            memberSince: data.memberSince || new Date().toISOString(),
            figureString: data.figureString || '',
            selectedBadges: data.selectedBadges || []
          };
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erro ao buscar no hotel ${hotel}:`, error);
      continue;
    }
  }

  console.log(`❌ Usuário ${normalizedUsername} não encontrado em nenhum hotel`);
  return null;
};

export const getAvatarUrl = (username: string, figureString?: string) => {
  if (figureString) {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figureString}&direction=2&head_direction=3&size=m`;
  }
  return `https://www.habbo.com/habbo-imaging/avatarimage?user=${encodeURIComponent(username)}&direction=2&head_direction=2&size=m`;
};
