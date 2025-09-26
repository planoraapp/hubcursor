// Configuração das APIs oficiais do Habbo
// Este arquivo contém todas as URLs e endpoints oficiais do Habbo Hotel

export const HABBO_APIS = {
    // API Principal do Habbo
    BASE_URL: 'https://www.habbo.com.br',
    
    // API de Imagens de Avatar
    AVATAR_IMAGING: {
        // Avatar completo
        FULL: 'https://www.habbo.com.br/habbo-imaging/avatarimage',
        // Apenas cabeça
        HEAD: 'https://www.habbo.com.br/habbo-imaging/avatarimage?headonly=1',
        // Avatar pequeno
        SMALL: 'https://www.habbo.com.br/habbo-imaging/avatarimage?size=s',
        // Avatar médio
        MEDIUM: 'https://www.habbo.com.br/habbo-imaging/avatarimage?size=m',
        // Avatar grande
        LARGE: 'https://www.habbo.com.br/habbo-imaging/avatarimage?size=l',
        // Avatar extra grande
        XLARGE: 'https://www.habbo.com.br/habbo-imaging/avatarimage?size=xl',
        // Avatar com direção específica
        DIRECTION: (direction = 2) => `https://www.habbo.com.br/habbo-imaging/avatarimage?direction=${direction}`,
        // Avatar com cabeça em direção específica
        HEAD_DIRECTION: (headDirection = 3) => `https://www.habbo.com.br/habbo-imaging/avatarimage?head_direction=${headDirection}`,
        // Avatar customizado com parâmetros
        CUSTOM: (username, size = 's', direction = 2, headDirection = 3, headOnly = false) => {
            let url = `https://www.habbo.com.br/habbo-imaging/avatarimage?user=${username}&size=${size}&direction=${direction}&head_direction=${headDirection}`;
            if (headOnly) url += '&headonly=1';
            return url;
        }
    },
    
    // API de Informações do Usuário
    USER_INFO: {
        // Perfil básico
        PROFILE: (username) => `https://www.habbo.com.br/api/public/users?name=${username}`,
        // Status online/offline
        STATUS: (username) => `https://www.habbo.com.br/api/public/users/${username}/profile`,
        // Emblemas do usuário
        BADGES: (username) => `https://www.habbo.com.br/api/public/users/${username}/badges`,
        // Grupos do usuário
        GROUPS: (username) => `https://www.habbo.com.br/api/public/users/${username}/groups`,
        // Amigos do usuário
        FRIENDS: (username) => `https://www.habbo.com.br/api/public/users/${username}/friends`,
        // Quartos do usuário
        ROOMS: (username) => `https://www.habbo.com.br/api/public/users/${username}/rooms`
    },
    
    // API de Quartos/Homes
    ROOMS: {
        // Informações do quarto
        INFO: (roomId) => `https://www.habbo.com.br/api/public/rooms/${roomId}`,
        // Usuários no quarto
        USERS: (roomId) => `https://www.habbo.com.br/api/public/rooms/${roomId}/users`,
        // Móveis no quarto
        FURNITURE: (roomId) => `https://www.habbo.com.br/api/public/rooms/${roomId}/furniture`,
        // Buscar quartos por nome
        SEARCH: (query) => `https://www.habbo.com.br/api/public/rooms/search?q=${encodeURIComponent(query)}`,
        // Quartos populares
        POPULAR: 'https://www.habbo.com.br/api/public/rooms/popular',
        // Quartos recomendados
        RECOMMENDED: 'https://www.habbo.com.br/api/public/rooms/recommended'
    },
    
    // API de Emblemas
    BADGES: {
        // Lista de emblemas disponíveis
        ALL: 'https://www.habbo.com.br/api/public/badges',
        // Informações de um emblema específico
        INFO: (badgeCode) => `https://www.habbo.com.br/api/public/badges/${badgeCode}`,
        // Usuários com um emblema específico
        USERS: (badgeCode) => `https://www.habbo.com.br/api/public/badges/${badgeCode}/users`
    },
    
    // API de Notícias
    NEWS: {
        // Notícias recentes
        RECENT: 'https://www.habbo.com.br/api/public/news',
        // Notícias por categoria
        CATEGORY: (category) => `https://www.habbo.com.br/api/public/news/category/${category}`,
        // Notícia específica
        ARTICLE: (articleId) => `https://www.habbo.com.br/api/public/news/${articleId}`
    },
    
    // API de Catálogo
    CATALOG: {
        // Páginas do catálogo
        PAGES: 'https://www.habbo.com.br/api/public/catalog/pages',
        // Itens de uma página
        ITEMS: (pageId) => `https://www.habbo.com.br/api/public/catalog/pages/${pageId}/items`,
        // Informações de um item
        ITEM_INFO: (itemId) => `https://www.habbo.com.br/api/public/catalog/items/${itemId}`,
        // Buscar itens
        SEARCH: (query) => `https://www.habbo.com.br/api/public/catalog/search?q=${encodeURIComponent(query)}`
    },
    
    // API de Grupos
    GROUPS: {
        // Informações do grupo
        INFO: (groupId) => `https://www.habbo.com.br/api/public/groups/${groupId}`,
        // Membros do grupo
        MEMBERS: (groupId) => `https://www.habbo.com.br/api/public/groups/${groupId}/members`,
        // Buscar grupos
        SEARCH: (query) => `https://www.habbo.com.br/api/public/groups/search?q=${encodeURIComponent(query)}`
    },
    
    // API de Eventos
    EVENTS: {
        // Eventos ativos
        ACTIVE: 'https://www.habbo.com.br/api/public/events/active',
        // Eventos futuros
        UPCOMING: 'https://www.habbo.com.br/api/public/events/upcoming',
        // Eventos passados
        PAST: 'https://www.habbo.com.br/api/public/events/past',
        // Informações de um evento
        INFO: (eventId) => `https://www.habbo.com.br/api/public/events/${eventId}`
    },
    
    // API de Mercado
    MARKETPLACE: {
        // Itens à venda
        ITEMS: 'https://www.habbo.com.br/api/public/marketplace/items',
        // Histórico de preços
        PRICE_HISTORY: (itemId) => `https://www.habbo.com.br/api/public/marketplace/items/${itemId}/price-history`,
        // Buscar itens
        SEARCH: (query) => `https://www.habbo.com.br/api/public/marketplace/search?q=${encodeURIComponent(query)}`
    },
    
    // API de Estatísticas
    STATS: {
        // Estatísticas gerais do hotel
        HOTEL: 'https://www.habbo.com.br/api/public/stats/hotel',
        // Estatísticas de usuários online
        ONLINE: 'https://www.habbo.com.br/api/public/stats/online',
        // Ranking de usuários
        RANKINGS: 'https://www.habbo.com.br/api/public/stats/rankings'
    }
};

