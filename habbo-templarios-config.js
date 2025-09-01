// Configuração baseada no HabboTemplarios
// Estratégias para cores, expressões, ações, itens e busca de personagens

const HABBO_TEMPLARIOS_CONFIG = {
    // Sistema de cores do HabboTemplarios (mais completo)
    colors: {
        // Cores de pele (0-11)
        skin: [
            { index: 0, color: '#F5DA88', name: 'Pele Clara', habboName: 'Pele Clara' },
            { index: 1, color: '#FFDBC1', name: 'Pele Muito Clara', habboName: 'Pele Muito Clara' },
            { index: 2, color: '#FFCB98', name: 'Pele Claro-Médio', habboName: 'Pele Claro-Médio' },
            { index: 3, color: '#F4AC54', name: 'Pele Média', habboName: 'Pele Média' },
            { index: 4, color: '#FF987F', name: 'Pele Média-Escura', habboName: 'Pele Média-Escura' },
            { index: 5, color: '#e0a9a9', name: 'Pele Escura', habboName: 'Pele Escura' },
            { index: 6, color: '#ca8154', name: 'Pele Muito Escura', habboName: 'Pele Muito Escura' },
            { index: 7, color: '#B87560', name: 'Pele Escura-Marrão', habboName: 'Pele Escura-Marrão' },
            { index: 8, color: '#9C543F', name: 'Pele Marrom', habboName: 'Pele Marrom' },
            { index: 9, color: '#904925', name: 'Pele Marrom-Escura', habboName: 'Pele Marrom-Escura' },
            { index: 10, color: '#4C311E', name: 'Pele Muito Marrom', habboName: 'Pele Muito Marrom' },
            { index: 11, color: '#543d35', name: 'Pele Preta', habboName: 'Pele Preta' }
        ],
        
        // Cores de cabelo e roupas (12-99) - baseado no HabboTemplarios
        clothing: [
            { index: 12, color: '#653a1d', name: 'Castanho Escuro', habboName: 'Castanho Escuro' },
            { index: 13, color: '#6E392C', name: 'Castanho Médio', habboName: 'Castanho Médio' },
            { index: 14, color: '#714947', name: 'Castanho Claro', habboName: 'Castanho Claro' },
            { index: 15, color: '#856860', name: 'Cinza', habboName: 'Cinza' },
            { index: 16, color: '#895048', name: 'Vermelho Escuro', habboName: 'Vermelho Escuro' },
            { index: 17, color: '#a15253', name: 'Vermelho Médio', habboName: 'Vermelho Médio' },
            { index: 18, color: '#aa7870', name: 'Rosa Escuro', habboName: 'Rosa Escuro' },
            { index: 19, color: '#be8263', name: 'Laranja', habboName: 'Laranja' },
            { index: 20, color: '#b6856d', name: 'Bege', habboName: 'Bege' },
            { index: 21, color: '#ba8a82', name: 'Rosa Claro', habboName: 'Rosa Claro' },
            { index: 22, color: '#c88f82', name: 'Rosa Médio', habboName: 'Rosa Médio' },
            { index: 23, color: '#d9a792', name: 'Pêssego', habboName: 'Pêssego' },
            { index: 24, color: '#c68383', name: 'Rosa', habboName: 'Rosa' },
            { index: 25, color: '#BC576A', name: 'Rosa Escuro', habboName: 'Rosa Escuro' },
            { index: 26, color: '#FF5757', name: 'Vermelho', habboName: 'Vermelho' },
            { index: 27, color: '#FF7575', name: 'Vermelho Claro', habboName: 'Vermelho Claro' },
            { index: 28, color: '#B65E38', name: 'Marrom', habboName: 'Marrom' },
            { index: 29, color: '#a76644', name: 'Marrom Claro', habboName: 'Marrom Claro' },
            { index: 30, color: '#7c5133', name: 'Marrom Escuro', habboName: 'Marrom Escuro' },
            { index: 31, color: '#9a7257', name: 'Marrom Dourado', habboName: 'Marrom Dourado' },
            { index: 32, color: '#945C2F', name: 'Marrom Avermelhado', habboName: 'Marrom Avermelhado' },
            { index: 33, color: '#d98c63', name: 'Dourado', habboName: 'Dourado' },
            { index: 34, color: '#AE7748', name: 'Dourado Escuro', habboName: 'Dourado Escuro' },
            { index: 35, color: '#c57040', name: 'Laranja Escuro', habboName: 'Laranja Escuro' },
            { index: 36, color: '#B88655', name: 'Dourado Claro', habboName: 'Dourado Claro' },
            { index: 37, color: '#C99263', name: 'Dourado Médio', habboName: 'Dourado Médio' },
            { index: 38, color: '#A89473', name: 'Bege Escuro', habboName: 'Bege Escuro' },
            { index: 39, color: '#C89F56', name: 'Amarelo Dourado', habboName: 'Amarelo Dourado' },
            { index: 40, color: '#DC9B4C', name: 'Amarelo', habboName: 'Amarelo' },
            { index: 41, color: '#FF8C40', name: 'Laranja Claro', habboName: 'Laranja Claro' },
            { index: 42, color: '#de9d75', name: 'Pêssego Claro', habboName: 'Pêssego Claro' },
            { index: 43, color: '#eca782', name: 'Pêssego Médio', habboName: 'Pêssego Médio' },
            { index: 44, color: '#FFB696', name: 'Pêssego Escuro', habboName: 'Pêssego Escuro' },
            { index: 45, color: '#E3AE7D', name: 'Bege Claro', habboName: 'Bege Claro' },
            { index: 46, color: '#FFC680', name: 'Amarelo Claro', habboName: 'Amarelo Claro' },
            { index: 47, color: '#DFC375', name: 'Amarelo Esverdeado', habboName: 'Amarelo Esverdeado' },
            { index: 48, color: '#F0DCA3', name: 'Amarelo Esverdeado Claro', habboName: 'Amarelo Esverdeado Claro' },
            { index: 49, color: '#EAEFD0', name: 'Verde Claro', habboName: 'Verde Claro' },
            { index: 50, color: '#E2E4B0', name: 'Verde Amarelado', habboName: 'Verde Amarelado' },
            { index: 51, color: '#D5D08C', name: 'Verde Amarelado Claro', habboName: 'Verde Amarelado Claro' },
            { index: 52, color: '#BDE05F', name: 'Verde', habboName: 'Verde' },
            { index: 53, color: '#5DC446', name: 'Verde Escuro', habboName: 'Verde Escuro' },
            { index: 54, color: '#A2CC89', name: 'Verde Azulado', habboName: 'Verde Azulado' },
            { index: 55, color: '#C2C4A7', name: 'Verde Cinza', habboName: 'Verde Cinza' },
            { index: 56, color: '#F1E5DA', name: 'Branco', habboName: 'Branco' },
            { index: 57, color: '#f6d3d4', name: 'Rosa Muito Claro', habboName: 'Rosa Muito Claro' },
            { index: 58, color: '#e5b6b0', name: 'Rosa Pêssego', habboName: 'Rosa Pêssego' },
            { index: 59, color: '#C4A7B3', name: 'Lavanda', habboName: 'Lavanda' },
            { index: 60, color: '#AC94B3', name: 'Lavanda Escuro', habboName: 'Lavanda Escuro' },
            { index: 61, color: '#D288CE', name: 'Roxo', habboName: 'Roxo' },
            { index: 62, color: '#6799CC', name: 'Azul', habboName: 'Azul' },
            { index: 63, color: '#B3BDC3', name: 'Azul Claro', habboName: 'Azul Claro' },
            { index: 64, color: '#C5C0C2', name: 'Azul Cinza', habboName: 'Azul Cinza' },
            { index: 65, color: '#8B4513', name: 'Marrom Sela', habboName: 'Marrom Sela' },
            { index: 66, color: '#FF6B6B', name: 'Coral', habboName: 'Coral' },
            { index: 67, color: '#4ECDC4', name: 'Turquesa', habboName: 'Turquesa' },
            { index: 68, color: '#45B7D1', name: 'Azul Céu', habboName: 'Azul Céu' },
            { index: 69, color: '#96CEB4', name: 'Verde Menta', habboName: 'Verde Menta' },
            { index: 70, color: '#FFEAA7', name: 'Amarelo Creme', habboName: 'Amarelo Creme' },
            { index: 71, color: '#DDA0DD', name: 'Ameixa', habboName: 'Ameixa' },
            { index: 72, color: '#98D8C8', name: 'Verde Água', habboName: 'Verde Água' },
            { index: 73, color: '#F7DC6F', name: 'Amarelo Dourado Claro', habboName: 'Amarelo Dourado Claro' },
            { index: 74, color: '#BB8FCE', name: 'Lavanda Claro', habboName: 'Lavanda Claro' },
            { index: 75, color: '#85C1E9', name: 'Azul Bebê', habboName: 'Azul Bebê' },
            { index: 76, color: '#F8C471', name: 'Laranja Dourado', habboName: 'Laranja Dourado' },
            { index: 77, color: '#82E0AA', name: 'Verde Claro', habboName: 'Verde Claro' },
            { index: 78, color: '#F1948A', name: 'Rosa Salmão', habboName: 'Rosa Salmão' },
            { index: 79, color: '#85C1E9', name: 'Azul Claro', habboName: 'Azul Claro' },
            { index: 80, color: '#F7DC6F', name: 'Amarelo', habboName: 'Amarelo' },
            { index: 81, color: '#82E0AA', name: 'Verde', habboName: 'Verde' },
            { index: 82, color: '#85C1E9', name: 'Azul', habboName: 'Azul' },
            { index: 83, color: '#F8C471', name: 'Laranja', habboName: 'Laranja' },
            { index: 84, color: '#F1948A', name: 'Rosa', habboName: 'Rosa' },
            { index: 85, color: '#BB8FCE', name: 'Lavanda', habboName: 'Lavanda' },
            { index: 86, color: '#D7BDE2', name: 'Lavanda Muito Claro', habboName: 'Lavanda Muito Claro' },
            { index: 87, color: '#A9CCE3', name: 'Azul Muito Claro', habboName: 'Azul Muito Claro' },
            { index: 88, color: '#A9DFBF', name: 'Verde Muito Claro', habboName: 'Verde Muito Claro' },
            { index: 89, color: '#FAD7A0', name: 'Laranja Muito Claro', habboName: 'Laranja Muito Claro' },
            { index: 90, color: '#F5B7B1', name: 'Rosa Muito Claro', habboName: 'Rosa Muito Claro' },
            { index: 91, color: '#D2B4DE', name: 'Lavanda Claro', habboName: 'Lavanda Claro' },
            { index: 92, color: '#AED6F1', name: 'Azul Claro', habboName: 'Azul Claro' },
            { index: 93, color: '#A2D9CE', name: 'Verde Claro', habboName: 'Verde Claro' },
            { index: 94, color: '#F9E79F', name: 'Amarelo Claro', habboName: 'Amarelo Claro' },
            { index: 95, color: '#F8C471', name: 'Laranja Claro', habboName: 'Laranja Claro' },
            { index: 96, color: '#F1948A', name: 'Rosa Claro', habboName: 'Rosa Claro' },
            { index: 97, color: '#BB8FCE', name: 'Lavanda Claro', habboName: 'Lavanda Claro' },
            { index: 98, color: '#85C1E9', name: 'Azul Claro', habboName: 'Azul Claro' },
            { index: 99, color: '#82E0AA', name: 'Verde Claro', habboName: 'Verde Claro' }
        ]
    },

    // Expressões do HabboTemplarios (exatamente como eles usam)
    expressions: [
        { 
            id: 'nrm', 
            name: 'Normal', 
            habboName: 'Normal',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_normal.png',
            value: 'gesture=nrm'
        },
        { 
            id: 'sml', 
            name: 'Feliz', 
            habboName: 'Feliz',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_happy.png',
            value: 'gesture=sml'
        },
        { 
            id: 'sad', 
            name: 'Triste', 
            habboName: 'Triste',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_sad.png',
            value: 'gesture=sad'
        },
        { 
            id: 'agr', 
            name: 'Enojado', 
            habboName: 'Enojado',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_angry.png',
            value: 'gesture=agr'
        },
        { 
            id: 'srp', 
            name: 'Surpreso', 
            habboName: 'Surpreso',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_surprised.png',
            value: 'gesture=srp'
        },
        { 
            id: 'eyb', 
            name: 'Dormindo', 
            habboName: 'Dormindo',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_sleep.png',
            value: 'gesture=eyb'
        },
        { 
            id: 'spk', 
            name: 'Falando', 
            habboName: 'Falando',
            image: 'https://images.habbotemplarios.com/web/avatargen/face_talking.png',
            value: 'gesture=spk'
        }
    ],

    // Ações do HabboTemplarios (exatamente como eles usam)
    actions: [
        { 
            id: '', 
            name: 'Nada', 
            habboName: 'Nothing',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_normal.png',
            value: ''
        },
        { 
            id: 'wlk', 
            name: 'Andando', 
            habboName: 'Caminando',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_walking.png',
            value: 'wlk'
        },
        { 
            id: 'lay', 
            name: 'Deitado', 
            habboName: 'Acostado',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_sleeping.png',
            value: 'lay'
        },
        { 
            id: 'sit', 
            name: 'Sentado', 
            habboName: 'Sentado',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_sit.png',
            value: 'sit'
        },
        { 
            id: 'wav', 
            name: 'Acenando', 
            habboName: 'Saludando',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_wave.png',
            value: 'wav'
        },
        { 
            id: 'crr', 
            name: 'Carregando', 
            habboName: 'Sosteniendo',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_holding.png',
            value: 'crr'
        },
        { 
            id: 'drk', 
            name: 'Bebendo', 
            habboName: 'Bebiendo',
            image: 'https://images.habbotemplarios.com/web/avatargen/action_drinking.png',
            value: 'drk'
        }
    ],

    // Itens na mão do HabboTemplarios (exatamente como eles usam)
    items: [
        { 
            id: '=0', 
            name: 'Nada', 
            habboName: 'Nothing',
            image: 'https://images.habbotemplarios.com/web/avatargen/none.png',
            value: '=0'
        },
        { 
            id: '=1', 
            name: 'Água', 
            habboName: 'Water',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_water.png',
            value: '=1'
        },
        { 
            id: '=2', 
            name: 'Cenoura', 
            habboName: 'Carrot',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_carrot.png',
            value: '=2'
        },
        { 
            id: '=3', 
            name: 'Sorvete', 
            habboName: 'Ice cream',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_icecream.png',
            value: '=3'
        },
        { 
            id: '=5', 
            name: 'Habbo Cola', 
            habboName: 'Habbo Cola',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_habbocola.png',
            value: '=5'
        },
        { 
            id: '=6', 
            name: 'Café', 
            habboName: 'Coffee',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_coffee.png',
            value: '=6'
        },
        { 
            id: '=9', 
            name: 'Poção do Amor', 
            habboName: 'Love potion',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_lovepotion.png',
            value: '=9'
        },
        { 
            id: '=33', 
            name: 'Calippo', 
            habboName: 'Calippo',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_calippo.png',
            value: '=33'
        },
        { 
            id: '=42', 
            name: 'Chá Japonês', 
            habboName: 'Japanese tea',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_japanesetea.png',
            value: '=42'
        },
        { 
            id: '=43', 
            name: 'Tomate', 
            habboName: 'Tomato',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_tomato.png',
            value: '=43'
        },
        { 
            id: '=44', 
            name: 'Radioativo', 
            habboName: 'Radioactive',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_radioactive.png',
            value: '=44'
        },
        { 
            id: '=667', 
            name: 'Coquetel', 
            habboName: 'Cocktail',
            image: 'https://images.habbotemplarios.com/web/avatargen/hand_cocktail.png',
            value: '=667'
        }
    ],

    // Tamanhos do HabboTemplarios (exatamente como eles usam)
    sizes: [
        { 
            id: 'headonly=1', 
            name: 'Cabeça', 
            habboName: 'Cabeza',
            value: 'headonly=1'
        },
        { 
            id: 'size=s', 
            name: 'Mini', 
            habboName: 'Mini',
            value: 'size=s'
        },
        { 
            id: 'size=m', 
            name: 'Normal', 
            habboName: 'Normal',
            value: 'size=m'
        },
        { 
            id: 'size=l', 
            name: 'Grande', 
            habboName: 'Grande',
            value: 'size=l'
        }
    ],

    // Hotéis do HabboTemplarios (exatamente como eles usam)
    hotels: [
        { 
            id: 'es', 
            name: '🇪🇸 ES', 
            habboName: 'ES',
            value: 'es'
        },
        { 
            id: 'com.br', 
            name: '🇧🇷 BR', 
            habboName: 'BR',
            value: 'com.br'
        },
        { 
            id: 'fi', 
            name: '🇫🇮 FI', 
            habboName: 'FI',
            value: 'fi'
        },
        { 
            id: 'it', 
            name: '🇮🇹 IT', 
            habboName: 'IT',
            value: 'it'
        },
        { 
            id: 'nl', 
            name: '🇳🇱 NL', 
            habboName: 'NL',
            value: 'nl'
        },
        { 
            id: 'de', 
            name: '🇩🇪 DE', 
            habboName: 'DE',
            value: 'de'
        },
        { 
            id: 'fr', 
            name: '🇫🇷 FR', 
            habboName: 'FR',
            value: 'fr'
        },
        { 
            id: 'com', 
            name: '🌍 COM', 
            habboName: 'COM',
            value: 'com'
        },
        { 
            id: 'com.tr', 
            name: '🇹🇷 TR', 
            habboName: 'TR',
            value: 'com.tr'
        }
    ],

    // URLs das APIs oficiais do Habbo (como o HabboTemplarios usa)
    apiUrls: {
        // Busca de personagem pelo nome (API oficial do Habbo)
        searchUser: (username, hotel) => `https://www.habbo.${hotel}/api/public/users?name=${encodeURIComponent(username)}`,
        
        // Geração de avatar (API oficial do Habbo)
        avatarImage: (figure, gender, size, direction, headDirection, action, gesture, item) => {
            let url = `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}`;
            
            if (size) url += `&${size}`;
            if (direction !== undefined) url += `&direction=${direction}`;
            if (headDirection !== undefined) url += `&head_direction=${headDirection}`;
            if (action) url += `&action=${action}`;
            if (gesture) url += `&gesture=${gesture}`;
            if (item) url += `&item=${item}`;
            
            return url;
        }
    },

    // Funções utilitárias do HabboTemplarios
    utils: {
        // Gerar URL de avatar com todas as opções
        generateAvatarUrl: (figure, options = {}) => {
            const {
                gender = 'M',
                size = 'size=l',
                direction = 2,
                headDirection = 2,
                action = '',
                gesture = 'nrm',
                item = '=0'
            } = options;

            return HABBO_TEMPLARIOS_CONFIG.apiUrls.avatarImage(
                figure, gender, size, direction, headDirection, action, gesture, item
            );
        },

        // Buscar usuário pelo nome (API oficial)
        searchUserByName: async (username, hotel = 'com.br') => {
            try {
                const response = await fetch(HABBO_TEMPLARIOS_CONFIG.apiUrls.searchUser(username, hotel));
                if (!response.ok) throw new Error('Erro na busca');
                
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Erro ao buscar usuário:', error);
                return null;
            }
        },

        // Carregar avatar de um usuário existente
        loadUserAvatar: async (username, hotel = 'com.br') => {
            try {
                const userData = await HABBO_TEMPLARIOS_CONFIG.utils.searchUserByName(username, hotel);
                if (userData && userData.length > 0) {
                    const user = userData[0];
                    return {
                        name: user.name,
                        figure: user.figureString,
                        hotel: hotel,
                        profileUrl: `https://www.habbo.${hotel}/profile/${user.name}`,
                        avatarUrl: HABBO_TEMPLARIOS_CONFIG.utils.generateAvatarUrl(user.figureString, { size: 'size=l' })
                    };
                }
                return null;
            } catch (error) {
                console.error('Erro ao carregar avatar do usuário:', error);
                return null;
            }
        }
    }
};

// Exportar para uso no editor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HABBO_TEMPLARIOS_CONFIG };
} else {
    window.HABBO_TEMPLARIOS_CONFIG = HABBO_TEMPLARIOS_CONFIG;
}
