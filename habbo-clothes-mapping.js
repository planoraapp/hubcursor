// Mapeamento das roupas usando a estratégia do HabboTemplarios
// Cada item usa a API do Habbo diretamente com figura mínima (só a roupa)

const HABBO_CLOTHES_MAPPING = {
    // Cabeças e rostos
    head: {
        title: "Cabeças e Rostos",
        items: [
            { id: '190', name: 'Cabeça Padrão', type: 'hd', rarity: 'common', figure: 'hd-190-7-' },
            { id: '180', name: 'Cabeça Alternativa', type: 'hd', rarity: 'common', figure: 'hd-180-7-' },
            { id: '185', name: 'Cabeça Especial', type: 'hd', rarity: 'rare', figure: 'hd-185-7-' }
        ]
    },
    
    // Cabelos
    hair: {
        title: "Cabelos",
        items: [
            { id: '100', name: 'Cabelo Padrão', type: 'hr', rarity: 'common', figure: 'hd-190-7-.hr-100-7-' },
            { id: '101', name: 'Cabelo Curto', type: 'hr', rarity: 'common', figure: 'hd-190-7-.hr-101-7-' },
            { id: '102', name: 'Cabelo Longo', type: 'hr', rarity: 'common', figure: 'hd-190-7-.hr-102-7-' },
            { id: '103', name: 'Cabelo Botticelli', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-103-7-' },
            { id: '104', name: 'Cabelo Iara', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-104-7-' },
            { id: '105', name: 'Cabelo Bonnie Longo', type: 'hr', rarity: 'nft', figure: 'hd-190-7-.hr-105-7-' },
            { id: '106', name: 'Cabelo Piscina', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-106-7-' },
            { id: '107', name: 'Cabelo Arco-íris', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-107-7-' },
            { id: '108', name: 'Cabelo Pato Afro', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-108-7-' },
            { id: '109', name: 'Cabelo Verão', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-109-7-' },
            { id: '110', name: 'Cabelo Ondulado', type: 'hr', rarity: 'rare', figure: 'hd-190-7-.hr-110-7-' }
        ]
    },
    
    // Chapéus
    hats: {
        title: "Chapéus",
        items: [
            { id: '1', name: 'Chapéu Padrão', type: 'ha', rarity: 'common', figure: 'hd-190-7-.ha-1-7-' },
            { id: '2', name: 'Chapéu de Festa', type: 'ha', rarity: 'common', figure: 'hd-190-7-.ha-2-7-' },
            { id: '3', name: 'Chapéu de Inverno', type: 'ha', rarity: 'common', figure: 'hd-190-7-.ha-3-7-' },
            { id: '4', name: 'Chapéu Uva', type: 'ha', rarity: 'rare', figure: 'hd-190-7-.ha-4-7-' },
            { id: '5', name: 'Chapéu Leão de Nemeia', type: 'ha', rarity: 'rare', figure: 'hd-190-7-.ha-5-7-' },
            { id: '6', name: 'Chapéu Disco', type: 'ha', rarity: 'rare', figure: 'hd-190-7-.ha-6-7-' },
            { id: '7', name: 'Chapéu Cama', type: 'ha', rarity: 'rare', figure: 'hd-190-7-.ha-7-7-' },
            { id: '8', name: 'Chapéu Gato 2', type: 'ha', rarity: 'rare', figure: 'hd-190-7-.ha-8-7-' },
            { id: '9', name: 'Coroa Lealdade 15', type: 'ha', rarity: 'legendary', figure: 'hd-190-7-.ha-9-7-' },
            { id: '10', name: 'Coroa Lealdade 20', type: 'ha', rarity: 'legendary', figure: 'hd-190-7-.ha-10-7-' },
            { id: '11', name: 'Coroa Lealdade 25', type: 'ha', rarity: 'legendary', figure: 'hd-190-7-.ha-11-7-' },
            { id: '12', name: 'Coroa Habbo 25', type: 'ha', rarity: 'nft', figure: 'hd-190-7-.ha-12-7-' },
            { id: '13', name: 'Capacete Melancia', type: 'ha', rarity: 'nft', figure: 'hd-190-7-.ha-13-7-' }
        ]
    },
    
    // Camisas (usando IDs reais do HabboTemplarios)
    shirts: {
        title: "Camisas",
        items: [
            // Roupas normais (nonhc)
            { id: '210', name: 'Camisa Padrão', type: 'ch', rarity: 'common', figure: 'ch-210-66-' },
            { id: '215', name: 'Camisa Social', type: 'ch', rarity: 'common', figure: 'ch-215-66-' },
            { id: '220', name: 'Camisa Casual', type: 'ch', rarity: 'common', figure: 'ch-220-66-' },
            { id: '225', name: 'Camisa Básica', type: 'ch', rarity: 'common', figure: 'ch-225-66-' },
            { id: '230', name: 'Camisa Simples', type: 'ch', rarity: 'common', figure: 'ch-230-66-' },
            { id: '235', name: 'Camisa Clássica', type: 'ch', rarity: 'common', figure: 'ch-235-66-' },
            { id: '240', name: 'Camisa Moderna', type: 'ch', rarity: 'common', figure: 'ch-240-66-' },
            { id: '245', name: 'Camisa Elegante', type: 'ch', rarity: 'common', figure: 'ch-245-66-' },
            { id: '250', name: 'Camisa Formal', type: 'ch', rarity: 'common', figure: 'ch-250-66-' },
            { id: '255', name: 'Camisa Esportiva', type: 'ch', rarity: 'common', figure: 'ch-255-66-' },
            { id: '262', name: 'Camisa Estilo', type: 'ch', rarity: 'common', figure: 'ch-262-66-' },
            { id: '265', name: 'Camisa Premium', type: 'ch', rarity: 'common', figure: 'ch-265-66-' },
            { id: '266', name: 'Camisa Exclusiva', type: 'ch', rarity: 'common', figure: 'ch-266-66-' },
            { id: '267', name: 'Camisa Limitada', type: 'ch', rarity: 'common', figure: 'ch-267-66-' },
            { id: '804', name: 'Camisa Especial 1', type: 'ch', rarity: 'common', figure: 'ch-804-66-' },
            { id: '805', name: 'Camisa Especial 2', type: 'ch', rarity: 'common', figure: 'ch-805-66-' },
            { id: '806', name: 'Camisa Especial 3', type: 'ch', rarity: 'common', figure: 'ch-806-66-' },
            { id: '807', name: 'Camisa Especial 4', type: 'ch', rarity: 'common', figure: 'ch-807-66-' },
            { id: '808', name: 'Camisa Especial 5', type: 'ch', rarity: 'common', figure: 'ch-808-66-' },
            { id: '809', name: 'Camisa Especial 6', type: 'ch', rarity: 'common', figure: 'ch-809-66-' },
            { id: '875', name: 'Camisa Premium 1', type: 'ch', rarity: 'common', figure: 'ch-875-66-' },
            { id: '876', name: 'Camisa Premium 2', type: 'ch', rarity: 'common', figure: 'ch-876-66-' },
            { id: '877', name: 'Camisa Premium 3', type: 'ch', rarity: 'common', figure: 'ch-877-66-' },
            { id: '878', name: 'Camisa Premium 4', type: 'ch', rarity: 'common', figure: 'ch-878-66-' },
            { id: '3030', name: 'Camisa Rara 1', type: 'ch', rarity: 'common', figure: 'ch-3030-66-' },
            { id: '3109', name: 'Camisa Rara 2', type: 'ch', rarity: 'common', figure: 'ch-3109-66-' },
            { id: '3110', name: 'Camisa Rara 3', type: 'ch', rarity: 'common', figure: 'ch-3110-66-' },
            { id: '3111', name: 'Camisa Rara 4', type: 'ch', rarity: 'common', figure: 'ch-3111-66-' },
            
            // Habbo Club (hc)
            { id: '803', name: 'Camisa HC 1', type: 'ch', rarity: 'rare', figure: 'ch-803-66-' },
            { id: '3001', name: 'Camisa HC 2', type: 'ch', rarity: 'rare', figure: 'ch-3001-66-' },
            { id: '3015', name: 'Camisa HC 3', type: 'ch', rarity: 'rare', figure: 'ch-3015-66-' },
            { id: '3022', name: 'Camisa HC 4', type: 'ch', rarity: 'rare', figure: 'ch-3022-66-' },
            { id: '3032', name: 'Camisa HC 5', type: 'ch', rarity: 'rare', figure: 'ch-3032-66-' },
            { id: '3038', name: 'Camisa HC 6', type: 'ch', rarity: 'rare', figure: 'ch-3038-66-' },
            { id: '3050', name: 'Camisa HC 7', type: 'ch', rarity: 'rare', figure: 'ch-3050-66-' },
            { id: '3059', name: 'Camisa HC 8', type: 'ch', rarity: 'rare', figure: 'ch-3059-66-' },
            { id: '3077', name: 'Camisa HC 9', type: 'ch', rarity: 'rare', figure: 'ch-3077-66-' },
            { id: '3167', name: 'Camisa HC 10', type: 'ch', rarity: 'rare', figure: 'ch-3167-66-' },
            { id: '3185', name: 'Camisa HC 11', type: 'ch', rarity: 'rare', figure: 'ch-3185-66-' },
            { id: '3203', name: 'Camisa HC 12', type: 'ch', rarity: 'rare', figure: 'ch-3203-66-' },
            { id: '3208', name: 'Camisa HC 13', type: 'ch', rarity: 'rare', figure: 'ch-3208-66-' },
            { id: '3215', name: 'Camisa HC 14', type: 'ch', rarity: 'rare', figure: 'ch-3215-66-' },
            { id: '3222', name: 'Camisa HC 15', type: 'ch', rarity: 'rare', figure: 'ch-3222-66-' },
            { id: '3234', name: 'Camisa HC 16', type: 'ch', rarity: 'rare', figure: 'ch-3234-66-' },
            { id: '3237', name: 'Camisa HC 17', type: 'ch', rarity: 'rare', figure: 'ch-3237-66-' },
            { id: '3279', name: 'Camisa HC 18', type: 'ch', rarity: 'rare', figure: 'ch-3279-66-' },
            
            // Vendáveis (sell)
            { id: '3321', name: 'Camisa Vendável 1', type: 'ch', rarity: 'sellable', figure: 'ch-3321-66-' },
            { id: '3323', name: 'Camisa Vendável 2', type: 'ch', rarity: 'sellable', figure: 'ch-3323-66-' },
            { id: '3332', name: 'Camisa Vendável 3', type: 'ch', rarity: 'sellable', figure: 'ch-3332-66-' },
            { id: '3334', name: 'Camisa Vendável 4', type: 'ch', rarity: 'sellable', figure: 'ch-3334-66-' },
            { id: '3336', name: 'Camisa Vendável 5', type: 'ch', rarity: 'sellable', figure: 'ch-3336-66-' },
            { id: '3342', name: 'Camisa Vendável 6', type: 'ch', rarity: 'sellable', figure: 'ch-3342-66-' },
            { id: '3368', name: 'Camisa Vendável 7', type: 'ch', rarity: 'sellable', figure: 'ch-3368-66-' },
            { id: '3372', name: 'Camisa Vendável 8', type: 'ch', rarity: 'sellable', figure: 'ch-3372-66-' },
            { id: '3400', name: 'Camisa Vendável 9', type: 'ch', rarity: 'sellable', figure: 'ch-3400-66-' },
            { id: '3416', name: 'Camisa Vendável 10', type: 'ch', rarity: 'sellable', figure: 'ch-3416-66-' },
            { id: '3429', name: 'Camisa Vendável 11', type: 'ch', rarity: 'sellable', figure: 'ch-3429-66-' },
            { id: '3432', name: 'Camisa Vendável 12', type: 'ch', rarity: 'sellable', figure: 'ch-3432-66-' },
            { id: '3438', name: 'Camisa Vendável 13', type: 'ch', rarity: 'sellable', figure: 'ch-3438-66-' },
            { id: '3443', name: 'Camisa Vendável 14', type: 'ch', rarity: 'sellable', figure: 'ch-3443-66-' },
            { id: '3446', name: 'Camisa Vendável 15', type: 'ch', rarity: 'sellable', figure: 'ch-3446-66-' },
            { id: '3459', name: 'Camisa Vendável 16', type: 'ch', rarity: 'sellable', figure: 'ch-3459-66-' },
            { id: '3486', name: 'Camisa Vendável 17', type: 'ch', rarity: 'sellable', figure: 'ch-3486-66-' },
            { id: '3489', name: 'Camisa Vendável 18', type: 'ch', rarity: 'sellable', figure: 'ch-3489-66-' },
            { id: '3491', name: 'Camisa Vendável 19', type: 'ch', rarity: 'sellable', figure: 'ch-3491-66-' },
            { id: '3498', name: 'Camisa Vendável 20', type: 'ch', rarity: 'sellable', figure: 'ch-3498-66-' },
            { id: '3506', name: 'Camisa Vendável 21', type: 'ch', rarity: 'sellable', figure: 'ch-3506-66-' },
            { id: '3510', name: 'Camisa Vendável 22', type: 'ch', rarity: 'sellable', figure: 'ch-3510-66-' },
            { id: '3518', name: 'Camisa Vendável 23', type: 'ch', rarity: 'sellable', figure: 'ch-3518-66-' },
            { id: '3527', name: 'Camisa Vendável 24', type: 'ch', rarity: 'sellable', figure: 'ch-3527-66-' },
            { id: '3529', name: 'Camisa Vendável 25', type: 'ch', rarity: 'sellable', figure: 'ch-3529-66-' },
            { id: '3538', name: 'Camisa Vendável 26', type: 'ch', rarity: 'sellable', figure: 'ch-3538-66-' },
            { id: '3539', name: 'Camisa Vendável 27', type: 'ch', rarity: 'sellable', figure: 'ch-3539-66-' },
            { id: '3540', name: 'Camisa Vendável 28', type: 'ch', rarity: 'sellable', figure: 'ch-3540-66-' },
            { id: '3563', name: 'Camisa Vendável 29', type: 'ch', rarity: 'sellable', figure: 'ch-3563-66-' },
            { id: '3581', name: 'Camisa Vendável 30', type: 'ch', rarity: 'sellable', figure: 'ch-3581-66-' },
            { id: '3599', name: 'Camisa Vendável 31', type: 'ch', rarity: 'sellable', figure: 'ch-3599-66-' },
            { id: '3617', name: 'Camisa Vendável 32', type: 'ch', rarity: 'sellable', figure: 'ch-3617-66-' },
            { id: '3618', name: 'Camisa Vendável 33', type: 'ch', rarity: 'sellable', figure: 'ch-3618-66-' },
            { id: '3630', name: 'Camisa Vendável 34', type: 'ch', rarity: 'sellable', figure: 'ch-3630-66-' },
            { id: '3637', name: 'Camisa Vendável 35', type: 'ch', rarity: 'sellable', figure: 'ch-3637-66-' },
            { id: '3659', name: 'Camisa Vendável 36', type: 'ch', rarity: 'sellable', figure: 'ch-3659-66-' },
            { id: '3668', name: 'Camisa Vendável 37', type: 'ch', rarity: 'sellable', figure: 'ch-3668-66-' },
            { id: '3672', name: 'Camisa Vendável 38', type: 'ch', rarity: 'sellable', figure: 'ch-3672-66-' },
            { id: '3679', name: 'Camisa Vendável 39', type: 'ch', rarity: 'sellable', figure: 'ch-3679-66-' },
            { id: '3683', name: 'Camisa Vendável 40', type: 'ch', rarity: 'sellable', figure: 'ch-3683-66-' },
            { id: '3685', name: 'Camisa Vendável 41', type: 'ch', rarity: 'sellable', figure: 'ch-3685-66-' },
            { id: '3688', name: 'Camisa Vendável 42', type: 'ch', rarity: 'sellable', figure: 'ch-3688-66-' },
            { id: '3728', name: 'Camisa Vendável 43', type: 'ch', rarity: 'sellable', figure: 'ch-3728-66-' },
            { id: '3735', name: 'Camisa Vendável 44', type: 'ch', rarity: 'sellable', figure: 'ch-3735-66-' },
            { id: '3747', name: 'Camisa Vendável 45', type: 'ch', rarity: 'sellable', figure: 'ch-3747-66-' },
            { id: '3769', name: 'Camisa Vendável 46', type: 'ch', rarity: 'sellable', figure: 'ch-3769-66-' },
            { id: '3779', name: 'Camisa Vendável 47', type: 'ch', rarity: 'sellable', figure: 'ch-3779-66-' },
            { id: '3788', name: 'Camisa Vendável 48', type: 'ch', rarity: 'sellable', figure: 'ch-3788-66-' },
            { id: '3792', name: 'Camisa Vendável 49', type: 'ch', rarity: 'sellable', figure: 'ch-3792-66-' },
            { id: '3796', name: 'Camisa Vendável 50', type: 'ch', rarity: 'sellable', figure: 'ch-3796-66-' },
            { id: '3806', name: 'Camisa Vendável 51', type: 'ch', rarity: 'sellable', figure: 'ch-3806-66-' },
            { id: '3808', name: 'Camisa Vendável 52', type: 'ch', rarity: 'sellable', figure: 'ch-3808-66-' },
            { id: '3818', name: 'Camisa Vendável 53', type: 'ch', rarity: 'sellable', figure: 'ch-3818-66-' },
            { id: '3835', name: 'Camisa Vendável 54', type: 'ch', rarity: 'sellable', figure: 'ch-3835-66-' },
            { id: '3836', name: 'Camisa Vendável 55', type: 'ch', rarity: 'sellable', figure: 'ch-3836-66-' },
            { id: '3840', name: 'Camisa Vendável 56', type: 'ch', rarity: 'sellable', figure: 'ch-3840-66-' },
            { id: '3848', name: 'Camisa Vendável 57', type: 'ch', rarity: 'sellable', figure: 'ch-3848-66-' },
            { id: '3853', name: 'Camisa Vendável 58', type: 'ch', rarity: 'sellable', figure: 'ch-3853-66-' },
            { id: '3868', name: 'Camisa Vendável 59', type: 'ch', rarity: 'sellable', figure: 'ch-3868-66-' },
            { id: '3880', name: 'Camisa Vendável 60', type: 'ch', rarity: 'sellable', figure: 'ch-3880-66-' },
            { id: '3913', name: 'Camisa Vendável 61', type: 'ch', rarity: 'sellable', figure: 'ch-3913-66-' },
            { id: '3923', name: 'Camisa Vendável 62', type: 'ch', rarity: 'sellable', figure: 'ch-3923-66-' },
            { id: '3931', name: 'Camisa Vendável 63', type: 'ch', rarity: 'sellable', figure: 'ch-3931-66-' },
            { id: '3934', name: 'Camisa Vendável 64', type: 'ch', rarity: 'sellable', figure: 'ch-3934-66-' },
            { id: '3940', name: 'Camisa Vendável 65', type: 'ch', rarity: 'sellable', figure: 'ch-3940-66-' },
            { id: '3942', name: 'Camisa Vendável 66', type: 'ch', rarity: 'sellable', figure: 'ch-3942-66-' },
            { id: '3948', name: 'Camisa Vendável 67', type: 'ch', rarity: 'sellable', figure: 'ch-3948-66-' },
            { id: '3949', name: 'Camisa Vendável 68', type: 'ch', rarity: 'sellable', figure: 'ch-3949-66-' },
            { id: '3969', name: 'Camisa Vendável 69', type: 'ch', rarity: 'sellable', figure: 'ch-3969-66-' },
            { id: '3971', name: 'Camisa Vendável 70', type: 'ch', rarity: 'sellable', figure: 'ch-3971-66-' },
            { id: '3979', name: 'Camisa Vendável 71', type: 'ch', rarity: 'sellable', figure: 'ch-3979-66-' },
            { id: '3981', name: 'Camisa Vendável 72', type: 'ch', rarity: 'sellable', figure: 'ch-3981-66-' },
            { id: '3987', name: 'Camisa Vendável 73', type: 'ch', rarity: 'sellable', figure: 'ch-3987-66-' },
            { id: '3996', name: 'Camisa Vendável 74', type: 'ch', rarity: 'sellable', figure: 'ch-3996-66-' },
            { id: '4000', name: 'Camisa Vendável 75', type: 'ch', rarity: 'sellable', figure: 'ch-4000-66-' },
            { id: '4003', name: 'Camisa Vendável 76', type: 'ch', rarity: 'sellable', figure: 'ch-4003-66-' },
            { id: '4025', name: 'Camisa Vendável 77', type: 'ch', rarity: 'sellable', figure: 'ch-4025-66-' },
            { id: '4062', name: 'Camisa Vendável 78', type: 'ch', rarity: 'sellable', figure: 'ch-4062-66-' },
            { id: '4068', name: 'Camisa Vendável 79', type: 'ch', rarity: 'sellable', figure: 'ch-4068-66-' },
            { id: '4072', name: 'Camisa Vendável 80', type: 'ch', rarity: 'sellable', figure: 'ch-4072-66-' },
            { id: '4073', name: 'Camisa Vendável 81', type: 'ch', rarity: 'sellable', figure: 'ch-4073-66-' },
            { id: '4074', name: 'Camisa Vendável 82', type: 'ch', rarity: 'sellable', figure: 'ch-4074-66-' },
            { id: '4088', name: 'Camisa Vendável 83', type: 'ch', rarity: 'sellable', figure: 'ch-4088-66-' },
            { id: '4100', name: 'Camisa Vendável 84', type: 'ch', rarity: 'sellable', figure: 'ch-4100-66-' },
            { id: '4101', name: 'Camisa Vendável 85', type: 'ch', rarity: 'sellable', figure: 'ch-4101-66-' },
            { id: '4111', name: 'Camisa Vendável 86', type: 'ch', rarity: 'sellable', figure: 'ch-4111-66-' },
            { id: '4121', name: 'Camisa Vendável 87', type: 'ch', rarity: 'sellable', figure: 'ch-4121-66-' },
            { id: '4127', name: 'Camisa Vendável 88', type: 'ch', rarity: 'sellable', figure: 'ch-4127-66-' },
            { id: '4140', name: 'Camisa Vendável 89', type: 'ch', rarity: 'sellable', figure: 'ch-4140-66-' },
            { id: '4142', name: 'Camisa Vendável 90', type: 'ch', rarity: 'sellable', figure: 'ch-4142-66-' },
            { id: '4156', name: 'Camisa Vendável 91', type: 'ch', rarity: 'sellable', figure: 'ch-4156-66-' },
            { id: '4157', name: 'Camisa Vendável 92', type: 'ch', rarity: 'sellable', figure: 'ch-4157-66-' },
            { id: '4165', name: 'Camisa Vendável 93', type: 'ch', rarity: 'sellable', figure: 'ch-4165-66-' },
            { id: '4169', name: 'Camisa Vendável 94', type: 'ch', rarity: 'sellable', figure: 'ch-4169-66-' },
            { id: '4171', name: 'Camisa Vendável 95', type: 'ch', rarity: 'sellable', figure: 'ch-4171-66-' },
            { id: '4190', name: 'Camisa Vendável 96', type: 'ch', rarity: 'sellable', figure: 'ch-4190-66-' },
            { id: '4200', name: 'Camisa Vendável 97', type: 'ch', rarity: 'sellable', figure: 'ch-4200-66-' },
            { id: '4218', name: 'Camisa Vendável 98', type: 'ch', rarity: 'sellable', figure: 'ch-4218-66-' },
            { id: '4219', name: 'Camisa Vendável 99', type: 'ch', rarity: 'sellable', figure: 'ch-4219-66-' },
            { id: '4220', name: 'Camisa Vendável 100', type: 'ch', rarity: 'sellable', figure: 'ch-4220-66-' },
            { id: '4221', name: 'Camisa Vendável 101', type: 'ch', rarity: 'sellable', figure: 'ch-4221-66-' },
            { id: '4222', name: 'Camisa Vendável 102', type: 'ch', rarity: 'sellable', figure: 'ch-4222-66-' },
            { id: '4228', name: 'Camisa Vendável 103', type: 'ch', rarity: 'sellable', figure: 'ch-4228-66-' },
            { id: '4229', name: 'Camisa Vendável 104', type: 'ch', rarity: 'sellable', figure: 'ch-4229-66-' },
            { id: '4230', name: 'Camisa Vendável 105', type: 'ch', rarity: 'sellable', figure: 'ch-4230-66-' },
            { id: '4231', name: 'Camisa Vendável 106', type: 'ch', rarity: 'sellable', figure: 'ch-4231-66-' },
            { id: '4232', name: 'Camisa Vendável 107', type: 'ch', rarity: 'sellable', figure: 'ch-4232-66-' },
            { id: '4238', name: 'Camisa Vendável 108', type: 'ch', rarity: 'sellable', figure: 'ch-4238-66-' },
            { id: '4239', name: 'Camisa Vendável 109', type: 'ch', rarity: 'sellable', figure: 'ch-4239-66-' },
            { id: '4240', name: 'Camisa Vendável 110', type: 'ch', rarity: 'sellable', figure: 'ch-4240-66-' },
            { id: '4241', name: 'Camisa Vendável 111', type: 'ch', rarity: 'sellable', figure: 'ch-4241-66-' },
            { id: '4242', name: 'Camisa Vendável 112', type: 'ch', rarity: 'sellable', figure: 'ch-4242-66-' },
            { id: '4248', name: 'Camisa Vendável 113', type: 'ch', rarity: 'sellable', figure: 'ch-4248-66-' },
            { id: '4249', name: 'Camisa Vendável 114', type: 'ch', rarity: 'sellable', figure: 'ch-4249-66-' },
            { id: '4250', name: 'Camisa Vendável 115', type: 'ch', rarity: 'sellable', figure: 'ch-4250-66-' },
            { id: '4251', name: 'Camisa Vendável 116', type: 'ch', rarity: 'sellable', figure: 'ch-4251-66-' },
            { id: '4252', name: 'Camisa Vendável 117', type: 'ch', rarity: 'sellable', figure: 'ch-4252-66-' },
            { id: '4276', name: 'Camisa Vendável 118', type: 'ch', rarity: 'sellable', figure: 'ch-4276-66-' },
            { id: '4286', name: 'Camisa Vendável 119', type: 'ch', rarity: 'sellable', figure: 'ch-4286-66-' },
            { id: '4289', name: 'Camisa Vendável 120', type: 'ch', rarity: 'sellable', figure: 'ch-4289-66-' },
            { id: '4299', name: 'Camisa Vendável 121', type: 'ch', rarity: 'sellable', figure: 'ch-4299-66-' },
            { id: '4337', name: 'Camisa Vendável 122', type: 'ch', rarity: 'sellable', figure: 'ch-4337-66-' },
            { id: '4339', name: 'Camisa Vendável 123', type: 'ch', rarity: 'sellable', figure: 'ch-4339-66-' },
            { id: '4350', name: 'Camisa Vendável 124', type: 'ch', rarity: 'sellable', figure: 'ch-4350-66-' },
            { id: '4353', name: 'Camisa Vendável 125', type: 'ch', rarity: 'sellable', figure: 'ch-4353-66-' },
            { id: '4361', name: 'Camisa Vendável 126', type: 'ch', rarity: 'sellable', figure: 'ch-4361-66-' },
            { id: '4365', name: 'Camisa Vendável 127', type: 'ch', rarity: 'sellable', figure: 'ch-4365-66-' },
            { id: '4367', name: 'Camisa Vendável 128', type: 'ch', rarity: 'sellable', figure: 'ch-4367-66-' },
            { id: '4384', name: 'Camisa Vendável 129', type: 'ch', rarity: 'sellable', figure: 'ch-4384-66-' },
            { id: '4393', name: 'Camisa Vendável 130', type: 'ch', rarity: 'sellable', figure: 'ch-4393-66-' },
            { id: '4950', name: 'Camisa Vendável 131', type: 'ch', rarity: 'sellable', figure: 'ch-4950-66-' },
            { id: '4961', name: 'Camisa Vendável 132', type: 'ch', rarity: 'sellable', figure: 'ch-4961-66-' },
            { id: '4975', name: 'Camisa Vendável 133', type: 'ch', rarity: 'sellable', figure: 'ch-4975-66-' },
            { id: '4976', name: 'Camisa Vendável 134', type: 'ch', rarity: 'sellable', figure: 'ch-4976-66-' },
            { id: '4981', name: 'Camisa Vendável 135', type: 'ch', rarity: 'sellable', figure: 'ch-4981-66-' },
            { id: '4984', name: 'Camisa Vendável 136', type: 'ch', rarity: 'sellable', figure: 'ch-4984-66-' },
            { id: '4994', name: 'Camisa Vendável 137', type: 'ch', rarity: 'sellable', figure: 'ch-4994-66-' },
            { id: '5006', name: 'Camisa Vendável 138', type: 'ch', rarity: 'sellable', figure: 'ch-5006-66-' }
        ]
    },
    
    // Calças
    pants: {
        title: "Calças",
        items: [
            { id: '270', name: 'Calça Padrão', type: 'lg', rarity: 'common', figure: 'lg-270-82-' },
            { id: '271', name: 'Calça Jeans', type: 'lg', rarity: 'common', figure: 'lg-271-82-' },
            { id: '272', name: 'Calça Social', type: 'lg', rarity: 'common', figure: 'lg-272-82-' }
        ]
    },
    
    // Sapatos
    shoes: {
        title: "Sapatos",
        items: [
            { id: '290', name: 'Sapato Padrão', type: 'sh', rarity: 'common', figure: 'sh-290-80-' },
            { id: '291', name: 'Tênis', type: 'sh', rarity: 'common', figure: 'sh-291-80-' },
            { id: '292', name: 'Sapato Social', type: 'sh', rarity: 'common', figure: 'sh-292-80-' }
        ]
    }
};

// Função para gerar URL da API do Habbo (estratégia HabboTemplarios)
function generateHabboUrl(figure, gender = 'M', size = 'm') {
    return `https://www.habbo.com/habbo-imaging/avatarimage?figure=${figure}&gender=${gender}&size=${size}`;
}

// Função para gerar dados de roupas organizados por raridade
function generateClothingDataFromSwfs() {
    const clothingData = {};
    
    Object.entries(HABBO_CLOTHES_MAPPING).forEach(([category, categoryData]) => {
        clothingData[category] = {
            nonhc: [],    // Roupas normais (não-HC)
            hc: [],       // Roupas de Habbo Club (HC)
            sell: [],     // Roupas vendáveis
            nft: []       // Roupas NFT
        };
        
        categoryData.items.forEach(item => {
            const clothingItem = {
                id: item.id,
                name: item.name,
                type: item.type,
                rarity: item.rarity,
                figure: item.figure,
                imageUrl: generateHabboUrl(item.figure, 'M', 'm')
            };
            
            // Categorizar por raridade
            switch (item.rarity) {
                case 'common':
                    clothingData[category].nonhc.push(clothingItem);
                    break;
                case 'rare':
                    clothingData[category].hc.push(clothingItem);
                    break;
                case 'legendary':
                    clothingData[category].hc.push(clothingItem);
                    break;
                case 'nft':
                    clothingData[category].nft.push(clothingItem);
                    break;
                case 'sellable':
                    clothingData[category].sell.push(clothingItem);
                    break;
                default:
                    clothingData[category].nonhc.push(clothingItem);
            }
        });
    });
    
    return clothingData;
}

// Exportar para uso no editor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HABBO_CLOTHES_MAPPING, generateClothingDataFromSwfs, generateHabboUrl };
} else {
    window.HABBO_CLOTHES_MAPPING = HABBO_CLOTHES_MAPPING;
    window.generateClothingDataFromSwfs = generateClothingDataFromSwfs;
    window.generateHabboUrl = generateHabboUrl;
}