// Funções utilitárias para as APIs
export const HabboAPI = {
    // Gerar URL de avatar
    getAvatarUrl: (username, options = {}) => {
        const {
            size = 's',
            direction = 2,
            headDirection = 3,
            headOnly = false
        } = options;
        
        return HABBO_APIS.AVATAR_IMAGING.CUSTOM(username, size, direction, headDirection, headOnly);
    },
    
    // Fazer requisição para API
    async fetch: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'User-Agent': 'HabboHub/1.0',
                    'Accept': 'application/json',
                    ...options.headers
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Erro na API do Habbo:', error);
            throw error;
        }
    },
    
    // Buscar informações do usuário
    getUserInfo: async (username) => {
        return await HabboAPI.fetch(HABBO_APIS.USER_INFO.PROFILE(username));
    },
    
    // Buscar avatar do usuário
    getUserAvatar: (username, size = 's') => {
        return HABBO_APIS.AVATAR_IMAGING.CUSTOM(username, size);
    },
    
    // Buscar quartos populares
    getPopularRooms: async () => {
        return await HabboAPI.fetch(HABBO_APIS.ROOMS.POPULAR);
    },
    
    // Buscar emblemas
    getBadges: async () => {
        return await HabboAPI.fetch(HABBO_APIS.BADGES.ALL);
    },
    
    // Buscar notícias
    getNews: async () => {
        return await HabboAPI.fetch(HABBO_APIS.NEWS.RECENT);
    }
};

// Configurações de fallback para APIs alternativas
export const FALLBACK_APIS = {
    // API alternativa de imagens (caso a principal falhe)
    AVATAR_FALLBACK: 'https://habbo-imaging.s3.amazonaws.com/avatarimage',
    
    // Outras APIs alternativas podem ser adicionadas aqui
};

export default HABBO_APIS;
